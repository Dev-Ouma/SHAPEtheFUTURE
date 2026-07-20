import React from "react";
import { getUnit } from "@/lib/api";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, Home } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import AdmissionsCTA from "@/components/AdmissionsCTA";
import UnitDetailClient from "@/components/UnitDetailClient";

async function resolveUnit(codeParam: string) {
  const decoded = decodeURIComponent(codeParam);
  // Prefer exact code (hyphens are often part of unit codes, e.g. CSC-101).
  // Fallback: spaces-for-hyphens for legacy links that encoded spaces as "-".
  const candidates = Array.from(
    new Set([decoded, decoded.replace(/-/g, " "), decoded.replace(/\s+/g, "-")]),
  );
  for (const code of candidates) {
    const unit = await getUnit(code);
    if (unit) return unit;
  }
  return null;
}

export async function generateMetadata({ params }: { params: { code: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Units" });
  const unit = await resolveUnit(params.code);
  return {
    title: unit ? `${unit.unit_code}: ${unit.title} | OUK Academic Unit` : t("notFoundTitle"),
    description: unit?.description?.substring(0, 160) || t("metaDescFallback", { title: unit?.title || "" }),
  };
}

export default async function UnitPage({ params }: { params: { code: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Units" });
  const unit = await resolveUnit(params.code);

  if (!unit) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* High-Fidelity Header */}
      <header className="bg-primary-darker pt-32 pb-40 px-6 border-b-8 border-secondary relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 -mr-64 -mt-64 rounded-full blur-[100px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <nav className="flex items-center justify-between mb-16 mt-12">
            <Link 
              href={unit.program ? `/programmes/${unit.program.slug}` : "/programmes"} 
              className="text-white font-black uppercase tracking-widest text-[9px] flex items-center mb-0 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={16} className="mr-3 transform group-hover:-translate-x-1 transition-transform" />
              <span>{unit.program ? unit.program.title : t("academicCatalog")}</span>
            </Link>
            
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-slate-500 hover:text-white transition-colors">
                <Home size={18} />
              </Link>
              <button className="text-slate-500 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
            <div className="space-y-10 flex flex-col items-center lg:items-start">
              <div className="flex items-center justify-center lg:justify-start space-x-6">
                <span className="bg-secondary text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
                  {unit.unit_code}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  {t("academicCredits", { count: unit.credits })}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter uppercase font-serif">
                {unit.title}
              </h1>
 
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 pt-10">
                <div className="border-l-0 lg:border-l-2 border-primary lg:pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("category")}</p>
                  <p className="text-white font-black uppercase tracking-tight">{t("coreUnit")}</p>
                </div>
                <div className="border-l-0 lg:border-l-2 border-primary lg:pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("faculty")}</p>
                  <p className="text-white font-black uppercase tracking-tight">{unit.school?.name?.replace('School of ', '') || t("facultyFallback")}</p>
                </div>
                <div className="border-l-0 lg:border-l-2 border-primary lg:pl-6">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{t("level")}</p>
                  <p className="text-white font-black uppercase tracking-tight">{unit.study_level || t("levelFallback")}</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
               <div className="bg-white p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-t-8 border-primary space-y-8">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-primary-darker flex items-center justify-center text-primary">
                        <span className="text-2xl font-black">{unit.credits}</span>
                     </div>
                     <span className="text-slate-400 font-black uppercase tracking-widest text-xs">{t("totalUnitCredits")}</span>
                  </div>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed">
                    {t("heroBlurb", { title: unit.title.toLowerCase() })}
                  </p>
                  <div className="pt-6 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("accreditation")}</p>
                     <p className="text-primary-darker font-black uppercase text-xs">{t("accreditationValue")}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="py-24 container mx-auto px-6 max-w-7xl -mt-16 relative z-20">
        <UnitDetailClient unit={unit} />
      </section>

      {/* Academic Context Footer */}
      <section className="bg-primary-darker py-24 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-20 opacity-5">
            <div className="w-[400px] h-[400px] border-4 border-white/20 rounded-full" />
         </div>
         <div className="container px-6 lg:px-12 mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="space-y-4">
                  <p className="text-4xl font-black">{t("serviceTenureValue")}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t("serviceTenure")}</p>
               </div>
               <div className="space-y-4">
                  <p className="text-4xl font-black">{t("legalAppointmentValue")}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t("legalAppointment")}</p>
               </div>
               <div className="space-y-4">
                  <div className="w-12 h-1 bg-primary mb-2" />
                  <p className="text-4xl font-black font-serif leading-tight">"{t("motto")}"</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t("institutionalMotto")}</p>
               </div>
            </div>
         </div>
      </section>

      <div className="bg-slate-50 border-t border-slate-100 pb-20">
        <AdmissionsCTA />
      </div>
    </div>
  );
}
