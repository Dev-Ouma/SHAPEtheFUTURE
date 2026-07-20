import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { Program } from './entities/program.entity';
import { School } from './entities/school.entity';
import { CourseUnit } from './entities/course-unit.entity';
import { Department } from './entities/department.entity';
import { SchoolResource } from './entities/resource.entity';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { CourseUnitsService } from './course-units.service';
import { CourseUnitsController } from './course-units.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { SchoolResourcesController } from './resources.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      School,
      CourseUnit,
      Department,
      SchoolResource,
    ]),
    AuthModule,
  ],
  controllers: [
    ProgramsController,
    SchoolsController,
    CourseUnitsController,
    SchoolResourcesController,
  ],
  providers: [ProgramsService, SchoolsService, CourseUnitsService],
  exports: [ProgramsService, SchoolsService, CourseUnitsService],
})
export class ProgramsModule {}
