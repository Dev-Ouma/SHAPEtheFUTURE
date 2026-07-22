import { Module, forwardRef } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ContactController } from './contact.controller';
import { SettingsModule } from '../settings/settings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => SettingsModule), forwardRef(() => AuthModule)],
  controllers: [MailController, ContactController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
