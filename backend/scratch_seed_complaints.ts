
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComplaintCategory } from './src/complaints/entities/complaint-category.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoryRepo = app.get<Repository<ComplaintCategory>>(getRepositoryToken(ComplaintCategory));

    try {
      console.log('--- Orchestrating Complaint Categories ---');
      const defaults = [
        { name: 'Academic Affairs', slug: 'academic-affairs', description: 'Grievances related to units, grading, and faculty interaction.', is_active: true },
        { name: 'Financial Services', slug: 'financial-services', description: 'Issues with tuition, scholarships, or billing orchestration.', is_active: true },
        { name: 'Staff Conduct', slug: 'staff-conduct', description: 'Reports regarding professional ethics or staff behaviour.', is_active: true },
        { name: 'Facilities & ICT', slug: 'facilities', description: 'Physical campus issues or digital platform (LMS/Portal) failures.', is_active: true },
        { name: 'Admissions & Registry', slug: 'admissions', description: 'Disputes regarding enrolment, transfers, or graduation.', is_active: true },
        { name: 'Student Welfare', slug: 'welfare', description: 'Housing, hostel conditions, meals, and health services.', is_active: true },
        { name: 'Academic Integrity', slug: 'integrity', description: 'Reporting plagiarism, exam cheating, or research ethics.', is_active: true },
        { name: 'Safe Campus (GBV)', slug: 'gbv', description: 'Secure reporting for sexual harassment and gender-based violence.', is_active: true },
        { name: 'Security & Safety', slug: 'security', description: 'Campus policing, lost property, and emergency response.', is_active: true },
        { name: 'Library & Assets', slug: 'library', description: 'Resource availability, borrowing disputes, and digital assets.', is_active: true },
        { name: 'Sports & Activity', slug: 'sports', description: 'Participation disputes or extracurricular coordination issues.', is_active: true },
        { name: 'General / Others', slug: 'general', description: 'Miscellaneous grievances not captured in other domains.', is_active: true },
      ];

      for (const item of defaults) {
        let cat = await categoryRepo.findOne({ where: { slug: item.slug } });
        if (cat) {
          cat.name = item.name;
          cat.description = item.description;
          await categoryRepo.save(cat);
          console.log(`Updated: ${item.name}`);
        } else {
          await categoryRepo.save(item);
          console.log(`Created: ${item.name}`);
        }
      }
      
      console.log('Orchestration complete.');

  } catch (err) {
    console.error('Error during database orchestration:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
