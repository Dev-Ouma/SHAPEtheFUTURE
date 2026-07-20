import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeKpi } from './entities/shape-kpi.entity';
import { CreateShapeKpiDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapeKpisService {
  constructor(
    @InjectRepository(ShapeKpi)
    private readonly repo: Repository<ShapeKpi>,
  ) {}

  async findAll(admin = false, category?: string) {
    const qb = this.repo
      .createQueryBuilder('k')
      .orderBy('k.sort_order', 'ASC')
      .addOrderBy('k.key', 'ASC');
    if (!admin) {
      qb.andWhere('k.is_published = :pub', { pub: true });
    }
    if (category) {
      qb.andWhere('k.category = :category', { category });
    }
    return qb.getMany();
  }

  async findOne(identifier: string, admin = false) {
    const where: any = isUuid(identifier)
      ? { id: identifier }
      : { key: identifier };
    if (!admin) where.is_published = true;
    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException('KPI not found');
    return item;
  }

  async create(dto: CreateShapeKpiDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeKpiDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('KPI not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('KPI not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
