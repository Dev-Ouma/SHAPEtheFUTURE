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

  console.log('--- Adding 2 More Mock Publications ---');

  const staff = await staffRepo.find({ take: 5 });
  const schools = await schoolRepo.find({ take: 3 });
  const depts = await deptRepo.find({ take: 3 });

  const extraPublications = [
    {
      title: 'Quantum-Safe Cryptographic Protocols for Cloud Academic Records',
      slug: 'quantum-safe-academic-records',
      abstract:
        'As quantum computing advances, traditional cryptographic systems face existential threats. This paper proposes a lattice-based signature scheme optimized for high-volume academic credentialing in cloud environments, ensuring long-term data integrity and non-repudiation.',
      publication_year: 2024,
      type: PublicationType.TECHNICAL_REPORT,
      publisher: 'OUK Research Press',
      doi: '10.5678/ouk.crypto.2024.015',
      keywords: ['Quantum Cryptography', 'Cloud Security', 'Blockchain'],
      is_open_access: true,
      access_level: AccessLevel.PUBLIC,
      staff_authors: [staff[2], staff[3]].filter(Boolean),
      school: schools[1] || schools[0],
      department: depts[1] || depts[0],
      status: 'Published',
    },
    {
      title: 'Societal Impact of Open Access Education in Sub-Saharan Africa',
      slug: 'societal-impact-open-access-africa',
      abstract:
        'A comprehensive meta-analysis of how open-access digital repositories have transformed knowledge accessibility in rural communities across East Africa. The study identifies significant correlations between digital library adoption and local entrepreneurial growth.',
      publication_year: 2024,
      type: PublicationType.BOOK_CHAPTER,
      journal_name: 'Sustainable Development Trends',
      publisher: 'Global Academic Press',
      doi: '10.5678/sdg.2024.992',
      keywords: ['Open Access', 'Social Impact', 'Digital Inclusion'],
      is_open_access: true,
      access_level: AccessLevel.PUBLIC,
      staff_authors: [staff[0], staff[4]].filter(Boolean),
      school: schools[0],
      department: depts[2] || depts[0],
      status: 'Published',
    },
  ];

  for (const pubData of extraPublications) {
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
