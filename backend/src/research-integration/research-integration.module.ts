import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcidService } from './orcid.service';
import { DspaceService } from './dspace.service';
import { ResearchIntegrationController } from './research-integration.controller';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Publication } from '../research/entities/publication.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([StaffMember, Publication]),
  ],
  controllers: [ResearchIntegrationController],
  providers: [OrcidService, DspaceService],
  exports: [OrcidService, DspaceService],
})
export class ResearchIntegrationModule {}
