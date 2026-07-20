import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { Complaint } from './entities/complaint.entity';
import { ComplaintCategory } from './entities/complaint-category.entity';
import { ComplaintResponse } from './entities/complaint-response.entity';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { MailModule } from '../mail/mail.module';
import { SettingsModule } from '../settings/settings.module';
import { ComplaintsAiService } from './complaints-ai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Complaint,
      ComplaintCategory,
      ComplaintResponse,
      User,
      Role,
      StaffMember,
    ]),
    MailModule,
    SettingsModule,
    AuthModule,
  ],
  providers: [ComplaintsService, ComplaintsAiService],
  controllers: [ComplaintsController],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
