import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResearchService } from './research/research.service';
import {
  PublicationType,
  AccessLevel,
} from './research/entities/publication.entity';
import { Repository } from 'typeorm';
import { StaffMember } from './staff/entities/staff-member.entity';
import { School } from './programs/entities/school.entity';
import { Department } from './programs/entities/department.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const researchService = app.get(ResearchService);
  const staffRepo = app.get<Repository<StaffMember>>(
    getRepositoryToken(StaffMember),
  );
  const schoolRepo = app.get<Repository<School>>(getRepositoryToken(School));
  const deptRepo = app.get<Repository<Department>>(
    getRepositoryToken(Department),
  );

  console.log('--- Seeding Publications ---');

  const staff = await staffRepo.find({ take: 5 });
  const schools = await schoolRepo.find({ take: 3 });
  const depts = await deptRepo.find({ take: 3 });

  if (staff.length === 0 || schools.length === 0) {
    console.error('No staff or schools found. Please seed them first.');
    await app.close();
    return;
  }

  const samplePublications = [
    {
      title: 'Decentralized Academic Frameworks in Digital Universities',
      slug: 'decentralized-academic-frameworks',
      abstract:
        'This research explores the integration of decentralized autonomous organizations (DAOs) within modern digital university structures, focusing on governance and resource allocation.',
      publication_year: 2024,
      type: PublicationType.JOURNAL,
      journal_name: 'Journal of Digital Education',
      publisher: 'Oxford Academic',
      doi: '10.1234/jde.2024.001',
      url: 'https://journals.example.org/jde/2024/001',
      keywords: ['Blockchain', 'Education', 'Governance'],
      is_open_access: true,
      access_level: AccessLevel.PUBLIC,
      staff_authors: [staff[0]],
      school: schools[0],
      department: depts[0],
      status: 'Published',
    },
    {
      title: 'Optimizing Student Engagement via AI-Driven Mentorship',
      slug: 'optimizing-student-engagement-ai',
      abstract:
        'A longitudinal study on the impact of AI-assisted peer-to-peer mentorship platforms on student retention and academic performance in hybrid learning environments.',
      publication_year: 2023,
      type: PublicationType.CONFERENCE_PAPER,
      journal_name: 'International Conference on EdTech',
      publisher: 'IEEE',
      doi: '10.1234/edtech.2023.042',
      keywords: ['AI', 'Mentorship', 'Student Retention'],
      is_open_access: false,
      access_level: AccessLevel.PUBLIC,
      staff_authors: staff.slice(0, 2),
      school: schools[0],
      status: 'Published',
    },
    {
      title: 'Computational Linguistics in Bantu Language Processing',
      slug: 'bantu-language-processing-nlp',
      abstract:
        'Techniques for improving Natural Language Processing models for Bantu languages, with a focus on cross-lingual transfer learning.',
      publication_year: 2024,
      type: PublicationType.JOURNAL,
      journal_name: 'African Language Review',
      publisher: 'MIT Press',
      keywords: ['NLP', 'Linguistics', 'Bantu'],
      is_open_access: true,
      access_level: AccessLevel.PUBLIC,
      staff_authors: [staff[1], staff[2]],
      school: schools[1] || schools[0],
      department: depts[1] || depts[0],
      status: 'Published',
    },
  ];

  for (const pubData of samplePublications) {
    try {
      await researchService.create(pubData);
      console.log(`Seeded: ${pubData.title}`);
    } catch (err) {
      console.error(`Failed to seed ${pubData.title}:`, err.message);
    }
  }

  console.log('--- Seeding Completed ---');
  await app.close();
}

bootstrap();
