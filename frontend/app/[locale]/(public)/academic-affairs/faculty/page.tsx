import React from "react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Library, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "AcademicAffairs" });
  const page = await getPage("faculty-resources", locale);
  return {
    title: page?.title || t("facultyMetaTitle"),
    description: page?.summary || t("facultyMetaDesc"),
  };
}

export default async function FacultyResourcesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "AcademicAffairs" });
  const page = await getPage("faculty-resources", locale);

  const platforms = [
    { name: t("facultyPlatformElearning"), desc: t("facultyPlatformElearningDesc"), link: "#" },
    { name: t("facultyPlatformIntranet"), desc: t("facultyPlatformIntranetDesc"), link: "#" },
    { name: t("facultyPlatformResearch"), desc: t("facultyPlatformResearchDesc"), link: "#" },
    { name: t("facultyPlatformLibrary"), desc: t("facultyPlatformLibraryDesc"), link: "#" },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-slate-50 pt-48 pb-32 px-6 border-b border-slate-200">
        <div className="container mx-auto max-w-4xl space-y-6">
           <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
             <Library size={12} className="text-primary" /> {t("facultyBadge")}
           </span>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase font-serif">
             {page?.title || t("facultyTitleFallback")}
           </h1>
           <p className="text-lg text-slate-500 font-medium leading-relaxed">
             {page?.summary || t("facultySummaryFallback")}
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
              <div className="space-y-20">
                
                {/* Platforms Grid */}
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter font-serif mb-8 flex items-center gap-3">
                    <BookOpen className="text-primary" /> {t("facultyKeyPlatforms")}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {platforms.map((p, i) => (
                      <Link key={i} href={p.link} className="p-8 bg-white border border-slate-200 hover:border-primary hover:shadow-lg transition-all group flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <ArrowRight size={20} className="-rotate-45" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors mb-2">{p.name}</h3>
                          <p className="text-sm text-slate-500">{p.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Support Services */}
                <div className="bg-primary-darker text-white p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-50 -mr-32 -mt-32" />
                  <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black uppercase tracking-tighter font-serif mb-4">{t("facultyPedagogicalTitle")}</h2>
                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                      {t("facultyPedagogicalBody")}
                    </p>
                    <button className="bg-primary hover:bg-white hover:text-primary px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-3">
                      <GraduationCap size={16} /> {t("facultyRequestSupport")}
                    </button>
                  </div>
                </div>

              </div>
            )}
         </div>
      </section>
    </div>
  );
}
