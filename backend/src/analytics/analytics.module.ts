import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsMetric } from './entities/metric.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SearchAnalytic } from '../search/entities/search-analytics.entity';
import { ChatConversation, ChatMessage } from '../chat/entities/chat.entity';
import { ChatFailure } from '../chat/entities/chat-failure.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsMetric,
      SearchAnalytic,
      ChatConversation,
      ChatMessage,
      ChatFailure,
    ]),
    AuthModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
