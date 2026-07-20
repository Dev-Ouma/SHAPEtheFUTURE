"use client";

import React, { useState, useEffect } from "react";
import { 
  Linkedin, 
  Clock, 
  Zap, 
  Users, 
  RefreshCw,
  Award,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { API_URL, resolveImageUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";

export default function AlumniMentorship() {
  const t = useTranslations("Alumni");
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/alumni/mentors`)
      .then(r => r.json())
      .then(data => {
        setMentors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const steps = [
    { step: "01", title: t("stepReg"), desc: t("stepRegDesc") },
    { step: "02", title: t("stepMatch"), desc: t("stepMatchDesc") },
    { step: "03", title: t("stepBook"), desc: t("stepBookDesc") },
    { step: "04", title: t("stepConnect"), desc: t("stepConnectDesc") },
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-dark py-24 text-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-10">
                  <div className="inline-flex items-center space-x-3 text-secondary">
                    <div className="w-12 h-px bg-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("mentorEyebrow")}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                     {t("mentorHeroTitle")} <br/> <span className="text-secondary not-italic">{t("mentorHeroAccent")}</span>
                  </h1>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg border-l-4 border-slate-800 pl-8">
                     {t("mentorHeroBody")}
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                       {t("becomeMentor")}
                    </button>
                    <button className="px-10 py-5 border-2 border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-primary-dark transition-all">
                       {t("findMentor")}
                    </button>
                  </div>
               </div>
               <div className="hidden lg:grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                     <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                        <Users className="text-secondary" size={32} />
                        <h4 className="text-xl font-black uppercase tracking-tight">{t("communityLed")}</h4>
                        <p className="text-sm text-slate-500 font-medium italic">{t("communityLedDesc")}</p>
                     </div>
                     <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                        <Award className="text-secondary" size={32} />
                        <h4 className="text-xl font-black uppercase tracking-tight">{t("industryFocus")}</h4>
                        <p className="text-sm text-slate-500 font-medium italic">{t("industryFocusDesc")}</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="p-8 bg-secondary text-white rounded-3xl space-y-4">
                        <Zap size={32} />
                        <h4 className="text-xl font-black uppercase tracking-tight">{t("fastTrack")}</h4>
                        <p className="text-white/80 text-sm font-medium italic">{t("fastTrackDesc")}</p>
                     </div>
                     <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                        <CheckCircle2 className="text-secondary" size={32} />
                        <h4 className="text-xl font-black uppercase tracking-tight">{t("verifiedSkills")}</h4>
                        <p className="text-sm text-slate-500 font-medium italic">{t("verifiedSkillsDesc")}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-16">
               <div className="text-left space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("expertGuidance")}</h2>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark">{t("activeMentors")}</h3>
               </div>

               {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                    <RefreshCw className="animate-spin text-primary" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("loadingMentors")}</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     {mentors.map((mentor) => (
                       <motion.div 
                         key={mentor.id}
                         whileHover={{ scale: 1.02 }}
                         className="bg-slate-50 border border-slate-100 p-12 shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row gap-12 items-center"
                       >
                          <div className="relative w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-xl shrink-0">
                             <SafeImage
                               src={resolveImageUrl(mentor.alumni?.image_url)}
                               alt={mentor.alumni?.name || "Mentor"}
                               fill
                               sizes="160px"
                               className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                             />
                          </div>
                          <div className="flex-1 space-y-6">
                             <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">{mentor.alumni?.programme} • {mentor.alumni?.graduationYear}</span>
                                <h4 className="text-3xl font-black uppercase tracking-tight text-primary-dark">{mentor.alumni?.name}</h4>
                                <p className="text-xs font-bold text-slate-400 italic">{t("expertise", { value: mentor.expertise })}</p>
                             </div>
                             
                             <div className="flex items-center space-x-3 text-slate-400">
                                <Clock size={16} className="text-secondary" />
                                <span className="text-xs font-medium italic">{mentor.availability}</span>
                             </div>

                             <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <a href={mentor.alumni?.linkedIn} target="_blank" className="text-slate-400 hover:text-primary transition-colors">
                                   <Linkedin size={20} />
                                </a>
                                <button className="px-8 py-3 bg-primary-dark text-white text-[9px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl">
                                   {t("requestSession")}
                                </button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-100">
         <div className="container mx-auto px-6 max-w-7xl space-y-16">
            <div className="text-left space-y-6">
               <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark">{t("howItWorks")}</h3>
               <p className="text-lg text-slate-500 font-medium leading-relaxed">{t("howItWorksBody")}</p>
            </div>

            <div className="space-y-4">
               {steps.map((item, i) => (
                 <div key={i} className="p-8 bg-white border border-slate-100 flex items-center gap-8 group">
                    <span className="text-4xl font-black text-slate-100 group-hover:text-secondary transition-colors font-serif italic">{item.step}</span>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black uppercase tracking-tight text-primary-dark">{item.title}</h4>
                       <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
