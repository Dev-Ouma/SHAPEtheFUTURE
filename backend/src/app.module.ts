import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { HotlinkProtectionMiddleware } from './common/middleware/hotlink-protection.middleware';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MenusModule } from './menus/menus.module';
import { ProgramsModule } from './programs/programs.module';
import { NewsModule } from './news/news.module';
import { PagesModule } from './pages/pages.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { FinanceModule } from './finance/finance.module';
import { LmsModule } from './lms/lms.module';
import { ResearchModule } from './research/research.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { UploadsModule } from './uploads/uploads.module';
import { SearchModule } from './search/search.module';
import { ShortCoursesModule } from './short-courses/short-courses.module';
import { DepartmentsModule } from './programs/departments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PurgeService } from './common/purge.service';
import { CmsCacheModule } from './common/cms-cache.module';
import { RecycleBinModule } from './recycle-bin/recycle-bin.module';
import { LogsModule } from './logs/logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatModule } from './chat/chat.module';
import { StaffModule } from './staff/staff.module';
import { DownloadsModule } from './downloads/downloads.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ReportsModule } from './reports/reports.module';
// CampusFeedbackModule kept for legacy API compatibility during ICT migration.
import { IctModule } from './ict/ict.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { PeerLearnersModule } from './peer-learners/peer-learners.module';
import { TimetablesModule } from './timetables/timetables.module';
import { CareersModule } from './careers/careers.module';
import { LibraryModule } from './library/library.module';
import { FaqsModule } from './faqs/faqs.module';
import { TendersModule } from './procurement/tenders/tenders.module';
import { IntroVideosModule } from './intro-videos/intro-videos.module';
import { AdvertsModule } from './adverts/adverts.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { AdminSidebarModule } from './admin-sidebar/admin-sidebar.module';
import { AlumniModule } from './alumni/alumni.module';
import { BackLinksModule } from './backlinks/backlinks.module';
import { MailModule } from './mail/mail.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AiAdvisorModule } from './ai-advisor/ai-advisor.module';
import { ResearchIntegrationModule } from './research-integration/research-integration.module';
import { GovernanceModule } from './governance/governance.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { CampusFeedbackModule } from './campus-feedback/campus-feedback.module';
import { TechnicalSupportModule } from './technical-support/technical-support.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { SocialFeedModule } from './social-feed/social-feed.module';
import { FeeStructuresModule } from './fee-structures/fee-structures.module';
import { ServiceCharterModule } from './service-charter/service-charter.module';
import { ShapeModule } from './shape/shape.module';

@Module({
  imports: [
    // ... rest of imports
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    RecycleBinModule,
    LogsModule,
    AnalyticsModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // Prefer REDIS_URL; otherwise build from REDIS_HOST/REDIS_PORT (compose/.env).
        const redisUrl =
          configService.get<string>('REDIS_URL') ||
          (() => {
            const host = configService.get<string>('REDIS_HOST');
            if (!host) return undefined;
            const port = configService.get<string>('REDIS_PORT') || '6379';
            const password = configService.get<string>('REDIS_PASSWORD');
            const auth = password
              ? `:${encodeURIComponent(password)}@`
              : '';
            return `redis://${auth}${host}:${port}`;
          })();

        if (redisUrl) {
          try {
            const store = await redisStore({ url: redisUrl, ttl: 60 * 1000 });
            return { store };
          } catch (e) {
            console.warn(
              'Redis connection failed, falling back to in-memory cache.',
            );
            return { ttl: 60 * 1000 };
          }
        }
        return { ttl: 60 * 1000 }; // Default in-memory cache
      },
    }),
    CmsCacheModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // Production: migrations only. Local/dev may opt in via TYPEORM_SYNCHRONIZE=true.
        synchronize:
          (configService.get<string>('TYPEORM_SYNCHRONIZE') ??
            (configService.get<string>('NODE_ENV') === 'production'
              ? 'false'
              : 'true')) === 'true',
        logging: false,
        retryAttempts: 20,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    MenusModule,
    ProgramsModule,
    NewsModule,
    PagesModule,
    SettingsModule,
    AuthModule,
    StudentsModule,
    FinanceModule,
    LmsModule,
    ResearchModule,
    HeroSlidesModule,
    UploadsModule,
    SearchModule,
    ShortCoursesModule,
    DepartmentsModule,
    StaffModule,
    DownloadsModule,
    ReportsModule,
    IctModule,
    ComplaintsModule,
    PeerLearnersModule,
    TimetablesModule,
    CareersModule,
    LibraryModule,
    FaqsModule,
    TendersModule,
    IntroVideosModule,
    AdvertsModule,
    TestimonialsModule,
    AdminSidebarModule,
    AlumniModule,
    BackLinksModule,
    MailModule,
    SubscriptionsModule,
    MaintenanceModule,
    AiAdvisorModule,
    ResearchIntegrationModule,
    GovernanceModule,
    HealthModule,
    DatabaseModule,
    CampusFeedbackModule,
    TechnicalSupportModule,
    SocialFeedModule,
    FeeStructuresModule,
    ServiceCharterModule,
    ShapeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PurgeService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    consumer.apply(HotlinkProtectionMiddleware).forRoutes('*');
  }
}
