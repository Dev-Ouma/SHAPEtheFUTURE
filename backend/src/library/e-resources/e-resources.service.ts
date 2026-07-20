import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import {
  EResource,
  EResourceType,
  EResourceAccessType,
} from './entities/e-resource.entity';
import { EResourceProvider } from './entities/provider.entity';
import { EResourceSubject } from './entities/subject.entity';

@Injectable()
export class EResourcesService {
  constructor(
    @InjectRepository(EResource)
    private readonly eResourceRepository: Repository<EResource>,
    @InjectRepository(EResourceProvider)
    private readonly providerRepository: Repository<EResourceProvider>,
    @InjectRepository(EResourceSubject)
    private readonly subjectRepository: Repository<EResourceSubject>,
  ) {}

  async findAll(
    filters: {
      search?: string;
      type?: string;
      subjectId?: string;
      providerId?: string;
      isFeatured?: boolean;
      status?: string;
    } = {},
  ) {
    const query = this.eResourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.provider', 'provider')
      .leftJoinAndSelect('resource.subjects', 'subject');

    if (filters.search) {
      query.andWhere(
        '(resource.title ILIKE :search OR resource.summary ILIKE :search OR provider.name ILIKE :search)',
        {
          search: `%${filters.search}%`,
        },
      );
    }

    if (filters.type) {
      query.andWhere('resource.resource_type = :type', { type: filters.type });
    }

    if (filters.subjectId) {
      query.andWhere('subject.id = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    if (filters.providerId) {
      query.andWhere('provider.id = :providerId', {
        providerId: filters.providerId,
      });
    }

    if (filters.isFeatured !== undefined) {
      query.andWhere('resource.is_featured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters.status) {
      query.andWhere('resource.status = :status', { status: filters.status });
    }

    query.orderBy('resource.display_order', 'ASC');
    query.addOrderBy('resource.created_at', 'DESC');

    return query.getMany();
  }

  async findOne(id: string) {
    const resource = await this.eResourceRepository.findOne({
      where: { id },
      relations: ['provider', 'subjects'],
    });
    if (!resource)
      throw new NotFoundException(`E-Resource with ID "${id}" not found`);
    return resource;
  }

  async findBySlug(slug: string) {
    const resource = await this.eResourceRepository.findOne({
      where: { slug },
      relations: ['provider', 'subjects'],
    });
    if (!resource)
      throw new NotFoundException(`E-Resource with slug "${slug}" not found`);
    return resource;
  }

  async create(data: any): Promise<EResource> {
    const { subjectIds, providerId, ...rest } = data;
    const resource = this.eResourceRepository.create(
      rest as Partial<EResource>,
    );

    if (providerId) {
      const provider = await this.providerRepository.findOneBy({
        id: providerId,
      });
      if (provider) resource.provider = provider;
    }

    if (subjectIds && subjectIds.length > 0) {
      resource.subjects = await this.subjectRepository.findBy({
        id: In(subjectIds),
      });
    }

    return this.eResourceRepository.save(resource);
  }

  async update(id: string, data: any): Promise<EResource> {
    const resource = await this.findOne(id);
    const { subjectIds, providerId, ...rest } = data;

    Object.assign(resource, rest);

    if (providerId !== undefined) {
      if (providerId) {
        const provider = await this.providerRepository.findOneBy({
          id: providerId,
        });
        resource.provider = provider || null;
      } else {
        resource.provider = null;
      }
    }

    if (subjectIds) {
      resource.subjects = await this.subjectRepository.findBy({
        id: In(subjectIds),
      });
    }

    return this.eResourceRepository.save(resource);
  }

  async remove(id: string) {
    const resource = await this.findOne(id);
    return this.eResourceRepository.remove(resource);
  }

  // Provider Helpers
  async findAllProviders() {
    return this.providerRepository.find({ order: { name: 'ASC' } });
  }

  async createProvider(data: any) {
    const provider = this.providerRepository.create(data);
    return this.providerRepository.save(provider);
  }

  async removeProvider(id: string) {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider)
      throw new NotFoundException(`Provider with ID "${id}" not found`);
    return this.providerRepository.remove(provider);
  }

  // Subject Helpers
  async findAllSubjects() {
    return this.subjectRepository.find({ order: { name: 'ASC' } });
  }

  async createSubject(data: any) {
    const subject = this.subjectRepository.create(data);
    return this.subjectRepository.save(subject);
  }

  async removeSubject(id: string) {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject)
      throw new NotFoundException(`Subject with ID "${id}" not found`);
    return this.subjectRepository.remove(subject);
  }

  async incrementViews(id: string) {
    await this.eResourceRepository.increment({ id }, 'view_count', 1);
  }

  async incrementClicks(id: string) {
    await this.eResourceRepository.increment({ id }, 'click_count', 1);
  }
}
