import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeSdlcStage } from './entities/shape-sdlc-stage.entity';
import { CreateShapeSdlcDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapeSdlcService {
  constructor(
    @InjectRepository(ShapeSdlcStage)
    private readonly repo: Repository<ShapeSdlcStage>,
  ) {}

  async findAll(admin = false) {
    const where = admin ? {} : { is_published: true };
    return this.repo.find({
      where,
      order: { sort_order: 'ASC', title: 'ASC' },
    });
  }

  async findOne(identifier: string, admin = false) {
    const where: any = isUuid(identifier)
      ? { id: identifier }
      : { slug: identifier };
    if (!admin) where.is_published = true;
    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException('SDLC stage not found');
    return item;
  }

  async create(dto: CreateShapeSdlcDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeSdlcDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('SDLC stage not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('SDLC stage not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
