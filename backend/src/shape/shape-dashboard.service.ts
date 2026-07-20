import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerInstitution } from './entities/partner-institution.entity';
import { WorkPackage } from './entities/work-package.entity';
import { ShapeEvent } from './entities/shape-event.entity';
import { ShapeDocument } from './entities/shape-document.entity';
import { ShapeKpi } from './entities/shape-kpi.entity';
import { ShapeActivity } from './entities/shape-activity.entity';
import { ShapeSdlcStage } from './entities/shape-sdlc-stage.entity';
import { ShapeRisk } from './entities/shape-risk.entity';

@Injectable()
export class ShapeDashboardService {
  constructor(
    @InjectRepository(PartnerInstitution)
    private readonly partnersRepo: Repository<PartnerInstitution>,
    @InjectRepository(WorkPackage)
    private readonly wpRepo: Repository<WorkPackage>,
    @InjectRepository(ShapeEvent)
    private readonly eventsRepo: Repository<ShapeEvent>,
    @InjectRepository(ShapeDocument)
    private readonly docsRepo: Repository<ShapeDocument>,
    @InjectRepository(ShapeKpi)
    private readonly kpisRepo: Repository<ShapeKpi>,
    @InjectRepository(ShapeActivity)
    private readonly activitiesRepo: Repository<ShapeActivity>,
    @InjectRepository(ShapeSdlcStage)
    private readonly sdlcRepo: Repository<ShapeSdlcStage>,
    @InjectRepository(ShapeRisk)
    private readonly risksRepo: Repository<ShapeRisk>,
  ) {}

  async getPublicStats() {
    const [
      partners,
      workPackages,
      eventsCount,
      documentsCount,
      kpis,
      activitiesCount,
      sdlcStages,
      openRisksCount,
    ] = await Promise.all([
      this.partnersRepo.find({
        where: { is_published: true },
        select: ['id', 'country', 'region'],
      }),
      this.wpRepo.find({
        where: { is_published: true },
        select: ['id', 'code', 'title', 'progress_percent', 'status'],
        order: { sort_order: 'ASC' },
      }),
      this.eventsRepo.count({ where: { is_published: true } }),
      this.docsRepo.count({
        where: { is_published: true, is_public: true },
      }),
      this.kpisRepo.find({
        where: { is_published: true },
        order: { sort_order: 'ASC' },
      }),
      this.activitiesRepo.count({ where: { is_published: true } }),
      this.sdlcRepo.find({
        where: { is_published: true },
        select: ['id', 'title', 'slug', 'progress_percent', 'status', 'sort_order'],
        order: { sort_order: 'ASC' },
      }),
      this.risksRepo.count({
        where: { is_published: true, status: 'open' },
      }),
    ]);

    const countries = [
      ...new Set(partners.map((p) => p.country).filter(Boolean)),
    ];
    const wpProgressAvg =
      workPackages.length > 0
        ? Math.round(
            workPackages.reduce((sum, wp) => sum + (wp.progress_percent || 0), 0) /
              workPackages.length,
          )
        : 0;

    return {
      partners_count: partners.length,
      countries_count: countries.length,
      countries,
      regions: {
        east_africa: partners.filter((p) => p.region === 'east_africa').length,
        europe: partners.filter((p) => p.region === 'europe').length,
      },
      work_packages_count: workPackages.length,
      work_package_progress_avg: wpProgressAvg,
      work_packages: workPackages,
      events_count: eventsCount,
      documents_count: documentsCount,
      activities_count: activitiesCount,
      open_risks_count: openRisksCount,
      kpis,
      sdlc_stages: sdlcStages,
    };
  }
}
