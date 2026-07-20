import { DataSource } from 'typeorm';
import { School } from '../../programs/entities/school.entity';
import { SchoolResource } from '../../programs/entities/resource.entity';

export const seedResources = async (dataSource: DataSource) => {
  const schoolRepo = dataSource.getRepository(School);
  const resourceRepo = dataSource.getRepository(SchoolResource);

  const schools = await schoolRepo.find();

  for (const school of schools) {
    const resources = [
      {
        title: 'Academic Integrity Guidelines',
        description:
          'Official OUK policy on academic honesty, citation standards, and plagiarism prevention.',
        type: 'PDF',
        category: 'Faculty Policies',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/policies/academic-integrity.pdf',
        file_size: '1.2 MB',
      },
      {
        title: 'Research Proposal Framework 2026',
        description:
          'Standardized template for undergraduate and postgraduate research submissions.',
        type: 'DOCX',
        category: 'Research Templates',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/templates/research-framework.docx',
        file_size: '850 KB',
      },
      {
        title: 'Semester Study Planner',
        description:
          'Time management tool customized for faculty-specific course loads.',
        type: 'PDF',
        category: 'Learning Guides',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/guides/study-planner.pdf',
        file_size: '450 KB',
      },
      {
        title: 'Faculty Grading Policy',
        description:
          'Detailed breakdown of assessment rubrics and institutional grading scales.',
        type: 'PDF',
        category: 'Faculty Policies',
        file_url:
          'https://ouk-storage.s3.amazonaws.com/policies/grading-policy.pdf',
        file_size: '2.1 MB',
      },
    ];

    for (const resData of resources) {
      const exists = await resourceRepo.findOne({
        where: { title: resData.title, school: { id: school.id } },
      });
      if (!exists) {
        const resource = resourceRepo.create({
          ...resData,
          school,
        });
        await resourceRepo.save(resource);
      }
    }
  }
};
