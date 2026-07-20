import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { IctService } from './ict.service';
import { IctStatusService } from './ict-status.service';
import { IctKbService } from './ict-kb.service';
import { IctAiService } from './ict-ai.service';
import { IctPasswordService } from './ict-password.service';
import { IctController } from './ict.controller';
import { IctTicket } from './entities/ict-ticket.entity';
import { IctCategory } from './entities/ict-category.entity';
import { IctTicketResponse } from './entities/ict-ticket-response.entity';
import { IctSystem } from './entities/ict-system.entity';
import { IctIncident } from './entities/ict-incident.entity';
import { IctKbArticle } from './entities/ict-kb-article.entity';
import { UserTemporaryGrant } from './entities/user-temporary-grant.entity';
import { User } from '../auth/entities/user.entity';
import { AppPermission } from '../auth/entities/app-permission.entity';
import { Department } from '../programs/entities/department.entity';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IctTicket,
      IctCategory,
      IctTicketResponse,
      IctSystem,
      IctIncident,
      IctKbArticle,
      UserTemporaryGrant,
      User,
      AppPermission,
      Department,
    ]),
    MailModule,
    AuthModule,
    SettingsModule,
    TerminusModule,
  ],
  providers: [
    IctService,
    IctStatusService,
    IctKbService,
    IctAiService,
    IctPasswordService,
  ],
  controllers: [IctController],
  exports: [
    IctService,
    IctStatusService,
    IctKbService,
    IctAiService,
    IctPasswordService,
  ],
})
export class IctModule {}
