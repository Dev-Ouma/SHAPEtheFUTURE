import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Not, In, LessThan, DataSource } from 'typeorm';
import {
  CampusFeedback,
  SubmitterType,
  FeedbackType,
  FeedbackSentiment,
  FeedbackUrgency,
} from './entities/campus-feedback.entity';
import { CampusFeedbackCategory } from './entities/campus-feedback-category.entity';
import { CampusFeedbackResponse } from './entities/campus-feedback-response.entity';
import {
  SubmitCampusFeedbackDto,
  UpdateCampusFeedbackStatusDto,
  AddCampusFeedbackResponseDto,
  CampusFeedbackListQueryDto,
} from './dto/campus-feedback.dto';
import { User, UserRole } from '../auth/entities/user.entity';
import { filterAssignableUsers } from '../auth/assignable-personnel';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { MailService } from '../mail/mail.service';
import { FeedbackAiService } from '../shared/feedback/feedback-ai.service';
import { generateReferenceNumber } from '../shared/feedback/reference-number.util';
import {
  FeedbackPriority,
  FeedbackStatus,
  TERMINAL_STATUSES,
} from '../shared/feedback/feedback.enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import { runCampusFeedbackSeed } from '../database/seeds/campus-feedback-seed';
import { IctService } from '../ict/ict.service';

@Injectable()
export class CampusFeedbackService implements OnModuleInit {
  private readonly logger = new Logger(CampusFeedbackService.name);

  constructor(
    @InjectRepository(CampusFeedback)
    private readonly feedbackRepo: Repository<CampusFeedback>,
    @InjectRepository(CampusFeedbackCategory)
    private readonly categoryRepo: Repository<CampusFeedbackCategory>,
    @InjectRepository(CampusFeedbackResponse)
    private readonly responseRepo: Repository<CampusFeedbackResponse>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StaffMember)
    private readonly staffRepo: Repository<StaffMember>,
    private readonly mailService: MailService,
    private readonly aiService: FeedbackAiService,
    private readonly ictService: IctService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Upserting campus feedback (Helpdesk) categories...');
    await runCampusFeedbackSeed(this.dataSource);
  }

  private trackingUrl(): string {
    return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/about/campus-feedback`;
  }

  async submit(
    dto: SubmitCampusFeedbackDto,
    submitterUserId?: string,
  ): Promise<
    Pick<CampusFeedback, 'id' | 'reference_number' | 'status' | 'feedback_type'>
  > {
    if (!dto.is_anonymous && (!dto.email || dto.email.trim() === '')) {
      throw new BadRequestException(
        'Email is required unless submitting anonymously.',
      );
    }

    const categories = await this.categoryRepo.find({
      where: { is_active: true },
    });
    const categoryNames = categories.map((c) => c.name);

    const hasCategoryHint = Boolean(dto.category_id || dto.category_name);
    const aiResult = hasCategoryHint
      ? null
      : await this.aiService.classify(dto.subject, dto.description, {
          availableCategories: categoryNames.length
            ? categoryNames
            : ['Facilities & Infrastructure', 'General'],
          domainLabel: 'Campus Feedback',
          userSuggestedCategory: dto.category_name,
        });

    let category: CampusFeedbackCategory | null = null;
    if (dto.category_id) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
        relations: ['department'],
      });
    } else if (dto.category_name) {
      category = await this.categoryRepo.findOne({
        where: { name: dto.category_name },
        relations: ['department'],
      });
    } else if (aiResult?.category_name) {
      category = await this.categoryRepo.findOne({
        where: { name: aiResult.category_name },
        relations: ['department'],
      });
    }
    if (!category) {
      category = await this.categoryRepo.findOne({
        where: { slug: 'general-inquiry' },
        relations: ['department'],
      });
    }

    const refNumber = await generateReferenceNumber(this.feedbackRepo, 'CFB');

    const isCompliment = dto.feedback_type === FeedbackType.COMPLIMENT;
    const sentiment = isCompliment
      ? FeedbackSentiment.POSITIVE
      : (aiResult?.sentiment as FeedbackSentiment) || FeedbackSentiment.NEUTRAL;

    const feedback = this.feedbackRepo.create({
      ...dto,
      reference_number: refNumber,
      category: category || undefined,
      department: category?.department || undefined,
      submitter_type:
        (dto.submitter_type as SubmitterType) || SubmitterType.EXTERNAL,
      sub_category: dto.sub_category || aiResult?.subcategory || undefined,
      sentiment,
      priority:
        (aiResult?.priority as FeedbackPriority) || FeedbackPriority.MEDIUM,
      urgency: (dto.urgency as FeedbackUrgency) || FeedbackUrgency.MEDIUM,
      tags: aiResult?.tags || [],
      keywords: aiResult?.keywords || [],
      is_escalated: aiResult?.is_escalated || false,
      escalation_reason: aiResult?.escalation_reason || undefined,
      ai_confidence_score: aiResult?.confidence_score || undefined,
      status: FeedbackStatus.SUBMITTED,
      sla_due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      submitter_user: submitterUserId
        ? ({ id: submitterUserId } as User)
        : undefined,
    });

    const saved = await this.feedbackRepo.save(feedback);

    try {
      await this.ictService.mirrorCampusFeedback({
        id: saved.id,
        reference_number: saved.reference_number,
        feedback_type: saved.feedback_type,
        submitter_type: saved.submitter_type,
        full_name: saved.full_name,
        email: saved.email,
        phone_number: saved.phone_number,
        identification_number: saved.identification_number,
        is_anonymous: saved.is_anonymous,
        consent_given: saved.consent_given,
        subject: saved.subject,
        description: saved.description,
        location: saved.location,
        incident_date: saved.incident_date,
        sub_category: saved.sub_category,
        attachment_urls: saved.attachment_urls,
        sentiment: saved.sentiment,
        priority: saved.priority,
        tags: saved.tags,
        keywords: saved.keywords,
        ai_confidence_score: saved.ai_confidence_score,
        is_escalated: saved.is_escalated,
        escalation_reason: saved.escalation_reason,
        status: saved.status,
        sla_due_date: saved.sla_due_date,
        category_slug: category?.slug,
        department_id: category?.department?.id || saved.department?.id,
        requester_id: submitterUserId,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
        submission_source: dto.submission_source || 'unknown',
        client_platform: dto.client_platform,
      });
    } catch (err) {
      this.logger.error(
        `Failed to mirror campus feedback ${saved.reference_number} into ICT desk`,
        err as Error,
      );
    }

    if (!dto.is_anonymous && dto.email) {
      const label = isCompliment ? 'Compliment' : 'Feedback';
      const html = this.mailService.getBrandedTemplate(
        `${label} Acknowledgment: ${refNumber}`,
        `<p>Dear Stakeholder,</p><p>Your campus ${label.toLowerCase()} has been recorded.</p><p><strong>Reference:</strong> ${refNumber}</p><p>Keep this reference to track your submission.</p>`,
        this.trackingUrl(),
      );
      this.mailService.queueEmail(
        'complaints',
        dto.email,
        `${label} Received - ${refNumber}`,
        html,
      );
    }

    return {
      id: saved.id,
      reference_number: saved.reference_number,
      status: saved.status,
      feedback_type: saved.feedback_type,
    };
  }

  async track(
    reference_number: string,
    email: string,
  ): Promise<CampusFeedback> {
    const item = await this.feedbackRepo.findOne({
      where: { reference_number },
      relations: ['category', 'department', 'responses', 'assigned_to'],
      order: { responses: { created_at: 'ASC' } },
    });
    if (!item) throw new NotFoundException('Tracking reference not found');
    if (!item.is_anonymous && item.email !== email) {
      throw new BadRequestException('Email does not match tracking record');
    }
    if (item.responses) {
      item.responses = item.responses.filter((r) => !r.is_internal);
    }
    return item;
  }

  async findMySubmissions(userId: string): Promise<CampusFeedback[]> {
    return this.feedbackRepo.find({
      where: { submitter_user: { id: userId } },
      relations: ['category', 'department', 'assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string, userId?: string): Promise<CampusFeedback> {
    const item = await this.feedbackRepo.findOne({
      where: { id },
      relations: [
        'category',
        'department',
        'assigned_to',
        'submitter_user',
        'responses',
        'responses.responded_by',
      ],
      order: { responses: { created_at: 'ASC' } },
    });
    if (!item) throw new NotFoundException('Campus feedback not found');
    if (
      userId &&
      item.submitter_user?.id &&
      item.submitter_user.id !== userId
    ) {
      throw new BadRequestException('Access denied');
    }
    return item;
  }

  async findAllAdmin(
    query: CampusFeedbackListQueryDto = {},
  ): Promise<CampusFeedback[]> {
    const qb = this.feedbackRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.category', 'category')
      .leftJoinAndSelect('f.department', 'department')
      .leftJoinAndSelect('f.assigned_to', 'assigned_to')
      .orderBy('f.created_at', 'DESC');

    if (query.status)
      qb.andWhere('f.status = :status', { status: query.status });
    if (query.feedback_type)
      qb.andWhere('f.feedback_type = :ft', { ft: query.feedback_type });
    if (query.category)
      qb.andWhere('category.slug = :slug', { slug: query.category });
    if (query.infrastructure_only === 'true') {
      qb.andWhere('category.is_infrastructure = true');
    }

    return qb.getMany();
  }

  async getAnalytics(infrastructureOnly = false) {
    const all = await this.feedbackRepo.find({
      relations: ['category', 'department'],
      order: { created_at: 'ASC' },
    });

    const filtered = infrastructureOnly
      ? all.filter((f) => f.category?.is_infrastructure)
      : all;

    const now = new Date();
    const total = filtered.length;
    const open = filtered.filter(
      (c) => !TERMINAL_STATUSES.includes(c.status),
    ).length;
    const resolved = filtered.filter((c) =>
      ['Resolved', 'Closed'].includes(c.status),
    ).length;
    const escalated = filtered.filter((c) => c.is_escalated).length;
    const overdue = filtered.filter(
      (c) =>
        c.sla_due_date &&
        new Date(c.sla_due_date) < now &&
        !TERMINAL_STATUSES.includes(c.status),
    ).length;
    const critical = filtered.filter(
      (c) =>
        c.priority === FeedbackPriority.CRITICAL &&
        !TERMINAL_STATUSES.includes(c.status),
    ).length;

    const resolvedCases = filtered.filter((c) => c.resolved_at && c.created_at);
    const avgResolutionMs = resolvedCases.length
      ? resolvedCases.reduce(
          (sum, c) =>
            sum +
            (new Date(c.resolved_at).getTime() -
              new Date(c.created_at).getTime()),
          0,
        ) / resolvedCases.length
      : 0;
    const avgResolutionDays = Math.round(
      avgResolutionMs / (1000 * 60 * 60 * 24),
    );

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    const byFeedbackType: Record<string, number> = {};

    filtered.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      const t = c.submitter_type || 'External';
      byType[t] = (byType[t] || 0) + 1;
      const cat = c.category?.name || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      if (c.sentiment)
        bySentiment[c.sentiment] = (bySentiment[c.sentiment] || 0) + 1;
      byFeedbackType[c.feedback_type] =
        (byFeedbackType[c.feedback_type] || 0) + 1;
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
    filtered.forEach((c) => {
      const d = new Date(c.created_at);
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      if (trendMap[key] !== undefined) trendMap[key]++;
    });

    const tagCounts: Record<string, number> = {};
    filtered.forEach((c) => {
      (c.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const compliments = filtered.filter(
      (c) => c.feedback_type === FeedbackType.COMPLIMENT,
    ).length;
    const complaints = filtered.filter(
      (c) => c.feedback_type === FeedbackType.COMPLAINT,
    ).length;

    return {
      summary: {
        total,
        open,
        resolved,
        escalated,
        overdue,
        critical,
        avgResolutionDays,
        compliments,
        complaints,
      },
      byStatus: Object.entries(byStatus).map(([name, value]) => ({
        name,
        value,
      })),
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      bySentiment: Object.entries(bySentiment).map(([name, value]) => ({
        name,
        value,
      })),
      byFeedbackType: Object.entries(byFeedbackType).map(([name, value]) => ({
        name,
        value,
      })),
      trend: Object.entries(trendMap).map(([month, count]) => ({
        month,
        count,
      })),
      topTags,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateCampusFeedbackStatusDto,
  ): Promise<CampusFeedback> {
    const item = await this.findById(id);
    item.status = dto.status as FeedbackStatus;
    if (
      [FeedbackStatus.RESOLVED, FeedbackStatus.CLOSED].includes(item.status)
    ) {
      item.resolved_at = new Date();
    }
    if (dto.resolution) item.resolution = dto.resolution;
    const saved = await this.feedbackRepo.save(item);

    if (
      !item.is_anonymous &&
      item.email &&
      (dto.status === FeedbackStatus.RESOLVED ||
        dto.status === FeedbackStatus.CLOSED)
    ) {
      const html = this.mailService.getBrandedTemplate(
        `Case ${dto.status}: ${item.reference_number}`,
        `<p>Your campus feedback (Ref: <strong>${item.reference_number}</strong>) is now <strong>${dto.status}</strong>.</p><p>${dto.resolution || ''}</p>`,
        this.trackingUrl(),
      );
      this.mailService.sendEmail(
        'complaints',
        item.email,
        `Feedback ${dto.status} - ${item.reference_number}`,
        html,
      );
    }
    return saved;
  }

  async assignStaff(id: string, staffId: string): Promise<CampusFeedback> {
    const item = await this.findById(id);
    const user = await this.userRepo.findOne({ where: { id: staffId } });
    if (!user) throw new NotFoundException('User not found');
    item.assigned_to = user as any;
    if (
      [FeedbackStatus.SUBMITTED, FeedbackStatus.ACKNOWLEDGED].includes(
        item.status,
      )
    ) {
      item.status = FeedbackStatus.IN_PROGRESS;
    }
    const saved = await this.feedbackRepo.save(item);
    try {
      await this.ictService.syncAssignmentFromCampusFeedback(saved.id, staffId);
    } catch (err) {
      this.logger.error(
        `Failed to sync ICT assignment for ${saved.reference_number}`,
        err as Error,
      );
    }
    return saved;
  }

  async addResponse(
    feedbackId: string,
    staffId: string,
    dto: AddCampusFeedbackResponseDto,
  ): Promise<CampusFeedbackResponse> {
    const item = await this.findById(feedbackId);
    if (!staffId)
      throw new BadRequestException('Identity verification failed.');

    if (
      dto.is_internal !== true &&
      [FeedbackStatus.SUBMITTED, FeedbackStatus.ACKNOWLEDGED].includes(
        item.status,
      )
    ) {
      item.status = FeedbackStatus.IN_PROGRESS;
      await this.feedbackRepo.save(item);
    }

    const response = this.responseRepo.create({
      message: dto.message,
      is_internal: dto.is_internal,
      feedback: item,
      responded_by: { id: staffId } as any,
    });
    const saved = await this.responseRepo.save(response);

    if (!dto.is_internal && !item.is_anonymous && item.email) {
      const html = this.mailService.getBrandedTemplate(
        `New Response: ${item.reference_number}`,
        `<p>A response was added to your submission (Ref: <strong>${item.reference_number}</strong>).</p><p>${dto.message}</p>`,
        this.trackingUrl(),
      );
      this.mailService.sendEmail(
        'complaints',
        item.email,
        `New Response - ${item.reference_number}`,
        html,
      );
    }
    return saved;
  }

  async getCategories(type?: string): Promise<CampusFeedbackCategory[]> {
    const count = await this.categoryRepo.count();
    if (count === 0) {
      await runCampusFeedbackSeed(this.dataSource);
    }

    const all = await this.categoryRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
    if (!type) return all;
    return all.filter(
      (c) => !c.applicable_types || c.applicable_types.includes(type),
    );
  }

  async getAssignableUsers() {
    await this.syncStaffUsers();
    const users = await this.userRepo.find({
      where: { is_active: true },
      relations: [
        'role',
        'staff_member',
        'staff_member.executive_types',
        'staff_member.staff_type',
        'staff_member.department',
      ],
      order: { full_name: 'ASC' },
    });
    return filterAssignableUsers(users).filter((user) => {
      const staffType =
        user.staff_member?.staff_type?.name?.toLowerCase() || '';
      const execType =
        user.staff_member?.executive_types?.[0]?.name?.toLowerCase() || '';
      return !(
        staffType.includes('executive') || execType.includes('executive')
      );
    });
  }

  private async syncStaffUsers() {
    const staff = await this.staffRepo.find();
    const defaultPassword = await bcrypt.hash('staff123', 10);
    for (const member of staff) {
      if (!member.email) continue;
      const userLinked = await this.userRepo.findOne({
        where: { staff_member: { id: member.id } },
        relations: ['staff_member'],
      });
      if (userLinked) continue;
      const userByEmail = await this.userRepo.findOne({
        where: { email: member.email },
        relations: ['staff_member'],
      });
      if (userByEmail && !userByEmail.staff_member) {
        userByEmail.staff_member = member;
        if (
          !userByEmail.role_legacy ||
          userByEmail.role_legacy === UserRole.STUDENT
        ) {
          userByEmail.role_legacy = UserRole.STAFF;
        }
        await this.userRepo.save(userByEmail);
      } else if (!userByEmail) {
        await this.userRepo.save(
          this.userRepo.create({
            email: member.email,
            full_name: member.full_name,
            password: defaultPassword,
            role_legacy: UserRole.STAFF,
            is_active: true,
            staff_member: member,
          }),
        );
      }
    }
  }

  async suggestResponse(id: string): Promise<{ suggestion: string }> {
    const item = await this.findById(id);
    const suggestion = await this.aiService.suggestResponse(
      {
        subject: item.subject,
        description: item.description,
        status: item.status,
        category: item.category?.name,
      },
      'Campus Feedback',
    );
    return { suggestion };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoEscalateOverdue() {
    const now = new Date();
    const unassignedCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const unassigned = await this.feedbackRepo.find({
      where: {
        assigned_to: null as any,
        created_at: LessThan(unassignedCutoff),
        status: Not(In(TERMINAL_STATUSES)),
      },
    });
    for (const c of unassigned) {
      if (!c.is_escalated) {
        c.is_escalated = true;
        c.escalation_reason = 'Auto-escalated: Not assigned within 24 hours';
        await this.feedbackRepo.save(c);
      }
    }
    const overdue = await this.feedbackRepo.find({
      where: [
        { sla_due_date: LessThan(now), status: Not(In(TERMINAL_STATUSES)) },
        {
          created_at: LessThan(
            new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          ),
          status: Not(In(TERMINAL_STATUSES)),
        },
      ],
    });
    for (const c of overdue) {
      if (!c.is_escalated) {
        c.is_escalated = true;
        c.escalation_reason =
          'Auto-escalated: Not resolved within SLA timeframe';
        await this.feedbackRepo.save(c);
      }
    }
  }
}
