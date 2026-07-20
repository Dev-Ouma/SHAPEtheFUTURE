import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import {
  ChatConversation,
  ChatMessage,
  ConversationStatus,
} from './entities/chat.entity';
import {
  ChatIntelligence,
  IntelligenceType,
} from './entities/chat-intelligence.entity';
import { ChatFailure } from './entities/chat-failure.entity';
import {
  AiChatService,
  ChatMessage as AiChatMessage,
} from '../ai-advisor/ai-chat.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepository: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatIntelligence)
    private readonly intelligenceRepository: Repository<ChatIntelligence>,
    @InjectRepository(ChatFailure)
    private readonly failureRepository: Repository<ChatFailure>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly aiChatService: AiChatService,
  ) {}

  async getAIResponse(sessionId: string, message: string, userId?: string) {
    try {
      // 1. Get history for the current session to maintain context
      const thread = await this.getThreadBySessionId(sessionId);
      const history: AiChatMessage[] =
        thread?.messages?.map((m) => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.content,
        })) || [];

      // 2. Call the new RAG pipeline (OpenAI -> Ollama -> Static Fallback)
      const aiData = await this.aiChatService.chat(message, history);

      // 3. Save the bot's response to the database
      await this.saveMessage({
        session_id: sessionId,
        content: aiData.message,
        sender: 'bot',
        user_id: userId,
        links: aiData.sources.map((s) => ({ label: s.title, url: s.url })),
        suggestions: aiData.suggestions,
      });

      // 4. Handle Escalation
      if (aiData.escalate) {
        this.logger.warn(`Intel Escalation Triggered: ${message}`);

        const failure = this.failureRepository.create({
          query: message,
          bot_response: aiData.message,
          confidence: 0,
          session_id: sessionId,
        });
        await this.failureRepository.save(failure);
        await this.conversationRepository.update(
          { session_id: sessionId },
          { current_status: 'escalated' },
        );
      }

      // 5. Map the new ChatResponse structure to the format expected by the frontend WebSockets
      return {
        response: aiData.message,
        links: aiData.sources.map((s) => ({ label: s.title, url: s.url })),
        suggestions: aiData.suggestions,
        provider: aiData.provider,
      };
    } catch (error) {
      this.logger.error(`Institutional Intelligence failure: ${error.message}`);
      return {
        response:
          'I encountered an internal error. Please try again or contact the helpdesk.',
        links: [{ label: 'Contact Support', url: '/contact' }],
        suggestions: ['Try again later', 'Call us'],
      };
    }
  }

  async saveMessage(data: {
    session_id: string;
    content: string;
    sender: 'bot' | 'user' | 'admin';
    platform?: string;
    user_id?: string;
    links?: any;
    suggestions?: any;
  }) {
    if (!data.session_id) {
      this.logger.error('Engagement sync aborted: Missing required session_id');
      throw new BadRequestException('session_id is required');
    }

    // 1. Find or establish conversation (Allow ESCALATED too)
    let conversation = await this.conversationRepository.findOne({
      where: [
        { session_id: data.session_id, current_status: 'active' },
        { session_id: data.session_id, current_status: 'escalated' },
      ],
    });

    if (!conversation) {
      this.logger.log(
        `Establishing new communication terminal for session: ${data.session_id}`,
      );
      conversation = this.conversationRepository.create({
        session_id: data.session_id,
        platform: data.platform || 'portal',
        user:
          data.user_id && data.user_id.length > 5
            ? ({ id: data.user_id } as any)
            : null,
        guest_name: (data as any).guest_name || null,
        guest_email: (data as any).guest_email || null,
      });
      conversation = await this.conversationRepository.save(conversation);
    } else {
      // 1b. Update guest info if provided later
      if ((data as any).guest_name)
        conversation.guest_name = (data as any).guest_name;
      if ((data as any).guest_email)
        conversation.guest_email = (data as any).guest_email;
      if ((data as any).guest_name || (data as any).guest_email) {
        await this.conversationRepository.save(conversation);
      }
    }

    // 2. Index the message
    const message = this.messageRepository.create({
      content: data.content,
      sender: data.sender,
      conversation,
      links: data.links,
      suggestions: data.suggestions,
    });

    await this.messageRepository.save(message);

    // 3. Update pulse
    conversation.last_active = new Date();
    await this.conversationRepository.save(conversation);

    return message;
  }

  async getThreadBySessionId(sessionId: string) {
    return this.conversationRepository
      .findOne({
        where: [
          { session_id: sessionId, current_status: 'active' },
          { session_id: sessionId, current_status: 'escalated' },
        ],
        relations: ['messages'],
        order: {
          last_active: 'DESC',
        },
      })
      .then((conversation) => {
        // Sort messages ascending after fetching the conversation
        if (conversation && conversation.messages) {
          conversation.messages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
        }
        return conversation;
      });
  }

  async listConversations() {
    return this.conversationRepository.find({
      relations: ['messages', 'user'],
      order: { last_active: 'DESC' },
    });
  }

  async getThread(id: string) {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['messages', 'user'],
      order: { messages: { timestamp: 'ASC' } },
    });
  }

  async archiveConversation(id: string) {
    return this.conversationRepository.update(id, {
      current_status: 'archived',
    });
  }

  async triggerIndexing() {
    try {
      this.logger.warn(
        'Indexing triggered from Hub interface, this is now handled natively via the AiAdvisor admin settings panel.',
      );
      return {
        success: true,
        message: 'Indexing handled by local vector service.',
      };
    } catch (error) {
      this.logger.error(`Institutional indexing failure: ${error.message}`);
      throw new InternalServerErrorException(
        'Intelligence training synchronisation failed',
      );
    }
  }

  // --- Intelligence Training CRUD ---

  async listIntelligence() {
    return this.intelligenceRepository.find({ order: { created_at: 'DESC' } });
  }

  async addIntelligence(data: Partial<ChatIntelligence>) {
    const intel = this.intelligenceRepository.create(data);
    return this.intelligenceRepository.save(intel);
  }

  async addIntelligenceBulk(dataArray: Partial<ChatIntelligence>[]) {
    const records = this.intelligenceRepository.create(dataArray);
    return this.intelligenceRepository.save(records);
  }

  async updateIntelligence(id: string, data: Partial<ChatIntelligence>) {
    await this.intelligenceRepository.update(id, data);
    return this.intelligenceRepository.findOneBy({ id });
  }

  async deleteIntelligence(id: string) {
    return this.intelligenceRepository.delete(id);
  }

  // --- Failure Monitoring ---

  async listFailures(includeResolved = false) {
    return this.failureRepository.find({
      order: { created_at: 'DESC' },
      ...(includeResolved ? {} : { where: { is_resolved: false } }),
    });
  }

  async resolveFailure(id: string, note?: string) {
    return this.failureRepository.update(id, {
      is_resolved: true,
      resolution_note: note,
    });
  }

  async escalateConversation(sessionId: string) {
    return this.conversationRepository.update(
      { session_id: sessionId, current_status: 'active' },
      { current_status: 'escalated' },
    );
  }

  async assignAgent(sessionId: string, agentId: string) {
    return this.conversationRepository.update(
      { session_id: sessionId },
      { assigned_agent_id: agentId },
    );
  }

  async closeConversation(sessionId: string) {
    return this.conversationRepository.update(
      { session_id: sessionId },
      { current_status: 'active' }, // Revert to active so bot can answer again
    );
  }

  async submitRating(sessionId: string, rating: number) {
    return this.conversationRepository.update(
      { session_id: sessionId },
      {
        rating,
        rated_at: new Date(),
        current_status: 'active', // Ensure bot mode resumes
      },
    );
  }

  async isAssignedToAgent(sessionId: string): Promise<boolean> {
    const conv = await this.conversationRepository.findOne({
      where: { session_id: sessionId },
    });
    return conv ? !!conv.assigned_agent_id : false;
  }
}
