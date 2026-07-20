import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Daily Executive Summary Report at 8:00 AM
   * In a real implementation, this would compile the report and trigger the MailService
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDailyReport() {
    this.logger.log('Generating Daily Executive Summary...');
    const summary = await this.reportsService.getExecutiveSummary();
    // MailService.sendReport('vc@ouk.ac.ke', 'Daily Summary', summary);
    this.logger.log(
      `Daily report generated. Total Students: ${summary.totalStudents}`,
    );
  }

  /**
   * Weekly Analytics Report every Monday at 9:00 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyReport() {
    this.logger.log('Generating Weekly Web Analytics Report...');
    const analytics = await this.reportsService.getWebsiteAnalytics({});
    // MailService.sendReport('marketing@ouk.ac.ke', 'Weekly Web Analytics', analytics);
  }
}
