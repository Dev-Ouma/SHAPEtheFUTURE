import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PartnerInstitution } from '../../shape/entities/partner-institution.entity';
import { WorkPackage } from '../../shape/entities/work-package.entity';
import { ShapeEvent } from '../../shape/entities/shape-event.entity';
import { ShapeDocument } from '../../shape/entities/shape-document.entity';
import { ShapeActivity } from '../../shape/entities/shape-activity.entity';
import { ShapeKpi } from '../../shape/entities/shape-kpi.entity';
import { ShapeRisk } from '../../shape/entities/shape-risk.entity';
import { ShapeSdlcStage } from '../../shape/entities/shape-sdlc-stage.entity';
import { User, UserRole, UserType, AccountStatus } from '../../auth/entities/user.entity';
import { Role } from '../../auth/entities/role.entity';
import { Setting } from '../../settings/entities/setting.entity';
import { News } from '../../news/entities/news.entity';
import { PublishStatus } from '../../common/enums/publish-status.enum';

/**
 * Upsert SHAPE Erasmus+ grant portal seed data.
 * Safe to re-run: partners by slug, WPs by code, KPIs by key, SDLC by slug.
 */
export const runShapeSeed = async (dataSource: DataSource) => {
  // Ensure new UserRole enum values exist (Postgres) before inserting users
  try {
    await dataSource.query(`
      DO $$ BEGIN
        ALTER TYPE users_role_legacy_enum ADD VALUE IF NOT EXISTS 'partner_institution';
      EXCEPTION WHEN undefined_object THEN NULL;
      END $$;
    `);
    await dataSource.query(`
      DO $$ BEGIN
        ALTER TYPE users_role_legacy_enum ADD VALUE IF NOT EXISTS 'grant_funder';
      EXCEPTION WHEN undefined_object THEN NULL;
      END $$;
    `);
  } catch (e: any) {
    console.warn('Enum alter skipped:', e?.message || e);
  }

  const partnerRepo = dataSource.getRepository(PartnerInstitution);
  const wpRepo = dataSource.getRepository(WorkPackage);
  const eventRepo = dataSource.getRepository(ShapeEvent);
  const docRepo = dataSource.getRepository(ShapeDocument);
  const activityRepo = dataSource.getRepository(ShapeActivity);
  const kpiRepo = dataSource.getRepository(ShapeKpi);
  const riskRepo = dataSource.getRepository(ShapeRisk);
  const sdlcRepo = dataSource.getRepository(ShapeSdlcStage);
  const userRepo = dataSource.getRepository(User);
  const settingRepo = dataSource.getRepository(Setting);
  const newsRepo = dataSource.getRepository(News);

  // Admin CMS login — password MUST come from env (never hardcode secrets)
  console.log('Seeding SHAPE admin user...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ouk.ac.ke';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 10) {
    throw new Error(
      'Set SEED_ADMIN_PASSWORD (min 10 chars) in the environment before running the seed. Do not commit passwords.',
    );
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  let admin = await userRepo.findOne({
    where: { email: adminEmail },
    withDeleted: true,
    select: ['id', 'email', 'password', 'full_name', 'is_active', 'deleted_at'],
  });
  if (!admin) {
    admin = await userRepo.save(
      userRepo.create({
        email: adminEmail,
        password: adminPasswordHash,
        full_name: 'SHAPE Administrator',
        role_legacy: UserRole.SUPER_ADMIN,
        user_type: UserType.STAFF,
        account_status: AccountStatus.ACTIVE,
        is_active: true,
        last_password_change_at: new Date(),
      }),
    );
  } else {
    admin.password = adminPasswordHash;
    admin.deleted_at = null as any;
    admin.is_active = true;
    admin.role_legacy = UserRole.SUPER_ADMIN;
    admin.last_password_change_at = new Date();
    await userRepo.save(admin);
  }

  // Link formal Super Administrator role when RBAC tables are present
  try {
    const roleRows: Array<{ id: string }> = await dataSource.query(
      `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
      ['Super Administrator'],
    );
    if (roleRows[0]?.id) {
      await dataSource.query(`UPDATE users SET role_id = $1 WHERE email = $2`, [
        roleRows[0].id,
        adminEmail,
      ]);
      console.log('Linked admin to Super Administrator role');
    }
  } catch (err: any) {
    console.warn('Could not link Super Administrator role:', err?.message || err);
  }

  // Site settings for SHAPE branding + PROSPER-style homepage CMS keys
  console.log('Seeding SHAPE site settings...');
  const settings = [
    { key: 'site_name', value: 'SHAPE | Strengthening Higher Education for Smart Cities' },
    { key: 'site_tagline', value: 'Strengthening Higher Education for Smart Cities' },
    {
      key: 'site_description',
      value:
        'SHAPE is an Erasmus+ project strengthening higher education for smart cities across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania. Coordinated by the Open University of Kenya.',
    },
    { key: 'contact_email', value: 'shape@ouk.ac.ke' },
    { key: 'contact_phone', value: '+254 20 2311438' },
    { key: 'address', value: 'Open University of Kenya, Technopolis Development Authority, Kenya' },
    {
      key: 'shape_hero_eyebrow',
      value: 'East Africa • Higher Education • Smart Cities',
    },
    { key: 'shape_hero_title', value: 'SHAPE' },
    {
      key: 'shape_hero_text',
      value:
        'Co-funded by the Erasmus+ programme of the European Union, SHAPE strengthens higher education for smart cities across East Africa and Europe — building curricula, digital learning, and institutional capacity with nine partner universities.',
    },
    {
      key: 'shape_intro',
      value:
        'SHAPE — Strengthening Higher Education for Smart Cities — brings together African and European universities to modernise teaching, research, and digital pedagogy for smarter, more inclusive urban futures. Coordinated by the Open University of Kenya, the consortium aligns programmes with real city challenges across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania.',
    },
    {
      key: 'shape_acronym',
      value:
        'SHAPE (Strengthening Higher Education for Smart Cities Across Partner Economies)',
    },
    {
      key: 'shape_erasmus_call',
      value:
        'ERASMUS-EDU-2024-CBHE (Capacity Building in Higher Education — multi-country partnership)',
    },
    {
      key: 'shape_objectives_json',
      value: JSON.stringify([
        {
          title: 'Strengthening Institutional Capacity',
          text: 'Build robust cooperation frameworks and staff skills so partner universities can design and deliver smart-city higher education at scale.',
        },
        {
          title: 'Co-designing Smart-City Curricula',
          text: 'Co-create modular programmes, micro-credentials, and open resources that connect digital learning with municipal and industry practice.',
        },
        {
          title: 'Fostering Collaborative Culture',
          text: 'Foster innovation, intercultural exchange, and lasting partnerships that sustain impact beyond the three-year grant period.',
        },
      ]),
    },
    {
      key: 'shape_overview',
      value:
        'Cities across East Africa are growing quickly. Universities must prepare graduates who can design, govern, and operate smarter urban systems — from digital public services to climate resilience and inclusive mobility. SHAPE addresses this gap through a participative capacity-building approach: empowering educators, enhancing institutional strategies, and fostering academic partnerships aligned with national development visions and Erasmus+ CBHE priorities.',
    },
    { key: 'shape_overview_image', value: '' },
  ];
  for (const s of settings) {
    const existing = await settingRepo.findOne({ where: { key: s.key } });
    if (existing) {
      existing.value = s.value;
      await settingRepo.save(existing);
    } else {
      await settingRepo.save(settingRepo.create(s));
    }
  }

  console.log('Seeding SHAPE partners...');
  const partnersData = [
    {
      name: 'Open University of Kenya',
      slug: 'open-university-of-kenya',
      short_name: 'OUK',
      country: 'Kenya',
      city: 'Nairobi',
      website_url: 'https://ouk.ac.ke',
      region: 'east_africa' as const,
      latitude: -1.286389,
      longitude: 36.817223,
      sort_order: 1,
      responsibilities:
        'Project coordination lead; digital learning infrastructure; regional dissemination hub.',
      deliverables:
        'Project management framework; digital platform hosting; partner coordination reports.',
    },
    {
      name: 'Moi University',
      slug: 'moi-university',
      short_name: 'MU',
      country: 'Kenya',
      city: 'Eldoret',
      website_url: 'https://www.mu.ac.ke',
      region: 'east_africa' as const,
      latitude: 0.5143,
      longitude: 35.2698,
      sort_order: 2,
      responsibilities:
        'Needs assessment lead; curriculum co-development; host for kick-off events.',
      deliverables:
        'Needs assessment report; curriculum frameworks; training workshop reports.',
    },
    {
      name: 'Makerere University',
      slug: 'makerere-university',
      short_name: 'Mak',
      country: 'Uganda',
      city: 'Kampala',
      website_url: 'https://www.mak.ac.ug',
      region: 'east_africa' as const,
      latitude: 0.3344,
      longitude: 32.5675,
      sort_order: 3,
      responsibilities:
        'Curriculum development; quality assurance co-lead; research outputs.',
      deliverables:
        'Curriculum modules; QA frameworks; peer-reviewed publications.',
    },
    {
      name: 'Kampala International University',
      slug: 'kampala-international-university',
      short_name: 'KIU',
      country: 'Uganda',
      city: 'Kampala',
      website_url: 'https://www.kiu.ac.ug',
      region: 'east_africa' as const,
      latitude: 0.2975,
      longitude: 32.6064,
      sort_order: 4,
      responsibilities:
        'Pilot training delivery; stakeholder engagement in Uganda.',
      deliverables:
        'Pilot training cohorts; stakeholder engagement reports.',
    },
    {
      name: 'Mogadishu University',
      slug: 'mogadishu-university',
      short_name: 'MU-SOM',
      country: 'Somalia',
      city: 'Mogadishu',
      website_url: 'https://mu.edu.so',
      region: 'east_africa' as const,
      latitude: 2.0469,
      longitude: 45.3182,
      sort_order: 5,
      responsibilities:
        'Local needs assessment; pilot implementation in Somalia.',
      deliverables:
        'Country needs brief; pilot participation reports.',
    },
    {
      name: 'Red Sea University',
      slug: 'red-sea-university',
      short_name: 'RSU',
      country: 'Somalia',
      city: 'Bosaso',
      website_url: 'https://rsu.edu.so',
      region: 'east_africa' as const,
      latitude: 11.2842,
      longitude: 49.1816,
      sort_order: 6,
      responsibilities:
        'Coastal/northern Somalia outreach; training cascade.',
      deliverables:
        'Regional training sessions; community engagement notes.',
    },
    {
      name: 'Otto von Guericke University',
      slug: 'otto-von-guericke-university',
      short_name: 'OVGU',
      country: 'Germany',
      city: 'Magdeburg',
      website_url: 'https://www.ovgu.de',
      region: 'europe' as const,
      latitude: 52.1405,
      longitude: 11.6404,
      sort_order: 7,
      responsibilities:
        'European academic lead; digital pedagogy expertise; quality frameworks.',
      deliverables:
        'Pedagogy guidelines; EU mobility exchanges; co-authored reports.',
    },
    {
      name: 'University of Tartu',
      slug: 'university-of-tartu',
      short_name: 'UT',
      country: 'Estonia',
      city: 'Tartu',
      website_url: 'https://ut.ee',
      region: 'europe' as const,
      latitude: 58.3811,
      longitude: 26.7225,
      sort_order: 8,
      responsibilities:
        'Digital learning platform expertise; e-assessment practices.',
      deliverables:
        'Platform architecture inputs; digital assessment toolkit.',
    },
    {
      name: 'Lithuanian University of Health Sciences',
      slug: 'lithuanian-university-of-health-sciences',
      short_name: 'LSMU',
      country: 'Lithuania',
      city: 'Kaunas',
      website_url: 'https://lsmu.lt',
      region: 'europe' as const,
      latitude: 54.8985,
      longitude: 23.9036,
      sort_order: 9,
      responsibilities:
        'Health sciences curriculum pathways; sustainability planning.',
      deliverables:
        'Health education modules; sustainability roadmap inputs.',
    },
  ];

  const partnersBySlug: Record<string, PartnerInstitution> = {};
  for (const data of partnersData) {
    let partner = await partnerRepo.findOne({ where: { slug: data.slug } });
    if (partner) {
      Object.assign(partner, { ...data, is_published: true });
    } else {
      partner = partnerRepo.create({ ...data, is_published: true });
    }
    partnersBySlug[data.slug] = await partnerRepo.save(partner);
  }

  const ouk = partnersBySlug['open-university-of-kenya'];
  const moi = partnersBySlug['moi-university'];
  const makerere = partnersBySlug['makerere-university'];
  const ovgu = partnersBySlug['otto-von-guericke-university'];
  const tartu = partnersBySlug['university-of-tartu'];
  const allPartnerIds = Object.values(partnersBySlug).map((p) => p.id);

  console.log('Seeding SHAPE work packages...');
  const workPackagesData = [
    {
      code: 'WP1',
      title: 'Project Management',
      slug: 'wp1-project-management',
      description:
        'Overall coordination, financial management, reporting, and consortium governance.',
      objectives:
        'Ensure effective project delivery, compliance, and partner coordination.',
      leader_partner_id: ouk.id,
      partner_ids: allPartnerIds,
      progress_percent: 60,
      status: 'in_progress' as const,
      sort_order: 1,
      start_date: '2026-01-01',
      end_date: '2028-12-31',
      deliverables: 'Project handbook; interim reports; consortium meeting minutes.',
    },
    {
      code: 'WP2',
      title: 'Needs Assessment',
      slug: 'wp2-needs-assessment',
      description:
        'Baseline study of digital health education needs across partner countries.',
      objectives:
        'Identify capacity gaps and prioritize curriculum interventions.',
      leader_partner_id: moi.id,
      partner_ids: [
        moi.id,
        ouk.id,
        makerere.id,
        partnersBySlug['kampala-international-university'].id,
        partnersBySlug['mogadishu-university'].id,
        partnersBySlug['red-sea-university'].id,
      ],
      progress_percent: 40,
      status: 'in_progress' as const,
      sort_order: 2,
      start_date: '2026-02-01',
      end_date: '2026-09-30',
      deliverables: 'Needs assessment report; country briefs; stakeholder map.',
    },
    {
      code: 'WP3',
      title: 'Curriculum Development',
      slug: 'wp3-curriculum-development',
      description:
        'Co-design of modular curricula for digital and health education pathways.',
      objectives:
        'Produce accredited-ready curriculum packages for partner institutions.',
      leader_partner_id: makerere.id,
      partner_ids: [makerere.id, ouk.id, ovgu.id, partnersBySlug['lithuanian-university-of-health-sciences'].id],
      progress_percent: 25,
      status: 'in_progress' as const,
      sort_order: 3,
      start_date: '2026-04-01',
      end_date: '2027-06-30',
      deliverables: 'Curriculum frameworks; module outlines; learning outcomes.',
    },
    {
      code: 'WP4',
      title: 'Digital Learning Platform',
      slug: 'wp4-digital-learning-platform',
      description:
        'Design and deploy a shared digital learning environment for the consortium.',
      objectives:
        'Provide accessible, multilingual digital learning infrastructure.',
      leader_partner_id: tartu.id,
      partner_ids: [tartu.id, ouk.id, ovgu.id],
      progress_percent: 20,
      status: 'in_progress' as const,
      sort_order: 4,
      start_date: '2026-03-01',
      end_date: '2027-12-31',
      deliverables: 'Platform MVP; content repository; user guides.',
    },
    {
      code: 'WP5',
      title: 'Pilot Training',
      slug: 'wp5-pilot-training',
      description:
        'Deliver pilot training cohorts across East African partner institutions.',
      objectives:
        'Validate curriculum and platform through live learner cohorts.',
      leader_partner_id: partnersBySlug['kampala-international-university'].id,
      partner_ids: [
        partnersBySlug['kampala-international-university'].id,
        moi.id,
        partnersBySlug['mogadishu-university'].id,
        partnersBySlug['red-sea-university'].id,
      ],
      progress_percent: 10,
      status: 'not_started' as const,
      sort_order: 5,
      start_date: '2027-01-01',
      end_date: '2027-12-31',
      deliverables: 'Pilot cohorts; training evaluation reports.',
    },
    {
      code: 'WP6',
      title: 'Quality Assurance',
      slug: 'wp6-quality-assurance',
      description:
        'Cross-partner QA processes, peer review, and continuous improvement.',
      objectives:
        'Embed quality standards into curriculum and delivery.',
      leader_partner_id: ovgu.id,
      partner_ids: [ovgu.id, makerere.id, ouk.id],
      progress_percent: 15,
      status: 'in_progress' as const,
      sort_order: 6,
      start_date: '2026-03-01',
      end_date: '2028-12-31',
      deliverables: 'QA handbook; peer review reports; improvement plans.',
    },
    {
      code: 'WP7',
      title: 'Dissemination',
      slug: 'wp7-dissemination',
      description:
        'Communication, events, publications, and stakeholder outreach.',
      objectives:
        'Maximize visibility and uptake of SHAPE outputs.',
      leader_partner_id: ouk.id,
      partner_ids: allPartnerIds,
      progress_percent: 30,
      status: 'in_progress' as const,
      sort_order: 7,
      start_date: '2026-01-01',
      end_date: '2028-12-31',
      deliverables: 'Website; policy briefs; conference presentations.',
    },
    {
      code: 'WP8',
      title: 'Sustainability',
      slug: 'wp8-sustainability',
      description:
        'Long-term institutionalization, funding pathways, and alumni networks.',
      objectives:
        'Ensure SHAPE results outlive the grant period.',
      leader_partner_id: partnersBySlug['lithuanian-university-of-health-sciences'].id,
      partner_ids: [
        partnersBySlug['lithuanian-university-of-health-sciences'].id,
        ouk.id,
        ovgu.id,
      ],
      progress_percent: 5,
      status: 'not_started' as const,
      sort_order: 8,
      start_date: '2027-06-01',
      end_date: '2028-12-31',
      deliverables: 'Sustainability plan; MoUs; continuation funding proposals.',
    },
  ];

  const wpsByCode: Record<string, WorkPackage> = {};
  for (const data of workPackagesData) {
    let wp = await wpRepo.findOne({ where: { code: data.code } });
    if (wp) {
      Object.assign(wp, { ...data, is_published: true });
    } else {
      wp = wpRepo.create({ ...data, is_published: true });
    }
    wpsByCode[data.code] = await wpRepo.save(wp);
  }

  console.log('Seeding SHAPE kick-off event...');
  const kickoffSlug = 'shape-kick-off-meeting-moi-2026';
  let kickoff = await eventRepo.findOne({ where: { slug: kickoffSlug } });
  const kickoffData = {
    title: 'SHAPE Erasmus+ Kick-off Meeting',
    slug: kickoffSlug,
    description:
      'Consortium kick-off hosted at Moi University to launch SHAPE work packages, governance, and partner collaboration.',
    event_date: '2026-06-18',
    end_date: '2026-06-20',
    venue: 'Moi University, Eldoret',
    country: 'Kenya',
    host_partner_id: moi.id,
    status: 'completed' as const,
    agenda:
      'Day 1: Opening & WP overviews. Day 2: Work planning workshops. Day 3: Governance & next steps.',
    outcomes:
      'Consortium agreement endorsed; WP leads confirmed; first-year workplan approved.',
    work_package_id: wpsByCode['WP1'].id,
    gallery_urls: [],
    is_published: true,
  };
  if (kickoff) {
    Object.assign(kickoff, kickoffData);
  } else {
    kickoff = eventRepo.create(kickoffData);
  }
  await eventRepo.save(kickoff);

  console.log('Seeding SHAPE activities...');
  const activitiesData = [
    {
      title: 'Consortium kick-off & governance setup',
      description: 'Launch meeting and establishment of steering structures.',
      start_date: '2026-06-18',
      end_date: '2026-06-20',
      status: 'completed' as const,
      work_package_id: wpsByCode['WP1'].id,
      progress_percent: 100,
      sort_order: 1,
    },
    {
      title: 'Baseline needs assessment fieldwork',
      description: 'Partner-country surveys and stakeholder interviews.',
      start_date: '2026-03-01',
      end_date: '2026-08-31',
      status: 'in_progress' as const,
      work_package_id: wpsByCode['WP2'].id,
      progress_percent: 45,
      sort_order: 2,
    },
    {
      title: 'Curriculum framework co-design workshops',
      description: 'Multi-partner curriculum design sprints.',
      start_date: '2026-05-01',
      end_date: '2026-11-30',
      status: 'in_progress' as const,
      work_package_id: wpsByCode['WP3'].id,
      progress_percent: 30,
      sort_order: 3,
    },
    {
      title: 'Digital platform architecture & MVP',
      description: 'Platform requirements, prototype, and pilot hosting.',
      start_date: '2026-04-01',
      end_date: '2027-03-31',
      status: 'in_progress' as const,
      work_package_id: wpsByCode['WP4'].id,
      progress_percent: 20,
      sort_order: 4,
    },
    {
      title: 'First pilot training cohort',
      description: 'Pilot delivery across East African partners.',
      start_date: '2027-02-01',
      end_date: '2027-06-30',
      status: 'planned' as const,
      work_package_id: wpsByCode['WP5'].id,
      progress_percent: 0,
      sort_order: 5,
    },
    {
      title: 'QA peer-review cycle 1',
      description: 'Cross-partner quality review of early deliverables.',
      start_date: '2026-07-01',
      end_date: '2026-10-31',
      status: 'planned' as const,
      work_package_id: wpsByCode['WP6'].id,
      progress_percent: 10,
      sort_order: 6,
    },
    {
      title: 'Dissemination campaign & website launch',
      description: 'Public portal, branding, and partner communications.',
      start_date: '2026-01-15',
      end_date: '2026-07-31',
      status: 'in_progress' as const,
      work_package_id: wpsByCode['WP7'].id,
      progress_percent: 55,
      sort_order: 7,
    },
    {
      title: 'Sustainability roadmap drafting',
      description: 'Institutionalization and funding pathway planning.',
      start_date: '2027-07-01',
      end_date: '2028-06-30',
      status: 'planned' as const,
      work_package_id: wpsByCode['WP8'].id,
      progress_percent: 0,
      sort_order: 8,
    },
  ];

  for (const data of activitiesData) {
    const existing = await activityRepo.findOne({
      where: { title: data.title },
    });
    if (existing) {
      Object.assign(existing, { ...data, is_published: true });
      await activityRepo.save(existing);
    } else {
      await activityRepo.save(
        activityRepo.create({ ...data, is_published: true }),
      );
    }
  }

  console.log('Seeding SHAPE KPIs...');
  const kpisData = [
    {
      key: 'overall_completion',
      label: 'Overall Completion',
      value: '35',
      unit: '%',
      target: '100',
      category: 'overview' as const,
      icon: 'progress',
      sort_order: 1,
    },
    {
      key: 'budget_utilization',
      label: 'Budget Utilization',
      value: '22',
      unit: '%',
      target: '100',
      category: 'budget' as const,
      icon: 'budget',
      sort_order: 2,
    },
    {
      key: 'deliverables',
      label: 'Deliverables Completed',
      value: '10',
      unit: 'of 32',
      target: '32',
      category: 'outputs' as const,
      icon: 'deliverable',
      sort_order: 3,
    },
    {
      key: 'meetings',
      label: 'Consortium Meetings',
      value: '8',
      unit: 'meetings',
      target: null,
      category: 'engagement' as const,
      icon: 'meeting',
      sort_order: 4,
    },
    {
      key: 'countries_engaged',
      label: 'Countries Engaged',
      value: '6',
      unit: 'countries',
      target: '6',
      category: 'engagement' as const,
      icon: 'globe',
      sort_order: 5,
    },
    {
      key: 'students_reached',
      label: 'Students Reached',
      value: '450',
      unit: 'students',
      target: '2000',
      category: 'engagement' as const,
      icon: 'users',
      sort_order: 6,
    },
    {
      key: 'training_sessions',
      label: 'Training Sessions',
      value: '14',
      unit: 'sessions',
      target: '40',
      category: 'outputs' as const,
      icon: 'training',
      sort_order: 7,
    },
    {
      key: 'research_outputs',
      label: 'Research Outputs',
      value: '5',
      unit: 'outputs',
      target: '20',
      category: 'outputs' as const,
      icon: 'research',
      sort_order: 8,
    },
  ];

  for (const data of kpisData) {
    let kpi = await kpiRepo.findOne({ where: { key: data.key } });
    if (kpi) {
      Object.assign(kpi, { ...data, is_published: true });
    } else {
      kpi = kpiRepo.create({ ...data, is_published: true });
    }
    await kpiRepo.save(kpi);
  }

  console.log('Seeding SHAPE SDLC stages...');
  const sdlcData = [
    {
      title: 'Planning',
      slug: 'planning',
      description: 'Grant inception, consortium agreements, and work planning.',
      progress_percent: 90,
      status: 'completed' as const,
      sort_order: 1,
    },
    {
      title: 'Needs Assessment',
      slug: 'needs-assessment',
      description: 'Baseline studies and stakeholder mapping.',
      progress_percent: 45,
      status: 'in_progress' as const,
      sort_order: 2,
    },
    {
      title: 'Stakeholder Engagement',
      slug: 'stakeholder-engagement',
      description: 'Partner and community engagement activities.',
      progress_percent: 40,
      status: 'in_progress' as const,
      sort_order: 3,
    },
    {
      title: 'Curriculum Design',
      slug: 'curriculum-design',
      description: 'Co-creation of modular learning pathways.',
      progress_percent: 25,
      status: 'in_progress' as const,
      sort_order: 4,
    },
    {
      title: 'Platform Development',
      slug: 'platform-development',
      description: 'Digital learning environment build-out.',
      progress_percent: 20,
      status: 'in_progress' as const,
      sort_order: 5,
    },
    {
      title: 'Testing',
      slug: 'testing',
      description: 'QA and usability testing of curriculum and platform.',
      progress_percent: 5,
      status: 'not_started' as const,
      sort_order: 6,
    },
    {
      title: 'Pilot Implementation',
      slug: 'pilot-implementation',
      description: 'Live pilot cohorts across partner institutions.',
      progress_percent: 0,
      status: 'not_started' as const,
      sort_order: 7,
    },
    {
      title: 'Monitoring',
      slug: 'monitoring',
      description: 'Continuous M&E of activities and outputs.',
      progress_percent: 35,
      status: 'in_progress' as const,
      sort_order: 8,
    },
    {
      title: 'Evaluation',
      slug: 'evaluation',
      description: 'Mid-term and final evaluation of project impact.',
      progress_percent: 0,
      status: 'not_started' as const,
      sort_order: 9,
    },
    {
      title: 'Sustainability',
      slug: 'sustainability',
      description: 'Institutionalization and post-grant continuity.',
      progress_percent: 5,
      status: 'not_started' as const,
      sort_order: 10,
    },
  ];

  for (const data of sdlcData) {
    let stage = await sdlcRepo.findOne({ where: { slug: data.slug } });
    if (stage) {
      Object.assign(stage, {
        ...data,
        is_published: true,
        document_urls: stage.document_urls || [],
      });
    } else {
      stage = sdlcRepo.create({
        ...data,
        is_published: true,
        document_urls: [],
      });
    }
    await sdlcRepo.save(stage);
  }

  console.log('Seeding SHAPE sample documents...');
  const docsData = [
    {
      title: 'SHAPE Project Handbook',
      slug: 'shape-project-handbook',
      description: 'Governance, roles, and reporting procedures for the consortium.',
      category: 'templates' as const,
      file_url: '/uploads/shape/project-handbook.pdf',
      file_type: 'application/pdf',
      file_size: 512000,
      work_package_id: wpsByCode['WP1'].id,
      partner_id: ouk.id,
      tags: ['governance', 'handbook'],
      is_public: true,
      is_published: true,
      published_at: new Date('2026-06-20'),
    },
    {
      title: 'Kick-off Meeting Minutes',
      slug: 'kick-off-meeting-minutes',
      description: 'Minutes from the June 2026 kick-off at Moi University.',
      category: 'minutes' as const,
      file_url: '/uploads/shape/kickoff-minutes.pdf',
      file_type: 'application/pdf',
      file_size: 256000,
      work_package_id: wpsByCode['WP1'].id,
      partner_id: moi.id,
      tags: ['meeting', 'kick-off'],
      is_public: true,
      is_published: true,
      published_at: new Date('2026-06-25'),
    },
    {
      title: 'Needs Assessment Inception Report',
      slug: 'needs-assessment-inception-report',
      description: 'Inception methodology and early findings for WP2.',
      category: 'reports' as const,
      file_url: '/uploads/shape/needs-assessment-inception.pdf',
      file_type: 'application/pdf',
      file_size: 780000,
      work_package_id: wpsByCode['WP2'].id,
      partner_id: moi.id,
      tags: ['needs-assessment', 'report'],
      is_public: true,
      is_published: true,
      published_at: new Date('2026-04-15'),
    },
  ];

  for (const data of docsData) {
    let doc = await docRepo.findOne({ where: { slug: data.slug } });
    if (doc) {
      Object.assign(doc, data);
    } else {
      doc = docRepo.create(data);
    }
    await docRepo.save(doc);
  }

  console.log('Seeding SHAPE risks...');
  const risksData = [
    {
      title: 'Delayed partner procurement cycles',
      description:
        'National procurement rules may delay equipment and travel bookings for East African partners.',
      likelihood: 'medium' as const,
      impact: 'medium' as const,
      status: 'mitigating' as const,
      mitigation:
        'Early procurement planning; framework agreements; buffer timelines in WP schedules.',
      owner: 'WP1 Lead (OUK)',
      category: 'operational',
      sort_order: 1,
    },
    {
      title: 'Low learner retention in pilots',
      description:
        'Connectivity and workload constraints may reduce pilot completion rates.',
      likelihood: 'medium' as const,
      impact: 'high' as const,
      status: 'open' as const,
      mitigation:
        'Offline-capable content; mentor support; flexible assessment windows.',
      owner: 'WP5 Lead (KIU)',
      category: 'academic',
      sort_order: 2,
    },
    {
      title: 'Currency / budget exchange volatility',
      description:
        'EUR to local currency fluctuations may affect partner budgets.',
      likelihood: 'low' as const,
      impact: 'medium' as const,
      status: 'mitigating' as const,
      mitigation:
        'Quarterly budget reviews; contingency line; centralized high-value purchases.',
      owner: 'Project Finance Officer',
      category: 'financial',
      sort_order: 3,
    },
  ];

  for (const data of risksData) {
    let risk = await riskRepo.findOne({ where: { title: data.title } });
    if (risk) {
      Object.assign(risk, { ...data, is_published: true });
    } else {
      risk = riskRepo.create({ ...data, is_published: true });
    }
    await riskRepo.save(risk);
  }

  console.log('Seeding SHAPE news...');
  const newsItems = [
    {
      title: 'Moi University leads launch of EU-funded SHAPE project',
      slug: 'moi-university-leads-shape-kick-off',
      summary:
        'Partners from East Africa and Europe gathered to launch SHAPE, advancing smart-city education across six countries.',
      content:
        '<p>The SHAPE Erasmus+ project officially launched with a kick-off meeting hosted by Moi University. Nine partner institutions from Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania joined to strengthen higher education for smart cities.</p><p>The three-year initiative will deliver needs assessments, curriculum modules, a digital learning platform, pilot training, and dissemination outputs co-funded by the European Union.</p>',
      type: 'News',
      category: 'Project Launch',
    },
    {
      title: 'OUK announces SHAPE partnership for smart-city capacity building',
      slug: 'ouk-announces-shape-partnership',
      summary:
        'The Open University of Kenya joins SHAPE as project coordination hub for digital learning and regional dissemination.',
      content:
        '<p>The Open University of Kenya (OUK) will coordinate digital learning infrastructure and act as a regional dissemination hub for the SHAPE Erasmus+ consortium.</p>',
      type: 'News',
      category: 'Announcement',
    },
    {
      title: 'SHAPE work packages set path from needs assessment to sustainability',
      slug: 'shape-work-packages-overview',
      summary:
        'Eight work packages guide SHAPE from project management through curriculum, platforms, pilots, QA, dissemination, and sustainability.',
      content:
        '<p>SHAPE is structured around eight work packages covering management, needs assessment, curriculum development, digital platforms, pilot training, quality assurance, dissemination, and sustainability.</p>',
      type: 'News',
      category: 'Work Packages',
    },
  ];

  for (const item of newsItems) {
    let article = await newsRepo.findOne({ where: { slug: item.slug } });
    if (article) {
      Object.assign(article, {
        ...item,
        status: PublishStatus.PUBLISHED,
        is_published: true,
      });
    } else {
      article = newsRepo.create({
        ...item,
        status: PublishStatus.PUBLISHED,
        is_published: true,
      });
    }
    await newsRepo.save(article);
  }

  // Optional partner-scoped demo user (env-gated; never hardcode password)
  const partnerEmail = process.env.SEED_PARTNER_EMAIL;
  const partnerPassword = process.env.SEED_PARTNER_PASSWORD;
  if (partnerEmail && partnerPassword && partnerPassword.length >= 10) {
    console.log('Seeding SHAPE partner institution user...');
    const roleRepo = dataSource.getRepository(Role);
    const partnerRole = await roleRepo.findOne({
      where: { name: 'Partner Institution' },
    });
    const linkedPartner =
      partnersBySlug['open-university-of-kenya'] ||
      Object.values(partnersBySlug)[0];
    if (partnerRole && linkedPartner) {
      const hash = await bcrypt.hash(partnerPassword, 10);
      const email = partnerEmail.toLowerCase();
      let partnerUser = await userRepo.findOne({
        where: { email },
        withDeleted: true,
        select: [
          'id',
          'email',
          'password',
          'full_name',
          'is_active',
          'deleted_at',
          'partner_institution_id',
        ],
      });
      if (!partnerUser) {
        partnerUser = await userRepo.save(
          userRepo.create({
            email,
            username: email.split('@')[0],
            password: hash,
            full_name: 'SHAPE Partner User',
            role_legacy: UserRole.PARTNER_INSTITUTION,
            user_type: UserType.EXTERNAL,
            account_status: AccountStatus.ACTIVE,
            is_active: true,
            partner_institution_id: linkedPartner.id,
            last_password_change_at: new Date(),
            role: partnerRole,
          }),
        );
      } else {
        partnerUser.password = hash;
        partnerUser.deleted_at = null as any;
        partnerUser.is_active = true;
        partnerUser.role_legacy = UserRole.PARTNER_INSTITUTION;
        partnerUser.partner_institution_id = linkedPartner.id;
        partnerUser.last_password_change_at = new Date();
        partnerUser.role = partnerRole;
        await userRepo.save(partnerUser);
      }
      console.log(
        `Partner user linked to ${linkedPartner.short_name || linkedPartner.name}`,
      );
    }
  } else {
    console.log(
      'Skipping partner user seed (set SEED_PARTNER_EMAIL + SEED_PARTNER_PASSWORD to create one).',
    );
  }

  console.log('SHAPE seed completed successfully.');
};
