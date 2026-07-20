import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerInstitution } from './entities/partner-institution.entity';
import { CreatePartnerDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapePartnersService {
  constructor(
    @InjectRepository(PartnerInstitution)
    private readonly repo: Repository<PartnerInstitution>,
  ) {}

  async findAll(admin = false) {
    const where = admin ? {} : { is_published: true };
    return this.repo.find({
      where,
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findOne(identifier: string, admin = false) {
    const where: any = isUuid(identifier)
      ? { id: identifier }
      : { slug: identifier };
    if (!admin) where.is_published = true;
    const item = await this.repo.findOne({ where });
    if (!item) throw new NotFoundException('Partner institution not found');
    return item;
  }

  async create(dto: CreatePartnerDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreatePartnerDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Partner institution not found');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Partner institution not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
