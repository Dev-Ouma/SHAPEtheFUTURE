import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAdvisorService } from './ai-advisor.service';
import { KnowledgeDocument } from './entities/knowledge-document.entity';

// DB entities to ingest
import { Program } from '../programs/entities/program.entity';
import { News } from '../news/entities/news.entity';
import { Faq } from '../faqs/entities/faq.entity';
import { ChatIntelligence } from '../chat/entities/chat-intelligence.entity';
import { ProgrammeFee } from '../fee-structures/entities/programme-fee.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Scholarship } from '../finance/entities/scholarship.entity';
import {
  Download,
  DownloadStatus,
  AccessLevel,
} from '../downloads/entities/download.entity';
import {
  ShortCourse,
  ShortCourseStatus,
} from '../short-courses/entities/short-course.entity';
import { ServiceCharterFaq } from '../service-charter/entities/service-charter-faq.entity';
import {
  ServiceCharterItem,
  ServiceStatus,
} from '../service-charter/entities/service-charter-item.entity';
import { ComplaintCategory } from '../complaints/entities/complaint-category.entity';
import { AlumniStory } from '../alumni/entities/alumni-story.entity';
import { Publication } from '../research/entities/publication.entity';

export interface SyncResult {
  success: boolean;
  type: string;
  synced?: number;
  error?: string;
}

@Injectable()
export class KnowledgeIngestionService {
  private readonly logger = new Logger(KnowledgeIngestionService.name);

  constructor(
    private readonly aiService: AiAdvisorService,
    @InjectRepository(KnowledgeDocument)
    private readonly knowledgeRepository: Repository<KnowledgeDocument>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    @InjectRepository(ChatIntelligence)
    private readonly chatIntelligenceRepository: Repository<ChatIntelligence>,
    @InjectRepository(ProgrammeFee)
    private readonly programmeFeeRepository: Repository<ProgrammeFee>,
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
    @InjectRepository(Scholarship)
    private readonly scholarshipRepository: Repository<Scholarship>,
    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
    @InjectRepository(ShortCourse)
    private readonly shortCourseRepository: Repository<ShortCourse>,
    @InjectRepository(ServiceCharterFaq)
    private readonly serviceCharterFaqRepository: Repository<ServiceCharterFaq>,
    @InjectRepository(ServiceCharterItem)
    private readonly serviceCharterItemRepository: Repository<ServiceCharterItem>,
    @InjectRepository(ComplaintCategory)
    private readonly complaintCategoryRepository: Repository<ComplaintCategory>,
    @InjectRepository(AlumniStory)
    private readonly alumniStoryRepository: Repository<AlumniStory>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
  ) {}

  /** Split a large text into semantic chunks for better vector retrieval */
  private chunkText(text: string, maxChars: number = 1800): string[] {
    if (!text || text.trim().length === 0) return [];
    const paragraphs = text
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 10);
    const chunks: string[] = [];
    let current = '';

    for (const para of paragraphs) {
      if (current.length + para.length > maxChars) {
        if (current.trim()) chunks.push(current.trim());
        current = para;
      } else {
        current += (current ? '\n\n' : '') + para;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    // Ensure minimum chunks — split long single chunks by sentence
    if (chunks.length === 0 && text.length > maxChars) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let c = '';
      for (const s of sentences) {
        if (c.length + s.length > maxChars) {
          if (c.trim()) chunks.push(c.trim());
          c = s;
        } else {
          c += ' ' + s;
        }
      }
      if (c.trim()) chunks.push(c.trim());
    }

    return chunks.length > 0 ? chunks : [text.slice(0, maxChars)];
  }

  /** Remove all existing knowledge chunks for a given source to prevent duplicates */
  private async deleteExistingChunks(
    sourceId: string,
    type: string,
  ): Promise<void> {
    await this.knowledgeRepository
      .createQueryBuilder()
      .delete()
      .where("metadata->>'sourceId' = :id", { id: sourceId })
      .andWhere("metadata->>'type' = :type", { type })
      .execute();
  }

  // ═══════════════════════════════════════════════════════════
  // LAYER 1 SOURCES — Admin-curated knowledge (highest weight)
  // ═══════════════════════════════════════════════════════════

  /** Sync admin-curated ChatIntelligence FAQs (Bot Training Center entries) */
  async syncChatIntelligence(): Promise<SyncResult> {
    this.logger.log('Syncing ChatIntelligence to vector DB...');
    const items = await this.chatIntelligenceRepository.find({
      where: { is_active: true },
    });
    let count = 0;

    for (const item of items) {
      await this.deleteExistingChunks(item.id, 'chat_intelligence');
      const text = `Training FAQ: ${item.question}\n\nAnswer: ${item.answer}`;
      await this.aiService.ingestKnowledge(text, {
        sourceId: item.id,
        type: 'chat_intelligence',
        title: item.question,
        category: item.category || 'general',
        url: item.metadata?.link || '/faqs',
        priority: 'high',
      });
      count++;
    }

    this.logger.log(`Synced ${count} ChatIntelligence records.`);
    return { success: true, type: 'chat_intelligence', synced: count };
  }

  /** Sync official FAQs from the faqs table */
  async syncFaqs(): Promise<SyncResult> {
    this.logger.log('Syncing FAQs to vector DB...');
    const faqs = await this.faqRepository.find({ where: { is_active: true } });
    let count = 0;

    for (const faq of faqs) {
      await this.deleteExistingChunks(faq.id, 'faq');
      const text = `FAQ — ${faq.category?.toUpperCase() || 'GENERAL'}\n\nQuestion: ${faq.question}\n\nAnswer: ${faq.answer}`;
      await this.aiService.ingestKnowledge(text, {
        sourceId: faq.id,
        type: 'faq',
        title: faq.question,
        category: faq.category,
        url: `/faqs`,
        priority: 'high',
      });
      count++;
    }

    this.logger.log(`Synced ${count} FAQs.`);
    return { success: true, type: 'faqs', synced: count };
  }

  // ═══════════════════════════════════════════════════════════
  // LAYER 2 SOURCES — Institutional Knowledge Engine
  // ═══════════════════════════════════════════════════════════

  /** Sync all active degree/diploma programmes */
  async syncProgrammes(): Promise<SyncResult> {
    this.logger.log('Syncing Programmes to vector DB...');
    const programmes = await this.programRepository.find({
      relations: ['school'],
    });
    let count = 0;

    for (const prog of programmes) {
      await this.deleteExistingChunks(prog.id, 'programme');

      const fullText = [
        `Programme: ${prog.title}`,
        `School: ${prog.school?.name || 'N/A'}`,
        `Level: ${prog.level || 'N/A'}`,
        `Duration: ${prog.duration || 'N/A'}`,
        `Mode of Delivery: ${prog.mode_of_delivery || 'N/A'}`,
        '',
        'Overview:',
        prog.overview || '',
        '',
        'Entry Requirements:',
        prog.entry_requirements || '',
        '',
        'Career Opportunities:',
        prog.careers || '',
      ]
        .join('\n')
        .trim();

      const chunks = this.chunkText(fullText);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: prog.id,
          type: 'programme',
          title: prog.title,
          school: prog.school?.name || '',
          level: prog.level || '',
          chunkIndex: i,
          totalChunks: chunks.length,
          url: `/programmes/${prog.slug || prog.id}`,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} programmes.`);
    return { success: true, type: 'programmes', synced: count };
  }

  /** Sync short courses */
  async syncShortCourses(): Promise<SyncResult> {
    this.logger.log('Syncing Short Courses to vector DB...');
    const courses = await this.shortCourseRepository.find({
      where: { status: ShortCourseStatus.PUBLISHED },
      relations: ['school', 'department', 'course_category'],
    });
    let count = 0;

    for (const course of courses) {
      await this.deleteExistingChunks(course.id, 'short_course');

      const fullText = [
        `Short Course: ${course.title}`,
        course.code ? `Code: ${course.code}` : '',
        `School: ${course.school?.name || 'N/A'}`,
        `Level: ${course.level || 'N/A'}`,
        `Mode: ${course.mode_of_delivery || 'Online'}`,
        `Duration: ${course.duration || 'N/A'}`,
        `Cost: ${course.cost || 'Contact admissions'}`,
        '',
        'About:',
        course.about || course.overview || '',
        '',
        'Skills Gained:',
        course.skills_gained || '',
        '',
        'Target Audience:',
        course.target_audience || '',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      const chunks = this.chunkText(fullText);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: course.id,
          type: 'short_course',
          title: course.title,
          url: `/short-courses/${course.slug}`,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} short courses.`);
    return { success: true, type: 'short_courses', synced: count };
  }

  /** Sync programme fee structures — critical for fee queries */
  async syncFees(): Promise<SyncResult> {
    this.logger.log('Syncing Fee Structures to vector DB...');
    const fees = await this.programmeFeeRepository.find({
      where: { is_active: true },
      relations: ['program', 'academic_year'],
    });
    let count = 0;

    for (const fee of fees) {
      if (!fee.program) continue;
      await this.deleteExistingChunks(fee.id, 'programme_fee');

      const total =
        Number(fee.tuition_fee) +
        Number(fee.registration_fee) +
        Number(fee.student_activity_fee) +
        Number(fee.examination_fee) +
        Number(fee.technology_fee) +
        Number(fee.library_fee) +
        Number(fee.practical_laboratory_fee) +
        Number(fee.graduation_fee);

      const breakdown = [
        fee.tuition_fee > 0
          ? `- Tuition Fee: ${fee.currency} ${Number(fee.tuition_fee).toLocaleString()}`
          : '',
        fee.registration_fee > 0
          ? `- Registration Fee: ${fee.currency} ${Number(fee.registration_fee).toLocaleString()}`
          : '',
        fee.examination_fee > 0
          ? `- Examination Fee: ${fee.currency} ${Number(fee.examination_fee).toLocaleString()}`
          : '',
        fee.technology_fee > 0
          ? `- Technology Fee: ${fee.currency} ${Number(fee.technology_fee).toLocaleString()}`
          : '',
        fee.library_fee > 0
          ? `- Library Fee: ${fee.currency} ${Number(fee.library_fee).toLocaleString()}`
          : '',
        fee.student_activity_fee > 0
          ? `- Student Activity Fee: ${fee.currency} ${Number(fee.student_activity_fee).toLocaleString()}`
          : '',
        fee.practical_laboratory_fee > 0
          ? `- Lab/Practical Fee: ${fee.currency} ${Number(fee.practical_laboratory_fee).toLocaleString()}`
          : '',
        fee.graduation_fee > 0
          ? `- Graduation Fee: ${fee.currency} ${Number(fee.graduation_fee).toLocaleString()}`
          : '',
        ...(fee.other_fees || []).map(
          (f: any) =>
            `- ${f.name || 'Other'}: ${fee.currency} ${Number(f.amount || 0).toLocaleString()}`,
        ),
      ]
        .filter(Boolean)
        .join('\n');

      const text = [
        `Fee Structure for: ${fee.program.title}`,
        `Academic Year: ${fee.academic_year?.year_range || 'Current'}`,
        `Currency: ${fee.currency}`,
        `Approximate Total: ${fee.currency} ${total.toLocaleString()} per year`,
        '',
        'Fee Breakdown:',
        breakdown || 'Contact finance for full breakdown.',
        '',
        'For payment options and instalment plans, contact finance@ouk.ac.ke',
      ].join('\n');

      await this.aiService.ingestKnowledge(text, {
        sourceId: fee.id,
        type: 'programme_fee',
        title: `${fee.program.title} — Fee Structure`,
        programme: fee.program.title,
        academicYear: fee.academic_year?.year_range || '',
        url: `/fee-structure`,
        priority: 'high',
      });
      count++;
    }

    this.logger.log(`Synced ${count} fee structures.`);
    return { success: true, type: 'fees', synced: count };
  }

  /** Sync scholarships and financial aid */
  async syncScholarships(): Promise<SyncResult> {
    this.logger.log('Syncing Scholarships to vector DB...');
    const scholarships = await this.scholarshipRepository.find({
      where: { is_active: true },
    });
    let count = 0;

    for (const s of scholarships) {
      await this.deleteExistingChunks(s.id, 'scholarship');

      const deadline = s.application_deadline
        ? new Date(s.application_deadline).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'Check scholarship page for deadline';

      const text = [
        `Scholarship: ${s.title}`,
        s.amount > 0
          ? `Award Amount: KES ${Number(s.amount).toLocaleString()}`
          : '',
        `Application Deadline: ${deadline}`,
        '',
        'Description:',
        s.description || '',
        '',
        'Eligibility:',
        s.eligibility_criteria ||
          'Contact the scholarships office for eligibility details.',
        s.application_link ? `\nApply here: ${s.application_link}` : '',
      ]
        .filter((l) => l !== undefined)
        .join('\n')
        .trim();

      await this.aiService.ingestKnowledge(text, {
        sourceId: s.id,
        type: 'scholarship',
        title: s.title,
        url: s.application_link || '/scholarships',
        deadline: s.application_deadline,
      });
      count++;
    }

    this.logger.log(`Synced ${count} scholarships.`);
    return { success: true, type: 'scholarships', synced: count };
  }

  /** Sync staff profiles — for contact and expertise queries */
  async syncStaff(): Promise<SyncResult> {
    this.logger.log('Syncing Staff to vector DB...');
    const staff = await this.staffRepository.find({
      where: { is_current: true, is_public: true },
      relations: ['school', 'department'],
    });
    let count = 0;

    for (const member of staff) {
      await this.deleteExistingChunks(member.id, 'staff');

      const text = [
        `Staff Profile: ${member.honorific_title ? member.honorific_title + ' ' : ''}${member.full_name}`,
        `Title/Designation: ${member.job_title || member.designation || 'Staff'}`,
        `School: ${member.school?.name || 'N/A'}`,
        `Department: ${member.department?.name || 'N/A'}`,
        member.email ? `Email: ${member.email}` : '',
        member.phone_number ? `Phone: ${member.phone_number}` : '',
        '',
        member.bio ? `Bio:\n${member.bio}` : '',
        '',
        member.show_publications && member.specializations
          ? `Specializations:\n${member.specializations}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      const chunks = this.chunkText(text);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: member.id,
          type: 'staff',
          title: `${member.full_name} — ${member.job_title || 'Staff'}`,
          school: member.school?.name || '',
          department: member.department?.name || '',
          url: `/staff/${member.profile_slug}`,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} staff members.`);
    return { success: true, type: 'staff', synced: count };
  }

  /** Sync publicly available downloadable documents */
  async syncDownloads(): Promise<SyncResult> {
    this.logger.log('Syncing Downloads to vector DB...');
    const downloads = await this.downloadRepository.find({
      where: {
        status: DownloadStatus.PUBLISHED,
        access_level: AccessLevel.PUBLIC,
      },
      relations: ['category'],
    });
    let count = 0;

    for (const doc of downloads) {
      await this.deleteExistingChunks(doc.id, 'download');

      const text = [
        `Document: ${doc.title}`,
        `Category: ${doc.category?.name || doc.document_type || 'General'}`,
        `Type: ${doc.document_type || 'PDF'}`,
        `Version: ${doc.version || '1.0'}`,
        '',
        doc.summary || '',
        '',
        doc.description ? `Details: ${doc.description}` : '',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      const fileUrl = doc.file_url || doc.external_url || '';
      await this.aiService.ingestKnowledge(text, {
        sourceId: doc.id,
        type: 'download',
        title: doc.title,
        docType: doc.document_type,
        url: `/downloads/${doc.slug}`,
        fileUrl,
      });
      count++;
    }

    this.logger.log(`Synced ${count} documents.`);
    return { success: true, type: 'downloads', synced: count };
  }

  /** Sync news articles and announcements */
  async syncNews(): Promise<SyncResult> {
    this.logger.log('Syncing News to vector DB...');
    const articles = await this.newsRepository.find({
      where: { is_published: true },
    });
    let count = 0;

    for (const article of articles) {
      await this.deleteExistingChunks(article.id, 'news');

      const fullText = [
        `${article.type || 'News'}: ${article.title}`,
        `Category: ${article.category || 'General'}`,
        '',
        article.content || '',
      ]
        .join('\n')
        .trim();

      const chunks = this.chunkText(fullText);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: article.id,
          type: 'news',
          title: article.title,
          category: article.category || '',
          chunkIndex: i,
          totalChunks: chunks.length,
          url: `/news/${article.slug}`,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} news articles.`);
    return { success: true, type: 'news', synced: count };
  }

  /** Sync Service Charter FAQs */
  async syncServiceCharterFaqs(): Promise<SyncResult> {
    this.logger.log('Syncing Service Charter FAQs to vector DB...');
    const faqs = await this.serviceCharterFaqRepository.find({
      where: { is_active: true },
    });
    let count = 0;

    for (const faq of faqs) {
      await this.deleteExistingChunks(faq.id, 'service_charter_faq');
      const text = `Service Charter FAQ — ${faq.category}\n\nQ: ${faq.question}\n\nA: ${faq.answer}`;
      await this.aiService.ingestKnowledge(text, {
        sourceId: faq.id,
        type: 'service_charter_faq',
        title: faq.question,
        category: faq.category,
        url: `/service-charter`,
      });
      count++;
    }

    this.logger.log(`Synced ${count} Service Charter FAQs.`);
    return { success: true, type: 'service_charter_faqs', synced: count };
  }

  /** Sync Service Charter items (service standards & procedures) */
  async syncServiceCharterItems(): Promise<SyncResult> {
    this.logger.log('Syncing Service Charter Items to vector DB...');
    const items = await this.serviceCharterItemRepository.find({
      where: { status: ServiceStatus.ACTIVE },
    });
    let count = 0;

    for (const item of items) {
      await this.deleteExistingChunks(item.id, 'service_charter_item');

      const text = [
        `Service: ${item.service}`,
        `Category: ${item.category}`,
        `Timeline/SLA: ${item.timeline}`,
        `Responsible Unit: ${item.unit}`,
        `Contact Email: ${item.email}`,
        item.phone ? `Phone: ${item.phone}` : '',
        '',
        item.steps?.length > 0
          ? `How to access this service:\n${item.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
          : '',
        '',
        item.docs?.length > 0
          ? `Required Documents:\n${item.docs.map((d) => `- ${d}`).join('\n')}`
          : '',
        '',
        item.faqs?.length > 0
          ? `Common Questions:\n${item.faqs.join('\n')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      await this.aiService.ingestKnowledge(text, {
        sourceId: item.id,
        type: 'service_charter_item',
        title: `${item.category} — ${item.service}`,
        category: item.category,
        email: item.email,
        url: `/service-charter`,
      });
      count++;
    }

    this.logger.log(`Synced ${count} Service Charter items.`);
    return { success: true, type: 'service_charter_items', synced: count };
  }

  /** Sync complaint categories — guides the AI on how to assist with complaints */
  async syncComplaintCategories(): Promise<SyncResult> {
    this.logger.log('Syncing Complaint Categories to vector DB...');
    const categories = await this.complaintCategoryRepository.find({
      where: { is_active: true },
      relations: ['department'],
    });
    let count = 0;

    for (const cat of categories) {
      await this.deleteExistingChunks(cat.id, 'complaint_category');

      const text = [
        `Complaint Category: ${cat.name}`,
        cat.description ? `\nDescription: ${cat.description}` : '',
        cat.department
          ? `\nResponsible Department: ${cat.department.name}`
          : '',
        cat.applicable_types?.length
          ? `\nApplies To: ${cat.applicable_types.join(', ')}`
          : '',
        cat.subcategories?.length
          ? `\nSubcategories:\n${cat.subcategories.map((s) => `- ${s}`).join('\n')}`
          : '',
        '\nTo lodge a complaint, visit /complaints or contact the relevant department directly.',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      await this.aiService.ingestKnowledge(text, {
        sourceId: cat.id,
        type: 'complaint_category',
        title: `Complaints — ${cat.name}`,
        department: cat.department?.name || '',
        url: `/complaints`,
      });
      count++;
    }

    this.logger.log(`Synced ${count} complaint categories.`);
    return { success: true, type: 'complaint_categories', synced: count };
  }

  /** Sync alumni success stories */
  async syncAlumniStories(): Promise<SyncResult> {
    this.logger.log('Syncing Alumni Stories to vector DB...');
    const stories = await this.alumniStoryRepository.find();
    let count = 0;

    for (const story of stories) {
      await this.deleteExistingChunks(story.id, 'alumni_story');

      const chunks = this.chunkText(
        `Alumni Success Story: ${story.title}\nCategory: ${story.category}\n\n${story.content}`,
      );
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: story.id,
          type: 'alumni_story',
          title: story.title,
          category: story.category,
          url: `/alumni`,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} alumni stories.`);
    return { success: true, type: 'alumni_stories', synced: count };
  }

  /** Sync research publications */
  async syncPublications(): Promise<SyncResult> {
    this.logger.log('Syncing Publications to vector DB...');
    const publications = await this.publicationRepository.find({
      where: { status: 'Published' },
      relations: ['school', 'department'],
    });
    let count = 0;

    for (const pub of publications) {
      await this.deleteExistingChunks(pub.id, 'publication');

      const text = [
        `Research Publication: ${pub.title}`,
        `Type: ${pub.type}`,
        pub.publication_year ? `Year: ${pub.publication_year}` : '',
        pub.journal_name ? `Journal: ${pub.journal_name}` : '',
        pub.school?.name ? `School: ${pub.school.name}` : '',
        pub.department?.name ? `Department: ${pub.department.name}` : '',
        pub.keywords?.length ? `Keywords: ${pub.keywords.join(', ')}` : '',
        '',
        `Abstract:\n${pub.abstract || ''}`,
        pub.doi ? `\nDOI: ${pub.doi}` : '',
        pub.url ? `\nLink: ${pub.url}` : '',
      ]
        .filter(Boolean)
        .join('\n')
        .trim();

      const chunks = this.chunkText(text);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: pub.id,
          type: 'publication',
          title: pub.title,
          school: pub.school?.name || '',
          year: pub.publication_year,
          url: pub.url || `/research/publications/${pub.slug}`,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} publications.`);
    return { success: true, type: 'publications', synced: count };
  }

  /**
   * Static website knowledge — covers all major pages and institutional information.
   * This ensures the AI knows about every section of the OUK website
   * even before dynamic content is synced.
   */
  async syncStaticWebsiteKnowledge(): Promise<SyncResult> {
    this.logger.log('Syncing static website knowledge to vector DB...');

    const staticPages = [
      {
        id: 'about-ouk',
        title: 'About OUK',
        url: '/about',
        content: `About the Open University of Kenya (OUK)

The Open University of Kenya (OUK) is Kenya's first fully dedicated open and distance learning (ODL) university, established under the Universities Act 2012. OUK provides quality, accessible, and flexible higher education to all Kenyans regardless of their location, age, or circumstances.

OUK's mission is to provide accessible, flexible, and quality higher education through open and distance learning for the transformation of Kenya's society.

OUK's vision is to be a world-class open and distance learning university for sustainable development.

Core Values: Quality, Access, Innovation, Integrity, Collaboration.

OUK is fully accredited by the Commission for University Education (CUE) in Kenya.

Programmes are delivered 100% online using a Learning Management System (LMS), allowing students to study at their own pace from anywhere in Kenya and beyond.`,
        category: 'about',
      },
      {
        id: 'admissions-process',
        title: 'Admissions & Application Process',
        url: '/admissions',
        content: `OUK Admissions and Application Process

How to Apply to OUK:
1. Visit the OUK Application Portal at https://portal.ouk.ac.ke
2. Create an account with your email address
3. Select your desired programme
4. Fill in your personal and academic details
5. Upload required documents (certificates, ID, passport photo)
6. Pay the application fee
7. Submit your application
8. Await admission confirmation via email

General Minimum Entry Requirements:
- Kenya Certificate of Secondary Education (KCSE) with minimum C+ (Plus) for degree programmes
- KCSE with minimum C (Plain) for diploma programmes
- Specific programmes may have additional subject requirements

For postgraduate programmes:
- First degree (Bachelor's) with minimum Second Class Honours or equivalent
- Some programmes may require relevant work experience

Application periods are announced on the OUK website. Late applications may be considered based on space availability.

Contact admissions@ouk.ac.ke for application guidance.`,
        category: 'admissions',
      },
      {
        id: 'student-portal-guide',
        title: 'Student Portal & LMS Guide',
        url: 'https://portal.ouk.ac.ke',
        content: `OUK Student Portal and Learning Management System

The OUK Student Portal (https://portal.ouk.ac.ke) is the central hub for all student activities including:
- Course registration and unit selection
- Access to learning materials and lecture notes
- Assignment submission
- Examination registration
- Fee payment and statements
- Results and transcripts
- Communication with lecturers and academic advisors

How to access the Student Portal:
1. Go to https://portal.ouk.ac.ke
2. Enter your student registration number as username
3. Enter your password (default: your ID number on first login)
4. Change your password immediately on first login

If you have login issues:
- Contact ICT support at ict@ouk.ac.ke
- Call the ICT helpdesk during working hours (Mon–Fri, 8AM–5PM)
- Visit the ICT department on campus

The Learning Management System (LMS) is built on Moodle and accessible via the portal.`,
        category: 'student-support',
      },
      {
        id: 'contact-information',
        title: 'OUK Contact Information',
        url: '/contact',
        content: `OUK Contact Information and Offices

Main Office:
Open University of Kenya
P.O. Box 30197-00100
Nairobi, Kenya

General Enquiries: info@ouk.ac.ke
Admissions: admissions@ouk.ac.ke
Finance: finance@ouk.ac.ke
ICT Support: ict@ouk.ac.ke
Library: library@ouk.ac.ke
Research: research@ouk.ac.ke
Student Affairs: studentaffairs@ouk.ac.ke
General Support: support@ouk.ac.ke

OUK operates Monday to Friday, 8:00 AM to 5:00 PM East Africa Time (EAT).

For complaints and feedback, use the online complaints form at /complaints or email the relevant department.

OUK has regional learning centres across Kenya. Visit /contact for a full list of regional centres and their contact details.`,
        category: 'contact',
      },
      {
        id: 'examinations-guide',
        title: 'Examinations and Results',
        url: '/examinations',
        content: `OUK Examinations, Assessment and Results

OUK uses a combination of continuous assessment tests (CATs) and end-of-semester examinations.

Assessment Breakdown (typical):
- Continuous Assessment (CATs, assignments, online quizzes): 30–40%
- End-of-Semester Examination: 60–70%

Examination Registration:
Students must register for examinations through the student portal by the deadline announced each semester.

Examination Centres:
OUK uses approved examination centres across Kenya. Students choose their nearest centre during exam registration.

Results:
Results are posted on the student portal after marking is complete. Results are typically available 6–8 weeks after examinations.

For examination issues, deferrals, or appeals, contact examinations@ouk.ac.ke or visit the registry.

Graduation:
Students who complete all required units and satisfy graduation requirements are eligible for graduation, which takes place annually. Apply for graduation through the student portal.`,
        category: 'examinations',
      },
      {
        id: 'library-resources',
        title: 'OUK Library and Research Resources',
        url: '/library',
        content: `OUK Library Services and Research Resources

The OUK Digital Library provides students and staff access to:
- E-books and digital textbooks
- Academic journals and research databases
- Theses and dissertations
- OUK institutional repository
- Online research tools

Library Access:
All registered OUK students have free access to the digital library using their student credentials.

Key Resources:
- JSTOR, EBSCO, and other international databases
- Kenya National Digital Library resources
- Open access research platforms
- OUK institutional repository at /research/repository

Library Support:
Email: library@ouk.ac.ke
For research assistance, interlibrary loans, and resource requests, contact the library team.

Research at OUK:
OUK encourages research across all schools and departments. Students interested in postgraduate research should contact the Research and Innovation office at research@ouk.ac.ke.`,
        category: 'library',
      },
      {
        id: 'graduation-clearance',
        title: 'Graduation and Academic Clearance',
        url: '/graduation',
        content: `OUK Graduation and Academic Clearance Process

To graduate from OUK, students must:
1. Complete all required units/modules for their programme
2. Achieve the minimum pass mark in all examinable units
3. Clear all fees and financial obligations
4. Return all borrowed library resources
5. Complete any required attachment/internship
6. Apply for graduation through the student portal before the deadline

Graduation Ceremony:
OUK holds an annual graduation ceremony. All eligible students are invited and must confirm attendance.

Documents Required for Clearance:
- Clearance form from Finance office
- Library clearance
- Department clearance
- ICT clearance

Transcripts and Certificates:
Academic transcripts can be requested through the portal or at the registry. Official certificates are issued after graduation.

For graduation queries: graduation@ouk.ac.ke or visit the Registry.`,
        category: 'graduation',
      },
      {
        id: 'complaints-procedure',
        title: 'Complaints and Feedback Procedure',
        url: '/complaints',
        content: `OUK Complaints, Feedback and Grievance Procedure

OUK has a formal complaints procedure to ensure all concerns are addressed fairly and promptly.

How to Lodge a Complaint:
1. Try to resolve the issue informally with the relevant lecturer, unit, or department first
2. If unresolved, submit a formal complaint via the online complaints form at /complaints
3. Include all relevant details, dates, and supporting documents
4. You will receive an acknowledgement within 3 working days
5. Resolution within 14 working days for standard complaints

Types of Complaints Handled:
- Academic complaints (grading, teaching quality, assessment disputes)
- Administrative complaints (registration, fees, documents)
- Facilities and service delivery complaints
- Student conduct and disciplinary matters

Escalation:
If unsatisfied with the response, you can escalate to the Vice Chancellor's office or the External Complaints Resolution Committee.

For urgent matters, contact the Dean of Students: students@ouk.ac.ke`,
        category: 'complaints',
      },
      {
        id: 'payment-methods',
        title: 'Fee Payment Methods',
        url: '/fee-structure',
        content: `OUK Fee Payment Methods and Options

Accepted Payment Methods:
1. M-Pesa Paybill Number: [Check portal for current Paybill]
2. Bank Transfer to OUK bank accounts (details on portal)
3. Online payment through the student portal

Payment Process (M-Pesa):
1. Go to M-Pesa on your phone
2. Select "Lipa na M-Pesa"
3. Select "Pay Bill"
4. Enter OUK Paybill Number
5. Account Number: Your Student Registration Number
6. Enter amount and confirm

Instalment Plans:
OUK allows payment in instalments per semester. Contact finance@ouk.ac.ke to arrange a payment plan.

Fee Receipts:
Fee receipts and payment confirmation are available on the student portal under Finance.

For payment issues or queries: finance@ouk.ac.ke`,
        category: 'finance',
      },
    ];

    let count = 0;
    const SOURCE_ID_PREFIX = 'static_page_';

    for (const page of staticPages) {
      const id = SOURCE_ID_PREFIX + page.id;
      await this.deleteExistingChunks(id, 'static_page');

      const chunks = this.chunkText(page.content);
      for (let i = 0; i < chunks.length; i++) {
        await this.aiService.ingestKnowledge(chunks[i], {
          sourceId: id,
          type: 'static_page',
          title: page.title,
          category: page.category,
          url: page.url,
          chunkIndex: i,
          totalChunks: chunks.length,
          priority: 'medium',
        });
      }
      count++;
    }

    this.logger.log(`Synced ${count} static website pages.`);
    return { success: true, type: 'static_pages', synced: count };
  }

  /**
   * Full knowledge base rebuild — ingests ALL sources in priority order.
   * Run this after major content updates or on a scheduled basis.
   */
  async syncAll(): Promise<SyncResult[]> {
    this.logger.log('=== STARTING FULL OUK KNOWLEDGE BASE SYNC ===');

    // Run in batches to avoid overwhelming the OpenAI Embeddings API
    const syncTasks: Array<() => Promise<SyncResult>> = [
      // Highest priority — admin-curated and official FAQs
      () => this.syncChatIntelligence(),
      () => this.syncFaqs(),
      () => this.syncServiceCharterFaqs(),
      // Core institutional content
      () => this.syncStaticWebsiteKnowledge(),
      () => this.syncProgrammes(),
      () => this.syncShortCourses(),
      () => this.syncFees(),
      () => this.syncScholarships(),
      // Service information
      () => this.syncServiceCharterItems(),
      () => this.syncComplaintCategories(),
      () => this.syncDownloads(),
      // People and research
      () => this.syncStaff(),
      () => this.syncPublications(),
      // News and alumni
      () => this.syncNews(),
      () => this.syncAlumniStories(),
    ];

    const results: SyncResult[] = [];

    for (const task of syncTasks) {
      try {
        const result = await task();
        results.push(result);
        this.logger.log(`✓ ${result.type}: ${result.synced} records`);
      } catch (err: any) {
        this.logger.error(`✗ Sync task failed: ${err.message}`);
        results.push({ success: false, type: 'unknown', error: err.message });
      }
    }

    this.logger.log(
      `=== SYNC COMPLETE: ${results.filter((r) => r.success).length}/${results.length} tasks succeeded ===`,
    );
    return results;
  }
}
