import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicalSupportService } from './technical-support.service';
import { TechnicalSupportController } from './technical-support.controller';
import { TechnicalSupportTicket } from './entities/technical-support-ticket.entity';
import { TechnicalSupportNote } from './entities/technical-support-note.entity';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { IctModule } from '../ict/ict.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicalSupportTicket,
      TechnicalSupportNote,
      User,
    ]),
    MailModule,
    AuthModule,
    IctModule,
  ],
  providers: [TechnicalSupportService],
  controllers: [TechnicalSupportController],
  exports: [TechnicalSupportService],
})
export class TechnicalSupportModule {}
