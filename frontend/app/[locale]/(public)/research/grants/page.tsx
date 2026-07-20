import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getGrants } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { 
  Award, 
  Search, 
  Building2, 
  ArrowRight, 
  User,
  Globe,
} from 'lucide-react';
import { ServerPagination } from '@/components/research/ServerPagination';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  return {
    title: t('grantMetaTitle'),
    description: t('grantMetaDesc'),
  };
}

export default async function GrantsListingPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [grantsData] = await Promise.all([
    getGrants({ ...searchParams, page })
  ]);

  const grants = grantsData.data || [];
  const total = grantsData.total || 0;
  const limit = grantsData.limit || 10;
  const totalPages = grantsData.lastPage || Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="bg-primary-darker pt-44 pb-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#ff7f50]/10 -ml-80 -mt-80 rounded-full blur-[120px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-1 bg-[#ff7f50]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t('grantEyebrow')}</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] font-serif italic mb-12">
                 {t('grantTitle')} <br /> <span className="text-primary not-italic">{t('grantTitleAccent')}</span>
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-12 mt-12">
                <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
                   {t('grantBody')}
                </p>

                <div className="grid grid-cols-2 gap-10 border-l border-white/10 pl-12">
                  {[
                    { label: t('awardedGrants'), value: total.toString(), icon: <Award size={16} /> },
                    { label: t('funders'), value: '12+', icon: <Building2 size={16} /> },
                  ].map((stat, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-center gap-3 text-primary mb-3">
                         {stat.icon}
                         <span className="text-4xl font-black text-white font-serif italic leading-none">{stat.value}</span>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-slate-100 italic font-serif">
           <div className="container mx-auto px-6">
              <form className="bg-slate-50 border border-slate-100 flex flex-col lg:flex-row shadow-2xl">
                 <div className="relative flex-grow">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="search"
                      defaultValue={searchParams.search}
                      placeholder={t('grantSearchPlaceholder')}
                      className="w-full pl-16 pr-8 py-8 bg-transparent text-xs font-black uppercase outline-none"
                    />
                 </div>
                 <button className="bg-primary-darker text-white px-12 py-8 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                    {t('initiateSearch')}
                 </button>
              </form>
           </div>
        </section>

        <section className="py-24 bg-white">
           <div className="container mx-auto px-6">
              <div className="max-w-5xl mx-auto space-y-12">
                 {grants.length === 0 ? (
                    <div className="text-center py-40 bg-slate-50 border border-slate-100">
                       <Award size={64} className="mx-auto text-slate-200 mb-8" />
                       <h3 className="text-xl font-black uppercase tracking-tigher text-primary-darker font-serif">{t('repoEmpty')}</h3>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">{t('repoEmptyBody')}</p>
                    </div>
                 ) : (
                    <>
                      {grants.map((grant: any) => (
                        <div key={grant.id} className="group grid grid-cols-1 lg:grid-cols-12 gap-12 p-12 bg-white border border-slate-100 hover:border-primary/20 hover:bg-slate-50/20 transition-all hover:shadow-2xl">
                           <div className="lg:col-span-8 flex flex-col justify-center">
                              <div className="flex items-center gap-4 mb-6">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 border border-primary/10">#{grant.external_id || 'OUK-GRANT'}</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(grant.awarded_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                              </div>
                              
                              <h3 className="text-3xl font-black text-primary-darker tracking-tighter uppercase font-serif mb-6 leading-none group-hover:text-primary transition-colors italic">
                                 {grant.title}
                              </h3>
                              
                              <p className="text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3">
                                 {grant.description}
                              </p>

                              <div className="flex flex-wrap gap-8 items-center">
                                 <div className="flex items-center gap-3">
                                    <Building2 size={16} className="text-[#ff7f50]" />
                                    <span className="text-[11px] font-black text-primary-darker uppercase tracking-tight">{grant.funder_name}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <User size={16} className="text-primary" />
                                    <span className="text-[11px] font-black text-primary-darker uppercase tracking-tight">{t('investigator', { name: grant.lead_investigator?.full_name || '—' })}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="lg:col-span-4 flex flex-col justify-center lg:items-end lg:text-right border-l lg:border-l border-slate-100 lg:pl-12">
                              <div className="mb-6">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('awardValue')}</p>
                                 <p className="text-4xl font-black text-primary-darker tracking-tighter tabular-nums font-serif italic">
                                    {grant.currency || 'KES'} {parseFloat(grant.amount).toLocaleString()}
                                 </p>
                              </div>
                              <div className="flex flex-col gap-4 w-full">
                                 {grant.url && (
                                    <a href={grant.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center lg:justify-end gap-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-[#ff7f50] transition-colors">
                                       {t('officialNotice')} <ArrowRight size={14} />
                                    </a>
                                 )}
                                 {grant.lead_investigator?.slug && (
                                    <Link href={`/research/scholar/${grant.lead_investigator.slug}`} className="inline-flex items-center justify-center lg:justify-end gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-darker transition-colors">
                                       {t('scholarProfile')} <ArrowRight size={14} />
                                    </Link>
                                 )}
                              </div>
                           </div>
                        </div>
                      ))}

                      {total > limit && (
                        <ServerPagination 
                          currentPage={page}
                          totalPages={totalPages}
                          total={total}
                          limit={limit}
                        />
                      )}
                    </>
                 )}
              </div>
           </div>
        </section>

        <section className="py-24 bg-slate-50 text-center border-t border-slate-100">
           <div className="max-w-2xl mx-auto space-y-8 px-6 text-primary-darker">
              <Globe className="mx-auto text-[#ff7f50]" size={64} strokeWidth={2.5} />
              <h2 className="text-4xl font-black uppercase tracking-tighter font-serif">{t('partnershipsTitle')}</h2>
              <p className="text-slate-500 font-medium">{t('partnershipsBody')}</p>
              <div className="flex justify-center flex-wrap gap-8 pt-4">
                 <Link href="/about" className="btn-primary py-5 px-12 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                    {t('institutionalOverview')}
                 </Link>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
