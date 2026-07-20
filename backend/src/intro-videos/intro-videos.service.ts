import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntroVideo } from './entities/intro-video.entity';

@Injectable()
export class IntroVideosService {
  constructor(
    @InjectRepository(IntroVideo)
    private repository: Repository<IntroVideo>,
  ) {}

  async findAll(query: any = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = 'all',
      sort = 'order_index',
      order = 'ASC',
      admin = false,
    } = query;

    const queryBuilder = this.repository.createQueryBuilder('video');

    if (!admin) {
      queryBuilder.where('video.is_active = :isActive', { isActive: true });
    }

    if (search) {
      queryBuilder.andWhere('video.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (type !== 'all') {
      queryBuilder.andWhere('video.video_type = :type', { type });
    }

    queryBuilder.orderBy(
      `video.${sort}`,
      order.toUpperCase() as 'ASC' | 'DESC',
    );

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  create(data: any) {
    const video = this.repository.create(data);
    return this.repository.save(video);
  }

  async update(id: string, data: any) {
    const video = await this.findOne(id);
    if (!video) throw new NotFoundException('Video not found');
    Object.assign(video, data);
    return this.repository.save(video);
  }

  async remove(id: string) {
    const video = await this.findOne(id);
    if (!video) throw new NotFoundException('Video not found');
    return this.repository.remove(video);
  }
}
