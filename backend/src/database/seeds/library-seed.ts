import { DataSource } from 'typeorm';
import {
  LibraryDatabase,
  DatabaseCategory,
} from '../../library/databases/library-database.entity';
import {
  LibraryWorkshop,
  WorkshopType,
} from '../../library/training/library-workshop.entity';
import { LibraryTutorial } from '../../library/training/library-tutorial.entity';
import {
  EResource,
  EResourceType,
  EResourceAccessType,
} from '../../library/e-resources/entities/e-resource.entity';
import { EResourceProvider } from '../../library/e-resources/entities/provider.entity';
import { EResourceSubject } from '../../library/e-resources/entities/subject.entity';
import { InformationLiteracyConfig } from '../../library/information-literacy/entities/information-literacy.entity';

export async function seedLibrary(dataSource: DataSource) {
  const dbRepo = dataSource.getRepository(LibraryDatabase);
  const workshopRepo = dataSource.getRepository(LibraryWorkshop);
  const tutorialRepo = dataSource.getRepository(LibraryTutorial);
  const eResourceRepo = dataSource.getRepository(EResource);
  const providerRepo = dataSource.getRepository(EResourceProvider);
  const subjectRepo = dataSource.getRepository(EResourceSubject);
  const literacyRepo = dataSource.getRepository(InformationLiteracyConfig);

  // ... (Existing seed logic for Databases, Workshops, Tutorials)
  // [Note: Keeping existing logic code for brevity in this view, assuming it's before]

  // 4. Seed E-Resource Providers
  const providerCount = await providerRepo.count();
  if (providerCount === 0) {
    const PROVIDERS = [
      { name: 'JSTOR', website: 'https://www.jstor.org' },
      { name: 'ScienceDirect', website: 'https://www.sciencedirect.com' },
      { name: 'Emerald Publishing', website: 'https://www.emerald.com' },
      { name: 'IEEE Xplore', website: 'https://ieeexplore.ieee.org' },
      { name: 'Oxford Academic', website: 'https://academic.oup.com' },
    ];
    for (const pData of PROVIDERS) {
      await providerRepo.save(providerRepo.create(pData));
    }
    console.log('E-Resource Providers seeded!');
  }

  // 5. Seed E-Resource Subjects
  const subjectCount = await subjectRepo.count();
  if (subjectCount === 0) {
    const SUBJECTS = [
      { name: 'Science', slug: 'science' },
      { name: 'Technology', slug: 'technology' },
      { name: 'Business', slug: 'business' },
      { name: 'Education', slug: 'education' },
      { name: 'Health', slug: 'health' },
    ];
    for (const sData of SUBJECTS) {
      await subjectRepo.save(subjectRepo.create(sData));
    }
    console.log('E-Resource Subjects seeded!');
  }

  // 6. Seed E-Resources
  const eResourceCount = await eResourceRepo.count();
  if (eResourceCount === 0) {
    const providers = await providerRepo.find();
    const subjects = await subjectRepo.find();

    const E_RESOURCES = [
      {
        title: 'Introduction to Quantum Computing',
        slug: 'intro-quantum-computing',
        summary:
          'A comprehensive guide to the principles and applications of quantum computing in the modern era.',
        description:
          'This digital resource covers the fundamental concepts of quantum mechanics, qubits, and quantum algorithms. Ideal for STEM students and researchers looking to dive into the future of computation.',
        resource_type: EResourceType.EBOOK,
        access_type: EResourceAccessType.OPEN,
        is_featured: true,
        external_url: 'https://example.com/quantum-ebook',
        provider: providers.find((p) => p.name === 'IEEE Xplore'),
        subjects: [
          subjects.find((s) => s.slug === 'technology'),
          subjects.find((s) => s.slug === 'science'),
        ],
      },
      {
        title: 'Journal of Sustainable Business Practices',
        slug: 'journal-sustainable-business',
        summary:
          'Monthly publication focusing on eco-friendly management and corporate social responsibility.',
        description:
          'Access the latest peer-reviewed research on sustainability in the corporate world, from carbon neutral supply chains to ethical leadership.',
        resource_type: EResourceType.EJOURNAL,
        access_type: EResourceAccessType.RESTRICTED,
        requires_login: true,
        access_instructions:
          'Please use your OUK Institutional credentials to log in via JSTOR.',
        external_url: 'https://www.jstor.org/sustainable-business',
        provider: providers.find((p) => p.name === 'JSTOR'),
        subjects: [subjects.find((s) => s.slug === 'business')],
      },
      {
        title: 'Global Health Research Database',
        slug: 'global-health-db',
        summary:
          'Extensive collection of medical journals and health statistics from around the globe.',
        description:
          'A vital resource for medical students and health professionals, providing real-time data on global health trends and breakthrough treatments.',
        resource_type: EResourceType.DATABASE,
        access_type: EResourceAccessType.RESTRICTED,
        requires_login: true,
        is_featured: true,
        provider: providers.find((p) => p.name === 'Oxford Academic'),
        subjects: [subjects.find((s) => s.slug === 'health')],
      },
    ];

    for (const resData of E_RESOURCES) {
      const { subjects: resSubjects, provider: resProvider, ...rest } = resData;
      const resource = eResourceRepo.create(rest);
      if (resProvider) resource.provider = resProvider;
      if (resSubjects)
        resource.subjects = resSubjects.filter((s) => s !== undefined) as any;
      await eResourceRepo.save(resource);
    }
    console.log('E-Resources seeded!');
  }

  // 7. Seed Information Literacy Config
  const literacyCount = await literacyRepo.count();
  if (literacyCount === 0) {
    const config = literacyRepo.create({
      title: 'Information Literacy',
      slug: 'information-literacy',
      intro_content:
        'At the Open University of Kenya, we empower learners with the critical skills needed to navigate the vast digital information landscape with confidence and integrity.',
      core_competencies: [
        {
          title: 'Identifying Needs',
          desc: 'Understand what information is required and define research questions clearly.',
          icon: 'BookOpen',
        },
        {
          title: 'Searching Safely',
          desc: 'Use library catalogues, databases, and search engines effectively to locate literature.',
          icon: 'Search',
        },
        {
          title: 'Evaluating Sources',
          desc: 'Assess credibility, relevance, accuracy, and bias of information sources rigorously.',
          icon: 'CheckCircle',
        },
        {
          title: 'Ethical Usage',
          desc: 'Avoid plagiarism, respect intellectual property, and properly cite all academic sources.',
          icon: 'ShieldCheck',
        },
        {
          title: 'Managing Info',
          desc: 'Organise, synthesise, and store research materials efficiently for easy retrieval.',
          icon: 'FolderOpen',
        },
        {
          title: 'Digital Literacy',
          desc: 'Navigate complex online tools, datasets, and advanced academic platforms with ease.',
          icon: 'Laptop',
        },
      ],
      research_steps: [
        'Define your topic and formulate a clear research question.',
        'Identify keywords, synonyms, and search vocabulary.',
        'Utilize academic databases and institutional catalogues.',
        'Critically evaluate the credibility of your identified sources.',
        'Take structured notes and organise empirical findings.',
        'Cite your sources using formal referencing conventions.',
      ],
      evaluation_framework: [
        {
          l: 'Currency',
          d: 'Is the information up to date and recently revised?',
        },
        {
          l: 'Relevance',
          d: 'Does it relate directly to your topic or answer your question?',
        },
        {
          l: 'Authority',
          d: 'Who is the author, publisher, or sponsor? What are their credentials?',
        },
        {
          l: 'Accuracy',
          d: 'Is the information reliable, truthful, and supported by evidence?',
        },
        {
          l: 'Purpose',
          d: 'Why was this information created? Is it objective or biased?',
        },
      ],
      plagiarism_content:
        'Plagiarism is the use of another person’s work—words, ideas, or data—without proper acknowledgment. Academic integrity is a non-negotiable core value at OUK.',
      citation_styles: ['APA', 'MLA', 'Harvard'],
      status: 'Published',
      meta_title: 'Information Literacy | OUK Library',
      meta_description:
        'Develop critical skills to navigate the digital landscape and use information effectively for academic success.',
    });
    await literacyRepo.save(config);
    console.log('Information Literacy configuration seeded!');
  }
}
