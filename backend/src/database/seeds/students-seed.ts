import { DataSource } from 'typeorm';
import { StudentAnnouncement } from '../../students/entities/student-announcement.entity';
import { StudentSupportService } from '../../students/entities/student-support-service.entity';
import { StudentClub } from '../../students/entities/student-club.entity';
import { StudentEvent } from '../../students/entities/student-event.entity';
import { StudentSuccessStory } from '../../students/entities/student-success-story.entity';
import { Student } from '../../students/entities/student.entity';

export const runStudentsSeed = async (dataSource: DataSource) => {
  const announcementRepo = dataSource.getRepository(StudentAnnouncement);
  const supportRepo = dataSource.getRepository(StudentSupportService);
  const clubRepo = dataSource.getRepository(StudentClub);
  const eventRepo = dataSource.getRepository(StudentEvent);
  const storyRepo = dataSource.getRepository(StudentSuccessStory);
  const studentRepo = dataSource.getRepository(Student);

  // 1. Announcements
  const announcements = [
    {
      title: 'Semester Registration Deadline',
      content:
        'All students must complete their course registration by May 20th, 2026.',
      category: 'Registration',
      priority: 'High',
    },
    {
      title: 'End of Semester Examination Timetable',
      content:
        'The final examination timetable for the current semester is now available for download.',
      category: 'Exams',
      priority: 'Urgent',
    },
    {
      title: 'New ICT Support Portal Launched',
      content:
        'Students can now track their ICT support tickets through the new integrated helpdesk.',
      category: 'Maintenance',
      priority: 'Medium',
    },
    {
      title: 'Orientation for New Intake',
      content:
        'A virtual orientation session for the June intake will be held on June 1st.',
      category: 'Orientation',
      priority: 'High',
    },
  ];

  for (const a of announcements) {
    if (!(await announcementRepo.findOne({ where: { title: a.title } }))) {
      await announcementRepo.save(announcementRepo.create(a));
    }
  }

  // 2. Support Services
  const services = [
    {
      name: 'Student Counseling & Wellness',
      description:
        'Professional counseling services for academic, personal, and career guidance.',
      category: 'Counseling',
      icon: 'Heart',
      location: 'Wellness Center / Online',
    },
    {
      name: 'ICT Helpdesk',
      description:
        'Technical support for e-learning systems, student email, and portal access.',
      category: 'ICT',
      icon: 'Cpu',
      contact_info: 'helpdesk@ouk.ac.ke',
    },
    {
      name: 'Financial Aid Office',
      description:
        'Guidance on scholarships, HELB loans, and tuition fee payment plans.',
      category: 'Financial Aid',
      icon: 'DollarSign',
    },
    {
      name: 'Disability Support',
      description:
        'Ensuring accessibility for students with diverse needs across all digital platforms.',
      category: 'Accessibility',
      icon: 'Accessibility',
    },
  ];

  for (const s of services) {
    if (!(await supportRepo.findOne({ where: { name: s.name } }))) {
      await supportRepo.save(supportRepo.create(s));
    }
  }

  // 3. Clubs & Societies
  const clubs = [
    {
      name: 'OUK Tech Innovators',
      description:
        'A community for developers and tech enthusiasts to collaborate on digital projects.',
      category: 'Academic',
      leader_name: 'John Doe',
      meeting_info: 'Tuesdays at 4 PM (Virtual)',
    },
    {
      name: 'Digital Business Association',
      description:
        'Focusing on entrepreneurship and leadership in the digital economy.',
      category: 'Leadership',
      leader_name: 'Jane Smith',
    },
    {
      name: 'OUK Sports Club',
      description:
        'Promoting physical wellness through virtual fitness challenges and physical meets.',
      category: 'Sports',
      leader_name: 'Mike Ross',
    },
  ];

  for (const c of clubs) {
    if (!(await clubRepo.findOne({ where: { name: c.name } }))) {
      await clubRepo.save(clubRepo.create(c));
    }
  }

  // 4. Events
  const events = [
    {
      title: 'Global Tech Webinar',
      description: 'Guest lecture from Silicon Valley experts on AI trends.',
      date: new Date('2026-05-25'),
      type: 'Webinar',
      location: 'Zoom',
    },
    {
      title: 'Career Development Workshop',
      description: 'How to build a stand-out digital portfolio.',
      date: new Date('2026-06-05'),
      type: 'Workshop',
      location: 'Virtual',
    },
    {
      title: 'Annual Student Leadership Summit',
      description: 'Empowering the next generation of digital leaders.',
      date: new Date('2026-07-15'),
      type: 'Activity',
      location: 'Konza Technopolis',
    },
  ];

  for (const e of events) {
    if (!(await eventRepo.findOne({ where: { title: e.title } }))) {
      await eventRepo.save(eventRepo.create(e));
    }
  }

  // 5. Success Stories
  const students = await studentRepo.find();
  if (students.length > 0) {
    const stories = [
      {
        title: 'Breaking Barriers in Data Science',
        content:
          'How a student from rural Kenya became a lead data scientist at a global firm while studying at OUK.',
        student: students[0],
        is_featured: true,
      },
    ];

    for (const s of stories) {
      if (!(await storyRepo.findOne({ where: { title: s.title } }))) {
        await storyRepo.save(storyRepo.create(s));
      }
    }
  }

  console.log('--- STUDENT PORTAL SEEDING COMPLETED ---');
};
