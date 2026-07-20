import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Brackets } from 'typeorm';
import { ShortCourse } from './entities/short-course.entity';
import {
  ShortCourseCategory,
  LearningMethod,
} from './entities/taxonomies.entity';
import { ShortCourseModule as ShortCourseModuleEntity } from './entities/short-course-module.entity';
import { Department } from '../programs/entities/department.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class ShortCoursesService {
  constructor(
    @InjectRepository(ShortCourse)
    private readonly shortCourseRepository: Repository<ShortCourse>,
    @InjectRepository(ShortCourseCategory)
    private readonly categoryRepository: Repository<ShortCourseCategory>,
    @InjectRepository(LearningMethod)
    private readonly learningMethodRepository: Repository<LearningMethod>,
  ) {}

  private localizeCourse(course: ShortCourse, locale: AppLocale): ShortCourse {
    const localized = {
      ...course,
      title: pickLocalized(locale, course.title, course.title_sw),
      about: pickLocalized(locale, course.about, course.about_sw) || course.about,
      overview:
        pickLocalized(locale, course.overview, course.overview_sw) ||
        course.overview,
      modules_description:
        pickLocalized(
          locale,
          course.modules_description,
          course.modules_description_sw,
        ) || course.modules_description,
      skills_gained:
        pickLocalized(locale, course.skills_gained, course.skills_gained_sw) ||
        course.skills_gained,
      target_audience:
        pickLocalized(
          locale,
          course.target_audience,
          course.target_audience_sw,
        ) || course.target_audience,
    } as ShortCourse;

    if (course.course_category) {
      localized.course_category = {
        ...course.course_category,
        name: pickLocalized(
          locale,
          course.course_category.name,
          (course.course_category as any).name_sw,
        ),
      } as any;
    }

    if (course.learning_method) {
      localized.learning_method = {
        ...course.learning_method,
        name: pickLocalized(
          locale,
          course.learning_method.name,
          (course.learning_method as any).name_sw,
        ),
      } as any;
    }

    if (course.school) {
      localized.school = {
        ...course.school,
        name: pickLocalized(
          locale,
          course.school.name,
          (course.school as any).name_sw,
        ),
      } as any;
    }

    if (course.department) {
      localized.department = {
        ...course.department,
        name: pickLocalized(
          locale,
          course.department.name,
          (course.department as any).name_sw,
        ),
      } as any;
    }

    return localized;
  }

  async findAll(options: any = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      school,
      category,
      mode,
      level,
      department,
      locale: localeRaw,
    } = options;
    const locale = normalizeLocale(localeRaw);

    const skip = (page - 1) * limit;

    const query = this.shortCourseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.school', 'school')
      .leftJoinAndSelect('course.department', 'department')
      .leftJoinAndSelect('course.course_category', 'category')
      .leftJoinAndSelect('course.learning_method', 'method')
      .leftJoinAndSelect('course.modules', 'modules');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('course.title ILIKE :search', { search: `%${search}%` })
            .orWhere('course.title_sw ILIKE :search', { search: `%${search}%` })
            .orWhere('course.overview ILIKE :search', { search: `%${search}%` })
            .orWhere('category.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (school) {
      query.andWhere('school.slug = :school', { school });
    }

    if (department) {
      query.andWhere('department.slug = :department', { department });
    }

    if (category) {
      query.andWhere('category.slug = :category', { category });
    }

    if (mode) {
      query.andWhere('course.mode_of_delivery = :mode', { mode });
    }

    if (level) {
      query.andWhere('course.level = :level', { level });
    }

    query.orderBy('course.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    if (data) {
      data.forEach((course) => {
        if (course.modules) {
          course.modules.sort((a, b) => a.order - b.order);
        }
      });
    }

    return {
      data: data.map((c) => this.localizeCourse(c, locale)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCategory(data: any) {
    if (!data.slug)
      data.slug = data.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async createLearningMethod(data: any) {
    const method = this.learningMethodRepository.create(data);
    return this.learningMethodRepository.save(method);
  }

  async findBySlug(slug: string, localeRaw?: string) {
    const course = await this.shortCourseRepository.findOne({
      where: { slug },
      relations: [
        'school',
        'department',
        'course_category',
        'learning_method',
        'modules',
      ],
    });

    if (course?.modules) {
      course.modules.sort((a, b) => a.order - b.order);
    }
    if (!course) throw new NotFoundException('Short course not found');
    return this.localizeCourse(course, normalizeLocale(localeRaw));
  }

  async findByCode(code: string, localeRaw?: string) {
    const course = await this.shortCourseRepository.findOne({
      where: { code },
      relations: [
        'school',
        'department',
        'course_category',
        'learning_method',
        'modules',
      ],
    });

    if (course?.modules) {
      course.modules.sort((a, b) => a.order - b.order);
    }
    if (!course) throw new NotFoundException('Short course not found');
    return this.localizeCourse(course, normalizeLocale(localeRaw));
  }

  async create(data: any) {
    const { modules, ...courseData } = data;
    const course: any = this.shortCourseRepository.create(courseData);

    if (modules && Array.isArray(modules)) {
      course.modules = modules.map((m: any, idx: number) => {
        const mod = this.shortCourseRepository.manager
          .getRepository(ShortCourseModuleEntity)
          .create(m) as any;
        if (mod.order === undefined) mod.order = idx + 1;
        return mod;
      });
    }

    return this.shortCourseRepository.save(course);
  }

  async update(id: string, data: any) {
    const { modules, ...courseData } = data;
    const course = await this.shortCourseRepository.findOne({
      where: { id },
      relations: ['modules'],
    });
    if (!course) throw new NotFoundException('Short course not found');

    Object.assign(course, courseData);

    if (modules && Array.isArray(modules)) {
      (course as any).modules = modules.map((m: any, idx: number) => {
        const mod = this.shortCourseRepository.manager
          .getRepository(ShortCourseModuleEntity)
          .create(m) as any;
        if (mod.order === undefined) mod.order = idx + 1;
        return mod;
      });
    }

    return this.shortCourseRepository.save(course);
  }

  async remove(id: string) {
    const course = await this.shortCourseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Short course not found');
    return this.shortCourseRepository.softDelete(id);
  }

  async getRelatedCourses(id: string) {
    const course = await this.shortCourseRepository.findOne({
      where: { id },
      relations: ['course_category', 'department'],
    });
    if (!course) return [];

    return this.shortCourseRepository.find({
      where: [
        { course_category: { id: course.course_category?.id }, id: Not(id) },
        { department: { id: course.department?.id }, id: Not(id) },
      ],
      relations: ['school', 'course_category', 'learning_method'],
      take: 4,
    });
  }

  async getRelatedProgrammes(id: string) {
    const course = await this.shortCourseRepository.findOne({
      where: { id },
      relations: ['department', 'school'],
    });
    if (!course) return [];

    const programRepo =
      this.shortCourseRepository.manager.getRepository('Program');

    // We match by department name (since department is a string in Program entity)
    // or by school
    const query = programRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.school', 'school')
      .where('1=0'); // Start with falsy

    if (course.department) {
      query.orWhere('p.department = :dept', { dept: course.department.name });
    }

    if (course.school) {
      query.orWhere('school.id = :schoolId', { schoolId: course.school.id });
    }

    return query.take(3).getMany();
  }

  // Taxonomy helpers
  async getDepartments() {
    const departmentRepo =
      this.shortCourseRepository.manager.getRepository('Department');
    return departmentRepo.find({ relations: ['school'] });
  }

  async getCategories() {
    return this.categoryRepository.find();
  }

  async getLearningMethods() {
    return this.learningMethodRepository.find();
  }
}
