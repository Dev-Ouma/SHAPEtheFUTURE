import { Module } from '@nestjs/common';
import { SettingsModule } from '../../settings/settings.module';
import { FeedbackAiService } from './feedback-ai.service';

@Module({
  imports: [SettingsModule],
  providers: [FeedbackAiService],
  exports: [FeedbackAiService],
})
export class FeedbackSharedModule {}
