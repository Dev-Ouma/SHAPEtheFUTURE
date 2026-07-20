import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { StudentQuickAction } from './students/entities/student-quick-action.entity';
import { StudentResource } from './students/entities/student-resource.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const quickActionRepo = dataSource.getRepository(StudentQuickAction);
  const resourceRepo = dataSource.getRepository(StudentResource);

  console.log('Seeding Quick Actions...');
  // Clear existing to avoid duplicates if re-run
  await quickActionRepo.clear();

  await quickActionRepo.save([
    {
      title: 'Library Access',
      icon: 'BookOpen',
      href: '#',
      color: 'bg-blue-500',
      is_active: true,
    },
    {
      title: 'Fee Statement',
      icon: 'DollarSign',
      href: '#',
      color: 'bg-emerald-500',
      is_active: true,
    },
    {
      title: 'Timetable',
      icon: 'Calendar',
      href: '#',
      color: 'bg-orange-500',
      is_active: true,
    },
    {
      title: 'Support Tickets',
      icon: 'HelpCircle',
      href: '#',
      color: 'bg-purple-500',
      is_active: true,
    },
    {
      title: 'Downloads',
      icon: 'Download',
      href: '#',
      color: 'bg-primary',
      is_active: true,
    },
    {
      title: 'E-Learning',
      icon: 'Cpu',
      href: '#',
      color: 'bg-secondary',
      is_active: true,
    },
  ]);

  console.log('Seeding Resources...');
  await resourceRepo.clear();

  await resourceRepo.save([
    {
      title: 'Student Handbook 2024-2025',
      category: 'Handbooks',
      file_url: '#',
      is_active: true,
    },
    {
      title: 'Examination Guidelines & Policies',
      category: 'Guidelines',
      file_url: '#',
      is_active: true,
    },
    {
      title: 'Course Registration Form',
      category: 'Forms',
      file_url: '#',
      is_active: true,
    },
    {
      title: 'Clearance Form',
      category: 'Forms',
      file_url: '#',
      is_active: true,
    },
    {
      title: 'Campus Navigation Map',
      category: 'Guides',
      file_url: '#',
      is_active: true,
    },
    {
      title: 'Academic Calendar 2024',
      category: 'Schedules',
      file_url: '#',
      is_active: true,
    },
  ]);

  console.log('Seeding Completed successfully!');
  await app.close();
}

bootstrap();
