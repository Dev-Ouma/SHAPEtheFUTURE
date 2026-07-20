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
      SearchAnalytic,
    ]),
    AuthModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
