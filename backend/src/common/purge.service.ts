import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, LessThan } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { CourseUnit } from '../programs/entities/course-unit.entity';
import { ShortCourse } from '../short-courses/entities/short-course.entity';
import { School } from '../programs/entities/school.entity';
import { Department } from '../programs/entities/department.entity';
import { News } from '../news/entities/news.entity';
import { Page } from '../pages/entities/page.entity';
import { User } from '../auth/entities/user.entity';
import { AuditLog } from '../logs/entities/audit-log.entity';
import { AnalyticsMetric } from '../analytics/entities/metric.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PurgeService {
  private readonly logger = new Logger(PurgeService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly settingsService: SettingsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePurge() {
    this.logger.log(
      '[Institutional Purge] Starting automated lifecycle cleanup...',
    );

    // 1. Fetch separate institutional retention horizons (Default: 60 days)
    const settings = (await this.settingsService.findAll()) as Record<
      string,
      any
    >;
    const getRetention = (key: string) => {
      const val = (settings as any)[key];
      return val ? parseInt(val.toString(), 10) : 60;
    };

    const auditRetention = getRetention('audit_log_retention_days');
    const analyticsRetention = getRetention('analytics_retention_days');
    const recycleBinRetention = getRetention('recycle_bin_retention_days');

    const auditThreshold = new Date();
    auditThreshold.setDate(auditThreshold.getDate() - auditRetention);

    const analyticsThreshold = new Date();
    analyticsThreshold.setDate(
      analyticsThreshold.getDate() - analyticsRetention,
    );

    const recycleBinThreshold = new Date();
    recycleBinThreshold.setDate(
      recycleBinThreshold.getDate() - recycleBinRetention,
    );

    // 2. Permanent Records (Audit Logs & Telemetry)
    const operationalEntities = [
      { entity: AuditLog, threshold: auditThreshold, label: 'Audit Logs' },
      {
        entity: AnalyticsMetric,
        threshold: analyticsThreshold,
        label: 'Analytics',
      },
    ];

    for (const entry of operationalEntities) {
      try {
        const deletedCount = await this.entityManager
          .createQueryBuilder()
          .delete()
          .from(entry.entity)
          .where('timestamp < :threshold', { threshold: entry.threshold })
          .execute();

        if (deletedCount.affected && deletedCount.affected > 0) {
          this.logger.log(
            `[Institutional Purge] Archived ${deletedCount.affected} stale ${entry.label} (Threshold: ${entry.threshold.toISOString()})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[Institutional Purge] Failed to archive ${entry.label}: ${error.message}`,
        );
      }
    }

    // 3. Soft-Deleted Registry Items (Recycle Bin)
    const softDeleteEntities = [
      Program,
      CourseUnit,
      ShortCourse,
      School,
      Department,
      News,
      Page,
      User,
    ];

    for (const entity of softDeleteEntities) {
      try {
        const deletedItems = await this.entityManager.find(entity as any, {
          where: { deleted_at: LessThan(recycleBinThreshold) },
          withDeleted: true,
        });

        if (deletedItems.length > 0) {
          this.logger.log(
            `[Institutional Purge] Permanently removing ${deletedItems.length} soft-deleted records from ${entity.name} (Threshold: ${recycleBinThreshold.toISOString()})`,
          );
          await this.entityManager.remove(deletedItems);
        }
      } catch (error) {
        this.logger.error(
          `[Institutional Purge] Failed to purge ${entity.name}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `[Institutional Purge] Cleanup completed. Retention Windows - Audit: ${auditRetention}d, Analytics: ${analyticsRetention}d, RecycleBin: ${recycleBinRetention}d.`,
    );
  }
}
