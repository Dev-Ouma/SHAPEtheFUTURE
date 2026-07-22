export interface AdminSidebarItem {
  label: string;
  href?: string;
  icon: string;
  order: number;
  /** Nested submenu items (e.g. University Service Desk → General Helpdesk). */
  children?: AdminSidebarItem[];
}

export interface AdminSidebarSection {
  title: string;
  order: number;
  items: AdminSidebarItem[];
}

const ADMIN_SIDEBAR_SECTIONS: AdminSidebarSection[] = [
  {
    title: 'SHAPE Project',
    order: 0,
    items: [
      { label: 'The Project & Home', href: '/admin/shape-home', icon: 'Layout', order: 0 },
      { label: 'Partners', href: '/admin/shape-partners', icon: 'Handshake', order: 1 },
      { label: 'Work Packages', href: '/admin/shape-work-packages', icon: 'FolderKanban', order: 2 },
      { label: 'Events', href: '/admin/shape-events', icon: 'Calendar', order: 3 },
      { label: 'Documents', href: '/admin/shape-documents', icon: 'FileText', order: 4 },
      { label: 'KPIs', href: '/admin/shape-kpis', icon: 'BarChart3', order: 5 },
      { label: 'Activities', href: '/admin/shape-activities', icon: 'Clock', order: 6 },
      { label: 'Risks', href: '/admin/shape-risks', icon: 'ShieldCheck', order: 7 },
      { label: 'SDLC Stages', href: '/admin/shape-sdlc', icon: 'Layers', order: 8 },
      { label: 'Contact Inbox', href: '/admin/shape-contact', icon: 'Mail', order: 9 },
      { label: 'News & Publications', href: '/admin/news', icon: 'Newspaper', order: 10 },
      { label: 'Hero Slides', href: '/admin/hero-slides', icon: 'Image', order: 11 },
    ],
  },
  {
    title: 'Governance & Stats',
    order: 1,
    items: [
      { label: 'Strategic Dashboard', href: '/admin', icon: 'LayoutDashboard', order: 1 },
      { label: 'Identity Management', href: '/admin/users', icon: 'Users', order: 2 },
      { label: 'Roles & RBAC', href: '/admin/roles', icon: 'ShieldCheck', order: 3 },
      { label: 'Strategic Reports', href: '/admin/reports', icon: 'BarChart3', order: 4 },
    ],
  },
  {
    title: 'Institutional Content',
    order: 3,
    items: [
      { label: 'Hero Slides', href: '/admin/hero-slides', icon: 'Image', order: 1 },
      { label: 'Institutional Pages', href: '/admin/pages', icon: 'FileText', order: 2 },
      { label: 'News & Publications', href: '/admin/news', icon: 'Newspaper', order: 4 },
      { label: 'Downloads Hub', href: '/admin/downloads', icon: 'Download', order: 5 },
      { label: 'Home Manager', href: '/admin/home', icon: 'Layout', order: 7 },
      { label: 'Adverts & Promotions', href: '/admin/adverts', icon: 'Megaphone', order: 9 },
    ],
  },
  {
    title: 'System & DevOps',
    order: 8,
    items: [
      { label: 'Portal Settings', href: '/admin/settings', icon: 'Settings', order: 1 },
      { label: 'Accessibility', href: '/admin/accessibility', icon: 'Accessibility', order: 2 },
      { label: 'Maintenance Engine', href: '/admin/settings/maintenance', icon: 'Wrench', order: 3 },
      { label: 'Audit Logs', href: '/admin/logs', icon: 'History', order: 4 },
      { label: 'Institutional Trash', href: '/admin/recycle-bin', icon: 'Trash2', order: 5 },
    ],
  },
];

function sortItems(items: AdminSidebarItem[]): AdminSidebarItem[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) =>
      item.children?.length
        ? { ...item, children: sortItems(item.children) }
        : item,
    );
}

export function getAdminSidebarSections(): AdminSidebarSection[] {
  return ADMIN_SIDEBAR_SECTIONS.map((section) => ({
    ...section,
    items: sortItems(section.items),
  }));
}
