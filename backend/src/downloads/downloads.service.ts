import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  Download,
  DownloadStatus,
  AccessLevel,
} from './entities/download.entity';
import { DownloadCategory } from './entities/download-category.entity';
import { DownloadLog } from './entities/download-log.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectRepository(Download)
    private downloadRepository: Repository<Download>,
    @InjectRepository(DownloadCategory)
    private categoryRepository: Repository<DownloadCategory>,
    @InjectRepository(DownloadLog)
    private logRepository: Repository<DownloadLog>,
  ) {}

  async findAll(options: {
    category?: string;
    tag?: string;
    search?: string;
    status?: DownloadStatus;
    featured?: boolean;
    isAdmin?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Download[]; total: number; totalPages: number }> {
    const {
      category,
      search,
      status,
      featured,
      isAdmin,
      page = 1,
      limit = 10,
    } = options;
    const skip = (page - 1) * limit;

    const query = this.downloadRepository
      .createQueryBuilder('download')
      .leftJoinAndSelect('download.category', 'category')
      .leftJoinAndSelect('download.tags', 'tags');

    // Public users only see Published documents
    if (!isAdmin) {
      query.andWhere('download.status = :published', {
        published: DownloadStatus.PUBLISHED,
      });
      query.andWhere(
        '(download.publish_at IS NULL OR download.publish_at <= :now)',
        { now: new Date() },
      );
      query.andWhere(
        '(download.unpublish_at IS NULL OR download.unpublish_at >= :now)',
        { now: new Date() },
      );
    } else if (status) {
      query.andWhere('download.status = :status', { status });
    }

    if (category) {
      query.andWhere('category.slug = :category', { category });
    }

    if (featured !== undefined) {
      query.andWhere('download.is_featured = :featured', { featured });
    }

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('download.title ILIKE :search', { search: `%${search}%` })
            .orWhere('download.summary ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('category.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    try {
      const [data, total] = await query
        .orderBy('download.is_featured', 'DESC')
        .addOrderBy('download.display_order', 'ASC')
        .addOrderBy('download.publish_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        data,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      const errorLog = `\n[${new Date().toISOString()}] DOWNLOADS_FETCH_ERROR: ${error.message}\nStack: ${error.stack}\nQuery: ${query.getSql()}\n`;
      fs.appendFileSync(
        path.join(process.cwd(), 'downloads_error.log'),
        errorLog,
      );
      throw error;
    }
  }

  async findAllCategories(): Promise<DownloadCategory[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async recordDownload(
    id: string,
    user?: User,
    metadata?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    const download = await this.downloadRepository.findOneBy({ id });
    if (!download) throw new NotFoundException('Document not found');

    // 1. Create Log
    const log = this.logRepository.create({
      download,
      user,
      ip_address: metadata?.ip,
      user_agent: metadata?.userAgent,
    });
    await this.logRepository.save(log);

    // 2. Update Stats
    await this.downloadRepository.increment({ id }, 'download_count', 1);

    // Simple popularity score update (count + recency weight)
    const popularityScore = download.download_count + 1;
    await this.downloadRepository.update(id, {
      last_downloaded_at: new Date(),
      popularity_score: popularityScore,
    });
  }

  async findBySlug(slug: string): Promise<Download> {
    const download = await this.downloadRepository.findOne({
      where: { slug, status: DownloadStatus.PUBLISHED },
      relations: ['category', 'tags'],
    });
    if (!download) throw new NotFoundException('Document not found');
    return download;
  }

  async findOne(id: string, isAdmin = false): Promise<Download> {
    const where: Record<string, unknown> = { id };
    if (!isAdmin) {
      where.status = DownloadStatus.PUBLISHED;
    }
    const download = await this.downloadRepository.findOne({
      where,
      relations: ['category', 'tags'],
    });
    if (!download) throw new NotFoundException('Document not found');
    return download;
  }

  async create(data: Partial<Download>): Promise<Download> {
    const download = this.downloadRepository.create(data);
    return this.downloadRepository.save(download);
  }

  async update(id: string, data: Partial<Download>): Promise<Download> {
    try {
      const download = await this.downloadRepository.preload({
        id,
        ...data,
      });

      if (!download) {
        throw new NotFoundException(`Download with ID ${id} not found`);
      }

      return await this.downloadRepository.save(download);
    } catch (error) {
      const errorLog = `\n[${new Date().toISOString()}] DOWNLOADS_UPDATE_ERROR: ${error.message}\nStack: ${error.stack}\nData: ${JSON.stringify(data)}\n`;
      fs.appendFileSync(
        path.join(process.cwd(), 'downloads_error.log'),
        errorLog,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const download = await this.findOne(id, true);
    await this.downloadRepository.softRemove(download);
  }
}
