import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiAdvisorService } from './ai-advisor.service';
import { AiChatService } from './ai-chat.service';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { AiAdvisorController } from './ai-advisor.controller';
import { KnowledgeDocument } from './entities/knowledge-document.entity';

// Core content
import { Program } from '../programs/entities/program.entity';
import { News } from '../news/entities/news.entity';
import { Faq } from '../faqs/entities/faq.entity';
import { ChatIntelligence } from '../chat/entities/chat-intelligence.entity';

// Fee structures
import { ProgrammeFee } from '../fee-structures/entities/programme-fee.entity';
import { AcademicYear } from '../fee-structures/entities/academic-year.entity';

// People & staff
import { StaffMember } from '../staff/entities/staff-member.entity';

// Finance
import { Scholarship } from '../finance/entities/scholarship.entity';

// Short courses
import { ShortCourse } from '../short-courses/entities/short-course.entity';

// Downloads & documents
import { Download } from '../downloads/entities/download.entity';

// Service charter
import { ServiceCharterFaq } from '../service-charter/entities/service-charter-faq.entity';
import { ServiceCharterItem } from '../service-charter/entities/service-charter-item.entity';

// Complaints
import { ComplaintCategory } from '../complaints/entities/complaint-category.entity';

// Alumni
import { AlumniStory } from '../alumni/entities/alumni-story.entity';

// Research
import { Publication } from '../research/entities/publication.entity';

// Settings & audit
import { SettingsModule } from '../settings/settings.module';
import { Setting } from '../settings/entities/setting.entity';
import { AuditLog } from '../logs/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule,
    SettingsModule,
    TypeOrmModule.forFeature([
      // Vector knowledge store
      KnowledgeDocument,

      // Layer 1 — FAQ direct search
      ChatIntelligence,
      Faq,

      // Institutional content
      Program,
      News,
      ShortCourse,

      // Fees
      ProgrammeFee,
      AcademicYear,

      // People
      StaffMember,

      // Finance
      Scholarship,

      // Documents
      Download,

      // Service Charter
      ServiceCharterFaq,
      ServiceCharterItem,

      // Complaints
      ComplaintCategory,

      // Alumni & Research
      AlumniStory,
      Publication,

      // Infrastructure
      Setting,
      AuditLog,
    ]),
  ],
  controllers: [AiAdvisorController],
  providers: [AiAdvisorService, AiChatService, KnowledgeIngestionService],
  exports: [AiAdvisorService, AiChatService],
})
export class AiAdvisorModule {}
