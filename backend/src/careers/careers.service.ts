import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Job } from './entities/job.entity';
import { Division } from './entities/division.entity';
import { JobCategory } from './entities/job-category.entity';
import { JobSpecialization } from './entities/job-specialization.entity';
import { Department } from '../programs/entities/department.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Division)
    private readonly divRepo: Repository<Division>,
    @InjectRepository(JobCategory)
    private readonly categoryRepo: Repository<JobCategory>,
    @InjectRepository(JobSpecialization)
    private readonly specRepo: Repository<JobSpecialization>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  // ==========================
  // Taxonomy Endpoints
  // ==========================
  async getDivisions() {
    return this.divRepo.find({ order: { name: 'ASC' } });
  }
  async getCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }
  async getSpecializations() {
    return this.specRepo.find({ order: { name: 'ASC' } });
  }

  // ==========================
  // Jobs Endpoints
  // ==========================

  private localizeJob(job: Job, locale: AppLocale): Job {
    return {
      ...job,
      title: pickLocalized(locale, job.title, job.title_sw),
      summary:
        pickLocalized(locale, job.summary, job.summary_sw) || job.summary,
      description:
        pickLocalized(locale, job.description, job.description_sw) ||
        job.description,
      responsibilities:
        pickLocalized(locale, job.responsibilities, job.responsibilities_sw) ||
        job.responsibilities,
      requirements:
        pickLocalized(locale, job.requirements, job.requirements_sw) ||
        job.requirements,
      qualifications:
        pickLocalized(locale, job.qualifications, job.qualifications_sw) ||
        job.qualifications,
      benefits:
        pickLocalized(locale, job.benefits, job.benefits_sw) || job.benefits,
      additional_notes:
        pickLocalized(locale, job.additional_notes, job.additional_notes_sw) ||
        job.additional_notes,
    };
  }

  async createJob(dto: CreateJobDto) {
    const job = this.jobRepo.create({
      ...dto,
      specializations: [],
    });

    if (dto.division_id) {
      job.division = (await this.divRepo.findOne({
        where: { id: dto.division_id },
      })) as Division;
    }
    if (dto.department_id) {
      job.department = (await this.deptRepo.findOne({
        where: { id: dto.department_id },
      })) as Department;
    }
    if (dto.job_category_id) {
      job.job_category = (await this.categoryRepo.findOne({
        where: { id: dto.job_category_id },
      })) as JobCategory;
    }
    if (dto.specialization_ids && dto.specialization_ids.length > 0) {
      job.specializations = await this.specRepo.findBy({
        id: In(dto.specialization_ids),
      });
    }

    return this.jobRepo.save(job);
  }

  async findAllPublic(query: any = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 9;
    const search = query.search || '';
    const skip = (page - 1) * limit;
    const locale = normalizeLocale(query.locale);

    const now = new Date();
    const showPast = query.show_past === 'true';

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.division', 'division')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.job_category', 'job_category')
      .leftJoinAndSelect('job.specializations', 'specializations')
      .where('job.status = :status', { status: 'Published' })
      .andWhere('job.is_active = :isActive', { isActive: true });

    if (showPast) {
      qb.andWhere('job.application_deadline < :now', { now });
    } else {
      qb.andWhere(
        '(job.application_deadline >= :now OR job.application_deadline IS NULL)',
        { now },
      );
    }

    if (query.category) {
      qb.andWhere('job_category.slug = :categorySlug', {
        categorySlug: query.category,
      });
    }
    if (query.division) {
      qb.andWhere('division.id = :divisionId', { divisionId: query.division });
    }
    if (query.employment_type) {
      qb.andWhere('job.employment_type ILIKE :empType', {
        empType: query.employment_type,
      });
    }
    if (query.experience_level) {
      qb.andWhere('job.experience_level ILIKE :expLevel', {
        expLevel: query.experience_level,
      });
    }
    if (query.location) {
      qb.andWhere('job.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }
    if (query.is_remote === 'true') {
      qb.andWhere('job.is_remote = :isRemote', { isRemote: true });
    }
    if (query.is_featured === 'true') {
      qb.andWhere('job.is_featured = :isFeatured', { isFeatured: true });
    }
    if (search) {
      qb.andWhere(
        '(job.title ILIKE :search OR job.title_sw ILIKE :search OR job.reference_code ILIKE :search OR job.summary ILIKE :search OR job.summary_sw ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('job.is_featured', 'DESC')
      .addOrderBy('job.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [jobs, total] = await qb.getManyAndCount();

    jobs.forEach((j) => {
      if (j.application_deadline) {
        const deadline = new Date(j.application_deadline);
        if (deadline >= now) {
          j.days_remaining = Math.ceil(
            (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24),
          );
        }
      }
    });

    const allEmploymentTypes = await this.jobRepo
      .createQueryBuilder('job')
      .select('DISTINCT job.employment_type', 'employment_type')
      .where('job.status = :status', { status: 'Published' })
      .andWhere('job.is_active = :isActive', { isActive: true })
      .andWhere('job.employment_type IS NOT NULL')
      .getRawMany();

    const allExperienceLevels = await this.jobRepo
      .createQueryBuilder('job')
      .select('DISTINCT job.experience_level', 'experience_level')
      .where('job.status = :status', { status: 'Published' })
      .andWhere('job.is_active = :isActive', { isActive: true })
      .andWhere('job.experience_level IS NOT NULL')
      .getRawMany();

    return {
      data: jobs.map((j) => this.localizeJob(j, locale)),
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      filters: {
        employment_types: allEmploymentTypes
          .map((r) => r.employment_type)
          .filter(Boolean),
        experience_levels: allExperienceLevels
          .map((r) => r.experience_level)
          .filter(Boolean),
      },
    };
  }

  async findAllAdmin(query: any = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.division', 'division')
      .leftJoinAndSelect('job.department', 'department')
      .leftJoinAndSelect('job.job_category', 'job_category')
      .leftJoinAndSelect('job.specializations', 'specializations');

    if (search) {
      qb.where('job.title ILIKE :search', { search: `%${search}%` }).orWhere(
        'job.reference_code ILIKE :search',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('job.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const job = await this.jobRepo.findOne({
      where: { slug },
      relations: ['division', 'department', 'job_category', 'specializations'],
    });

    if (!job) throw new NotFoundException('Job not found');

    const now = new Date();
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      if (deadline < now) {
        job.status = 'Closed'; // dynamic override
      } else {
        job.days_remaining = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24),
        );
      }
    }

    return this.localizeJob(job, locale);
  }

  async findOne(id: string) {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['division', 'department', 'job_category', 'specializations'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async updateJob(id: string, dto: UpdateJobDto) {
    const job = await this.findOne(id);
    if (!job) throw new NotFoundException('Job not found');

    // Update primitive fields mapped from dto except specific relations
    const {
      division_id,
      department_id,
      job_category_id,
      specialization_ids,
      ...rest
    } = dto;
    Object.assign(job, rest);

    if (division_id !== undefined) {
      job.division = division_id
        ? ((await this.divRepo.findOne({
            where: { id: division_id },
          })) as Division)
        : (null as any);
    }
    if (department_id !== undefined) {
      job.department = department_id
        ? ((await this.deptRepo.findOne({
            where: { id: department_id },
          })) as Department)
        : (null as any);
    }
    if (job_category_id !== undefined) {
      job.job_category = job_category_id
        ? ((await this.categoryRepo.findOne({
            where: { id: job_category_id },
          })) as JobCategory)
        : (null as any);
    }
    if (specialization_ids !== undefined) {
      job.specializations =
        specialization_ids.length > 0
          ? await this.specRepo.findBy({ id: In(specialization_ids) })
          : [];
    }

    return this.jobRepo.save(job);
  }

  async deleteJob(id: string) {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return this.jobRepo.remove(job);
  }
}
