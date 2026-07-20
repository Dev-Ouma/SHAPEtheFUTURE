import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { Job } from './entities/job.entity';
import { Division } from './entities/division.entity';
import { JobCategory } from './entities/job-category.entity';
import { JobSpecialization } from './entities/job-specialization.entity';
import { Department } from '../programs/entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Division,
      JobCategory,
      JobSpecialization,
      Department,
    ]),
  ],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
