import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TechnicalSupportTicket,
  TicketSubmitterRole,
} from './entities/technical-support-ticket.entity';
import { TechnicalSupportNote } from './entities/technical-support-note.entity';
import {
  CreateTechnicalSupportTicketDto,
  SubmitTechnicalSupportDto,
  UpdateTechnicalSupportStatusDto,
  AddTechnicalSupportNoteDto,
  TechnicalSupportListQueryDto,
} from './dto/technical-support.dto';
import { User } from '../auth/entities/user.entity';
import { generateReferenceNumber } from '../shared/feedback/reference-number.util';
import {
  FeedbackPriority,
  FeedbackStatus,
} from '../shared/feedback/feedback.enums';
import { MailService } from '../mail/mail.service';
import {
  getCategoryGroupsForRole,
  TechnicalSupportCategoryGroup,
} from './technical-support-categories';
import { IctService } from '../ict/ict.service';
import { IctServiceGroup } from '../ict/entities/ict-ticket.entity';

const ICT_TECH_SUPPORT_SLUG = 'ict-support';

@Injectable()
export class TechnicalSupportService {
  constructor(
    @InjectRepository(TechnicalSupportTicket)
    private readonly ticketRepo: Repository<TechnicalSupportTicket>,
    @InjectRepository(TechnicalSupportNote)
    private readonly noteRepo: Repository<TechnicalSupportNote>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly ictService: IctService,
  ) {}

  getCategories(role?: string): {
    role: string;
    groups: TechnicalSupportCategoryGroup[];
  } {
    const normalized = (role || 'student').toLowerCase();
    const resolved =
      normalized === 'staff' || normalized === 'faculty' ? 'staff' : 'student';
    return {
      role: resolved,
      groups: getCategoryGroupsForRole(normalized),
    };
  }

  private mapSubmitterRole(user: User): TicketSubmitterRole {
    const role = (user.role?.name || user.role_legacy || '').toLowerCase();
    if (role.includes('staff')) return TicketSubmitterRole.STAFF;
    return TicketSubmitterRole.STUDENT;
  }

  private mapRequesterType(submitterType?: string, user?: User | null): string {
    if (submitterType === 'Staff' || submitterType === 'Student')
      return submitterType;
    if (user) {
      const userType = (user.user_type || '').toLowerCase();
      if (userType === 'staff' || userType === 'executive') return 'Staff';
      if (userType === 'student') return 'Student';
    }
    return 'Student';
  }

  /** Route mobile/web technical support intake into the ICT Service Desk IT lane. */
  private async routeToIctDesk(
    input: {
      category: string;
      related_system?: string;
      description: string;
      priority?: FeedbackPriority;
      attachment_urls?: string[];
      full_name: string;
      email: string;
      submitter_type?: string;
      submission_source?: string;
      client_platform?: string;
    },
    requesterId?: string,
  ) {
    const ictCategory = await this.ictService.getCategoryBySlug(
      ICT_TECH_SUPPORT_SLUG,
    );
    const subject = input.related_system
      ? `${input.category} — ${input.related_system}`
      : input.category;

    const ticket = await this.ictService.createTicket(
      {
        subject,
        description: input.description,
        category_id: ictCategory?.id,
        subcategory: input.related_system || input.category,
        priority: input.priority || FeedbackPriority.MEDIUM,
        requester_name: input.full_name,
        requester_email: input.email.trim().toLowerCase(),
        requester_type: this.mapRequesterType(input.submitter_type),
        attachment_urls: input.attachment_urls || [],
        submission_source: input.submission_source || 'mobile_app',
        client_platform: input.client_platform,
        service_group: 'it',
      },
      requesterId,
      { skipTriage: true },
    );

    return {
      id: ticket.id,
      reference_number: ticket.reference_number,
      service_group:
        ticket.service_group || IctServiceGroup.IT_TECHNICAL_SUPPORT,
      status: ticket.status,
      category: input.category,
      related_system: input.related_system,
      priority: ticket.priority,
      created_at: ticket.created_at,
    };
  }

  /** Public mobile intake — mirrors campus feedback submit (no JWT required). */
  async submitPublic(dto: SubmitTechnicalSupportDto) {
    if (!dto.email?.trim()) {
      throw new BadRequestException('Email is required.');
    }
    return this.routeToIctDesk({
      category: dto.category,
      related_system: dto.related_system,
      description: dto.description,
      priority: dto.priority,
      attachment_urls: dto.attachment_urls,
      full_name: dto.full_name.trim(),
      email: dto.email.trim().toLowerCase(),
      submitter_type: dto.submitter_type,
      submission_source: dto.submission_source || 'mobile_app',
      client_platform: dto.client_platform,
    });
  }

  async create(dto: CreateTechnicalSupportTicketDto, userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'staff_member', 'staff_member.department'],
    });
    if (!user) throw new NotFoundException('User not found');

    const requesterType = this.mapRequesterType(undefined, user);
    const ictResult = await this.routeToIctDesk(
      {
        category: dto.category,
        related_system: dto.related_system,
        description: dto.description,
        priority: dto.priority,
        attachment_urls: dto.attachment_urls,
        full_name: user.full_name,
        email: user.email,
        submitter_type: requesterType,
        submission_source: dto.submission_source || 'mobile_app',
        client_platform: dto.client_platform,
      },
      userId,
    );

    // Keep legacy table in sync for existing technical-support admin views.
    const refNumber = await generateReferenceNumber(this.ticketRepo, 'TKT');
    const legacy = this.ticketRepo.create({
      reference_number: refNumber,
      submitter: user,
      submitter_name: user.full_name,
      submitter_email: user.email,
      submitter_role: this.mapSubmitterRole(user),
      submitter_department: user.staff_member?.department?.name || undefined,
      category: dto.category,
      related_system: dto.related_system,
      description: dto.description,
      priority: dto.priority || FeedbackPriority.MEDIUM,
      attachment_urls: dto.attachment_urls || [],
      status: FeedbackStatus.SUBMITTED,
    });
    const saved = await this.ticketRepo.save(legacy);

    return {
      ...saved,
      ict_ticket_id: ictResult.id,
      ict_reference_number: ictResult.reference_number,
      service_group: ictResult.service_group,
    };
  }

  async findMyTickets(userId: string): Promise<TechnicalSupportTicket[]> {
    return this.ticketRepo.find({
      where: { submitter: { id: userId } },
      relations: ['assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(
    query: TechnicalSupportListQueryDto = {},
  ): Promise<TechnicalSupportTicket[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.submitter', 'submitter')
      .leftJoinAndSelect('t.assigned_to', 'assigned_to')
      .orderBy('t.created_at', 'DESC');

    if (query.status)
      qb.andWhere('t.status = :status', { status: query.status });
    if (query.priority)
      qb.andWhere('t.priority = :priority', { priority: query.priority });
    if (query.category)
      qb.andWhere('t.category = :category', { category: query.category });

    return qb.getMany();
  }

  async findById(
    id: string,
    userId?: string,
    isIct = false,
  ): Promise<TechnicalSupportTicket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['submitter', 'assigned_to', 'notes', 'notes.author'],
      order: { notes: { created_at: 'ASC' } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isIct && userId && ticket.submitter?.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return ticket;
  }

  async updateStatus(
    id: string,
    dto: UpdateTechnicalSupportStatusDto,
    actorId: string,
  ): Promise<TechnicalSupportTicket> {
    const ticket = await this.findById(id, actorId, true);
    ticket.status = dto.status as FeedbackStatus;

    if (
      [FeedbackStatus.RESOLVED, FeedbackStatus.CLOSED].includes(ticket.status)
    ) {
      ticket.resolved_at = new Date();
    }
    if (dto.resolution_note) ticket.resolution_note = dto.resolution_note;
    if (dto.assigned_to_id) {
      const assignee = await this.userRepo.findOne({
        where: { id: dto.assigned_to_id },
      });
      if (assignee) ticket.assigned_to = assignee;
    }
    if (
      ticket.status === FeedbackStatus.IN_PROGRESS &&
      [FeedbackStatus.SUBMITTED, FeedbackStatus.ACKNOWLEDGED].includes(
        ticket.status as FeedbackStatus,
      )
    ) {
      ticket.status = FeedbackStatus.IN_PROGRESS;
    }

    const saved = await this.ticketRepo.save(ticket);

    if (dto.resolution_note && ticket.submitter_email) {
      const html = this.mailService.getBrandedTemplate(
        `Ticket ${dto.status}: ${ticket.reference_number}`,
        `<p>Your support ticket has been updated.</p><p>${dto.resolution_note}</p>`,
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
      );
      this.mailService.sendEmail(
        'system',
        ticket.submitter_email,
        `Ticket ${dto.status} - ${ticket.reference_number}`,
        html,
      );
    }

    return saved;
  }

  async addNote(
    ticketId: string,
    dto: AddTechnicalSupportNoteDto,
    authorId: string,
  ): Promise<TechnicalSupportNote> {
    const ticket = await this.findById(ticketId, authorId, true);
    const author = await this.userRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');

    const note = this.noteRepo.create({
      ticket,
      body: dto.body,
      author,
      author_name: author.full_name,
    });
    return this.noteRepo.save(note);
  }

  async getIctAnalytics() {
    const all = await this.ticketRepo.find();
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const open = all.filter(
      (t) => !['Resolved', 'Closed'].includes(t.status),
    ).length;
    const highUrgent = all.filter(
      (t) =>
        ['High', 'Critical'].includes(t.priority) &&
        !['Resolved', 'Closed'].includes(t.status),
    ).length;
    const submittedToday = all.filter(
      (t) => new Date(t.created_at) >= todayStart,
    ).length;

    const resolved = all.filter((t) => t.resolved_at);
    const avgMs = resolved.length
      ? resolved.reduce(
          (s, t) => s + (t.resolved_at.getTime() - t.created_at.getTime()),
          0,
        ) / resolved.length
      : 0;

    return {
      openTickets: open,
      highUrgentCount: highUrgent,
      ticketsSubmittedToday: submittedToday,
      avgResolutionTimeHours: Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10,
      total: all.length,
    };
  }
}
