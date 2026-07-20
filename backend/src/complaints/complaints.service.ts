import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Not, In, LessThan } from 'typeorm';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintType,
} from './entities/complaint.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { filterAssignableUsers } from '../auth/assignable-personnel';
import { ComplaintCategory } from './entities/complaint-category.entity';
import { ComplaintResponse } from './entities/complaint-response.entity';
import {
  CreateComplaintDto,
  UpdateComplaintStatusDto,
  AddResponseDto,
} from './dto/create-complaint.dto';
import { StaffMember } from '../staff/entities/staff-member.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { ComplaintsAiService } from './complaints-ai.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepo: Repository<Complaint>,
    @InjectRepository(ComplaintCategory)
    private categoryRepo: Repository<ComplaintCategory>,
    @InjectRepository(ComplaintResponse)
    private responseRepo: Repository<ComplaintResponse>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(StaffMember)
    private staffRepo: Repository<StaffMember>,
    private mailService: MailService,
    private aiService: ComplaintsAiService,
  ) {}

  private async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.complaintsRepo.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `OUK-CMP-${year}-${sequence}`;
  }

  async submitComplaint(dto: CreateComplaintDto): Promise<Complaint> {
    if (!dto.is_anonymous && (!dto.email || dto.email.trim() === '')) {
      throw new BadRequestException(
        'Email is required unless submitting anonymously.',
      );
    }

    // Call AI Service to auto-classify
    const aiResult = await this.aiService.classifyComplaint(
      dto.subject,
      dto.description,
      dto.category_name,
    );

    let category = null;
    if (dto.category_id) {
      category = await this.categoryRepo.findOne({
        where: { id: dto.category_id },
        relations: ['department'],
      });
    } else if (aiResult?.category_name) {
      // Try to find category by name from AI result
      category = await this.categoryRepo.findOne({
        where: { name: aiResult.category_name },
        relations: ['department'],
      });
    }

    // Fallback if no category found
    if (!category) {
      category = await this.categoryRepo.findOne({
        where: { name: 'Other' },
        relations: ['department'],
      });
    }

    const refNumber = await this.generateReferenceNumber();

    const complaint = this.complaintsRepo.create({
      ...dto,
      reference_number: refNumber,
      category: category || undefined,
      department: category?.department || undefined, // Auto-assign department based on category map
      complaint_type:
        (dto.complaint_type as ComplaintType) || ComplaintType.EXTERNAL,
      subcategory: aiResult?.subcategory || undefined,
      sentiment: aiResult?.sentiment || undefined,
      priority: aiResult?.priority || ComplaintPriority.MEDIUM,
      tags: aiResult?.tags || [],
      keywords: aiResult?.keywords || [],
      is_escalated: aiResult?.is_escalated || false,
      escalation_reason: aiResult?.escalation_reason || undefined,
      ai_confidence_score: aiResult?.confidence_score || undefined,
      status: ComplaintStatus.SUBMITTED,
      // Simple SLA baseline: 5 working days roughly
      sla_due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    const savedComplaint = await this.complaintsRepo.save(complaint);

    if (!dto.is_anonymous && dto.email) {
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/about/complaints`;
      const htmlContent = this.mailService.getBrandedTemplate(
        `Grievance Acknowledgment: ${refNumber}`,
        `<p>Dear Stakeholder,</p><p>Your redress request has been successfully recorded in the OUK Institutional Registry.</p><p><strong>Reference ID:</strong> ${refNumber}</p><p>Please keep this Reference ID to monitor the status of your grievance.</p><p>The Office of the University Ombudsman ensures that every grievance is processed with absolute neutrality.</p>`,
        trackingUrl,
      );
      this.mailService.sendEmail(
        'complaints',
        dto.email,
        `Grievance Received - ${refNumber}`,
        htmlContent,
      );
    }

    return savedComplaint;
  }

  async trackComplaint(reference_number: string): Promise<Complaint> {
    const complaint = await this.complaintsRepo.findOne({
      where: { reference_number },
      relations: ['category', 'department', 'responses', 'assigned_to'],
      order: { responses: { created_at: 'ASC' } },
    });

    if (!complaint) throw new NotFoundException('Tracking reference not found');

    // Filter out internal administrative notes for public view
    if (complaint.responses) {
      complaint.responses = complaint.responses.filter((r) => !r.is_internal);
    }

    return complaint;
  }

  async findAllAdmin(): Promise<Complaint[]> {
    return this.complaintsRepo.find({
      relations: ['category', 'department', 'assigned_to'],
      order: { created_at: 'DESC' },
    });
  }

  async getAnalytics() {
    const all = await this.complaintsRepo.find({
      relations: ['category', 'department'],
      order: { created_at: 'ASC' },
    });

    const now = new Date();
    const total = all.length;
    const open = all.filter(
      (c) => !['Resolved', 'Closed', 'Rejected'].includes(c.status),
    ).length;
    const resolved = all.filter((c) =>
      ['Resolved', 'Closed'].includes(c.status),
    ).length;
    const escalated = all.filter((c) => c.is_escalated).length;
    const overdue = all.filter(
      (c) =>
        c.sla_due_date &&
        new Date(c.sla_due_date) < now &&
        !['Resolved', 'Closed'].includes(c.status),
    ).length;
    const critical = all.filter(
      (c) =>
        c.priority === 'Critical' && !['Resolved', 'Closed'].includes(c.status),
    ).length;

    // Average resolution time in days
    const resolvedCases = all.filter((c) => c.resolved_at && c.created_at);
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

    // By status
    const byStatus: Record<string, number> = {};
    all.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    });

    // By complaint type
    const byType: Record<string, number> = {};
    all.forEach((c) => {
      const t = c.complaint_type || 'External';
      byType[t] = (byType[t] || 0) + 1;
    });

    // By category
    const byCategory: Record<string, number> = {};
    all.forEach((c) => {
      const cat = c.category?.name || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // By sentiment
    const bySentiment: Record<string, number> = {};
    all.forEach((c) => {
      if (c.sentiment) {
        bySentiment[c.sentiment] = (bySentiment[c.sentiment] || 0) + 1;
      }
    });

    // Trend by month (last 6 months)
    const trendMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      trendMap[key] = 0;
    }
    all.forEach((c) => {
      const d = new Date(c.created_at);
      const key = d.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      if (trendMap[key] !== undefined) trendMap[key]++;
    });
    const trend = Object.entries(trendMap).map(([month, count]) => ({
      month,
      count,
    }));

    // Top tags
    const tagCounts: Record<string, number> = {};
    all.forEach((c) => {
      (c.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      summary: {
        total,
        open,
        resolved,
        escalated,
        overdue,
        critical,
        avgResolutionDays,
      },
      byStatus: Object.entries(byStatus).map(([name, value]) => ({
        name,
        value,
      })),
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      bySentiment: Object.entries(bySentiment).map(([name, value]) => ({
        name,
        value,
      })),
      trend,
      topTags,
    };
  }

  async findOneAdmin(id: string): Promise<Complaint> {
    const complaint = await this.complaintsRepo.findOne({
      where: { id },
      relations: [
        'category',
        'department',
        'assigned_to',
        'responses',
        'responses.responded_by',
        'responses.responded_by.role',
      ],
      order: { responses: { created_at: 'ASC' } },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  async updateStatus(
    id: string,
    dto: UpdateComplaintStatusDto,
  ): Promise<Complaint> {
    const complaint = await this.findOneAdmin(id);
    complaint.status = dto.status as ComplaintStatus;

    if (
      complaint.status === ComplaintStatus.RESOLVED ||
      complaint.status === ComplaintStatus.CLOSED
    ) {
      complaint.resolved_at = new Date();
    }
    if (dto.resolution) {
      complaint.resolution = dto.resolution;
    }

    const savedComplaint = await this.complaintsRepo.save(complaint);

    if (
      !complaint.is_anonymous &&
      complaint.email &&
      (dto.status === ComplaintStatus.RESOLVED ||
        dto.status === ComplaintStatus.CLOSED)
    ) {
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/about/complaints`;
      const htmlContent = this.mailService.getBrandedTemplate(
        `Case ${dto.status}: ${complaint.reference_number}`,
        `<p>Dear Stakeholder,</p><p>Your grievance (Ref: <strong>${complaint.reference_number}</strong>) has been marked as <strong>${dto.status}</strong>.</p><p><strong>Resolution Details:</strong><br/>${dto.resolution || 'Your case has been concluded.'}</p>`,
        trackingUrl,
      );
      this.mailService.sendEmail(
        'complaints',
        complaint.email,
        `Grievance ${dto.status} - ${complaint.reference_number}`,
        htmlContent,
      );
    }

    return savedComplaint;
  }

  async assignStaff(id: string, staff_id: string): Promise<Complaint> {
    const complaint = await this.findOneAdmin(id);
    const user = await this.userRepo.findOne({ where: { id: staff_id } });
    if (!user) throw new NotFoundException('User not found');

    complaint.assigned_to = user as any;

    // Automatically transition to 'In Progress' upon assignment if currently 'Submitted'
    if (
      complaint.status === ComplaintStatus.SUBMITTED ||
      complaint.status === ComplaintStatus.ACKNOWLEDGED
    ) {
      complaint.status = ComplaintStatus.IN_PROGRESS;
    }

    return this.complaintsRepo.save(complaint);
  }

  async addResponse(
    complaintId: string,
    staffId: string,
    dto: AddResponseDto,
  ): Promise<ComplaintResponse> {
    const complaint = await this.findOneAdmin(complaintId);

    if (!staffId) {
      throw new BadRequestException(
        'Identity verification failed. Cannot attribute response.',
      );
    }

    // Auto-transition to In Progress upon first professional engagement if still in initial state
    // We strictly check for is_internal !== true to ensure audit notes don't trigger transitions
    if (
      dto.is_internal !== true &&
      (complaint.status === ComplaintStatus.SUBMITTED ||
        complaint.status === ComplaintStatus.ACKNOWLEDGED)
    ) {
      complaint.status = ComplaintStatus.IN_PROGRESS;
      await this.complaintsRepo.save(complaint);
    }

    const response = this.responseRepo.create({
      message: dto.message,
      is_internal: dto.is_internal,
      complaint,
      responded_by: { id: staffId } as any,
    });

    const savedResponse = await this.responseRepo.save(response);

    if (!dto.is_internal && !complaint.is_anonymous && complaint.email) {
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/about/complaints`;
      const htmlContent = this.mailService.getBrandedTemplate(
        `New Response on Case: ${complaint.reference_number}`,
        `<p>Dear Stakeholder,</p><p>An official response has been added to your grievance (Ref: <strong>${complaint.reference_number}</strong>).</p><p><strong>Message:</strong><br/>${dto.message}</p><hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" /><div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; color: #64748b;"><p style="margin-top: 0; font-weight: bold; color: #475569;">Your Original Grievance:</p><p style="white-space: pre-wrap; margin-bottom: 0;">${complaint.description}</p></div>`,
        trackingUrl,
      );
      this.mailService.sendEmail(
        'complaints',
        complaint.email,
        `New Response - ${complaint.reference_number}`,
        htmlContent,
      );
    }

    return savedResponse;
  }

  async getCategories(type?: string): Promise<ComplaintCategory[]> {
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
    // 1. Sync Staff to Users if missing (Ensures registry is always populated)
    await this.syncStaffUsers();

    // 2. Fetch active users with role (and staff links for sync context)
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

    // 3. Operational roles only — exclude Super Admin / Admin / VC / DVC / Viewer / SDM
    return filterAssignableUsers(users).filter((user) => {
      const staffType =
        user.staff_member?.staff_type?.name?.toLowerCase() || '';
      const execType =
        user.staff_member?.executive_types?.[0]?.name?.toLowerCase() || '';
      const isExecutive =
        staffType.includes('executive') || execType.includes('executive');
      return !isExecutive;
    });
  }

  private async syncStaffUsers() {
    const staff = await this.staffRepo.find();
    const defaultPassword = await bcrypt.hash('staff123', 10);
    let linkedCount = 0;
    let createdCount = 0;

    for (const member of staff) {
      if (!member.email) continue;

      // 1. Is this staff member already linked to ANY user?
      const userLinkedToStaff = await this.userRepo.findOne({
        where: { staff_member: { id: member.id } },
        relations: ['staff_member'],
      });

      if (userLinkedToStaff) {
        continue; // Already linked, safely skip
      }

      // 2. They are NOT linked. Does a user exist with their email?
      const userByEmail = await this.userRepo.findOne({
        where: { email: member.email },
        relations: ['staff_member'],
      });

      if (userByEmail) {
        // User exists by email. Only link if they don't already have another staff profile
        if (!userByEmail.staff_member) {
          linkedCount++;
          userByEmail.staff_member = member;
          if (
            !userByEmail.role_legacy ||
            userByEmail.role_legacy === UserRole.STUDENT
          ) {
            userByEmail.role_legacy = UserRole.STAFF;
          }
          await this.userRepo.save(userByEmail);
        }
      } else {
        // 3. User does not exist, create and link
        createdCount++;
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

    if (createdCount > 0 || linkedCount > 0) {
      console.log(
        `Staff-User Sync: Created ${createdCount}, Linked ${linkedCount} existing accounts.`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoEscalateOverdue() {
    console.log('Running auto-escalation check for overdue complaints...');
    const now = new Date();

    // Find unassigned complaints older than 24 hours
    const unassignedCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const unassigned = await this.complaintsRepo.find({
      where: {
        assigned_to: null as any,
        created_at: LessThan(unassignedCutoff),
        status: Not(In(['Resolved', 'Closed', 'Rejected'])),
      },
    });

    for (const c of unassigned) {
      if (!c.is_escalated) {
        c.is_escalated = true;
        c.escalation_reason = 'Auto-escalated: Not assigned within 24 hours';
        await this.complaintsRepo.save(c);
      }
    }

    // Find unresolved complaints past their SLA due date (or older than 7 days)
    const overdueCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const overdue = await this.complaintsRepo.find({
      where: [
        {
          sla_due_date: LessThan(now),
          status: Not(In(['Resolved', 'Closed', 'Rejected'])),
        },
        {
          created_at: LessThan(overdueCutoff),
          status: Not(In(['Resolved', 'Closed', 'Rejected'])),
        },
      ],
    });

    for (const c of overdue) {
      if (!c.is_escalated) {
        c.is_escalated = true;
        c.escalation_reason =
          'Auto-escalated: Not resolved within SLA timeframe (7 days)';
        await this.complaintsRepo.save(c);
      }
    }

    console.log(
      `Escalation complete: ${unassigned.length} unassigned, ${overdue.length} overdue.`,
    );
  }

  async suggestResponse(id: string): Promise<{ suggestion: string }> {
    const complaint = await this.findOneAdmin(id);
    const suggestion =
      await this.aiService.generateSuggestedResponse(complaint);
    return { suggestion };
  }
}
