import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Menu } from '../../menus/entities/menu.entity';
import { Program } from '../../programs/entities/program.entity';
import { Page } from '../../pages/entities/page.entity';
import { Setting } from '../../settings/entities/setting.entity';
import { User, UserRole } from '../../auth/entities/user.entity';
import { School } from '../../programs/entities/school.entity';
import { CourseUnit } from '../../programs/entities/course-unit.entity';
import { runDataScienceSeed } from './data-science-curriculum';
import { runShortCourseSeed } from './short-courses-seed';
import { runStaffSeed } from './staff-seed';
import { runDownloadsSeed } from './downloads-seed';
import { runCampusFeedbackSeed } from './campus-feedback-seed';
import { runPeerLearnersSeed } from './peer-learners-seed';
import { runSchoolsAdvancedSeed } from './schools-advanced-seed';
import { runCareersSeed } from './careers-seed';
import { seedLibrary } from './library-seed';
import { runFaqsSeed } from './faqs-seed';
import { runCalendarSeed } from './calendar-seed';
import { seedResources } from './resources-seed';
import { seedScienceMockData } from './science-mock-seed';
import { seedEvents } from './events-seed';
import { runStudentsSeed } from './students-seed';
import { runAdminSidebarSeed } from './admin-sidebar-seed';
import { runPartnershipsSeed } from './partnerships-seed';
import { runShapeSeed } from './shape-seed';

export const runSeed = async (dataSource: DataSource) => {
  const menuRepo = dataSource.getRepository(Menu);
  const programRepo = dataSource.getRepository(Program);
  const pageRepo = dataSource.getRepository(Page);
  const settingRepo = dataSource.getRepository(Setting);
  const userRepo = dataSource.getRepository(User);
  const schoolRepo = dataSource.getRepository(School);

  // 0. Cleanup Academic Data for Clean Slate (Atomic Order)
  console.log('--- NUCLEAR ACADEMIC RESET: INITIALIZING ---');
  try {
    // 1. Clear Join Tables first
    await dataSource.query('DELETE FROM "course_unit_programmes"');

    // 2. Clear Course Units
    await dataSource.query('DELETE FROM "course_units"');

    // 3. Clear Short Course Modules & Courses
    await dataSource.query('DELETE FROM "short_course_modules"');
    await dataSource.query('DELETE FROM "short_courses"');

    // 4. Clear Programs
    await dataSource.query('DELETE FROM "programs"');

    // 5. Clear Schools
    await dataSource.query('DELETE FROM "schools"');

    console.log('--- NUCLEAR ACADEMIC RESET: COMPLETE ---');
  } catch (err) {
    console.warn(
      'Cleanup warning (some tables may already be empty):',
      err.message,
    );
  }

  // 0. Seed Users — password from env only (never hardcode)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ouk.ac.ke';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 10) {
    throw new Error(
      'Set SEED_ADMIN_PASSWORD (min 10 chars) before seeding. Do not commit passwords.',
    );
  }
  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail },
    withDeleted: true,
  });
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  if (!existingAdmin) {
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        password: adminPasswordHash,
        full_name: 'System Administrator',
        role_legacy: UserRole.ADMIN,
        is_active: true,
      }),
    );
  } else {
    existingAdmin.password = adminPasswordHash;
    existingAdmin.deleted_at = null as any;
    existingAdmin.is_active = true;
    await userRepo.save(existingAdmin);
  }

  // 1. Seed Global Settings
  const settings = [
    { key: 'site_name', value: 'Open University of Kenya' },
    { key: 'contact_email', value: 'info@ouk.ac.ke' },
    { key: 'contact_phone', value: '+254 700 000 000' },
    { key: 'address', value: 'Nairobi, Kenya' },
    { key: 'twitter_url', value: 'https://twitter.com/ouk_kenya' },
    { key: 'facebook_url', value: 'https://facebook.com/ouk_kenya' },
    { key: 'linkedin_url', value: 'https://linkedin.com/school/ouk' },
    { key: 'cta_apply_url', value: '/admissions' },
    { key: 'cta_portal_url', value: 'https://portal.ouk.ac.ke' },
  ];

  for (const s of settings) {
    if (!(await settingRepo.findOne({ where: { key: s.key } }))) {
      await settingRepo.save(settingRepo.create(s));
    }
  }

  // 2. Seed Menus (Header & Footer)
  const menus = [
    {
      title: 'Programs',
      slug: 'programs',
      link: '/#programs',
      order: 1,
      position: 'header',
    },
    {
      title: 'Short Courses',
      slug: 'short-courses',
      link: '/short-courses',
      order: 2,
      position: 'header',
    },
    {
      title: 'Admissions',
      slug: 'admissions',
      link: '/admissions',
      order: 3,
      position: 'header',
    },
    {
      title: 'Research',
      slug: 'research',
      link: '/research',
      order: 4,
      position: 'header',
    },
    {
      title: 'About OUK',
      slug: 'about',
      link: '/about',
      order: 5,
      position: 'header',
    },

    // Footer - Registration column
    { title: 'Registration', slug: 'footer-reg', order: 1, position: 'footer' },
    // Footer - Schools column
    {
      title: 'Our Schools',
      slug: 'footer-schools',
      order: 2,
      position: 'footer',
    },
    // Footer - Legal column
    {
      title: 'Institutional',
      slug: 'footer-legal',
      order: 3,
      position: 'footer',
    },
  ];

  for (const m of menus) {
    let menu = await menuRepo.findOne({
      where: { slug: m.slug },
      withDeleted: true,
    });
    if (!menu) {
      menu = await menuRepo.save(menuRepo.create(m));
    }

    // Add children for footer columns
    if (m.slug === 'footer-reg') {
      const children = [
        { title: 'Apply Now', slug: 'apply', link: '/admissions', order: 1 },
        { title: 'Student Portal', slug: 'portal', link: '/portal', order: 2 },
        {
          title: 'Admission Policy',
          slug: 'adm-policy',
          link: '/about/policies',
          order: 3,
        },
      ];
      for (const c of children) {
        if (
          !(await menuRepo.findOne({
            where: { slug: c.slug },
            withDeleted: true,
          }))
        ) {
          await menuRepo.save(
            menuRepo.create({ ...c, parent: menu, position: 'footer' }),
          );
        }
      }
    }

    if (m.slug === 'footer-schools') {
      const children = [
        {
          title: 'Science & Tech',
          slug: 'f-sci',
          link: '/programs/science-tech',
          order: 1,
        },
        {
          title: 'Business & Econ',
          slug: 'f-bus',
          link: '/programs/business-econ',
          order: 2,
        },
      ];
      for (const c of children) {
        if (
          !(await menuRepo.findOne({
            where: { slug: c.slug },
            withDeleted: true,
          }))
        ) {
          await menuRepo.save(
            menuRepo.create({ ...c, parent: menu, position: 'footer' }),
          );
        }
      }
    }
  }

  // 3. Seed Schools
  const schoolsData = [
    {
      name: 'School of Science & Technology',
      name_sw: 'Shule ya Sayansi na Teknolojia',
      slug: 'school-of-science-technology',
      description:
        'Driving digital-first innovation through applied computing, data science, and emerging technology disciplines.',
      description_sw:
        'Kuendesha uvumbuzi wa kidijitali kupitia kompyuta iliyotumika, sayansi ya data, na taaluma zinazoibuka za kiteknolojia.',
    },
    {
      name: 'School of Business & Economics',
      name_sw: 'Shule ya Biashara na Uchumi',
      slug: 'school-of-business-economics',
      description:
        'Developing globally competitive business leaders through online education in management, entrepreneurship, and economic policy.',
      description_sw:
        'Kuendeleza viongozi wa biashara wenye ushindani duniani kote kupitia elimu ya mtandaoni katika usimamizi, ujasiriamali, na sera ya kiuchumi.',
    },
    {
      name: 'School of Education',
      name_sw: 'Shule ya Elimu',
      slug: 'school-of-education',
      description:
        "Transforming pedagogy through digital-first teaching, curriculum design, and educational leadership for Kenya's learning ecosystem.",
      description_sw:
        'Kubadilisha ufundishaji kupitia mafundisho ya kidijitali, muundo wa mtaala, na uongozi wa elimu kwa mfumo wa ikolojia wa kujifunza nchini Kenya.',
    },
  ];

  const schools: any = {};
  for (const s of schoolsData) {
    let school = await dataSource
      .getRepository(School)
      .findOne({ where: { slug: s.slug } });
    if (!school) {
      school = await dataSource
        .getRepository(School)
        .save(dataSource.getRepository(School).create(s));
    } else {
      // Update info if it exists
      Object.assign(school, s);
      await dataSource.getRepository(School).save(school);
    }
    schools[s.slug] = school;
  }

  // 4. Seed Programs
  const programs = [
    {
      title: 'Science & Technology Foundations',
      slug: 'science-tech-foundations',
      duration: '4 Years',
      level: 'Undergraduate',
      school: schools['school-of-science-technology'],
    },
    {
      title: 'Business & Economic Strategy',
      slug: 'business-econ-strategy',
      duration: '4 Years',
      level: 'Undergraduate',
      school: schools['school-of-business-economics'],
    },
  ];

  for (const item of programs) {
    if (
      !(await programRepo.findOne({
        where: { slug: item.slug },
        withDeleted: true,
      }))
    ) {
      await programRepo.save(programRepo.create(item));
    }
  }

  // 5. Seed Static Pages
  const pages = [
    {
      title: 'About Open University of Kenya',
      title_sw: 'Kuhusu Chuo Kikuu Huria cha Kenya',
      slug: 'about',
      content:
        'Established to provide flexible, affordable, and high-quality online education, the Open University of Kenya is at the forefront of digital transformation in higher education. Our mission is to democratize education through innovation and accessibility.',
      content_sw:
        'Imeanzishwa ili kutoa elimu ya mtandaoni inayobadilika, ya bei nafuu, na ya ubora wa juu, Chuo Kikuu Huria cha Kenya kiko mstari wa mbele katika mabadiliko ya kidijitali katika elimu ya juu. Dhamira yetu ni kufanya elimu ifikike kwa wote kupitia ubunifu na ufikiaji.',
      summary:
        'Learn about the mission, leadership, and history of the Open University of Kenya.',
      summary_sw:
        'Jifunze kuhusu dhamira, uongozi, na historia ya Chuo Kikuu Huria cha Kenya.',
      meta_title: 'About OUK | Leading Online Education in Kenya',
      meta_title_sw: 'Kuhusu OUK | Elimu Bora Mtandaoni nchini Kenya',
    },
    {
      title: 'University Policies',
      title_sw: 'Sera za Chuo',
      slug: 'about/policies',
      content:
        'Our policies are designed to ensure fair, transparent, and high-quality educational experiences for all students. This page includes our Admission Policy, Academic Integrity Code, and Privacy Policy.',
      content_sw:
        'Sera zetu zimeundwa kuhakikisha uzoefu wa kielimu ulio sawa, wa uwazi, na wa ubora wa juu kwa wanafunzi wote. Ukurasa huu unajumuisha Sera yetu ya Udahili, Kanuni ya Uadilifu wa Kitaaluma, na Sera ya Faragha.',
      summary_sw:
        'Sera rasmi zinazoongoza ubora, uadilifu, na utawala.',
      meta_title_sw: 'Sera za Chuo | Chuo Kikuu Huria cha Kenya',
    },
    {
      title: 'Admissions',
      title_sw: 'Udahili',
      slug: 'admissions',
      summary:
        'Join a global community of digital learners. Our admissions process is transparent, flexible, and designed for working professionals.',
      summary_sw:
        'Jiunge na jamii ya kimataifa ya wanafunzi wa kidijitali. Mchakato wetu wa udahili ni wa uwazi, unaonyumbulika, na umeundwa kwa wataalamu wanaofanya kazi.',
      content:
        '<p>The Open University of Kenya welcomes applicants to undergraduate, postgraduate, and professional development pathways.</p>',
      content_sw:
        '<p>Chuo Kikuu Huria cha Kenya kinakaribisha waombaji kwa njia za shahada ya kwanza, uzamili, na maendeleo ya kitaaluma.</p>',
      meta_title: 'Admissions | The Open University of Kenya',
      meta_title_sw: 'Udahili | Chuo Kikuu Huria cha Kenya',
    },
    {
      title: 'Academics',
      title_sw: 'Masomo',
      slug: 'academics',
      summary:
        "OUK's academic hub bridges global knowledge and local innovation through digital-first schools and programmes.",
      summary_sw:
        'Kituo cha masomo cha OUK kinaunganisha maarifa ya kimataifa na uvumbuzi wa ndani kupitia shule na programu zinazoongoza kwa kidijitali.',
      content:
        '<p>Explore OUK schools, programmes, timetables, and professional development offerings.</p>',
      content_sw:
        '<p>Gundua shule za OUK, programu, ratiba, na matoleo ya maendeleo ya kitaaluma.</p>',
      meta_title: 'Academics & schools | Open University of Kenya',
      meta_title_sw: 'Masomo na shule | Chuo Kikuu Huria cha Kenya',
    },
    {
      title: 'Research',
      title_sw: 'Utafiti',
      slug: 'research',
      summary:
        'Pioneering digital discovery and bridging theoretical scholarship with practical innovation.',
      summary_sw:
        'Kuanzisha ugunduzi wa kidijitali na kuunganisha elimu ya nadharia na uvumbuzi wa vitendo.',
      content:
        '<p>OUK research advances technology-driven discovery through publications, programmes, and partnerships.</p>',
      content_sw:
        '<p>Utafiti wa OUK unaendeleza ugunduzi unaoendeshwa na teknolojia kupitia machapisho, programu, na ushirikiano.</p>',
      meta_title: 'Research with global impact | Open University of Kenya',
      meta_title_sw:
        'Utafiti wenye athari ya kimataifa | Chuo Kikuu Huria cha Kenya',
    },
    {
      title: 'Digital Library',
      title_sw: 'Maktaba ya Kidijitali',
      slug: 'library',
      summary:
        "Access OUK's global digital repository of e-journals, databases, and continuous learning resources.",
      summary_sw:
        'Fikia hazina ya kidijitali ya kimataifa ya OUK ya majarida ya kielektroniki, hifadhidata, na rasilimali za kujifunza endelevu.',
      content:
        '<p>The OUK virtual library connects learners to e-resources and information literacy support.</p>',
      content_sw:
        '<p>Maktaba pepe ya OUK inawaunganisha wanafunzi na rasilimali za kielektroniki na msaada wa ujuzi wa habari.</p>',
      meta_title: 'Digital library | Open University of Kenya',
      meta_title_sw: 'Maktaba ya kidijitali | Chuo Kikuu Huria cha Kenya',
    },
  ];

  for (const p of pages) {
    const existing = await pageRepo.findOne({
      where: { slug: p.slug },
      withDeleted: true,
    });
    if (!existing) {
      await pageRepo.save(pageRepo.create(p));
    } else {
      // Backfill empty SW fields without overwriting editor content
      const patch: Record<string, string> = {};
      for (const key of [
        'title_sw',
        'content_sw',
        'summary_sw',
        'meta_title_sw',
        'meta_description_sw',
      ] as const) {
        const next = (p as any)[key];
        if (next && !(existing as any)[key]) patch[key] = next;
      }
      if (Object.keys(patch).length) {
        Object.assign(existing, patch);
        await pageRepo.save(existing);
      }
    }
  }

  // 5.5 Run Staff & Governance Seed
  console.log('Starting Staff & Governance seeding...');
  try {
    await runStaffSeed(dataSource);
    console.log('Staff & Governance seed completed.');
  } catch (err) {
    console.error('ERROR during Staff & Governance seed:', err.message);
  }

  // 6. Run Data Science Curriculum Seed
  console.log('Starting Data Science curriculum seeding...');
  try {
    await runDataScienceSeed(dataSource);
    console.log('Data Science curriculum seed completed.');
  } catch (err) {
    console.error('ERROR during Data Science curriculum seed:', err.message);
  }

  // 7. Run Professional Training Seed
  console.log('Starting Professional Training seeding...');
  try {
    await runShortCourseSeed(dataSource);
    console.log('Professional Training seed completed.');
  } catch (err) {
    console.error('ERROR during Professional Training seed:', err.message);
  }

  // 9. Run Institutional Downloads Seed
  console.log('Starting Institutional Downloads seeding...');
  try {
    await runDownloadsSeed(dataSource);
    console.log('Institutional Downloads seed completed.');
  } catch (err) {
    console.error('ERROR during Institutional Downloads seed:', err.message);
  }

  // 10. Run Public Complaints Seed
  console.log('Starting Public Complaints seeding...');
  try {
    await runCampusFeedbackSeed(dataSource);
    console.log('Public Complaints seed completed.');
  } catch (err) {
    console.error('ERROR during Public Complaints seed:', err.message);
  }

  // 11. Run Peer Learners Seed
  console.log('Starting Peer Learners seeding...');
  try {
    await runPeerLearnersSeed(dataSource);
    console.log('Peer Learners seed completed.');
  } catch (err) {
    console.error('ERROR during Peer Learners seed:', err.message);
  }

  // 12. Run Advanced Schools Enrichment Seed
  console.log('Starting Advanced Schools Enrichment seeding...');
  try {
    await runSchoolsAdvancedSeed(dataSource);
    console.log('Advanced Schools Enrichment seed completed.');
  } catch (err) {
    console.error(
      'ERROR during Advanced Schools Enrichment seed:',
      err.message,
    );
  }

  // 14. Run Library Seed
  console.log('Starting Library seeding...');
  try {
    await runCalendarSeed(dataSource);
    await seedResources(dataSource);
    await seedScienceMockData(dataSource);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('ERROR during Library seed:', error.message);
  }

  // 15. Run FAQ Seed
  console.log('Starting FAQ seeding...');
  try {
    await runFaqsSeed(dataSource);
    console.log('FAQ seed completed.');
  } catch (err) {
    console.error('ERROR during FAQ seed:', err.message);
  }

  // 16. Run News Seed
  console.log('Starting News seeding...');
  try {
    const { runNewsSeed } = require('./news-seed');
    await runNewsSeed(dataSource);
    console.log('News seed completed.');
  } catch (err) {
    console.error('ERROR during News seed:', err.message);
  }

  // 17. Run Calendar Seed
  console.log('Starting Calendar seeding...');
  try {
    const { runCalendarSeed } = require('./calendar-seed');
    await runCalendarSeed(dataSource);
    console.log('Calendar seed completed.');
  } catch (err) {
    console.error('ERROR during Calendar seed:', err.message);
  }

  // 18. Run Events Seed
  console.log('Starting Events seeding...');
  try {
    await seedEvents(dataSource);
    console.log('Events seed completed.');
  } catch (err) {
    console.error('ERROR during Events seed:', err.message);
  }

  // 19. Run Students Seed
  console.log('Starting Student Portal seeding...');
  try {
    await runStudentsSeed(dataSource);
    console.log('Student Portal seed completed.');
  } catch (err) {
    console.error('ERROR during Student Portal seed:', err.message);
  }

  // 20. Run Admin Sidebar Seed
  console.log('Starting Admin Sidebar seeding...');
  try {
    await runAdminSidebarSeed(dataSource);
    console.log('Admin Sidebar seed completed.');
  } catch (err) {
    console.error('ERROR during Admin Sidebar seed:', err.message);
  }

  // 21. Run Partnerships Seed
  console.log('Starting Partnerships seeding...');
  try {
    await runPartnershipsSeed(dataSource);
    console.log('Partnerships seed completed.');
  } catch (err) {
    console.error('ERROR during Partnerships seed:', err.message);
  }

  // 22. Run SHAPE Erasmus+ Grant Portal Seed
  console.log('Starting SHAPE grant portal seeding...');
  try {
    await runShapeSeed(dataSource);
    console.log('SHAPE seed completed.');
  } catch (err) {
    console.error('ERROR during SHAPE seed:', err.message);
  }

  console.log('Global seeding orchestration complete.');
};
