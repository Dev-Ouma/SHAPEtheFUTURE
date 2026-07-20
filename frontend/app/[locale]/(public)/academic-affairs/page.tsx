import React from "react";
import { Link } from "@/i18n/routing";
import {
  BookOpen,
  ShieldCheck,
  Scale,
  ArrowRight,
  FileText,
  Users,
  Award,
  Library,
} from "lucide-react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "AcademicAffairs" });
  const page = await getPage("academic-affairs", locale);
  return {
    title: page?.title || t("metaTitle"),
    description: page?.summary || t("metaDesc"),
  };
}

export default async function AcademicAffairsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "AcademicAffairs" });
  const page = await getPage("academic-affairs", locale);

  const coreFunctions = [
    {
      title: t("funcCurriculum"),
      desc: t("funcCurriculumDesc"),
      icon: <BookOpen size={40} />,
      link: "/academics",
      color: "text-primary",
    },
    {
      title: t("funcPolicy"),
      desc: t("funcPolicyDesc"),
      icon: <Scale size={40} />,
      link: "/programmes",
      color: "text-secondary",
    },
    {
      title: t("funcQa"),
      desc: t("funcQaDesc"),
      icon: <ShieldCheck size={40} />,
      link: "/about/quality-assurance",
      color: "text-emerald-600",
    },
  ];

  const quickLinks = [
    { name: t("linkPolicies"), icon: <FileText size={18} />, href: "/about/policies" },
    { name: t("linkSenate"), icon: <Users size={18} />, href: "/about/governance" },
    { name: t("linkFaculty"), icon: <Library size={18} />, href: "/academic-affairs/faculty" },
    { name: t("linkAccreditation"), icon: <Award size={18} />, href: "/about/quality-assurance" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-slate-900 pt-48 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32 -mb-32" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-primary/30">
            <Scale size={12} /> {t("badge")}
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
        <section className="py-24 bg-white border-b border-slate-100">
          <div
            className="container mx-auto px-6 max-w-4xl text-lg text-slate-600 font-medium leading-relaxed prose prose-lg prose-slate prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary-darker"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </section>
      )}

      <section className="py-32 bg-slate-50 relative border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-20 space-y-4 max-w-2xl">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter font-serif">
              {t("coreFunctions")}
            </h2>
            <p className="text-slate-500 font-medium text-lg">{t("coreFunctionsBody")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {coreFunctions.map((func, i) => (
              <div
                key={i}
                className="bg-white p-12 space-y-8 transition-all duration-300 group flex flex-col border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`${func.color} transition-transform group-hover:scale-110`}>
                  {func.icon}
                </div>
                <div className="space-y-4 flex-grow">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-slate-900">
                    {func.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">{func.desc}</p>
                </div>
                <Link
                  href={func.link}
                  className={`inline-flex items-center space-x-3 ${func.color} font-black uppercase tracking-widest text-[11px] pb-1 transition-all`}
                >
                  <span>{t("viewDetails")}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-8">
              <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                {t("officeDvc")}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter font-serif leading-[0.9]">
                {t("leadershipTitle")}
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">{t("leadershipBody")}</p>

              <div className="p-8 bg-slate-50 border border-slate-100 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {t("contactOffice")}
                </p>
                <div>
                  <p className="font-bold text-slate-900">{t("emailLabel")}</p>
                  <a href="mailto:dvc-aa@ouk.ac.ke" className="text-primary hover:underline font-medium">
                    dvc-aa@ouk.ac.ke
                  </a>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t("phoneLabel")}</p>
                  <p className="text-slate-600 font-medium">+254 (0) 20 123 4567</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-2 gap-6">
                {quickLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className="flex items-center p-8 bg-white border border-slate-200 hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                      {link.icon}
                    </div>
                    <div className="ml-6 flex-grow">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 group-hover:text-primary transition-colors">
                        {link.name}
                      </h4>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-primary group-hover:-translate-x-2 transition-all opacity-0 group-hover:opacity-100"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary pt-24 pb-32 px-6 text-center border-t border-primary-darker/20">
        <div className="container mx-auto max-w-3xl space-y-10">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-serif">
            {t("ctaTitle")}
          </h2>
          <p className="text-white/80 font-medium text-lg">{t("ctaBody")}</p>
          <Link
            href="/programmes"
            className="inline-flex items-center gap-3 bg-white text-primary px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-slate-50 hover:scale-105 transition-all shadow-xl"
          >
            {t("browseCatalogue")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
