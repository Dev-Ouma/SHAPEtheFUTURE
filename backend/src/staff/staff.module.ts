import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffMember } from './entities/staff-member.entity';
import { ExecutiveType } from './entities/executive-type.entity';
import { StaffType } from './entities/staff-type.entity';
import { ProgramsModule } from '../programs/programs.module';
import { ResearchIntegrationModule } from '../research-integration/research-integration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffMember, ExecutiveType, StaffType]),
    ProgramsModule,
    ResearchIntegrationModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {
  constructor() {
    console.log('--- [DIAGNOSTIC] StaffModule Constructor Executed ---');
  }
}
