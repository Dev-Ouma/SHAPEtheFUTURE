import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { AlumniProfile } from './entities/alumni-profile.entity';
import { AlumniMentorship } from './entities/alumni-mentorship.entity';
import { AlumniEvent } from './entities/alumni-event.entity';
import { AlumniStory } from './entities/alumni-story.entity';
import { AlumniCareer } from './entities/alumni-career.entity';
import { AlumniChapter } from './entities/alumni-chapter.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Seeding alumni data...');

  const chapterRepo = dataSource.getRepository(AlumniChapter);
  const profileRepo = dataSource.getRepository(AlumniProfile);
  const mentorshipRepo = dataSource.getRepository(AlumniMentorship);
  const eventRepo = dataSource.getRepository(AlumniEvent);
  const storyRepo = dataSource.getRepository(AlumniStory);
  const careerRepo = dataSource.getRepository(AlumniCareer);

  // Clear existing using CASCADE to avoid foreign key errors
  await dataSource.query('TRUNCATE TABLE "alumni_chapters" CASCADE');
  await dataSource.query('TRUNCATE TABLE "alumni_profiles" CASCADE');
  await dataSource.query('TRUNCATE TABLE "alumni_events" CASCADE');
  await dataSource.query('TRUNCATE TABLE "alumni_stories" CASCADE');
  await dataSource.query('TRUNCATE TABLE "alumni_careers" CASCADE');
  // Note: mentorship is truncated cascade when profiles are truncated
  await dataSource.query('TRUNCATE TABLE "alumni_mentorship" CASCADE');

  // 1. Chapters
  const chapters = await chapterRepo.save([
    {
      name: 'Nairobi Chapter',
      region: 'Kenya',
      head_name: 'Dr. Jane Doe',
      contact: 'nairobi.alumni@ouk.ac.ke',
    },
    {
      name: 'Mombasa Chapter',
      region: 'Kenya',
      head_name: 'Peter Kwale',
      contact: 'mombasa.alumni@ouk.ac.ke',
    },
    {
      name: 'London Chapter',
      region: 'UK',
      head_name: 'Sarah Smith',
      contact: 'london.alumni@ouk.ac.ke',
    },
    {
      name: 'New York Chapter',
      region: 'USA',
      head_name: 'Michael Jordan',
      contact: 'ny.alumni@ouk.ac.ke',
    },
  ]);

  // 2. Profiles
  const profiles = await profileRepo.save([
    {
      name: 'John Mwarabu',
      graduationYear: 2024,
      programme: 'BSc. Applied Computing',
      industry: 'Software Engineering',
      country: 'Kenya',
      employer: 'Google',
      bio: 'Digital nomad and full-stack enthusiast. Passionate about AI and cloud computing.',
      linkedIn: 'https://linkedin.com/in/mwarabu',
      achievements: 'Led the development of the OUK Peer Learning platform.',
      image_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      isFeatured: true,
    },
    {
      name: 'Alice Wambui',
      graduationYear: 2023,
      programme: 'BSc. Data Science',
      industry: 'Data Analytics',
      country: 'South Africa',
      employer: 'Standard Bank',
      bio: 'Data scientist transforming banking with machine learning models.',
      linkedIn: 'https://linkedin.com/in/alicew',
      achievements:
        'Published a paper on financial inclusion in sub-Saharan Africa.',
      image_url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
      isFeatured: true,
    },
    {
      name: 'Samuel Kiprop',
      graduationYear: 2025,
      programme: 'BSc. Cyber Security',
      industry: 'Security',
      country: 'USA',
      employer: 'CrowdStrike',
      bio: 'Threat hunter dedicated to securing digital frontiers.',
      linkedIn: 'https://linkedin.com/in/kiprop',
      achievements:
        'Identified a major vulnerability in an open-source banking library.',
      image_url:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400',
      isFeatured: true,
    },
  ]);

  // 3. Mentorship
  await mentorshipRepo.save([
    {
      alumniId: profiles[0].id,
      expertise: 'Fullstack Development, AI',
      availability: 'Weekends 10am-12pm',
      status: 'active',
    },
    {
      alumniId: profiles[1].id,
      expertise: 'Data Analysis, Python, R',
      availability: 'Tuesday/Thursday 6pm',
      status: 'active',
    },
  ]);

  // 4. Events
  await eventRepo.save([
    {
      title: 'Global Alumni Reunion 2026',
      description:
        'Join us for our first global virtual reunion to celebrate 5 years of excellence.',
      date: new Date('2026-10-15'),
      location: 'Virtual / Metaverse',
      image_url:
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800',
      rsvp_link: 'https://events.ouk.ac.ke/reunion',
      status: 'upcoming',
    },
    {
      title: 'Career Pathways in AI',
      description: 'A panel discussion with alumni working at top tech firms.',
      date: new Date('2026-06-20'),
      location: 'Zoom',
      image_url:
        'https://images.unsplash.com/photo-1591115765373-520b7a21769b?q=80&w=800',
      rsvp_link: 'https://events.ouk.ac.ke/ai-panel',
      status: 'upcoming',
    },
  ]);

  // 5. Stories
  await storyRepo.save([
    {
      title: 'From OUK to Google: My Journey',
      content:
        'John Mwarabu shares his experience transition from a student at OUK to a Senior Engineer at Google...',
      alumniId: profiles[0].id,
      category: 'career_success',
      image_url:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=800',
    },
  ]);

  // 6. Careers
  await careerRepo.save([
    {
      title: 'Senior Frontend Developer',
      company: 'Safaricom PLC',
      description:
        'We are looking for OUK alumni with experience in React and Next.js.',
      type: 'Job',
      location: 'Nairobi, Kenya',
      link: 'https://careers.safaricom.co.ke',
      status: 'active',
    },
    {
      title: 'Research Internship - Data Ethics',
      company: 'UNESCO',
      description:
        'Opportunity for OUK graduates to contribute to global data policy.',
      type: 'Internship',
      location: 'Remote',
      link: 'https://unesco.org/careers',
      status: 'active',
    },
  ]);

  console.log('Seeding completed!');
  await app.close();
}

bootstrap().catch((err) => console.error(err));
