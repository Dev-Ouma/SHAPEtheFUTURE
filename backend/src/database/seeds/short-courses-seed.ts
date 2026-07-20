import { DataSource } from 'typeorm';
import {
  ShortCourse,
  ModeOfDelivery,
  ShortCourseLevel,
  ShortCourseStatus,
} from '../../short-courses/entities/short-course.entity';
import {
  ShortCourseCategory,
  LearningMethod,
} from '../../short-courses/entities/taxonomies.entity';
import { School } from '../../programs/entities/school.entity';
import { Department } from '../../programs/entities/department.entity';

export const runShortCourseSeed = async (dataSource: DataSource) => {
  const courseRepo = dataSource.getRepository(ShortCourse);
  const categoryRepo = dataSource.getRepository(ShortCourseCategory);
  const methodRepo = dataSource.getRepository(LearningMethod);
  const schoolRepo = dataSource.getRepository(School);
  const departmentRepo = dataSource.getRepository(Department);

  // 1. Get Schools & Create Departments
  const scienceSchool = await schoolRepo.findOne({
    where: { slug: 'school-of-science-technology' },
  });
  const businessSchool = await schoolRepo.findOne({
    where: { slug: 'school-of-business-economics' },
  });
  const educationSchool = await schoolRepo.findOne({
    where: { slug: 'school-of-education' },
  });

  if (!scienceSchool || !businessSchool || !educationSchool) {
    console.error('Missing schools for seeding.');
    return;
  }

  // Departments
  const createDept = async (
    name: string,
    name_sw: string,
    slug: string,
    school: School,
  ) => {
    let dept = await departmentRepo.findOne({
      where: { slug },
      withDeleted: true,
    });
    if (!dept) {
      dept = await departmentRepo.save(
        departmentRepo.create({ name, name_sw, slug, school }),
      );
    } else if (dept.deleted_at) {
      await departmentRepo.restore(dept.id);
      dept.school = school;
      await departmentRepo.save(dept);
    }
    return dept;
  };

  const scienceDept = await createDept(
    'Computing & Analytics',
    'Ukompyuta na Uchambuzi',
    'computing-analytics',
    scienceSchool,
  );
  const businessDept = await createDept(
    'Business Strategy',
    'Mkakati wa Biashara',
    'business-strategy',
    businessSchool,
  );
  const educationDept = await createDept(
    'Curriculum Studies',
    'Masomo ya Mtaala',
    'curriculum-studies',
    educationSchool,
  );

  // 2. Create Taxonomies
  const categories = [
    {
      name: 'Professional Certification',
      name_sw: 'Vyeti vya Kitaalamu',
      slug: 'pro-cert',
    },
    {
      name: 'Executive Education',
      name_sw: 'Elimu ya Uongozi',
      slug: 'exec-edu',
    },
    {
      name: 'Technical Skills',
      name_sw: 'Ujuzi wa Kiufundi',
      slug: 'tech-skills',
    },
  ];

  for (const cat of categories) {
    if (!(await categoryRepo.findOne({ where: { slug: cat.slug } }))) {
      await categoryRepo.save(categoryRepo.create(cat));
    }
  }

  const methods = [
    { name: 'Self-paced', name_sw: 'Kujisomea' },
    { name: 'Instructor-led', name_sw: 'Mafunzo ya Mkufunzi' },
    { name: 'Interactive Labs', name_sw: 'Maabara ya Kishiriki' },
  ];

  for (const meth of methods) {
    if (!(await methodRepo.findOne({ where: { name: meth.name } }))) {
      await methodRepo.save(methodRepo.create(meth));
    }
  }

  // 3. Create Sample Short Courses
  const techCat = await categoryRepo.findOne({
    where: { slug: 'tech-skills' },
  });
  const selfMethod = await methodRepo.findOne({
    where: { name: 'Self-paced' },
  });

  if (techCat && selfMethod) {
    const coursesData = [
      {
        title: 'Digital Marketing Essentials',
        title_sw: 'Misingi ya Masoko ya Kidijitali',
        code: 'SC-MKT-01',
        slug: 'digital-marketing-essentials',
        about:
          'A comprehensive guide to modern digital marketing strategies, SEO, and social media engagement.',
        about_sw:
          'Mwongozo kamili wa mikakati ya kisasa ya masoko ya kidijitali, SEO, na ushiriki wa mitandao ya kijamii.',
        overview:
          'Master the tools needed to drive business growth in the digital age.',
        overview_sw:
          'Mudu zana zinazohitajika kukuza biashara katika enzi ya kidijitali.',
        duration: '6 Weeks',
        cost: 'KES 25,000',
        skills_gained:
          'SEO Optimisation, Content Strategy, Analytics, Social Media Management',
        target_audience:
          'Aspiring marketers, small business owners, and communication professionals.',
        mode_of_delivery: ModeOfDelivery.ONLINE,
        level: ShortCourseLevel.BEGINNER,
        status: ShortCourseStatus.PUBLISHED,
        school: businessSchool,
        department: businessDept,
        course_category: techCat,
        learning_method: selfMethod,
        modules: [
          {
            title: 'Marketing Ecosystems',
            title_sw: 'Mifumo ya Masoko',
            description: 'Institutional overview of digital landscapes.',
            order: 1,
          },
          {
            title: 'SEO Architecture',
            title_sw: 'Muundo wa SEO',
            description: 'Mastering search engine visibility.',
            order: 2,
          },
        ],
      },
      {
        title: 'AI for Business Leaders',
        title_sw: 'AI kwa Viongozi wa Biashara',
        code: 'SC-AI-02',
        slug: 'ai-for-business-leaders',
        about:
          'Demystifying Artificial Intelligence for executives, focusing on strategic implementation and ethical governance.',
        about_sw:
          'Ufafanuzi wa Akili Bandia kwa watendaji, ukilenga utekelezaji wa kimkakati na utawala wa kimaadili.',
        overview: 'Strategic AI adoption for organizational excellence.',
        overview_sw: 'Uchukuzi wa kimkakati wa AI kwa ubora wa shirika.',
        duration: '4 Weeks',
        cost: 'KES 45,000',
        skills_gained:
          'AI Strategy, Risk Management, Ethical AI, Decision Support Systems',
        target_audience: 'CEOs, Department Heads, and Strategic Planners.',
        mode_of_delivery: ModeOfDelivery.HYBRID,
        level: ShortCourseLevel.ADVANCED,
        status: ShortCourseStatus.PUBLISHED,
        school: scienceSchool,
        department: scienceDept,
        course_category: techCat,
        learning_method: selfMethod,
        modules: [
          {
            title: 'AI Foundations',
            title_sw: 'Msingi wa AI',
            description: 'Foundations of computational intelligence.',
            order: 1,
          },
          {
            title: 'Strategic Governance',
            title_sw: 'Utawala wa Kimkakati',
            description: 'Ethical frameworks for AI leadership.',
            order: 2,
          },
        ],
      },
      {
        title: 'Data Science with Python',
        title_sw: 'Sayansi ya Data kwa Python',
        code: 'SC-DS-03',
        slug: 'data-science-with-python',
        about:
          'Learn the fundamentals of data science using Python, covering data analysis, visualization, and machine learning.',
        about_sw:
          'Jifunze misingi ya sayansi ya data ukitumia Python, ukihusisha uchambuzi wa data, taswira, na ujifunzaji wa mashine.',
        overview: 'Turn raw data into actionable insights with Python.',
        overview_sw:
          'Badilisha data ghafi kuwa maarifa yanayoweza kutekelezeka ukitumia Python.',
        duration: '10 Weeks',
        cost: 'KES 35,000',
        skills_gained:
          'Python Programming, Data Visualization, Statistical Analysis, Machine Learning',
        target_audience: 'Data enthusiasts, analysts, and software developers.',
        mode_of_delivery: ModeOfDelivery.ONLINE,
        level: ShortCourseLevel.INTERMEDIATE,
        status: ShortCourseStatus.PUBLISHED,
        school: scienceSchool,
        department: scienceDept,
        course_category: techCat,
        learning_method: selfMethod,
        modules: [
          {
            title: 'Python for Data Analysis',
            title_sw: 'Python kwa Uchambuzi wa Data',
            description: 'Using Pandas and NumPy for data manipulation.',
            order: 1,
          },
          {
            title: 'Machine Learning Basics',
            title_sw: 'Misingi ya Ujifunzaji wa Mashine',
            description:
              'Introduction to Scikit-Learn and predictive modeling.',
            order: 2,
          },
        ],
      },
      {
        title: 'Educational Technology Tools',
        title_sw: 'Zana za Teknolojia ya Elimu',
        code: 'SC-ED-04',
        slug: 'educational-technology-tools',
        about:
          'Explore modern digital tools and platforms to enhance teaching and learning experiences in a virtual environment.',
        about_sw:
          'Gundua zana na majukwaa ya kisasa ya kidijitali ili kuboresha uzoefu wa kufundisha na kujifunza katika mazingira ya kawaida.',
        overview: 'Empowering educators with digital tools.',
        overview_sw: 'Kuwezesha waelimishaji kwa zana za kidijitali.',
        duration: '8 Weeks',
        cost: 'KES 20,000',
        skills_gained:
          'LMS Management, Digital Pedagogy, Online Assessment Tools, Content Creation',
        target_audience: 'Teachers, trainers, and educational administrators.',
        mode_of_delivery: ModeOfDelivery.ONLINE,
        level: ShortCourseLevel.BEGINNER,
        status: ShortCourseStatus.PUBLISHED,
        school: educationSchool,
        department: educationDept,
        course_category: techCat,
        learning_method: selfMethod,
        modules: [
          {
            title: 'Digital Pedagogy Foundations',
            title_sw: 'Misingi ya Ualimu wa Kidijitali',
            description: 'Pedagogical strategies for online learning.',
            order: 1,
          },
          {
            title: 'Learning Management Systems',
            title_sw: 'Mifumo ya Usimamizi wa Kujifunza',
            description: 'Mastering Canvas and Moodle platforms.',
            order: 2,
          },
        ],
      },
    ];

    for (const courseData of coursesData) {
      const existing = await courseRepo.findOne({
        where: [{ code: courseData.code }, { slug: courseData.slug }],
      });
      if (existing) await courseRepo.remove(existing);
      await courseRepo.save(courseRepo.create(courseData));
    }
  }

  console.log(
    'Successfully seeded professional short courses across all schools.',
  );
};
