import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AiChatService, ChatMessage } from './ai-chat.service';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

class ChatDto {
  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  history?: ChatMessage[];
}

@ApiTags('AI Advisor')
@Controller('ai')
export class AiAdvisorController {
  constructor(
    private readonly aiChatService: AiChatService,
    private readonly ingestionService: KnowledgeIngestionService,
  ) {}

  /** Public chat endpoint — throttled to limit cost abuse */
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with the OUK AI Advisor (4-layer retrieval)' })
  @ApiBody({ type: ChatDto })
  async chat(@Body() dto: ChatDto, @Ip() ip: string) {
    return this.aiChatService.chat(dto.message, dto.history || [], ip);
  }

  /** Health check — public */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return {
      status: 'ok',
      module: 'OUK AI Advisor',
      version: '2.0.0',
      pipeline: '4-layer',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Admin Sync Endpoints — protected, trigger knowledge re-ingestion
  // ─────────────────────────────────────────────────────────────

  /** Full rebuild of the entire knowledge base */
  @Post('admin/sync/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Admin: Full knowledge base rebuild from all sources',
  })
  async syncAll() {
    return this.ingestionService.syncAll();
  }

  /** Sync admin-curated FAQs from Intelligence Hub */
  @Post('admin/sync/chat-intelligence')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync Intelligence Hub (trained FAQs)' })
  async syncChatIntelligence() {
    return this.ingestionService.syncChatIntelligence();
  }

  /** Sync official FAQs */
  @Post('admin/sync/faqs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync official FAQs' })
  async syncFaqs() {
    return this.ingestionService.syncFaqs();
  }

  /** Sync degree/diploma programmes */
  @Post('admin/sync/programmes')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync all programmes' })
  async syncProgrammes() {
    return this.ingestionService.syncProgrammes();
  }

  /** Sync short courses */
  @Post('admin/sync/short-courses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync short courses' })
  async syncShortCourses() {
    return this.ingestionService.syncShortCourses();
  }

  /** Sync fee structures */
  @Post('admin/sync/fees')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync programme fee structures' })
  async syncFees() {
    return this.ingestionService.syncFees();
  }

  /** Sync scholarships */
  @Post('admin/sync/scholarships')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync scholarships and financial aid' })
  async syncScholarships() {
    return this.ingestionService.syncScholarships();
  }

  /** Sync staff profiles */
  @Post('admin/sync/staff')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync staff profiles' })
  async syncStaff() {
    return this.ingestionService.syncStaff();
  }

  /** Sync public downloads and documents */
  @Post('admin/sync/downloads')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync public documents and downloads' })
  async syncDownloads() {
    return this.ingestionService.syncDownloads();
  }

  /** Sync news articles */
  @Post('admin/sync/news')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync news articles' })
  async syncNews() {
    return this.ingestionService.syncNews();
  }

  /** Sync service charter FAQs and service items */
  @Post('admin/sync/service-charter')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Admin: Sync service charter FAQs and service items',
  })
  async syncServiceCharter() {
    const [faqs, items] = await Promise.allSettled([
      this.ingestionService.syncServiceCharterFaqs(),
      this.ingestionService.syncServiceCharterItems(),
    ]);
    return [
      faqs.status === 'fulfilled'
        ? faqs.value
        : {
            success: false,
            type: 'service_charter_faqs',
            error: faqs.reason?.message,
          },
      items.status === 'fulfilled'
        ? items.value
        : {
            success: false,
            type: 'service_charter_items',
            error: items.reason?.message,
          },
    ];
  }

  /** Sync complaint categories */
  @Post('admin/sync/complaints')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync complaint categories and procedures' })
  async syncComplaintCategories() {
    return this.ingestionService.syncComplaintCategories();
  }

  /** Sync alumni stories */
  @Post('admin/sync/alumni')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync alumni success stories' })
  async syncAlumni() {
    return this.ingestionService.syncAlumniStories();
  }

  /** Sync research publications */
  @Post('admin/sync/publications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Sync research publications' })
  async syncPublications() {
    return this.ingestionService.syncPublications();
  }

  /** Sync static website pages */
  @Post('admin/sync/website')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Admin: Sync static website knowledge (all major pages)',
  })
  async syncWebsite() {
    return this.ingestionService.syncStaticWebsiteKnowledge();
  }
}
