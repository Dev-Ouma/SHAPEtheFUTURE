import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private localizePage(page: Page | null, locale: AppLocale): Page | null {
    if (!page) return null;
    return {
      ...page,
      title: pickLocalized(locale, page.title, page.title_sw),
      summary: pickLocalized(locale, page.summary, page.summary_sw) || page.summary,
      content:
        pickLocalized(locale, page.content, page.content_sw) || page.content,
      meta_title:
        pickLocalized(locale, page.meta_title, page.meta_title_sw) ||
        page.meta_title,
      meta_description:
        pickLocalized(locale, page.meta_description, page.meta_description_sw) ||
        page.meta_description,
    } as Page;
  }

  async findAll(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const pages = await this.pageRepository.find({
      where: { is_published: true },
      order: { updated_at: 'DESC' as any },
    });
    return pages.map((p) => this.localizePage(p, locale)!);
  }

  async findAllAdmin() {
    return this.pageRepository.find({
      order: { updated_at: 'DESC' as any },
    });
  }

  async findBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const page = await this.pageRepository.findOne({
      where: { slug, is_published: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return this.localizePage(page, locale);
  }

  async update(id: string, updatePageDto: Partial<Page>) {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    const payload: any = { ...updatePageDto };
    if (payload.status !== undefined) {
      payload.status = this.normalizeStatus(payload.status);
      payload.is_published = payload.status === 'PUBLISHED';
    }
    Object.assign(page, payload);
    const saved = await this.pageRepository.save(page);
    void this.cmsCache.invalidatePages();
    return saved;
  }

  async updateStatus(
    id: string,
    status: any,
    approver_id?: string,
    review_notes?: string,
  ) {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    const normalized = this.normalizeStatus(status);
    page.status = normalized as any;
    if (approver_id) {
      page.approver = { id: approver_id } as any;
    }
    if (review_notes !== undefined) {
      page.review_notes = review_notes;
    }
    page.is_published = normalized === 'PUBLISHED';

    const saved = await this.pageRepository.save(page);
    void this.cmsCache.invalidatePages();
    return saved;
  }

  async create(createPageDto: CreatePageDto) {
    const payload: any = { ...createPageDto };
    if (payload.status !== undefined) {
      payload.status = this.normalizeStatus(payload.status);
      payload.is_published = payload.status === 'PUBLISHED';
    } else {
      payload.status = 'DRAFT';
      payload.is_published = false;
    }
    const page = this.pageRepository.create(payload);
    const saved = await this.pageRepository.save(page);
    void this.cmsCache.invalidatePages();
    return saved;
  }

  async upsert(createPageDto: CreatePageDto) {
    const existing = await this.pageRepository.findOne({
      where: { slug: createPageDto.slug },
    });
    if (existing) {
      Object.assign(existing, createPageDto);
      const saved = await this.pageRepository.save(existing);
      void this.cmsCache.invalidatePages();
      return saved;
    }
    return this.create(createPageDto);
  }

  async remove(id: string) {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    const removed = await this.pageRepository.softRemove(page);
    void this.cmsCache.invalidatePages();
    return removed;
  }

  async getCategories() {
    const categories = await this.pageRepository
      .createQueryBuilder('page')
      .select('DISTINCT page.parent_slug', 'slug')
      .where('page.parent_slug IS NOT NULL')
      .getRawMany();
    return categories.map((c) => c.slug);
  }

  private normalizeStatus(status: string): string {
    const raw = String(status || '').trim();
    const upper = raw.toUpperCase();
    const legacy: Record<string, string> = {
      IN_REVIEW: 'REVIEW',
      APPROVED: 'PUBLISHED',
    };
    if (legacy[upper]) return legacy[upper];
    if (['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'].includes(upper))
      return upper;
    return 'DRAFT';
  }
}
