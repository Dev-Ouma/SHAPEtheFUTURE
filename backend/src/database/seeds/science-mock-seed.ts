import { DataSource } from 'typeorm';
import { School } from '../../programs/entities/school.entity';
import { AcademicCalendarEvent } from '../../programs/entities/calendar-event.entity';
import { SchoolResource } from '../../programs/entities/resource.entity';

export const seedScienceMockData = async (dataSource: DataSource) => {
  const schoolRepo = dataSource.getRepository(School);
  const calendarRepo = dataSource.getRepository(AcademicCalendarEvent);
  const resourceRepo = dataSource.getRepository(SchoolResource);

  const scienceSchool = await schoolRepo.findOne({
    where: { slug: 'school-of-science-technology' },
  });

  if (!scienceSchool) {
    console.warn(
      'School of Science and Technology not found. Skipping specialized mock data.',
    );
    return;
  }

  // 1. Specialized Calendar Events
  const scienceEvents = [
    {
      title: 'Science & Tech Faculty Orientation',
      date_start: '2025-05-15',
      category: 'Academic',
      description:
        'In-depth orientation for Science, Technology, and Mathematics students.',
    },
    {
      title: 'AI & Robotics Showcase',
      date_start: '2025-06-12',
      category: 'Event',
      description:
        'Demonstration of student projects in Artificial Intelligence and Robotics.',
    },
    {
      title: 'Cybersecurity Awareness Week',
      date_start: '2025-07-07',
      category: 'Academic',
      description:
        'Workshops and seminars on digital security and data protection.',
    },
    {
      title: 'OUK Hackathon: Solving Regional Challenges',
      date_start: '2025-07-25',
      category: 'Event',
      description:
        'University-wide competition to build technology-driven solutions for local problems.',
    },
  ];

  for (const eventData of scienceEvents) {
    const exists = await calendarRepo.findOne({
      where: { title: eventData.title, school: { id: scienceSchool.id } },
    });
    if (!exists) {
      await calendarRepo.save(
        calendarRepo.create({ ...eventData, school: scienceSchool }),
      );
    }
  }

  // 2. Specialized Resources
  const scienceResources = [
    {
      title: 'Python for Data Science Handbook',
      description:
        'Essential guide for using Python to manipulate, process, and analyse data.',
      type: 'PDF',
      category: 'Learning Guides',
      file_url:
        'https://ouk-storage.s3.amazonaws.com/resources/science/python-data-science.pdf',
      file_size: '4.5 MB',
    },
    {
      title: 'Cloud Computing Fundamentals',
      description:
        'Overview of AWS, Azure, and GCP architectures for modern software engineering.',
      type: 'PDF',
      category: 'Learning Guides',
      file_url:
        'https://ouk-storage.s3.amazonaws.com/resources/science/cloud-computing.pdf',
      file_size: '3.2 MB',
    },
    {
      title: 'Cybersecurity Lab Protocol',
      description:
        'Mandatory guidelines for students accessing the faculty security laboratory.',
      type: 'PDF',
      category: 'Faculty Policies',
      file_url:
        'https://ouk-storage.s3.amazonaws.com/resources/science/lab-protocol.pdf',
      file_size: '1.1 MB',
    },
    {
      title: 'Mathematics for Computing',
      description:
        'Detailed course notes on discrete mathematics and linear algebra for tech students.',
      type: 'PDF',
      category: 'Learning Guides',
      file_url:
        'https://ouk-storage.s3.amazonaws.com/resources/science/math-for-computing.pdf',
      file_size: '5.8 MB',
    },
    {
      title: 'External: MIT OpenCourseWare - Computer Science',
      description:
        "Access to world-class educational materials from MIT's CS faculty.",
      type: 'External Link',
      category: 'General Resources',
      external_link:
        'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
    },
  ];

  for (const resData of scienceResources) {
    const exists = await resourceRepo.findOne({
      where: { title: resData.title, school: { id: scienceSchool.id } },
    });
    if (!exists) {
      await resourceRepo.save(
        resourceRepo.create({ ...resData, school: scienceSchool }),
      );
    }
  }

  console.log('--- SPECIALIZED SCIENCE MOCK DATA SEEDED ---');
};
