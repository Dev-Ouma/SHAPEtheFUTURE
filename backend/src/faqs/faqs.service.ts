import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto, QueryFaqDto } from './dto/faq.dto';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqsRepository: Repository<Faq>,
  ) {}

  private localizeFaq(faq: Faq, locale: AppLocale): Faq {
    return {
      ...faq,
      question: pickLocalized(locale, faq.question, faq.question_sw),
      answer:
        pickLocalized(locale, faq.answer, faq.answer_sw) || faq.answer,
    } as Faq;
  }

  async findAll(query: QueryFaqDto, projectLocale = true) {
    const {
      search,
      category,
      is_active,
      page = 1,
      limit = 10,
      schoolSlug,
      locale: localeRaw,
    } = query;
    const locale = normalizeLocale(localeRaw);
    const skip = (page - 1) * limit;

    const queryBuilder = this.faqsRepository
      .createQueryBuilder('faq')
      .leftJoinAndSelect('faq.school', 'school');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('faq.question ILIKE :search', { search: `%${search}%` })
            .orWhere('faq.question_sw ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('faq.answer ILIKE :search', { search: `%${search}%` })
            .orWhere('faq.answer_sw ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (category) {
      queryBuilder.andWhere('faq.category = :category', { category });
    }

    if (schoolSlug) {
      queryBuilder.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('faq.is_active = :is_active', { is_active });
    }

    queryBuilder
      .orderBy('faq.display_order', 'ASC')
      .addOrderBy('faq.created_at', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: projectLocale
        ? data.map((faq) => this.localizeFaq(faq, locale))
        : data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string, localeRaw?: string) {
    return this.faqsRepository.findOne({ where: { id } }).then((faq) => {
      if (!faq || localeRaw === undefined) return faq;
      return this.localizeFaq(faq, normalizeLocale(localeRaw));
    });
  }

  create(createFaqDto: CreateFaqDto) {
    const faq = this.faqsRepository.create(createFaqDto);
    return this.faqsRepository.save(faq);
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    await this.faqsRepository.update(id, updateFaqDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.faqsRepository.softDelete(id);
    return { deleted: true };
  }
}
