"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Loader2,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMenu } from "@/context/AdminMenuContext";
import { API_URL, getAdminAuthHeaders } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Route-to-Permission mapping
// Evaluates specific UI routes against granular DB capabilities
// ─────────────────────────────────────────────────────────────────────────────
const ROUTE_PERMISSION_MAP: Record<string, string | string[]> = {
  '/admin': 'dashboard.view',
  '/admin/users': 'users.view',
  '/admin/roles': 'roles.view',
  '/admin/reports': 'reports.view',
  '/admin/system-logs': 'logs.view',
  '/admin/logs': 'logs.view',
  '/admin/recycle-bin': 'recycle_bin.view',

  '/admin/home-manager': 'home.manage',
  '/admin/home': 'home.manage',
  '/admin/pages': ['pages.view', 'pages.manage'],

  '/admin/news': 'news.view',
  '/admin/downloads': ['downloads.view', 'downloads.manage'],
  '/admin/testimonials': 'testimonials.view',
  '/admin/hero-slides': 'hero_slides.view',
  '/admin/intro-videos': 'intro_videos.view',
  '/admin/back-links': 'back_links.view',
  '/admin/backlinks': 'back_links.view',
  '/admin/adverts': 'adverts.manage',
  '/admin/faqs': 'pages.view',
  '/admin/careers': 'pages.view',
  '/admin/service-charter': 'content.manage',


  '/admin/schools': 'schools.view',
  '/admin/programmes': 'programmes.view',
  '/admin/course-units': 'course_units.view',
  '/admin/short-courses': 'short_courses.view',
  '/admin/peer-learners': 'peer_learners.view',
  '/admin/timetables': 'timetables.view',
  '/admin/departments': 'schools.view',

  // University Service Desk — lane-scoped menus.
  // General Helpdesk officers must NOT see ICT Technical Support overview.
  '/admin/ict': 'ict.view',
  '/admin/ict/tickets': ['ict.view', 'helpdesk.view', 'campus_feedback.view'],
  '/admin/helpdesk': ['helpdesk.view', 'campus_feedback.view', 'complaints.view'],
  // Personal assigned-ticket workspace — grant via Roles & RBAC (`my_tickets.view`).
  '/admin/my-tickets': 'my_tickets.view',
  // Specialised ICT tooling stays restricted to ICT staff.
  '/admin/ict/knowledge': 'ict_knowledge.view',
  '/admin/ict/password-reset': 'ict_password.view',
  '/admin/ict/status': 'ict_status.view',
  '/admin/ict/management': 'ict.manage',
  '/admin/campus-feedback': ['helpdesk.view', 'campus_feedback.view'],
  '/admin/complaints': ['helpdesk.view', 'complaints.view'],

  // Chat Intelligence / AI assistant (General Helpdesk channel).
  '/admin/chats': ['chats.view', 'complaints.view'],
  '/admin/support': ['chats.view', 'complaints.view', 'helpdesk.view'],
  '/admin/chat-intelligence': 'chats.view',
  '/admin/ai-knowledge-base': 'chats.view',
  '/admin/training': 'chats.view',

  '/admin/staff': 'staff.view',
  '/admin/staff-portal': 'staff.view',
  '/admin/students': 'student_portal.view',
  '/admin/student-portal': 'student_portal.view',
  '/admin/alumni': 'alumni_portal.view',
  '/admin/alumni-portal': 'alumni_portal.view',
  '/admin/partnerships': 'partnerships.view',
  '/admin/virtual-tour': 'virtual_tour.view',

  '/admin/settings': ['settings.view', 'settings.manage'],
  '/admin/settings/maintenance': ['settings.view', 'settings.manage'],
  '/admin/content-approvals': 'governance.manage',
  '/admin/system-health': 'dashboard.view',
  '/admin/analytics': 'reports.view',
  '/admin/dvc/infrastructure': ['reports.view', 'infrastructure_analytics.view'],

  '/admin/research/grants': ['programmes.view', 'programmes.manage'],
  '/admin/research/programmes': ['programmes.view', 'programmes.manage'],
  '/admin/research/projects': ['programmes.view', 'programmes.manage'],
  '/admin/research/publications': ['programmes.view', 'programmes.manage'],

  '/admin/library/e-resources': ['knowledge_hub.view', 'knowledge_hub.manage'],
  '/admin/library/e-resources/taxonomies': ['knowledge_hub.view', 'knowledge_hub.manage'],
  '/admin/library/databases': ['knowledge_hub.view', 'knowledge_hub.manage'],
  '/admin/library/information-literacy': ['knowledge_hub.view', 'knowledge_hub.manage'],
  '/admin/library/training': ['knowledge_hub.view', 'knowledge_hub.manage'],

  '/admin/finance/academic-years': 'finance.view',
  '/admin/finance/programme-fees': 'finance.view',
  '/admin/finance/payment-methods': 'finance.view',
  '/admin/finance/scholarships': 'finance.view',

  '/admin/shape-home': ['shape.view', 'shape.manage', 'settings.view', 'settings.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-partners': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-work-packages': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-events': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-documents': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-kpis': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-activities': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-risks': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-sdlc': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
  '/admin/shape-contact': ['shape.view', 'shape.manage', 'pages.view', 'pages.manage'],
};

function getUser(): any {
  try {
    const raw = localStorage.getItem("ouk_admin_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildCapabilities(user: any): Set<string> {
  const caps = new Set<string>();
  if (user?.role?.permissions) {
    user.role.permissions.forEach((p: any) => caps.add(p.slug));
  }
  if (user?.allowedPermissions) {
    user.allowedPermissions.forEach((p: any) => caps.add(p.slug));
  }
  if (user?.deniedPermissions) {
    user.deniedPermissions.forEach((p: any) => caps.delete(p.slug));
  }
  return caps;
}

function isSuperAdmin(user: any): boolean {
  return (
    user?.role?.is_system_role === true && user?.role?.name === "Super Administrator"
  ) || user?.role_legacy === "super_admin";
}

function routePermissionKey(href?: string): string {
  if (!href) return '';
  const path = href.split('?')[0];
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function itemIsVisible(item: any, capabilities: Set<string>): boolean {
  if (Array.isArray(item?.children) && item.children.length > 0) {
    return item.children.some((child: any) => itemIsVisible(child, capabilities));
  }
  const key = routePermissionKey(item?.href);
  const requiredCap = ROUTE_PERMISSION_MAP[key] ?? (item?.href ? ROUTE_PERMISSION_MAP[item.href] : undefined);
  if (!requiredCap) return capabilities.has('dashboard.view');
  if (Array.isArray(requiredCap)) return requiredCap.some((cap) => capabilities.has(cap));
  return capabilities.has(requiredCap);
}

function filterSectionsByPermissions(sections: any[], user: any, capabilities: Set<string>): any[] {
  if (!Array.isArray(sections) || !user) return [];

  if (isSuperAdmin(user)) return sections;

  return sections
    .map((section: any) => {
      const processedSection = { ...section };
      const items = Array.isArray(processedSection.items) ? processedSection.items : [];
      processedSection.items = items
        .map((item: any) => {
          if (Array.isArray(item?.children) && item.children.length > 0) {
            const children = item.children.filter((child: any) => itemIsVisible(child, capabilities));
            if (!children.length) return null;
            return { ...item, children };
          }
          return itemIsVisible(item, capabilities) ? item : null;
        })
        .filter(Boolean);
      return processedSection;
    })
    .filter((section: any) => Array.isArray(section.items) && section.items.length > 0);
}

const Sidebar = ({ onLogout }: { onLogout?: () => void }) => {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>("Communication & Support");
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "University Service Desk": true,
  });
  const { menuSections, loading } = useAdminMenu();

  // Restore the collapsed preference so it persists across navigation/reloads.
  useEffect(() => {
    try {
      if (localStorage.getItem("ouk_sidebar_collapsed") === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ouk_sidebar_collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // Count of the current user's still-open assigned tickets, for the My Tickets badge.
  const [assignedCount, setAssignedCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const loadCount = () => {
      fetch(`${API_URL}/ict/admin/tickets/assigned/mine/count`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => { if (!cancelled && res && typeof res.count === "number") setAssignedCount(res.count); })
        .catch(() => {});
    };
    loadCount();
    // Re-check on every route change (e.g. navigating back from a ticket you
    // just resolved) instead of waiting out the rest of the 60s poll — that's
    // what made the badge look stuck after resolving/reassigning a ticket.
    // Ticket actions also dispatch this event directly so the badge updates
    // immediately even without a navigation in between.
    window.addEventListener("ict:assigned-count-changed", loadCount);
    const interval = window.setInterval(loadCount, 60000);
    return () => {
      cancelled = true;
      window.removeEventListener("ict:assigned-count-changed", loadCount);
      window.clearInterval(interval);
    };
  }, [pathname]);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [capabilities, setCapabilities] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Same-origin /api so HttpOnly cookie is sent; Bearer remains dual-read backup.
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: getAdminAuthHeaders(),
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : null)
      .then(freshUser => {
        if (freshUser) {
          // Update localStorage with fresh data (including permissions)
          localStorage.setItem('ouk_admin_user', JSON.stringify(freshUser));
          setUserProfile(freshUser);
          setCapabilities(buildCapabilities(freshUser));
        } else {
          // Fallback to cached localStorage if /auth/me fails
          const cached = getUser();
          if (cached) {
            setUserProfile(cached);
            setCapabilities(buildCapabilities(cached));
          }
        }
      })
      .catch(() => {
        // Network error fallback to localStorage
        const cached = getUser();
        if (cached) {
          setUserProfile(cached);
          setCapabilities(buildCapabilities(cached));
        }
      });
  }, []);

  const visibleSections = React.useMemo(
    () => filterSectionsByPermissions(menuSections, userProfile, capabilities),
    [menuSections, userProfile, capabilities]
  );

  useEffect(() => {
    visibleSections.forEach((section) => {
      const hasActive = section.items?.some((item: any) => {
        if (item.children?.length) {
          return item.children.some(
            (child: any) =>
              child.href &&
              (pathname === child.href || pathname.startsWith(child.href + "/")),
          );
        }
        return item.href && (pathname === item.href || pathname.startsWith(item.href + "/"));
      });
      if (hasActive) setOpenSection(section.title);
    });
  }, [pathname, visibleSections]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || HelpCircle;
    return <Icon size={18} />;
  };

  const flattenNavItems = (items: any[]): any[] => {
    const out: any[] = [];
    for (const item of items || []) {
      if (item.children?.length) out.push(...item.children);
      else out.push(item);
    }
    return out;
  };

  const renderNavLink = (item: any, opts?: { nested?: boolean }) => {
    if (!item.href) return null;
    // Desk roots (/admin/ict, /admin/helpdesk) should not stay highlighted on
    // specialised tool routes like /admin/ict/management or /admin/ict/status.
    const deskRoots = ["/admin/ict", "/admin/helpdesk"];
    const isDeskRoot = deskRoots.includes(item.href);
    const isActive = isDeskRoot
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center space-x-3 transition-all relative",
          opts?.nested ? "pl-10 pr-6 py-2.5" : "px-6 py-3",
          isActive ? "text-white" : "text-slate-400 hover:text-white",
        )}
      >
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-white/5 z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {isActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary z-10 shadow-[0_0_15px_rgba(3,123,144,0.5)]"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div
          className={cn(
            "p-2 transition-all relative z-10",
            isActive
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-primary",
          )}
        >
          {getIcon(item.icon)}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest leading-none relative z-10">
          {item.label}
        </span>
        {(item.href === "/admin/helpdesk" || item.href === "/admin/ict" || item.href === "/admin/my-tickets") && assignedCount > 0 && (
          <span className="ml-auto relative z-10 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-black">
            {assignedCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 320 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="bg-primary-darker text-white flex flex-col border-r border-slate-800 shadow-2xl relative z-20 overflow-hidden shrink-0 h-screen sticky top-0"
    >
      {/* Sidebar Background Pulse */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative border-b border-slate-800">
        <div className={cn("flex items-center gap-3 px-4 py-5", collapsed ? "justify-center" : "justify-between")}>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <Link href="/admin" className="block group">
                  <h1 className="text-xl font-black tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">OUK Panel</h1>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1.5">Admin Orchestrator</p>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse / expand widget */}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-primary hover:text-white transition-all shrink-0"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-8">
        <nav className="space-y-4 px-4">
          {collapsed
            ? visibleSections.map((section) => (
                <div
                  key={section.id || section.title}
                  className="space-y-1 pb-2 mb-1 border-b border-slate-800/40 last:border-0"
                >
                  {flattenNavItems(section.items).map((item: any) => {
                    if (!item.href) return null;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className="group flex items-center justify-center py-2 relative"
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary shadow-[0_0_15px_rgba(3,123,144,0.5)]" />
                        )}
                        <div
                          className={cn(
                            "p-2 transition-all",
                            isActive
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-primary"
                          )}
                        >
                          {getIcon(item.icon)}
                        </div>
                        {(item.href === "/admin/helpdesk" || item.href === "/admin/ict" || item.href === "/admin/my-tickets") && assignedCount > 0 && (
                          <span className="absolute top-1 right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[8px] font-black ring-2 ring-primary-darker">
                            {assignedCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))
            : visibleSections.map((section) => (
            <div key={section.id || section.title} className="space-y-2">
              <div 
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between px-6 py-3 cursor-pointer group hover:bg-white/5 transition-colors rounded-none border-l-2 border-transparent hover:border-primary"
              >
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                  {section.title}
                </h4>
                <motion.div
                  animate={{ rotate: openSection === section.title ? 0 : -90, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ChevronDown size={14} className="text-slate-600 group-hover:text-primary transition-colors" />
                </motion.div>
              </div>

              <AnimatePresence initial={false}>
                {openSection === section.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 space-y-1">
                      {section.items?.map((item: any) => {
                        if (item.children?.length) {
                          const submenuOpen = openSubmenus[item.label] !== false;
                          const childActive = item.children.some(
                            (child: any) =>
                              child.href &&
                              (pathname === child.href || pathname.startsWith(child.href + "/")),
                          );
                          return (
                            <div key={item.label} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleSubmenu(item.label)}
                                className={cn(
                                  "w-full group flex items-center space-x-3 px-6 py-3 transition-all relative text-left",
                                  childActive ? "text-white" : "text-slate-400 hover:text-white",
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-2 transition-all relative z-10",
                                    childActive
                                      ? "bg-primary/80 text-white"
                                      : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-800 group-hover:text-primary",
                                  )}
                                >
                                  {getIcon(item.icon)}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none relative z-10 flex-1">
                                  {item.label}
                                </span>
                                <ChevronDown
                                  size={12}
                                  className={cn(
                                    "text-slate-600 transition-transform",
                                    submenuOpen ? "rotate-0" : "-rotate-90",
                                  )}
                                />
                              </button>
                              <AnimatePresence initial={false}>
                                {submenuOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    {item.children.map((child: any) => renderNavLink(child, { nested: true }))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        }
                        return renderNavLink(item);
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {loading && (
            <div className="px-10 py-20 text-center flex flex-col items-center">
              <Loader2 size={24} className="animate-spin text-primary mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Intelligence...</p>
            </div>
          )}
        </nav>
      </div>

      <div className={cn("border-t border-slate-800 bg-primary-darker/50 relative", collapsed ? "p-3" : "p-6")}>
        <Link
          href="/"
          target="_blank"
          title="View Public Site"
          className={cn(
            "flex items-center w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all font-black text-[10px] uppercase tracking-widest group mb-2",
            collapsed ? "justify-center py-3" : "space-x-4 px-6 py-4"
          )}
        >
          <LucideIcons.Globe size={18} className="group-hover:rotate-12 transition-transform shrink-0" />
          {!collapsed && <span>View Public Site</span>}
        </Link>
        <button
          onClick={onLogout}
          title="Sign out"
          className={cn(
            "flex items-center w-full text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all font-black text-[10px] uppercase tracking-widest group",
            collapsed ? "justify-center py-3" : "space-x-4 px-6 py-4"
          )}
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
