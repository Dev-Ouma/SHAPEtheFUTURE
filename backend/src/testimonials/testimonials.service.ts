import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialsRepository: Repository<Testimonial>,
  ) {}

  private localizeTestimonial(
    testimonial: Testimonial,
    locale: AppLocale,
  ): Testimonial {
    return {
      ...testimonial,
      content:
        pickLocalized(locale, testimonial.content, testimonial.content_sw) ||
        testimonial.content,
      author_role:
        pickLocalized(
          locale,
          testimonial.author_role,
          testimonial.author_role_sw,
        ) || testimonial.author_role,
    };
  }

  async findAll(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const rows = await this.testimonialsRepository.find({
      where: { is_active: true },
      order: { order: 'ASC', created_at: 'DESC' },
    });
    return rows.map((row) => this.localizeTestimonial(row, locale));
  }

  async findAllAdmin() {
    return this.testimonialsRepository.find({
      order: { order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const testimonial = await this.testimonialsRepository.findOneBy({ id });
    if (!testimonial)
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    return this.localizeTestimonial(testimonial, locale);
  }

  async create(data: any) {
    const testimonial = this.testimonialsRepository.create(data);
    return this.testimonialsRepository.save(testimonial);
  }

  async update(id: string, data: any) {
    await this.testimonialsRepository.findOneByOrFail({ id });
    await this.testimonialsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const testimonial = await this.testimonialsRepository.findOneBy({ id });
    if (!testimonial)
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    return this.testimonialsRepository.remove(testimonial);
  }
}
