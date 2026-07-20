import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeRisk } from './entities/shape-risk.entity';
import { CreateShapeRiskDto } from './dto/shape.dto';

@Injectable()
export class ShapeRisksService {
  constructor(
    @InjectRepository(ShapeRisk)
    private readonly repo: Repository<ShapeRisk>,
  ) {}

  async findAll(admin = false) {
    const where = admin ? {} : { is_published: true };
    return this.repo.find({
      where,
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, admin = false) {
    const where: any = { id };
    if (!admin) where.is_published = true;
    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException('Risk not found');
    return item;
  }

  async create(dto: CreateShapeRiskDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeRiskDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Risk not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Risk not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
