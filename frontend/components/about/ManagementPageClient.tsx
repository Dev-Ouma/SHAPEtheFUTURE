"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import {
  Briefcase,
  Workflow,
  Zap,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
  Settings,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function ManagementPageClient({ initialMembers = [] }: { initialMembers?: any[] }) {
  const t = useTranslations("Management");

  const breadcrumbs = [
    { title: t("crumbAbout"), link: "/about" },
    { title: t("crumbManagement"), link: "/about/management" },
  ];

  const features = [
    {
      title: t("featAdmin"),
      desc: t("featAdminDesc"),
      icon: <Layers size={20} className="text-secondary" />,
    },
    {
      title: t("featTech"),
      desc: t("featTechDesc"),
      icon: <Zap size={20} className="text-secondary" />,
    },
    {
      title: t("featFiscal"),
      desc: t("featFiscalDesc"),
      icon: <Briefcase size={20} className="text-secondary" />,
    },
    {
      title: t("featStudent"),
      desc: t("featStudentDesc"),
      icon: <ShieldCheck size={20} className="text-secondary" />,
    },
  ];

  const ecosystem = [
    {
      title: t("ecoPortal"),
      desc: t("ecoPortalDesc"),
      icon: <Cpu className="text-secondary" size={36} />,
      link: "/portal",
      color: "bg-secondary",
      external: false,
    },
    {
      title: t("ecoCampus"),
      desc: t("ecoCampusDesc"),
      icon: <Workflow className="text-primary" size={36} />,
      link: "https://lms.ouk.ac.ke",
      color: "bg-primary",
      external: true,
    },
    {
      title: t("ecoSupport"),
      desc: t("ecoSupportDesc"),
      icon: <Settings className="text-slate-400" size={36} />,
      link: "/about/services",
      color: "bg-slate-400",
      external: false,
    },
  ];

  return (
    <PageLayout
      title={t("pageTitle")}
      summary={t("pageSummary")}
      breadcrumbs={breadcrumbs}
      bannerImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop"
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
            <Settings size={600} strokeWidth={1} />
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
                {t("execution")} <br />
                <span className="text-secondary italic lowercase">{t("atThe")}</span>{" "}
                <br />
                {t("speedOfTech")}
              </h2>

              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {t("mandateBody")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="py-2 px-5 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5">
                  {t("chipAgile")}
                </div>
                <div className="py-2 px-5 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5">
                  {t("chipDigital")}
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

        <section className="py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">
                {t("opsBadge")}
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-none">
                {t("ecosystemTitle")}
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">{t("ecosystemBody")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {ecosystem.map((func, i) => {
              const cardClass =
                "group flex flex-col items-start bg-slate-50 p-12 border border-slate-100 hover:bg-white hover:shadow-[30px_30px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-3 transition-all duration-700";
              const inner = (
                <>
                  <div className="mb-10 w-20 h-20 bg-white flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
                    {func.icon}
                  </div>
                  <div className="mt-auto space-y-6">
                    <div
                      className={`h-1 w-12 ${func.color} opacity-30 group-hover:w-full group-hover:opacity-100 transition-all duration-700`}
                    />
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-primary-darker leading-none">
                      {func.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {func.desc}
                    </p>
                    <div className="pt-4 flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
                      <span>{t("initiateProtocol")}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </>
              );

              if (func.external) {
                return (
                  <a key={i} href={func.link} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {inner}
                  </a>
                );
              }

              return (
                <Link key={i} href={func.link} className={cardClass}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="bg-primary-darker py-24 px-12 rounded-sm text-center space-y-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              {t("ctaDemocratizing")} <br />
              <span className="italic lowercase">{t("ctaThe")}</span> {t("ctaFuture")}{" "}
              <br />
              <span className="italic lowercase">{t("ctaOf")}</span> {t("ctaLearning")}
            </h2>
            <p className="text-white/70 font-medium text-lg max-w-xl mx-auto uppercase tracking-widest text-[10px]">
              {t("ctaGateway")}
            </p>
            <div className="pt-4">
              <Link href="/admissions" className="relative z-10">
                <button className="bg-primary !text-white px-16 py-7 text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-3xl shadow-primary/20">
                  {t("joinUniversity")}
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
