import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResearchProgramme,
  ResearchProgrammeStatus,
} from './entities/research-programme.entity';
import { ResearchProject } from './entities/project.entity';
import { Publication } from './entities/publication.entity';

@Injectable()
export class ResearchProgrammesService {
  constructor(
    @InjectRepository(ResearchProgramme)
    private readonly programmeRepository: Repository<ResearchProgramme>,
    @InjectRepository(ResearchProject)
    private readonly projectRepository: Repository<ResearchProject>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
  ) {}

  async findAll(query: {
    search?: string;
    schoolId?: string;
    departmentId?: string;
    status?: ResearchProgrammeStatus;
    leadResearcherId?: string;
    page?: number;
    limit?: number;
    statusVisibility?: string;
  }) {
    const {
      search,
      schoolId,
      departmentId,
      status,
      leadResearcherId,
      page = 1,
      limit = 10,
      statusVisibility = 'Published',
    } = query;

    const queryBuilder = this.programmeRepository
      .createQueryBuilder('programme')
      .leftJoinAndSelect('programme.lead_researcher', 'lead')
      .leftJoinAndSelect('programme.school', 'school')
      .leftJoinAndSelect('programme.department', 'department');

    if (statusVisibility !== 'all') {
      queryBuilder.andWhere('programme.status_visibility = :statusVisibility', {
        statusVisibility,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(programme.title ILIKE :search OR programme.summary ILIKE :search OR lead.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId });
    }

    if (departmentId) {
      queryBuilder.andWhere('department.id = :departmentId', { departmentId });
    }

    if (status) {
      queryBuilder.andWhere('programme.status = :status', { status });
    }

    if (leadResearcherId) {
      queryBuilder.andWhere('lead.id = :leadResearcherId', {
        leadResearcherId,
      });
    }

    queryBuilder
      .orderBy('programme.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string) {
    const programme = await this.programmeRepository.findOne({
      where: { slug },
      relations: [
        'lead_researcher',
        'team_members',
        'school',
        'department',
        'projects',
        'publications',
        'projects.personnel',
        'publications.staff_authors',
      ],
    });

    if (!programme) {
      throw new NotFoundException(
        `Research Programme with slug ${slug} not found`,
      );
    }

    return programme;
  }

  async findOne(id: string) {
    return this.programmeRepository.findOne({
      where: { id },
      relations: ['lead_researcher', 'team_members', 'school', 'department'],
    });
  }

  async create(data: any) {
    const {
      team_member_ids,
      lead_researcher_id,
      school_id,
      department_id,
      ...progData
    } = data;
    const programme = this.programmeRepository.create(
      progData as Partial<ResearchProgramme>,
    );

    if (lead_researcher_id) {
      programme.lead_researcher = { id: lead_researcher_id } as any;
    }

    if (team_member_ids && team_member_ids.length > 0) {
      programme.team_members = team_member_ids.map(
        (id: string) => ({ id }) as any,
      );
    }

    if (school_id) {
      programme.school = { id: school_id } as any;
    }

    if (department_id) {
      programme.department = { id: department_id } as any;
    }

    const saved = await this.programmeRepository.save(programme);
    await this.autoLinkOutputs(saved.id);
    return saved;
  }

  async update(id: string, data: any) {
    const {
      team_member_ids,
      lead_researcher_id,
      school_id,
      department_id,
      ...progData
    } = data;
    const programme = await this.programmeRepository.findOne({
      where: { id },
      relations: ['team_members'],
    });

    if (!programme) throw new NotFoundException('Research Programme not found');

    Object.assign(programme, progData);

    if (lead_researcher_id) {
      programme.lead_researcher = { id: lead_researcher_id } as any;
    }

    if (team_member_ids) {
      programme.team_members = team_member_ids.map(
        (id: string) => ({ id }) as any,
      );
    }

    if (school_id) {
      programme.school = { id: school_id } as any;
    }

    if (department_id) {
      programme.department = { id: department_id } as any;
    }

    const saved = await this.programmeRepository.save(programme);
    await this.autoLinkOutputs(id);
    return saved;
  }

  async remove(id: string) {
    return this.programmeRepository.softDelete(id);
  }

  async getStats() {
    const [total, active, completed] = await Promise.all([
      this.programmeRepository.count(),
      this.programmeRepository.count({
        where: { status: ResearchProgrammeStatus.ACTIVE },
      }),
      this.programmeRepository.count({
        where: { status: ResearchProgrammeStatus.COMPLETED },
      }),
    ]);

    // Aggregate unique researchers across all programmes
    const researchers = await this.programmeRepository.query(`
      SELECT COUNT(DISTINCT staff_id) as count 
      FROM (
        SELECT lead_researcher_id as staff_id FROM research_programmes
        UNION
        SELECT staff_id FROM research_programme_team
      ) as combined_researchers
    `);

    return {
      total,
      active,
      completed,
      researchersInvolved: parseInt(researchers[0].count),
    };
  }

  async autoLinkOutputs(programmeId: string) {
    const programme = await this.programmeRepository.findOne({
      where: { id: programmeId },
      relations: ['school'],
    });
    if (!programme) return;

    const keywords = [
      programme.title.toLowerCase(),
      ...(programme.slug ? [programme.slug.replace(/-/g, ' ')] : []),
      ...(programme.summary ? [programme.summary.toLowerCase()] : []),
    ];

    // Auto-link Projects
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.programmeId IS NULL')
      .andWhere((qb) => {
        keywords.forEach((kw, i) => {
          qb.orWhere(`project.title ILIKE :kw${i}`, { [`kw${i}`]: `%${kw}%` });
          qb.orWhere(`project.description ILIKE :kw${i}`, {
            [`kw${i}`]: `%${kw}%`,
          });
        });
        return qb;
      })
      .getMany();

    if (projects.length > 0) {
      await this.projectRepository
        .createQueryBuilder()
        .update(ResearchProject)
        .set({ programme: { id: programmeId } as any })
        .whereInIds(projects.map((p) => p.id))
        .execute();
    }

    // Auto-link Publications
    const publications = await this.publicationRepository
      .createQueryBuilder('pub')
      .where('pub.programmeId IS NULL')
      .andWhere((qb) => {
        keywords.forEach((kw, i) => {
          qb.orWhere(`pub.title ILIKE :kw${i}`, { [`kw${i}`]: `%${kw}%` });
          qb.orWhere(`pub.abstract ILIKE :kw${i}`, { [`kw${i}`]: `%${kw}%` });
        });
        return qb;
      })
      .getMany();

    if (publications.length > 0) {
      await this.publicationRepository
        .createQueryBuilder()
        .update(Publication)
        .set({ programme: { id: programmeId } as any })
        .whereInIds(publications.map((p) => p.id))
        .execute();
    }
  }
}
