import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { Setting } from '../settings/entities/setting.entity';
import { ChatIntelligence } from '../chat/entities/chat-intelligence.entity';
import { Faq } from '../faqs/entities/faq.entity';
import { OpenAIEmbeddings } from '@langchain/openai';

export interface FaqMatch {
  content: string;
  url: string;
  title: string;
  confidence: number;
  category?: string;
}

@Injectable()
export class AiAdvisorService {
  private readonly logger = new Logger(AiAdvisorService.name);

  private readonly STOPWORDS = new Set([
    'what',
    'when',
    'where',
    'which',
    'who',
    'why',
    'how',
    'does',
    'can',
    'will',
    'the',
    'are',
    'for',
    'that',
    'this',
    'have',
    'with',
    'from',
    'they',
    'your',
    'about',
    'would',
    'there',
    'their',
    'been',
    'more',
    'into',
    'also',
    'just',
    'much',
    'many',
    'some',
    'any',
    'get',
    'all',
    'has',
    'had',
    'not',
    'but',
    'its',
    'our',
    'you',
    'and',
    'the',
    'ouk',
    'open',
    'university',
    'kenya',
  ]);

  constructor(
    @InjectRepository(KnowledgeDocument)
    private knowledgeRepository: Repository<KnowledgeDocument>,
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    @InjectRepository(ChatIntelligence)
    private chatIntelligenceRepository: Repository<ChatIntelligence>,
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  /** Fetch the OpenAI API key from DB first, fallback to env var */
  private async getApiKey(): Promise<string> {
    try {
      const setting = await this.settingRepository.findOne({
        where: { key: 'openai_api_key' },
      });
      const key = setting?.value || process.env.OPENAI_API_KEY || '';
      if (!key || key.startsWith('sk-your')) {
        throw new ServiceUnavailableException(
          'OpenAI API key is not configured. Please set it in Portal Settings → Intelligence & AI.',
        );
      }
      return key;
    } catch (e: any) {
      if (e instanceof ServiceUnavailableException) throw e;
      if (e?.message?.includes('OpenAI')) throw e;
      return process.env.OPENAI_API_KEY || '';
    }
  }

  private async getEmbeddings(): Promise<OpenAIEmbeddings> {
    const apiKey = await this.getApiKey();
    return new OpenAIEmbeddings({
      apiKey,
      modelName: 'text-embedding-3-small',
    });
  }

  async ensurePgVectorExists() {
    try {
      await this.knowledgeRepository.query(
        'CREATE EXTENSION IF NOT EXISTS vector',
      );
      this.logger.log('pgvector extension ensured.');
    } catch (error) {
      this.logger.error('Failed to create pgvector extension', error);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.getEmbeddings();
    return embeddings.embedQuery(text);
  }

  async ingestKnowledge(content: string, metadata: Record<string, any>) {
    const embedding = await this.generateEmbedding(content);
    const doc = this.knowledgeRepository.create({
      content,
      metadata,
      embedding: `[${embedding.join(',')}]`,
    });
    await this.knowledgeRepository.save(doc);
    this.logger.log(`Ingested knowledge doc: ${doc.id}`);
    return doc;
  }

  async semanticSearch(
    query: string,
    limit: number = 8,
  ): Promise<KnowledgeDocument[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    return this.knowledgeRepository
      .createQueryBuilder('doc')
      .where('doc.is_active = true')
      .orderBy(`doc.embedding <=> '${embeddingString}'`, 'ASC')
      .limit(limit)
      .getMany();
  }

  /**
   * Layer 1 — FAQ Direct Match.
   * Uses PostgreSQL full-text search (with English stemming) as the primary
   * strategy so queries like "requirements", "instalment", "apply" naturally
   * match FAQ questions regardless of exact wording.
   * Falls back to ILIKE keyword matching as a secondary sweep.
   */
  async faqDirectSearch(query: string): Promise<FaqMatch[]> {
    const results: FaqMatch[] = [];

    // Extract meaningful keywords for the ILIKE fallback sweep
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !this.STOPWORDS.has(w));

    const score = (question: string, answer: string = ''): number => {
      if (keywords.length === 0) {
        if (question.toLowerCase().includes(query.toLowerCase())) return 0.9;
        return 0;
      }
      const haystack = (question + ' ' + answer).toLowerCase();
      const matched = keywords.filter((kw) => haystack.includes(kw)).length;
      return matched / keywords.length;
    };

    // --- Search admin-curated ChatIntelligence (highest priority) ---
    try {
      let ciQuery = this.chatIntelligenceRepository
        .createQueryBuilder('ci')
        .where('ci.is_active = true');

      if (keywords.length > 0) {
        // PostgreSQL full-text search: handles stemming + word order
        const ftsCondition = `to_tsvector('english', ci.question || ' ' || ci.answer) @@ plainto_tsquery('english', :query)`;
        const likeConditions = keywords
          .map((kw, i) => `LOWER(ci.question) LIKE :kw${i}`)
          .join(' OR ');
        const likeParams = Object.fromEntries(
          keywords.map((kw, i) => [`kw${i}`, `%${kw}%`]),
        );

        ciQuery = ciQuery.andWhere(`(${ftsCondition} OR (${likeConditions}))`, {
          query: query.replace(/[^a-zA-Z0-9\s]/g, ' '),
          ...likeParams,
        });
      } else {
        // If query consists entirely of stopwords, fallback to basic ILIKE search on the whole query
        const cleanQuery = query.toLowerCase().trim();
        if (cleanQuery.length > 0) {
          ciQuery = ciQuery.andWhere('LOWER(ci.question) LIKE :exact', {
            exact: `%${cleanQuery}%`,
          });
        } else {
          // If query is totally empty, return nothing
          ciQuery = ciQuery.andWhere('1=0');
        }
      }

      const ciItems = await ciQuery.limit(5).getMany();

      for (const item of ciItems) {
        results.push({
          content: `**Q: ${item.question}**\n\n${item.answer}`,
          url: item.metadata?.link || '/faqs',
          title: item.question,
          confidence: Math.min(score(item.question, item.answer) + 0.15, 1.0),
          category: item.category,
        });
      }
    } catch (e) {
      this.logger.warn(
        'ChatIntelligence search failed: ' + (e as Error).message,
      );
    }

    // --- Search official FAQs ---
    try {
      let faqQuery = this.faqRepository
        .createQueryBuilder('f')
        .where('f.is_active = true');

      if (keywords.length > 0) {
        const ftsCondition = `to_tsvector('english', f.question || ' ' || f.answer) @@ plainto_tsquery('english', :query)`;
        const likeConditions = keywords
          .map((kw, i) => `LOWER(f.question) LIKE :fkw${i}`)
          .join(' OR ');
        const likeParams = Object.fromEntries(
          keywords.map((kw, i) => [`fkw${i}`, `%${kw}%`]),
        );

        faqQuery = faqQuery.andWhere(
          `(${ftsCondition} OR (${likeConditions}))`,
          {
            query: query.replace(/[^a-zA-Z0-9\s]/g, ' '),
            ...likeParams,
          },
        );
      }

      const faqItems = await faqQuery
        .orderBy('f.display_order', 'ASC')
        .limit(5)
        .getMany();

      for (const faq of faqItems) {
        results.push({
          content: `**Q: ${faq.question}**\n\n${faq.answer}`,
          url: `/faqs`,
          title: faq.question,
          confidence: score(faq.question, faq.answer),
          category: faq.category,
        });
      }
    } catch (e) {
      this.logger.warn('FAQ search failed: ' + (e as Error).message);
    }

    // Deduplicate by title and return top 5
    const seen = new Set<string>();
    return results
      .filter((r) => {
        const key = r.title.slice(0, 40);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
}
