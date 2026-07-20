import React from "react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { ShieldCheck, CheckCircle2, Award, BarChart } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "QualityAssurance" });
  const page = await getPage("quality-assurance", locale);
  return {
    title: page?.title || t("metaTitle"),
    description: page?.summary || t("metaDesc"),
  };
}

export default async function QualityAssurancePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "QualityAssurance" });
  const page = await getPage("quality-assurance", locale);

  const pillars = [
    { title: t("pillarAccreditation"), icon: <Award className="text-emerald-500" /> },
    { title: t("pillarAudits"), icon: <CheckCircle2 className="text-emerald-500" /> },
    { title: t("pillarMetrics"), icon: <BarChart className="text-emerald-500" /> },
    { title: t("pillarCompliance"), icon: <ShieldCheck className="text-emerald-500" /> },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-emerald-900 pt-48 pb-32 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto max-w-4xl space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={12} /> {t("badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase font-serif">
            {page?.title || t("titleFallback")}
          </h1>
          <p className="text-lg text-emerald-100/80 font-medium leading-relaxed max-w-2xl">
            {page?.summary || t("summaryFallback")}
          </p>
        </div>
      </header>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          {page?.content ? (
            <div
              className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary-darker"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
            />
          ) : (
            <div className="space-y-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter font-serif">
                    {t("dqaTitle")}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">{t("dqaP1")}</p>
                  <p className="text-slate-600 leading-relaxed">{t("dqaP2")}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pillars.map((item, i) => (
                    <div key={i} className="p-6 bg-slate-50 border border-slate-100 text-center space-y-4">
                      <div className="flex justify-center">{item.icon}</div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
                        {item.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-12 text-center max-w-3xl mx-auto space-y-6">
                <Award size={48} className="text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
                  {t("statusTitle")}
                </h3>
                <p className="text-slate-600">{t("statusBody")}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
