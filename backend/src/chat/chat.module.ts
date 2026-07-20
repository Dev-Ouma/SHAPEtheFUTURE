import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatConversation, ChatMessage } from './entities/chat.entity';
import { ChatIntelligence } from './entities/chat-intelligence.entity';
import { ChatFailure } from './entities/chat-failure.entity';
import { SettingsModule } from '../settings/settings.module';
import { AiAdvisorModule } from '../ai-advisor/ai-advisor.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatConversation,
      ChatMessage,
      ChatIntelligence,
      ChatFailure,
    ]),
    HttpModule,
    ConfigModule,
    SettingsModule,
    AiAdvisorModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
