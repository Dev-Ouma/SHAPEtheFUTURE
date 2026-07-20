import { Injectable, Logger } from '@nestjs/common';
import { AiAdvisorService } from './ai-advisor.service';
import { SettingsService } from '../settings/settings.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../logs/entities/audit-log.entity';
import {
  ChatIntelligence,
  IntelligenceType,
} from '../chat/entities/chat-intelligence.entity';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  escalate: boolean;
  sources: { title: string; url: string }[];
  provider: 'openai' | 'ollama' | 'fallback';
}

// Intent → site URL mapping for intelligent link injection
const INTENT_LINKS: Array<{ keywords: string[]; label: string; url: string }> =
  [
    {
      keywords: [
        'apply',
        'application',
        'admission',
        'enrol',
        'enroll',
        'join',
        'register',
      ],
      label: 'Apply Now',
      url: 'https://portal.ouk.ac.ke',
    },
    {
      keywords: [
        'programme',
        'program',
        'degree',
        'course',
        'bachelor',
        'master',
        'phd',
        'diploma',
      ],
      label: 'View All Programmes',
      url: '/programmes',
    },
    {
      keywords: [
        'short course',
        'certificate',
        'professional development',
        'cpd',
      ],
      label: 'Browse Short Courses',
      url: '/short-courses',
    },
    {
      keywords: [
        'fee',
        'cost',
        'tuition',
        'payment',
        'pay',
        'charge',
        'amount',
        'scholarship',
      ],
      label: 'Fee Structure',
      url: '/fee-structure',
    },
    {
      keywords: [
        'scholarship',
        'bursary',
        'financial aid',
        'sponsorship',
        'funding',
      ],
      label: 'Scholarships',
      url: '/scholarships',
    },
    {
      keywords: ['timetable', 'schedule', 'calendar', 'semester', 'exam date'],
      label: 'Academic Calendar',
      url: '/timetable',
    },
    {
      keywords: [
        'exam',
        'examination',
        'test',
        'result',
        'grade',
        'transcript',
      ],
      label: 'Examinations',
      url: '/examinations',
    },
    {
      keywords: [
        'library',
        'book',
        'resource',
        'journal',
        'research',
        'publication',
        'repository',
      ],
      label: 'Library & Repository',
      url: '/library',
    },
    {
      keywords: [
        'contact',
        'reach',
        'location',
        'office',
        'phone',
        'email',
        'helpdesk',
        'support',
      ],
      label: 'Contact Us',
      url: '/contact',
    },
    {
      keywords: [
        'complaint',
        'complain',
        'grievance',
        'appeal',
        'issue',
        'problem',
      ],
      label: 'Complaints & Feedback',
      url: '/complaints',
    },
    {
      keywords: ['alumni', 'graduate', 'graduation', 'clearance'],
      label: 'Alumni & Graduation',
      url: '/alumni',
    },
    {
      keywords: [
        'staff',
        'lecturer',
        'faculty',
        'professor',
        'director',
        'dean',
      ],
      label: 'Staff Directory',
      url: '/staff',
    },
    {
      keywords: [
        'school',
        'ict',
        'education',
        'science',
        'arts',
        'department',
        'faculty',
      ],
      label: 'Schools & Departments',
      url: '/schools',
    },
    {
      keywords: [
        'portal',
        'student portal',
        'lms',
        'login',
        'e-learning',
        'moodle',
      ],
      label: 'Student Portal',
      url: 'https://portal.ouk.ac.ke',
    },
    {
      keywords: ['news', 'event', 'announcement', 'notice'],
      label: 'News & Events',
      url: '/news',
    },
    {
      keywords: ['service charter', 'service standard', 'service delivery'],
      label: 'Service Charter',
      url: '/service-charter',
    },
    {
      keywords: [
        'download',
        'form',
        'document',
        'handbook',
        'prospectus',
        'policy',
      ],
      label: 'Downloads',
      url: '/downloads',
    },
  ];

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private openaiClient: OpenAI | null = null;
  private cachedApiKey: string | null = null;

  constructor(
    private readonly aiAdvisorService: AiAdvisorService,
    private readonly settingsService: SettingsService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(ChatIntelligence)
    private readonly chatIntelligenceRepository: Repository<ChatIntelligence>,
  ) {}

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
   * Strict institutional system prompt.
   * OpenAI ONLY reasons over provided context — never invents OUK data.
   */
  private readonly SYSTEM_PROMPT = `You are the OUK AI Advisor — the official intelligent assistant for the Open University of Kenya (OUK), Kenya's dedicated open and distance learning university.

══════════════════════════════════════════
CRITICAL RULES — NEVER VIOLATE THESE
══════════════════════════════════════════

1. USE ONLY THE KNOWLEDGE BASE PROVIDED BELOW.
   • NEVER invent, guess, or assume any OUK-specific information: fees, policies, deadlines, staff names, programmes, contact details, or procedures.
   • If the answer is NOT in the knowledge base below, respond exactly:
     "I don't have that specific information available right now. I recommend contacting **support@ouk.ac.ke** or visiting [ouk.ac.ke](https://www.ouk.ac.ke) for the most accurate and up-to-date information."

2. ALWAYS INCLUDE CLICKABLE LINKS.
   • Use markdown link syntax for every relevant resource: [Link Text](url)
   • Prioritize URLs that appear in the knowledge base sources below.
   • Always end with at least one actionable link.

3. RESOLVE BEFORE ESCALATING.
   • Attempt a full answer from the knowledge base first.
   • Suggest raising a ticket ONLY when:
     – The issue needs account-specific information (student ID, results, balance)
     – The user explicitly asks for a human
     – You truly cannot help from the knowledge base

4. RESPONSE STRUCTURE (use markdown):
   • Direct answer first (2–4 sentences)
   • Bullet points for steps/lists
   • Bold key terms

5. TONE: Warm, professional, and encouraging. OUK students are often working adults — be supportive and clear.

6. COMPLETENESS: If the knowledge base has partial information, share what you know and direct the user where to find the rest.

══════════════════════════════════════════
OUK WEBSITE QUICK LINKS (always available)
══════════════════════════════════════════
• Apply: [Apply Now](https://portal.ouk.ac.ke)
• Programmes: [All Programmes](/programmes)
• Short Courses: [Short Courses](/short-courses)
• Fees: [Fee Structure](/fee-structure)
• Scholarships: [Scholarships](/scholarships)
• Contact: [Contact Us](/contact)
• FAQs: [FAQs](/faqs)
• Downloads: [Downloads & Forms](/downloads)
• News: [News & Events](/news)
• Library: [Library](/library)
• Service Charter: [Service Charter](/service-charter)
• Complaints: [Complaints](/complaints)
• Student Portal: [Portal](https://portal.ouk.ac.ke)
• Alumni: [Alumni](/alumni)
• Staff: [Staff Directory](/staff)
`;

  /** Ollama local LLM fallback */
  private async callOllama(prompt: string, context: string): Promise<string> {
    const fullPrompt = `${this.SYSTEM_PROMPT}\n\n=== KNOWLEDGE BASE ===\n${context || 'No context available.'}\n\n=== USER QUESTION ===\n${prompt}\n\n=== ANSWER ===`;
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tinyllama',
        prompt: fullPrompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 600 },
      }),
    });
    if (!response.ok)
      throw new Error('Ollama request failed: ' + response.status);
    const data = await response.json();
    return data.response || 'I was unable to generate a response.';
  }

  /**
   * Static fallback — used when all AI providers are unavailable.
   * When FAQ context is present, extracts and formats the answer cleanly.
   * Avoids dumping raw metadata headers into the user-facing response.
   */
  private generateStaticResponse(query: string, context: string): string {
    if (context && context.length > 100) {
      // Extract the first clean answer from FAQ context (strip metadata headers)
      const answerBlock = context.match(
        /\*\*Q:.*?\*\*\n\n([\s\S]+?)(?:\n\n---|$)/,
      );
      if (answerBlock) {
        const answer = answerBlock[1].trim().slice(0, 700);
        return `${answer}`;
      }

      // No Q&A block found — strip metadata noise and show clean excerpt
      const clean = context
        .replace(/=== LAYER \d+:[\s\S]+?===/g, '')
        .replace(/\[(?:FAQ|Source) \d+[^\]]*\]/g, '')
        .trim()
        .slice(0, 600);
      return `${clean}\n\nFor more information, [contact our support team](/contact) or visit [ouk.ac.ke](https://www.ouk.ac.ke).`;
    }

    // No context at all — keyword-based canned responses
    const lower = query.toLowerCase();
    if (lower.match(/apply|admission|enrol|join/)) {
      return 'To apply to OUK, visit the [Application Portal](https://portal.ouk.ac.ke). You can also contact **admissions@ouk.ac.ke** for guidance.';
    }
    if (lower.match(/fee|cost|pay|tuition|instalment|installment/)) {
      return 'Fee structures vary by programme and academic year. Visit [Fee Structure](/fee-structure) for the latest information, or contact **finance@ouk.ac.ke**.';
    }
    if (lower.match(/programme|course|degree|diploma|bachelor|master/)) {
      return 'OUK offers undergraduate, postgraduate, and professional programmes delivered online. Explore our [full programmes catalogue](/programmes).';
    }
    return 'For accurate and up-to-date information, please [contact our support team](/contact) or call us Mon–Fri, 8AM–5PM EAT.';
  }

  /** Map query intent to relevant quick-action suggestions with links */
  private generateSuggestions(query: string): string[] {
    const lower = query.toLowerCase();
    const chips: string[] = [];

    if (lower.match(/programme|degree|bachelor|master|phd|diploma|study/)) {
      chips.push(
        'Browse All Programmes',
        'View Short Courses',
        'Check Entry Requirements',
      );
    } else if (lower.match(/fee|cost|tuition|pay|amount|scholarship/)) {
      chips.push(
        'View Fee Structure',
        'Explore Scholarships',
        'Payment Options',
      );
    } else if (lower.match(/apply|admission|enrol|join/)) {
      chips.push('Apply Online', 'Admission Requirements', 'View Programmes');
    } else if (lower.match(/timetable|schedule|calendar|semester/)) {
      chips.push('View Timetable', 'Academic Calendar', 'Student Portal');
    } else if (lower.match(/exam|result|grade|transcript/)) {
      chips.push(
        'Examination Portal',
        'Request Transcript',
        'Contact Registry',
      );
    } else if (lower.match(/library|book|research|publication/)) {
      chips.push('Access Library', 'Research Repository', 'OUK Publications');
    } else if (lower.match(/complaint|issue|problem|help|support/)) {
      chips.push('Lodge a Complaint', 'Contact Support', 'Service Charter');
    } else if (lower.match(/staff|lecturer|contact/)) {
      chips.push('Staff Directory', 'Contact Us', 'Departmental Contacts');
    } else {
      chips.push('Explore Programmes', 'View FAQs', 'Contact Support');
    }
    return chips.slice(0, 3);
  }

  /** Extract intent-based links to inject alongside the AI response */
  private extractIntentLinks(
    query: string,
  ): Array<{ title: string; url: string }> {
    const lower = query.toLowerCase();
    const matched: Array<{ title: string; url: string }> = [];

    for (const intent of INTENT_LINKS) {
      if (intent.keywords.some((kw) => lower.includes(kw))) {
        matched.push({ title: intent.label, url: intent.url });
        if (matched.length >= 3) break;
      }
    }
    return matched;
  }

  /**
   * Main 4-Layer RAG Pipeline:
   *   Layer 1 → FAQ direct keyword match (ChatIntelligence + Faq tables)
   *   Layer 2 → Institutional Knowledge Engine (vector semantic search)
   *   Layer 3 → OpenAI reasoning (STRICTLY over retrieved context only)
   *   Layer 4 → Ollama fallback → Static fallback
   */
  async chat(
    userMessage: string,
    history: ChatMessage[] = [],
    ipAddress?: string,
  ): Promise<ChatResponse> {
    try {
      const suggestions = this.generateSuggestions(userMessage);
      const intentLinks = this.extractIntentLinks(userMessage);
      const lower = userMessage.toLowerCase();

      // Detect explicit escalation request — only escalate if user asks
      const escalationPhrases = [
        'speak to someone',
        'human agent',
        'raise a ticket',
        'transfer me',
        'i want a human',
        'talk to staff',
        'connect me to',
      ];
      const shouldEscalate = escalationPhrases.some((kw) => lower.includes(kw));

      // ═══════════════════════════════════════
      // LAYER 1 — FAQ Direct Match (fastest)
      // ═══════════════════════════════════════
      let faqMatches: Awaited<ReturnType<AiAdvisorService['faqDirectSearch']>> =
        [];
      try {
        faqMatches = await this.aiAdvisorService.faqDirectSearch(userMessage);
        if (faqMatches.length > 0) {
          this.logger.log(
            `Layer 1 FAQ match: top confidence=${faqMatches[0].confidence.toFixed(2)} for "${faqMatches[0].title}"`,
          );
        }
      } catch (e: any) {
        this.logger.warn('Layer 1 FAQ search failed: ' + e.message);
      }

      // ═══════════════════════════════════════
      // LAYER 2 — Institutional Knowledge Engine (vector search)
      // ═══════════════════════════════════════
      let vectorDocs: any[] = [];
      try {
        vectorDocs = await this.aiAdvisorService.semanticSearch(userMessage, 8);
        this.logger.log(
          `Layer 2 vector search returned ${vectorDocs.length} docs`,
        );
      } catch (e: any) {
        this.logger.warn('Layer 2 vector search failed: ' + e.message);
      }

      // ═══════════════════════════════════════
      // BUILD KNOWLEDGE CONTEXT
      // ═══════════════════════════════════════
      const faqContext =
        faqMatches.length > 0
          ? `=== LAYER 1: FAQ & TRAINED KNOWLEDGE (Highest Priority) ===\n${faqMatches
              .map(
                (r, i) =>
                  `[FAQ ${i + 1} | Category: ${r.category || 'general'} | Source: ${r.url}]\n${r.content}`,
              )
              .join('\n\n---\n\n')}`
          : '';

      const vectorContext =
        vectorDocs.length > 0
          ? `=== LAYER 2: INSTITUTIONAL KNOWLEDGE BASE ===\n${vectorDocs
              .map((doc, i) => {
                const meta = doc.metadata || {};
                return `[Source ${i + 1}: ${meta.title || 'OUK'} | Type: ${meta.type || 'general'} | URL: ${meta.url || ''}]\n${doc.content}`;
              })
              .join('\n\n---\n\n')}`
          : '';

      const fullContext = [faqContext, vectorContext]
        .filter(Boolean)
        .join('\n\n');
      const hasContext = fullContext.length > 50;

      // Deduplicated source links for frontend rendering
      const allSources: Array<{ title: string; url: string }> = [
        ...faqMatches.map((r) => ({ title: r.title, url: r.url })),
        ...vectorDocs
          .filter((d) => d.metadata?.url)
          .map((d) => ({
            title: d.metadata.title || 'OUK Reference',
            url: d.metadata.url,
          })),
        ...intentLinks,
      ]
        .filter(
          (s, i, arr) => s.url && arr.findIndex((x) => x.url === s.url) === i,
        )
        .slice(0, 6);

      // ═══════════════════════════════════════
      // LAYER 3/4 — OpenAI Reasoning (strict context bounds)
      // ═══════════════════════════════════════
      let aiMessage: string;
      let provider: ChatResponse['provider'] = 'fallback';

      const openai = await this.getOpenAiClient().catch(() => null);

      if (faqMatches.length > 0 && faqMatches[0].confidence >= 0.3) {
        // Use the seeded data directly without hitting OpenAI
        this.logger.log(`Using seeded data directly: ${faqMatches[0].title}`);
        aiMessage = faqMatches[0].content
          .replace(/^\*\*Q:.*?\*\*\n\n/, '')
          .trim();
        provider = 'fallback'; // We can consider this a fallback or 'database' provider
      } else if (openai) {
        try {
          const contextSection = hasContext
            ? `\n\n${fullContext}`
            : "\n\n[NO KNOWLEDGE BASE CONTENT FOUND — Tell the user you don't have that specific information and direct them to support@ouk.ac.ke or the relevant page on ouk.ac.ke. Do NOT invent any information.]";

          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            {
              role: 'system',
              content: `${this.SYSTEM_PROMPT}${contextSection}`,
            },
            ...history.slice(-8).map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user', content: userMessage },
          ];

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.3,
            max_tokens: 950,
          });
          aiMessage =
            completion.choices[0]?.message?.content ||
            'Could not generate a response.';
          provider = 'openai';
          this.logger.log(
            `Layer 3 OpenAI responded (${aiMessage.length} chars)`,
          );
        } catch (err: any) {
          this.logger.warn(
            `OpenAI failed (${err.message}), falling back to Ollama...`,
          );
          try {
            aiMessage = await this.callOllama(userMessage, fullContext);
            provider = 'ollama';
          } catch {
            aiMessage = this.generateStaticResponse(userMessage, fullContext);
            provider = 'fallback';
          }
        }
      } else {
        this.logger.log(
          'No OpenAI key configured and no FAQ match — trying Ollama...',
        );
        try {
          aiMessage = await this.callOllama(userMessage, fullContext);
          provider = 'ollama';
        } catch (err) {
          this.logger.warn('Ollama unavailable: ' + err);
          aiMessage = this.generateStaticResponse(userMessage, fullContext);
          provider = 'fallback';
        }
      }

      const response: ChatResponse = {
        message: aiMessage,
        suggestions,
        escalate: shouldEscalate,
        sources: allSources,
        provider,
      };

      const isUnanswered =
        (provider === 'fallback' && !hasContext && faqMatches.length === 0) ||
        aiMessage.includes("I don't have that specific information") ||
        aiMessage.toLowerCase().includes('let me connect you with a person');

      if (isUnanswered) {
        response.escalate = true;
        this.logUnansweredQuery(userMessage).catch((e) =>
          this.logger.warn('Failed to log unanswered query', e),
        );
      }

      // Audit log
      const audit = this.auditLogRepository.create({
        log_level: 'INFO',
        message: `AI Advisor Query processed`,
        service_name: 'ai-advisor',
        security: { action: 'CHAT_QUERY', status: 'SUCCESS' },
        request: {
          endpoint: '/ai/chat',
          request_body: { message: userMessage },
          response_body: {
            provider,
            escalate: shouldEscalate,
            faqMatches: faqMatches.length,
            vectorDocs: vectorDocs.length,
          },
        },
        network: { ip_address: ipAddress || 'unknown' },
      });
      await this.auditLogRepository
        .save(audit)
        .catch((e) => this.logger.warn('Audit log failed', e));

      return response;
    } catch (error: any) {
      this.logger.error('Chat pipeline failed', error);

      const errAudit = this.auditLogRepository.create({
        log_level: 'ERROR',
        message: `AI Advisor Query failed`,
        service_name: 'ai-advisor',
        security: {
          action: 'CHAT_QUERY',
          status: 'ERROR',
          error_message: String(error),
        },
        request: {
          endpoint: '/ai/chat',
          request_body: { message: userMessage },
        },
        network: { ip_address: ipAddress || 'unknown' },
      });
      await this.auditLogRepository.save(errAudit).catch(() => {});

      return {
        message:
          'I encountered an error processing your request. Please [contact our support team](/contact) or email **support@ouk.ac.ke**.',
        suggestions: ['Contact Support', 'View FAQs', 'Try Again'],
        escalate: true,
        sources: [{ title: 'Contact Support', url: '/contact' }],
        provider: 'fallback',
      };
    }
  }

  /** Generates a generic system response (for internal tasks like report summaries) */
  async generateSystemResponse(prompt: string): Promise<string> {
    const openai = await this.getOpenAiClient();
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3,
        });
        return (
          completion.choices[0]?.message?.content || 'No summary generated.'
        );
      } catch (e: any) {
        this.logger.error('OpenAI system response failed', e);
      }
    }
    try {
      return await this.callOllama(prompt, 'System task only.');
    } catch (e) {
      this.logger.error('Ollama fallback failed for system response', e);
    }
    return 'AI generation failed. No AI provider is active.';
  }

  /** Logs queries that the AI couldn't answer so admins can review and answer them */
  private async logUnansweredQuery(query: string): Promise<void> {
    if (!query || query.trim().length < 3) return;

    // Check if it already exists to prevent spamming
    const existing = await this.chatIntelligenceRepository.findOne({
      where: { question: query },
    });

    if (!existing) {
      const entry = this.chatIntelligenceRepository.create({
        question: query,
        answer: '', // Left blank for admin to fill
        type: IntelligenceType.FAQ,
        category: 'unanswered',
        is_active: false, // Inactive until admin answers and publishes it
        metadata: { source: 'ai_chat_fallback' },
      });
      await this.chatIntelligenceRepository.save(entry);
      this.logger.log(
        `Logged unanswered query to ChatIntelligence: "${query}"`,
      );
    }
  }
}
