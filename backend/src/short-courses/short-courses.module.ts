import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortCourse } from './entities/short-course.entity';
import {
  ShortCourseCategory,
  LearningMethod,
} from './entities/taxonomies.entity';
import { ShortCourseModule } from './entities/short-course-module.entity';
import { ShortCoursesService } from './short-courses.service';
import { ShortCoursesController } from './short-courses.controller';
import { School } from '../programs/entities/school.entity';
import { Department } from '../programs/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShortCourse,
      ShortCourseCategory,
      LearningMethod,
      ShortCourseModule,
      School,
      Department,
    ]),
  ],
  providers: [ShortCoursesService],
  controllers: [ShortCoursesController],
  exports: [ShortCoursesService],
})
export class ShortCoursesModule {}
