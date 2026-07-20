import React from 'react';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getJobProfile } from '@/lib/api';
import { sanitizeHtml } from "@/lib/sanitize";
import { Calendar, MapPin, Clock, ArrowLeft, ArrowRight, ExternalLink, Award, ChevronRight, Share2, ClipboardCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { LocalizedHtml, LocalizedText } from "@/components/LocalizedCms";

export async function generateMetadata({ params }: { params: { locale: string; category: string; slug: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  const job = await getJobProfile(params.slug, params.locale);
  if (!job) return { title: t('jobNotFound') };
  return {
    title: `${job.title} | ${t('careersLabel')} | Open University of Kenya`,
    description: job.summary,
  };
}

export default async function JobDetailPage({ params }: { params: { locale: string; category: string; slug: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  const job = await getJobProfile(params.slug, params.locale);
  
  if (!job || job.status !== 'Published') {
    notFound();
  }

  const isClosed = job.application_deadline && new Date(job.application_deadline) < new Date();
  const dateLocale = params.locale === 'sw' ? 'sw-KE' : 'en-GB';

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      {/* ── Premium Hero Section ── */}
      <div className="relative bg-primary-darker text-white pt-48 pb-40 overflow-hidden border-b-[8px] border-primary">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />


        <div className="container relative z-10 px-6 mx-auto max-w-7xl">
           <Link href="/admissions/careers" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest mb-12 backdrop-blur-none">
             <ArrowLeft size={14} /> {t('backToOpenPositions')}
           </Link>

           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="max-w-4xl">
                 <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                       {t('jobOpportunity')}
                    </span>
                    {job.division && (
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                          {job.division.name} {job.department ? <><ChevronRight size={10} className="mx-1 opacity-40"/> {job.department.name}</> : ''}
                       </span>
                    )}
                 </div>
                 <LocalizedText
                    locale={params.locale}
                    swSource={job.title_sw}
                    as="h1"
                    className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.95]"
                 >
                    {job.title}
                 </LocalizedText>
                 
                 <div className="flex flex-wrap gap-4">
                    <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-sm font-bold text-slate-300">
                       <MapPin size={16} className="mr-2 text-primary" />
                       {job.location || t('nairobiFallback')} {job.is_remote && <span className="text-slate-500 ml-1">{t('remoteParen')}</span>}
                    </div>
                    <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-sm font-bold text-slate-300">
                       <Clock size={16} className="mr-2 text-primary" />
                       {job.employment_type || t('fullTimeFallback')}
                    </div>
                    {job.job_grade && (
                       <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 text-sm font-bold text-slate-300">
                          <Award size={16} className="mr-2 text-primary" />
                          {t('gradeLabel', { grade: job.job_grade })}
                       </div>
                    )}
                 </div>
              </div>

              {/* Status Badge Desktop */}
              <div className="hidden lg:block shrink-0 mb-2">
                 {isClosed ? (
                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center">
                       <span className="w-2 h-2 bg-red-500 mr-3" /> {t('applicationClosed')}
                    </div>
                 ) : (
                    <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center">
                       <span className="w-2 h-2 bg-emerald-500 mr-3 animate-pulse" /> {t('acceptingApplications')}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="container mx-auto px-6 max-w-7xl -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 min-w-0">
            <div className="bg-white p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-10">
              
              <div className="flex flex-col md:flex-row items-center gap-8 mb-16 pb-16 border-b border-slate-100">
                 <div className="flex-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center">
                       <ClipboardCheck size={14} className="mr-2 text-primary" /> {t('jobOverview')}
                    </h3>
                    <LocalizedText
                       locale={params.locale}
                       swSource={job.summary_sw}
                       as="p"
                       className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed"
                    >
                       {job.summary}
                    </LocalizedText>
                 </div>
                 <div className="hidden md:block w-px h-24 bg-slate-100" />
                 <div className="shrink-0 text-center md:text-left">
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">{t('referenceCode')}</div>
                    <div className="text-2xl font-black text-primary-darker tracking-wider font-mono bg-slate-50 px-6 py-3">
                       {job.reference_code}
                    </div>
                 </div>
              </div>

              <div className="space-y-16">
                 {job.description && (
                   <div className="relative">
                     <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-8 flex items-center">
                        <span className="w-8 h-1 bg-primary mr-4" />
                        {t('aboutRole')}
                     </h3>
                     <LocalizedHtml
                        locale={params.locale}
                        swSource={job.description_sw}
                        html={sanitizeHtml(job.description)}
                        className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-headings:text-primary-darker"
                     />
                   </div>
                 )}

                 {job.responsibilities && (
                   <div className="relative">
                     <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-8 flex items-center">
                        <span className="w-8 h-1 bg-primary mr-4" />
                        {t('keyResponsibilities')}
                     </h3>
                     <LocalizedHtml
                        locale={params.locale}
                        swSource={job.responsibilities_sw}
                        html={sanitizeHtml(job.responsibilities)}
                        className="prose prose-slate prose-lg max-w-none prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-3 prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-primary"
                     />
                   </div>
                 )}

                 {job.requirements && (
                   <div className="relative">
                     <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-8 flex items-center">
                        <span className="w-8 h-1 bg-primary mr-4" />
                        {t('criticalRequirements')}
                     </h3>
                     <LocalizedHtml
                        locale={params.locale}
                        swSource={job.requirements_sw}
                        html={sanitizeHtml(job.requirements)}
                        className="prose prose-slate prose-lg max-w-none prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-3 prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-primary"
                     />
                   </div>
                 )}

                 {job.qualifications && (
                   <div className="relative">
                     <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-8 flex items-center">
                        <span className="w-8 h-1 bg-primary mr-4" />
                        {t('qualifications')}
                     </h3>
                     <LocalizedHtml
                        locale={params.locale}
                        swSource={job.qualifications_sw}
                        html={sanitizeHtml(job.qualifications)}
                        className="prose prose-slate prose-lg max-w-none prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-8 prose-li:mb-4 prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-3 prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-primary"
                     />
                   </div>
                 )}
               </div>
             </div>

             {/* ── Application Form: Internal only ── */}
             {!isClosed && job.application_method !== 'external' && (
               <div id="apply" className="bg-white p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 scroll-mt-32">
                 <div className="mb-12">
                   <h2 className="text-3xl font-black text-primary-darker uppercase tracking-tighter mb-4">{t('applyForPosition')}</h2>
                   <p className="text-slate-500 font-medium">{t('applyFormBody')}</p>
                 </div>

                 <form className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('fullName')}</label>
                        <input type="text" className="w-full bg-slate-50 border-none py-5 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder={t("namePlaceholder")} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('emailAddress')}</label>
                        <input type="email" className="w-full bg-slate-50 border-none py-5 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder={t("emailPlaceholder")} />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('phoneNumber')}</label>
                        <input type="tel" className="w-full bg-slate-50 border-none py-5 px-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition-all" placeholder={t("phonePlaceholder")} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('resumeCv')}</label>
                        <div className="flex items-center justify-center w-full">
                           <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-slate-100 border-dashed bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-3">
                                 <Share2 size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{t('uploadDocument')}</span>
                              </div>
                              <input type="file" className="hidden" />
                           </label>
                        </div>
                     </div>
                   </div>

                   <div className="pt-6">
                     <button type="submit" className="w-full h-16 bg-primary-darker text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg hover:shadow-[#ff7f50]/20">
                       {t('submitMyApplication')}
                     </button>
                     <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                       {t('privacyPolicyAgree')} <a href="#" className="text-primary hover:underline">{t('privacyPolicy')}</a>
                     </p>
                   </div>
                 </form>
               </div>
             )}
           </div>

           {/* ── Sidebar Actions ── */}
           <aside className="w-full lg:w-96 shrink-0 space-y-8">
             <div className="bg-white p-8 shadow-xl shadow-slate-200/40 border border-white sticky top-32">
               <div className="mb-8 p-6 bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">{t('deadline')}</div>
                  <div className="text-lg font-bold text-primary-darker flex items-center">
                     <Calendar size={18} className="mr-3 text-primary" />
                    {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' }) : t('openUntilFilled')}
                 </div>
              </div>

              {!isClosed ? (
                <div className="space-y-4">
                   {job.application_method === 'external' && job.application_url ? (
                      <a href={job.application_url} target="_blank" rel="noopener noreferrer" 
                         className="w-full h-16 flex items-center justify-center bg-primary-darker text-white text-sm font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg hover:shadow-[#ff7f50]/30 group">
                         {t('applyExternally')} <ExternalLink size={18} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                   ) : (
                      <a href="#apply"
                         className="w-full h-16 flex items-center justify-center bg-primary-darker text-white text-sm font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg hover:shadow-[#ff7f50]/30 group">
                         {t('applyNow')} <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
                      </a>
                   )}
                   <button className="w-full h-16 flex items-center justify-center bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                      <Share2 size={18} className="mr-3" /> {t('sharePosition')}
                   </button>
                </div>
              ) : (
                <div className="p-8 bg-red-50 border border-red-100 text-center">
                   <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <Clock size={24} className="text-red-500" />
                   </div>
                   <h4 className="text-red-900 font-bold mb-1">{t('positionClosed')}</h4>
                   <p className="text-red-700 text-xs font-medium">{t('positionClosedBody')}</p>
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                 {job.specializations && job.specializations.length > 0 && (
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('expertiseRequired')}</h4>
                       <div className="flex flex-wrap gap-2">
                          {job.specializations.map((spec: any) => (
                             <span key={spec.id} className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 ">
                                {spec.name}
                             </span>
                          ))}
                       </div>
                    </div>
                 )}

                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('additionalMeta')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-4 border border-slate-100">
                          <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">{t('openings')}</div>
                          <div className="text-sm font-bold text-primary-darker">{job.positions_available || 1}</div>
                       </div>
                       <div className="bg-slate-50 p-4 border border-slate-100">
                          <div className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-1">{t('experience')}</div>
                          <div className="text-sm font-bold text-primary-darker">{job.experience_level || t('professionalFallback')}</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
