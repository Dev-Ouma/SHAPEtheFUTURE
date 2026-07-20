import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShapeDocument } from './entities/shape-document.entity';
import { CreateShapeDocumentDto, isUuid } from './dto/shape.dto';

@Injectable()
export class ShapeDocumentsService {
  constructor(
    @InjectRepository(ShapeDocument)
    private readonly repo: Repository<ShapeDocument>,
  ) {}

  async findAll(admin = false, category?: string) {
    const qb = this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.work_package', 'wp')
      .leftJoinAndSelect('d.partner', 'partner')
      .orderBy('d.created_at', 'DESC');
    if (!admin) {
      qb.andWhere('d.is_published = :pub', { pub: true });
      qb.andWhere('d.is_public = :isPublic', { isPublic: true });
    }
    if (category) {
      qb.andWhere('d.category = :category', { category });
    }
    return qb.getMany();
  }

  async findOne(identifier: string, admin = false) {
    const qb = this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.work_package', 'wp')
      .leftJoinAndSelect('d.partner', 'partner');
    if (isUuid(identifier)) {
      qb.where('d.id = :id', { id: identifier });
    } else {
      qb.where('d.slug = :slug', { slug: identifier });
    }
    if (!admin) {
      qb.andWhere('d.is_published = :pub', { pub: true });
    }
    const item = await qb.getOne();
    if (!item) throw new NotFoundException('Document not found');
    return item;
  }

  async create(dto: CreateShapeDocumentDto) {
    const data: any = { ...dto };
    if (data.is_published && !data.published_at) {
      data.published_at = new Date();
    }
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, dto: Partial<CreateShapeDocumentDto>) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Document not found');
    Object.assign(item, dto);
    if (dto.is_published && !item.published_at) {
      item.published_at = new Date();
    }
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Document not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
