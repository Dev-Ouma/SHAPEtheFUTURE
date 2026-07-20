import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PublishStatus } from '../common/enums/publish-status.enum';
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
import { SearchAnalytic } from './entities/search-analytics.entity';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

/** Short TTLs: search is query-shaped and CMS content can change. */
const SEARCH_CACHE_TTL_MS = 30_000;
const SUGGESTIONS_CACHE_TTL_MS = 45_000;

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
        ? `search:v1:featured:${locale}`
        : `search:v1:${locale}:${filterKey}:${q.toLowerCase()}`;

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
      const featuredPrograms = await this.programRepository.find({
        where: {
          is_featured: true,
          is_published: true,
          status: PublishStatus.PUBLISHED,
        },
        relations: ['school'],
        take: 3,
      });
      return {
        programs: featuredPrograms.map((p) => this.localizeProgram(p, locale)),
        news: [],
        pages: [],
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
          'n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query OR n.category ILIKE :likeQuery',
          { query, likeQuery },
        )
        .orderBy('sim', 'DESC')
        .take(8)
        .getMany(),
      this.newsRepository
        .createQueryBuilder('n')
        .where(
          'n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query OR n.category ILIKE :likeQuery',
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
    ]);

    const count =
      programsCount +
      newsCount +
      pagesCount +
      shortCoursesCount +
      menusCount +
      courseUnitsCount +
      staffCount +
      publicationsCount;

    // Calculate true facets for frontend filtering
    const facets = {
      programs: programsCount,
      news: newsCount,
      pages: pagesCount,
      shortCourses: shortCoursesCount,
      menus: menusCount,
      courseUnits: courseUnitsCount,
      staff: staffCount,
      publications: publicationsCount,
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

    const cacheKey = `search:suggest:v1:${locale}:${q.toLowerCase()}`;
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
    const [programs, shortCourses, news, pages, staff] = await Promise.all([
      this.programRepository
        .createQueryBuilder('p')
        .select(['p.id', 'p.title', 'p.title_sw', 'p.slug'])
        .addSelect(
          "GREATEST(similarity(p.title, :query), similarity(COALESCE(p.title_sw, ''), :query))",
          'sim',
        )
        .where('p.title ILIKE :likeQuery OR p.title_sw ILIKE :likeQuery OR p.title % :query', {
          query,
          likeQuery: `%${query}%`,
        })
        .andWhere('p.status = :pubStatus', { pubStatus: 'PUBLISHED' })
        .andWhere('p.is_published = :isPub', { isPub: true })
        .orderBy('sim', 'DESC')
        .take(3)
        .getMany(),

      this.shortCourseRepository
        .createQueryBuilder('sc')
        .select(['sc.id', 'sc.title', 'sc.title_sw', 'sc.slug'])
        .addSelect(
          "GREATEST(similarity(sc.title, :query), similarity(COALESCE(sc.title_sw, ''), :query))",
          'sim',
        )
        .where('sc.title ILIKE :likeQuery OR sc.title_sw ILIKE :likeQuery OR sc.title % :query', {
          query,
          likeQuery: `%${query}%`,
        })
        .orderBy('sim', 'DESC')
        .take(3)
        .getMany(),

      this.newsRepository
        .createQueryBuilder('n')
        .select(['n.id', 'n.title', 'n.title_sw', 'n.slug'])
        .addSelect(
          "GREATEST(similarity(n.title, :query), similarity(COALESCE(n.title_sw, ''), :query))",
          'sim',
        )
        .where('n.title ILIKE :likeQuery OR n.title_sw ILIKE :likeQuery OR n.title % :query', {
          query,
          likeQuery: `%${query}%`,
        })
        .orderBy('sim', 'DESC')
        .take(3)
        .getMany(),

      this.pageRepository
        .createQueryBuilder('pg')
        .select(['pg.id', 'pg.title', 'pg.title_sw', 'pg.slug'])
        .addSelect(
          "GREATEST(similarity(pg.title, :query), similarity(COALESCE(pg.title_sw, ''), :query))",
          'sim',
        )
        .where('pg.title ILIKE :likeQuery OR pg.title_sw ILIKE :likeQuery OR pg.title % :query', {
          query,
          likeQuery: `%${query}%`,
        })
        .orderBy('sim', 'DESC')
        .take(2)
        .getMany(),

      this.staffRepository
        .createQueryBuilder('s')
        .select(['s.id', 's.full_name', 's.job_title', 's.profile_slug'])
        .addSelect('similarity(s.full_name, :query)', 'sim')
        .where('s.full_name ILIKE :likeQuery OR s.full_name % :query', {
          query,
          likeQuery: `%${query}%`,
        })
        .orderBy('sim', 'DESC')
        .take(2)
        .getMany(),
    ]);

    // Stable type codes — UI translates via SearchPage/Nav keys.
    return [
      ...programs.map((p) => ({
        type: 'programme',
        label: pickLocalized(locale, p.title, (p as any).title_sw),
        href: `/programmes/${p.slug}`,
      })),
      ...shortCourses.map((p) => ({
        type: 'short_course',
        label: pickLocalized(locale, p.title, (p as any).title_sw),
        href: `/academics/professional-development-courses/${p.slug}`,
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
      ...staff.map((s) => ({
        type: 'staff',
        label: (s as any).full_name,
        href: `/about/staff/${(s as any).profile_slug}`,
      })),
    ].slice(0, 8);
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
    ]);

    const results = [
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
      ...news.map((n) => ({
        id: n.id,
        title: n.title,
        subtitle: 'News / Announcement',
        type: 'News',
        link: `/admin/news?id=${n.id}`,
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
