import { DataSource } from 'typeorm';
import {
  Download,
  DownloadStatus,
  AccessLevel,
} from '../../downloads/entities/download.entity';
import { DownloadCategory } from '../../downloads/entities/download-category.entity';
import { DownloadTag } from '../../downloads/entities/download-tag.entity';
import { User } from '../../auth/entities/user.entity';
import { Menu } from '../../menus/entities/menu.entity';

export const runDownloadsSeed = async (dataSource: DataSource) => {
  const categoryRepo = dataSource.getRepository(DownloadCategory);
  const downloadRepo = dataSource.getRepository(Download);
  const tagRepo = dataSource.getRepository(DownloadTag);
  const userRepo = dataSource.getRepository(User);
  const menuRepo = dataSource.getRepository(Menu);

  const admin = await userRepo.findOne({ where: { email: 'admin@ouk.ac.ke' } });

  // 1. Categories
  const categoriesData = [
    {
      name: 'Institutional Documents',
      icon: 'FileText',
      display_order: 1,
      description:
        'Official documents outlining governance and strategic direction.',
    },
    {
      name: 'Academic Documents',
      icon: 'BookOpen',
      display_order: 2,
      description:
        'Resources supporting academic planning and student success.',
    },
    {
      name: 'Admissions & Application Forms',
      icon: 'ClipboardList',
      display_order: 3,
      description: 'Forms required for enrolment and administration.',
    },
    {
      name: 'Policies and Regulations',
      icon: 'Scale',
      display_order: 4,
      description: 'Policies guiding university operations and compliance.',
    },
    {
      name: 'Research and Publications',
      icon: 'FileBarChart',
      display_order: 5,
      description: 'Documents showcasing scholarly contributions.',
    },
    {
      name: 'Partnerships and Collaborations',
      icon: 'Handshake',
      display_order: 6,
      description: 'Documents supporting institutional collaborations.',
    },
  ];

  const categories: Record<string, DownloadCategory> = {};
  for (const cat of categoriesData) {
    let category = await categoryRepo.findOneBy({ name: cat.name });
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({
          ...cat,
          slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
          is_active: true,
        }),
      );
    }
    categories[cat.name] = category;
  }

  // 2. Sample Downloads
  const downloadsData = [
    // Institutional
    {
      title: 'University Charter',
      cat: 'Institutional Documents',
      type: 'PDF',
      size: 2516582,
      version: 'v1.0',
    },
    {
      title: 'Strategic Plan (2023–2028)',
      cat: 'Institutional Documents',
      type: 'PDF',
      size: 3250585,
      version: 'v2.1',
    },
    {
      title: 'Annual Report 2024',
      cat: 'Institutional Documents',
      type: 'PDF',
      size: 4500123,
      version: 'v1.0',
    },
    {
      title: 'Organizational Chart',
      cat: 'Institutional Documents',
      type: 'PDF',
      size: 1200500,
      version: 'v3.0',
    },

    // Academic
    {
      title: 'Academic Calendar 2025',
      cat: 'Academic Documents',
      type: 'PDF',
      size: 1258291,
      version: 'v1.1',
    },
    {
      title: 'Undergraduate Prospectus',
      cat: 'Academic Documents',
      type: 'PDF',
      size: 5800000,
      version: 'v1.0',
    },
    {
      title: 'Examination Regulations',
      cat: 'Academic Documents',
      type: 'PDF',
      size: 950000,
      version: 'v2.0',
    },

    // Admissions
    {
      title: 'Undergraduate Application Form',
      cat: 'Admissions & Application Forms',
      type: 'PDF',
      size: 870400,
    },
    {
      title: 'Scholarship Application Form',
      cat: 'Admissions & Application Forms',
      type: 'PDF',
      size: 1100000,
    },

    // Policies
    {
      title: 'Data Protection and Privacy Policy',
      cat: 'Policies and Regulations',
      type: 'PDF',
      size: 1572864,
    },
    {
      title: 'ICT Acceptable Use Policy',
      cat: 'Policies and Regulations',
      type: 'PDF',
      size: 850000,
    },
    {
      title: 'Research Ethics Policy',
      cat: 'Policies and Regulations',
      type: 'PDF',
      size: 1200000,
    },
  ];

  for (const d of downloadsData) {
    const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const download = await downloadRepo.findOneBy({ slug });
    if (!download) {
      await downloadRepo.save(
        downloadRepo.create({
          title: d.title,
          slug,
          summary: `Official ${d.title} document for the Open University of Kenya.`,
          category: categories[d.cat],
          document_type: d.type,
          file_name: `${slug}.${d.type.toLowerCase()}`,
          file_size: d.size,
          file_extension: d.type.toLowerCase(),
          version: d.version || 'v1.0',
          status: DownloadStatus.PUBLISHED,
          access_level: AccessLevel.PUBLIC,
          publish_at: new Date(),
          created_by: admin || undefined,
          is_featured:
            d.title.includes('Charter') || d.title.includes('Strategic'),
          // Placeholder URLs
          file_url: `/documents/${slug}.${d.type.toLowerCase()}`,
          show_file_size: true,
          show_version: true,
          meta_title: `${d.title} | Downloads | OUK`,
          meta_description: `Download the official ${d.title} from the Open University of Kenya institutional repository.`,
        }),
      );
    }
  }

  console.log('✅ Institutional Downloads Seeded Successfully');

  // 3. Register in Menu
  const aboutMenu = await menuRepo.findOne({ where: { slug: 'about' } });
  if (aboutMenu) {
    const downloadsMenuSlug = 'about/downloads';
    const downloadsMenu = await menuRepo.findOne({
      where: { slug: downloadsMenuSlug },
    });
    if (!downloadsMenu) {
      await menuRepo.save(
        menuRepo.create({
          title: 'Downloads Hub',
          slug: downloadsMenuSlug,
          link: '/about/downloads',
          position: 'header',
          order: 10,
          parent: aboutMenu,
          is_public: true,
        }),
      );
      console.log('✅ Downloads registered in "About OUK" menu.');
    }
  }
};
