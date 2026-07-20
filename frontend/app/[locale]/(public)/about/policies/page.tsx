import React from "react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Scale, FileText, Download, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Policies" });
  const page = await getPage("policies", locale);
  return {
    title: page?.title || t("metaTitle"),
    description: page?.summary || t("metaDesc"),
  };
}

export default async function PoliciesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Policies" });
  const page = await getPage("policies", locale);

  const policies = [
    {
      title: t("integrityTitle"),
      desc: t("integrityDesc"),
      icon: <ShieldCheck size={20} />,
    },
    {
      title: t("privacyTitle"),
      desc: t("privacyDesc"),
      icon: <FileText size={20} />,
    },
    {
      title: t("admissionsTitle"),
      desc: t("admissionsDesc"),
      icon: <FileText size={20} />,
    },
    {
      title: t("conductTitle"),
      desc: t("conductDesc"),
      icon: <Scale size={20} />,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-slate-50 pt-48 pb-32 px-6 border-b border-slate-200">
        <div className="container mx-auto max-w-4xl space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
            <Scale size={12} className="text-primary" /> {t("badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase font-serif">
            {page?.title || t("titleFallback")}
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            {page?.summary || t("summaryFallback")}
          </p>
        </div>
      </header>

      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          {page?.content ? (
            <div
              className="prose prose-lg prose-slate prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary-darker"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {policies.map((policy, i) => (
                <div
                  key={i}
                  className="p-8 border border-slate-200 hover:border-primary group transition-all"
                >
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors mb-6">
                    {policy.icon}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">{policy.desc}</p>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-darker transition-colors">
                    <Download size={14} /> {t("downloadPdf")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
