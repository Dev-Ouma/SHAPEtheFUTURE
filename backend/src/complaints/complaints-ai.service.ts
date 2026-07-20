import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import {
  ComplaintType,
  ComplaintSentiment,
  ComplaintPriority,
} from './entities/complaint.entity';
import OpenAI from 'openai';

export interface AiClassificationResult {
  category_name: string;
  subcategory: string;
  sentiment: ComplaintSentiment;
  priority: ComplaintPriority;
  tags: string[];
  keywords: string[];
  is_escalated: boolean;
  escalation_reason?: string;
  confidence_score: number;
}

@Injectable()
export class ComplaintsAiService {
  private readonly logger = new Logger(ComplaintsAiService.name);
  private openaiClient: OpenAI | null = null;
  private cachedApiKey: string | null = null;

  constructor(private readonly settingsService: SettingsService) {}

  private async getOpenAiKey(): Promise<string | null> {
    try {
      const setting = await this.settingsService.findOne('openai_api_key');
      return setting?.value || process.env.OPENAI_API_KEY || null;
    } catch {
      return process.env.OPENAI_API_KEY || null;
    }
  }

  private async getOpenAiClient(): Promise<OpenAI | null> {
    const key = await this.getOpenAiKey();
    if (!key || key === 'sk-your-openai-api-key-here') return null;
    if (this.cachedApiKey !== key) {
      this.openaiClient = new OpenAI({ apiKey: key });
      this.cachedApiKey = key;
    }
    return this.openaiClient;
  }

  /**
   * Analyzes a complaint using OpenAI to categorize and enrich it with metadata.
   */
  async classifyComplaint(
    subject: string,
    description: string,
    userSuggestedCategory?: string,
  ): Promise<AiClassificationResult | null> {
    const openai = await this.getOpenAiClient();

    if (!openai) {
      this.logger.warn(
        'OpenAI API key not configured. Skipping AI classification.',
      );
      return null;
    }

    try {
      const systemPrompt = `You are an AI Grievance Classification Engine for the Open University of Kenya.
Your job is to analyse a submitted complaint and extract structured metadata to help triage it.

Available Categories: Academic Affairs, Admissions, Examinations & Results, ICT Support & LMS, Finance & Fees, HR & Staff Welfare, Facilities & Infrastructure, Governance & Ethics, Other.

You must respond with ONLY valid JSON matching this structure:
{
  "category_name": "One of the available categories that best fits",
  "subcategory": "A specific sub-issue (e.g. 'Moodle Login', 'Missing Grades', 'Payroll Delay')",
  "sentiment": "Positive", "Neutral", "Negative", or "Urgent" (based on tone and severity),
  "priority": "Low", "Medium", "High", or "Critical",
  "tags": ["3-5", "relevant", "tags"],
  "keywords": ["key", "entities", "mentioned"],
  "is_escalated": boolean (true if mentions legal action, fraud, severe harm, or extreme distress),
  "escalation_reason": "Brief reason if escalated, else null",
  "confidence_score": 0.0 to 1.0
}`;

      const userMessage = `User suggested category: ${userSuggestedCategory || 'None'}
      
Subject: ${subject}
Description: ${description}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content) as AiClassificationResult;

      // Ensure enums match
      if (!Object.values(ComplaintSentiment).includes(parsed.sentiment)) {
        parsed.sentiment = ComplaintSentiment.NEGATIVE; // Default fallback
      }
      if (!Object.values(ComplaintPriority).includes(parsed.priority)) {
        parsed.priority = ComplaintPriority.MEDIUM;
      }

      this.logger.log(
        `AI successfully classified complaint with confidence ${parsed.confidence_score}`,
      );
      return parsed;
    } catch (error) {
      this.logger.error('Failed to classify complaint with AI', error);
      return null;
    }
  }

  async generateSuggestedResponse(complaint: any): Promise<string> {
    const openai = await this.getOpenAiClient();

    if (!openai) {
      return 'Thank you for reaching out. We have received your complaint and are looking into it. We will get back to you shortly.';
    }

    try {
      const systemPrompt = `You are a professional customer service representative for the Open University of Kenya.
Draft a polite, empathetic, and professional response to the following complaint.
The response should:
1. Acknowledge the issue clearly.
2. Provide reassurance that it is being handled.
3. Be concise (max 3-4 sentences).
4. Do NOT make up specific resolution dates or names.
5. Sign off with "Open University of Kenya Support Team".`;

      const userMessage = `Complaint Category: ${complaint.category?.name || 'General'}
Subject: ${complaint.subject}
Description: ${complaint.description}
Priority: ${complaint.priority}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content ||
        'We have received your complaint and are processing it.'
      );
    } catch (error) {
      this.logger.error('Failed to generate AI response', error);
      return 'We have received your complaint and are processing it.';
    }
  }
}
