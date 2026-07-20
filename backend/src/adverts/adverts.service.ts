import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advert } from './entities/advert.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class AdvertsService {
  constructor(
    @InjectRepository(Advert)
    private readonly advertsRepository: Repository<Advert>,
  ) {}

  private localizeAdvert(advert: Advert, locale: AppLocale): Advert {
    return {
      ...advert,
      title: pickLocalized(locale, advert.title, advert.title_sw),
      content:
        pickLocalized(locale, advert.content, advert.content_sw) ||
        advert.content,
      button_text:
        pickLocalized(locale, advert.button_text, advert.button_text_sw) ||
        advert.button_text,
    };
  }

  async findAll(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const rows = await this.advertsRepository.find({
      where: { is_active: true },
      order: { order: 'ASC', created_at: 'DESC' },
    });
    return rows.map((row) => this.localizeAdvert(row, locale));
  }

  async findAllAdmin() {
    return this.advertsRepository.find({
      order: { order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const advert = await this.advertsRepository.findOneBy({ id });
    if (!advert) throw new NotFoundException(`Advert with ID ${id} not found`);
    return this.localizeAdvert(advert, locale);
  }

  async create(data: any) {
    const advert = this.advertsRepository.create(data);
    return this.advertsRepository.save(advert);
  }

  async update(id: string, data: any) {
    await this.advertsRepository.findOneByOrFail({ id });
    await this.advertsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const advert = await this.advertsRepository.findOneBy({ id });
    if (!advert) throw new NotFoundException(`Advert with ID ${id} not found`);
    return this.advertsRepository.remove(advert);
  }
}
