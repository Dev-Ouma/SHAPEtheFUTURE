"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import {
  Building2,
  Workflow,
  Target,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function LeadershipPageClient({ initialMembers = [] }: { initialMembers?: any[] }) {
  const t = useTranslations("Leadership");

  const breadcrumbs = [
    { title: t("crumbAbout"), link: "/about" },
    { title: t("crumbLeadership"), link: "/about/leadership" },
  ];

  const features = [
    {
      title: t("featCurriculum"),
      desc: t("featCurriculumDesc"),
      icon: <Target size={20} className="text-secondary" />,
    },
    {
      title: t("featStandards"),
      desc: t("featStandardsDesc"),
      icon: <ShieldCheck size={20} className="text-secondary" />,
    },
    {
      title: t("featResearch"),
      desc: t("featResearchDesc"),
      icon: <Workflow size={20} className="text-secondary" />,
    },
    {
      title: t("featFaculty"),
      desc: t("featFacultyDesc"),
      icon: <Building2 size={20} className="text-secondary" />,
    },
  ];

  return (
    <PageLayout
      title={t("pageTitle")}
      summary={t("pageSummary")}
      breadcrumbs={breadcrumbs}
      bannerImage="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop"
      isWide={true}
    >
      <div className="space-y-32">
        <section>
          <PersonnelGrid
            executiveType="University Management Board"
            title={t("gridTitle")}
            subtitle={t("gridSubtitle")}
            initialMembers={initialMembers}
          />
        </section>

        <section className="bg-primary-darker -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none text-secondary select-none">
            <Award size={600} strokeWidth={1} />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-4">
                <div className="w-12 h-px bg-secondary" />
                <span className="text-secondary font-black uppercase tracking-[0.4em] text-[11px]">
                  {t("mandateBadge")}
                </span>
              </div>

              <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter font-serif leading-[0.85]">
                {t("pioneering")} <br />
                <span className="text-secondary italic lowercase">{t("the")}</span>{" "}
                {t("future")} <br />
                <span className="italic lowercase">{t("of")}</span> {t("learning")}
              </h2>

              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {t("mandateBody")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="py-2 px-5 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5">
                  {t("chipPedagogy")}
                </div>
                <div className="py-2 px-5 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5">
                  {t("chipResearch")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border border-white/10 p-10 space-y-6 hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-black uppercase tracking-tight text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
