import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private localizeSchool(school: School, locale: AppLocale): School {
    return {
      ...school,
      name: pickLocalized(locale, school.name, (school as any).name_sw),
      description:
        pickLocalized(
          locale,
          school.description,
          (school as any).description_sw,
        ) || school.description,
    } as School;
  }

  async findAll(
    options: { is_featured?: boolean; status?: string; locale?: string } = {},
  ) {
    const locale = normalizeLocale(options.locale);
    const where: any = {};
    if (options.is_featured !== undefined)
      where.is_featured = options.is_featured;
    if (options.status) where.status = options.status;

    const schools = await this.schoolRepository.find({
      where,
      relations: [
        'programmes',
        'departments',
        'dean',
        'staff',
        'research_projects',
        'faqs',
      ],
      order: { display_order: 'ASC', name: 'ASC' },
    });
    return schools.map((s) => this.localizeSchool(s, locale));
  }

  async findById(id: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: [
        'programmes',
        'departments',
        'dean',
        'staff',
        'research_projects',
        'faqs',
      ],
    });
    if (!school) throw new NotFoundException('School not found');
    return this.localizeSchool(school, locale);
  }

  async findBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const school = await this.schoolRepository.findOne({
      where: { slug },
      relations: [
        'programmes',
        'departments',
        'dean',
        'staff',
        'research_projects',
        'faqs',
      ],
    });
    if (!school) throw new NotFoundException('School profile not found');
    return this.localizeSchool(school, locale);
  }

  async create(createData: Partial<School>) {
    const school = this.schoolRepository.create(createData);
    const saved = await this.schoolRepository.save(school);
    void this.cmsCache.invalidateSchools();
    return saved;
  }

  async update(id: string, updateData: Partial<School>) {
    const school = await this.findById(id);
    Object.assign(school, updateData);
    const saved = await this.schoolRepository.save(school);
    void this.cmsCache.invalidateSchools();
    return saved;
  }

  async remove(id: string) {
    const school = await this.findById(id);
    const removed = await this.schoolRepository.softRemove(school);
    void this.cmsCache.invalidateSchools();
    return removed;
  }
}
