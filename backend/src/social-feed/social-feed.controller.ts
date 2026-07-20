import { Controller, Get } from '@nestjs/common';
import { SocialFeedService } from './social-feed.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('social-feed')
export class SocialFeedController {
  constructor(private readonly socialFeedService: SocialFeedService) {}

  @Public()
  @Get()
  async getCombinedFeed() {
    return this.socialFeedService.getCombinedFeed();
  }
}
