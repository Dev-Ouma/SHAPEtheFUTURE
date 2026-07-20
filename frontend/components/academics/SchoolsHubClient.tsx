"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ArrowRight, 
  Building2, 
  Users, 
  GraduationCap, 
  Globe, 
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  ArrowUpRight
} from "lucide-react";
import { getApiCached, resolveImageUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function computeStats(list: any[]) {
  return {
    schools: list.length,
    programmes: list.reduce((acc: number, s: any) => acc + (s.programmes?.length || 0), 0),
    departments: list.reduce((acc: number, s: any) => acc + (s.departments?.length || 0), 0),
  };
}

export default function SchoolsHubClient({ initialSchools = [] }: { initialSchools?: any[] }) {
  const t = useTranslations("Academics");
  const seeded = Array.isArray(initialSchools) ? initialSchools : [];
  const [schools, setSchools] = useState<any[]>(seeded);
  const [loading, setLoading] = useState(seeded.length === 0);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState(() => computeStats(seeded));

  useEffect(() => {
    if (seeded.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getApiCached("/schools", { revalidate: 120 });
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (cancelled) return;
        setSchools(list);
        setStats(computeStats(list));
      } catch (err) {
        console.error("Failed to load schools", err);
        if (!cancelled) setSchools([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [seeded.length]);

  const filteredSchools = schools.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden bg-primary-darker">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#C8102E_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,#C8102E_0%,transparent_50%)]" />
         </div>
         
         <div className="container mx-auto px-6 relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="max-w-4xl w-full">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex items-center justify-center md:justify-start space-x-3 text-secondary mb-6"
               >
                  <Zap size={20} className="fill-secondary" />
                  <span className="text-xs font-black uppercase tracking-[0.4em]">{t("eyebrow")}</span>
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-4xl md:text-8xl font-black font-serif italic text-white tracking-tighter leading-none mb-8"
               >
                  {t("schoolsTitle")} <span className="text-primary italic">{t("schoolsTitleAccent")}</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-base md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mb-12 mx-auto md:mx-0"
               >
                  {t("schoolsHeroBody")}
               </motion.p>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="relative max-w-xl group mx-auto md:mx-0 w-full"
               >
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={24} />
                  <input 
                    type="text" 
                    placeholder={t("schoolsSearchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-7 pl-16 rounded-full text-white font-bold outline-none focus:ring-2 focus:ring-primary backdrop-blur-md transition-all placeholder:text-white/20 text-sm md:text-base"
                  />
               </motion.div>
            </div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 border-y border-slate-100 py-12">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               {[
                  { label: t("statAcademicSchools"), value: stats.schools, icon: Building2 },
                  { label: t("statActiveProgrammes"), value: stats.programmes, icon: GraduationCap },
                  { label: t("statSpecializedDepts"), value: stats.departments, icon: Zap },
                  { label: t("statGlobalReach"), value: "24/7", icon: Globe },
               ].map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col space-y-2"
                  >
                     <div className="flex items-center space-x-3 text-primary mb-1">
                        <stat.icon size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                     </div>
                     <span className="text-4xl font-black font-serif italic text-primary-darker tracking-tighter">{stat.value}</span>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Schools Grid */}
      <section className="py-24 md:py-32 bg-white">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {loading ? (
                  Array(6).fill(0).map((_, idx) => (
                     <div key={idx} className="h-[500px] bg-slate-50 rounded-[3rem] animate-pulse" />
                  ))
               ) : (
                  <AnimatePresence>
                     {filteredSchools.map((school, idx) => (
                        <motion.div
                           key={school.id}
                           initial={{ opacity: 0, y: 30 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="group"
                        >
                           <Link href={`/academics/schools/${school.slug}`} className="block h-full">
                              <div className="h-full flex flex-col bg-slate-50 rounded-[3.5rem] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 group">
                                 {/* Card Header (Image/Logo) */}
                                 <div className="h-64 relative overflow-hidden bg-slate-200">
                                    <img 
                                      src={resolveImageUrl(school.banner_image_url) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"} 
                                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                                      alt={school.name} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                    
                                    <div className="absolute bottom-6 left-8 flex items-center space-x-4">
                                       <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-3 relative transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                          {school.logo_url ? <img src={resolveImageUrl(school.logo_url)} className="w-full h-full object-contain" alt="" /> : <Building2 size={24} className="text-primary" />}
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{t("academicPillar")}</span>
                                          <h4 className="text-xl font-black text-white leading-tight">{school.name}</h4>
                                       </div>
                                    </div>
                                    
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 text-white">
                                          <ArrowUpRight size={20} />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Card Content */}
                                 <div className="p-10 flex-1 flex flex-col space-y-8">
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3 italic">
                                       &ldquo;{school.description || t("schoolCardDescFallback")}&rdquo;
                                    </p>

                                    {/* Dean Info */}
                                    <div className="flex items-center space-x-4 p-4 bg-white rounded-[2rem] border border-slate-100">
                                       <div className="w-12 h-12 rounded-full border-2 border-slate-50 overflow-hidden shadow-sm">
                                          {school.dean?.profile_image_url ? (
                                             <img src={resolveImageUrl(school.dean.profile_image_url)} className="w-full h-full object-cover" alt="" />
                                          ) : (
                                             <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><Users size={20} /></div>
                                          )}
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t("deanDirector")}</span>
                                          <span className="text-xs font-black text-primary-darker">{school.dean?.full_name || t("academicLeadership")}</span>
                                       </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                                       <div className="flex items-center space-x-6">
                                          <div className="flex flex-col">
                                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t("programmesLabel")}</span>
                                             <span className="text-sm font-black text-primary-darker">{school.programmes?.length || 0}</span>
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t("departmentsLabel")}</span>
                                             <span className="text-sm font-black text-primary-darker">{school.departments?.length || 0}</span>
                                          </div>
                                       </div>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-2 group-hover:translate-x-1 transition-transform">
                                          <span>{t("details")}</span>
                                          <ArrowRight size={14} />
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               )}
            </div>

            {filteredSchools.length === 0 && !loading && (
               <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                     <Building2 size={48} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black font-serif italic text-primary-darker">{t("noSchoolsMatch")}</h3>
                     <p className="text-slate-400 font-medium">{t("noSchoolsHint")}</p>
                  </div>
                  <button 
                    onClick={() => setSearch("")}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    {t("clearFilter")}
                  </button>
               </div>
            )}
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary-darker text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none">
            <GraduationCap size={400} />
         </div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-12">
               <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-black font-serif italic tracking-tighter leading-tight">
                     {t("beginJourney")} <span className="text-primary italic">{t("beginJourneyAccent")}</span> {t("beginJourneyTail")}
                  </h2>
                  <p className="text-lg text-white/50 font-medium leading-relaxed">
                     {t("beginJourneyBody")}
                  </p>
               </div>
               <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <Link 
                    href="/admissions/how-to-apply"
                    className="w-full md:w-auto bg-primary hover:bg-[#ff7f50] hover:text-white-dark p-7 px-12 rounded-full text-xs font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20"
                  >
                     {t("enrollNow")}
                  </Link>
                  <Link 
                    href="/programmes"
                    className="w-full md:w-auto bg-white/5 hover:bg-white/10 p-7 px-12 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 transition-all"
                  >
                     {t("exploreAllCourses")}
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
