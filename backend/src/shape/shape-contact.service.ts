import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeContactMessage } from './entities/shape-contact-message.entity';
import {
  CreateShapeContactDto,
  UpdateShapeContactStatusDto,
} from './dto/shape.dto';

@Injectable()
export class ShapeContactService {
  constructor(
    @InjectRepository(ShapeContactMessage)
    private readonly repo: Repository<ShapeContactMessage>,
  ) {}

  async findAll(status?: string) {
    const qb = this.repo
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC');
    if (status) {
      qb.andWhere('c.status = :status', { status });
    }
    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Contact message not found');
    return item;
  }

  async create(dto: CreateShapeContactDto) {
    const entity = this.repo.create({ ...dto, status: 'new' });
    return this.repo.save(entity);
  }

  async updateStatus(id: string, dto: UpdateShapeContactStatusDto) {
    const item = await this.findOne(id);
    item.status = dto.status;
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { deleted: true };
  }
}
