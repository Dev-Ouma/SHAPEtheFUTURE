import { DataSource } from 'typeorm';
import {
  Partner,
  PartnerCategory,
  PartnershipProject,
  PartnershipType,
} from '../../backlinks/entities/backlink.entity';

export const runPartnershipsSeed = async (dataSource: DataSource) => {
  const partnerRepo = dataSource.getRepository(Partner);
  const categoryRepo = dataSource.getRepository(PartnerCategory);
  const projectRepo = dataSource.getRepository(PartnershipProject);

  // 1. Clear Existing Data
  await dataSource.query('DELETE FROM "partnership_projects"');
  await dataSource.query('DELETE FROM "partners"');
  await dataSource.query('DELETE FROM "partner_categories"');

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Academic Partners', slug: 'academic' },
    { name: 'Industry Leaders', slug: 'industry' },
    { name: 'Government Agencies', slug: 'government' },
    { name: 'Research Institutions', slug: 'research' },
    { name: 'Technology Partners', slug: 'technology' },
  ];

  const categories: Record<string, PartnerCategory> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await categoryRepo.save(categoryRepo.create(cat));
  }

  // 3. Seed Partners
  const partnersData = [
    {
      name: 'Safaricom PLC',
      slug: 'safaricom',
      logo_url: '/images/partners/safaricom.png',
      website_url: 'https://safaricom.co.ke',
      description:
        "Strategic technology partner enabling OUK's digital delivery infrastructure and providing industrial attachment opportunities for students.",
      partnership_type: PartnershipType.INDUSTRY,
      category: categories['industry'],
      is_featured: true,
      start_date: new Date('2024-01-01'),
      order: 1,
    },
    {
      name: 'Ministry of Education',
      slug: 'ministry-of-education',
      logo_url: '/images/partners/ministry.png',
      website_url: 'https://education.go.ke',
      description:
        "Primary regulatory partner ensuring OUK's compliance with national higher education standards and supporting digital literacy initiatives.",
      partnership_type: PartnershipType.GOVERNMENT,
      category: categories['government'],
      is_featured: true,
      start_date: new Date('2023-08-01'),
      order: 2,
    },
    {
      name: 'Microsoft Africa Development Center',
      slug: 'microsoft-adc',
      logo_url: '/images/partners/microsoft.png',
      website_url: 'https://microsoft.com',
      description:
        'Collaboration on curriculum design for computer science and AI programs, ensuring OUK graduates are globally competitive.',
      partnership_type: PartnershipType.TECHNOLOGY,
      category: categories['technology'],
      is_featured: true,
      start_date: new Date('2024-03-01'),
      order: 3,
    },
    {
      name: 'University of Nairobi',
      slug: 'uon',
      logo_url: 'https://www.uonbi.ac.ke/sites/default/files/uon_logo_0.png',
      website_url: 'https://uonbi.ac.ke',
      description:
        'Academic exchange partner for joint research projects and postgraduate supervision in emerging technologies.',
      partnership_type: PartnershipType.ACADEMIC,
      category: categories['academic'],
      is_featured: false,
      start_date: new Date('2024-02-15'),
      order: 4,
    },
  ];

  const partners: Record<string, Partner> = {};
  for (const p of partnersData) {
    partners[p.slug] = await partnerRepo.save(partnerRepo.create(p));
  }

  // 4. Seed Partnership Projects
  const projectsData = [
    {
      title: 'Digital Talent Incubation Program',
      description:
        'A joint initiative with Safaricom to identify and nurture top-tier software engineering talent from OUK students.',
      project_link: 'https://ouk.ac.ke/initiatives/safaricom-talent',
      partner: partners['safaricom'],
    },
    {
      title: 'AI for Development Lab',
      description:
        'Collaborative research hub with Microsoft ADC focused on localized AI solutions for Kenyan agriculture.',
      project_link: 'https://ouk.ac.ke/research/ai-lab',
      partner: partners['microsoft-adc'],
    },
    {
      title: 'Curriculum Standardization Project',
      description:
        'Ensuring digital-first degree programs meet Ministry of Education quality assurance frameworks.',
      partner: partners['ministry-of-education'],
    },
  ];

  for (const proj of projectsData) {
    await projectRepo.save(projectRepo.create(proj));
  }
};
