import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, IsNull, LessThanOrEqual, Or } from 'typeorm';
import {
  ServiceCharterItem,
  ServiceStatus,
} from './entities/service-charter-item.entity';
import {
  ServiceCharterVideo,
  VideoStatus,
} from './entities/service-charter-video.entity';
import {
  ServiceCharterDocument,
  DocumentStatus,
} from './entities/service-charter-document.entity';
import { ServiceCharterFaq } from './entities/service-charter-faq.entity';
import { ServiceCharterNotice } from './entities/service-charter-notice.entity';
import { ServiceCharterMetric } from './entities/service-charter-metric.entity';

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class ServiceCharterService {
  constructor(
    @InjectRepository(ServiceCharterItem)
    private itemRepo: Repository<ServiceCharterItem>,
    @InjectRepository(ServiceCharterVideo)
    private videoRepo: Repository<ServiceCharterVideo>,
    @InjectRepository(ServiceCharterDocument)
    private documentRepo: Repository<ServiceCharterDocument>,
    @InjectRepository(ServiceCharterFaq)
    private faqRepo: Repository<ServiceCharterFaq>,
    @InjectRepository(ServiceCharterNotice)
    private noticeRepo: Repository<ServiceCharterNotice>,
    @InjectRepository(ServiceCharterMetric)
    private metricRepo: Repository<ServiceCharterMetric>,
  ) {}

  // ─── ITEMS ────────────────────────────────────────────────────────────────

  async findAllItems(opts: {
    search?: string;
    category?: string;
    isAdmin?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ServiceCharterItem>> {
    const { search, category, isAdmin = false, page = 1, limit = 20 } = opts;
    const skip = (page - 1) * limit;

    const qb = this.itemRepo.createQueryBuilder('item');
    if (!isAdmin) qb.andWhere('item.status = :s', { s: ServiceStatus.ACTIVE });
    if (category && category !== 'All')
      qb.andWhere('item.category = :cat', { cat: category });
    if (search) {
      qb.andWhere(
        new Brackets((q) =>
          q
            .where('item.service ILIKE :se', { se: `%${search}%` })
            .orWhere('item.unit ILIKE :se', { se: `%${search}%` })
            .orWhere('item.category ILIKE :se', { se: `%${search}%` }),
        ),
      );
    }

    const [data, total] = await qb
      .orderBy('item.display_order', 'ASC')
      .addOrderBy('item.category', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneItem(id: string) {
    const item = await this.itemRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Service item not found');
    return item;
  }

  async createItem(data: Partial<ServiceCharterItem>) {
    return this.itemRepo.save(this.itemRepo.create(data));
  }

  async updateItem(id: string, data: Partial<ServiceCharterItem>) {
    const item = await this.findOneItem(id);
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async removeItem(id: string) {
    const item = await this.findOneItem(id);
    await this.itemRepo.softRemove(item);
    return { message: 'Service item removed' };
  }

  async getItemCategories(): Promise<string[]> {
    const rows = await this.itemRepo
      .createQueryBuilder('item')
      .select('DISTINCT item.category', 'category')
      .where('item.status = :s', { s: ServiceStatus.ACTIVE })
      .orderBy('item.category', 'ASC')
      .getRawMany();
    return rows.map((r) => r.category);
  }

  // ─── VIDEOS ───────────────────────────────────────────────────────────────

  async findAllVideos(opts: {
    search?: string;
    category?: string;
    isAdmin?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ServiceCharterVideo>> {
    const { search, category, isAdmin = false, page = 1, limit = 12 } = opts;
    const skip = (page - 1) * limit;

    const qb = this.videoRepo.createQueryBuilder('video');
    if (!isAdmin)
      qb.andWhere('video.status = :s', { s: VideoStatus.PUBLISHED });
    if (category && category !== 'All')
      qb.andWhere('video.category = :cat', { cat: category });
    if (search) qb.andWhere('video.title ILIKE :se', { se: `%${search}%` });

    const [data, total] = await qb
      .orderBy('video.display_order', 'ASC')
      .addOrderBy('video.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneVideo(id: string) {
    const v = await this.videoRepo.findOneBy({ id });
    if (!v) throw new NotFoundException('Video not found');
    return v;
  }

  async createVideo(data: Partial<ServiceCharterVideo>) {
    return this.videoRepo.save(this.videoRepo.create(data));
  }

  async updateVideo(id: string, data: Partial<ServiceCharterVideo>) {
    const v = await this.findOneVideo(id);
    Object.assign(v, data);
    return this.videoRepo.save(v);
  }

  async removeVideo(id: string) {
    const v = await this.findOneVideo(id);
    await this.videoRepo.softRemove(v);
    return { message: 'Video removed' };
  }

  async incrementVideoViews(id: string) {
    await this.videoRepo.increment({ id }, 'view_count', 1);
    return { ok: true };
  }

  async getVideoCategories(): Promise<string[]> {
    const rows = await this.videoRepo
      .createQueryBuilder('video')
      .select('DISTINCT video.category', 'category')
      .where('video.status = :s', { s: VideoStatus.PUBLISHED })
      .orderBy('video.category', 'ASC')
      .getRawMany();
    return rows.map((r) => r.category);
  }

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  async findAllDocuments(opts: {
    search?: string;
    category?: string;
    file_type?: string;
    isAdmin?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ServiceCharterDocument>> {
    const {
      search,
      category,
      file_type,
      isAdmin = false,
      page = 1,
      limit = 12,
    } = opts;
    const skip = (page - 1) * limit;

    const qb = this.documentRepo.createQueryBuilder('doc');
    if (!isAdmin)
      qb.andWhere('doc.status = :s', { s: DocumentStatus.PUBLISHED });
    if (category && category !== 'All')
      qb.andWhere('doc.category = :cat', { cat: category });
    if (file_type) qb.andWhere('doc.file_type = :ft', { ft: file_type });
    if (search) {
      qb.andWhere(
        new Brackets((q) =>
          q
            .where('doc.title ILIKE :se', { se: `%${search}%` })
            .orWhere('doc.category ILIKE :se', { se: `%${search}%` }),
        ),
      );
    }

    const [data, total] = await qb
      .orderBy('doc.display_order', 'ASC')
      .addOrderBy('doc.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneDocument(id: string) {
    const doc = await this.documentRepo.findOneBy({ id });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async createDocument(data: Partial<ServiceCharterDocument>) {
    return this.documentRepo.save(this.documentRepo.create(data));
  }

  async updateDocument(id: string, data: Partial<ServiceCharterDocument>) {
    const doc = await this.findOneDocument(id);
    Object.assign(doc, data);
    return this.documentRepo.save(doc);
  }

  async removeDocument(id: string) {
    const doc = await this.findOneDocument(id);
    await this.documentRepo.softRemove(doc);
    return { message: 'Document removed' };
  }

  async incrementDownloadCount(id: string) {
    await this.documentRepo.increment({ id }, 'download_count', 1);
    return { ok: true };
  }

  // ─── FAQs ─────────────────────────────────────────────────────────────────

  async findAllFaqs(opts: {
    search?: string;
    category?: string;
    isAdmin?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ServiceCharterFaq>> {
    const { search, category, isAdmin = false, page = 1, limit = 15 } = opts;
    const skip = (page - 1) * limit;

    const qb = this.faqRepo.createQueryBuilder('faq');
    if (!isAdmin) qb.andWhere('faq.is_active = true');
    if (category && category !== 'All')
      qb.andWhere('faq.category = :cat', { cat: category });
    if (search) {
      qb.andWhere(
        new Brackets((q) =>
          q
            .where('faq.question ILIKE :se', { se: `%${search}%` })
            .orWhere('faq.answer ILIKE :se', { se: `%${search}%` }),
        ),
      );
    }

    const [data, total] = await qb
      .orderBy('faq.display_order', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneFaq(id: string) {
    const faq = await this.faqRepo.findOneBy({ id });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async createFaq(data: Partial<ServiceCharterFaq>) {
    return this.faqRepo.save(this.faqRepo.create(data));
  }

  async updateFaq(id: string, data: Partial<ServiceCharterFaq>) {
    const faq = await this.findOneFaq(id);
    Object.assign(faq, data);
    return this.faqRepo.save(faq);
  }

  async removeFaq(id: string) {
    const faq = await this.findOneFaq(id);
    await this.faqRepo.softRemove(faq);
    return { message: 'FAQ removed' };
  }

  async incrementFaqViews(id: string) {
    await this.faqRepo.increment({ id }, 'view_count', 1);
    return { ok: true };
  }

  async getFaqCategories(): Promise<string[]> {
    const rows = await this.faqRepo
      .createQueryBuilder('faq')
      .select('DISTINCT faq.category', 'category')
      .where('faq.is_active = true')
      .orderBy('faq.category', 'ASC')
      .getRawMany();
    return rows.map((r) => r.category);
  }

  // ─── NOTICES ──────────────────────────────────────────────────────────────

  async findActiveNotices(): Promise<ServiceCharterNotice[]> {
    const now = new Date();
    return this.noticeRepo.find({
      where: [
        { is_active: true, expires_at: IsNull() },
        { is_active: true, expires_at: LessThanOrEqual(now) as any },
      ],
      order: { display_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findAllNotices(
    opts: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<ServiceCharterNotice>> {
    const { page = 1, limit = 10 } = opts;
    const [data, total] = await this.noticeRepo.findAndCount({
      order: { display_order: 'ASC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneNotice(id: string) {
    const n = await this.noticeRepo.findOneBy({ id });
    if (!n) throw new NotFoundException('Notice not found');
    return n;
  }

  async createNotice(data: Partial<ServiceCharterNotice>) {
    return this.noticeRepo.save(this.noticeRepo.create(data));
  }

  async updateNotice(id: string, data: Partial<ServiceCharterNotice>) {
    const n = await this.findOneNotice(id);
    Object.assign(n, data);
    return this.noticeRepo.save(n);
  }

  async removeNotice(id: string) {
    const n = await this.findOneNotice(id);
    await this.noticeRepo.remove(n);
    return { message: 'Notice removed' };
  }

  // ─── METRICS ──────────────────────────────────────────────────────────────

  async findAllMetrics(): Promise<ServiceCharterMetric[]> {
    return this.metricRepo.find({ order: { display_order: 'ASC' } });
  }

  async findOneMetric(id: string) {
    const m = await this.metricRepo.findOneBy({ id });
    if (!m) throw new NotFoundException('Metric not found');
    return m;
  }

  async upsertMetric(key: string, data: Partial<ServiceCharterMetric>) {
    let m = await this.metricRepo.findOneBy({ key });
    if (!m) m = this.metricRepo.create({ key });
    Object.assign(m, data);
    return this.metricRepo.save(m);
  }

  async updateMetric(id: string, data: Partial<ServiceCharterMetric>) {
    const m = await this.findOneMetric(id);
    Object.assign(m, data);
    return this.metricRepo.save(m);
  }

  // ─── SEED ─────────────────────────────────────────────────────────────────

  async seed() {
    // Seed metrics
    const metrics = [
      {
        key: 'avg_response_time',
        label: 'Avg. Response Time',
        value: '4.2 hrs',
        sub_label: 'Across all services',
        icon: 'Clock',
        display_order: 0,
      },
      {
        key: 'complaints_resolved',
        label: 'Complaints Resolved',
        value: '98.4%',
        sub_label: 'This quarter',
        icon: 'CheckCircle',
        display_order: 1,
      },
      {
        key: 'requests_processed',
        label: 'Requests Processed',
        value: '12,847',
        sub_label: 'This year',
        icon: 'BarChart3',
        display_order: 2,
      },
      {
        key: 'satisfaction_rate',
        label: 'Satisfaction Rate',
        value: '91%',
        sub_label: 'Based on user surveys',
        icon: 'Star',
        display_order: 3,
      },
    ];
    for (const m of metrics) await this.upsertMetric(m.key, m);

    // Seed service items
    const existingItems = await this.itemRepo.count();
    if (existingItems === 0) {
      const items = [
        {
          category: 'Admissions',
          service: 'Admission Enquiries',
          timeline: 'Within 24 Hours',
          unit: 'Admissions Office',
          email: 'admissions@ouk.ac.ke',
          phone: '+254 (20) 000-0000',
          docs: ['National ID', 'KCSE Certificate'],
          steps: [
            'Submit inquiry via email or portal',
            'Receive automated acknowledgement',
            'Officer reviews and responds within 24 hours',
          ],
          faqs: [
            'Am I eligible for this programme?',
            'What documents do I need for application?',
          ],
          display_order: 0,
        },
        {
          category: 'Admissions',
          service: 'Application Processing',
          timeline: '5 Working Days',
          unit: 'Admissions Office',
          email: 'admissions@ouk.ac.ke',
          phone: '+254 (20) 000-0000',
          docs: [
            'Certified transcripts',
            'National ID',
            'Application fee receipt',
          ],
          steps: [
            'Complete online application',
            'Upload all required documents',
            'Pay application fee',
            'Await processing notification',
          ],
          faqs: ['Can I check my application status online?'],
          display_order: 1,
        },
        {
          category: 'Academic',
          service: 'Transcript Requests',
          timeline: '7 Working Days',
          unit: 'Examinations & Records Office',
          email: 'records@ouk.ac.ke',
          phone: '+254 (20) 000-0001',
          docs: ['Student ID', 'Payment receipt (KES 1,000)', 'Request form'],
          steps: [
            'Download and fill transcript request form',
            'Make payment via MPESA',
            'Submit form with payment confirmation',
            'Collect or receive via courier',
          ],
          faqs: ['Can transcripts be sent directly to another institution?'],
          display_order: 2,
        },
        {
          category: 'Academic',
          service: 'Graduation Clearance',
          timeline: '10 Working Days',
          unit: 'Dean of Students & Examinations',
          email: 'graduation@ouk.ac.ke',
          phone: '+254 (20) 000-0002',
          docs: ['Clearance form', 'Library clearance', 'Finance clearance'],
          steps: [
            'Obtain clearance form from Dean of Students',
            'Complete departmental clearances',
            'Submit all signed forms to Exams Office',
            'Await graduation list confirmation',
          ],
          faqs: ['What happens if I have outstanding fees?'],
          display_order: 3,
        },
        {
          category: 'Student',
          service: 'Complaint Resolution',
          timeline: '5 Working Days',
          unit: 'Student Affairs Office',
          email: 'studentaffairs@ouk.ac.ke',
          phone: '+254 (20) 000-0003',
          docs: ['Written complaint (signed)', 'Supporting evidence'],
          steps: [
            'Lodge complaint via portal or in writing',
            'Receive acknowledgement within 24 hours',
            'Investigation and mediation',
            'Resolution communicated',
          ],
          faqs: ['Are complaints handled confidentially?'],
          display_order: 4,
        },
        {
          category: 'ICT',
          service: 'Password Reset / Account Unlock',
          timeline: '2 Hours',
          unit: 'ICT Helpdesk',
          email: 'ict@ouk.ac.ke',
          phone: '+254 (20) 000-0004',
          docs: ['Student ID', 'Employee ID / Student Number'],
          steps: [
            'Contact ICT Helpdesk via email or phone',
            'Verify identity',
            'Account reset processed within 2 hours',
          ],
          faqs: ['What do I do outside working hours?'],
          display_order: 5,
        },
        {
          category: 'Finance',
          service: 'Fee Statement Request',
          timeline: '24 Hours',
          unit: 'Finance Office',
          email: 'finance@ouk.ac.ke',
          phone: '+254 (20) 000-0006',
          docs: ['Student ID', 'Registration number'],
          steps: [
            'Submit request via email or portal',
            'Finance officer generates statement',
            'Receive via email within 24 hours',
          ],
          faqs: ['Is the statement stamped and signed?'],
          display_order: 6,
        },
        {
          category: 'Library',
          service: 'Inter-Library Loan Request',
          timeline: '5 Working Days',
          unit: 'Library Services',
          email: 'library@ouk.ac.ke',
          phone: '+254 (20) 000-0005',
          docs: ['Valid student/staff ID', 'ILL request form'],
          steps: [
            'Identify required resource',
            'Complete ILL request form',
            'Library locates resource',
            'Notification on availability',
          ],
          faqs: ['Is there a cost for ILL?'],
          display_order: 7,
        },
        {
          category: 'Alumni',
          service: 'Alumni Certificate Replacement',
          timeline: '10 Working Days',
          unit: 'Alumni Affairs',
          email: 'alumni@ouk.ac.ke',
          phone: '+254 (20) 000-0008',
          docs: [
            'Police abstract',
            'National ID',
            'Payment receipt (KES 2,000)',
          ],
          steps: [
            'Report loss to police',
            'Obtain and submit police abstract',
            'Pay replacement fee',
            'Certificate produced and ready',
          ],
          faqs: ['Can the certificate be sent by courier?'],
          display_order: 8,
        },
        {
          category: 'Human Resource',
          service: 'Letter of Employment Verification',
          timeline: '3 Working Days',
          unit: 'Human Resources',
          email: 'hr@ouk.ac.ke',
          phone: '+254 (20) 000-0009',
          docs: ['Official written request', 'Staff ID'],
          steps: [
            'Submit written request to HR office',
            'HR verifies employment status',
            'Letter generated, signed, and stamped',
            'Collect or receive via email',
          ],
          faqs: ['Is the letter sent directly to third parties?'],
          display_order: 9,
        },
      ];
      for (const item of items)
        await this.itemRepo.save(this.itemRepo.create(item));
    }

    // Seed FAQs
    const existingFaqs = await this.faqRepo.count();
    if (existingFaqs === 0) {
      const faqs = [
        {
          question: 'How do I apply for a programme at OUK?',
          answer:
            'Visit the OUK website, click "Apply Now", complete the online form and upload required documents. The admissions office will contact you within 5 working days.',
          category: 'Admissions',
          display_order: 0,
        },
        {
          question: 'How do I request my academic transcripts?',
          answer:
            'Submit a transcript request form with proof of payment (KES 1,000 per copy) to the Examinations & Records Office. Allow 7 working days.',
          category: 'Academic',
          display_order: 1,
        },
        {
          question: 'How long does graduation clearance take?',
          answer:
            'Approximately 10 working days after all departmental clearances (Finance, Library, etc.) are completed.',
          category: 'Academic',
          display_order: 2,
        },
        {
          question: 'What should I do if my ICT account is locked?',
          answer:
            'Contact the ICT Helpdesk at ict@ouk.ac.ke with your student/staff ID. Account resets are completed within 2 hours during business hours.',
          category: 'ICT',
          display_order: 3,
        },
        {
          question: 'How do I lodge a formal complaint?',
          answer:
            'Submit a signed written complaint to the Student Affairs Office or via the online complaints portal. You will receive acknowledgement within 24 hours.',
          category: 'Student',
          display_order: 4,
        },
        {
          question: 'Can I get my fee statement online?',
          answer:
            'Yes. Submit a request to the Finance Office at finance@ouk.ac.ke with your student ID. A stamped and signed fee statement will be sent within 24 hours.',
          category: 'Finance',
          display_order: 5,
        },
        {
          question: 'How do I access the library digital resources?',
          answer:
            'Use your student portal credentials to log into the OUK e-Library. For inter-library loans, contact the Library Services directly.',
          category: 'Library',
          display_order: 6,
        },
        {
          question: 'What is the process for alumni certificate replacement?',
          answer:
            'Report the loss to police, obtain an abstract, then submit with your national ID and payment receipt (KES 2,000) to the Alumni Affairs Office.',
          category: 'Alumni',
          display_order: 7,
        },
      ];
      for (const faq of faqs) await this.faqRepo.save(this.faqRepo.create(faq));
    }

    // Seed notices
    const existingNotices = await this.noticeRepo.count();
    if (existingNotices === 0) {
      await this.noticeRepo.save(
        this.noticeRepo.create({
          title: 'Extended Service Hours — Examination Period',
          body: 'All offices will operate 7:30 AM – 5:30 PM during the June–July 2024 examination period.',
          type: 'info' as any,
          display_order: 0,
        }),
      );
      await this.noticeRepo.save(
        this.noticeRepo.create({
          title: 'New: WhatsApp Service Helpdesk Launched',
          body: 'Students can now access quick support via WhatsApp at +254 700 000 000 between 8 AM – 5 PM on weekdays.',
          type: 'success' as any,
          display_order: 1,
        }),
      );
    }

    // Seed documents
    const existingDocs = await this.documentRepo.count();
    if (existingDocs === 0) {
      const docs = [
        {
          title: 'OUK Service Charter 2024/2025',
          file_type: 'PDF',
          file_size: '2.4 MB',
          category: 'Charter',
          version: 'v4.0',
          display_order: 0,
        },
        {
          title: 'Student Service Request Form',
          file_type: 'DOCX',
          file_size: '156 KB',
          category: 'Forms',
          version: 'v2.1',
          display_order: 1,
        },
        {
          title: 'Transcript Request Form',
          file_type: 'PDF',
          file_size: '89 KB',
          category: 'Forms',
          version: 'v1.3',
          display_order: 2,
        },
        {
          title: 'Complaint & Feedback Form',
          file_type: 'PDF',
          file_size: '120 KB',
          category: 'Forms',
          version: 'v2.0',
          display_order: 3,
        },
        {
          title: 'Customer Service Standards Manual',
          file_type: 'PDF',
          file_size: '4.1 MB',
          category: 'Manuals',
          version: 'v3.2',
          display_order: 4,
        },
        {
          title: 'Academic Calendar & Service Schedule',
          file_type: 'XLSX',
          file_size: '340 KB',
          category: 'References',
          version: 'v1.0',
          display_order: 5,
        },
      ];
      for (const doc of docs)
        await this.documentRepo.save(this.documentRepo.create(doc));
    }

    return { message: 'Service Charter seeded successfully' };
  }
}
