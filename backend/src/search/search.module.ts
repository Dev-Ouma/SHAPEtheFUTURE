import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Program } from '../programs/entities/program.entity';
import { CourseUnit } from '../programs/entities/course-unit.entity';
import { News } from '../news/entities/news.entity';
import { Page } from '../pages/entities/page.entity';
import { ShortCourse } from '../short-courses/entities/short-course.entity';
import { Menu } from '../menus/entities/menu.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Publication } from '../research/entities/publication.entity';
import { School } from '../programs/entities/school.entity';
import { Department } from '../programs/entities/department.entity';
import { Job } from '../careers/entities/job.entity';
import { PeerLearner } from '../peer-learners/entities/peer-learner.entity';
import { Download } from '../downloads/entities/download.entity';
import { PartnerInstitution } from '../shape/entities/partner-institution.entity';
import { WorkPackage } from '../shape/entities/work-package.entity';
import { ShapeEvent } from '../shape/entities/shape-event.entity';
import { ShapeDocument } from '../shape/entities/shape-document.entity';
import { ShapeActivity } from '../shape/entities/shape-activity.entity';
import { ShapeKpi } from '../shape/entities/shape-kpi.entity';
import { ShapeRisk } from '../shape/entities/shape-risk.entity';
import { ShapeSdlcStage } from '../shape/entities/shape-sdlc-stage.entity';
import { ShapeContactMessage } from '../shape/entities/shape-contact-message.entity';
import { SearchAnalytic } from './entities/search-analytics.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      CourseUnit,
      News,
      Page,
      ShortCourse,
      Menu,
      StaffMember,
      Publication,
      School,
      Department,
      Job,
      PeerLearner,
      Download,
      PartnerInstitution,
      WorkPackage,
      ShapeEvent,
      ShapeDocument,
      ShapeActivity,
      ShapeKpi,
      ShapeRisk,
      ShapeSdlcStage,
      ShapeContactMessage,
      SearchAnalytic,
    ]),
    AuthModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
