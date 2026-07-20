import React from "react";
import { getProgram } from "@/lib/api";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import AdmissionsCTA from "@/components/AdmissionsCTA";
import ProgrammeDetailClient from "@/components/ProgrammeDetailClient";
import ProgrammeActions from "@/components/ProgrammeActions";
import JsonLd from "@/components/JsonLd";
import { LocalizedText, I18nProtect } from "@/components/LocalizedCms";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Programmes" });
  const programme = await getProgram(params.slug, params.locale);
  return withLocaleSeo(`/programmes/${params.slug}`, params.locale, {
    title: programme ? `${programme.title} | OUK Digital Campus` : t("notFoundTitle"),
    description: programme?.description?.substring(0, 160),
  });
}

export default async function ProgramPage({ params }: { params: { slug: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Programmes" });
  const programme = await getProgram(params.slug, params.locale);

  if (!programme) {
    notFound();
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": programme.title,
    "description": programme.description || programme.overview,
    "courseCode": programme.programme_code,
    "provider": {
      "@type": "Organization",
      "name": "Open University of Kenya",
      "sameAs": "https://ouk.ac.ke"
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={schemaData} />
      <header className="bg-primary-darker pt-32 pb-40 px-6 border-b-8 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 -mr-96 -mt-96 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 -ml-48 -mb-48 rounded-full blur-[80px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <Link 
              href="/programmes" 
              className="text-primary font-black uppercase tracking-widest text-[9px] flex items-center mb-0 hover:text-white transition-colors group"
            >
              <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-1 transition-transform" />
              <span>{t("academicCatalog")}</span>
            </Link>
            
            <ProgrammeActions title={programme.title} />
          </nav>
 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            <div className="space-y-10">
              <div className="flex items-center space-x-6">
                <span className="bg-primary-darker text-white border border-white/10 px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                  {programme.level || t("fallbackLevel")}
                </span>
                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                  {t("code", { code: programme.programme_code || "OUK-BDS-01" })}
                </span>
              </div>
              
              <LocalizedText
                locale={params.locale}
                swSource={programme.title_sw}
                as="h1"
                className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight font-serif max-w-xl italic"
              >
                {programme.title}
              </LocalizedText>

              <div className="flex flex-wrap gap-12 pt-10">
                <div className="border-l border-secondary/30 pl-6">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("duration")}</p>
                  <p className="text-white font-black uppercase tracking-tight">{programme.duration || t("fallbackDuration")}</p>
                </div>
                <div className="border-l border-secondary/30 pl-6">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("modeOfStudy")}</p>
                  <p className="text-white font-black uppercase tracking-tight">{programme.mode_of_delivery?.join(' & ') || t("modeOnline")}</p>
                </div>
                <div className="border-l border-secondary/30 pl-6">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("academicSchool")}</p>
                  {programme.school?.slug ? (
                    <Link 
                      href={`/academics/schools/${programme.school.slug}`}
                      className="text-white font-black uppercase tracking-tight hover:text-primary transition-colors flex items-center group/link"
                    >
                      <span>{programme.school.name}</span>
                      <ArrowRight size={14} className="ml-2 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                    </Link>
                  ) : (
                    <p className="text-white font-black uppercase tracking-tight">
                      {programme.school?.name || "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 space-y-8">
                 <I18nProtect locale={params.locale} as="p" className="text-slate-400 font-medium text-lg leading-relaxed">
                   {t("heroBlurb")}
                 </I18nProtect>
                 <div className="flex items-center space-x-3 text-primary font-black uppercase tracking-[0.2em] text-[9px]">
                   <span className="w-10 h-0.5 bg-primary" />
                   <span>{t("accreditedPathway")}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 container mx-auto px-6 max-w-7xl -mt-20 relative z-20">
        <ProgrammeDetailClient programme={programme} />
      </section>

      <div className="bg-slate-50 border-t border-slate-100 mt-20">
        <AdmissionsCTA />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": programme.title,
            "description": programme.description || `Study ${programme.title} at the Open University of Kenya.`,
            "provider": {
              "@type": "CollegeOrUniversity",
              "name": "Open University of Kenya",
              "sameAs": "https://ouk.ac.ke"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": programme.mode_of_delivery?.includes("Online") ? "Online" : "Blended",
              "courseWorkload": programme.duration || "PT4Y"
            }
          })
        }}
      />
    </div>
  );
}
