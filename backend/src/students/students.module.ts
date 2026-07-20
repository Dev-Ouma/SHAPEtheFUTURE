import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { AuthModule } from '../auth/auth.module';
import { FinanceModule } from '../finance/finance.module';
import { MailModule } from '../mail/mail.module';
import { Program } from '../programs/entities/program.entity';

import { StudentAnnouncement } from './entities/student-announcement.entity';
import { StudentSupportService } from './entities/student-support-service.entity';
import { StudentClub } from './entities/student-club.entity';
import { StudentEvent } from './entities/student-event.entity';
import { StudentSuccessStory } from './entities/student-success-story.entity';

import { StudentQuickAction } from './entities/student-quick-action.entity';
import { StudentResource } from './entities/student-resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Program,
      StudentAnnouncement,
      StudentSupportService,
      StudentClub,
      StudentEvent,
      StudentSuccessStory,
      StudentQuickAction,
      StudentResource,
    ]),
    AuthModule,
    FinanceModule,
    MailModule,
  ],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
