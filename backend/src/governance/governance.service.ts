import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../pages/entities/page.entity';
import { News } from '../news/entities/news.entity';
import { Program } from '../programs/entities/program.entity';
import { School } from '../programs/entities/school.entity';
import { PublishStatus } from '../common/enums/publish-status.enum';

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(Page) private pageRepository: Repository<Page>,
    @InjectRepository(News) private newsRepository: Repository<News>,
    @InjectRepository(Program) private programRepository: Repository<Program>,
    @InjectRepository(School) private schoolRepository: Repository<School>,
  ) {}

  async getPendingApprovals() {
    const [pages, news, programs, schools] = await Promise.all([
      this.pageRepository.find({
        where: { status: PublishStatus.REVIEW },
        relations: ['author', 'approver'],
        order: { updated_at: 'DESC' },
      }),
      this.newsRepository.find({
        where: { status: PublishStatus.REVIEW },
        relations: ['author', 'approver'],
        order: { updated_at: 'DESC' },
      }),
      this.programRepository.find({
        where: { status: PublishStatus.REVIEW },
        relations: ['author', 'approver'],
        order: { updated_at: 'DESC' },
      }),
      this.schoolRepository.find({
        where: { status: 'REVIEW' },
        order: { updated_at: 'DESC' },
      }),
    ]);

    const mappedPages = pages.map((p) => ({ ...p, entity_type: 'page' }));
    const mappedNews = news.map((n) => ({ ...n, entity_type: 'news' }));
    const mappedPrograms = programs.map((p) => ({
      ...p,
      entity_type: 'program',
    }));
    const mappedSchools = schools.map((s) => ({
      ...s,
      entity_type: 'school',
      title: s.name,
    }));

    const allPending = [
      ...mappedPages,
      ...mappedNews,
      ...mappedPrograms,
      ...mappedSchools,
    ];
    allPending.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());

    return allPending;
  }

  async updateStatus(
    entityType: string,
    id: string,
    status: PublishStatus,
    reviewNotes: string,
    approverId: string,
  ) {
    let repository: Repository<any>;

    if (entityType === 'page') repository = this.pageRepository;
    else if (entityType === 'news') repository = this.newsRepository;
    else if (entityType === 'program') repository = this.programRepository;
    else if (entityType === 'school') repository = this.schoolRepository;
    else throw new NotFoundException('Invalid entity type');

    const entity = await repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`${entityType} not found`);

    entity.status = status;

    // Schools don't have review_notes or approver relations yet, handle gracefully
    if (entityType !== 'school') {
      entity.review_notes = reviewNotes;
      if (approverId) {
        entity.approver = { id: approverId };
      }
    }

    await repository.save(entity);
    return entity;
  }
}
