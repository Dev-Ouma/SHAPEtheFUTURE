"use client";

import React from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { 
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  Globe
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface Program {
  id: string;
  title: string;
  slug: string;
  level: string;
}

interface UnitDetails {
  id: string;
  unit_code: string;
  title: string;
  description: string;
  credits: number;
  learning_outcomes?: string;
  assessment_methods?: string;
  prerequisites?: string;
  programmes?: Program[];
}

export default function UnitDetailClient({ unit }: { unit: UnitDetails }) {
  const t = useTranslations("Units");

  return (
    <div className="space-y-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-20">
          {/* Syllabus & Overview */}
          <section className="space-y-10">
            <h2 className="text-xl font-black text-primary-darker border-l-8 border-primary pl-6 tracking-tight uppercase">
              {t("unitSpecification")}
            </h2>
            <div 
              className="prose prose-xl prose-slate max-w-none text-slate-600 font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(unit.description || t("descriptionFallback")) }}
            />
          </section>

          {/* Learning Outcomes */}
          <section className="bg-slate-50 p-12 border-l-8 border-secondary relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 -mr-16 -mt-16 rounded-full" />
             <h3 className="text-lg font-black text-primary-darker mb-8 tracking-tight uppercase">{t("learningOutcomes")}</h3>
             <div 
                className="prose prose-slate max-w-none prose-p:font-bold prose-p:text-slate-700 prose-li:text-slate-700"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(unit.learning_outcomes || t("outcomesFallback")) }}
             />
          </section>

          {/* Assessment & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="bg-white border-2 border-slate-100 p-10">
                <div className="flex items-center space-x-4 mb-6">
                   <Award className="text-primary" size={24} />
                   <h4 className="font-black uppercase tracking-widest text-xs">{t("assessmentMethods")}</h4>
                </div>
                <div 
                  className="text-slate-500 font-medium leading-relaxed prose prose-sm prose-slate"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(unit.assessment_methods || t("assessmentFallback")) }}
                />
             </div>
             <div className="bg-white border-2 border-slate-100 p-10">
                <div className="flex items-center space-x-4 mb-6">
                   <Layers className="text-primary" size={24} />
                   <h4 className="font-black uppercase tracking-widest text-xs">{t("prerequisites")}</h4>
                </div>
                <div 
                  className="text-slate-500 font-medium leading-relaxed prose prose-sm prose-slate"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(unit.prerequisites || t("prerequisitesFallback")) }}
                />
             </div>
          </div>
        </div>

        {/* Sidebar: In These Programmes */}
        <div className="space-y-10">
          <div className="sticky top-32 space-y-10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-secondary mb-6 flex items-center space-x-3">
                <div className="w-10 h-0.5 bg-secondary" />
                <span>{t("academicContext")}</span>
              </h3>
              <div className="bg-primary-darker text-white p-10 shadow-2xl space-y-8">
                <div className="flex items-center space-x-4">
                  <Globe size={20} className="text-primary" />
                  <span className="font-black uppercase tracking-widest text-[9px]">{t("includedInDegreePaths")}</span>
                </div>
                
                <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{t("relatedProgrammes")}</h4>
                
                <div className="space-y-4">
                  {unit.programmes && unit.programmes.length > 0 ? unit.programmes.map((prog) => (
                    <Link 
                      key={prog.id} 
                      href={`/programmes/${prog.slug}`}
                      className="flex items-center justify-between p-5 bg-white/5 border border-white/10 hover:border-[#ff7f50] hover:bg-white/10 transition-all group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors text-white">{prog.title}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{prog.level}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  )) : (
                    <p className="text-xs text-slate-500 italic">{t("programmesEmpty")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Support Widget */}
            <div className="p-10 border-2 border-slate-50 bg-slate-50/50">
               <div className="flex items-center space-x-3 mb-4">
                  <BookOpen size={20} className="text-primary" />
                  <h4 className="font-black uppercase tracking-widest text-[9px]">{t("institutionalSupport")}</h4>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                 {t("supportBlurb")}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
