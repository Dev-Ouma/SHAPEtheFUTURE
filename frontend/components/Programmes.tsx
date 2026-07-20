"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { 
  Code, 
  Briefcase, 
  ArrowRight, 
  BookOpen, 
  GraduationCap
} from "lucide-react";
import { getSchools } from "@/lib/api";
import DiscoverySearch from "./DiscoverySearch";
import { useLocale, useTranslations } from "next-intl";

type SchoolsProps = { initialSchools?: any[] };

const Schools = ({ initialSchools }: SchoolsProps = {}) => {
  const t = useTranslations("Home");
  const locale = useLocale();
  const hasServerData = Array.isArray(initialSchools);
  const [schools, setSchools] = useState<any[]>(
    Array.isArray(initialSchools) ? initialSchools : [],
  );

  useEffect(() => {
    if (hasServerData) {
      setSchools(Array.isArray(initialSchools) ? initialSchools : []);
      return;
    }
    const fetchInitialData = async () => {
      const schoolData = await getSchools(locale);
      const schoolDataTyped = schoolData as any;
      if (schoolData) {
        setSchools(Array.isArray(schoolDataTyped) ? schoolDataTyped : (schoolDataTyped?.data || []));
      }
    };
    fetchInitialData();
  }, [locale, hasServerData, initialSchools]);

  const displaySchoolName = (name: string) =>
    name
      .replace(/^School of\s+/i, "")
      .replace(/^Shule ya\s+/i, "");

  return (
    <section className="bg-slate-50 py-32 relative overflow-hidden" id="programmes">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto mb-24 relative">
           <motion.div 
             initial={{ opacity: 0, y: 15 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-center mb-10"
           >
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t("discoveryEyebrow")}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-primary-darker mb-6 font-serif leading-tight">
                {t("discoveryTitle")} <br /> <span className="text-primary">{t("discoveryTitleAccent")}</span>
              </h2>
           </motion.div>

           <DiscoverySearch theme="light" animate={false} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-16">
          <Link 
            href="/programmes"
            className="flex items-center space-x-3 px-8 py-4 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg group"
          >
            <GraduationCap size={16} className="group-hover:scale-110 transition-transform" />
            <span>{t("browseProgrammes")}</span>
            <ArrowRight size={14} />
          </Link>
          <Link 
            href="/academics/professional-development-courses"
            className="flex items-center space-x-3 px-8 py-4 bg-white border-2 border-slate-200 text-primary-darker text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors shadow-sm group"
          >
            <BookOpen size={16} className="group-hover:scale-110 transition-transform" />
            <span>{t("shortCoursesCatalog")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="text-center mb-12">
          <span className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-3 block">{t("facultyEyebrow")}</span>
          <h3 className="text-3xl font-bold text-primary-darker font-serif">{t("schoolsTitle")} <span className="text-primary font-normal">{t("schoolsTitleAccent")}</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {schools.map((school, index) => (
            <Link key={school.id || index} href={`/programmes?school=${school.slug}`} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-slate-100 group-hover:border-[#ff7f50] transition-all duration-300 text-center flex flex-col items-center hover:shadow-xl"
              >
                <div className="mb-6 p-5 bg-slate-50 text-primary-darker group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all">
                  {school.slug === 'school-of-science-technology' ? <Code size={28} /> : 
                   school.slug === 'school-of-business-economics' ? <Briefcase size={28} /> : 
                   <GraduationCap size={28} />}
                </div>
                
                <h3 className="text-lg font-bold text-primary-darker mb-4 tracking-tight leading-tight">
                  {displaySchoolName(school.name || "")}
                </h3>
                
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2 mb-8 h-8">
                   {school.description}
                </p>
                
                <div className="pt-6 border-t border-slate-50 w-full flex items-center justify-center space-x-2 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                  <span>{t("exploreFaculty")}</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Schools;
