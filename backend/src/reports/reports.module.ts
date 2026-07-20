import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportSchedulerService } from './report-scheduler.service';
import { Program } from '../programs/entities/program.entity';
import { CourseUnit } from '../programs/entities/course-unit.entity';
import { ShortCourse } from '../short-courses/entities/short-course.entity';
import { School } from '../programs/entities/school.entity';
import { Department } from '../programs/entities/department.entity';
import { Student } from '../students/entities/student.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintCategory } from '../complaints/entities/complaint-category.entity';
import { News } from '../news/entities/news.entity';
import { AcademicCalendarEvent } from '../programs/entities/calendar-event.entity';
import { Publication } from '../research/entities/publication.entity';
import { AlumniProfile } from '../alumni/entities/alumni-profile.entity';
import { DownloadLog } from '../downloads/entities/download-log.entity';
import { AiAdvisorModule } from '../ai-advisor/ai-advisor.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      CourseUnit,
      ShortCourse,
      School,
      Department,
      Student,
      Complaint,
      ComplaintCategory,
      News,
      AcademicCalendarEvent,
      Publication,
      AlumniProfile,
      DownloadLog,
    ]),
    AiAdvisorModule,
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportSchedulerService],
})
export class ReportsModule {}
