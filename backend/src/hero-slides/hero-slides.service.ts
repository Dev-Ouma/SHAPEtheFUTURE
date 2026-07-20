import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class HeroSlidesService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepository: Repository<HeroSlide>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private localizeSlide(slide: HeroSlide, locale: AppLocale): HeroSlide {
    return {
      ...slide,
      title: pickLocalized(locale, slide.title, slide.title_sw),
      subtitle:
        pickLocalized(locale, slide.subtitle, slide.subtitle_sw) ||
        slide.subtitle,
      description:
        pickLocalized(locale, slide.description, slide.description_sw) ||
        slide.description,
      tagline:
        pickLocalized(locale, slide.tagline, slide.tagline_sw) || slide.tagline,
      cta_text:
        pickLocalized(locale, slide.cta_text, slide.cta_text_sw) ||
        slide.cta_text,
    } as HeroSlide;
  }

  async findAll(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const slides = await this.heroSlideRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
    });
    return slides.map((s) => this.localizeSlide(s, locale));
  }

  /** Raw rows for admin editors (no locale projection; includes inactive). */
  async findAllAdmin() {
    return this.heroSlideRepository.find({
      order: { order: 'ASC' },
    });
  }

  findOne(id: string) {
    return this.heroSlideRepository.findOne({ where: { id } });
  }

  async create(data: any) {
    const slide = this.heroSlideRepository.create(data);
    const saved = await this.heroSlideRepository.save(slide);
    void this.cmsCache.invalidateHeroSlides();
    return saved;
  }

  async update(id: string, data: any) {
    await this.heroSlideRepository.update(id, data);
    const updated = await this.findOne(id);
    void this.cmsCache.invalidateHeroSlides();
    return updated;
  }

  async remove(id: string) {
    const result = await this.heroSlideRepository.delete(id);
    void this.cmsCache.invalidateHeroSlides();
    return result;
  }
}
