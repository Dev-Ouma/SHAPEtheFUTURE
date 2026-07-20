import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin:
      (process.env.NODE_ENV || 'development') === 'production'
        ? [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://ouk.ac.ke',
            'https://www.ouk.ac.ke',
            ...(process.env.CORS_ORIGINS
              ? process.env.CORS_ORIGINS.split(',')
                  .map((o) => o.trim())
                  .filter(Boolean)
              : []),
          ]
        : true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Terminal connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Terminal disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @MessageBody() data: { session_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.session_id) return;
    client.join(data.session_id);
    this.logger.log(
      `Client ${client.id} joined session room: ${data.session_id}`,
    );

    // Optionally send last messages from history
    const thread = await this.chatService.listConversations(); // This lists all, we need one by session_id
    // For now we just acknowledge
    return { status: 'synchronized' };
  }

  @SubscribeMessage('user_message')
  async handleUserMessage(
    @MessageBody()
    data: {
      session_id: string;
      content: string;
      user_id?: string;
      guest_name?: string;
      guest_email?: string;
      platform?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Message from session ${data.session_id} [${data.platform || 'portal'}]: ${data.content}`,
    );

    // 1. Persist User Message
    await this.chatService.saveMessage({
      session_id: data.session_id,
      content: data.content,
      sender: 'user',
      user_id: data.user_id,
      platform: data.platform || 'portal',
      ...({
        guest_name: data.guest_name,
        guest_email: data.guest_email,
      } as any),
    });

    // 2. Broadcast user message to room (for other tabs/admin dashboard)
    this.server.to(data.session_id).emit('new_message', {
      session_id: data.session_id,
      content: data.content,
      sender: 'user',
      timestamp: new Date(),
    });

    // 3. Trigger AI Response
    const isAssigned = await this.chatService.isAssignedToAgent(
      data.session_id,
    );
    if (isAssigned) {
      this.logger.log(
        `Bot silenced for agent-assigned session: ${data.session_id}`,
      );
      return;
    }

    this.server.to(data.session_id).emit('typing', { is_typing: true });

    const botResponse = await this.chatService.getAIResponse(
      data.session_id,
      data.content,
      data.user_id,
    );

    // 4. Emit AI Response
    this.server.to(data.session_id).emit('typing', { is_typing: false });

    this.server.to(data.session_id).emit('new_message', {
      session_id: data.session_id,
      content: botResponse.response,
      sender: 'bot',
      timestamp: new Date(),
      links: botResponse.links,
      suggestions: botResponse.suggestions,
      actions: (botResponse as any).actions,
    });
  }

  @SubscribeMessage('request_agent')
  async handleRequestAgent(
    @MessageBody() data: { session_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Agent requested for session: ${data.session_id}`);

    // Update conversation status in DB
    await this.chatService.escalateConversation(data.session_id);

    // AI Handover Message
    this.server.to(data.session_id).emit('new_message', {
      session_id: data.session_id,
      content:
        "I'm connecting you to a support officer 🤝 They'll continue from here and can help with more complex issues.",
      sender: 'bot',
      timestamp: new Date(),
    });

    // Notify all terminals in this room (user and any listening admins)
    this.server
      .to(data.session_id)
      .emit('agent_requested', { session_id: data.session_id });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('agent_join')
  async handleAgentJoin(
    @MessageBody()
    data: { session_id: string; agent_name: string; agent_id?: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.session_id);
    this.logger.log(
      `Agent ${data.agent_name} joined session: ${data.session_id}`,
    );

    // Assign agent in background
    if (data.agent_id) {
      await this.chatService.assignAgent(data.session_id, data.agent_id);
    }

    // System message: Continuity
    this.server.to(data.session_id).emit('agent_joined', {
      agent_name: data.agent_name,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('agent_typing')
  async handleAgentTyping(
    @MessageBody() data: { session_id: string; is_typing: boolean },
  ) {
    this.server.to(data.session_id).emit('agent_typing', {
      is_typing: data.is_typing,
    });
  }

  @SubscribeMessage('close_conversation')
  async handleCloseConversation(@MessageBody() data: { session_id: string }) {
    this.logger.log(`Closing conversation for session: ${data.session_id}`);
    await this.chatService.closeConversation(data.session_id);

    // Notify room so student can see rating UI
    this.server.to(data.session_id).emit('conversation_closed', {
      session_id: data.session_id,
    });
  }

  @SubscribeMessage('submit_rating')
  async handleSubmitRating(
    @MessageBody() data: { session_id: string; rating: number },
  ) {
    this.logger.log(
      `Rating submitted for session ${data.session_id}: ${data.rating}`,
    );
    await this.chatService.submitRating(data.session_id, data.rating);

    return { status: 'submitted' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('admin_message')
  async handleAdminMessage(
    @MessageBody()
    data: {
      session_id: string;
      content: string;
      admin_id: string;
      admin_name?: string;
    },
  ) {
    // 1. Persist Admin Message
    await this.chatService.saveMessage({
      session_id: data.session_id,
      content: data.content,
      sender: 'admin',
      user_id: data.admin_id,
    });

    // 2. Broadcast to session
    this.server.to(data.session_id).emit('new_message', {
      session_id: data.session_id,
      content: data.content,
      sender: 'agent',
      agent_name: data.admin_name || 'Support Officer',
      timestamp: new Date(),
    });
  }
}
