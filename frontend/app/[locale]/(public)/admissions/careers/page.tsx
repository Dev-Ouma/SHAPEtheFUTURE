import React from 'react';
import { Link } from '@/i18n/routing';
import { getJobs, getJobCategories } from '@/lib/api';
import { Briefcase, MapPin, Clock, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PublicCareersControls } from '@/components/PublicCareersControls';
import { PublicCareersSidebar } from '@/components/PublicCareersSidebar';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  return {
    title: t('admMetaTitle'),
    description: t('admMetaDesc'),
  };
}

export default async function CareersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string; search?: string; page?: string; show_past?: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  const { data: jobs, total, page: currentPage, lastPage } = await getJobs({
    ...searchParams,
    locale: params.locale,
  });
  const categories = await getJobCategories();

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      {/* ── Premium Hero Section ── */}
      <div className="relative bg-primary-darker text-white pt-48 pb-32 overflow-hidden border-b-[8px] border-primary">
        {/* Abstract background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />


        <div className="container relative z-10 px-6 mx-auto max-w-7xl">
           <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-8 backdrop-blur-none">
                 <span className="w-2 h-2 bg-primary animate-pulse" />
                 {t('eyebrow')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-[0.95]">
                {t('title')} <br className="hidden md:block" /><span className="text-primary">{t('titleAccent')}</span> {t('titleOfEducation')}
              </h1>
              <p className="text-slate-300 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
                {t('admHeroBody')}
              </p>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ── Premium Sidebar Navigation ── */}
          <aside className="w-full lg:w-80 shrink-0">
            <PublicCareersSidebar categories={categories} />
          </aside>

          {/* ── Job Listings Display ── */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-8 py-5 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-primary-darker tracking-tight">
                 {searchParams.category ? categories.find((c: any) => c.slug === searchParams.category)?.name || t('positions') : t('openPositions')}
              </h2>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center bg-slate-50 px-4 py-2 border border-slate-100">
                 <span className="w-2 h-2 bg-emerald-500 mr-3" />
                 {total === 1 ? t('activeListings', { count: total }) : t('activeListingsPlural', { count: total })}
              </div>
            </div>

            <PublicCareersControls 
               total={total} 
               currentPage={currentPage} 
               lastPage={lastPage} 
            />
            
            {searchParams.show_past === 'true' && (
               <div className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white px-8 py-5 border-l-4 border-primary mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">{t('archiveMode')}</h4>
                  <p className="text-xs font-bold text-slate-400">{t('archiveModeBody')}</p>
               </div>
            )}

            {jobs.length === 0 ? (
              <div className="bg-white p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-50 flex items-center justify-center mb-6">
                   <Briefcase size={32} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-primary-darker tracking-tight mb-3">{t('noResultsTitle')}</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">{t('noResultsBody')}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job: any) => {
                  const urgency = job.days_remaining !== undefined && job.days_remaining <= 3 ? (
                     <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 flex items-center">
                       <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 animate-pulse" /> {t('closingSoon')}
                     </span>
                  ) : job.days_remaining !== undefined && job.days_remaining <= 7 ? (
                     <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 flex items-center">
                       <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2" /> {t('deadlineApproaching')}
                     </span>
                  ) : null;

                  const categorySlug = job.job_category?.slug || 'general';
                  const detailUrl = `/admissions/careers/${categorySlug}/${job.slug}`;
                  const isPast = searchParams.show_past === 'true';

                  return (
                    <div key={job.id} className="block group relative">
                      {/* Base Card Link */}
                      <Link href={detailUrl} className="absolute inset-0 z-10" aria-label={`${t('viewDetails')} ${job.title}`} />

                      <div className={`bg-white p-8 border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:border-[#ff7f50]/20 transition-all duration-500 relative overflow-hidden flex flex-col h-full ${isPast ? 'opacity-70 grayscale hover:grayscale-0' : ''}`}>
                        
                        <div className="relative z-0 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                          <div>
                            <div className="flex items-center flex-wrap gap-3 mb-4">
                              <span className="text-[10px] px-3 py-1.5 bg-primary-darker text-white font-black uppercase tracking-wider">
                                 {job.job_category?.name || 'General'}
                              </span>
                              {job.division && (
                                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                   {job.division.name} {job.department ? <><ChevronRight size={10} className="mx-1 opacity-40"/> {job.department.name}</> : ''}
                                 </span>
                              )}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-primary-darker group-hover:text-primary transition-colors tracking-tight leading-tight">
                              {job.title}
                            </h3>
                          </div>
                          <div className="shrink-0 md:pt-1">
                             {isPast ? (
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 flex items-center">
                                   <Clock size={12} className="mr-2" /> {t('archivedClosed')}
                                </span>
                             ) : urgency}
                          </div>
                        </div>

                        <div className="relative z-0 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-8 bg-slate-50/50 border border-slate-100 p-6 w-full">
                          <div className="space-y-1.5">
                             <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t('location')}</div>
                             <div className="text-sm font-bold text-primary-darker flex items-center">
                               <MapPin size={14} className="mr-2 text-primary" />
                               {job.location || t('nairobiFallback')} {job.is_remote && <span className="text-slate-400 ml-1 font-medium">{t('remoteParen')}</span>}
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t('typeLabel')}</div>
                             <div className="text-sm font-bold text-primary-darker flex items-center">
                               <Clock size={14} className="mr-2 text-primary" />
                               {job.employment_type || t('fullTimeFallback')}
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t('openings')}</div>
                             <div className="text-sm font-bold text-primary-darker">
                               {(job.positions_available || 1) === 1
                                 ? t('positionCount', { count: job.positions_available || 1 })
                                 : t('positionCountPlural', { count: job.positions_available || 1 })}
                             </div>
                          </div>
                          <div className="space-y-1.5">
                             <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t('reference')}</div>
                             <div className="text-sm font-black text-primary-darker uppercase tracking-wider font-mono">
                               {job.reference_code}
                             </div>
                          </div>
                        </div>

                        <div className="mt-auto relative z-20 flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-100 gap-6">
                          <div className="flex flex-wrap items-center gap-2">
                             {job.specializations?.slice(0, 3).map((spec: any) => (
                               <span key={spec.id} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-100 shadow-sm px-3 py-1.5 flex items-center">
                                 <CheckCircle2 size={12} className="mr-1.5 text-primary opacity-70" />
                                 {spec.name}
                               </span>
                             ))}
                             {job.specializations?.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400 px-2 py-1">
                                   {t('moreSpecs', { count: job.specializations.length - 3 })}
                                </span>
                             )}
                          </div>
                          
                          {/* Apply Now Button - Direct Link support */}
                          {job.application_method === 'external' && job.application_url && !isPast ? (
                             <a 
                               href={job.application_url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="shrink-0 flex items-center justify-center px-6 py-3 bg-primary-darker text-white hover:bg-[#ff7f50] hover:text-white text-sm font-black tracking-widest uppercase transition-all shadow-lg shadow-transparent hover:shadow-primary/20"
                             >
                               {t('applyExternally')}
                               <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                             </a>
                          ) : (
                             <Link 
                               href={detailUrl} 
                               className={`shrink-0 flex items-center justify-center px-6 py-3 ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-primary-darker text-white group-hover:bg-[#ff7f50] group-hover:text-white'} text-sm font-black tracking-widest uppercase transition-all shadow-lg shadow-transparent group-hover:shadow-primary/20`}
                             >
                               {isPast ? t('viewDetails') : t('applyNow')}
                               <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                             </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
