import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import {
  Download,
  DownloadStatus,
  AccessLevel,
} from './entities/download.entity';
import { DownloadCategory } from './entities/download-category.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const categoryRepo = dataSource.getRepository(DownloadCategory);
  const downloadRepo = dataSource.getRepository(Download);

  try {
    console.log('--- Seeding Institutional Registry ---');

    // 1. Seed Categories
    const categories = [
      {
        name: 'Institutional Documents',
        slug: 'institutional-documents',
        description:
          'Official university governance and establishment documents.',
      },
      {
        name: 'Academic Documents',
        slug: 'academic-documents',
        description:
          'Curriculum frameworks, academic calendars, and policy documents.',
      },
      {
        name: 'Reports & Publications',
        slug: 'reports-publications',
        description:
          'Annual reports, research highlights, and official publications.',
      },
    ];

    const seededCats = [];
    for (const cat of categories) {
      let existing = await categoryRepo.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        existing = await categoryRepo.save(categoryRepo.create(cat));
        console.log(`+ Category: ${cat.name}`);
      }
      seededCats.push(existing);
    }

    // 2. Seed Downloads (Matching Frontend Mocks)
    const instCat = seededCats.find(
      (c) => c.slug === 'institutional-documents',
    );
    const acadCat = seededCats.find((c) => c.slug === 'academic-documents');

    const downloads = [
      {
        title: 'University Charter',
        slug: 'university-charter',
        summary:
          'The legal instrument establishing the Open University of Kenya as a national specialised university.',
        document_type: 'PDF',
        file_size: 2516582,
        version: 'v1.0',
        file_url:
          'https://ouk.ac.ke/wp-content/uploads/2023/08/University-Charter.pdf',
        category: instCat,
        status: DownloadStatus.PUBLISHED,
        access_level: AccessLevel.PUBLIC,
        publish_at: new Date(),
      },
      {
        title: 'Strategic Plan (2023–2028)',
        slug: 'strategic-plan',
        summary:
          'Roadmap for excellence: Transforming higher education through digital innovation and inclusion.',
        document_type: 'PDF',
        file_size: 3250585,
        version: 'v2.1',
        file_url:
          'https://ouk.ac.ke/wp-content/uploads/2023/08/Strategic-Plan.pdf',
        category: instCat,
        status: DownloadStatus.PUBLISHED,
        access_level: AccessLevel.PUBLIC,
        publish_at: new Date(),
      },
      {
        title: 'Academic Calendar 2025',
        slug: 'academic-calendar-2025',
        summary:
          'Official semester dates, registration deadlines, and examination schedules for the current academic year.',
        document_type: 'PDF',
        file_size: 1258291,
        version: 'v1.1',
        file_url:
          'https://ouk.ac.ke/wp-content/uploads/2023/08/Academic-Calendar.pdf',
        category: acadCat,
        status: DownloadStatus.PUBLISHED,
        access_level: AccessLevel.PUBLIC,
        publish_at: new Date(),
      },
    ];

    for (const doc of downloads) {
      const existing = await downloadRepo.findOne({
        where: { slug: doc.slug },
      });
      if (!existing) {
        await downloadRepo.save(downloadRepo.create(doc));
        console.log(`+ Document: ${doc.title}`);
      }
    }

    console.log('--- Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Seeding Failed:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
