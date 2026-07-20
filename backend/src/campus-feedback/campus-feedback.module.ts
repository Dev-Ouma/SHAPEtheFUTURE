import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampusFeedbackService } from './campus-feedback.service';
import { CampusFeedbackController } from './campus-feedback.controller';
import { CampusFeedbackLegacyController } from './campus-feedback-legacy.controller';
import { CampusFeedback } from './entities/campus-feedback.entity';
import { CampusFeedbackCategory } from './entities/campus-feedback-category.entity';
import { CampusFeedbackResponse } from './entities/campus-feedback-response.entity';
import { User } from '../auth/entities/user.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { MailModule } from '../mail/mail.module';
import { FeedbackSharedModule } from '../shared/feedback/feedback-shared.module';
import { AuthModule } from '../auth/auth.module';
import { IctModule } from '../ict/ict.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampusFeedback,
      CampusFeedbackCategory,
      CampusFeedbackResponse,
      User,
      StaffMember,
    ]),
    MailModule,
    FeedbackSharedModule,
    AuthModule,
    IctModule,
  ],
  providers: [CampusFeedbackService],
  controllers: [CampusFeedbackController, CampusFeedbackLegacyController],
  exports: [CampusFeedbackService],
})
export class CampusFeedbackModule {}
