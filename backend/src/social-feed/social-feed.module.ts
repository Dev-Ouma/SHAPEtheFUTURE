import { Module } from '@nestjs/common';
import { SocialFeedService } from './social-feed.service';
import { SocialFeedController } from './social-feed.controller';
import { SettingsModule } from '../settings/settings.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SettingsModule, HttpModule],
  controllers: [SocialFeedController],
  providers: [SocialFeedService],
})
export class SocialFeedModule {}
