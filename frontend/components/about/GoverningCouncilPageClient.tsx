"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import PersonnelGrid from "@/components/sections/PersonnelGrid";
import {
  BookOpen,
  Globe,
  Zap,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function GoverningCouncilPageClient({ initialMembers = [] }: { initialMembers?: any[] }) {
  const t = useTranslations("GoverningCouncil");

  const breadcrumbs = [
    { title: t("crumbAbout"), link: "/about" },
    { title: t("crumbCouncil"), link: "/about/governing-council" },
  ];

  const duties = [
    { title: t("dutyStrategic"), desc: t("dutyStrategicDesc") },
    { title: t("dutyLegal"), desc: t("dutyLegalDesc") },
    { title: t("dutyFiscal"), desc: t("dutyFiscalDesc") },
    { title: t("dutyHr"), desc: t("dutyHrDesc") },
  ];

  const functions = [
    {
      title: t("funcAcademic"),
      desc: t("funcAcademicDesc"),
      icon: <BookOpen className="text-primary" size={32} />,
      link: "/academics",
    },
    {
      title: t("funcResearch"),
      desc: t("funcResearchDesc"),
      icon: <Zap className="text-secondary" size={32} />,
      link: "/research",
    },
    {
      title: t("funcGlobal"),
      desc: t("funcGlobalDesc"),
      icon: <Globe className="text-slate-400" size={32} />,
      link: "/admissions",
    },
  ];

  return (
    <PageLayout
      title={t("pageTitle")}
      summary={t("pageSummary")}
      breadcrumbs={breadcrumbs}
      bannerImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2601&auto=format&fit=crop"
      isWide={true}
    >
      <div className="space-y-24">
        <section>
          <PersonnelGrid executiveType="Governing Council" title={t("gridTitle")} initialMembers={initialMembers} />
        </section>

        <section className="bg-primary-darker -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <ShieldCheck size={500} />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
            <div className="space-y-8">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                {t("stewardshipBadge")}
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter font-serif leading-[0.9]">
                {t("architects")} <br />{" "}
                <span className="text-primary italic lowercase">{t("of")}</span>{" "}
                <br /> {t("digitalFuture")}
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                {t("mandateBody")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {duties.map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 p-8 space-y-4 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-px bg-primary" />
                  <h4 className="font-black uppercase tracking-tight text-white">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">
              {t("networkBadge")}
            </span>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-primary-darker font-serif">
              {t("coreFunctions")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {functions.map((func, i) => (
              <Link
                key={i}
                href={func.link}
                className="group py-12 px-10 bg-slate-50 border border-slate-100 space-y-8 hover:bg-white hover:shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-2 transition-all duration-500 rounded-sm"
              >
                <div className="w-16 h-16 bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  {func.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker">
                    {func.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{func.desc}</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                  <span>{t("learnMore")}</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-32 bg-primary-darker flex flex-col items-center text-center space-y-10 rounded-sm relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <Compass className="text-white opacity-20 relative z-10" size={80} strokeWidth={1} />
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter max-w-2xl px-6 relative z-10 font-serif italic">
            {t("ctaReady")}{" "}
            <span className="italic lowercase">{t("ctaTo")}</span> {t("ctaJoin")}{" "}
            <br />{" "}
            <span className="text-primary not-italic">{t("ctaFuture")}</span>{" "}
            <span className="italic lowercase">{t("ctaOf")}</span> {t("ctaEducation")}
          </h2>
          <Link href="/admissions" className="relative z-10">
            <button className="bg-primary !text-white px-16 py-6 text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20">
              {t("applyAdmission")}
            </button>
          </Link>
        </section>
      </div>
    </PageLayout>
  );
}
