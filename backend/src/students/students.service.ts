import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual } from 'typeorm';
import { Student } from './entities/student.entity';
import { AuthService } from '../auth/auth.service';
import { FinanceService } from '../finance/finance.service';
import { MailService } from '../mail/mail.service';
import { Program } from '../programs/entities/program.entity';
import { RegisterStudentDto } from './dto/register-student.dto';

import { StudentAnnouncement } from './entities/student-announcement.entity';
import { StudentSupportService } from './entities/student-support-service.entity';
import { StudentClub } from './entities/student-club.entity';
import { StudentEvent } from './entities/student-event.entity';
import { StudentSuccessStory } from './entities/student-success-story.entity';
import { StudentQuickAction } from './entities/student-quick-action.entity';
import { StudentResource } from './entities/student-resource.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(StudentAnnouncement)
    private readonly announcementRepository: Repository<StudentAnnouncement>,
    @InjectRepository(StudentSupportService)
    private readonly supportServiceRepository: Repository<StudentSupportService>,
    @InjectRepository(StudentClub)
    private readonly clubRepository: Repository<StudentClub>,
    @InjectRepository(StudentEvent)
    private readonly eventRepository: Repository<StudentEvent>,
    @InjectRepository(StudentSuccessStory)
    private readonly successStoryRepository: Repository<StudentSuccessStory>,
    @InjectRepository(StudentQuickAction)
    private readonly quickActionRepository: Repository<StudentQuickAction>,
    @InjectRepository(StudentResource)
    private readonly resourceRepository: Repository<StudentResource>,
    private readonly authService: AuthService,
    private readonly financeService: FinanceService,
    private readonly mailService: MailService,
  ) {}

  // ... existing methods ...

  getPublicAnnouncements() {
    return this.announcementRepository.find({
      where: [
        { is_active: true, published_at: IsNull() },
        { is_active: true, published_at: LessThanOrEqual(new Date()) },
      ],
      order: { created_at: 'DESC' },
    });
  }

  getAllAnnouncements() {
    return this.announcementRepository.find({ order: { created_at: 'DESC' } });
  }

  getSupportServices() {
    return this.supportServiceRepository.find();
  }

  getClubs() {
    return this.clubRepository.find();
  }

  getEvents(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    return this.eventRepository
      .find({ order: { date: 'ASC' } })
      .then((events) => events.map((e) => this.localizeEvent(e, locale)));
  }

  private localizeEvent(event: StudentEvent, locale: AppLocale) {
    return {
      ...event,
      title: pickLocalized(locale, event.title, event.title_sw),
      description:
        pickLocalized(locale, event.description, event.description_sw) ||
        event.description,
    };
  }

  getSuccessStories() {
    return this.successStoryRepository.find({
      relations: ['student', 'student.current_program'],
      order: { created_at: 'DESC' },
    });
  }

  async enrollStudent(dto: RegisterStudentDto) {
    // 1. Double check enrolment
    const existing = await this.findByRegNumber(dto.email);
    if (existing) throw new ConflictException('Student already enrolled');

    // 2. Create User
    const { user } = await this.authService.register({
      email: dto.email,
      fullName: dto.fullName,
      role: 'student',
    });

    // 3. Find Program
    const program = await this.programRepository.findOne({
      where: { id: dto.programId },
    });
    if (!program) throw new NotFoundException('Academic program not found');

    // 4. Generate Reg Number (Simplified)
    const count = await this.studentRepository.count();
    const regNumber = `OUK/${new Date().getFullYear()}/${(count + 1).toString().padStart(4, '0')}`;

    // 5. Create Student
    const student = this.studentRepository.create({
      user,
      current_program: program,
      registration_number: regNumber,
      phone_number: dto.phoneNumber,
      date_of_birth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
    });

    const savedStudent = await this.studentRepository.save(student);

    // 6. Generate Initial Invoice
    await this.financeService.createInvoice(
      savedStudent,
      `Admission & Tuition Fees - ${program.title}`,
      45000, // Standard first semester fee
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
    );

    return savedStudent;
  }

  findAll() {
    return this.studentRepository.find({
      relations: ['user', 'current_program'],
    });
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'current_program'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByRegNumber(regNumber: string) {
    return this.studentRepository.findOne({
      where: { registration_number: regNumber },
      relations: ['user', 'current_program'],
    });
  }

  // --- MANAGEMENT METHODS ---

  async createAnnouncement(data: any) {
    return this.announcementRepository.save(
      this.announcementRepository.create(data),
    );
  }

  async updateAnnouncement(id: string, data: any) {
    await this.announcementRepository.update(id, data);
    return this.announcementRepository.findOneBy({ id });
  }

  async deleteAnnouncement(id: string) {
    return this.announcementRepository.delete(id);
  }

  async createSupportService(data: any) {
    return this.supportServiceRepository.save(
      this.supportServiceRepository.create(data),
    );
  }

  async updateSupportService(id: string, data: any) {
    await this.supportServiceRepository.update(id, data);
    return this.supportServiceRepository.findOneBy({ id });
  }

  async deleteSupportService(id: string) {
    return this.supportServiceRepository.delete(id);
  }

  async createClub(data: any) {
    return this.clubRepository.save(this.clubRepository.create(data));
  }

  async updateClub(id: string, data: any) {
    await this.clubRepository.update(id, data);
    return this.clubRepository.findOneBy({ id });
  }

  async deleteClub(id: string) {
    return this.clubRepository.delete(id);
  }

  async joinClub(
    id: string,
    joinData: {
      studentName: string;
      studentId: string;
      email: string;
      message: string;
    },
  ) {
    const club = await this.clubRepository.findOne({ where: { id } });
    if (!club) throw new NotFoundException('Club not found');

    if (club.leader_email) {
      const body = `
        <p>Dear <strong>${club.leader_name || 'Club Leader'}</strong>,</p>
        <p>A student has submitted a request to join <strong>${club.name}</strong>. Please find their details below:</p>

        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; width: 40%;">Full Name</td>
            <td style="padding: 10px 8px; color: #1e293b; font-weight: 600;">${joinData.studentName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Registration No.</td>
            <td style="padding: 10px 8px; color: #1e293b; font-weight: 600;">${joinData.studentId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Contact Email</td>
            <td style="padding: 10px 8px;"><a href="mailto:${joinData.email}" style="color: #ff7f50; font-weight: 600;">${joinData.email}</a></td>
          </tr>
        </table>

        <p style="margin-top: 16px; color: #64748b; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Motivation / Message</p>
        <blockquote style="border-left: 4px solid #ff7f50; padding: 12px 16px; background: #fff7f5; color: #475569; margin: 8px 0; font-style: italic;">
          ${joinData.message || 'No message provided.'}
        </blockquote>

        <p style="margin-top: 24px;">To respond, please reply directly to <a href="mailto:${joinData.email}" style="color: #ff7f50;">${joinData.email}</a>.</p>
      `;

      const htmlContent = this.mailService.getBrandedTemplate(
        `New Club Join Request — ${club.name}`,
        body,
      );

      await this.mailService.sendEmail(
        null,
        club.leader_email,
        `New Join Request for ${club.name}`,
        htmlContent,
      );
      return {
        success: true,
        message: 'Join request sent to leader successfully',
      };
    } else {
      return {
        success: false,
        message:
          'This club does not have an active leader email assigned. Please contact the administration.',
      };
    }
  }

  async createEvent(data: any) {
    return this.eventRepository.save(this.eventRepository.create(data));
  }

  async updateEvent(id: string, data: any) {
    await this.eventRepository.update(id, data);
    return this.eventRepository.findOneBy({ id });
  }

  async deleteEvent(id: string) {
    return this.eventRepository.delete(id);
  }

  // --- QUICK ACTIONS ---
  getQuickActions() {
    return this.quickActionRepository.find({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async createQuickAction(data: any) {
    return this.quickActionRepository.save(
      this.quickActionRepository.create(data),
    );
  }

  async updateQuickAction(id: string, data: any) {
    await this.quickActionRepository.update(id, data);
    return this.quickActionRepository.findOneBy({ id });
  }

  async deleteQuickAction(id: string) {
    return this.quickActionRepository.delete(id);
  }

  // --- RESOURCES ---
  getResources() {
    return this.resourceRepository.find({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async createResource(data: any) {
    return this.resourceRepository.save(this.resourceRepository.create(data));
  }

  async updateResource(id: string, data: any) {
    await this.resourceRepository.update(id, data);
    return this.resourceRepository.findOneBy({ id });
  }

  async deleteResource(id: string) {
    return this.resourceRepository.delete(id);
  }
}
