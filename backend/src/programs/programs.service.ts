import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Program } from './entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private localizeProgram(program: Program, locale: AppLocale): Program {
    const localized = {
      ...program,
      title: pickLocalized(locale, program.title, program.title_sw),
      overview:
        pickLocalized(locale, program.overview, program.overview_sw) ||
        program.overview,
    } as Program;

    if (program.school) {
      localized.school = {
        ...program.school,
        name: pickLocalized(
          locale,
          program.school.name,
          (program.school as any).name_sw,
        ),
        description:
          pickLocalized(
            locale,
            program.school.description,
            (program.school as any).description_sw,
          ) || program.school.description,
      } as any;
    }

    if (program.department) {
      localized.department = {
        ...program.department,
        name: pickLocalized(
          locale,
          program.department.name,
          (program.department as any).name_sw,
        ),
        description:
          pickLocalized(
            locale,
            program.department.description,
            (program.department as any).description_sw,
          ) || program.department.description,
      } as any;
    }

    return localized;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    schoolSlug?: string;
    departmentSlug?: string;
    level?: string;
    mode?: string;
    isAdmin?: boolean;
    status?: string;
    locale?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      schoolSlug,
      departmentSlug,
      level,
      mode,
      isAdmin = false,
      status,
      locale: localeRaw,
    } = options;
    const locale = normalizeLocale(localeRaw);
    const skip = (page - 1) * limit;

    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.school', 'school')
      .leftJoinAndSelect('program.department', 'department')
      .loadRelationCountAndMap('program.unitsCount', 'program.units')
      .skip(skip)
      .take(limit);

    if (search) {
      const searchPattern = `%${search}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('program.title ILIKE :search', { search: searchPattern })
            .orWhere('program.title_sw ILIKE :search', {
              search: searchPattern,
            })
            .orWhere('program.slug ILIKE :search', { search: searchPattern })
            .orWhere('program.level ILIKE :search', { search: searchPattern })
            .orWhere('program.programme_code ILIKE :search', {
              search: searchPattern,
            });
        }),
      );
    }

    if (schoolSlug) {
      query.andWhere('school.slug ILIKE :schoolSlug', {
        schoolSlug: schoolSlug,
      });
    }

    if (departmentSlug) {
      query.andWhere('department.slug ILIKE :departmentSlug', {
        departmentSlug,
      });
    }

    if (level) {
      query.andWhere('program.level ILIKE :level', { level });
    }

    if (mode) {
      query.andWhere('program.mode_of_delivery LIKE :mode', {
        mode: `%${mode}%`,
      });
    }

    if (!isAdmin) {
      query.andWhere('program.is_published = :isPublished', {
        isPublished: true,
      });
      query.andWhere('program.status = :status', { status: 'PUBLISHED' });
    } else if (status) {
      query.andWhere('program.status = :status', { status });
    }

    try {
      const [data, total] = await query.getManyAndCount();

      return {
        data: isAdmin ? data : data.map((p) => this.localizeProgram(p, locale)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error('Programs findAll Error:', error);
      throw error;
    }
  }

  async findOne(id: string, localeRaw?: string, isAdmin = false) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      );
    if (!isUuid) {
      throw new NotFoundException('Program not found');
    }
    const where: Record<string, unknown> = { id };
    if (!isAdmin) {
      where.is_published = true;
      where.status = 'PUBLISHED';
    }
    const program = await this.programRepository.findOne({
      where,
      relations: ['school', 'department', 'units'],
    });
    if (!program) throw new NotFoundException('Program not found');
    if (isAdmin || localeRaw === undefined) return program;
    return this.localizeProgram(program, normalizeLocale(localeRaw));
  }

  async findBySlug(slug: string, isAdmin = false, localeRaw?: string) {
    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.school', 'school')
      .leftJoinAndSelect('program.department', 'department')
      .leftJoinAndSelect('program.units', 'units')
      .where('program.slug = :slug', { slug });

    if (!isAdmin) {
      query.andWhere('program.is_published = :isPublished', {
        isPublished: true,
      });
      query.andWhere('program.status = :status', { status: 'PUBLISHED' });
    }

    const program = await query.getOne();
    if (!program) throw new NotFoundException('Program not found');
    if (isAdmin) return program;
    return this.localizeProgram(program, normalizeLocale(localeRaw));
  }

  async create(createProgramDto: any) {
    const { schoolId, departmentId, ...data } = createProgramDto;
    const program = this.programRepository.create(data) as any;
    if (schoolId) {
      program.school = { id: schoolId } as any;
    }
    if (departmentId) {
      program.department = { id: departmentId } as any;
    }
    const saved = await this.programRepository.save(program);
    void this.cmsCache.invalidateProgrammes();
    return saved;
  }

  async update(id: string, updateProgramDto: any) {
    const { schoolId, departmentId, ...data } = updateProgramDto;
    const program = await this.findOne(id, undefined, true);
    Object.assign(program, data);
    if (schoolId) {
      program.school = { id: schoolId } as any;
    }
    if (departmentId) {
      program.department = { id: departmentId } as any;
    } else if (departmentId === null) {
      program.department = null as any;
    }
    const saved = await this.programRepository.save(program);
    void this.cmsCache.invalidateProgrammes();
    return saved;
  }

  async remove(id: string) {
    const program = await this.findOne(id, undefined, true);
    const removed = await this.programRepository.softRemove(program);
    void this.cmsCache.invalidateProgrammes();
    return removed;
  }
}
