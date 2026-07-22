import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MailService } from '../mail/mail.service';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly mailService: MailService,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private stripHtml(html?: string | null): string {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').trim();
  }

  private localizeNews(news: News, locale: AppLocale): News {
    const content =
      pickLocalized(locale, news.content, news.content_sw) || news.content;
    const summaryEn = news.summary || this.stripHtml(content).slice(0, 200);
    return {
      ...news,
      title: pickLocalized(locale, news.title, news.title_sw),
      content,
      summary: pickLocalized(locale, summaryEn, news.summary_sw) || summaryEn,
    } as News;
  }

  private async broadcastPublication(news: News) {
    try {
      const subscribers =
        await this.subscriptionsService.getAllActiveSubscribers();
      if (!subscribers.length) return;

      const articleUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/news/${news.slug}`;
      const snippet = news.content
        ? news.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...'
        : 'Read the full article on our website.';

      const htmlContent = this.mailService.getBrandedTemplate(
        news.title,
        `<p>A new article has been published by the Open University of Kenya:</p>
         <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #003e48; margin: 20px 0;">
           <p style="margin:0; color:#334155; font-style:italic;">"${snippet}"</p>
         </div>
         <p>Click below to read the full story.</p>
         <div style="margin-top: 30px; text-align: center;">
           <a href="${articleUrl}" style="background-color: #003e48; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; display: inline-block;">Read Full Article</a>
         </div>`,
        undefined,
        'Institutional Broadcast Network',
      );

      for (const sub of subscribers) {
        this.mailService
          .sendEmail(
            'news',
            sub.email,
            `New Publication: ${news.title}`,
            htmlContent,
          )
          .catch((err) =>
            console.error(`Failed to broadcast to ${sub.email}:`, err),
          );
      }
    } catch (error) {
      console.error('Broadcast failed:', error);
    }
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    category?: string;
    status?: string;
    admin?: boolean;
    schoolSlug?: string;
    locale?: string;
  }) {
    const {
      page,
      limit,
      search,
      type,
      category,
      status,
      admin,
      schoolSlug,
      locale: localeRaw,
    } = params;
    const locale = normalizeLocale(localeRaw);
    const queryBuilder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.featured_menu', 'menu')
      .leftJoinAndSelect('news.school', 'school');

    if (!admin) {
      queryBuilder.andWhere('news.is_published = :is_published', {
        is_published: true,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(news.title ILIKE :search OR news.title_sw ILIKE :search OR news.content ILIKE :search OR news.category ILIKE :search OR news.summary ILIKE :search OR news.summary_sw ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (type && type !== 'All') {
      queryBuilder.andWhere('news.type = :type', { type });
    }

    if (category) {
      queryBuilder.andWhere('news.category = :category', { category });
    }

    if (status) {
      const normalized = this.normalizeStatus(status);
      queryBuilder.andWhere('news.status = :status', { status: normalized });
    }

    if (schoolSlug) {
      queryBuilder.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    const [items, total] = await queryBuilder
      .orderBy('news.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: admin
        ? items
        : items.map((item) => this.localizeNews(item, locale)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const news = await this.newsRepository.findOne({
      where: { slug, is_published: true },
    });
    if (!news) throw new NotFoundException('News article not found');
    return this.localizeNews(news, locale);
  }

  async findById(id: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const news = await this.newsRepository.findOne({
      where: { id, is_published: true },
    });
    if (!news) throw new NotFoundException('News article not found');
    return this.localizeNews(news, locale);
  }

  async create(createNewsDto: any) {
    const { featuredMenuId, ...data } = createNewsDto;
    if (data.status !== undefined) {
      data.status = this.normalizeStatus(data.status);
      data.is_published = data.status === 'PUBLISHED';
    }
    const news = this.newsRepository.create(data) as unknown as News;

    if (featuredMenuId && featuredMenuId !== '') {
      news.featuredMenuId = featuredMenuId;
    }

    const saved = await this.newsRepository.save(news);
    void this.cmsCache.invalidateNews();
    if (saved.is_published) {
      this.broadcastPublication(saved); // fire and forget
    }
    return saved;
  }

  async update(id: string, updateNewsDto: any) {
    const { featuredMenuId, ...data } = updateNewsDto;
    const news = (await this.newsRepository.findOne({ where: { id } })) as News;
    if (!news) throw new NotFoundException('Article not found');

    const wasPublished = news.is_published;

    if (data.status !== undefined) {
      data.status = this.normalizeStatus(data.status);
      data.is_published = data.status === 'PUBLISHED';
    }

    Object.assign(news, data);

    if (featuredMenuId !== undefined) {
      news.featuredMenuId =
        featuredMenuId && featuredMenuId !== '' ? featuredMenuId : null;
    }

    const saved = await this.newsRepository.save(news);
    void this.cmsCache.invalidateNews();
    // Featured news appears in menus
    if (featuredMenuId !== undefined) {
      void this.cmsCache.invalidateMenus();
    }

    if (!wasPublished && saved.is_published) {
      this.broadcastPublication(saved);
    }

    return saved;
  }

  async updateStatus(
    id: string,
    status: any,
    approver_id?: string,
    review_notes?: string,
  ) {
    const news = (await this.newsRepository.findOne({ where: { id } })) as any;
    if (!news) throw new NotFoundException('Article not found');

    const wasPublished = news.is_published;
    const normalized = this.normalizeStatus(status);

    news.status = normalized;
    if (approver_id) {
      news.approver = { id: approver_id } as any;
    }
    if (review_notes !== undefined) {
      news.review_notes = review_notes;
    }

    news.is_published = normalized === 'PUBLISHED';

    const saved = await this.newsRepository.save(news);
    void this.cmsCache.invalidateNews();

    if (!wasPublished && saved.is_published) {
      this.broadcastPublication(saved);
    }

    return saved;
  }

  async remove(id: string) {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) throw new NotFoundException('Article not found');
    const removed = await this.newsRepository.softRemove(news);
    void this.cmsCache.invalidateNews();
    return removed;
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
