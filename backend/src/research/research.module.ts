import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { ResearchProgrammesService } from './research-programmes.service';
import { Publication } from './entities/publication.entity';
import { ResearchProject } from './entities/project.entity';
import { Grant } from './entities/grant.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { ResearchProgramme } from './entities/research-programme.entity';
import { ResearchPartner } from './entities/partner.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Publication,
      ResearchProject,
      Grant,
      StaffMember,
      ResearchProgramme,
      ResearchPartner,
    ]),
    AuthModule,
  ],
  providers: [ResearchService, ResearchProgrammesService],
  controllers: [ResearchController],
  exports: [ResearchService, ResearchProgrammesService],
})
export class ResearchModule {}
