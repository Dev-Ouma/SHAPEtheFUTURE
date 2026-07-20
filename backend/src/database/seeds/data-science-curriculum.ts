import { DataSource } from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import {
  CourseUnit,
  StudyLevel,
  CourseUnitStatus,
} from '../../programs/entities/course-unit.entity';
import { School } from '../../programs/entities/school.entity';

export const runDataScienceSeed = async (dataSource: DataSource) => {
  const programRepo = dataSource.getRepository(Program);
  const unitRepo = dataSource.getRepository(CourseUnit);
  const schoolRepo = dataSource.getRepository(School);

  // 1. Find School (Assumes seeded by initial-seed.ts)
  const school = await schoolRepo.findOne({
    where: { slug: 'school-of-science-technology' },
  });
  if (!school) {
    throw new Error(
      'Required school "School of Science & Technology" must be seeded before running Data Science curriculum.',
    );
  }

  // 2. Create the Bachelor of Data Science Programme
  const dsProgramData = {
    title: 'Bachelor of Data Science',
    slug: 'bachelor-of-data-science',
    programme_code: 'BSDS-2026',
    level: 'Undergraduate',
    school: school,
    application_status: 'Open',
    mode_of_delivery: ['Online', 'Blended'],
    duration: '4 Years',
    cost: 'KES 150,000 / Year',
    atar: '85.0+',
    enroll_link: '/apply?program=BSDS',
    brochure_url: '/brochures/bachelor-of-data-science.pdf',
    overview:
      'The Bachelor of Data Science at the Open University of Kenya is a flagship programme designed to empower the next generation of data-driven leaders. In an age where data is the new oil, this course provides the analytical tools and computational skills needed to extract meaningful insights from complex datasets.',
    learning_outcomes:
      'Graduates will be able to: 1. Design and implement complex machine learning models. 2. Architect scalable big data pipelines. 3. Apply ethical frameworks to data governance. 4. Communicate complex findings to diverse stakeholders.',
    careers:
      'Data Scientist, Machine Learning Engineer, Data Architect, Business Intelligence Analyst, AI Researcher, Data Policy Advisor.',
    is_featured: true,
  };

  let program = await programRepo.findOne({
    where: { slug: dsProgramData.slug },
  });
  if (program) {
    Object.assign(program, dsProgramData);
    program = await programRepo.save(program);
  } else {
    program = await programRepo.save(programRepo.create(dsProgramData));
  }

  // 3. Define 30 Course Units
  // 3. Define 48 Official course units (6 per semester)
  const unitsData = [
    // Year 1 Semester 1
    {
      code: 'SST 101',
      title: 'Communication Skills',
      year: 'Year 1 Sem 1',
      credits: 3,
    },
    {
      code: 'MAT 101',
      title: 'Mathematics for Science',
      year: 'Year 1 Sem 1',
      credits: 3,
    },
    {
      code: 'CSC 101',
      title: 'Introduction to Computer Science',
      year: 'Year 1 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 101',
      title: 'Programming for Data Science',
      year: 'Year 1 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 102',
      title: 'Data Literacy and Visualization',
      year: 'Year 1 Sem 1',
      credits: 3,
    },
    {
      code: 'UCU 101',
      title: 'Health Education',
      year: 'Year 1 Sem 1',
      credits: 2,
    },

    // Year 1 Semester 2
    {
      code: 'SST 102',
      title: 'Ethics and Integrity',
      year: 'Year 1 Sem 2',
      credits: 3,
    },
    { code: 'MAT 102', title: 'Calculus 1', year: 'Year 1 Sem 2', credits: 3 },
    {
      code: 'CSC 102',
      title: 'Structured Programming',
      year: 'Year 1 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 103',
      title: 'Data Structures and Algorithms',
      year: 'Year 1 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 104',
      title: 'Statistical Methods',
      year: 'Year 1 Sem 2',
      credits: 3,
    },
    {
      code: 'UCU 102',
      title: 'Environmental Science',
      year: 'Year 1 Sem 2',
      credits: 2,
    },

    // Year 2 Semester 1
    {
      code: 'MAT 201',
      title: 'Linear Algebra',
      year: 'Year 2 Sem 1',
      credits: 3,
    },
    {
      code: 'CSC 201',
      title: 'Object Oriented Programming',
      year: 'Year 2 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 201',
      title: 'Exploratory Data Analysis',
      year: 'Year 2 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 202',
      title: 'Data Warehousing',
      year: 'Year 2 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 203',
      title: 'Statistical Inference',
      year: 'Year 2 Sem 1',
      credits: 3,
    },
    {
      code: 'UCU 201',
      title: 'Research Methods',
      year: 'Year 2 Sem 1',
      credits: 2,
    },

    // Year 2 Semester 2
    {
      code: 'MAT 202',
      title: 'Discrete Mathematics',
      year: 'Year 2 Sem 2',
      credits: 3,
    },
    {
      code: 'CSC 202',
      title: 'Database Systems',
      year: 'Year 2 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 204',
      title: 'Machine Learning Foundations',
      year: 'Year 2 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 205',
      title: 'Big Data Technologies',
      year: 'Year 2 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 206',
      title: 'Optimisation for Data Science',
      year: 'Year 2 Sem 2',
      credits: 3,
    },
    {
      code: 'UCU 202',
      title: 'Innovation & Entrepreneurship',
      year: 'Year 2 Sem 2',
      credits: 2,
    },

    // Year 3 Semester 1
    {
      code: 'BDS 301',
      title: 'Machine Learning II',
      year: 'Year 3 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 302',
      title: 'Natural Language Processing',
      year: 'Year 3 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 303',
      title: 'Computer Vision',
      year: 'Year 3 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 304',
      title: 'Data Governance & Ethics',
      year: 'Year 3 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 305',
      title: 'Cloud Computing',
      year: 'Year 3 Sem 1',
      credits: 3,
    },
    {
      code: 'UCU 301',
      title: 'Leadership & Governance',
      year: 'Year 3 Sem 1',
      credits: 2,
    },

    // Year 3 Semester 2
    {
      code: 'BDS 306',
      title: 'Deep Learning',
      year: 'Year 3 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 307',
      title: 'Reinforcement Learning',
      year: 'Year 3 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 308',
      title: 'Time Series Analysis',
      year: 'Year 3 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 309',
      title: 'Advanced Data Visualization',
      year: 'Year 3 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 310',
      title: 'DevOps for Data Science',
      year: 'Year 3 Sem 2',
      credits: 3,
    },
    {
      code: 'UCU 302',
      title: 'Professional Practice',
      year: 'Year 3 Sem 2',
      credits: 2,
    },

    // Year 4 Semester 1
    {
      code: 'BDS 401',
      title: 'Research Project I',
      year: 'Year 4 Sem 1',
      credits: 4,
    },
    {
      code: 'BDS 402',
      title: 'AI in Healthcare',
      year: 'Year 4 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 403',
      title: 'AI in Finance',
      year: 'Year 4 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 404',
      title: 'Cybersecurity for Data Science',
      year: 'Year 4 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 405',
      title: 'Applied Machine Learning',
      year: 'Year 4 Sem 1',
      credits: 3,
    },
    {
      code: 'BDS 406',
      title: 'Strategic Management',
      year: 'Year 4 Sem 1',
      credits: 3,
    },

    // Year 4 Semester 2
    {
      code: 'BDS 407',
      title: 'Research Project II',
      year: 'Year 4 Sem 2',
      credits: 4,
    },
    {
      code: 'BDS 408',
      title: 'Data Science Capstone',
      year: 'Year 4 Sem 2',
      credits: 4,
    },
    {
      code: 'BDS 409',
      title: 'Professional Internship',
      year: 'Year 4 Sem 2',
      credits: 6,
    },
    {
      code: 'BDS 410',
      title: 'Emerging Trends in AI',
      year: 'Year 4 Sem 2',
      credits: 3,
    },
    {
      code: 'BDS 411',
      title: 'Final Global Presentation',
      year: 'Year 4 Sem 2',
      credits: 2,
    },
    {
      code: 'UCU 401',
      title: 'Global Citizenship',
      year: 'Year 4 Sem 2',
      credits: 2,
    },
  ];

  if (!program) {
    console.error(
      'Cannot seed units: Data Science program was not created successfully.',
    );
    return;
  }

  try {
    for (const unit of unitsData) {
      // Use a simpler find logic to avoid potentially broken joins if data is messy
      const existingUnit = await unitRepo.findOne({
        where: {
          unit_code: unit.code,
          program: { id: program.id },
        },
      });

      const unitData = {
        unit_code: unit.code,
        title: unit.title,
        year_level: unit.year,
        credits: unit.credits,
        study_level: StudyLevel.UNDERGRADUATE,
        status: CourseUnitStatus.ACTIVE,
        program: program,
        school: school,
        description: `This fundamental module provides a comprehensive exploration of ${unit.title}, essential for the OUK Data Science pathway. Students will engage with core principles, institutional frameworks, and practical applications that form the basis for advanced academic study.`,
        learning_outcomes: `<ul><li>Demonstrate mastery of core ${unit.title} principles.</li><li>Apply analytical frameworks to institutional problems.</li><li>Execute high-fidelity practical implementations.</li><li>Collaborate on complex academic peer reviews.</li></ul>`,
        assessment_methods: `<p>Evaluation includes:</p><ul><li>Continuous Assessment Tests (40%)</li><li>Practical Lab Portfolio (20%)</li><li>Final Proctored Examination (40%)</li></ul>`,
        prerequisites: `<p>Standard OUK Year 1 entry requirements or departmental equivalent.</p>`,
      };

      // Custom enrichment for specific key units
      if (unit.code === 'MAT 101') {
        unitData.description =
          'A rigorous foundation in mathematical analysis, focusing on the computational logic required for higher-level data science and AI modeling.';
        unitData.learning_outcomes =
          '<ul><li>Master foundational algebraic and trigonometric logic.</li><li>Apply mathematical models to real-world data scenarios.</li><li>Develop a high-fidelity understanding of set theory and logic.</li></ul>';
      }
      if (unit.code === 'BDS 101') {
        unitData.description =
          'An immersive introduction to Python for Data Science. Covers institutional standards for clean code, library management (NumPy, Pandas), and algorithmic thinking.';
        unitData.learning_outcomes =
          '<ul><li>Write efficient, production-grade Python scripts.</li><li>Manipulate complex datasets using high-performance libraries.</li><li>Implement data-driven logic to solve regional institutional challenges.</li></ul>';
      }

      if (existingUnit) {
        Object.assign(existingUnit, unitData);
        // @ts-ignore - bypassing strict M2M type check for seed orchestration
        existingUnit.programmes = [program];
        await unitRepo.save(existingUnit);
      } else {
        const newUnit = unitRepo.create(unitData);
        // @ts-ignore
        newUnit.programmes = [program];
        await unitRepo.save(newUnit);
      }
    }
    console.log(
      `Successfully seeded "Bachelor of Data Science" with 48 official course units.`,
    );
  } catch (error) {
    console.error('Error seeding units:', error.message);
    throw error;
  }
};
