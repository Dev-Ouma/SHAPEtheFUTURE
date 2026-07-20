import { DataSource } from 'typeorm';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { ExecutiveType } from '../../staff/entities/executive-type.entity';
import { StaffType } from '../../staff/entities/staff-type.entity';

export const runStaffSeed = async (dataSource: DataSource) => {
  const staffMemberRepo = dataSource.getRepository(StaffMember);
  const executiveTypeRepo = dataSource.getRepository(ExecutiveType);
  const staffTypeRepo = dataSource.getRepository(StaffType);

  console.log('--- STARTING STAFF & GOVERNANCE SEED ---');

  // 1. Seed Executive Types
  const executiveTypesData = [
    {
      name: 'Governing Council',
      description:
        'The supreme organ of the University providing oversight and direction.',
    },
    {
      name: 'University Management Board',
      description: 'The executive body responsible for day-to-day operations.',
    },
  ];

  const executiveTypes: Record<string, ExecutiveType> = {};
  for (const data of executiveTypesData) {
    let type = await executiveTypeRepo.findOne({ where: { name: data.name } });
    if (!type) {
      type = await executiveTypeRepo.save(executiveTypeRepo.create(data));
      console.log(`Created Executive Type: ${data.name}`);
    }
    executiveTypes[data.name] = type;
  }

  // 2. Seed Staff Types
  const staffTypesData = [
    {
      name: 'Executive Leadership',
      description: 'Top-tier management and council members.',
    },
    { name: 'Academic Faculty', description: 'Professors and lecturers.' },
    {
      name: 'Administrative Staff',
      description: 'Support and corporate service staff.',
    },
  ];

  const staffTypes: Record<string, StaffType> = {};
  for (const data of staffTypesData) {
    let type = await staffTypeRepo.findOne({ where: { name: data.name } });
    if (!type) {
      type = await staffTypeRepo.save(staffTypeRepo.create(data));
      console.log(`Created Staff Type: ${data.name}`);
    }
    staffTypes[data.name] = type;
  }

  // 3. Seed 7 Mock Staff Members
  const staffMembers = [
    {
      full_name: 'Ezra Maritim',
      honorific_title: 'Prof. Dr.',
      profile_slug: 'ezra-maritim',
      bio: 'Distinguished academic leader with over 30 years of experience in higher education management.',
      message:
        'The Open University of Kenya is a testament to our commitment to democratizing education.',
      academic_qualifications:
        'Ph.D. Educational Admin (Harvard), M.Ed. (UoN), B.Ed. (Egerton)',
      specializations:
        'Institutional Governance, Digital Pedagogy, Higher Education Policy',
      publications: '<ul><li>Digital Transformation in Africa (2022)</li></ul>',
      email: 'chair.council@ouk.ac.ke',
      phone_number: '+254 700 000 000',
      website_url: 'https://ouk.ac.ke',
      linkedin_url: 'https://linkedin.com/in/ezra-maritim',
      google_scholar_url: 'https://scholar.google.com/citations?user=ezra',
      service_start_date: '2023-01-01',
      is_current: true,
      executive_type: executiveTypes['Governing Council'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 1,
      profile_image_url:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop',
    },
    {
      full_name: 'Jane Mutua',
      honorific_title: 'Dr.',
      profile_slug: 'jane-mutua',
      bio: 'Expert in corporate governance and digital transformation.',
      message:
        'Accountability and innovation are the twin pillars of OUK governance.',
      academic_qualifications:
        'Doctor of Business Admin (Strathmore), MBA (UoN), CPA-K',
      specializations: 'Risk Management, Corporate Strategy, Audit',
      email: 'j.mutua@ouk.ac.ke',
      linkedin_url: 'https://linkedin.com/in/jane-mutua',
      twitter_url: 'https://twitter.com/janemutua',
      service_start_date: '2023-01-01',
      is_current: true,
      executive_type: executiveTypes['Governing Council'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 2,
      profile_image_url:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
    },
    {
      full_name: 'John Musuku',
      honorific_title: 'Amb.',
      profile_slug: 'john-musuku',
      bio: 'Seasoned diplomat fostering international academic collaborations.',
      message:
        'Building bridges across continents to bring global knowledge to every Kenyan doorstep.',
      academic_qualifications:
        'MA International Relations (Tufts), BA Diplomacy (UoN)',
      specializations:
        'International Relations, Diplomacy, Global Partnerships',
      email: 'j.musuku@mfa.go.ke',
      linkedin_url: 'https://linkedin.com/in/john-musuku',
      service_start_date: '2023-01-01',
      is_current: true,
      executive_type: executiveTypes['Governing Council'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 3,
      profile_image_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop',
    },
    {
      full_name: 'Mary Okello',
      honorific_title: 'Prof.',
      profile_slug: 'mary-okello',
      bio: 'Pioneer in gender-inclusive educational frameworks and tech-enabled literacy.',
      message:
        'Equal access to digital tools is the greatest equalizer of our time.',
      academic_qualifications: 'Ph.D. Educational Policy, M.A. Social Work',
      specializations: 'Gender Studies, Inclusive Pedagogy, Community Outreach',
      email: 'm.okello@ouk.ac.ke',
      linkedin_url: 'https://linkedin.com/in/maryokello',
      service_start_date: '2023-05-01',
      is_current: true,
      executive_type: executiveTypes['Governing Council'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 4,
      profile_image_url:
        'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2670&auto=format&fit=crop',
    },
    {
      full_name: 'James Njiru',
      honorific_title: 'Prof. Dr.',
      profile_slug: 'james-njiru',
      bio: 'Academic pioneer leading the operational execution of OUK.',
      message:
        'OUK is not just a university; it is a movement to digitize the intellect of the nation.',
      academic_qualifications:
        'Ph.D. Computer Science (Edinburgh), M.Sc. Data Science',
      specializations:
        'Artificial Intelligence, Remote Learning Systems, Cloud Infrastructure',
      publications: '<ul><li>AI-Driven Pedagogy (2023)</li></ul>',
      email: 'vc@ouk.ac.ke',
      phone_number: '+254 711 000 000',
      github_url: 'https://github.com/jnjiru',
      google_scholar_url: 'https://scholar.google.com/citations?user=njiru',
      service_start_date: '2023-01-01',
      is_current: true,
      executive_type: executiveTypes['University Management Board'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 1,
      profile_image_url:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop',
    },
    {
      full_name: 'Sarah Wangari',
      honorific_title: 'Dr.',
      profile_slug: 'sarah-wangari',
      bio: 'Expert in academic registry management and student lifecycle systems.',
      message:
        'Efficiency in registration and integrity in examinations are our core promises.',
      academic_qualifications: 'Ph.D. Academic Planning (UoN), MBA, B.Ed.',
      specializations:
        'Academic Administration, Student Data Privacy, Quality Assurance',
      email: 'registrar.academic@ouk.ac.ke',
      linkedin_url: 'https://linkedin.com/in/sarahwangari',
      service_start_date: '2023-01-01',
      is_current: true,
      executive_type: executiveTypes['University Management Board'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 2,
      profile_image_url:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop',
    },
    {
      full_name: 'David Kiprop',
      honorific_title: 'Mr.',
      profile_slug: 'david-kiprop',
      bio: 'Finance and operations strategist with 20 years in public sector resource management.',
      message:
        'Fiscal sustainability is the fuel that powers our digital campus.',
      academic_qualifications: 'MBA in Finance (Wharton), B.Com (UoN), CPA-K',
      specializations:
        'Public Finance, Operational Excellence, Resource Mobilization',
      email: 'finance@ouk.ac.ke',
      phone_number: '+254 722 000 000',
      linkedin_url: 'https://linkedin.com/in/davidkiprop',
      service_start_date: '2023-08-01',
      is_current: true,
      executive_type: executiveTypes['University Management Board'],
      staff_type: staffTypes['Executive Leadership'],
      display_order: 3,
      profile_image_url:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop',
    },
    {
      full_name: 'Linda Wambui',
      honorific_title: 'Prof. Dr.',
      profile_slug: 'linda-wambui',
      bio: 'Leading authority in Quantum Computing and AI paradigms.',
      message: 'Bridging the gap between theory and digital practice.',
      academic_qualifications:
        'Ph.D. Computer Engineering (MIT), M.Sc. Data Science (Stanford)',
      specializations: 'Quantum Algorithms, Neural Networks',
      email: 'dean.scitech@ouk.ac.ke',
      is_current: true,
      executive_type: executiveTypes['University Management Board'],
      staff_type: staffTypes['Academic Faculty'],
      display_order: 4,
      profile_image_url:
        'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2574&auto=format&fit=crop',
    },
    {
      full_name: 'Samuel Kibet',
      honorific_title: 'Dr.',
      profile_slug: 'samuel-kibet',
      bio: 'Visionary economist specializing in digital economies and African markets.',
      message: 'The digital economy is the frontier of Kenyan prosperity.',
      academic_qualifications: 'Ph.D. Economics (LSE), MA Economics (UoN)',
      specializations: 'Digital Economy, Institutional Finance',
      email: 'dean.business@ouk.ac.ke',
      is_current: true,
      executive_type: executiveTypes['University Management Board'],
      staff_type: staffTypes['Academic Faculty'],
      display_order: 5,
      profile_image_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop',
    },
  ];

  for (const data of staffMembers) {
    if (
      !(await staffMemberRepo.findOne({
        where: { profile_slug: data.profile_slug },
      }))
    ) {
      await staffMemberRepo.save(staffMemberRepo.create(data));
      console.log(`Seeded Staff Member: ${data.full_name}`);
    }
  }

  console.log('--- STAFF & GOVERNANCE SEED COMPLETE ---');
};
