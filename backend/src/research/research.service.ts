import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publication, PublicationType } from './entities/publication.entity';
import { ResearchProject, ProjectStatus } from './entities/project.entity';
import { Grant } from './entities/grant.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';

import { ResearchPartner, PartnerType } from './entities/partner.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class ResearchService {
  constructor(
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(ResearchProject)
    private readonly projectRepository: Repository<ResearchProject>,
    @InjectRepository(Grant)
    private readonly grantRepository: Repository<Grant>,
    @InjectRepository(StaffMember)
    private readonly staffMemberRepository: Repository<StaffMember>,
    @InjectRepository(ResearchPartner)
    private readonly partnerRepository: Repository<ResearchPartner>,
  ) {}

  private localizePublication(
    publication: Publication,
    locale: AppLocale,
  ): Publication {
    return {
      ...publication,
      title: pickLocalized(locale, publication.title, publication.title_sw),
      abstract:
        pickLocalized(locale, publication.abstract, publication.abstract_sw) ||
        publication.abstract,
      meta_title:
        pickLocalized(
          locale,
          publication.meta_title,
          publication.meta_title_sw,
        ) || publication.meta_title,
      meta_description:
        pickLocalized(
          locale,
          publication.meta_description,
          publication.meta_description_sw,
        ) || publication.meta_description,
    };
  }

  // --- Publications ---
  async findAll(query: {
    search?: string;
    authorId?: string;
    schoolId?: string;
    departmentId?: string;
    type?: PublicationType;
    year?: number;
    yearStart?: number;
    yearEnd?: number;
    page?: number;
    limit?: number;
    status?: string;
    locale?: string;
  }) {
    const {
      search,
      authorId,
      schoolId,
      departmentId,
      type,
      year,
      yearStart,
      yearEnd,
      page = 1,
      limit = 10,
      status = 'Published',
      locale: localeRaw,
    } = query;
    const locale = normalizeLocale(localeRaw);

    const queryBuilder = this.publicationRepository
      .createQueryBuilder('publication')
      .leftJoinAndSelect('publication.staff_authors', 'author')
      .leftJoinAndSelect('publication.school', 'school')
      .leftJoinAndSelect('publication.department', 'department');

    if (status !== 'all') {
      queryBuilder.where('publication.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(publication.title ILIKE :search OR publication.title_sw ILIKE :search OR publication.abstract ILIKE :search OR publication.abstract_sw ILIKE :search OR author.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (authorId) {
      queryBuilder.andWhere('author.id = :authorId', { authorId });
    }

    if (schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId });
    }

    if (departmentId) {
      queryBuilder.andWhere('department.id = :departmentId', { departmentId });
    }

    if (type) {
      queryBuilder.andWhere('publication.type = :type', { type });
    }

    if (year) {
      queryBuilder.andWhere('publication.publication_year = :year', { year });
    } else if (yearStart && yearEnd) {
      queryBuilder.andWhere(
        'publication.publication_year BETWEEN :yearStart AND :yearEnd',
        { yearStart, yearEnd },
      );
    }

    queryBuilder
      .orderBy('publication.publication_year', 'DESC')
      .addOrderBy('publication.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((row) => this.localizePublication(row, locale)),
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const publication = await this.publicationRepository
      .createQueryBuilder('publication')
      .leftJoinAndSelect('publication.staff_authors', 'author')
      .leftJoinAndSelect('publication.school', 'school')
      .leftJoinAndSelect('publication.department', 'department')
      .where('publication.slug = :slug', { slug })
      .andWhere('LOWER(publication.status) = :status', { status: 'published' })
      .getOne();

    if (!publication) {
      throw new NotFoundException(`Publication with slug ${slug} not found`);
    }

    return this.localizePublication(publication, locale);
  }

  async findOne(id: string) {
    const publication = await this.publicationRepository.findOne({
      where: { id },
      relations: ['staff_authors', 'school', 'department'],
    });
    if (!publication) {
      throw new NotFoundException(`Publication with id ${id} not found`);
    }
    return publication;
  }

  // --- Projects ---
  async findAllProjects(query: {
    search?: string;
    personId?: string;
    schoolId?: string;
    schoolSlug?: string;
    status?: string | ProjectStatus;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      personId,
      schoolId,
      schoolSlug,
      status,
      page = 1,
      limit = 10,
    } = query;
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.personnel', 'person')
      .leftJoinAndSelect('project.school', 'school');

    if (search) {
      queryBuilder.andWhere('project.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (personId) {
      queryBuilder.andWhere('person.id = :personId', { personId });
    }

    if (schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId });
    }

    if (schoolSlug) {
      queryBuilder.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneProject(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['personnel', 'school'],
    });

    if (!project) {
      throw new NotFoundException(`Research Project with ID ${id} not found`);
    }

    return project;
  }

  // --- Grants ---
  async findAllGrants(query: {
    search?: string;
    personId?: string;
    schoolId?: string;
    funderName?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      personId,
      schoolId,
      funderName,
      status,
      page = 1,
      limit = 10,
    } = query;
    const queryBuilder = this.grantRepository
      .createQueryBuilder('grant')
      .leftJoinAndSelect('grant.investigators', 'person')
      .leftJoinAndSelect('grant.school', 'school');

    if (search) {
      queryBuilder.andWhere('grant.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (personId) {
      queryBuilder.andWhere('person.id = :personId', { personId });
    }

    if (schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId });
    }

    if (funderName) {
      queryBuilder.andWhere('grant.funder_name ILIKE :funder', {
        funder: `%${funderName}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('grant.status = :status', { status });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneGrant(id: string) {
    const grant = await this.grantRepository.findOne({
      where: { id },
      relations: ['investigators', 'school'],
    });

    if (!grant) {
      throw new NotFoundException(`Research Grant with ID ${id} not found`);
    }

    return grant;
  }

  // --- Scholar Profile ---
  async getScholarProfile(slug: string) {
    const scholar = await this.staffMemberRepository.findOne({
      where: { profile_slug: slug },
      relations: ['school', 'department'],
    });

    if (!scholar) {
      throw new NotFoundException('Scholar not found');
    }

    const [publications, projects, grants] = await Promise.all([
      this.publicationRepository
        .createQueryBuilder('publication')
        .leftJoin('publication.staff_authors', 'author')
        .where('author.id = :id', { id: scholar.id })
        .orderBy('publication.publication_year', 'DESC')
        .getMany(),
      this.projectRepository
        .createQueryBuilder('project')
        .leftJoin('project.personnel', 'person')
        .where('person.id = :id', { id: scholar.id })
        .getMany(),
      this.grantRepository
        .createQueryBuilder('grant')
        .leftJoin('grant.investigators', 'person')
        .where('person.id = :id', { id: scholar.id })
        .getMany(),
    ]);

    // Calculate metrics (Mocking h-index for demonstration)
    const totalCitations = publications.reduce(
      (acc, pub) => acc + (pub.citation_count || 0),
      0,
    );
    const hIndex = this.calculateHIndex(
      publications.map((p) => p.citation_count || 0),
    );

    return {
      scholar,
      publications,
      projects,
      grants,
      metrics: {
        totalPublications: publications.length,
        totalCitations,
        hIndex,
        i10Index: publications.filter((p) => (p.citation_count || 0) >= 10)
          .length,
      },
    };
  }

  private calculateHIndex(citations: number[]): number {
    const sorted = citations.sort((a, b) => b - a);
    let h = 0;
    while (h < sorted.length && sorted[h] >= h + 1) {
      h++;
    }
    return h;
  }

  // --- Admin Methods ---
  async create(data: any) {
    const { author_ids, ...pubData } = data;
    const pub = this.publicationRepository.create(
      pubData as Partial<Publication>,
    );
    if (author_ids && author_ids.length > 0) {
      pub.staff_authors = author_ids.map((id: string) => ({ id }) as any);
    }
    return this.publicationRepository.save(pub);
  }

  async update(id: string, data: any) {
    const { author_ids, ...pubData } = data;
    const pub = await this.publicationRepository.findOne({
      where: { id },
      relations: ['staff_authors'],
    });
    if (!pub) throw new NotFoundException('Publication not found');
    Object.assign(pub, pubData);
    if (author_ids) {
      pub.staff_authors = author_ids.map((id: string) => ({ id }) as any);
    }
    return this.publicationRepository.save(pub);
  }

  async getStats() {
    const [pubCount, projectCount, grantCount] = await Promise.all([
      this.publicationRepository.count(),
      this.projectRepository.count(),
      this.grantRepository.count(),
    ]);

    const totalCitations =
      await this.publicationRepository.sum('citation_count');

    return {
      publications: pubCount,
      projects: projectCount,
      grants: grantCount,
      citations: totalCitations || 0,
      partners: 45, // Placeholder for now
    };
  }

  // --- Seeding ---
  async seedResearchData() {
    const scholars = await this.staffMemberRepository.find({ take: 3 });
    if (scholars.length === 0)
      return { message: 'No staff members found to seed research' };

    const results = [];
    for (const scholar of scholars) {
      // 1. Seed Projects
      const project = this.projectRepository.create({
        title: `Advanced ${scholar.specializations?.split(',')[0] || 'AI'} Frameworks for OUK`,
        slug: `advanced-research-project-${scholar.id.slice(0, 8)}`,
        description: `An flagship institutional project led by ${scholar.full_name} focused on pedagogical innovation and digital transformation in higher education settings.`,
        status: ProjectStatus.ONGOING,
        personnel: [scholar],
        principal_investigator: scholar,
        funder: 'Pan-African Research Council',
        budget: 1250000.0,
        currency: 'KES',
        keywords: ['Institutional Innovation', 'Digital Pedagogy'],
        start_date: '2023-01-01',
      });
      await this.projectRepository.save(project);

      // 2. Seed Grants
      const grant = this.grantRepository.create({
        title: `Global Excellence Grant in ${scholar.specializations?.split(',')[0] || 'Research'}`,
        slug: `global-excellence-grant-${scholar.id.slice(0, 8)}`,
        description: `Multi-year funding awarded to support the development of sustainable research infrastructure at OUK.`,
        funder_name: 'UNESCO Higher Ed Fund',
        amount: 85000.0,
        currency: 'USD',
        investigators: [scholar],
        lead_investigator: scholar,
        status: 'awarded',
        start_date: '2024-06-01',
        end_date: '2027-05-31',
      });
      await this.grantRepository.save(grant);

      // 3. Update Publications with more citations/metrics
      const pubs = await this.publicationRepository
        .createQueryBuilder('publication')
        .leftJoin('publication.staff_authors', 'author')
        .where('author.id = :id', { id: scholar.id })
        .getMany();

      for (const pub of pubs) {
        pub.citation_count = Math.floor(Math.random() * 150) + 10;
        pub.download_count = Math.floor(Math.random() * 1000) + 100;
        pub.view_count = Math.floor(Math.random() * 5000) + 500;
        await this.publicationRepository.save(pub);
      }

      results.push({ scholar: scholar.full_name, status: 'Seeded' });
    }

    return results;
  }

  async remove(id: string) {
    return this.publicationRepository.delete(id);
  }

  // --- Partners ---
  async findAllPartners(query: {
    schoolId?: string;
    schoolSlug?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { schoolId, schoolSlug, type, search, page = 1, limit = 10 } = query;
    const queryBuilder = this.partnerRepository
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.school', 'school');

    if (schoolId) {
      queryBuilder.andWhere('school.id = :schoolId', { schoolId });
    }

    if (schoolSlug) {
      queryBuilder.andWhere('school.slug = :schoolSlug', { schoolSlug });
    }

    if (type) {
      queryBuilder.andWhere('partner.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere('partner.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOnePartner(id: string) {
    return this.partnerRepository.findOne({
      where: { id },
      relations: ['school'],
    });
  }

  async createPartner(data: any) {
    const partner = this.partnerRepository.create(data);
    return this.partnerRepository.save(partner);
  }

  async updatePartner(id: string, data: any) {
    await this.partnerRepository.update(id, data);
    return this.findOnePartner(id);
  }

  async removePartner(id: string) {
    return this.partnerRepository.delete(id);
  }
}
