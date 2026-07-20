"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  GraduationCap, 
  Library, 
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function StudentAcademics() {
  const t = useTranslations("Students");

  const academicResources = [
    { title: t("resProgrammes"), icon: GraduationCap, desc: t("resProgrammesDesc"), link: "/programmes" },
    { title: t("resTimetables"), icon: Clock, desc: t("resTimetablesDesc"), link: "/academics/timetables" },
    { title: t("resCalendar"), icon: Calendar, desc: t("resCalendarDesc"), link: "/academics" },
    { title: t("resLibrary"), icon: Library, desc: t("resLibraryDesc"), link: "/library" },
    { title: t("resExams"), icon: FileCheck, desc: t("resExamsDesc"), link: "/students/academics" },
  ];

  const labs = [
    { title: t("labAi"), students: t("labActive", { count: "120+" }) },
    { title: t("labCyber"), students: t("labActive", { count: "85+" }) },
    { title: t("labBlockchain"), students: t("labActive", { count: "45+" }) },
    { title: t("labBusiness"), students: t("labActive", { count: "210+" }) },
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-darker pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("academicsEyebrow")}</h2>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{t("academicsTitle")} <span className="text-secondary not-italic">{t("academicsTitleAccent")}</span></h1>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {academicResources.map((res, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="p-10 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group"
                 >
                    <res.icon className="text-primary mb-8" size={40} />
                    <h4 className="text-2xl font-black uppercase tracking-tight text-primary-dark mb-4">{res.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8 italic">{res.desc}</p>
                    <Link href={res.link} className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                       <span>{t("exploreResource", { title: res.title })}</span>
                       <ChevronRight size={14} />
                    </Link>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-100">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-primary-darker p-12 md:p-20 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                  <BookOpen size={200} />
               </div>
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                     <h3 className="text-4xl font-black uppercase tracking-tighter italic">{t("labsTitle")} <span className="text-secondary not-italic">{t("labsTitleAccent")}</span></h3>
                     <p className="text-slate-400 text-lg leading-relaxed">{t("labsBody")}</p>
                     <button className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                        {t("launchLab")}
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {labs.map((lab, i) => (
                       <div key={i} className="p-6 bg-white/5 border border-white/10 space-y-2">
                          <h4 className="text-lg font-black uppercase tracking-tight text-white">{lab.title}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{lab.students}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
