import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapePressItem } from './entities/shape-press-item.entity';
import { CreateShapePressDto } from './dto/shape.dto';

@Injectable()
export class ShapePressService {
  constructor(
    @InjectRepository(ShapePressItem)
    private readonly repo: Repository<ShapePressItem>,
  ) {}

  async findAll(admin = false) {
    const qb = this.repo
      .createQueryBuilder('p')
      .orderBy('p.sort_order', 'ASC')
      .addOrderBy('p.created_at', 'DESC');
    if (!admin) {
      qb.andWhere('p.is_published = :pub', { pub: true });
    }
    return qb.getMany();
  }

  async findOne(id: string, admin = false) {
    const qb = this.repo.createQueryBuilder('p').where('p.id = :id', { id });
    if (!admin) {
      qb.andWhere('p.is_published = :pub', { pub: true });
    }
    const item = await qb.getOne();
    if (!item) throw new NotFoundException('Press item not found');
    return item;
  }

  async create(dto: CreateShapePressDto) {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapePressDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Press item not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Press item not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
