import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkPackage } from './entities/work-package.entity';
import { CreateWorkPackageDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapeWorkPackagesService {
  constructor(
    @InjectRepository(WorkPackage)
    private readonly repo: Repository<WorkPackage>,
  ) {}

  async findAll(admin = false) {
    const qb = this.repo
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.leader_partner', 'leader')
      .orderBy('wp.sort_order', 'ASC')
      .addOrderBy('wp.code', 'ASC');
    if (!admin) {
      qb.andWhere('wp.is_published = :pub', { pub: true });
    }
    return qb.getMany();
  }

  async findOne(identifier: string, admin = false) {
    const qb = this.repo
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.leader_partner', 'leader');
    if (isUuid(identifier)) {
      qb.where('wp.id = :id', { id: identifier });
    } else {
      qb.where('(wp.slug = :slug OR wp.code = :slug)', { slug: identifier });
    }
    if (!admin) {
      qb.andWhere('wp.is_published = :pub', { pub: true });
    }
    const item = await qb.getOne();
    if (!item) throw new NotFoundException('Work package not found');
    return item;
  }

  async create(dto: CreateWorkPackageDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateWorkPackageDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Work package not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Work package not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
