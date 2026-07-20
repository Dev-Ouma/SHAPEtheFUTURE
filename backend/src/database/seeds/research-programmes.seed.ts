import { DataSource } from 'typeorm';
import {
  ResearchProgramme,
  ResearchProgrammeStatus,
} from '../../research/entities/research-programme.entity';
import { School } from '../../programs/entities/school.entity';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { v4 as uuidv4 } from 'uuid';

export async function seedResearchProgrammes(dataSource: DataSource) {
  const programmeRepo = dataSource.getRepository(ResearchProgramme);
  const schoolRepo = dataSource.getRepository(School);
  const staffRepo = dataSource.getRepository(StaffMember);

  const count = await programmeRepo.count();
  if (count > 0) {
    console.log('Research Programmes already seeded, skipping...');
    return;
  }

  // Ensure some minimal staff existence for relations
  const staffQuery = await staffRepo.find({ take: 3 });
  if (staffQuery.length === 0) {
    console.log(
      'No staff found. Seeding research programmes requires at least a lead staff member.',
    );
  }

  const schoolsMap = await schoolRepo.find();
  const getSchool = () =>
    schoolsMap.length > 0
      ? schoolsMap[Math.floor(Math.random() * schoolsMap.length)]
      : undefined;
  const getStaff = () =>
    staffQuery.length > 0
      ? staffQuery[Math.floor(Math.random() * staffQuery.length)]
      : undefined;

  const MOCK_PROGRAMMES = [
    {
      title: 'Digital Transformation & Innovation',
      slug: 'digital-transformation-innovation-seed',
      status: ResearchProgrammeStatus.ACTIVE,
      overview:
        "Advancing Kenya's digital economy through research in AI, cloud computing, and digital governance frameworks for public institutions.",
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'World Bank',
      grant_amount: 12500000,
      start_date: '2023-01-15',
    },
    {
      title: 'Climate Resilience & Sustainable Agriculture',
      slug: 'climate-resilience-sustainable-agriculture-seed',
      status: ResearchProgrammeStatus.ACTIVE,
      overview:
        'Building data-driven solutions for food security, adaptive farming practices, and climate risk modelling across arid and semi-arid regions.',
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'USAID',
      grant_amount: 8900000,
      start_date: '2022-07-01',
    },
    {
      title: 'Open & Distance Learning Pedagogy',
      slug: 'open-distance-learning-pedagogy-seed',
      status: ResearchProgrammeStatus.ACTIVE,
      overview:
        'Researching best-in-class e-learning methodologies, mobile-first delivery strategies, and learner retention models for digital-native institutions.',
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'Commonwealth of Learning',
      grant_amount: 5200000,
      start_date: '2023-03-01',
    },
    {
      title: 'Public Health & Epidemiology',
      slug: 'public-health-epidemiology-seed',
      status: ResearchProgrammeStatus.PLANNED,
      overview:
        'Investigating disease surveillance, health systems strengthening and community health worker deployment models across sub-Saharan Africa.',
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'Wellcome Trust',
      grant_amount: 15000000,
      start_date: '2024-01-01',
    },
    {
      title: 'Governance & Public Policy',
      slug: 'governance-public-policy-seed',
      status: ResearchProgrammeStatus.ACTIVE,
      overview:
        "Examining constitutional reform, public sector accountability, and institutional design in East Africa's evolving democratic landscape.",
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'Ford Foundation',
      grant_amount: 7400000,
      start_date: '2022-11-15',
    },
    {
      title: 'FinTech & Financial Inclusion',
      slug: 'fintech-financial-inclusion-seed',
      status: ResearchProgrammeStatus.ACTIVE,
      overview:
        'Studying mobile money adoption, microfinance impact, and regulatory sandboxes for inclusive financial products across rural Kenya.',
      school: getSchool(),
      lead_researcher: getStaff(),
      funding_source: 'Gates Foundation',
      grant_amount: 9800000,
      start_date: '2023-06-01',
    },
  ];

  for (const prog of MOCK_PROGRAMMES) {
    const programme = programmeRepo.create(prog);
    await programmeRepo.save(programme);
  }

  console.log('Research Programmes seeded successfully!');
}
