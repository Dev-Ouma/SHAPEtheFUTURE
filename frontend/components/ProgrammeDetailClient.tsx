"use client";

import React, { useState, useEffect } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedHtml, I18nProtect } from "@/components/LocalizedCms";
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Info, 
  Clock, 
  GraduationCap, 
  ArrowRight,
  Globe,
  Wallet,
  BookOpen
} from "lucide-react";

interface Unit {
  id: string;
  unit_code: string;
  title: string;
  description?: string;
  credits: number;
  year_level: string;
}

interface ProgramDetails {
  id: string;
  title: string;
  title_sw?: string;
  description: string;
  overview?: string;
  overview_sw?: string;
  level: string;
  duration: string;
  cost: string;
  mode_of_delivery: string[];
  application_status: string;
  learning_outcomes?: string;
  entry_requirements?: string;
  credit_entry?: string;
  programme_structure?: string;
  assessment?: string;
  careers?: string;
  fees_scholarships?: string;
  brochure_url?: string;
  units: Unit[];
}

export default function ProgrammeDetailClient({ programme }: { programme: ProgramDetails }) {
  const t = useTranslations("Programmes");
  const locale = useLocale();
  const [activeYear, setActiveYear] = useState<string | null>(null);

  useEffect(() => {
    const years = Object.keys(groupedUnits || {});
    if (years.length > 0 && !activeYear) {
      setActiveYear(years.sort()[0]);
    }
  }, [programme.units]);

  const groupedUnits = programme.units?.reduce((acc: any, unit) => {
    const yearMatch = unit.year_level.match(/Year\s+\d+/i);
    const semMatch = unit.year_level.match(/Sem\s+\d+/i);
    
    const year = yearMatch ? yearMatch[0].toUpperCase() : unit.year_level;
    const sem = semMatch ? semMatch[0].toUpperCase() : "GENERAL";
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][sem]) acc[year][sem] = [];
    acc[year][sem].push(unit);
    return acc;
  }, {});

  const toggleYear = (year: string) => {
    setActiveYear(prev => prev === year ? null : year);
  };

  const durationMatch = (programme.duration || "4 Years").match(/\d+/);
  const totalYears = durationMatch ? parseInt(durationMatch[0]) : 4;
  const baseYears = Array.from({ length: totalYears }, (_, i) => `YEAR ${i + 1}`);
  const existingYears = Object.keys(groupedUnits || {});
  const years = Array.from(new Set([...baseYears, ...existingYears])).sort();

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-24">
          
          <section id="overview" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-primary pl-6 tracking-tight uppercase">
              {t("academicOverview")}
            </I18nProtect>
            {programme.overview || programme.description ? (
              <LocalizedHtml
                locale={locale}
                swSource={programme.overview_sw}
                html={sanitizeHtml(programme.overview || programme.description || "")}
                className="prose prose-xl prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
              />
            ) : (
              <I18nProtect locale={locale} as="div" className="prose prose-xl prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                {t("overviewFallback")}
              </I18nProtect>
            )}
          </section>

          {programme.learning_outcomes && (
            <section id="outcomes" className="scroll-mt-32">
              <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-secondary pl-6 tracking-tight uppercase">
                {t("expectedOutcomes")}
              </I18nProtect>
              <div className="bg-white p-12 border-2 border-slate-100 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 -mr-16 -mt-16 rounded-full" />
                <LocalizedHtml
                  locale={locale}
                  html={sanitizeHtml(programme.learning_outcomes)}
                  className="prose prose-lg prose-slate max-w-none relative z-10 prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-700 prose-li:font-bold prose-li:my-4"
                />
              </div>
            </section>
          )}

          <section id="requirements" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-slate-200 pl-6 tracking-tight uppercase">
              {t("entryRequirements")}
            </I18nProtect>
            <div className="bg-slate-50 p-12 border border-slate-100">
              {programme.entry_requirements ? (
                <LocalizedHtml
                  locale={locale}
                  html={sanitizeHtml(programme.entry_requirements)}
                  className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
                />
              ) : (
                <I18nProtect locale={locale} as="div" className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                  {t("entryFallback")}
                </I18nProtect>
              )}
            </div>
          </section>

          <section id="pathways" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-secondary pl-6 tracking-tight uppercase">
              {t("creditPathways")}
            </I18nProtect>
            {programme.credit_entry ? (
              <LocalizedHtml
                locale={locale}
                html={sanitizeHtml(programme.credit_entry)}
                className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
              />
            ) : (
              <I18nProtect locale={locale} as="div" className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                {t("creditFallback")}
              </I18nProtect>
            )}
          </section>

          <section id="curriculum" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-slate-900 pl-6 tracking-tight uppercase">
              {t("programmeStructure")}
            </I18nProtect>

            {programme.programme_structure ? (
              <LocalizedHtml
                locale={locale}
                html={sanitizeHtml(programme.programme_structure)}
                className="mb-10 prose prose-lg prose-slate max-w-none text-slate-600"
              />
            ) : (
              <I18nProtect locale={locale} as="div" className="mb-10 prose prose-lg prose-slate max-w-none text-slate-600">
                {t("structureFallback")}
              </I18nProtect>
            )}
            
            <div className="space-y-4">
              {years.length > 0 ? years.map((year) => (
                <div key={year} className="border-2 border-slate-100 overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleYear(year)}
                    className="w-full flex items-center justify-between p-8 bg-white hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight">{year}</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                         {t("curriculumDetails")}
                      </p>
                    </div>
                    {activeYear === year ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </button>
                  
                  <AnimatePresence>
                    {activeYear === year && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-slate-50/50 border-t-2 border-slate-100 p-8 space-y-12"
                      >
                         {groupedUnits[year] && Object.keys(groupedUnits[year]).length > 0 ? (
                           Object.keys(groupedUnits[year]).sort().map(semester => (
                             <div key={semester} className="space-y-6">
                                <div className="flex items-center space-x-4">
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">{semester}</h4>
                                  <div className="h-px w-full bg-slate-200" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {groupedUnits[year][semester].map((unit: Unit) => (
                                    <Link 
                                      key={unit.id}
                                      href={`/units/${unit.unit_code.replace(/\s+/g, '-')}`}
                                      className="bg-white p-6 border-2 border-slate-100 flex items-start space-x-4 cursor-pointer hover:border-[#ff7f50] hover:shadow-lg transition-all group"
                                    >
                                      <div className="w-10 h-10 shrink-0 bg-primary-darker text-white flex items-center justify-center font-black text-[10px] group-hover:bg-[#ff7f50] hover:text-white transition-colors">
                                        {unit.unit_code.split(' ')[1] || unit.unit_code}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-sm font-bold text-primary-darker leading-tight group-hover:text-primary transition-colors">{unit.title}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                          {t("credits", { count: unit.credits })}
                                        </p>
                                      </div>
                                      <Info size={16} className="text-slate-300 group-hover:text-primary mt-1" />
                                    </Link>
                                  ))}
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="text-center py-8">
                             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t("curriculumPending")}</p>
                           </div>
                         )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )) : (
                <div className="p-12 border-4 border-dashed border-slate-100 text-center">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t("curriculumPending")}</p>
                </div>
              )}
            </div>
          </section>

          <section id="assessment" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-primary/40 pl-6 tracking-tight uppercase">
              {t("assessmentMethods")}
            </I18nProtect>
            <div className="bg-primary-darker p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
               {programme.assessment ? (
                 <LocalizedHtml
                   locale={locale}
                   html={sanitizeHtml(programme.assessment)}
                   className="prose prose-lg prose-invert max-w-none font-medium opacity-90"
                 />
               ) : (
                 <I18nProtect locale={locale} as="div" className="prose prose-lg prose-invert max-w-none font-medium opacity-90">
                   {t("assessmentFallback")}
                 </I18nProtect>
               )}
            </div>
          </section>

          <section id="careers" className="scroll-mt-32">
            <I18nProtect locale={locale} as="h2" className="text-xl font-black text-primary-darker mb-10 border-l-8 border-secondary pl-6 tracking-tight uppercase">
              {t("globalCareers")}
            </I18nProtect>
            <div className="bg-white p-12 border-2 border-slate-100 relative overflow-hidden shadow-sm">
              {programme.careers ? (
                <LocalizedHtml
                  locale={locale}
                  html={sanitizeHtml(programme.careers)}
                  className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
                />
              ) : (
                <I18nProtect locale={locale} as="div" className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                  {t("careersFallback")}
                </I18nProtect>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="sticky top-32 space-y-8">
            <div className="bg-primary-darker p-10 text-white border-b-8 border-secondary shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rotate-45 transition-transform group-hover:scale-110" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 text-secondary border-b border-white/10 pb-4 relative z-10">{t("applicationHub")}</h3>
              
              <div className="space-y-8 relative z-10">
                  <div className="flex items-center space-x-6">
                    <div className="p-3 bg-white/10 text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{t("typicalDuration")}</p>
                      <div 
                        className="font-black text-lg uppercase tracking-tight prose prose-invert prose-p:my-0"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(programme.duration || t("fallbackDuration")) }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="p-3 bg-white/10 text-primary">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{t("deliveryMode")}</p>
                      <p className="font-black text-lg uppercase tracking-tight">{programme.mode_of_delivery?.join(' & ') || t("modeOnline")}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="p-3 bg-white/10 text-primary">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{t("fees")}</p>
                      <div 
                        className="font-black text-lg uppercase tracking-tight prose prose-invert prose-p:my-0"
                        dangerouslySetInnerHTML={{ 
                          __html: sanitizeHtml(programme.cost 
                            ? (programme.cost.toLowerCase().includes('kes') ? programme.cost : `KES ${programme.cost}`) 
                            : t("competitive")) 
                        }}
                      />
                      <Link href="/admissions/fee-structure" className="text-[9px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors mt-2 block flex items-center gap-1">
                        {t("viewFeeStructure")}
                      </Link>
                    </div>
                  </div>
              </div>

              <div className="mt-16 space-y-4 relative z-10">
                <button className="w-full bg-primary text-white py-6 px-8 font-black uppercase tracking-[0.2em] text-xs hover:bg-[#ff7f50] hover:text-white transition-all active:scale-[0.98] flex items-center justify-center space-x-3">
                  <span>{t("startEnrollment")}</span>
                  <ArrowRight size={18} />
                </button>
                
                {programme.brochure_url ? (
                  <a 
                    href={programme.brochure_url}
                    className="w-full border-2 border-white/20 text-white py-6 px-8 font-black uppercase tracking-[0.2em] text-xs hover:border-white transition-all flex items-center justify-center space-x-3"
                  >
                    <Download size={18} />
                    <span>{t("digitalBrochure")}</span>
                  </a>
                ) : (
                  <button 
                    className="w-full border-2 border-white/20 text-white py-6 px-8 font-black uppercase tracking-[0.2em] text-xs hover:border-white transition-all flex items-center justify-center space-x-3"
                  >
                    <BookOpen size={18} />
                    <span>{t("requestBrochure")}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-8 border-2 border-slate-100">
               <div className="flex items-center space-x-3 mb-6">
                  <GraduationCap size={20} className="text-primary" />
                  <h4 className="font-black uppercase tracking-widest text-xs">{t("accreditationInfo")}</h4>
               </div>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">
                 {t("accreditationBody")}
               </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
