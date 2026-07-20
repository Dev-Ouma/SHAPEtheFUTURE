import React from "react";
import { Link } from "@/i18n/routing";
import {
  GraduationCap,
  Award,
  ChevronRight,
  ArrowRight,
  Library,
  Layers,
} from "lucide-react";
import { getSchools, getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const page = await getPage("academics", locale);
  const t = await getTranslations({ locale, namespace: "Academics" });
  return {
    title: page?.title || t("metaTitle"),
    description: page?.summary || t("metaDesc"),
  };
}

export default async function AcademicsHub({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Academics" });
  const [schools, page] = await Promise.all([
    getSchools(locale),
    getPage("academics", locale),
  ]);

  const pillars = [
    {
      title: t("pillarDegree"),
      desc: t("pillarDegreeDesc"),
      icon: <GraduationCap size={40} />,
      link: "/programmes",
      color: "text-primary",
    },
    {
      title: t("pillarPostgrad"),
      desc: t("pillarPostgradDesc"),
      icon: <Layers size={40} />,
      link: "/programmes?level=postgraduate",
      color: "text-secondary",
    },
    {
      title: t("pillarPro"),
      desc: t("pillarProDesc"),
      icon: <Award size={40} />,
      link: "/academics/professional-development-courses",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32 -mb-32" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 space-y-8">
          <span className="inline-block px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            {t("eyebrow")}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif">
            {page?.title || t("titleFallback")}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
            {page?.summary || t("summaryFallback")}
          </p>
        </div>
      </header>

      {page?.content && (
        <section className="py-20 bg-white border-b border-slate-100">
          <div
            className="container mx-auto px-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed prose prose-lg prose-slate prose-headings:text-primary-darker prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </section>
      )}

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-white p-12 space-y-8 transition-all duration-300 group flex flex-col border border-slate-100 shadow-sm hover:shadow-lg"
              >
                <div className={`${pillar.color} transition-transform group-hover:scale-110`}>
                  {pillar.icon}
                </div>
                <div className="space-y-4 flex-grow">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <Link
                  href={pillar.link}
                  className={`inline-flex items-center space-x-3 ${pillar.color} font-black uppercase tracking-widest text-[11px] pb-1 transition-all`}
                >
                  <span>{t("explorePathway")}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl space-y-4">
            <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif">
              {t("schoolsFaculties")}
            </h2>
            <p className="text-slate-500 font-medium">{t("schoolsFacultiesBody")}</p>
          </div>
          <Link
            href="/academics/schools"
            className="text-[11px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1"
          >
            {t("fullFacultyList")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-primary-darker">
          {schools.slice(0, 6).map((school: any) => (
            <div
              key={school.id}
              className="p-10 bg-white border border-slate-100 hover:bg-primary-darker hover:text-white group transition-all duration-500 shadow-sm hover:shadow-2xl"
            >
              <div className="mb-8 w-12 h-12 bg-slate-50 flex items-center justify-center group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all">
                <Library size={24} strokeWidth={2.5} />
              </div>
              <Link href={`/academics/schools/${school.slug}`}>
                <h4 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">
                  {school.name}
                </h4>
              </Link>
              <p className="text-sm text-slate-500 group-hover:text-slate-400 font-medium line-clamp-2 mb-8">
                {school.description || t("schoolDescFallback")}
              </p>
              <Link
                href={`/academics/schools/${school.slug}`}
                className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-all pt-6"
              >
                <span>{t("exploreSchool")}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-darker py-32 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-6 relative z-10 space-y-12">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
              {t("advancedInquiry")}
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none font-serif italic">
              {t("discoveryTitle")}{" "}
              <span className="italic lowercase">{t("discoveryWith")}</span> <br />{" "}
              <span className="text-primary not-italic">{t("discoveryAccent")}</span>
            </h2>
          </div>
          <p className="text-white/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            {t("discoveryBody")}
          </p>
          <div className="flex justify-center flex-wrap gap-8 pt-4">
            <Link href="/research">
              <button className="bg-primary !text-white py-5 px-16 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                {t("exploreResearchHub")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
