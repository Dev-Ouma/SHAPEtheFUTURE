import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeActivity } from './entities/shape-activity.entity';
import { CreateShapeActivityDto } from './dto/shape.dto';
import { applyPartnerWorkPackageScope } from './shape-partner-scope.util';

@Injectable()
export class ShapeActivitiesService {
  constructor(
    @InjectRepository(ShapeActivity)
    private readonly repo: Repository<ShapeActivity>,
  ) {}

  async findAll(
    admin = false,
    workPackageId?: string,
    partnerScopeId?: string,
  ) {
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.work_package', 'wp')
      .orderBy('a.start_date', 'ASC')
      .addOrderBy('a.sort_order', 'ASC');
    if (!admin) {
      qb.andWhere('a.is_published = :pub', { pub: true });
    }
    if (workPackageId) {
      qb.andWhere('a.work_package_id = :wpId', { wpId: workPackageId });
    }
    if (admin && partnerScopeId) {
      applyPartnerWorkPackageScope(qb as any, 'wp', partnerScopeId);
    }
    return qb.getMany();
  }

  async findOne(id: string, admin = false) {
    const where: any = { id };
    if (!admin) where.is_published = true;
    const item = await this.repo.findOne({
      where,
      relations: ['work_package'],
    });
    if (!item) throw new NotFoundException('Activity not found');
    return item;
  }

  async create(dto: CreateShapeActivityDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeActivityDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Activity not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Activity not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
