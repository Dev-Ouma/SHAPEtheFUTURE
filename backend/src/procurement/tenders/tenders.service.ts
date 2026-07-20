import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Tender, TenderStatus } from './entities/tender.entity';
import { TenderCategory } from './entities/tender-category.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../../common/locale';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private readonly tenderRepository: Repository<Tender>,
    @InjectRepository(TenderCategory)
    private readonly categoryRepository: Repository<TenderCategory>,
  ) {}

  private localizeTender(tender: Tender, locale: AppLocale): Tender {
    return {
      ...tender,
      title: pickLocalized(locale, tender.title, tender.title_sw),
      description:
        pickLocalized(locale, tender.description, tender.description_sw) ||
        tender.description,
    };
  }

  async findAll(query?: {
    status?: string;
    category?: string;
    search?: string;
    locale?: string;
  }) {
    const locale = normalizeLocale(query?.locale);
    const qb = this.tenderRepository
      .createQueryBuilder('tender')
      .leftJoinAndSelect('tender.category', 'category')
      .leftJoinAndSelect('tender.department', 'department')
      .leftJoinAndSelect('tender.documents', 'documents');

    if (query?.status) {
      qb.andWhere('tender.status = :status', { status: query.status });
    }

    if (query?.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }

    if (query?.search) {
      qb.andWhere(
        '(tender.title ILIKE :search OR tender.title_sw ILIKE :search OR tender.referenceNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('tender.publishedAt', 'DESC');
    const rows = await qb.getMany();
    return rows.map((row) => this.localizeTender(row, locale));
  }

  async findOneBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const tender = await this.tenderRepository.findOne({
      where: { slug },
      relations: ['category', 'department', 'documents'],
    });

    if (!tender) throw new NotFoundException('Tender not found');
    return this.localizeTender(tender, locale);
  }

  async create(data: any) {
    const tender = this.tenderRepository.create(data);
    return this.tenderRepository.save(tender);
  }

  async update(id: string, data: any) {
    await this.tenderRepository.update(id, data);
    return this.tenderRepository.findOne({
      where: { id },
      relations: ['category', 'department', 'documents'],
    });
  }

  async remove(id: string) {
    return this.tenderRepository.softDelete(id);
  }

  async listCategories() {
    return this.categoryRepository.find();
  }
}
