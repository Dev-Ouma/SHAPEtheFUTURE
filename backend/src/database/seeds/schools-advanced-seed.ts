import { DataSource } from 'typeorm';
import { School } from '../../programs/entities/school.entity';
import { StaffMember } from '../../staff/entities/staff-member.entity';

export const runSchoolsAdvancedSeed = async (dataSource: DataSource) => {
  const schoolRepo = dataSource.getRepository(School);
  const staffRepo = dataSource.getRepository(StaffMember);

  console.log('--- STARTING ADVANCED SCHOOLS ENRICHMENT SEED ---');

  // 1. Get Deans from Staff Registry
  const deanSciTech = await staffRepo.findOne({
    where: { profile_slug: 'linda-wambui' },
  });
  const deanBusiness = await staffRepo.findOne({
    where: { profile_slug: 'samuel-kibet' },
  });

  const schoolsData = [
    {
      slug: 'school-of-science-technology',
      mission:
        '<p>To pioneer digital-first pedagogical models that empower learners with market-aligned technological competencies.</p>',
      vision:
        '<p>To be the leading global hub for virtual academic excellence in applied computing and emerging technologies.</p>',
      core_values:
        '<ul><li>Innovation First</li><li>Inclusivity</li><li>Academic Integrity</li><li>Digital Resilience</li></ul>',
      email: 'sci-tech@ouk.ac.ke',
      phone: '+254 711 000 111',
      website_url: 'https://ouk.ac.ke/schools/science-tech',
      social_links: {
        linkedin: 'https://linkedin.com/school/ouk-scitech',
        twitter: 'https://twitter.com/OUK_SciTech',
        facebook: 'https://facebook.com/OUKSciTech',
      },
      logo_url:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop',
      banner_image_url:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
      is_featured: true,
      display_order: 1,
      meta_title: 'School of Science & Technology | Open University of Kenya',
      meta_description:
        'Discover world-class online programs in Data Science, Cyber Security, and Software Engineering at OUK.',
      dean: deanSciTech,
    },
    {
      slug: 'school-of-business-economics',
      mission:
        '<p>To develop innovative business leaders capable of driving the digital economy through evidence-based strategic management.</p>',
      vision:
        '<p>A premiere virtual centre for global economic transformation and entrepreneurial leadership.</p>',
      core_values:
        '<ul><li>Ethics</li><li>Strategic Excellence</li><li>Market Relevance</li><li>Global Mindset</li></ul>',
      email: 'business@ouk.ac.ke',
      phone: '+254 711 000 222',
      website_url: 'https://ouk.ac.ke/schools/business-econ',
      social_links: {
        linkedin: 'https://linkedin.com/school/ouk-business',
        twitter: 'https://twitter.com/OUK_Business',
      },
      logo_url:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
      banner_image_url:
        'https://images.unsplash.com/photo-1454165833762-02ac4f40e1e8?q=80&w=2670&auto=format&fit=crop',
      is_featured: true,
      display_order: 2,
      meta_title: 'Business & Economics | Open University of Kenya',
      meta_description:
        'Advance your career with OUK’s flexible online programs in Business Strategy and Digital Economics.',
      dean: deanBusiness,
    },
  ];

  for (const data of schoolsData) {
    const school = await schoolRepo.findOne({ where: { slug: data.slug } });
    if (school) {
      Object.assign(school, data);
      await schoolRepo.save(school);
      console.log(`Enriched School: ${school.name}`);
    } else {
      console.warn(`School not found during enrichment: ${data.slug}`);
    }
  }

  console.log('--- ADVANCED SCHOOLS ENRICHMENT SEED COMPLETE ---');
};
