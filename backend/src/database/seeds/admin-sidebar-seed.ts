import { DataSource } from 'typeorm';
import {
  AdminSidebarCategory,
  AdminSidebarItem,
} from '../../admin-sidebar/entities/admin-sidebar.entity';

export const runAdminSidebarSeed = async (dataSource: DataSource) => {
  const categoryRepo = dataSource.getRepository(AdminSidebarCategory);
  const itemRepo = dataSource.getRepository(AdminSidebarItem);

  const categories = [
    {
      title: 'Governance & Stats',
      order: 1,
      items: [
        {
          label: 'Strategic Dashboard',
          href: '/admin',
          icon: 'LayoutDashboard',
          order: 1,
        },
        {
          label: 'Identity Management',
          href: '/admin/users',
          icon: 'Users',
          order: 2,
        },
        {
          label: 'Roles & RBAC',
          href: '/admin/roles',
          icon: 'ShieldCheck',
          order: 3,
        },
        {
          label: 'Strategic Reports',
          href: '/admin/reports',
          icon: 'BarChart3',
          order: 4,
        },
      ],
    },
    {
      title: 'Academic Ecosystem',
      order: 2,
      items: [
        {
          label: 'Schools & Faculties',
          href: '/admin/schools',
          icon: 'School',
          order: 1,
        },
        {
          label: 'Academic Programmes',
          href: '/admin/programmes',
          icon: 'GraduationCap',
          order: 2,
        },
        {
          label: 'Course Unit Registry',
          href: '/admin/course-units',
          icon: 'BookOpen',
          order: 3,
        },
        {
          label: 'Short Courses',
          href: '/admin/short-courses',
          icon: 'Zap',
          order: 4,
        },
        {
          label: 'Timetables Configuration',
          href: '/admin/timetables',
          icon: 'Clock',
          order: 5,
        },
      ],
    },
    {
      title: 'Institutional Content',
      order: 3,
      items: [
        {
          label: 'Hero Slides',
          href: '/admin/hero-slides',
          icon: 'Image',
          order: 1,
        },
        {
          label: 'Institutional Pages',
          href: '/admin/pages',
          icon: 'FileText',
          order: 2,
        },
        {
          label: 'Staff & Governance',
          href: '/admin/staff',
          icon: 'Briefcase',
          order: 3,
        },
        {
          label: 'News & Publications',
          href: '/admin/news',
          icon: 'Newspaper',
          order: 4,
        },
        {
          label: 'Downloads Hub',
          href: '/admin/downloads',
          icon: 'Download',
          order: 5,
        },
        {
          label: 'Testimonials',
          href: '/admin/testimonials',
          icon: 'Quote',
          order: 6,
        },
        {
          label: 'Home Manager',
          href: '/admin/home',
          icon: 'Layout',
          order: 7,
        },
        {
          label: 'Strategic Partnerships',
          href: '/admin/partnerships',
          icon: 'Handshake',
          order: 8,
        },
      ],
    },
    {
      title: 'Portals & Communities',
      order: 4,
      items: [
        {
          label: 'Student Portal Hub',
          href: '/admin/students',
          icon: 'UserCircle',
          order: 1,
        },
        {
          label: 'Alumni Association',
          href: '/admin/alumni',
          icon: 'Award',
          order: 2,
        },
        {
          label: 'Peer Learners',
          href: '/admin/peer-learners',
          icon: 'Users2',
          order: 3,
        },
      ],
    },
    {
      title: 'Communication & Support',
      order: 5,
      items: [
        {
          label: 'My Tickets',
          href: '/admin/my-tickets',
          icon: 'Ticket',
          order: 0,
        },
        {
          label: 'ICT Service Desk',
          href: '/admin/ict',
          icon: 'Headset',
          order: 2,
        },
        {
          label: 'Chat Intelligence',
          href: '/admin/chats',
          icon: 'MessageSquare',
          order: 3,
        },
        {
          label: 'Technical Support',
          href: '/admin/support',
          icon: 'LifeBuoy',
          order: 4,
        },
        {
          label: 'DVC Infrastructure',
          href: '/admin/dvc/infrastructure',
          icon: 'Building2',
          order: 5,
        },
        {
          label: 'FAQs Base',
          href: '/admin/faqs',
          icon: 'HelpCircle',
          order: 6,
        },
      ],
    },
    {
      title: 'System & DevOps',
      order: 6,
      items: [
        {
          label: 'Portal Settings',
          href: '/admin/settings',
          icon: 'Settings',
          order: 1,
        },
        {
          label: 'Maintenance Engine',
          href: '/admin/settings/maintenance',
          icon: 'Wrench',
          order: 2,
        },
        { label: 'Audit Logs', href: '/admin/logs', icon: 'History', order: 3 },
        {
          label: 'Institutional Trash',
          href: '/admin/recycle-bin',
          icon: 'Trash2',
          order: 4,
        },
      ],
    },
  ];

  for (const catData of categories) {
    let category = await categoryRepo.findOne({
      where: { title: catData.title },
    });
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({
          title: catData.title,
          order: catData.order,
        }),
      );
    } else {
      category.order = catData.order;
      await categoryRepo.save(category);
    }

    for (const itemData of catData.items) {
      const item = await itemRepo.findOne({ where: { href: itemData.href } });
      if (!item) {
        await itemRepo.save(
          itemRepo.create({
            ...itemData,
            category,
          }),
        );
      } else {
        item.label = itemData.label;
        item.icon = itemData.icon;
        item.order = itemData.order;
        item.category = category;
        await itemRepo.save(item);
      }
    }
  }

  console.log('--- ADMIN SIDEBAR SEEDING COMPLETED ---');
};
