import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import OpenAI from 'openai';
import { IctPriority } from './entities/ict-category.entity';

export interface IctTriageResult {
  category_name: string;
  priority: IctPriority;
  tags: string[];
  is_escalated: boolean;
  confidence_score: number;
}

@Injectable()
export class IctAiService {
  private readonly logger = new Logger(IctAiService.name);
  private client: OpenAI | null = null;
  private cachedKey: string | null = null;

  constructor(private readonly settingsService: SettingsService) {}

  private async getKey(): Promise<string | null> {
    try {
      const setting = await this.settingsService.findOne('openai_api_key');
      return setting?.value || process.env.OPENAI_API_KEY || null;
    } catch {
      return process.env.OPENAI_API_KEY || null;
    }
  }

  private async getClient(): Promise<OpenAI | null> {
    const key = await this.getKey();
    if (!key || key === 'sk-your-openai-api-key-here') return null;
    if (this.cachedKey !== key) {
      this.client = new OpenAI({ apiKey: key });
      this.cachedKey = key;
    }
    return this.client;
  }

  /** Triage a new ticket: suggest category, priority, tags. Returns null if AI unavailable. */
  async triageTicket(
    subject: string,
    description: string,
    categories: string[],
  ): Promise<IctTriageResult | null> {
    const openai = await this.getClient();
    if (!openai) {
      this.logger.warn(
        'OpenAI key not configured. Skipping ICT ticket triage.',
      );
      return null;
    }
    try {
      const systemPrompt = `You are an AI IT Service Desk triage engine for the Open University of Kenya.
Analyze a support ticket and extract structured metadata to help route it.

Available categories: ${categories.length ? categories.join(', ') : 'Network, Hardware, Software, Account/Email, LMS/Portal, Printing, Other'}.

Respond with ONLY valid JSON:
{
  "category_name": "the best-fitting category from the list",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "tags": ["3-5", "short", "technical", "tags"],
  "is_escalated": boolean (true for org-wide outage, security breach, data loss),
  "confidence_score": 0.0 to 1.0
}`;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Subject: ${subject}\nDescription: ${description}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return null;
      const parsed = JSON.parse(content) as IctTriageResult;
      if (!Object.values(IctPriority).includes(parsed.priority))
        parsed.priority = IctPriority.MEDIUM;
      return parsed;
    } catch (error) {
      this.logger.error('ICT ticket triage failed', error);
      return null;
    }
  }

  /** Draft a professional reply for an ICT ticket, optionally grounded in KB snippets. */
  async suggestResponse(
    ticket: any,
    kbSnippets: string[] = [],
  ): Promise<string> {
    const openai = await this.getClient();
    if (!openai) {
      return 'Thank you for contacting the ICT Service Desk. We have received your request and a technician will follow up shortly with next steps.';
    }
    try {
      const kbContext = kbSnippets.length
        ? `\n\nRelevant knowledge base guidance you may use:\n${kbSnippets.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
        : '';
      const systemPrompt = `You are a professional IT support technician for the Open University of Kenya ICT Service Desk.
Draft a polite, clear, and helpful reply to the user's ticket.
The reply should:
1. Acknowledge the issue.
2. Offer concrete first troubleshooting steps where appropriate.
3. Be concise (max 4-5 sentences).
4. Not invent specific dates, names, or credentials.
5. Sign off with "OUK ICT Service Desk".`;
      const userMessage = `Category: ${ticket.category?.name || 'General'}
Subject: ${ticket.subject}
Description: ${ticket.description}
Priority: ${ticket.priority}${kbContext}`;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.6,
      });
      return (
        response.choices[0]?.message?.content ||
        'We have received your request and are working on it. — OUK ICT Service Desk'
      );
    } catch (error) {
      this.logger.error('ICT response suggestion failed', error);
      return 'We have received your request and are working on it. — OUK ICT Service Desk';
    }
  }
}
