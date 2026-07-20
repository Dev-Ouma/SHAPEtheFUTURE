import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IctTicket,
  IctTicketStatus,
  IctRequesterType,
  IctFeedbackType,
  IctSentiment,
  IctServiceGroup,
  IctSubmissionSource,
} from './entities/ict-ticket.entity';
import { IctCategory, IctPriority } from './entities/ict-category.entity';
import { IctTicketResponse } from './entities/ict-ticket-response.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { filterAssignableUsers } from '../auth/assignable-personnel';
import { MailService } from '../mail/mail.service';
import { AuthService } from '../auth/auth.service';
import { IctAiService } from './ict-ai.service';
import { IctKbService } from './ict-kb.service';
import { runIctCategorySeed } from '../database/seeds/ict-category-seed';
import {
  isHelpDeskCategory,
  parseServiceGroupQuery,
  parseSubmissionSource,
  resolveHelpdeskIntakeLane,
  resolveServiceGroup,
  serviceGroupLabel,
} from './ict-service-group';
import {
  CreateTicketDto,
  SubmitPublicTicketDto,
  UpdateTicketStatusDto,
  AddTicketResponseDto,
  UpsertCategoryDto,
} from './dto/ict.dto';

const SUBMITTER_TO_REQUESTER: Record<string, IctRequesterType> = {
  External: IctRequesterType.OTHER,
  Student: IctRequesterType.STUDENT,
  Staff: IctRequesterType.STAFF,
  Faculty: IctRequesterType.FACULTY,
  Other: IctRequesterType.OTHER,
};

const CLOSED_STATES = [
  IctTicketStatus.RESOLVED,
  IctTicketStatus.CLOSED,
  IctTicketStatus.CANCELLED,
];
const ICT_MAIL_CHANNEL = 'support';

@Injectable()
export class IctService implements OnModuleInit {
  constructor(
    @InjectRepository(IctTicket)
    private ticketsRepo: Repository<IctTicket>,
    @InjectRepository(IctCategory)
    private categoryRepo: Repository<IctCategory>,
    @InjectRepository(IctTicketResponse)
    private responseRepo: Repository<IctTicketResponse>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
    private authService: AuthService,
    private aiService: IctAiService,
    private kbService: IctKbService,
  ) {}

  async onModuleInit() {
    // Idempotent per-slug upsert of the categories the merged public form needs.
    await runIctCategorySeed(this.categoryRepo);
  }

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.ticketsRepo.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `ICT-${year}-${sequence}`;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ─── Requester-facing ────────────────────────────────────────────────────

  async createTicket(
    dto: CreateTicketDto,
    requesterId?: string,
    options?: { skipTriage?: boolean },
  ): Promise<IctTicket> {
    let category: IctCategory | null = null;
    if (dto.category_id) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
        relations: ['default_assignee'],
      });
    }

    let requester: User | null = null;
    if (requesterId) {
      requester = await this.userRepo.findOne({ where: { id: requesterId } });
    }

    /// Best-effort AI triage (no-op when no OpenAI key is configured).
    /// Skip when the caller already classified the ticket (admin log-on-behalf).
    let triage: {
      category_name?: string;
      priority?: IctPriority;
      tags?: string[];
      is_escalated?: boolean;
    } | null = null;
    if (!options?.skipTriage) {
      const activeCategories = await this.categoryRepo.find({
        where: { is_active: true },
      });
      triage = await this.aiService.triageTicket(
        dto.subject,
        dto.description,
        activeCategories.map((c) => c.name),
      );

      // If the requester didn't pick a category, try to honour the AI's suggestion.
      if (!category && triage?.category_name) {
        const suggestedName = triage.category_name;
        category =
          activeCategories.find(
            (c) => c.name.toLowerCase() === suggestedName.toLowerCase(),
          ) || null;
        if (category) {
          category = await this.categoryRepo.findOne({
            where: { id: category.id },
            relations: ['default_assignee'],
          });
        }
      }
    }

    const priority =
      (dto.priority as IctPriority) ||
      category?.default_priority ||
      triage?.priority ||
      IctPriority.MEDIUM;
    const slaHours = category?.sla_hours ?? 48;

    const feedbackType =
      (dto.feedback_type as IctFeedbackType) || IctFeedbackType.SERVICE_REQUEST;
    const sentiment =
      feedbackType === IctFeedbackType.COMPLIMENT
        ? IctSentiment.POSITIVE
        : feedbackType === IctFeedbackType.COMPLAINT
          ? IctSentiment.NEGATIVE
          : undefined;

    const ticket = this.ticketsRepo.create({
      reference_number: await this.generateReferenceNumber(),
      subject: dto.subject,
      description: dto.description,
      category: category || undefined,
      subcategory: dto.subcategory || undefined,
      location: dto.location || undefined,
      asset_tag: dto.asset_tag || undefined,
      attachment_urls: dto.attachment_urls || [],
      priority,
      feedback_type: feedbackType,
      sentiment,
      tags: triage?.tags || [],
      is_escalated: triage?.is_escalated || false,
      escalation_reason: triage?.is_escalated
        ? 'AI-flagged at intake'
        : undefined,
      requester: requester || undefined,
      requester_name: dto.requester_name || requester?.full_name || undefined,
      requester_email: dto.requester_email || requester?.email || undefined,
      requester_phone: dto.requester_phone?.trim() || undefined,
      identification_number: dto.identification_number?.trim() || undefined,
      incident_date: dto.incident_date
        ? new Date(dto.incident_date)
        : undefined,
      requester_type:
        (dto.requester_type as IctRequesterType) ||
        this.inferRequesterType(requester),
      assigned_to: category?.default_assignee || undefined,
      status: category?.default_assignee
        ? IctTicketStatus.ACKNOWLEDGED
        : IctTicketStatus.OPEN,
      sla_due_date: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      service_group:
        parseServiceGroupQuery(dto.service_group) ||
        resolveServiceGroup(category),
      submission_source: dto.submission_source
        ? parseSubmissionSource(dto.submission_source)
        : requesterId
          ? IctSubmissionSource.WEBSITE
          : IctSubmissionSource.ADMIN,
      client_platform: dto.client_platform || undefined,
    });

    const saved = await this.ticketsRepo.save(ticket);

    if (saved.requester_email) {
      const html = this.mailService.getBrandedTemplate(
        `ICT Ticket Logged: ${saved.reference_number}`,
        `<p>Hello ${saved.requester_name || 'there'},</p>
         <p>Your ICT support request has been received and logged in the OUK Service Desk.</p>
         <p><strong>Reference:</strong> ${saved.reference_number}<br/>
         <strong>Subject:</strong> ${saved.subject}<br/>
         <strong>Priority:</strong> ${saved.priority}</p>
         <p>Our team will review and respond within the agreed service window. Keep this reference for tracking.</p>`,
        undefined,
        'ICT Service Desk',
      );
      this.mailService.queueEmail(
        ICT_MAIL_CHANNEL,
        saved.requester_email,
        `ICT Ticket ${saved.reference_number} Received`,
        html,
      );
    }

    return saved;
  }

  private inferRequesterType(user?: User | null): IctRequesterType {
    if (!user) return IctRequesterType.OTHER;
    // user_type is the field actually maintained for this (set on every
    // account via Identity Management) — role_legacy is an unrelated RBAC
    // string ('admin'/'viewer'/etc.) that happens to rarely contain
    // "student"/"faculty", which silently miscounted almost every ticket
    // raised via "Raise a Ticket" as Staff regardless of the real requester.
    const userType = (user.user_type || '').toLowerCase();
    if (userType === 'student') return IctRequesterType.STUDENT;
    if (userType === 'staff' || userType === 'executive')
      return IctRequesterType.STAFF;
    const legacy = (user.role_legacy || '').toLowerCase();
    if (legacy.includes('student')) return IctRequesterType.STUDENT;
    if (legacy.includes('faculty')) return IctRequesterType.FACULTY;
    return IctRequesterType.STAFF;
  }

  // ─── Public intake (merged Complaints & Compliments form) ────────────────

  /**
   * Public submission: a complaint, compliment, or service request from anyone
   * (including anonymous external stakeholders), stored as an IctTicket so it
   * surfaces in the single ICT Service Desk queue.
   */
  async submitPublicTicket(dto: SubmitPublicTicketDto): Promise<IctTicket> {
    const isAnonymous = dto.is_anonymous === true;
    if (!isAnonymous && (!dto.email || dto.email.trim() === '')) {
      throw new BadRequestException(
        'Email is required unless submitting anonymously.',
      );
    }

    let category: IctCategory | null = null;
    if (dto.category_slug) {
      category = await this.categoryRepo.findOne({
        where: { slug: dto.category_slug },
        relations: ['default_assignee', 'department'],
      });
    }

    const feedbackType =
      (dto.feedback_type as IctFeedbackType) || IctFeedbackType.SERVICE_REQUEST;
    const isCompliment = feedbackType === IctFeedbackType.COMPLIMENT;

    // Public helpdesk intake: only triage against Helpdesk categories (never ICT).
    const activeCategories = await this.categoryRepo.find({
      where: { is_active: true },
    });
    const helpdeskCategories = activeCategories.filter((c) =>
      isHelpDeskCategory(c),
    );
    const triage = isCompliment
      ? null
      : await this.aiService.triageTicket(
          dto.subject,
          dto.description,
          helpdeskCategories.map((c) => c.name),
        );

    if (!category && triage?.category_name) {
      const match = helpdeskCategories.find(
        (c) => c.name.toLowerCase() === triage.category_name.toLowerCase(),
      );
      if (match) {
        category = await this.categoryRepo.findOne({
          where: { id: match.id },
          relations: ['default_assignee', 'department'],
        });
      }
    }

    // Reject ICT-only categories on this public Helpdesk channel.
    if (category && !isHelpDeskCategory(category)) {
      category = await this.categoryRepo.findOne({
        where: { slug: 'general-inquiry' },
        relations: ['default_assignee', 'department'],
      });
    }

    if (!category) {
      category = await this.categoryRepo.findOne({
        where: { slug: 'general-inquiry' },
        relations: ['default_assignee', 'department'],
      });
    }

    const priority =
      category?.default_priority || triage?.priority || IctPriority.MEDIUM;
    const slaHours = category?.sla_hours ?? 48;
    const sentiment = isCompliment
      ? IctSentiment.POSITIVE
      : feedbackType === IctFeedbackType.COMPLAINT
        ? IctSentiment.NEGATIVE
        : IctSentiment.NEUTRAL;

    const ticket = this.ticketsRepo.create({
      reference_number: await this.generateReferenceNumber(),
      subject: dto.subject,
      description: dto.description,
      feedback_type: feedbackType,
      sentiment,
      category: category || undefined,
      department: category?.department || undefined,
      subcategory: dto.sub_category || undefined,
      location: dto.location || undefined,
      incident_date: dto.incident_date
        ? new Date(dto.incident_date)
        : undefined,
      attachment_urls: dto.attachment_urls || [],
      priority,
      tags: triage?.tags || [],
      keywords: triage?.tags || [],
      ai_confidence_score: triage?.confidence_score ?? undefined,
      is_escalated: triage?.is_escalated || false,
      escalation_reason: triage?.is_escalated
        ? 'AI-flagged at intake'
        : undefined,
      requester_name: isAnonymous ? undefined : dto.full_name || undefined,
      requester_email: isAnonymous ? undefined : dto.email || undefined,
      requester_phone: isAnonymous ? undefined : dto.phone_number || undefined,
      identification_number: isAnonymous
        ? undefined
        : dto.identification_number || undefined,
      requester_type:
        SUBMITTER_TO_REQUESTER[dto.submitter_type || 'External'] ||
        IctRequesterType.OTHER,
      is_anonymous: isAnonymous,
      consent_given: dto.consent_given === true,
      assigned_to: category?.default_assignee || undefined,
      status: category?.default_assignee
        ? IctTicketStatus.ACKNOWLEDGED
        : IctTicketStatus.OPEN,
      sla_due_date: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      service_group: resolveHelpdeskIntakeLane(category, dto.service_group),
      submission_source: parseSubmissionSource(
        dto.submission_source || 'website',
      ),
      client_platform: dto.client_platform || undefined,
    });

    const saved = await this.ticketsRepo.save(ticket);

    if (saved.requester_email) {
      const label = isCompliment
        ? 'Compliment'
        : feedbackType === IctFeedbackType.COMPLAINT
          ? 'Complaint'
          : 'Request';
      const html = this.mailService.getBrandedTemplate(
        `${label} Logged: ${saved.reference_number}`,
        `<p>Hello ${saved.requester_name || 'there'},</p>
         <p>Your submission has been logged by the University Service Desk (General Helpdesk) and is being reviewed.</p>
         <p><strong>Reference:</strong> ${saved.reference_number}<br/>
         <strong>Subject:</strong> ${saved.subject}</p>
         <p>Keep this reference to track your submission.</p>`,
        undefined,
        'ICT Service Desk',
      );
      this.mailService.sendEmail(
        ICT_MAIL_CHANNEL,
        saved.requester_email,
        `${label} ${saved.reference_number} Received`,
        html,
      );
    }

    return saved;
  }

  /**
   * Mirror a campus_feedback row into ict_tickets so mobile/legacy CFB intake
   * appears in the ICT Service Desk (same id + OUK-CFB reference).
   */
  async mirrorCampusFeedback(input: {
    id: string;
    reference_number: string;
    feedback_type: string;
    submitter_type?: string | null;
    full_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    identification_number?: string | null;
    is_anonymous?: boolean;
    consent_given?: boolean;
    subject: string;
    description: string;
    location?: string | null;
    incident_date?: Date | string | null;
    sub_category?: string | null;
    attachment_urls?: string[] | null;
    sentiment?: string | null;
    priority?: string | null;
    tags?: string[] | null;
    keywords?: string[] | null;
    ai_confidence_score?: number | null;
    is_escalated?: boolean;
    escalation_reason?: string | null;
    status?: string | null;
    sla_due_date?: Date | string | null;
    category_slug?: string | null;
    department_id?: string | null;
    assigned_to_id?: string | null;
    requester_id?: string | null;
    resolution?: string | null;
    resolved_at?: Date | string | null;
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
    submission_source?: string | null;
    client_platform?: string | null;
  }): Promise<IctTicket | null> {
    const existingByRef = await this.ticketsRepo.findOne({
      where: { reference_number: input.reference_number },
    });
    if (existingByRef) return existingByRef;
    const existingById = await this.ticketsRepo.findOne({
      where: { id: input.id },
    });
    if (existingById) return existingById;

    let category: IctCategory | null = null;
    if (input.category_slug) {
      category = await this.categoryRepo.findOne({
        where: { slug: input.category_slug },
        relations: ['default_assignee', 'department'],
      });
    }

    const feedbackType =
      input.feedback_type === 'compliment'
        ? IctFeedbackType.COMPLIMENT
        : input.feedback_type === 'complaint'
          ? IctFeedbackType.COMPLAINT
          : IctFeedbackType.SERVICE_REQUEST;

    const statusMap: Record<string, IctTicketStatus> = {
      Submitted: IctTicketStatus.OPEN,
      Acknowledged: IctTicketStatus.ACKNOWLEDGED,
      'Under Review': IctTicketStatus.IN_PROGRESS,
      'In Progress': IctTicketStatus.IN_PROGRESS,
      Resolved: IctTicketStatus.RESOLVED,
      Closed: IctTicketStatus.CLOSED,
      Rejected: IctTicketStatus.CANCELLED,
      Escalated: IctTicketStatus.IN_PROGRESS,
    };

    const ticket = this.ticketsRepo.create({
      id: input.id,
      reference_number: input.reference_number,
      subject: input.subject,
      description: input.description,
      feedback_type: feedbackType,
      sentiment: input.sentiment ? (input.sentiment as IctSentiment) : null,
      category: category || null,
      department: category?.department || null,
      subcategory: input.sub_category || null,
      location: input.location || null,
      incident_date: input.incident_date ? new Date(input.incident_date) : null,
      attachment_urls: input.attachment_urls || [],
      priority:
        (input.priority as IctPriority) ||
        category?.default_priority ||
        IctPriority.MEDIUM,
      tags: input.tags || [],
      keywords: input.keywords || [],
      ai_confidence_score: input.ai_confidence_score ?? null,
      is_escalated: Boolean(input.is_escalated || input.status === 'Escalated'),
      escalation_reason: input.escalation_reason || null,
      requester: input.requester_id
        ? ({ id: input.requester_id } as User)
        : null,
      requester_name: input.is_anonymous ? null : input.full_name || null,
      requester_email: input.is_anonymous ? null : input.email || null,
      requester_phone: input.is_anonymous ? null : input.phone_number || null,
      identification_number: input.is_anonymous
        ? null
        : input.identification_number || null,
      requester_type:
        SUBMITTER_TO_REQUESTER[input.submitter_type || 'External'] ||
        IctRequesterType.OTHER,
      is_anonymous: input.is_anonymous === true,
      consent_given: input.consent_given === true,
      assigned_to: input.assigned_to_id
        ? ({ id: input.assigned_to_id } as User)
        : category?.default_assignee || null,
      status: statusMap[input.status || ''] || IctTicketStatus.OPEN,
      resolution: input.resolution || null,
      resolved_at: input.resolved_at ? new Date(input.resolved_at) : null,
      sla_due_date: input.sla_due_date
        ? new Date(input.sla_due_date)
        : new Date(Date.now() + (category?.sla_hours ?? 48) * 60 * 60 * 1000),
      service_group: resolveHelpdeskIntakeLane(category),
      submission_source: parseSubmissionSource(
        input.submission_source || 'unknown',
      ),
      client_platform: input.client_platform || undefined,
      created_at: input.created_at ? new Date(input.created_at) : undefined,
      updated_at: input.updated_at ? new Date(input.updated_at) : undefined,
    } as Partial<IctTicket>);

    const saved = await this.ticketsRepo.save(ticket);
    return saved;
  }

  async findMine(requesterId: string): Promise<IctTicket[]> {
    return this.ticketsRepo.find({
      where: { requester: { id: requesterId } },
      relations: ['category', 'assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async trackTicket(reference_number: string): Promise<IctTicket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { reference_number },
      relations: [
        'category',
        'assigned_to',
        'responses',
        'responses.responded_by',
      ],
      order: { responses: { created_at: 'ASC' } },
    });
    if (!ticket) throw new NotFoundException('Ticket reference not found');
    if (ticket.responses) {
      ticket.responses = ticket.responses.filter((r) => !r.is_internal);
    }
    return ticket;
  }

  // ─── Admin-facing ────────────────────────────────────────────────────────

  /** Which service lanes this user may access for queue operations. */
  async resolveLaneAccess(userId?: string): Promise<{
    helpdesk: boolean;
    it: boolean;
    all: boolean;
  }> {
    if (!userId) return { helpdesk: false, it: false, all: false };
    const slugs = await this.authService.getEffectivePermissionSlugs(userId);
    const all =
      slugs.includes('ict.manage') &&
      (slugs.includes('helpdesk.manage') ||
        slugs.includes('campus_feedback.manage'));
    if (all) return { helpdesk: true, it: true, all: true };
    const helpdesk =
      slugs.includes('helpdesk.view') ||
      slugs.includes('helpdesk.manage') ||
      slugs.includes('campus_feedback.view') ||
      slugs.includes('campus_feedback.manage');
    const it = slugs.includes('ict.view') || slugs.includes('ict.manage');
    return { helpdesk, it, all: helpdesk && it };
  }

  private async assertLaneAccess(
    userId: string | undefined,
    group: IctServiceGroup,
  ): Promise<void> {
    if (!userId) return;
    const lanes = await this.resolveLaneAccess(userId);
    if (lanes.all) return;
    if (group === IctServiceGroup.HELPDESK && lanes.helpdesk) return;
    if (group === IctServiceGroup.IT_TECHNICAL_SUPPORT && lanes.it) return;
    throw new ForbiddenException(
      `You do not have access to the ${serviceGroupLabel(group)} queue.`,
    );
  }

  private async resolveRequestedLane(
    userId: string | undefined,
    serviceGroupParam?: string,
  ): Promise<IctServiceGroup | undefined> {
    const requested = parseServiceGroupQuery(serviceGroupParam);
    if (requested) {
      await this.assertLaneAccess(userId, requested);
      return requested;
    }
    const lanes = await this.resolveLaneAccess(userId);
    if (lanes.all || (lanes.helpdesk && lanes.it)) return undefined;
    if (lanes.helpdesk) return IctServiceGroup.HELPDESK;
    if (lanes.it) return IctServiceGroup.IT_TECHNICAL_SUPPORT;
    return undefined;
  }

  /** Personal/assigned views: only filter by lane when the client asks for one. */
  private async resolveOptionalLane(
    userId: string | undefined,
    serviceGroupParam?: string,
  ): Promise<IctServiceGroup | undefined> {
    if (!serviceGroupParam) return undefined;
    return this.resolveRequestedLane(userId, serviceGroupParam);
  }

  async findAllAdmin(
    serviceGroupParam?: string,
    actingUserId?: string,
  ): Promise<IctTicket[]> {
    const lanes = await this.resolveLaneAccess(actingUserId);
    if (!lanes.helpdesk && !lanes.it) {
      throw new ForbiddenException(
        'You do not have access to any service desk queue.',
      );
    }
    const lane = await this.resolveRequestedLane(
      actingUserId,
      serviceGroupParam,
    );
    return this.ticketsRepo.find({
      where: lane ? { service_group: lane } : {},
      relations: ['category', 'assigned_to', 'requester'],
      order: { created_at: 'DESC' },
    });
  }

  async findAssignedToMe(
    userId: string,
    serviceGroupParam?: string,
  ): Promise<IctTicket[]> {
    if (!userId) return [];
    const lane = await this.resolveOptionalLane(userId, serviceGroupParam);
    return this.ticketsRepo.find({
      where: {
        assigned_to: { id: userId },
        ...(lane ? { service_group: lane } : {}),
      },
      relations: ['category', 'assigned_to', 'requester'],
      order: { created_at: 'DESC' },
    });
  }

  // A "privileged" user holds ict.view/ict.manage (admins + ICT roles): they can see
  // the whole queue and act on any ticket. Everyone else is scoped to their own.
  private async isPrivileged(userId?: string): Promise<boolean> {
    if (!userId) return false;
    const slugs = await this.authService.getEffectivePermissionSlugs(userId);
    return slugs.includes('ict.view') || slugs.includes('ict.manage');
  }

  private async assertCanAct(
    ticket: IctTicket,
    actingUserId?: string,
  ): Promise<void> {
    if (!actingUserId) return;
    if (ticket.assigned_to?.id && ticket.assigned_to.id === actingUserId) {
      return;
    }
    if (await this.isPrivileged(actingUserId)) {
      await this.assertLaneAccess(actingUserId, ticket.service_group);
      return;
    }
    const lanes = await this.resolveLaneAccess(actingUserId);
    if (lanes.helpdesk || lanes.it) {
      await this.assertLaneAccess(actingUserId, ticket.service_group);
      return;
    }
    throw new ForbiddenException(
      'You can only view or act on tickets assigned to you.',
    );
  }

  async findOneAdmin(id: string, actingUserId?: string): Promise<IctTicket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id },
      relations: [
        'category',
        'assigned_to',
        'requester',
        'responses',
        'responses.responded_by',
        'responses.responded_by.role',
      ],
      order: { responses: { created_at: 'ASC' } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.assertCanAct(ticket, actingUserId);
    return ticket;
  }

  async updateStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    actingUserId?: string,
  ): Promise<IctTicket> {
    const ticket = await this.findOneAdmin(id, actingUserId);
    ticket.status = dto.status as IctTicketStatus;

    if (
      ticket.status === IctTicketStatus.RESOLVED ||
      ticket.status === IctTicketStatus.CLOSED
    ) {
      ticket.resolved_at = new Date();
    }
    if (dto.resolution) {
      ticket.resolution = dto.resolution;
    }

    const saved = await this.ticketsRepo.save(ticket);

    if (
      saved.requester_email &&
      (dto.status === IctTicketStatus.RESOLVED ||
        dto.status === IctTicketStatus.CLOSED)
    ) {
      const html = this.mailService.getBrandedTemplate(
        `Ticket ${dto.status}: ${saved.reference_number}`,
        `<p>Hello ${saved.requester_name || 'there'},</p>
         <p>Your ICT ticket (Ref: <strong>${saved.reference_number}</strong>) has been marked as <strong>${dto.status}</strong>.</p>
         <p><strong>Resolution:</strong><br/>${dto.resolution || 'Your request has been concluded.'}</p>`,
        undefined,
        'ICT Service Desk',
      );
      this.mailService.sendEmail(
        ICT_MAIL_CHANNEL,
        saved.requester_email,
        `ICT Ticket ${dto.status} - ${saved.reference_number}`,
        html,
      );
    }

    return saved;
  }

  async assign(
    id: string,
    assigneeId: string,
    actingUserId?: string,
  ): Promise<IctTicket> {
    const ticket = await this.findOneAdmin(id, actingUserId);
    const user = await this.userRepo.findOne({ where: { id: assigneeId } });
    if (!user) throw new NotFoundException('Assignee not found');

    ticket.assigned_to = user;
    if (
      ticket.status === IctTicketStatus.OPEN ||
      ticket.status === IctTicketStatus.ACKNOWLEDGED
    ) {
      ticket.status = IctTicketStatus.IN_PROGRESS;
    }
    const saved = await this.ticketsRepo.save(ticket);

    // Notify the new assignee so it shows up in their "My Tickets" workspace.
    if (user.email) {
      const link = `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/${ticket.service_group === IctServiceGroup.HELPDESK ? 'helpdesk' : 'ict'}?tab=mine`;
      const html = this.mailService.getBrandedTemplate(
        `Ticket Assigned To You: ${saved.reference_number}`,
        `<p>Hello ${user.full_name || 'there'},</p>
         <p>An ICT Service Desk ticket has been assigned to you.</p>
         <p><strong>Reference:</strong> ${saved.reference_number}<br/>
         <strong>Subject:</strong> ${saved.subject}<br/>
         <strong>Priority:</strong> ${saved.priority}</p>
         <p>Open your My Tickets workspace to respond, update its status, or transfer it to the right person.</p>`,
        link,
        'ICT Service Desk',
      );
      this.mailService.sendEmail(
        ICT_MAIL_CHANNEL,
        user.email,
        `Ticket Assigned - ${saved.reference_number}`,
        html,
      );
    }

    return saved;
  }

  // Count of a user's still-open assigned tickets — powers the sidebar badge.
  async countAssignedOpen(
    userId: string,
    serviceGroupParam?: string,
  ): Promise<{ count: number }> {
    if (!userId) return { count: 0 };
    const lane = await this.resolveOptionalLane(userId, serviceGroupParam);
    const count = await this.ticketsRepo.count({
      where: {
        assigned_to: { id: userId },
        status: Not(In(CLOSED_STATES)),
        ...(lane ? { service_group: lane } : {}),
      },
    });
    return { count };
  }

  async syncAssignmentFromCampusFeedback(
    ticketId: string,
    assigneeId: string,
  ): Promise<IctTicket | null> {
    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return null;
    const user = await this.userRepo.findOne({ where: { id: assigneeId } });
    if (!user) throw new NotFoundException('Assignee not found');
    ticket.assigned_to = user;
    if (
      ticket.status === IctTicketStatus.OPEN ||
      ticket.status === IctTicketStatus.ACKNOWLEDGED
    ) {
      ticket.status = IctTicketStatus.IN_PROGRESS;
    }
    return this.ticketsRepo.save(ticket);
  }

  async addResponse(
    ticketId: string,
    authorId: string,
    dto: AddTicketResponseDto,
  ): Promise<IctTicketResponse> {
    if (!authorId) {
      throw new BadRequestException(
        'Identity verification failed. Cannot attribute response.',
      );
    }
    // The response author is also the actor: enforce assigned-ticket scoping for officers.
    const ticket = await this.findOneAdmin(ticketId, authorId);

    if (
      dto.is_internal !== true &&
      (ticket.status === IctTicketStatus.OPEN ||
        ticket.status === IctTicketStatus.ACKNOWLEDGED)
    ) {
      ticket.status = IctTicketStatus.IN_PROGRESS;
      await this.ticketsRepo.save(ticket);
    }

    const response = this.responseRepo.create({
      message: dto.message,
      is_internal: dto.is_internal || false,
      ticket,
      responded_by: { id: authorId } as User,
    });
    const saved = await this.responseRepo.save(response);

    if (!dto.is_internal && ticket.requester_email) {
      const html = this.mailService.getBrandedTemplate(
        `New Update on Ticket: ${ticket.reference_number}`,
        `<p>Hello ${ticket.requester_name || 'there'},</p>
         <p>The ICT team has added an update to your ticket (Ref: <strong>${ticket.reference_number}</strong>).</p>
         <p><strong>Message:</strong><br/>${dto.message}</p>`,
        undefined,
        'ICT Service Desk',
      );
      this.mailService.sendEmail(
        ICT_MAIL_CHANNEL,
        ticket.requester_email,
        `ICT Ticket Update - ${ticket.reference_number}`,
        html,
      );
    }

    return saved;
  }

  async suggestResponse(
    id: string,
    actingUserId?: string,
  ): Promise<{ suggestion: string }> {
    const ticket = await this.findOneAdmin(id, actingUserId);
    const articles = await this.kbService.suggestForText(
      `${ticket.subject} ${ticket.description}`,
      3,
    );
    const snippets = articles.map((a) =>
      `${a.title}: ${a.summary || ''}`.trim(),
    );
    const suggestion = await this.aiService.suggestResponse(ticket, snippets);
    return { suggestion };
  }

  async suggestedArticles(id: string, actingUserId?: string) {
    const ticket = await this.findOneAdmin(id, actingUserId);
    return this.kbService.suggestForText(
      `${ticket.subject} ${ticket.description}`,
      4,
    );
  }

  async getAssignableUsers(): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { is_active: true },
      relations: ['role', 'staff_member', 'staff_member.department'],
      order: { full_name: 'ASC' },
    });

    return filterAssignableUsers(users);
  }

  async getAnalytics(serviceGroupParam?: string, actingUserId?: string) {
    const lanes = await this.resolveLaneAccess(actingUserId);
    if (!lanes.helpdesk && !lanes.it) {
      throw new ForbiddenException(
        'You do not have access to service desk analytics.',
      );
    }
    const lane = await this.resolveRequestedLane(
      actingUserId,
      serviceGroupParam,
    );
    const all = await this.ticketsRepo.find({
      where: lane ? { service_group: lane } : {},
      relations: ['category'],
      order: { created_at: 'ASC' },
    });

    const now = new Date();
    const total = all.length;
    const isClosed = (s: IctTicketStatus) => CLOSED_STATES.includes(s);
    const open = all.filter((t) => !isClosed(t.status)).length;
    const resolved = all.filter(
      (t) =>
        t.status === IctTicketStatus.RESOLVED ||
        t.status === IctTicketStatus.CLOSED,
    ).length;
    const escalated = all.filter((t) => t.is_escalated).length;
    const critical = all.filter(
      (t) => t.priority === IctPriority.CRITICAL && !isClosed(t.status),
    ).length;
    const overdue = all.filter(
      (t) =>
        t.sla_due_date && new Date(t.sla_due_date) < now && !isClosed(t.status),
    ).length;
    const unassigned = all.filter(
      (t) => !t.assigned_to && !isClosed(t.status),
    ).length;

    const resolvedCases = all.filter((t) => t.resolved_at && t.created_at);
    const avgResolutionMs = resolvedCases.length
      ? resolvedCases.reduce(
          (sum, t) =>
            sum +
            (new Date(t.resolved_at).getTime() -
              new Date(t.created_at).getTime()),
          0,
        ) / resolvedCases.length
      : 0;
    const avgResolutionDays = Math.round(
      avgResolutionMs / (1000 * 60 * 60 * 24),
    );

    const byStatus: Record<string, number> = {};
    all.forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });

    const byPriority: Record<string, number> = {};
    all.forEach((t) => {
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    const byCategory: Record<string, number> = {};
    all.forEach((t) => {
      const c = t.category?.name || 'Uncategorized';
      byCategory[c] = (byCategory[c] || 0) + 1;
    });

    const byRequesterType: Record<string, number> = {};
    all.forEach((t) => {
      const r = t.requester_type || 'Other';
      byRequesterType[r] = (byRequesterType[r] || 0) + 1;
    });

    const trendMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      trendMap[key] = 0;
    }
    all.forEach((t) => {
      const key = new Date(t.created_at).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      if (trendMap[key] !== undefined) trendMap[key]++;
    });
    const trend = Object.entries(trendMap).map(([month, count]) => ({
      month,
      count,
    }));

    return {
      summary: {
        total,
        open,
        resolved,
        escalated,
        critical,
        overdue,
        unassigned,
        avgResolutionDays,
      },
      byStatus: Object.entries(byStatus).map(([name, value]) => ({
        name,
        value,
      })),
      byPriority: Object.entries(byPriority).map(([name, value]) => ({
        name,
        value,
      })),
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      byRequesterType: Object.entries(byRequesterType).map(([name, value]) => ({
        name,
        value,
      })),
      trend,
    };
  }

  /**
   * Complaint/compliment-oriented analytics (sentiment, feedback type, service group)
   * shaped for the executive dashboards that previously read campus-feedback.
   * `infrastructureOnly` restricts to facilities/infrastructure categories (DVC view).
   */
  // Mirrors ReportsService.getStartDate — duplicated locally so this module
  // doesn't need a cross-dependency on the reports module for one date helper.
  private resolveRangeStart(range?: string): Date | null {
    const now = new Date();
    switch (range) {
      case 'today':
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'last-7':
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'last-30':
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'this-year':
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  }

  private buildVelocityTrend(
    tickets: IctTicket[],
    velocity: string = 'monthly',
  ): Array<{ label: string; count: number }> {
    const now = new Date();
    const buckets: { key: string; label: string; start: Date; end: Date }[] =
      [];

    if (velocity === 'daily') {
      for (let i = 13; i >= 0; i--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        const key = d.toISOString().slice(0, 10);
        buckets.push({
          key,
          label: d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
          }),
          start: d,
          end: next,
        });
      }
    } else if (velocity === 'weekly') {
      for (let i = 11; i >= 0; i--) {
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        buckets.push({
          key: `w${i}`,
          label: start.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
          }),
          start,
          end,
        });
      }
    } else if (velocity === 'quarterly') {
      for (let i = 7; i >= 0; i--) {
        const qDate = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
        const q = Math.floor(qDate.getMonth() / 3) + 1;
        const start = new Date(qDate.getFullYear(), (q - 1) * 3, 1);
        const end = new Date(qDate.getFullYear(), q * 3, 1);
        buckets.push({
          key: `${start.getFullYear()}-Q${q}`,
          label: `Q${q} ${String(start.getFullYear()).slice(2)}`,
          start,
          end,
        });
      }
    } else if (velocity === 'yearly') {
      for (let i = 4; i >= 0; i--) {
        const y = now.getFullYear() - i;
        buckets.push({
          key: String(y),
          label: String(y),
          start: new Date(y, 0, 1),
          end: new Date(y + 1, 0, 1),
        });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        buckets.push({
          key: start.toLocaleString('default', {
            month: 'short',
            year: '2-digit',
          }),
          label: start.toLocaleString('default', {
            month: 'short',
            year: '2-digit',
          }),
          start,
          end,
        });
      }
    }

    return buckets.map((b) => ({
      label: b.label,
      count: tickets.filter((t) => {
        const ts = new Date(t.created_at).getTime();
        return ts >= b.start.getTime() && ts < b.end.getTime();
      }).length,
    }));
  }

  async getFeedbackAnalytics(
    infrastructureOnly = false,
    feedbackType?: string,
    range?: string,
    serviceGroupParam?: string,
    _actingUserId?: string,
    velocity: string = 'monthly',
  ) {
    // Lane filter only — do not assert queue manage/view here.
    // Endpoint is gated by reports.view / infrastructure_analytics.view so
    // executives (e.g. DVC Infrastructure) can inspect Helpdesk and ICT
    // analytics without holding ict.manage / helpdesk.manage.
    const laneFromQuery = parseServiceGroupQuery(serviceGroupParam);

    const all = await this.ticketsRepo.find({
      relations: ['category', 'department', 'assigned_to'],
      order: { created_at: 'ASC' },
    });

    let filtered = all;
    if (laneFromQuery) {
      // Normalize legacy/alias values so ICT tab matches Helpdesk filtering reliability.
      filtered = filtered.filter((t) => {
        const normalized =
          parseServiceGroupQuery(String(t.service_group || '')) ||
          t.service_group;
        return normalized === laneFromQuery;
      });
    } else if (infrastructureOnly) {
      filtered = filtered.filter(
        (t) => t.service_group === IctServiceGroup.HELPDESK,
      );
    }
    if (
      feedbackType === IctFeedbackType.COMPLAINT ||
      feedbackType === IctFeedbackType.COMPLIMENT
    ) {
      filtered = filtered.filter((t) => t.feedback_type === feedbackType);
    }
    const startDate = this.resolveRangeStart(range);
    if (startDate) {
      filtered = filtered.filter((t) => new Date(t.created_at) >= startDate);
    }

    const now = new Date();
    const isClosed = (s: IctTicketStatus) => CLOSED_STATES.includes(s);
    const total = filtered.length;
    const open = filtered.filter((t) => !isClosed(t.status)).length;
    const resolved = filtered.filter(
      (t) =>
        t.status === IctTicketStatus.RESOLVED ||
        t.status === IctTicketStatus.CLOSED,
    ).length;
    const escalated = filtered.filter((t) => t.is_escalated).length;
    const overdue = filtered.filter(
      (t) =>
        t.sla_due_date && new Date(t.sla_due_date) < now && !isClosed(t.status),
    ).length;
    const critical = filtered.filter(
      (t) => t.priority === IctPriority.CRITICAL && !isClosed(t.status),
    ).length;
    const unassigned = filtered.filter(
      (t) => !t.assigned_to && !isClosed(t.status),
    ).length;

    const resolvedCases = filtered.filter((t) => t.resolved_at && t.created_at);
    const avgMs = resolvedCases.length
      ? resolvedCases.reduce(
          (s, t) =>
            s +
            (new Date(t.resolved_at).getTime() -
              new Date(t.created_at).getTime()),
          0,
        ) / resolvedCases.length
      : 0;
    const avgResolutionDays = Math.round(avgMs / (1000 * 60 * 60 * 24));
    const avgResolutionHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byGroup: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const bySubcategory: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    const byFeedbackType: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    filtered.forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      const rt = t.requester_type || 'Other';
      byType[rt] = (byType[rt] || 0) + 1;
      const group = serviceGroupLabel(t.service_group);
      byGroup[group] = (byGroup[group] || 0) + 1;
      const cat = t.category?.name || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      const sub = (t.subcategory || '').trim() || 'Unspecified';
      bySubcategory[sub] = (bySubcategory[sub] || 0) + 1;
      if (t.sentiment)
        bySentiment[t.sentiment] = (bySentiment[t.sentiment] || 0) + 1;
      byFeedbackType[t.feedback_type] =
        (byFeedbackType[t.feedback_type] || 0) + 1;
      (t.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const trend = this.buildVelocityTrend(filtered, velocity || 'monthly');
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    const compliments = filtered.filter(
      (t) => t.feedback_type === IctFeedbackType.COMPLIMENT,
    ).length;
    const complaints = filtered.filter(
      (t) => t.feedback_type === IctFeedbackType.COMPLAINT,
    ).length;
    const serviceRequests = filtered.filter(
      (t) => t.feedback_type === IctFeedbackType.SERVICE_REQUEST,
    ).length;

    return {
      summary: {
        total,
        open,
        resolved,
        escalated,
        overdue,
        critical,
        unassigned,
        avgResolutionDays,
        avgResolutionHours,
        compliments,
        complaints,
        serviceRequests,
      },
      byStatus: Object.entries(byStatus).map(([name, value]) => ({
        name,
        value,
      })),
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byGroup: Object.entries(byGroup).map(([name, value]) => ({
        name,
        value,
      })),
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      bySubcategory: Object.entries(bySubcategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12),
      bySentiment: Object.entries(bySentiment).map(([name, value]) => ({
        name,
        value,
      })),
      byFeedbackType: Object.entries(byFeedbackType).map(([name, value]) => ({
        name,
        value,
      })),
      trend: trend.map((t) => ({
        month: t.label,
        label: t.label,
        count: t.count,
      })),
      velocity: velocity || 'monthly',
      topTags,
    };
  }

  /** Personal performance analytics for the signed-in officer (assigned tickets only). */
  async getPersonalAnalytics(
    userId: string,
    serviceGroupParam?: string,
    range?: string,
  ) {
    if (!userId) throw new BadRequestException('User identity required.');
    const lane = await this.resolveOptionalLane(userId, serviceGroupParam);
    const all = await this.ticketsRepo.find({
      where: {
        assigned_to: { id: userId },
        ...(lane ? { service_group: lane } : {}),
      },
      relations: ['category'],
      order: { created_at: 'ASC' },
    });
    return this.buildAnalyticsSummary(all, lane, 'personal', range);
  }

  /** Queue-wide analytics for officers who can see the full ICT desk. */
  async getQueueAnalytics(
    userId: string,
    serviceGroupParam?: string,
    range?: string,
  ) {
    if (!userId) throw new BadRequestException('User identity required.');
    const lane = await this.resolveRequestedLane(userId, serviceGroupParam);
    const all = await this.ticketsRepo.find({
      where: lane ? { service_group: lane } : {},
      relations: ['category', 'assigned_to'],
      order: { created_at: 'ASC' },
    });
    return this.buildAnalyticsSummary(all, lane, 'queue', range);
  }

  private buildAnalyticsSummary(
    all: IctTicket[],
    lane: IctServiceGroup | undefined,
    scope: 'personal' | 'queue',
    range?: string,
  ) {
    const startDate = this.resolveRangeStart(range);
    const filtered = startDate
      ? all.filter((t) => new Date(t.created_at) >= startDate)
      : all;

    const now = new Date();
    const isClosed = (s: IctTicketStatus) => CLOSED_STATES.includes(s);
    const total = filtered.length;
    const open = filtered.filter((t) => !isClosed(t.status)).length;
    const resolved = filtered.filter(
      (t) =>
        t.status === IctTicketStatus.RESOLVED ||
        t.status === IctTicketStatus.CLOSED,
    ).length;
    const overdue = filtered.filter(
      (t) =>
        t.sla_due_date && new Date(t.sla_due_date) < now && !isClosed(t.status),
    ).length;
    const assigned = filtered.filter((t) => !!t.assigned_to).length;

    const resolvedCases = filtered.filter((t) => t.resolved_at && t.created_at);
    const avgMs = resolvedCases.length
      ? resolvedCases.reduce(
          (s, t) =>
            s +
            (new Date(t.resolved_at).getTime() -
              new Date(t.created_at).getTime()),
          0,
        ) / resolvedCases.length
      : 0;

    const byCategory: Record<string, number> = {};
    const byFeedbackType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    filtered.forEach((t) => {
      const cat = t.category?.name || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      byFeedbackType[t.feedback_type] =
        (byFeedbackType[t.feedback_type] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    });

    const trendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap[d.toISOString().slice(0, 10)] = 0;
    }
    filtered.forEach((t) => {
      const key = new Date(t.created_at).toISOString().slice(0, 10);
      if (trendMap[key] !== undefined) trendMap[key]++;
    });

    return {
      scope,
      service_group: lane || 'all',
      summary: {
        total,
        open,
        resolved,
        overdue,
        assigned: scope === 'queue' ? assigned : total,
        avgResolutionHours: Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10,
        avgResolutionDays: Math.round(avgMs / (1000 * 60 * 60 * 24)),
      },
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      byFeedbackType: Object.entries(byFeedbackType).map(([name, value]) => ({
        name,
        value,
      })),
      byPriority: Object.entries(byPriority).map(([name, value]) => ({
        name,
        value,
      })),
      trend: Object.entries(trendMap).map(([day, count]) => ({ day, count })),
    };
  }

  // ─── Category management ─────────────────────────────────────────────────

  async getCategories(activeOnly = false): Promise<IctCategory[]> {
    return this.categoryRepo.find({
      where: activeOnly ? { is_active: true } : {},
      relations: ['default_assignee'],
      order: { name: 'ASC' },
    });
  }

  async getCategoryBySlug(slug: string): Promise<IctCategory | null> {
    return this.categoryRepo.findOne({
      where: { slug },
      relations: ['default_assignee', 'department'],
    });
  }

  async createCategory(dto: UpsertCategoryDto): Promise<IctCategory> {
    const slug = this.slugify(dto.name);
    const existing = await this.categoryRepo.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing)
      throw new BadRequestException('A category with this name already exists');

    const category = this.categoryRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      default_priority:
        (dto.default_priority as IctPriority) || IctPriority.MEDIUM,
      sla_hours: dto.sla_hours ?? 48,
      is_active: dto.is_active ?? true,
      subcategories: dto.subcategories || [],
      default_assignee: dto.default_assignee_id
        ? ({ id: dto.default_assignee_id } as User)
        : undefined,
    });
    return this.categoryRepo.save(category);
  }

  async updateCategory(
    id: string,
    dto: UpsertCategoryDto,
  ): Promise<IctCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== category.name) {
      category.name = dto.name;
      category.slug = this.slugify(dto.name);
    }
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.default_priority)
      category.default_priority = dto.default_priority as IctPriority;
    if (dto.sla_hours !== undefined) category.sla_hours = dto.sla_hours;
    if (dto.is_active !== undefined) category.is_active = dto.is_active;
    if (dto.subcategories !== undefined)
      category.subcategories = dto.subcategories;
    if (dto.default_assignee_id !== undefined) {
      category.default_assignee = dto.default_assignee_id
        ? ({ id: dto.default_assignee_id } as User)
        : (null as any);
    }
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string): Promise<{ deleted: boolean }> {
    const count = await this.ticketsRepo.count({ where: { category: { id } } });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete a category that still has tickets. Deactivate it instead.',
      );
    }
    await this.categoryRepo.delete(id);
    return { deleted: true };
  }

  // ─── Automation ──────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoEscalateOverdue() {
    const now = new Date();
    const overdue = await this.ticketsRepo.find({
      where: {
        sla_due_date: LessThan(now),
        status: Not(In(CLOSED_STATES)),
      },
    });

    for (const ticket of overdue) {
      if (!ticket.is_escalated) {
        ticket.is_escalated = true;
        ticket.escalation_reason = 'Auto-escalated: SLA deadline exceeded';
        await this.ticketsRepo.save(ticket);
      }
    }
  }
}
