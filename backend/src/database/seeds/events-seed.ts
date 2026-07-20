import { DataSource } from 'typeorm';
import { News } from '../../news/entities/news.entity';
import { School } from '../../programs/entities/school.entity';

export const seedEvents = async (dataSource: DataSource) => {
  const newsRepo = dataSource.getRepository(News);
  const schoolRepo = dataSource.getRepository(School);

  const schools = await schoolRepo.find();

  const eventsData = [
    {
      title: 'Global AI Ethics Summit 2024',
      slug: 'global-ai-ethics-summit-2024',
      content:
        '<h3>Event Overview</h3><p>Join us for a comprehensive discussion on the ethical implications of artificial intelligence in developing nations. This summit brings together industry leaders, academic scholars, and policy makers to chart a course for responsible AI innovation.</p><p>Topics include algorithmic bias, data sovereignty, and the role of higher education in fostering ethical tech leadership.</p>',
      category: 'Summit',
      type: 'Event',
      image_url:
        'https://images.unsplash.com/photo-1591115765373-520b7a21769b?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'FinTech Innovation Workshop',
      slug: 'fintech-innovation-workshop',
      content:
        '<h3>Hands-on Learning</h3><p>A deep dive into the latest technologies disrupting the financial sector. Learn about blockchain integration, mobile payment security, and regulatory sandboxes.</p><p>Perfect for students and professionals looking to stay ahead in the rapidly evolving fintech landscape.</p>',
      category: 'Workshop',
      type: 'Event',
      image_url:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: "Dean's Distinguished Lecture Series",
      slug: 'deans-lecture-cybersecurity',
      content:
        '<h3>Special Guest Lecture</h3><p>Our upcoming lecture features an international expert in cybersecurity resilience. The talk will focus on protecting critical digital infrastructure against state-sponsored threats in the 21st century.</p>',
      category: 'Lecture',
      type: 'Event',
      image_url:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Hackathon: Digital Solutions for Agriculture',
      slug: 'hackathon-agritech-2024',
      content:
        '<h3>Competitive Innovation</h3><p>A 48-hour challenge to build digital tools that assist smallholder farmers in Kenya. Win prizes, mentorship opportunities, and the chance to incubate your project.</p>',
      category: 'Hackathon',
      type: 'Event',
      image_url:
        'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Research Symposium: Future of Cloud Computing',
      slug: 'research-symposium-cloud-2024',
      content:
        '<h3>Academic Presentation</h3><p>Faculty and students present their latest findings on serverless architectures, edge computing, and green data centers.</p>',
      category: 'Symposium',
      type: 'Event',
      image_url:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop',
    },
  ];

  for (const school of schools) {
    for (const event of eventsData) {
      const slug = `${school.slug}-${event.slug}`;
      const existing = await newsRepo.findOne({ where: { slug } });

      if (!existing) {
        const newEvent = newsRepo.create({
          ...event,
          slug,
          school,
          is_published: true,
          created_at: new Date(Date.now() + Math.random() * 1000000000), // Spread dates
        });
        await newsRepo.save(newEvent);
      }
    }
  }

  console.log(
    `✅ Seeded ${eventsData.length * schools.length} events across all schools.`,
  );
};
