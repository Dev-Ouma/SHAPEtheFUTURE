"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home,
  BookOpen,
  LifeBuoy,
  Users,
  Link as LinkIcon,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const t = useTranslations("Students");
  const pathname = usePathname();

  const menuItems = [
    { name: t("navHome"), href: "/students", icon: Home },
    { name: t("navAcademics"), href: "/students/academics", icon: BookOpen },
    { name: t("navSupport"), href: "/students/support", icon: LifeBuoy },
    { name: t("navCampusLife"), href: "/students/campus-life", icon: Users },
    { name: t("navConnect"), href: "/students/connect", icon: LinkIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 sticky top-20 z-40 hidden md:block">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive ? "text-primary" : "text-slate-400 hover:text-primary"
                    }`}
                  >
                    <item.icon size={14} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeStudentTab"
                        className="absolute -bottom-[22px] left-0 right-0 h-1 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-white border-b border-slate-100 p-4 sticky top-16 z-40 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex space-x-6 px-2">
           {menuItems.map((item) => (
             <Link
               key={item.href}
               href={item.href}
               className={`text-[9px] font-black uppercase tracking-widest ${
                 pathname === item.href ? "text-primary" : "text-slate-400"
               }`}
             >
               {item.name}
             </Link>
           ))}
        </div>
      </div>

      <main>{children}</main>

      <section className="py-24 bg-primary-darker text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-40 opacity-5 pointer-events-none">
            <GraduationCap size={400} />
         </div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-left space-y-12">
            <div className="space-y-4 max-w-2xl">
               <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic text-secondary">
                  {t("footerTitle")} <br/> <span className="text-white not-italic">{t("footerTitleAccent")}</span>
               </h2>
               <p className="text-slate-400 font-medium">{t("footerBody")}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
               <Link href="/students/support" className="w-full md:w-auto px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                  {t("getSupport")}
               </Link>
               <Link href="/students/downloads" className="w-full md:w-auto px-12 py-5 border-2 border-white/20 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all">
                  {t("resourcesForms")}
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
