import { DataSource } from 'typeorm';
import { ComplaintCategory } from '../../complaints/entities/complaint-category.entity';

export const runComplaintsSeed = async (dataSource: DataSource) => {
  const categoryRepo = dataSource.getRepository(ComplaintCategory);

  const categories = [
    {
      name: 'Admissions',
      slug: 'admissions',
      description: 'Application and enrolment issues',
    },
    {
      name: 'Finance',
      slug: 'finance',
      description: 'Fees and billing concerns',
    },
    {
      name: 'Academic',
      slug: 'academic',
      description: 'Teaching, grading, or curriculum',
    },
    {
      name: 'ICT Support',
      slug: 'ict-support',
      description: 'LMS or technical problems',
    },
    {
      name: 'Human Resources',
      slug: 'human-resources',
      description: 'Staff-related matters',
    },
    {
      name: 'Facilities',
      slug: 'facilities',
      description: 'Infrastructure and environment',
    },
    {
      name: 'Ethics & Integrity',
      slug: 'ethics-integrity',
      description: 'Misconduct or corruption',
    },
    {
      name: 'General Inquiry',
      slug: 'general-inquiry',
      description: 'Other concerns',
    },
  ];

  for (const cat of categories) {
    const exists = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(cat));
      console.log(`Seeded Complaint Category: ${cat.name}`);
    }
  }
};
