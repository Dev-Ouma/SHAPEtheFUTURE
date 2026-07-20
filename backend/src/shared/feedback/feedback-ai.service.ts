import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import OpenAI from 'openai';

export interface AiClassificationResult {
  category_name: string;
  subcategory: string;
  sentiment: string;
  priority: string;
  tags: string[];
  keywords: string[];
  is_escalated: boolean;
  escalation_reason?: string;
  confidence_score: number;
}

@Injectable()
export class FeedbackAiService {
  private readonly logger = new Logger(FeedbackAiService.name);
  private openaiClient: OpenAI | null = null;
  private cachedApiKey: string | null = null;

  constructor(private readonly settingsService: SettingsService) {}

  private async getOpenAiClient(): Promise<OpenAI | null> {
    try {
      const setting = await this.settingsService.findOne('openai_api_key');
      const key = setting?.value || process.env.OPENAI_API_KEY || null;
      if (!key || key === 'sk-your-openai-api-key-here') return null;
      if (this.cachedApiKey !== key) {
        this.openaiClient = new OpenAI({ apiKey: key });
        this.cachedApiKey = key;
      }
      return this.openaiClient;
    } catch {
      return null;
    }
  }

  async classify(
    subject: string,
    description: string,
    options: {
      availableCategories: string[];
      domainLabel: string;
      userSuggestedCategory?: string;
    },
  ): Promise<AiClassificationResult | null> {
    const openai = await this.getOpenAiClient();
    if (!openai) {
      this.logger.warn(
        'OpenAI API key not configured. Skipping AI classification.',
      );
      return null;
    }

    const categoriesList = options.availableCategories.join(', ');

    try {
      const systemPrompt = `You are an AI Classification Engine for the Open University of Kenya ${options.domainLabel}.
Analyze the submission and extract structured metadata for triage.

Available Categories: ${categoriesList}

Respond with ONLY valid JSON:
{
  "category_name": "Best matching category from the list",
  "subcategory": "Specific sub-issue",
  "sentiment": "Positive", "Neutral", "Negative", or "Urgent",
  "priority": "Low", "Medium", "High", or "Critical",
  "tags": ["3-5", "relevant", "tags"],
  "keywords": ["key", "entities"],
  "is_escalated": boolean,
  "escalation_reason": "Brief reason if escalated, else null",
  "confidence_score": 0.0 to 1.0
}`;

      const userMessage = `User suggested category: ${options.userSuggestedCategory || 'None'}
Subject: ${subject}
Description: ${description}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;
      return JSON.parse(content) as AiClassificationResult;
    } catch (err) {
      this.logger.error('AI classification failed', err);
      return null;
    }
  }

  async suggestResponse(
    context: {
      subject: string;
      description: string;
      status: string;
      category?: string;
    },
    domainLabel: string,
  ): Promise<string> {
    const openai = await this.getOpenAiClient();
    if (!openai)
      return 'Thank you for your submission. We are reviewing your case and will respond shortly.';

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional ${domainLabel} officer at the Open University of Kenya. Draft a courteous, professional response.`,
          },
          {
            role: 'user',
            content: `Category: ${context.category || 'General'}
Status: ${context.status}
Subject: ${context.subject}
Description: ${context.description}

Draft a response (2-4 paragraphs, no placeholder brackets).`,
          },
        ],
        temperature: 0.5,
      });
      return response.choices[0]?.message?.content || '';
    } catch {
      return 'Thank you for your submission. We are reviewing your case and will respond shortly.';
    }
  }
}
