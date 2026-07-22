import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { CourseUnit } from '../programs/entities/course-unit.entity';
import { News } from '../news/entities/news.entity';
import { Page } from '../pages/entities/page.entity';
import { ShortCourse } from '../short-courses/entities/short-course.entity';
import { Menu } from '../menus/entities/menu.entity';
import { StaffMember } from '../staff/entities/staff-member.entity';
import { Publication } from '../research/entities/publication.entity';
import { School } from '../programs/entities/school.entity';
import { Department } from '../programs/entities/department.entity';
import { Job } from '../careers/entities/job.entity';
import { PeerLearner } from '../peer-learners/entities/peer-learner.entity';
import { Download } from '../downloads/entities/download.entity';
import { PartnerInstitution } from '../shape/entities/partner-institution.entity';
import { WorkPackage } from '../shape/entities/work-package.entity';
import { ShapeEvent } from '../shape/entities/shape-event.entity';
import { ShapeDocument } from '../shape/entities/shape-document.entity';
import { ShapeActivity } from '../shape/entities/shape-activity.entity';
import { ShapeKpi } from '../shape/entities/shape-kpi.entity';
import { ShapeRisk } from '../shape/entities/shape-risk.entity';
import { ShapeSdlcStage } from '../shape/entities/shape-sdlc-stage.entity';
import { ShapeContactMessage } from '../shape/entities/shape-contact-message.entity';
import { SearchAnalytic } from './entities/search-analytics.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

/** Short TTLs: search is query-shaped and CMS content can change. */
const SEARCH_CACHE_TTL_MS = 30_000;
const SUGGESTIONS_CACHE_TTL_MS = 45_000;
/** Bump when indexed sources change so stale Redis/memory entries are ignored. */
const SEARCH_CACHE_VERSION = 'v2';

@Injectable()
export class SearchService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(CourseUnit)
    private readonly courseUnitRepository: Repository<CourseUnit>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(ShortCourse)
    private readonly shortCourseRepository: Repository<ShortCourse>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(PeerLearner)
    private readonly peerLearnerRepository: Repository<PeerLearner>,
    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
    @InjectRepository(PartnerInstitution)
    private readonly shapePartnerRepository: Repository<PartnerInstitution>,
    @InjectRepository(WorkPackage)
    private readonly shapeWorkPackageRepository: Repository<WorkPackage>,
    @InjectRepository(ShapeEvent)
    private readonly shapeEventRepository: Repository<ShapeEvent>,
    @InjectRepository(ShapeDocument)
    private readonly shapeDocumentRepository: Repository<ShapeDocument>,
    @InjectRepository(ShapeActivity)
    private readonly shapeActivityRepository: Repository<ShapeActivity>,
    @InjectRepository(ShapeKpi)
    private readonly shapeKpiRepository: Repository<ShapeKpi>,
    @InjectRepository(ShapeRisk)
    private readonly shapeRiskRepository: Repository<ShapeRisk>,
    @InjectRepository(ShapeSdlcStage)
    private readonly shapeSdlcRepository: Repository<ShapeSdlcStage>,
    @InjectRepository(ShapeContactMessage)
    private readonly shapeContactRepository: Repository<ShapeContactMessage>,
    @InjectRepository(SearchAnalytic)
    private readonly analyticsRepository: Repository<SearchAnalytic>,
  ) {}

  /**
   * Public search with Redis/memory cache. Analytics still recorded on every hit
   * so dashboards stay accurate while DB work is skipped on cache hits.
   */
  async globalSearch(query: string, filter?: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const q = (query || '').trim();
    const filterKey = (filter || 'all').toLowerCase();
    const cacheKey =
      q.length < 2
        ? `search:${SEARCH_CACHE_VERSION}:featured:${locale}`
        : `search:${SEARCH_CACHE_VERSION}:${locale}:${filterKey}:${q.toLowerCase()}`;

    let result = await this.cacheManager.get<any>(cacheKey);
    if (!result) {
      result = await this.executeGlobalSearch(q, filter, locale);
      await this.cacheManager.set(cacheKey, result, SEARCH_CACHE_TTL_MS);
    }

    if (q.length >= 2) {
      const count =
        typeof result?.count === 'number'
          ? result.count
          : Number(result?.count) || 0;
      this.analyticsRepository
        .save({
          query: q.toLowerCase(),
          results_count: count,
          filter: filter || 'all',
          is_failed: count === 0,
        })
        .catch(() => {
          /* silently ignore analytics errors */
        });
    }

    return result;
  }

  private async executeGlobalSearch(
    query: string,
    filter: string | undefined,
    locale: AppLocale,
  ) {
    if (!query || query.length < 2) {
      const featuredPartners = await this.shapePartnerRepository.find({
        where: { is_published: true },
        order: { sort_order: 'ASC' },
        take: 6,
      });
      return {
        programs: [],
        news: [],
        pages: [],
        partners: featuredPartners,
        workPackages: [],
        events: [],
        documents: [],
        activities: [],
        sdlcStages: [],
        featured: true,
      };
    }

    const likeQuery = `%${query}%`;
    const pubStatus = 'PUBLISHED';

    // Rows: ranked + limited. Counts: same WHERE without ORDER BY / joins (cheaper facets).
    const [
      programs,
      programsCount,
      news,
      newsCount,
      pages,
      pagesCount,
      shortCourses,
      shortCoursesCount,
      menus,
      menusCount,
      courseUnits,
      courseUnitsCount,
      staff,
      staffCount,
      publications,
      publicationsCount,
      partners,
      partnersCount,
      workPackages,
      workPackagesCount,
      events,
      eventsCount,
      documents,
      documentsCount,
      activities,
      activitiesCount,
      sdlcStages,
      sdlcStagesCount,
    ] = await Promise.all([
      this.programRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.school', 'school')
        .addSelect(
          "GREATEST(similarity(p.title, :query), similarity(COALESCE(p.title_sw, ''), :query))",
          'sim',
        )
        .where(
          '(p.title ILIKE :likeQuery OR p.title_sw ILIKE :likeQuery OR p.title % :query OR p.overview ILIKE :likeQuery OR p.overview_sw ILIKE :likeQuery OR p.overview % :query OR p.programme_code ILIKE :likeQuery)',
          { query, likeQuery },
        )
        .andWhere('p.status = :pubStatus', { pubStatus })
        .andWhere('p.is_published = :isPub', { isPub: true })
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.programRepository
        .createQueryBuilder('p')
        .where(
          '(p.title ILIKE :likeQuery OR p.title_sw ILIKE :likeQuery OR p.title % :query OR p.overview ILIKE :likeQuery OR p.overview_sw ILIKE :likeQuery OR p.overview % :query OR p.programme_code ILIKE :likeQuery)',
          { query, likeQuery },
        )
        .andWhere('p.status = :pubStatus', { pubStatus })
        .andWhere('p.is_published = :isPub', { isPub: true })
        .getCount(),

      this.newsRepository
        .createQueryBuilder('n')
        .addSelect(
          "GREATEST(similarity(n.title, :query), similarity(COALESCE(n.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query OR n.category ILIKE :likeQuery OR n.summary ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(8)
        .getMany(),
      this.newsRepository
        .createQueryBuilder('n')
        .where(
          'n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query OR n.category ILIKE :likeQuery OR n.summary ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.pageRepository
        .createQueryBuilder('p')
        .addSelect(
          "GREATEST(similarity(p.title, :query), similarity(COALESCE(p.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'p.title ILIKE :likeQuery OR p.title_sw ILIKE :likeQuery OR p.title % :query',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.pageRepository
        .createQueryBuilder('p')
        .where(
          'p.title ILIKE :likeQuery OR p.title_sw ILIKE :likeQuery OR p.title % :query',
          { query, likeQuery },
        )
        .getCount(),

      this.shortCourseRepository
        .createQueryBuilder('sc')
        .leftJoinAndSelect('sc.school', 'school')
        .addSelect(
          "GREATEST(similarity(sc.title, :query), similarity(COALESCE(sc.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'sc.title ILIKE :likeQuery OR sc.title_sw ILIKE :likeQuery OR sc.title % :query OR sc.code ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.shortCourseRepository
        .createQueryBuilder('sc')
        .where(
          'sc.title ILIKE :likeQuery OR sc.title_sw ILIKE :likeQuery OR sc.title % :query OR sc.code ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.menuRepository
        .createQueryBuilder('m')
        .addSelect(
          "GREATEST(similarity(m.title, :query), similarity(COALESCE(m.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'm.title ILIKE :likeQuery OR m.title_sw ILIKE :likeQuery OR m.title % :query',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(5)
        .getMany(),
      this.menuRepository
        .createQueryBuilder('m')
        .where(
          'm.title ILIKE :likeQuery OR m.title_sw ILIKE :likeQuery OR m.title % :query',
          { query, likeQuery },
        )
        .getCount(),

      this.courseUnitRepository
        .createQueryBuilder('cu')
        .leftJoinAndSelect('cu.program', 'program')
        .addSelect(
          "GREATEST(similarity(cu.title, :query), similarity(COALESCE(cu.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'cu.title ILIKE :likeQuery OR cu.title_sw ILIKE :likeQuery OR cu.title % :query OR cu.unit_code ILIKE :likeQuery OR cu.description ILIKE :likeQuery OR cu.description_sw ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(8)
        .getMany(),
      this.courseUnitRepository
        .createQueryBuilder('cu')
        .where(
          'cu.title ILIKE :likeQuery OR cu.title_sw ILIKE :likeQuery OR cu.title % :query OR cu.unit_code ILIKE :likeQuery OR cu.description ILIKE :likeQuery OR cu.description_sw ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.staffRepository
        .createQueryBuilder('s')
        .addSelect('similarity(s.full_name, :query)', 'sim')
        .where(
          's.full_name ILIKE :likeQuery OR s.full_name % :query OR s.job_title ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(6)
        .getMany(),
      this.staffRepository
        .createQueryBuilder('s')
        .where(
          's.full_name ILIKE :likeQuery OR s.full_name % :query OR s.job_title ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.publicationRepository
        .createQueryBuilder('pub')
        .addSelect(
          "GREATEST(similarity(pub.title, :query), similarity(COALESCE(pub.title_sw, ''), :query))",
          'sim',
        )
        .where(
          'pub.title ILIKE :likeQuery OR pub.title_sw ILIKE :likeQuery OR pub.title % :query OR pub.journal_name ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(6)
        .getMany(),
      this.publicationRepository
        .createQueryBuilder('pub')
        .where(
          'pub.title ILIKE :likeQuery OR pub.title_sw ILIKE :likeQuery OR pub.title % :query OR pub.journal_name ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.shapePartnerRepository
        .createQueryBuilder('sp')
        .addSelect(
          "GREATEST(similarity(sp.name, :query), similarity(COALESCE(sp.short_name, ''), :query))",
          'sim',
        )
        .where(
          'sp.name ILIKE :likeQuery OR sp.short_name ILIKE :likeQuery OR sp.name % :query OR sp.country ILIKE :likeQuery OR sp.city ILIKE :likeQuery OR sp.consortium_role ILIKE :likeQuery OR sp.description ILIKE :likeQuery OR sp.responsibilities ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('sp.is_published = :isPub', { isPub: true })
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.shapePartnerRepository
        .createQueryBuilder('sp')
        .where(
          'sp.name ILIKE :likeQuery OR sp.short_name ILIKE :likeQuery OR sp.name % :query OR sp.country ILIKE :likeQuery OR sp.city ILIKE :likeQuery OR sp.consortium_role ILIKE :likeQuery OR sp.description ILIKE :likeQuery OR sp.responsibilities ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('sp.is_published = :isPub', { isPub: true })
        .getCount(),

      this.shapeWorkPackageRepository
        .createQueryBuilder('wp')
        .addSelect('similarity(wp.title, :query)', 'sim')
        .where(
          'wp.title ILIKE :likeQuery OR wp.code ILIKE :likeQuery OR wp.title % :query OR wp.description ILIKE :likeQuery OR wp.objectives ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('wp.is_published = :isPub', { isPub: true })
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.shapeWorkPackageRepository
        .createQueryBuilder('wp')
        .where(
          'wp.title ILIKE :likeQuery OR wp.code ILIKE :likeQuery OR wp.title % :query OR wp.description ILIKE :likeQuery OR wp.objectives ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('wp.is_published = :isPub', { isPub: true })
        .getCount(),

      this.shapeEventRepository
        .createQueryBuilder('ev')
        .addSelect('similarity(ev.title, :query)', 'sim')
        .where(
          'ev.title ILIKE :likeQuery OR ev.title % :query OR ev.description ILIKE :likeQuery OR ev.venue ILIKE :likeQuery OR ev.country ILIKE :likeQuery OR ev.outcomes ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('ev.is_published = :isPub', { isPub: true })
        .orderBy('sim', 'DESC')
        .take(8)
        .getMany(),
      this.shapeEventRepository
        .createQueryBuilder('ev')
        .where(
          'ev.title ILIKE :likeQuery OR ev.title % :query OR ev.description ILIKE :likeQuery OR ev.venue ILIKE :likeQuery OR ev.country ILIKE :likeQuery OR ev.outcomes ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('ev.is_published = :isPub', { isPub: true })
        .getCount(),

      this.shapeDocumentRepository
        .createQueryBuilder('doc')
        .addSelect('similarity(doc.title, :query)', 'sim')
        .where(
          'doc.title ILIKE :likeQuery OR doc.title % :query OR doc.description ILIKE :likeQuery OR doc.category ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('doc.is_published = :isPub', { isPub: true })
        .andWhere('doc.is_public = :isPublic', { isPublic: true })
        .orderBy('sim', 'DESC')
        .take(10)
        .getMany(),
      this.shapeDocumentRepository
        .createQueryBuilder('doc')
        .where(
          'doc.title ILIKE :likeQuery OR doc.title % :query OR doc.description ILIKE :likeQuery OR doc.category ILIKE :likeQuery',
          { query, likeQuery },
        )
        .andWhere('doc.is_published = :isPub', { isPub: true })
        .andWhere('doc.is_public = :isPublic', { isPublic: true })
        .getCount(),

      this.shapeActivityRepository
        .createQueryBuilder('act')
        .addSelect('similarity(act.title, :query)', 'sim')
        .where(
          'act.title ILIKE :likeQuery OR act.title % :query OR act.description ILIKE :likeQuery OR act.status ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(8)
        .getMany(),
      this.shapeActivityRepository
        .createQueryBuilder('act')
        .where(
          'act.title ILIKE :likeQuery OR act.title % :query OR act.description ILIKE :likeQuery OR act.status ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),

      this.shapeSdlcRepository
        .createQueryBuilder('sd')
        .addSelect('similarity(sd.title, :query)', 'sim')
        .where(
          'sd.title ILIKE :likeQuery OR sd.title % :query OR sd.description ILIKE :likeQuery OR sd.objectives ILIKE :likeQuery OR sd.outputs ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(6)
        .getMany(),
      this.shapeSdlcRepository
        .createQueryBuilder('sd')
        .where(
          'sd.title ILIKE :likeQuery OR sd.title % :query OR sd.description ILIKE :likeQuery OR sd.objectives ILIKE :likeQuery OR sd.outputs ILIKE :likeQuery',
          { query, likeQuery },
        )
        .getCount(),
    ]);

    const count =
      programsCount +
      newsCount +
      pagesCount +
      shortCoursesCount +
      menusCount +
      courseUnitsCount +
      staffCount +
      publicationsCount +
      partnersCount +
      workPackagesCount +
      eventsCount +
      documentsCount +
      activitiesCount +
      sdlcStagesCount;

    const facets = {
      programs: programsCount,
      news: newsCount,
      pages: pagesCount,
      shortCourses: shortCoursesCount,
      menus: menusCount,
      courseUnits: courseUnitsCount,
      staff: staffCount,
      publications: publicationsCount,
      partners: partnersCount,
      workPackages: workPackagesCount,
      events: eventsCount,
      documents: documentsCount,
      activities: activitiesCount,
      sdlcStages: sdlcStagesCount,
    };

    return {
      programs: programs.map((p) => this.localizeProgram(p, locale)),
      news: news.map((n) => this.localizeNews(n, locale)),
      pages: pages.map((p) => this.localizePage(p, locale)),
      shortCourses: shortCourses.map((c) => this.localizeShortCourse(c, locale)),
      menus: menus.map((m) => this.localizeMenu(m, locale)),
      courseUnits: courseUnits.map((u) => this.localizeCourseUnit(u, locale)),
      staff,
      publications: publications.map((p) => this.localizePublication(p, locale)),
      partners,
      workPackages,
      events,
      documents,
      activities,
      sdlcStages,
      count,
      facets,
    };
  }

  private localizeSchool(school: any, locale: AppLocale) {
    if (!school) return school;
    return {
      ...school,
      name: pickLocalized(locale, school.name, school.name_sw),
    };
  }

  private localizeProgram(row: Program, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
      overview: pickLocalized(locale, row.overview, (row as any).overview_sw) || row.overview,
      school: this.localizeSchool((row as any).school, locale),
    };
  }

  private localizeNews(row: News, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
      summary: pickLocalized(locale, (row as any).summary, (row as any).summary_sw) || (row as any).summary,
    };
  }

  private localizePage(row: Page, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
      summary: pickLocalized(locale, (row as any).summary, (row as any).summary_sw) || (row as any).summary,
    };
  }

  private localizeShortCourse(row: ShortCourse, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
      overview: pickLocalized(locale, row.overview, (row as any).overview_sw) || row.overview,
      school: this.localizeSchool((row as any).school, locale),
    };
  }

  private localizeCourseUnit(row: any, locale: AppLocale) {
    const program = row.program
      ? {
          ...row.program,
          title: pickLocalized(locale, row.program.title, row.program.title_sw),
        }
      : row.program;
    return {
      ...row,
      title: pickLocalized(locale, row.title, row.title_sw),
      description:
        pickLocalized(locale, row.description, row.description_sw) ||
        row.description,
      program,
      // Back-compat for clients that still read `.programme`
      programme: program,
    };
  }

  private localizeMenu(row: Menu, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
    };
  }

  private localizePublication(row: Publication, locale: AppLocale) {
    return {
      ...row,
      title: pickLocalized(locale, row.title, (row as any).title_sw),
      abstract: pickLocalized(locale, (row as any).abstract, (row as any).abstract_sw) || (row as any).abstract,
    };
  }

  async getSuggestions(query: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const q = (query || '').trim();
    if (q.length < 2) return [];

    const cacheKey = `search:suggest:${SEARCH_CACHE_VERSION}:${locale}:${q.toLowerCase()}`;
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) return cached;

    const suggestions = await this.executeSuggestions(q, locale);
    await this.cacheManager.set(
      cacheKey,
      suggestions,
      SUGGESTIONS_CACHE_TTL_MS,
    );
    return suggestions;
  }

  private async executeSuggestions(query: string, locale: AppLocale) {
    const likeQuery = `%${query}%`;
    const [partners, workPackages, events, documents, news, pages] =
      await Promise.all([
        this.shapePartnerRepository
          .createQueryBuilder('sp')
          .select(['sp.id', 'sp.name', 'sp.short_name', 'sp.slug', 'sp.country'])
          .addSelect(
            "GREATEST(similarity(sp.name, :query), similarity(COALESCE(sp.short_name, ''), :query))",
            'sim',
          )
          .where(
            'sp.name ILIKE :likeQuery OR sp.short_name ILIKE :likeQuery OR sp.name % :query OR sp.country ILIKE :likeQuery',
            { query, likeQuery },
          )
          .andWhere('sp.is_published = :isPub', { isPub: true })
          .orderBy('sim', 'DESC')
          .take(3)
          .getMany(),

        this.shapeWorkPackageRepository
          .createQueryBuilder('wp')
          .select(['wp.id', 'wp.title', 'wp.code', 'wp.slug'])
          .addSelect('similarity(wp.title, :query)', 'sim')
          .where(
            'wp.title ILIKE :likeQuery OR wp.code ILIKE :likeQuery OR wp.title % :query',
            { query, likeQuery },
          )
          .andWhere('wp.is_published = :isPub', { isPub: true })
          .orderBy('sim', 'DESC')
          .take(3)
          .getMany(),

        this.shapeEventRepository
          .createQueryBuilder('ev')
          .select(['ev.id', 'ev.title', 'ev.slug', 'ev.venue'])
          .addSelect('similarity(ev.title, :query)', 'sim')
          .where('ev.title ILIKE :likeQuery OR ev.title % :query', {
            query,
            likeQuery,
          })
          .andWhere('ev.is_published = :isPub', { isPub: true })
          .orderBy('sim', 'DESC')
          .take(2)
          .getMany(),

        this.shapeDocumentRepository
          .createQueryBuilder('doc')
          .select(['doc.id', 'doc.title', 'doc.slug', 'doc.category'])
          .addSelect('similarity(doc.title, :query)', 'sim')
          .where('doc.title ILIKE :likeQuery OR doc.title % :query', {
            query,
            likeQuery,
          })
          .andWhere('doc.is_published = :isPub', { isPub: true })
          .andWhere('doc.is_public = :isPublic', { isPublic: true })
          .orderBy('sim', 'DESC')
          .take(2)
          .getMany(),

        this.newsRepository
          .createQueryBuilder('n')
          .select(['n.id', 'n.title', 'n.title_sw', 'n.slug'])
          .addSelect(
            "GREATEST(similarity(n.title, :query), similarity(COALESCE(n.title_sw, ''), :query))",
            'sim',
          )
          .where(
            'n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query',
            { query, likeQuery },
          )
          .orderBy('sim', 'DESC')
          .take(2)
          .getMany(),

        this.pageRepository
          .createQueryBuilder('pg')
          .select(['pg.id', 'pg.title', 'pg.title_sw', 'pg.slug'])
          .addSelect(
            "GREATEST(similarity(pg.title, :query), similarity(COALESCE(pg.title_sw, ''), :query))",
            'sim',
          )
          .where(
            'pg.title ILIKE :likeQuery OR pg.title_sw ILIKE :likeQuery OR pg.title % :query',
            { query, likeQuery },
          )
          .orderBy('sim', 'DESC')
          .take(1)
          .getMany(),
      ]);

    return [
      ...partners.map((p) => ({
        type: 'partner',
        label: p.short_name ? `${p.name} (${p.short_name})` : p.name,
        href: `/partners/${p.slug}`,
      })),
      ...workPackages.map((wp) => ({
        type: 'work_package',
        label: `${wp.code} · ${wp.title}`,
        href: `/work-packages/${wp.slug}`,
      })),
      ...events.map((ev) => ({
        type: 'event',
        label: ev.title,
        href: `/events/${ev.slug}`,
      })),
      ...documents.map((doc) => ({
        type: 'document',
        label: doc.title,
        href: `/documents`,
      })),
      ...news.map((n) => ({
        type: 'news',
        label: pickLocalized(locale, n.title, (n as any).title_sw),
        href: `/news/${n.slug}`,
      })),
      ...pages.map((p) => ({
        type: 'page',
        label: pickLocalized(locale, p.title, (p as any).title_sw),
        href: `/${p.slug}`,
      })),
    ].slice(0, 10);
  }

  async getAnalytics() {
    // Top searched queries
    const topQueries = await this.analyticsRepository
      .createQueryBuilder('sa')
      .select('sa.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sa.query')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    // Failed searches (0 results)
    const failedSearches = await this.analyticsRepository
      .createQueryBuilder('sa')
      .select('sa.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('sa.is_failed = true')
      .groupBy('sa.query')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalSearches = await this.analyticsRepository.count();
    const failedCount = await this.analyticsRepository.count({
      where: { is_failed: true },
    });

    return {
      topQueries,
      failedSearches,
      totalSearches,
      failedCount,
      successRate:
        totalSearches > 0
          ? Math.round(((totalSearches - failedCount) / totalSearches) * 100)
          : 0,
    };
  }

  async adminGlobalSearch(query: string) {
    if (!query || query.length < 2) return [];

    const searchQuery = `%${query}%`;

    const [
      staff,
      publications,
      schools,
      departments,
      programs,
      pages,
      news,
      jobs,
      downloads,
      peerLearners,
      partners,
      workPackages,
      events,
      documents,
      activities,
      kpis,
      risks,
      sdlcStages,
      contacts,
    ] = await Promise.all([
      this.staffRepository.find({
        where: [
          { full_name: ILike(searchQuery) },
          { job_title: ILike(searchQuery) },
          { email: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.publicationRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { doi: ILike(searchQuery) },
          { journal_name: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.schoolRepository.find({
        where: [{ name: ILike(searchQuery) }, { slug: ILike(searchQuery) }],
        take: 5,
      }),
      this.departmentRepository.find({
        where: [{ name: ILike(searchQuery) }, { slug: ILike(searchQuery) }],
        take: 5,
      }),
      this.programRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { programme_code: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.pageRepository.find({
        where: [{ title: ILike(searchQuery) }],
        take: 10,
      }),
      this.newsRepository.find({
        where: [{ title: ILike(searchQuery) }],
        take: 10,
      }),
      this.jobRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { reference_code: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.downloadRepository.find({
        where: [{ title: ILike(searchQuery) }],
        take: 5,
      }),
      this.peerLearnerRepository.find({
        where: [{ name: ILike(searchQuery) }, { email: ILike(searchQuery) }],
        take: 5,
      }),
      this.shapePartnerRepository.find({
        where: [
          { name: ILike(searchQuery) },
          { short_name: ILike(searchQuery) },
          { country: ILike(searchQuery) },
          { contact_email: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.shapeWorkPackageRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { code: ILike(searchQuery) },
          { description: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.shapeEventRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { venue: ILike(searchQuery) },
          { country: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.shapeDocumentRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { category: ILike(searchQuery) as any },
          { description: ILike(searchQuery) },
        ],
        take: 10,
      }),
      this.shapeActivityRepository.find({
        where: [{ title: ILike(searchQuery) }, { description: ILike(searchQuery) }],
        take: 8,
      }),
      this.shapeKpiRepository.find({
        where: [
          { label: ILike(searchQuery) },
          { key: ILike(searchQuery) },
          { value: ILike(searchQuery) },
        ],
        take: 8,
      }),
      this.shapeRiskRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { description: ILike(searchQuery) },
          { owner: ILike(searchQuery) },
        ],
        take: 8,
      }),
      this.shapeSdlcRepository.find({
        where: [
          { title: ILike(searchQuery) },
          { description: ILike(searchQuery) },
          { objectives: ILike(searchQuery) },
        ],
        take: 8,
      }),
      this.shapeContactRepository.find({
        where: [
          { name: ILike(searchQuery) },
          { email: ILike(searchQuery) },
          { subject: ILike(searchQuery) },
          { organization: ILike(searchQuery) },
        ],
        take: 8,
      }),
    ]);

    const results = [
      ...partners.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: [p.short_name, p.country, p.consortium_role].filter(Boolean).join(' · '),
        type: 'SHAPE Partner',
        link: `/admin/shape-partners`,
      })),
      ...workPackages.map((wp) => ({
        id: wp.id,
        title: `${wp.code} · ${wp.title}`,
        subtitle: wp.status || 'Work Package',
        type: 'SHAPE Work Package',
        link: `/admin/shape-work-packages`,
      })),
      ...events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        subtitle: [ev.venue, ev.country, ev.event_date].filter(Boolean).join(' · '),
        type: 'SHAPE Event',
        link: `/admin/shape-events`,
      })),
      ...documents.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.category || 'Document',
        type: 'SHAPE Document',
        link: `/admin/shape-documents`,
      })),
      ...activities.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.status || 'Activity',
        type: 'SHAPE Activity',
        link: `/admin/shape-activities`,
      })),
      ...kpis.map((k) => ({
        id: k.id,
        title: k.label,
        subtitle: `${k.key} · ${k.value}${k.unit ? ` ${k.unit}` : ''}`,
        type: 'SHAPE KPI',
        link: `/admin/shape-kpis`,
      })),
      ...risks.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: `${r.status} · ${r.likelihood}/${r.impact}`,
        type: 'SHAPE Risk',
        link: `/admin/shape-risks`,
      })),
      ...sdlcStages.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `SDLC · ${s.progress_percent ?? 0}%`,
        type: 'SHAPE SDLC',
        link: `/admin/shape-sdlc`,
      })),
      ...contacts.map((c) => ({
        id: c.id,
        title: c.subject,
        subtitle: `${c.name} · ${c.email}`,
        type: 'SHAPE Contact',
        link: `/admin/shape-contact`,
      })),
      ...news.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: 'News / Announcement',
        type: 'News',
        link: `/admin/news?id=${n.id}`,
      })),
      ...staff.map((s) => ({
        id: s.id,
        title: s.full_name,
        subtitle: s.job_title,
        type: 'Staff',
        link: `/admin/staff/form?id=${s.id}`,
      })),
      ...publications.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.type,
        type: 'Publication',
        link: `/admin/research/publications/form?id=${p.id}`,
      })),
      ...schools.map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: s.slug,
        type: 'School',
        link: `/admin/schools`,
      })),
      ...departments.map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: d.slug,
        type: 'Department',
        link: `/admin/departments`,
      })),
      ...programs.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.programme_code,
        type: 'Program',
        link: `/admin/programs?id=${p.id}`,
      })),
      ...pages.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: 'Static Page',
        type: 'Page',
        link: `/admin/pages?id=${p.id}`,
      })),
      ...jobs.map((j) => ({
        id: j.id,
        title: j.title,
        subtitle: j.reference_code,
        type: 'Career',
        link: `/admin/careers/jobs?id=${j.id}`,
      })),
      ...downloads.map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: 'Downloadable Resource',
        type: 'Download',
        link: `/admin/downloads`,
      })),
      ...peerLearners.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: 'Peer Learner',
        type: 'Peer Learner',
        link: `/admin/peer-learners`,
      })),
    ];

    return results;
  }
}
