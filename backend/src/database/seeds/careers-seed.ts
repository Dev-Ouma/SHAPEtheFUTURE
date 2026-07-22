import { DataSource } from 'typeorm';
import { Job } from '../../careers/entities/job.entity';
import { Division } from '../../careers/entities/division.entity';
import { JobCategory } from '../../careers/entities/job-category.entity';
import { JobSpecialization } from '../../careers/entities/job-specialization.entity';
import { Department } from '../../programs/entities/department.entity';

export const runCareersSeed = async (dataSource: DataSource) => {
  const jobRepo = dataSource.getRepository(Job);
  const divRepo = dataSource.getRepository(Division);
  const catRepo = dataSource.getRepository(JobCategory);
  const specRepo = dataSource.getRepository(JobSpecialization);
  const deptRepo = dataSource.getRepository(Department);

  console.log('--- STARTING CAREERS SEED ---');

  // 1. Seed Divisions
  const divisionsData = [
    { name: 'Academic Affairs', slug: 'academic-affairs' },
    { name: 'Administrative', slug: 'administrative' },
    { name: 'Technology & Innovation', slug: 'technology-innovation' },
  ];

  const divisions: Record<string, Division> = {};
  for (const data of divisionsData) {
    let div = await divRepo.findOne({ where: { slug: data.slug } });
    if (!div) {
      div = await divRepo.save(divRepo.create(data));
      console.log(`Created Division: ${data.name}`);
    }
    divisions[data.slug] = div;
  }

  // 2. Seed Job Categories
  const categoriesData = [
    { name: 'Faculty', slug: 'faculty' },
    { name: 'Management', slug: 'management' },
    { name: 'Support Staff', slug: 'support-staff' },
    { name: 'Engineering', slug: 'engineering' },
  ];

  const categories: Record<string, JobCategory> = {};
  for (const data of categoriesData) {
    let cat = await catRepo.findOne({ where: { slug: data.slug } });
    if (!cat) {
      cat = await catRepo.save(catRepo.create(data));
      console.log(`Created Category: ${data.name}`);
    }
    categories[data.slug] = cat;
  }

  // 3. Seed Specializations
  const specializationsData = [
    { name: 'Data Science' },
    { name: 'Cybersecurity' },
    { name: 'Policy Analysis' },
    { name: 'Finance' },
    { name: 'Digital Marketing' },
    { name: 'Cloud Computing' },
  ];

  const specs: Record<string, JobSpecialization> = {};
  for (const data of specializationsData) {
    let spec = await specRepo.findOne({ where: { name: data.name } });
    if (!spec) {
      spec = await specRepo.save(specRepo.create(data));
      console.log(`Created Specialization: ${data.name}`);
    }
    specs[data.name] = spec;
  }

  // Fetch optional departments
  const defaultDept = await deptRepo.findOne({ where: {} });

  const futureDeadline1 = new Date();
  futureDeadline1.setDate(futureDeadline1.getDate() + 14);

  const futureDeadline2 = new Date();
  futureDeadline2.setDate(futureDeadline2.getDate() + 2); // Approaching

  const pastDeadline = new Date();
  pastDeadline.setDate(pastDeadline.getDate() - 10);

  // 4. Seed Jobs
  const jobsData = [
    {
      title: 'Professor of Artificial Intelligence',
      slug: 'professor-of-artificial-intelligence',
      reference_code: 'OUK-ACAD-2026-001',
      summary:
        'Lead cutting-edge research and teach advanced AI methodologies to future digital leaders.',
      description:
        'The Open University of Kenya is seeking a distinguished academic to lead our new AI division.',
      employment_type: 'Full-time',
      experience_level: 'Senior Professional',
      job_grade: '15',
      positions_available: 1,
      location: 'Nairobi, Kenya',
      is_remote: false,
      title_sw: 'Profesa wa Akili Bandia',
      summary_sw:
        'Ongoza utafiti wa kisasa na ufundishe mbinu za juu za AI kwa viongozi wa kidijitali wa kesho.',
      description_sw:
        '<p>Chuo Kikuu Huria cha Kenya kinatafuta msomi mashuhuri kuongoza kitengo chetu kipya cha AI.</p>',
      responsibilities:
        '<ul><li>Develop comprehensive postgraduate curricula in Machine Learning</li><li>Mentor doctoral candidates</li></ul>',
      responsibilities_sw:
        '<ul><li>Buni mitaala kamili ya uzamili katika Kujifunza kwa Mashine</li><li>Simamia wagombea wa udaktari</li></ul>',
      requirements:
        '<ul><li>Ph.D. in Computer Science or related</li><li>10+ years teaching experience</li></ul>',
      requirements_sw:
        '<ul><li>Ph.D. katika Sayansi ya Kompyuta au uwanja husika</li><li>Uzoefu wa kufundisha wa miaka 10+</li></ul>',
      qualifications: '<ul><li>Published in top-tier journals</li></ul>',
      qualifications_sw:
        '<ul><li>Machapisho katika majarida ya ngazi ya juu</li></ul>',
      benefits:
        '<p>Comprehensive medical, house allowance, and extensive research grants.</p>',
      benefits_sw:
        '<p>Bima kamili ya afya, posho ya nyumba, na ruzuku kubwa za utafiti.</p>',
      application_deadline: futureDeadline1,
      application_method: 'internal',
      status: 'Published',
      is_active: true,
      division: divisions['academic-affairs'],
      job_category: categories['faculty'],
      specializations: [specs['Data Science'], specs['Cloud Computing']],
      department: defaultDept || undefined,
    },
    {
      title: 'Cloud Infrastructure Architect',
      slug: 'cloud-infrastructure-architect',
      reference_code: 'OUK-TECH-2026-102',
      summary:
        'Design and deploy highly scalable cloud infrastructure powering OUK virtual learning environments.',
      description:
        'You will be responsible for the core uptime of all OUK digital assets.',
      employment_type: 'Full-time',
      experience_level: 'Mid-Senior',
      job_grade: '12',
      positions_available: 2,
      location: 'Nairobi, Kenya',
      is_remote: true,
      title_sw: 'Mbunifu wa Miundombinu ya Wingu',
      summary_sw:
        'Buni na weka miundombinu ya wingu inayoweza kupanuka inayoendesha mazingira pepe ya kujifunza ya OUK.',
      description_sw:
        '<p>Utawajibika kwa upatikanaji wa msingi wa mali zote za kidijitali za OUK.</p>',
      responsibilities:
        '<ul><li>Architect AWS/Azure solutions</li><li>Ensure 99.99% uptime of LMS</li></ul>',
      responsibilities_sw:
        '<ul><li>Buni suluhisho za AWS/Azure</li><li>Hakikisha upatikanaji wa 99.99% wa LMS</li></ul>',
      requirements:
        '<ul><li>AWS Certified Solutions Architect</li><li>5+ years Kubernetes experience</li></ul>',
      requirements_sw:
        '<ul><li>AWS Certified Solutions Architect</li><li>Uzoefu wa Kubernetes wa miaka 5+</li></ul>',
      qualifications: '<ul><li>B.Sc. in Computer Science</li></ul>',
      qualifications_sw: '<ul><li>B.Sc. katika Sayansi ya Kompyuta</li></ul>',
      benefits: '<p>Remote work flexibility and performance bonuses.</p>',
      benefits_sw:
        '<p>Uwezo wa kufanya kazi kwa mbali na bonasi za utendaji.</p>',
      application_deadline: futureDeadline2, // Triggers "Closing Soon"
      application_method: 'external',
      application_url: 'https://careers.aws.com',
      status: 'Published',
      is_active: true,
      division: divisions['technology-innovation'],
      job_category: categories['engineering'],
      specializations: [specs['Cloud Computing'], specs['Cybersecurity']],
      department: defaultDept || undefined,
    },
    {
      title: 'Chief Financial Officer',
      slug: 'chief-financial-officer',
      reference_code: 'OUK-MGT-2026-050',
      summary:
        'Executive leadership role managing the financial strategy of OUK.',
      description:
        'Lead the fiscal sustainability initiatives for the university.',
      employment_type: 'Full-time',
      experience_level: 'Executive',
      job_grade: '16',
      positions_available: 1,
      location: 'Nairobi, Kenya',
      is_remote: false,
      title_sw: 'Afisa Mkuu wa Fedha',
      summary_sw:
        'Jukumu la uongozi wa juu la kusimamia mkakati wa kifedha wa OUK.',
      description_sw: '<p>Ongoza mipango ya uendelevu wa fedha wa chuo.</p>',
      responsibilities:
        '<ul><li>Manage multi-billion shilling budgets</li><li>Drive international donor relationships</li></ul>',
      responsibilities_sw:
        '<ul><li>Simamia bajeti za mabilioni ya shilingi</li><li>Kuza uhusiano na wafadhili wa kimataifa</li></ul>',
      requirements: '<ul><li>CPA-K, Master’s in Finance</li></ul>',
      requirements_sw:
        '<ul><li>CPA-K, Shahada ya Uzamili katika Fedha</li></ul>',
      qualifications: '<ul><li>Registered with ICPAK</li></ul>',
      qualifications_sw: '<ul><li>Kusajiliwa na ICPAK</li></ul>',
      benefits: '<p>Executive allowance, vehicle provision.</p>',
      benefits_sw: '<p>Posho ya watendaji, utoaji wa gari.</p>',
      application_deadline: undefined, // Open until filled
      application_method: 'internal',
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['management'],
      specializations: [specs['Finance']],
      department: undefined,
    },
    {
      title: 'Data Privacy Officer',
      slug: 'data-privacy-officer',
      reference_code: 'OUK-TECH-2026-115',
      summary:
        'Ensure compliance with the Kenya Data Protection Act across our large-scale digital platforms.',
      description:
        'Crucial role in protecting the data of over 100,000 active students.',
      employment_type: 'Full-time',
      experience_level: 'Mid-Level',
      job_grade: '11',
      positions_available: 1,
      location: 'Nairobi, Kenya',
      is_remote: true,
      title_sw: 'Afisa wa Faragha ya Data',
      summary_sw:
        'Hakikisha uzingatiaji wa Sheria ya Ulinzi wa Data ya Kenya katika majukwaa yetu makubwa ya kidijitali.',
      description_sw:
        '<p>Jukumu muhimu la kulinda data za wanafunzi zaidi ya 100,000 wanaotumia mfumo.</p>',
      responsibilities:
        '<ul><li>Audit internal data policies</li><li>Liaise with the Data Commissioner</li></ul>',
      responsibilities_sw:
        '<ul><li>Kagua sera za ndani za data</li><li>Shirikiana na Kamishna wa Data</li></ul>',
      requirements: '<ul><li>Degree in Law or Information Security</li></ul>',
      requirements_sw:
        '<ul><li>Shahada katika Sheria au Usalama wa Habari</li></ul>',
      qualifications: '<ul><li>CIPP certification</li></ul>',
      qualifications_sw: '<ul><li>Cheti cha CIPP</li></ul>',
      benefits: '<p>Continuous training and legal certifications covered.</p>',
      benefits_sw:
        '<p>Mafunzo endelevu na vyeti vya kisheria vinafadhiliwa.</p>',
      application_deadline: pastDeadline, // Will show as closed
      application_method: 'internal',
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['management'],
      specializations: [specs['Cybersecurity'], specs['Policy Analysis']],
      department: undefined,
    },
    {
      title: 'Digital Marketing Strategist',
      slug: 'digital-marketing-strategist',
      reference_code: 'OUK-MKT-2026-088',
      summary:
        'Enhance online enrolment numbers via strategic digital campaigns.',
      description:
        'Looking for a brilliant marketer who understands the digital education space.',
      employment_type: 'Contract',
      experience_level: 'Mid-Level',
      job_grade: '10',
      positions_available: 3,
      location: 'Mombasa, Kenya',
      is_remote: true,
      title_sw: 'Mtaalamu wa Mikakati ya Uuzaji wa Kidijitali',
      summary_sw:
        'Ongeza idadi ya usajili mtandaoni kupitia kampeni za kimkakati za kidijitali.',
      description_sw:
        '<p>Tunatafuta muuzaji mahiri anayeelewa nafasi ya elimu ya kidijitali.</p>',
      responsibilities:
        '<ul><li>Lead generation</li><li>SEO optimisation</li></ul>',
      responsibilities_sw:
        '<ul><li>Uzalishaji wa wateja watarajiwa</li><li>Uboreshaji wa SEO</li></ul>',
      requirements: '<ul><li>HubSpot Certification</li></ul>',
      requirements_sw: '<ul><li>Cheti cha HubSpot</li></ul>',
      qualifications: '<ul><li>B.A. in Communications/Marketing</li></ul>',
      qualifications_sw: '<ul><li>B.A. katika Mawasiliano/Uuzaji</li></ul>',
      benefits: '<p>Performance-based commission structure.</p>',
      benefits_sw: '<p>Muundo wa kamisheni unaotegemea utendaji.</p>',
      application_deadline: futureDeadline1,
      application_method: 'external',
      application_url: 'https://linkedin.com/jobs/ouk',
      status: 'Published',
      is_active: true,
      division: divisions['academic-affairs'],
      job_category: categories['support-staff'],
      specializations: [specs['Digital Marketing']],
      department: undefined,
    },
    {
      title: 'Senior Lecturer, Cybernetics',
      slug: 'senior-lecturer-cybernetics',
      reference_code: 'OUK-ACAD-2026-012',
      summary:
        'Join our School of Science in exploring the forefront of human-computer interaction.',
      description: 'Lecturer for advanced postgraduate modules.',
      employment_type: 'Part-time',
      experience_level: 'Senior Professional',
      job_grade: '14',
      positions_available: 2,
      location: 'Nakuru, Kenya',
      is_remote: false,
      responsibilities:
        '<ul><li>Set examinations</li><li>Supervise thesis projects</li></ul>',
      requirements:
        '<ul><li>Terminal degree in Cybernetics or closely related field.</li></ul>',
      qualifications:
        '<ul><li>Extensive industry experience preferred.</li></ul>',
      benefits: '<p>Flexible schedule.</p>',
      application_deadline: futureDeadline2,
      application_method: 'internal',
      status: 'Draft', // Won't show on public frontend
      is_active: false,
      division: divisions['academic-affairs'],
      job_category: categories['faculty'],
      specializations: [specs['Data Science'], specs['Cloud Computing']],
      department: defaultDept || undefined,
    },
    {
      title: 'Deputy Director, Teaching and Learning',
      slug: 'deputy-director-teaching-and-learning',
      reference_code: 'OUK-ACAD-2026-020',
      summary:
        'Support the implementation of the University’s Teaching and Learning Strategy for Open and Virtual Learning.',
      description:
        'Lead the strategic execution and policy framework development for digital pedagogy, online assessment, and technology-enhanced learning at the Open University of Kenya.',
      employment_type: 'Full-time',
      experience_level: 'Executive',
      job_grade: '14',
      positions_available: 1,
      location: 'Nairobi, Kenya',
      is_remote: false,
      responsibilities:
        '<ul><li>Support the implementation of the University’s Teaching and Learning Strategy for Open and Virtual Learning.</li><li>Help develop and review policies, standards, and guidelines for digital teaching, learning, and assessment.</li><li>Deliver professional development programmes to build faculty skills in digital pedagogy and online facilitation.</li><li>Promote innovative teaching practices and the use of emerging technologies, including AI and automation tools.</li><li>Coordinate the design and review of online courses to ensure quality, accessibility, and learner-centered design.</li><li>Promote research and scholarship in digital pedagogy, online assessment, and learner engagement.</li><li>Lead LearningOps practices by using data and analytics to improve teaching processes and student success.</li><li>Build national and international partnerships to support academic development and teaching innovation.</li><li>Mentor academic staff on online teaching, assessment, and course design.</li><li>Facilitate communities of practice, workshops, and knowledge-sharing forums.</li><li>Use Learning Analytics to support early alerts, student engagement, and data-driven interventions.</li><li>Coordinate resources and report progress to the DVC, Academic Affairs.</li></ul>',
      requirements:
        '<ul><li>A Master’s degree in Computer Science, Information Systems, ICT, or a closely related discipline; alternatively, a Master’s in Education with a specialization in ICT, Digital Learning, EdTech or related field.</li><li>A Bachelors degree in Education, ICT-in-Education or relevant field.</li><li>A PhD in Education in Instructional Design, Curriculum Development, Educational Technology, or a related field will be an added advantage.</li><li>Training in teaching methodology, instructional design, e-learning, quality assurance, or higher education leadership.</li><li>Certification or training in LMS use, digital pedagogy, online course development, or AI-in-Education tools.</li><li>At least 9 years of relevant academic experience, including three (3) years in leadership roles involving programme management, curriculum oversight, quality assurance, and technology-enhanced learning.</li></ul>',
      qualifications:
        '<ul><li>Proficiency in LMS platforms, digital learning tools, AI-supported learning technologies, and Learning Analytics.</li><li>Strong knowledge of pedagogical models, teaching and learning policies, and academic standards.</li></ul>',
      benefits:
        '<p>Standard university leadership benefits and professional development allowances.</p>',
      application_deadline: futureDeadline1,
      application_method: 'internal',
      status: 'Published',
      is_active: true,
      division: divisions['academic-affairs'],
      job_category: categories['management'],
      specializations: [specs['Digital Marketing']],
      department: defaultDept || undefined,
    },
    // Historical Archives (Past Jobs)
    {
      title: 'Senior Librarian (Archives)',
      slug: 'senior-librarian-archives',
      reference_code: 'OUK-ADM-2024-044',
      summary:
        'Manage physical and digital assets in the foundation phase of OUK.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Mid-Level',
      job_grade: '12',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['support-staff'],
      specializations: [specs['Policy Analysis']],
    },
    {
      title: 'IT Support Analyst',
      slug: 'it-support-analyst',
      reference_code: 'OUK-TECH-2025-012',
      summary: 'First-line support for inaugural staff.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Junior',
      job_grade: '8',
      positions_available: 5,
      location: 'Remote',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['technology-innovation'],
      job_category: categories['engineering'],
      specializations: [specs['Cloud Computing']],
    },
    {
      title: 'Registrar of Student Affairs',
      slug: 'registrar-student-affairs',
      reference_code: 'OUK-ADM-2025-001',
      summary: 'Setting up student governance frameworks.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Senior',
      job_grade: '14',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['management'],
      specializations: [specs['Policy Analysis']],
    },
    {
      title: 'Laboratory Technician (Chemistry)',
      slug: 'lab-tech-chemistry',
      reference_code: 'OUK-ACAD-2025-099',
      summary: 'Procurement of laboratory equipment for the School of Science.',
      description: 'Historical role.',
      employment_type: 'Contract',
      experience_level: 'Mid-Level',
      job_grade: '9',
      positions_available: 2,
      location: 'Machakos',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['academic-affairs'],
      job_category: categories['support-staff'],
      specializations: [specs['Data Science']],
    },
    {
      title: 'Finance Officer',
      slug: 'finance-officer-seed',
      reference_code: 'OUK-FIN-2025-020',
      summary: 'Financial reconciliation for initial university setup.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Mid-Level',
      job_grade: '10',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['management'],
      specializations: [specs['Finance']],
    },
    {
      title: 'Security Operations Manager',
      slug: 'security-ops-manager',
      reference_code: 'OUK-ADM-2025-033',
      summary: 'Physical security planning for our temporary headquarters.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Senior',
      job_grade: '11',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['management'],
      specializations: [specs['Policy Analysis']],
    },
    {
      title: 'Curriculum Developer (STEM)',
      slug: 'curriculum-developer-stem',
      reference_code: 'OUK-ACAD-2025-055',
      summary: 'Framework development for Science and Technology programs.',
      description: 'Historical role.',
      employment_type: 'Contract',
      experience_level: 'Senior Professional',
      job_grade: '13',
      positions_available: 4,
      location: 'Remote',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['academic-affairs'],
      job_category: categories['faculty'],
      specializations: [specs['Data Science']],
    },
    {
      title: 'Alumni Relations Coordinator',
      slug: 'alumni-relations-coordinator',
      reference_code: 'OUK-MKT-2025-007',
      summary: 'Initial planning for the OUK Alumni network.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Junior',
      job_grade: '8',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['support-staff'],
      specializations: [specs['Digital Marketing']],
    },
    {
      title: 'Procurement Specialist',
      slug: 'procurement-specialist-seed',
      reference_code: 'OUK-ADM-2025-015',
      summary: 'Specialist for IT hardware procurement cycles.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Mid-Level',
      job_grade: '11',
      positions_available: 2,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['support-staff'],
      specializations: [specs['Finance']],
    },
    {
      title: 'Estate Manager',
      slug: 'estate-manager-seed',
      reference_code: 'OUK-ADM-2025-066',
      summary: 'Facility management for the OUK city campus.',
      description: 'Historical role.',
      employment_type: 'Full-time',
      experience_level: 'Senior',
      job_grade: '12',
      positions_available: 1,
      location: 'Nairobi',
      application_deadline: pastDeadline,
      status: 'Published',
      is_active: true,
      division: divisions['administrative'],
      job_category: categories['support-staff'],
      specializations: [specs['Policy Analysis']],
    },
  ];

  const swKeys = [
    'title_sw',
    'summary_sw',
    'description_sw',
    'responsibilities_sw',
    'requirements_sw',
    'qualifications_sw',
    'benefits_sw',
    'additional_notes_sw',
  ] as const;

  for (const data of jobsData) {
    const job = await jobRepo.findOne({ where: { slug: data.slug } });
    if (!job) {
      const newJob = jobRepo.create({
        ...data,
      });
      await jobRepo.save(newJob);
      console.log(`Seeded Job: ${data.title}`);
    } else {
      let touched = false;
      for (const key of swKeys) {
        const next = (data as any)[key];
        if (next && !(job as any)[key]) {
          (job as any)[key] = next;
          touched = true;
        }
      }
      if (touched) {
        await jobRepo.save(job);
        console.log(`Backfilled SW fields: ${data.title}`);
      }
    }
  }

  console.log('--- CAREERS SEED COMPLETE ---');
};
