import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Throttle({ default: { limit: 40, ttl: 60000 } })
  @Post('query')
  async query(
    @Body() data: { session_id: string; content: string; user_id?: string },
  ) {
    await this.chatService.saveMessage({
      session_id: data.session_id,
      content: data.content,
      sender: 'user',
      user_id: data.user_id,
    });
    const botResponse = await this.chatService.getAIResponse(
      data.session_id,
      data.content,
      data.user_id,
    );
    return botResponse;
  }

  @Public()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Post('ingest')
  async ingest(
    @Body()
    data: {
      session_id: string;
      content: string;
      sender: 'bot' | 'user';
      platform?: string;
      user_id?: string;
    },
  ) {
    return this.chatService.saveMessage(data);
  }

  @Public()
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @Get('thread/:sessionId')
  async getThreadBySession(@Param('sessionId') sessionId: string) {
    return this.chatService.getThreadBySessionId(sessionId);
  }

  // --- Admin Conversations ---

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['chats.view', 'helpdesk.view', 'complaints.view'])
  @Get('admin/conversations')
  async list() {
    return this.chatService.listConversations();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['chats.view', 'helpdesk.view', 'complaints.view'])
  @Get('admin/conversations/:id')
  async getThread(@Param('id') id: string) {
    return this.chatService.getThread(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission(['chats.manage', 'chats.view', 'helpdesk.manage'])
  @Patch('admin/conversations/:id/archive')
  async archive(@Param('id') id: string) {
    return this.chatService.archiveConversation(id);
  }

  // --- Intelligence Hub ---

  @UseGuards(JwtAuthGuard)
  @Get('intelligence')
  listIntelligence() {
    return this.chatService.listIntelligence();
  }

  @UseGuards(JwtAuthGuard)
  @Post('intelligence')
  addIntelligence(@Body() data: any) {
    return this.chatService.addIntelligence(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('intelligence/bulk')
  addIntelligenceBulk(@Body() data: any[]) {
    return this.chatService.addIntelligenceBulk(data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('intelligence/:id')
  updateIntelligence(@Param('id') id: string, @Body() data: any) {
    return this.chatService.updateIntelligence(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('intelligence/:id')
  deleteIntelligence(@Param('id') id: string) {
    return this.chatService.deleteIntelligence(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('intelligence/index')
  triggerIndexing() {
    return this.chatService.triggerIndexing();
  }

  // --- Failure Monitoring ---

  @UseGuards(JwtAuthGuard)
  @Get('failures')
  listFailures(@Query('includeResolved') includeResolved?: string) {
    return this.chatService.listFailures(includeResolved === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Patch('failures/:id/resolve')
  resolveFailure(@Param('id') id: string, @Body('note') note: string) {
    return this.chatService.resolveFailure(id, note);
  }
}
