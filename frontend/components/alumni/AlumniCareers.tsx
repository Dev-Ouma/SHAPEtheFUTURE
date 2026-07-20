"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  RefreshCw,
  Building2,
  Calendar,
  Share2,
  Bookmark,
  ExternalLink,
  Target,
  Zap,
  Globe,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { API_URL, getSettings } from "@/lib/api";

export default function AlumniCareers() {
  const t = useTranslations("Alumni");
  const locale = useLocale();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch(`${API_URL}/alumni/careers`)
      .then(r => r.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    getSettings(locale).then(data => setSettings(data));
  }, [locale]);

  const features = [
    { title: t("alumniReferrals"), icon: Building2, desc: t("alumniReferralsDesc") },
    { title: t("directPlacements"), icon: Target, desc: t("directPlacementsDesc") },
    { title: t("globalReach"), icon: Globe, desc: t("globalReachDesc") },
  ];

  const supportItems = [
    t("cvReview"),
    t("mockInterview"),
    t("brandingWebinars"),
    t("negotiationHub"),
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-dark py-32 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-left space-y-12">
            <div className="space-y-6 max-w-3xl">
               <div className="inline-flex items-center space-x-3 text-secondary">
                  <div className="w-12 h-px bg-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("careersPageEyebrow")}</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic">
                  {t("careersHeroTitle")} <br/> <span className="text-secondary not-italic">{t("careersHeroAccent")}</span>
               </h1>
               <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  {settings.alumni_jobs_hero || t("careersHeroFallback")}
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl pt-12">
               {features.map((feature, i) => (
                 <div key={i} className="p-10 bg-white/5 border border-white/10 space-y-6 text-left group hover:bg-white/10 transition-all">
                    <feature.icon className="text-secondary" size={32} />
                    <h4 className="text-xl font-black uppercase tracking-tight">{feature.title}</h4>
                    <p className="text-sm text-slate-500 font-medium italic">{feature.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <section className="py-32 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
               <div className="lg:col-span-2 space-y-12">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-primary-dark italic">{t("currentOpportunities")} <span className="text-secondary not-italic">{t("currentOpportunitiesAccent")}</span></h3>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("positionsAvailable", { count: jobs.length })}</span>
                  </div>

                  {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-6">
                       <RefreshCw className="animate-spin text-primary" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("syncingJobs")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {jobs.map((job, i) => (
                         <motion.div 
                           key={job.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="p-10 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group flex flex-col md:flex-row gap-8 items-start"
                         >
                            <div className="p-6 bg-white shadow-xl text-primary-dark group-hover:bg-primary-dark group-hover:text-white transition-all shrink-0">
                               <Building2 size={32} />
                            </div>
                            <div className="flex-1 space-y-6">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-2">
                                     <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-[8px] font-black uppercase tracking-widest">{job.type}</span>
                                        <div className="flex items-center gap-1 text-slate-400">
                                           <MapPin size={12} />
                                           <span className="text-[9px] font-bold uppercase tracking-widest">{job.location}</span>
                                        </div>
                                     </div>
                                     <h4 className="text-3xl font-black uppercase tracking-tight text-primary-dark group-hover:text-secondary transition-colors">{job.title}</h4>
                                     <p className="text-sm font-bold text-slate-400 italic">{job.company}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <button className="p-3 text-slate-300 hover:text-primary transition-colors border border-slate-200"><Bookmark size={18} /></button>
                                     <button className="p-3 text-slate-300 hover:text-primary transition-colors border border-slate-200"><Share2 size={18} /></button>
                                  </div>
                               </div>

                               <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                                  {job.description}
                               </p>

                               <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                  <div className="flex items-center gap-2 text-slate-400">
                                     <Calendar size={14} />
                                     <span className="text-[10px] font-bold uppercase tracking-widest">{t("posted", { date: new Date(job.createdAt).toLocaleDateString() })}</span>
                                  </div>
                                  <a href={job.link} target="_blank" className="px-10 py-4 bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl flex items-center gap-3">
                                     <span>{t("applyViaPortal")}</span>
                                     <ExternalLink size={14} />
                                  </a>
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
               </div>

               <div className="space-y-12">
                  <div className="p-10 bg-slate-900 text-white space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-24 opacity-10 pointer-events-none">
                        <Zap size={100} />
                     </div>
                     <div className="space-y-4 relative z-10">
                        <h4 className="text-xl font-black uppercase tracking-tight text-secondary">{t("referralNetwork")}</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">{t("referralNetworkBody")}</p>
                     </div>
                     <button className="w-full py-4 border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-dark transition-all relative z-10">
                        {t("connectReferrers")}
                     </button>
                  </div>

                  <div className="p-10 border border-slate-100 space-y-10 bg-slate-50/50">
                     <h4 className="text-xl font-black uppercase tracking-tight text-primary-dark">{t("careerSupport")}</h4>
                     <ul className="space-y-6">
                        {supportItems.map((item, i) => (
                          <li key={i} className="flex items-center gap-4 group cursor-pointer">
                             <ChevronRight size={16} className="text-secondary group-hover:translate-x-1 transition-transform" />
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-primary transition-colors">{item}</span>
                          </li>
                        ))}
                     </ul>
                  </div>

                  <div className="bg-secondary p-12 text-white space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-3xl font-black uppercase tracking-tighter italic">{t("partnerWithUs")} <br/> {t("partnerWithUsAccent")}</h4>
                        <p className="text-white/70 text-sm font-medium">{t("partnerBody")}</p>
                     </div>
                     <button className="px-8 py-4 bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-dark transition-all">
                        {t("employerPortal")}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
