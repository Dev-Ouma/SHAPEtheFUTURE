import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeEvent } from './entities/shape-event.entity';
import { CreateShapeEventDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapeEventsService {
  constructor(
    @InjectRepository(ShapeEvent)
    private readonly repo: Repository<ShapeEvent>,
  ) {}

  async findAll(admin = false, status?: string, partnerScopeId?: string) {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.host_partner', 'host')
      .leftJoinAndSelect('e.work_package', 'wp')
      .orderBy('e.event_date', 'DESC');
    if (!admin) {
      qb.andWhere('e.is_published = :pub', { pub: true });
    }
    if (admin && partnerScopeId) {
      qb.andWhere('e.host_partner_id = :partnerScopeId', { partnerScopeId });
    }
    if (status) {
      qb.andWhere('e.status = :status', { status });
    }
    return qb.getMany();
  }

  async findOne(identifier: string, admin = false) {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.host_partner', 'host')
      .leftJoinAndSelect('e.work_package', 'wp');
    if (isUuid(identifier)) {
      qb.where('e.id = :id', { id: identifier });
    } else {
      qb.where('e.slug = :slug', { slug: identifier });
    }
    if (!admin) {
      qb.andWhere('e.is_published = :pub', { pub: true });
    }
    const item = await qb.getOne();
    if (!item) throw new NotFoundException('Event not found');
    return item;
  }

  async create(dto: CreateShapeEventDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeEventDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Event not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Event not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
