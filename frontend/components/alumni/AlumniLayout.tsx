"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  Home,
  Users,
  Handshake,
  Briefcase,
  MessageSquare,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

interface AlumniLayoutProps {
  children: React.ReactNode;
}

export default function AlumniLayout({ children }: AlumniLayoutProps) {
  const t = useTranslations("Alumni");
  const pathname = usePathname();

  const menuItems = [
    { name: t("navHome"), href: "/alumni", icon: Home },
    { name: t("navAbout"), href: "/alumni/about", icon: Info },
    { name: t("navDirectory"), href: "/alumni/community/directory", icon: Users },
    { name: t("navMentorship"), href: "/alumni/community/mentorship", icon: Handshake },
    { name: t("navCareers"), href: "/alumni/opportunities/jobs", icon: Briefcase },
    { name: t("navEvents"), href: "/alumni/connect/events", icon: MessageSquare },
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
                    className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive ? "text-primary" : "text-slate-400 hover:text-primary"
                    }`}
                  >
                    <item.icon size={14} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/alumni/join"
                className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary/20"
              >
                {t("joinNetwork")}
              </Link>
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
         <div className="absolute top-0 right-0 p-40 opacity-10 pointer-events-none">
            <Handshake size={400} />
         </div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center space-y-12">
            <div className="space-y-4 max-w-2xl mx-auto">
               <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                  {t("footerTitle")} <br/> <span className="text-secondary not-italic">{t("footerTitleAccent")}</span>
               </h2>
               <p className="text-slate-400 font-medium">{t("footerBody")}</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
               <Link href="/alumni/join" className="w-full md:w-auto px-12 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                  {t("registerNow")}
               </Link>
               <Link href="/alumni/donate" className="w-full md:w-auto px-12 py-5 border-2 border-white/20 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-primary-dark transition-all">
                  {t("giveBack")}
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
}
