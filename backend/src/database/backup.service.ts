import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = util.promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private configService: ConfigService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    this.logger.log('Starting automated database backup task...');
    await this.runBackup();
  }

  async runBackup() {
    try {
      const dbUrl = this.configService.get<string>('DATABASE_URL');
      if (!dbUrl) {
        this.logger.error('DATABASE_URL is not configured. Skipping backup.');
        return;
      }

      const backupsDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${dateStr}.sql`;
      const filepath = path.join(backupsDir, filename);

      // We use pg_dump to dump the database to a file.
      // Note: pg_dump must be installed on the server where this runs.
      const command = `pg_dump "${dbUrl}" > "${filepath}" && gzip "${filepath}"`;

      this.logger.log(`Executing backup command...`);
      await execAsync(command);

      this.logger.log(`Database backup completed successfully: ${filepath}.gz`);

      // Cleanup old backups (keep last 7 days)
      this.cleanupOldBackups(backupsDir, 7);
    } catch (error: any) {
      this.logger.error(
        `Failed to execute database backup: ${error.message}`,
        error.stack,
      );
    }
  }

  private cleanupOldBackups(dir: string, daysToKeep: number) {
    fs.readdir(dir, (err, files) => {
      if (err) {
        this.logger.error(
          `Failed to read backups directory for cleanup: ${err.message}`,
        );
        return;
      }

      const now = Date.now();
      const maxAgeMs = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;

          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlink(filePath, (err) => {
              if (err)
                this.logger.error(`Failed to delete old backup: ${filePath}`);
              else this.logger.log(`Deleted old backup: ${filePath}`);
            });
          }
        });
      });
    });
  }
}
