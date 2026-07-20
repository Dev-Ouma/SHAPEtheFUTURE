import React from 'react';
import { Link } from '@/i18n/routing';
import { 
  MapPin, Clock, ChevronRight,
  Building, GraduationCap, Globe, ChevronLeft,
  Wifi, Star, Filter, History, SlidersHorizontal, X
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import CareersSearchForm from '@/components/careers/CareersSearchForm';
import { getTranslations } from 'next-intl/server';
import { withLocaleSeo } from '@/lib/seo';

// searchParams keeps the route dynamic; fetches use the Next Data Cache.
export const revalidate = 60;

async function getJobs(params: Record<string, string>) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/careers?${query}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [], total: 0, page: 1, lastPage: 1, filters: { employment_types: [], experience_levels: [] } };
    return await res.json();
  } catch {
    return { data: [], total: 0, page: 1, lastPage: 1, filters: { employment_types: [], experience_levels: [] } };
  }
}

async function getTaxonomies() {
  try {
    const [catRes, divRes, specRes] = await Promise.all([
      fetch(`${API_URL}/careers/taxonomies/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/careers/taxonomies/divisions`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/careers/taxonomies/specializations`, { next: { revalidate: 3600 } }),
    ]);
    return {
      categories: catRes.ok ? await catRes.json() : [],
      divisions: divRes.ok ? await divRes.json() : [],
      specializations: specRes.ok ? await specRes.json() : [],
    };
  } catch {
    return { categories: [], divisions: [], specializations: [] };
  }
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  return withLocaleSeo('/careers', params.locale, {
    title: t('metaTitle'),
    description: t('metaDesc'),
  });
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string): string {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v || '';
}

export default async function CareersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Careers' });
  const page      = getParam(searchParams, 'page') || '1';
  const search    = getParam(searchParams, 'search');
  const category  = getParam(searchParams, 'category');
  const division  = getParam(searchParams, 'division');
  const emp_type  = getParam(searchParams, 'employment_type');
  const exp_level = getParam(searchParams, 'experience_level');
  const is_remote = getParam(searchParams, 'is_remote');
  const show_past = getParam(searchParams, 'show_past');

  const queryParams: Record<string, string> = {
    page,
    limit: '9',
    locale: params.locale,
  };
  if (search)    queryParams.search = search;
  if (category)  queryParams.category = category;
  if (division)  queryParams.division = division;
  if (emp_type)  queryParams.employment_type = emp_type;
  if (exp_level) queryParams.experience_level = exp_level;
  if (is_remote === 'true') queryParams.is_remote = 'true';
  if (show_past === 'true') queryParams.show_past = 'true';

  const [result, taxonomies] = await Promise.all([
    getJobs(queryParams),
    getTaxonomies(),
  ]);

  const { data: jobs, total, lastPage, filters } = result;
  const currentPage = parseInt(page, 10) || 1;

  function buildUrl(updates: Record<string, string | null>) {
    const current: Record<string, string> = {};
    if (search)    current.search = search;
    if (category)  current.category = category;
    if (division)  current.division = division;
    if (emp_type)  current.employment_type = emp_type;
    if (exp_level) current.experience_level = exp_level;
    if (is_remote === 'true') current.is_remote = 'true';
    if (show_past === 'true') current.show_past = 'true';
    current.page = page;

    for (const [k, v] of Object.entries(updates)) {
      if (v === null) delete current[k];
      else current[k] = v;
    }
    const qs = new URLSearchParams(current).toString();
    return `/careers${qs ? `?${qs}` : ''}`;
  }

  const activeFilters = [
    search && { label: `"${search}"`, clear: buildUrl({ search: null, page: '1' }) },
    category && { label: taxonomies.categories.find((c: any) => c.slug === category)?.name || category, clear: buildUrl({ category: null, page: '1' }) },
    division && { label: taxonomies.divisions.find((d: any) => d.id === division)?.name || division, clear: buildUrl({ division: null, page: '1' }) },
    emp_type && { label: emp_type, clear: buildUrl({ employment_type: null, page: '1' }) },
    exp_level && { label: exp_level, clear: buildUrl({ experience_level: null, page: '1' }) },
    is_remote === 'true' && { label: t('remote'), clear: buildUrl({ is_remote: null, page: '1' }) },
    show_past === 'true' && { label: t('includingClosed'), clear: buildUrl({ show_past: null, page: '1' }) },
  ].filter(Boolean) as { label: string; clear: string }[];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
           <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-[#ff7f50]/10 rounded-full blur-[100px] -ml-32" />
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-1 bg-[#ff7f50]" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t('eyebrow')}</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif mb-12 italic">
              {t('title')} <br /> <span className="text-primary not-italic">{t('titleAccent')}</span>
           </h1>
           <div className="flex flex-wrap gap-8 items-end justify-between">
              <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
                {t('subtitle')}
              </p>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{total}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {show_past === 'true' ? t('pastRoles') : t('openRoles')}
                  </p>
                </div>
              </div>
           </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-primary-darker px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs">
                  <SlidersHorizontal size={16} /> {t('advancedFilters')}
                </div>
                {activeFilters.length > 0 && (
                  <Link href="/careers" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-[#ff7f50] transition-colors">
                    {t('clearAll')}
                  </Link>
                )}
              </div>

              <div className="p-6 space-y-6">
                <CareersSearchForm />

                <div className="border-t border-slate-100" />

                {taxonomies.categories.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">{t('category')}</label>
                    <div className="space-y-1.5">
                      <Link 
                        href={buildUrl({ category: null, page: '1' })}
                        scroll={false}
                        className={`block px-3 py-2 rounded-lg text-sm font-bold transition-colors ${!category ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {t('allCategories')}
                      </Link>
                      {taxonomies.categories.map((cat: any) => (
                        <Link 
                          key={cat.id}
                          href={buildUrl({ category: cat.slug, page: '1' })}
                          scroll={false}
                          className={`block px-3 py-2 rounded-lg text-sm font-bold transition-colors ${category === cat.slug ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100" />

                {taxonomies.divisions.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">{t('division')}</label>
                    <div className="mt-2 space-y-1">
                      {taxonomies.divisions.map((div: any) => (
                        <Link
                          key={div.id}
                          href={buildUrl({ division: div.id, page: '1' })}
                          scroll={false}
                          className={`block px-3 py-1.5 rounded text-xs font-bold transition-colors ${division === div.id ? 'text-primary font-black' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          {division === div.id ? '✓ ' : ''}{div.name}
                        </Link>
                      ))}
                      {division && (
                        <Link href={buildUrl({ division: null, page: '1' })} scroll={false} className="block text-xs text-red-400 font-bold px-3 hover:text-red-600 transition-colors">
                          ✕ {t('clearDivision')}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100" />

                {filters?.employment_types?.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">{t('employmentType')}</label>
                    <div className="flex flex-wrap gap-2">
                      {filters.employment_types.map((et: string) => (
                        <Link
                          key={et}
                          href={buildUrl({ employment_type: emp_type === et ? null : et, page: '1' })}
                          scroll={false}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${emp_type === et ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}
                        >
                          {et}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filters?.experience_levels?.length > 0 && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">{t('experienceLevel')}</label>
                    <div className="flex flex-wrap gap-2">
                      {filters.experience_levels.map((el: string) => (
                        <Link
                          key={el}
                          href={buildUrl({ experience_level: exp_level === el ? null : el, page: '1' })}
                          scroll={false}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${exp_level === el ? 'bg-primary-darker text-white border-primary-darker' : 'border-slate-200 text-slate-600 hover:border-primary-darker hover:text-primary-darker'}`}
                        >
                          {el}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100" />

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{t('options')}</label>
                  
                  <Link 
                    href={buildUrl({ is_remote: is_remote === 'true' ? null : 'true', page: '1' })}
                    scroll={false}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${is_remote === 'true' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <Wifi size={15} />
                    <span className="text-sm font-bold">{t('remoteAvailable')}</span>
                    <div className={`ml-auto w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${is_remote === 'true' ? 'bg-primary' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${is_remote === 'true' ? 'translate-x-4' : ''}`} />
                    </div>
                  </Link>

                  <Link
                    href={buildUrl({ show_past: show_past === 'true' ? null : 'true', page: '1' })}
                    scroll={false}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${show_past === 'true' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    <History size={15} />
                    <span className="text-sm font-bold">{t('showClosedRoles')}</span>
                    <div className={`ml-auto w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${show_past === 'true' ? 'bg-amber-400' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${show_past === 'true' ? 'translate-x-4' : ''}`} />
                    </div>
                  </Link>
                </div>

              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-primary-darker uppercase tracking-tight font-serif">
                  {show_past === 'true' ? t('pastRoles') : t('openPositions')}
                </h2>
                <p className="text-slate-500 font-medium mt-1 text-sm">
                  {t('resultsFound', { count: total })}
                  {currentPage > 1 && ` ${t('pageOf', { page: currentPage, total: lastPage })}`}
                </p>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {activeFilters.map((f) => (
                  <Link key={f.label} href={f.clear} scroll={false} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                    {f.label} <X size={12} />
                  </Link>
                ))}
              </div>
            )}

            {jobs.length > 0 ? (
              <div className="space-y-5">
                {jobs.map((job: any) => {
                  const isClosed = job.application_deadline && new Date(job.application_deadline) < new Date();
                  return (
                    <Link href={`/careers/${job.slug}`} key={job.id} className="group block">
                      <div className={`border rounded-2xl p-7 hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                        isClosed ? 'bg-slate-50 border-slate-200 opacity-75 hover:opacity-100' : 'bg-white border-slate-100 hover:border-primary/30 shadow-sm'
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {job.is_featured && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                                <Star size={10} /> {t('featured')}
                              </span>
                            )}
                            {isClosed ? (
                              <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-full">{t('closed')}</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">{t('open')}</span>
                            )}
                            {job.is_remote && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                                <Wifi size={10} /> {t('remote')}
                              </span>
                            )}
                            {job.employment_type && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-full">{job.employment_type}</span>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-2 group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                          <p className="text-slate-500 font-medium text-sm mb-4 line-clamp-2">{job.summary}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                             {job.division?.name && (
                               <div className="flex items-center gap-1.5"><Building size={12} /> {job.division.name}</div>
                             )}
                             {job.location && (
                               <div className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</div>
                             )}
                             {job.experience_level && (
                               <div className="flex items-center gap-1.5"><GraduationCap size={12} /> {job.experience_level}</div>
                             )}
                             {job.application_deadline && (
                               <div className={`flex items-center gap-1.5 ${isClosed ? 'text-red-400' : 'text-amber-500'}`}>
                                 <Clock size={12} /> 
                                 {isClosed ? t('closedPrefix') : t('daysLeft', { days: job.days_remaining || '' })}
                                 {new Date(job.application_deadline).toLocaleDateString(params.locale === 'sw' ? 'sw-KE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </div>
                             )}
                          </div>
                        </div>
                        <div className="shrink-0">
                           <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all text-slate-400">
                              <ChevronRight size={22} />
                           </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 p-20 text-center flex flex-col items-center justify-center rounded-2xl">
                <Filter size={48} className="text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-primary-darker uppercase tracking-tight mb-2">{t('noRolesTitle')}</h3>
                <p className="text-slate-500 font-medium max-w-md mb-8">{t('noRolesBody')}</p>
                <Link href="/careers" className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#ff7f50] transition-colors">
                  {t('clearAllFilters')}
                </Link>
              </div>
            )}

            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-3 mt-16">
                <Link
                  href={buildUrl({ page: String(currentPage - 1) })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${currentPage <= 1 ? 'opacity-40 pointer-events-none border-slate-100 text-slate-400' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'}`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeft size={16} /> {t('previous')}
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                        p === currentPage
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>

                <Link
                  href={buildUrl({ page: String(currentPage + 1) })}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${currentPage >= lastPage ? 'opacity-40 pointer-events-none border-slate-100 text-slate-400' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'}`}
                  aria-disabled={currentPage >= lastPage}
                >
                  {t('next')} <ChevronRight size={16} />
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      <section className="py-28 bg-primary-darker text-white">
        <div className="container mx-auto px-6 max-w-7xl">
           <div className="text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-serif mb-4">{t('whyTitle')}</h2>
             <p className="text-slate-400 font-medium max-w-xl mx-auto">{t('whySubtitle')}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {[
               { icon: GraduationCap, color: 'text-primary', title: t('whyAcademic'), desc: t('whyAcademicDesc') },
               { icon: Globe, color: 'text-[#ff7f50]', title: t('whyImpact'), desc: t('whyImpactDesc') },
               { icon: Building, color: 'text-emerald-400', title: t('whyModern'), desc: t('whyModernDesc') },
             ].map(({ icon: Icon, color, title, desc }) => (
               <div key={title} className="flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                   <Icon size={32} className={color} />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-widest mb-4">{title}</h3>
                 <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{desc}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

    </div>
  );
}
