"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { getMenus } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface SectionSidebarProps {
  parentSlug: string; // e.g. 'about'
}

const SectionSidebar: React.FC<SectionSidebarProps> = ({ parentSlug }) => {
  const t = useTranslations("CmsChrome");
  const pathname = usePathname();
  const locale = useLocale();
  const [links, setLinks] = useState<any[]>([]);
  const [parentTitle, setParentTitle] = useState("");

  useEffect(() => {
    fetchLinks();
  }, [parentSlug, locale]);

  const fetchLinks = async () => {
    const menus = await getMenus("header", locale);
    if (menus) {
      // Find the parent menu item that matches the parentSlug or contains the current slug
      const parent = menus.find((m: any) => m.slug === parentSlug || m.slug === parentSlug.split('/')[0]);
      if (parent) {
        setParentTitle(parent.title);
        setLinks(parent.children || []);
      }
    }
  };

  if (links.length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-4 border-l-4 border-primary">
            {t("sectionNavigation")}
         </h3>
         <h2 className="text-3xl font-black text-primary-darker font-serif lowercase -tracking-widest">
            {parentTitle}.
         </h2>
      </div>

      <nav className="flex flex-col border-t border-slate-100 divide-y divide-slate-50">
        {links.map((link) => {
          const href = link.link || `/${link.slug}`;
          const isActive = pathname === href;
          
          return (
            <Link 
              key={link.id} 
              href={href}
              className={`flex items-center justify-between p-6 transition-all group ${
                isActive ? "bg-primary-darker text-white" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <div className="flex items-center space-x-4">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-primary" : "text-slate-300 group-hover:text-primary"}`}>
                   {isActive ? "0" : ""}{links.indexOf(link) + 1}
                 </span>
                 <span className="text-xs font-black uppercase tracking-[0.1em]">{link.title}</span>
              </div>
              <ArrowRight size={14} className={`transition-transform ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </Link>
          );
        })}
      </nav>

      {/* Quick Help Card */}
      <div className="bg-primary p-8 text-white space-y-4 shadow-xl">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">{t("needAssistance")}</h4>
         <p className="text-xs font-bold leading-relaxed">
            {t("assistanceBody")}
         </p>
         <Link href="/contact" className="inline-block text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1 hover:text-white transition-colors">
            {t("contactSupport")}
         </Link>
      </div>
    </div>
  );
};

export default SectionSidebar;
