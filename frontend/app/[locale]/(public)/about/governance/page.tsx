import React from "react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Users, Landmark, FileCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Governance" });
  const page = await getPage("governance", locale);
  return {
    title: page?.title || t("metaTitle"),
    description: page?.summary || t("metaDesc"),
  };
}

export default async function GovernancePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Governance" });
  const page = await getPage("governance", locale);

  const duties = [
    t("dutyProgrammes"),
    t("dutyAdmissions"),
    t("dutyExams"),
    t("dutyAwards"),
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="container mx-auto max-w-4xl space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <Landmark size={12} /> {t("badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase font-serif">
            {page?.title || t("titleFallback")}
          </h1>
          <p className="text-lg text-white/70 font-medium leading-relaxed max-w-2xl">
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
                    {t("roleTitle")}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">{t("roleBody")}</p>
                  <ul className="space-y-3">
                    {duties.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                        <FileCheck size={18} className="text-primary shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 p-8 border border-slate-200">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                    <Users size={16} className="text-primary" /> {t("compositionTitle")}
                  </h3>
                  <div className="space-y-4 text-sm text-slate-600 font-medium divide-y divide-slate-100">
                    <div className="pb-4">
                      <span className="font-bold text-slate-900 block">{t("chairman")}</span>{" "}
                      {t("chairmanValue")}
                    </div>
                    <div className="py-4">
                      <span className="font-bold text-slate-900 block">{t("members")}</span>{" "}
                      {t("membersValue")}
                    </div>
                    <div className="pt-4">
                      <span className="font-bold text-slate-900 block">{t("secretary")}</span>{" "}
                      {t("secretaryValue")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">
                  {t("otherBodies")}
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Link
                    href="/about/governing-council"
                    className="p-8 border border-slate-200 hover:border-primary group transition-all"
                  >
                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                      {t("councilTitle")}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2">{t("councilDesc")}</p>
                  </Link>
                  <Link
                    href="/about/management"
                    className="p-8 border border-slate-200 hover:border-primary group transition-all"
                  >
                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                      {t("mgmtTitle")}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2">{t("mgmtDesc")}</p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
