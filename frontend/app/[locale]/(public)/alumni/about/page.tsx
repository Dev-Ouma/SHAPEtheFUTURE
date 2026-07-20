"use client";

import React, { useState, useEffect } from "react";
import AlumniLayout from "@/components/alumni/AlumniLayout";
import { Award, Target, Users, RefreshCw, Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getSettings } from "@/lib/api";

export default function AlumniAboutPage() {
  const t = useTranslations("Alumni");
  const locale = useLocale();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings(locale).then(data => {
       setSettings(data);
       setLoading(false);
    });
  }, [locale]);

  if (loading) {
    return (
      <AlumniLayout>
         <div className="flex justify-center items-center h-screen bg-white">
            <RefreshCw className="animate-spin text-primary" size={48} />
         </div>
      </AlumniLayout>
    );
  }

  const pillars = [
    { title: t("pillEngagement"), desc: t("pillEngagementDesc"), icon: Users },
    { title: t("pillMentorship"), desc: t("pillMentorshipDesc"), icon: Award },
    { title: t("pillInnovation"), desc: t("pillInnovationDesc"), icon: Target },
    { title: t("pillPhilanthropy"), desc: t("pillPhilanthropyDesc"), icon: Heart },
  ];

  return (
    <AlumniLayout>
      <div className="bg-primary-dark pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("aboutPageEyebrow")}</h2>
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic">{t("aboutPageTitle")} <span className="text-secondary not-italic">{t("aboutPageAccent")}</span></h1>
            </div>
         </div>
      </div>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark">{t("ourMission")}</h3>
                     <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        {settings.alumni_mission || t("missionFallback")}
                     </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {pillars.map((item, i) => (
                       <div key={i} className="p-8 bg-slate-50 border border-slate-100 space-y-4">
                          <item.icon className="text-secondary" size={24} />
                          <h4 className="text-lg font-black uppercase tracking-tight text-primary-dark">{item.title}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="relative">
                  <img src="https://images.unsplash.com/photo-1523050853064-85583a697f90?q=80&w=1920" className="rounded-3xl shadow-2xl grayscale" alt="" />
                  <div className="absolute -bottom-10 -left-10 p-10 bg-white shadow-2xl border border-slate-100 hidden md:block">
                     <p className="text-4xl font-black italic text-primary font-serif">{settings.alumni_ambassadors_count || "12,000+"}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("ambassadorsGlobally")}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </AlumniLayout>
  );
}
