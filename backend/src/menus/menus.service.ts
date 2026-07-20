import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class MenusService implements OnModuleInit {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  private localizeMenuNode(node: any, locale: AppLocale): any {
    const title = pickLocalized(locale, node.title, node.title_sw);
    const featuredNews = Array.isArray(node.featuredNews)
      ? node.featuredNews.map((n: any) => ({
          ...n,
          title: pickLocalized(locale, n.title, n.title_sw),
          summary:
            pickLocalized(locale, n.summary, n.summary_sw) || n.summary,
          content:
            pickLocalized(locale, n.content, n.content_sw) || n.content,
        }))
      : node.featuredNews;
    return {
      ...node,
      title,
      featuredNews,
      children: Array.isArray(node.children)
        ? node.children.map((c: any) => this.localizeMenuNode(c, locale))
        : [],
    };
  }

  async onModuleInit() {
    // Check if menus exist
    const existing = await this.menuRepository.count({
      where: { position: 'header' },
    });
    if (existing === 0) {
      console.log('Seeding initial mock navigation menus into the DB...');

      const seedData = [
        {
          title: 'About',
          slug: 'about',
          position: 'header',
          order: 1,
          children: [
            {
              title: 'The Governing Council',
              slug: 'about/governing-council',
              order: 1,
            },
            { title: 'The Chancellor', slug: 'about/chancellor', order: 2 },
            {
              title: 'University Management Board',
              slug: 'about/management',
              order: 3,
            },
            { title: 'OUK Uniqueness', slug: 'about/uniqueness', order: 4 },
            { title: 'Downloads', slug: 'about/downloads', order: 5 },
            { title: 'Public Complaints', slug: 'about/complaints', order: 6 },
          ],
        },
        {
          title: 'Admissions',
          slug: 'admissions',
          position: 'header',
          order: 2,
          children: [
            { title: 'Overview', slug: 'admissions/overview', order: 1 },
            {
              title: 'How to Apply',
              slug: 'admissions/how-to-apply',
              order: 2,
            },
            { title: 'Careers', slug: 'admissions/careers', order: 3 },
          ],
        },
        {
          title: 'Academics',
          slug: 'academics',
          position: 'header',
          order: 3,
          children: [
            { title: 'Overview', slug: 'academics/overview', order: 1 },
            {
              title: 'Peer Learners',
              slug: 'academics/peer-learners',
              order: 2,
            },
            { title: 'Schools', slug: 'academics/schools', order: 3 },
            { title: 'Timetables', slug: 'academics/timetables', order: 4 },
            { title: 'Programmes', slug: 'programmes', order: 5 },
            {
              title: 'Professional Development Courses',
              slug: 'academics/professional-development',
              order: 6,
            },
          ],
        },
        {
          title: 'Research',
          slug: 'research',
          position: 'header',
          order: 4,
          children: [
            { title: 'Overview', slug: 'research/overview', order: 1 },
            { title: 'Publications', slug: 'research/publications', order: 2 },
            {
              title: 'Research Programmes',
              slug: 'research/programmes',
              order: 3,
            },
          ],
        },
        {
          title: 'Library',
          slug: 'library',
          position: 'header',
          order: 5,
          children: [
            {
              title: 'Information Literacy',
              slug: 'library/information-literacy',
              order: 1,
            },
            { title: 'E-Resources', slug: 'library/e-resources', order: 2 },
            {
              title: 'Plagiarism Checker',
              slug: 'library/plagiarism-checker',
              order: 3,
            },
          ],
        },
        // Top Header items (Associated Links)
        {
          title: 'Students',
          slug: 'students',
          position: 'top_header',
          order: 1,
          children: [],
          target: '_blank',
        },
        {
          title: 'Faculty & Staff',
          slug: 'faculty',
          position: 'top_header',
          order: 2,
          children: [],
          target: '_self',
          link: '/about/staff',
        },
        {
          title: 'Alumni',
          slug: 'alumni',
          position: 'top_header',
          order: 3,
          children: [],
          target: '_blank',
        },
        {
          title: 'Contact',
          slug: 'contact',
          position: 'top_header',
          order: 4,
          children: [],
          target: '_blank',
        },
        {
          title: 'Tenders',
          slug: 'tenders',
          position: 'top_header',
          order: 5,
          children: [],
          target: '_blank',
        },
        {
          title: 'Jobs',
          slug: 'jobs',
          position: 'top_header',
          order: 6,
          children: [],
          target: '_self',
          link: '/careers',
        },
        {
          title: 'SOMAS',
          slug: 'somas',
          position: 'top_header',
          order: 7,
          children: [],
          target: '_blank',
          link: 'https://somas.ouk.ac.ke',
        },
        {
          title: 'News',
          slug: 'news',
          position: 'top_header',
          order: 8,
          children: [],
          target: '_blank',
        },
      ];

      for (const parent of seedData) {
        const pMenu = this.menuRepository.create({
          title: parent.title,
          slug: parent.slug,
          position: parent.position,
          order: parent.order,
          link: (parent as { link?: string }).link || `/${parent.slug}`,
          target: (parent as any).target || '_self',
        });
        const savedParent = await this.menuRepository.save(pMenu);

        for (const child of parent.children) {
          const cMenu = this.menuRepository.create({
            title: child.title,
            slug: child.slug,
            order: child.order,
            link:
              (child as { link?: string }).link || `/${child.slug}`,
            parent: savedParent as any,
            position: 'header',
          });
          await this.menuRepository.save(cMenu);
        }
      }
      console.log('Seed completed.');
    }

    // Idempotent link repairs for legacy CMS rows (safe on every boot).
    await this.repairLegacyMenuLinks();

    // Backfill known Swahili menu titles when title_sw is empty (Layer B)
    const menuSw: Record<string, string> = {
      about: 'Kuhusu',
      'about/governing-council': 'Baraza la Uongozi',
      'about/chancellor': 'Chansela',
      'about/management': 'Bodi ya Usimamizi wa Chuo',
      'about/uniqueness': 'Upekee wa OUK',
      'about/downloads': 'Vipakuliwa',
      'about/complaints': 'Malalamiko ya Umma',
      'about/vice-chancellor': 'Maono ya Makamu wa Chansela',
      'about/campus-feedback': 'Malalamiko na Pongezi',
      admissions: 'Udahili',
      'admissions/overview': 'Muhtasari',
      'admissions/how-to-apply': 'Jinsi ya Kuomba',
      'admissions/careers': 'Kazi',
      academics: 'Masomo',
      'academics/overview': 'Muhtasari',
      'academics/peer-learners': 'Wanafunzi Wenza',
      'academics/schools': 'Shule',
      'academics/timetables': 'Ratiba',
      programs: 'Programu',
      programmes: 'Programu',
      'academics/professional-development': 'Kozi za Maendeleo ya Kitaaluma',
      research: 'Utafiti',
      'research/overview': 'Muhtasari',
      'research/publications': 'Machapisho',
      'research/programmes': 'Programu za Utafiti',
      library: 'Maktaba',
      'library/information-literacy': 'Ujuzi wa Habari',
      'library/e-resources': 'Rasilimali za Kielektroniki',
      'library/e-repository': 'Hazina ya Kielektroniki',
      'library/plagiarism-checker': 'Kikagua Ulaghai',
      students: 'Wanafunzi',
      faculty: 'Wahadhiri na Wafanyakazi',
      alumni: 'Wahitimu',
      contact: 'Mawasiliano',
      tenders: 'Zabuni',
      jobs: 'Ajira',
      news: 'Habari',
      'footer-reg': 'Usajili',
      apply: 'Omba Sasa',
      portal: 'Lango la Mwanafunzi',
      'adm-policy': 'Sera ya Udahili',
      'footer-schools': 'Shule Zetu',
      'f-sci': 'Sayansi na Teknolojia',
      'f-bus': 'Biashara na Uchumi',
      'footer-legal': 'Taasisi',
    };
    // Also match stubborn rows by English title (slug drift across environments)
    const menuSwByTitle: Record<string, string> = {
      'Vice-Chancellor Vision': 'Maono ya Makamu wa Chansela',
      'Complaints & Compliments': 'Malalamiko na Pongezi',
      'E-Repository': 'Hazina ya Kielektroniki',
    };
    try {
      for (const [slug, titleSw] of Object.entries(menuSw)) {
        await this.menuRepository
          .createQueryBuilder()
          .update(Menu)
          .set({ title_sw: titleSw })
          .where('slug = :slug', { slug })
          .andWhere('(title_sw IS NULL OR title_sw = :empty)', { empty: '' })
          .execute();
      }
      for (const [title, titleSw] of Object.entries(menuSwByTitle)) {
        await this.menuRepository
          .createQueryBuilder()
          .update(Menu)
          .set({ title_sw: titleSw })
          .where('title = :title', { title })
          .andWhere('(title_sw IS NULL OR title_sw = :empty)', { empty: '' })
          .execute();
      }
    } catch (e) {
      // Column may not exist yet before migration; ignore
      console.warn('Menu title_sw backfill skipped:', (e as Error)?.message);
    }
  }

  /**
   * Correct known stale menu hrefs without deleting CMS edits.
   * Only updates rows that still point at the legacy target.
   */
  private async repairLegacyMenuLinks() {
    const repairs: Array<{
      where: { slug?: string; link?: string; target?: string };
      set: Partial<Menu>;
    }> = [
      {
        where: { slug: 'programs', link: '/programs' },
        set: { link: '/programmes', slug: 'programmes' },
      },
      {
        where: { slug: 'jobs', link: '/jobs' },
        set: { link: '/careers', target: '_self' },
      },
      {
        where: { slug: 'jobs', link: '/careers', target: '_blank' },
        set: { target: '_self' },
      },
      {
        where: { slug: 'faculty', link: '/faculty' },
        set: { link: '/about/staff', target: '_self' },
      },
      {
        where: { slug: 'somas', link: '/somas' },
        set: { link: 'https://somas.ouk.ac.ke', target: '_blank' },
      },
      {
        where: { slug: 'portal', link: '/portal' },
        set: {
          link:
            process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL?.trim() ||
            'https://my.ouk.ac.ke',
          target: '_blank',
        },
      },
    ];

    // Same-site top-bar items should not force a new browser tab.
    const internalTopBarSelf = [
      'students',
      'alumni',
      'contact',
      'tenders',
      'news',
      'jobs',
      'faculty',
    ];

    // Footer / legacy school shortcuts → real school hubs
    const linkRewrites: Array<[string, string]> = [
      [
        '/programs/science-tech',
        '/academics/schools/school-of-science-technology',
      ],
      [
        '/programs/business-econ',
        '/academics/schools/school-of-business-economics',
      ],
      [
        '/programmes/science-tech',
        '/academics/schools/school-of-science-technology',
      ],
      [
        '/programmes/business-econ',
        '/academics/schools/school-of-business-economics',
      ],
    ];

    let changed = 0;
    try {
      for (const repair of repairs) {
        const qb = this.menuRepository
          .createQueryBuilder()
          .update(Menu)
          .set(repair.set as any);
        if (repair.where.slug) {
          qb.andWhere('slug = :slug', { slug: repair.where.slug });
        }
        if (repair.where.link) {
          qb.andWhere('link = :link', { link: repair.where.link });
        }
        if (repair.where.target) {
          qb.andWhere('target = :target', { target: repair.where.target });
        }
        const result = await qb.execute();
        changed += result.affected || 0;
      }
      for (const [from, to] of linkRewrites) {
        const r = await this.menuRepository
          .createQueryBuilder()
          .update(Menu)
          .set({ link: to, target: '_self' })
          .where('link = :from', { from })
          .execute();
        changed += r.affected || 0;
      }
      for (const slug of internalTopBarSelf) {
        const r = await this.menuRepository
          .createQueryBuilder()
          .update(Menu)
          .set({ target: '_self' })
          .where('slug = :slug', { slug })
          .andWhere('target = :blank', { blank: '_blank' })
          .andWhere("link LIKE '/%'")
          .andWhere("link NOT LIKE '//%'")
          .execute();
        changed += r.affected || 0;
      }
      if (changed > 0) {
        console.log(`Repaired ${changed} legacy menu link(s).`);
        void this.cmsCache.invalidateMenus();
      }
    } catch (e) {
      console.warn('Menu link repair skipped:', (e as Error)?.message);
    }
  }

  async findAll(position?: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const allMenus = await this.menuRepository.find({
      where: position ? { position } : {},
      relations: ['featuredNews', 'parent'],
      order: { order: 'ASC' },
    });

    // Build the tree in memory
    const menuMap = new Map<string, any>();
    const roots: any[] = [];

    allMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    allMenus.forEach((menu) => {
      const mappedMenu = menuMap.get(menu.id);
      if (menu.parent && menuMap.has(menu.parent.id)) {
        menuMap.get(menu.parent.id).children.push(mappedMenu);
      } else if (!menu.parent) {
        roots.push(mappedMenu);
      }
    });

    // Final sort for each level
    const sortTree = (nodes: any[]) => {
      nodes.sort((a, b) => (a.order || 0) - (b.order || 0));
      nodes.forEach((node) => {
        if (node.children.length > 0) sortTree(node.children);
      });
    };

    sortTree(roots);
    return roots.map((n) => this.localizeMenuNode(n, locale));
  }

  async findBySlug(slug: string, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const menu = await this.menuRepository.findOne({
      where: { slug },
      relations: ['children'],
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return this.localizeMenuNode(
      {
        ...menu,
        children: (menu.children || []).map((c) => ({ ...c, children: [] })),
      },
      locale,
    );
  }

  async create(createMenuDto: CreateMenuDto) {
    const menu = this.menuRepository.create(createMenuDto);
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (parent) {
        menu.parent = parent;
      }
    }
    const saved = await this.menuRepository.save(menu);
    void this.cmsCache.invalidateMenus();
    return saved;
  }

  async remove(id: string) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu item not found');
    const removed = await this.menuRepository.softRemove(menu);
    void this.cmsCache.invalidateMenus();
    return removed;
  }

  // Recursively checks if `ancestorId` is an ancestor of `nodeId` to prevent circular references
  private async isAncestor(
    nodeId: string,
    ancestorId: string,
  ): Promise<boolean> {
    if (nodeId === ancestorId) return true;
    const node = await this.menuRepository.findOne({
      where: { id: ancestorId },
      select: ['id', 'parentId'],
    });
    if (!node || !node.parentId) return false;
    return this.isAncestor(nodeId, node.parentId);
  }

  async update(id: string, updateData: any) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu item not found');

    const { parentId, ...rest } = updateData;

    // Update regular scalar fields
    if (Object.keys(rest).length > 0) {
      Object.assign(menu, rest);
      await this.menuRepository.save(menu);
    }

    // Directly update the FK column via raw SQL — most reliable approach for
    // TypeORM self-referencing relations where save() silently ignores FK changes
    if (parentId !== undefined) {
      if (parentId === null) {
        await this.menuRepository.manager.query(
          `UPDATE menus SET "parentId" = NULL WHERE id = $1`,
          [id],
        );
      } else {
        // Guard against circular references before persisting
        if (parentId === id) {
          throw new BadRequestException('A menu item cannot be its own parent');
        }
        const wouldCreateCycle = await this.isAncestor(id, parentId);
        if (wouldCreateCycle) {
          throw new BadRequestException(
            'Circular reference detected: cannot nest a parent inside its own descendant',
          );
        }
        await this.menuRepository.manager.query(
          `UPDATE menus SET "parentId" = $1 WHERE id = $2`,
          [parentId, id],
        );
      }
    }

    const updated = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    void this.cmsCache.invalidateMenus();
    return updated;
  }

  async reorder(items: { id: string; order: number }[]) {
    // Perform bulk update in a transaction for safety
    const result = await this.menuRepository.manager.transaction(
      async (transactionalEntityManager) => {
        for (const item of items) {
          await transactionalEntityManager.update(Menu, item.id, {
            order: item.order,
          });
        }
      },
    );
    void this.cmsCache.invalidateMenus();
    return result;
  }
}
