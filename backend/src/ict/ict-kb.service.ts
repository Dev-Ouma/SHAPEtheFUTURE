import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { IctKbArticle } from './entities/ict-kb-article.entity';
import { User } from '../auth/entities/user.entity';
import { CreateKbArticleDto, UpdateKbArticleDto } from './dto/ict-kb.dto';

@Injectable()
export class IctKbService {
  constructor(
    @InjectRepository(IctKbArticle)
    private kbRepo: Repository<IctKbArticle>,
  ) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async uniqueSlug(title: string, ignoreId?: string): Promise<string> {
    const base = this.slugify(title) || 'article';
    let slug = base;
    let n = 1;
    // Ensure uniqueness against other rows.
    while (true) {
      const existing = await this.kbRepo.findOne({ where: { slug } });
      if (!existing || existing.id === ignoreId) return slug;
      slug = `${base}-${++n}`;
    }
  }

  // ─── Admin ───────────────────────────────────────────────────────────────

  async findAllAdmin(): Promise<IctKbArticle[]> {
    return this.kbRepo.find({
      relations: ['author'],
      order: { updated_at: 'DESC' },
    });
  }

  async findOneAdmin(id: string): Promise<IctKbArticle> {
    const article = await this.kbRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(
    dto: CreateKbArticleDto,
    authorId?: string,
  ): Promise<IctKbArticle> {
    const article = this.kbRepo.create({
      title: dto.title,
      slug: await this.uniqueSlug(dto.title),
      summary: dto.summary,
      body: dto.body,
      category: dto.category,
      tags: dto.tags || [],
      is_published: dto.is_published ?? false,
      author: authorId ? ({ id: authorId } as User) : undefined,
    });
    return this.kbRepo.save(article);
  }

  async update(id: string, dto: UpdateKbArticleDto): Promise<IctKbArticle> {
    const article = await this.findOneAdmin(id);
    if (dto.title && dto.title !== article.title) {
      article.title = dto.title;
      article.slug = await this.uniqueSlug(dto.title, id);
    }
    if (dto.summary !== undefined) article.summary = dto.summary;
    if (dto.body !== undefined) article.body = dto.body;
    if (dto.category !== undefined) article.category = dto.category;
    if (dto.tags !== undefined) article.tags = dto.tags;
    if (dto.is_published !== undefined) article.is_published = dto.is_published;
    return this.kbRepo.save(article);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.kbRepo.delete(id);
    return { deleted: true };
  }

  async getStats() {
    const all = await this.kbRepo.find();
    const published = all.filter((a) => a.is_published);
    const byCategory: Record<string, number> = {};
    all.forEach((a) => {
      const c = a.category || 'Uncategorized';
      byCategory[c] = (byCategory[c] || 0) + 1;
    });
    return {
      total: all.length,
      published: published.length,
      drafts: all.length - published.length,
      totalViews: all.reduce((s, a) => s + (a.views || 0), 0),
      helpful: all.reduce((s, a) => s + (a.helpful_yes || 0), 0),
      byCategory: Object.entries(byCategory).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }

  // ─── Public / self-service ───────────────────────────────────────────────

  async findPublished(
    search?: string,
    category?: string,
  ): Promise<IctKbArticle[]> {
    const qb = this.kbRepo
      .createQueryBuilder('a')
      .where('a.is_published = true');
    if (category && category !== 'all') {
      qb.andWhere('a.category = :category', { category });
    }
    if (search) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('a.title ILIKE :q', { q: `%${search}%` })
            .orWhere('a.summary ILIKE :q', { q: `%${search}%` })
            .orWhere('a.body ILIKE :q', { q: `%${search}%` })
            .orWhere('a.tags::text ILIKE :q', { q: `%${search}%` });
        }),
      );
    }
    return qb
      .orderBy('a.views', 'DESC')
      .addOrderBy('a.updated_at', 'DESC')
      .getMany();
  }

  async findBySlug(slug: string): Promise<IctKbArticle> {
    const article = await this.kbRepo.findOne({
      where: { slug, is_published: true },
    });
    if (!article) throw new NotFoundException('Article not found');
    await this.kbRepo.increment({ id: article.id }, 'views', 1);
    article.views += 1;
    return article;
  }

  async recordFeedback(
    slug: string,
    vote: 'yes' | 'no',
  ): Promise<{ recorded: boolean }> {
    const article = await this.kbRepo.findOne({ where: { slug } });
    if (!article) throw new NotFoundException('Article not found');
    if (vote !== 'yes' && vote !== 'no')
      throw new BadRequestException('Invalid vote');
    await this.kbRepo.increment(
      { id: article.id },
      vote === 'yes' ? 'helpful_yes' : 'helpful_no',
      1,
    );
    return { recorded: true };
  }

  // Deterministic keyword match used to surface relevant KB articles for a ticket.
  async suggestForText(text: string, limit = 4): Promise<IctKbArticle[]> {
    const published = await this.kbRepo.find({ where: { is_published: true } });
    if (!published.length) return [];
    const terms = Array.from(
      new Set((text || '').toLowerCase().match(/[a-z0-9]{4,}/g) || []),
    );
    if (!terms.length) return published.slice(0, limit);

    const scored = published.map((a) => {
      const haystack =
        `${a.title} ${a.summary || ''} ${(a.tags || []).join(' ')} ${a.category || ''}`.toLowerCase();
      const score = terms.reduce(
        (s, t) => s + (haystack.includes(t) ? 1 : 0),
        0,
      );
      return { a, score };
    });
    return scored
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, limit)
      .map((x) => x.a);
  }
}
