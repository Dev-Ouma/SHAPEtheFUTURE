import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, IsNull, Not } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { CourseUnit } from '../programs/entities/course-unit.entity';
import { ShortCourse } from '../short-courses/entities/short-course.entity';
import { News } from '../news/entities/news.entity';
import { Page } from '../pages/entities/page.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Menu } from '../menus/entities/menu.entity';
import { PeerLearner } from '../peer-learners/entities/peer-learner.entity';

@Injectable()
export class RecycleBinService {
  private readonly logger = new Logger(RecycleBinService.name);

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findAllDeleted(query?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const search = query?.search?.toLowerCase() || '';

    const entityTypes = [
      { entity: Program, label: 'Degree Programme' },
      { entity: CourseUnit, label: 'Academic Unit' },
      { entity: ShortCourse, label: 'Short Course' },
      { entity: News, label: 'News Article' },
      { entity: Page, label: 'Digital Page' },
      { entity: StaffMember, label: 'Staff Profile' },
      { entity: Menu, label: 'Navigation Menu' },
      { entity: PeerLearner, label: 'Peer Mentor' },
    ];

    const allItems: any[] = [];

    for (const { entity, label } of entityTypes) {
      try {
        const repo = this.entityManager.getRepository(entity);
        const items = await repo.find({
          where: { deleted_at: Not(IsNull()) } as any,
          withDeleted: true,
        });

        items.forEach((item: any) => {
          const title =
            item.title ||
            item.full_name ||
            item.name ||
            item.unit_code ||
            'Unnamed Record';

          // Server-side Filtering (Simple Keyword Search)
          if (
            search &&
            !title.toLowerCase().includes(search) &&
            !label.toLowerCase().includes(search)
          ) {
            return;
          }

          allItems.push({
            id: item.id,
            title,
            type: label,
            entityName: entity.name,
            deletedAt: item.deleted_at || item.deletedAt,
          });
        });
      } catch (err) {
        this.logger.warn(
          `Could not fetch recycle bin items for ${label}: ${err.message}`,
        );
      }
    }

    // Sort by deletion date (descending)
    allItems.sort((a, b) => {
      const dateA = new Date(a.deletedAt).getTime();
      const dateB = new Date(b.deletedAt).getTime();
      return dateB - dateA;
    });

    // Pagination
    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const data = allItems.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async restore(entityName: string, id: string) {
    const entityMetadata = this.entityManager.connection.entityMetadatas.find(
      (m) => m.name === entityName,
    );
    if (!entityMetadata) {
      throw new BadRequestException(`Invalid entity type: ${entityName}`);
    }

    const repository = this.entityManager.getRepository(entityMetadata.target);
    const item = await repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!item) throw new NotFoundException('Item not found in Recycle Bin');

    return repository.restore(id);
  }

  async destroy(entityName: string, id: string) {
    const entityMetadata = this.entityManager.connection.entityMetadatas.find(
      (m) => m.name === entityName,
    );
    if (!entityMetadata) {
      throw new BadRequestException(`Invalid entity type: ${entityName}`);
    }

    const repository = this.entityManager.getRepository(entityMetadata.target);
    const item = await repository.findOne({
      where: { id } as any,
      withDeleted: true,
    });

    if (!item) throw new NotFoundException('Item not found in Recycle Bin');

    return repository.remove(item);
  }
}
