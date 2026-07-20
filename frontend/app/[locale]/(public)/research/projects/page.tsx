import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getProjects, getSchools } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { 
  Briefcase, 
  Search, 
  ArrowRight, 
  User,
  Layers,
  FlaskConical,
  TrendingUp,
  Users
} from 'lucide-react';
import { ServerPagination } from '@/components/research/ServerPagination';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  return {
    title: t('projMetaTitle'),
    description: t('projMetaDesc'),
  };
}

export default async function ProjectsListingPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [projectsData, schools] = await Promise.all([
    getProjects({ ...searchParams, page }),
    getSchools(params.locale),
  ]);

  const projects = projectsData.data || [];
  const total = projectsData.total || 0;
  const limit = projectsData.limit || 10;
  const totalPages = projectsData.lastPage || Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="bg-primary-darker pt-44 pb-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 -mr-96 -mt-96 rounded-full blur-[120px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-1 bg-[#ff7f50]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t('projEyebrow')}</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] font-serif italic mb-12">
                 {t('projTitle')} <br /> <span className="text-primary not-italic">{t('projTitleAccent')}</span>
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-12 mt-12">
                <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
                   {t('projBody')}
                </p>

                <div className="grid grid-cols-2 gap-10 border-l border-white/10 pl-12">
                  {[
                    { label: t('projActive'), value: projectsData.total.toString(), icon: <FlaskConical size={16} /> },
                    { label: t('projTracks'), value: '8', icon: <TrendingUp size={16} /> },
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

        <section className="py-24 bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
           <div className="container mx-auto px-6">
              <form className="bg-slate-50 border border-slate-100 flex flex-col lg:flex-row shadow-2xl">
                 <div className="relative flex-grow border-b lg:border-b-0 lg:border-r border-slate-200">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="search"
                      defaultValue={searchParams.search}
                      placeholder={t('projSearchPlaceholder')}
                      className="w-full pl-16 pr-8 py-8 bg-transparent text-xs font-black uppercase outline-none"
                    />
                 </div>
                 <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200">
                    <select name="schoolId" defaultValue={searchParams.schoolId} className="w-full h-full px-8 py-8 bg-transparent text-[10px] font-black uppercase outline-none appearance-none cursor-pointer">
                       <option value="">{t('allSchools')}</option>
                       {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}
                    </select>
                 </div>
                 <button className="bg-primary-darker text-white px-12 py-8 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                    {t('filterResults')}
                 </button>
              </form>
           </div>
        </section>

        <section className="py-32 bg-white">
           <div className="container mx-auto px-6">
              {projects.length === 0 ? (
                <div className="text-center py-40 bg-slate-50 border border-slate-100">
                   <Briefcase size={64} className="mx-auto text-slate-200 mb-8" />
                   <h3 className="text-xl font-black uppercase tracking-tigher text-primary-darker font-serif">{t('registryVacant')}</h3>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">{t('registryVacantBody')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                   {projects.map((project: any) => (
                      <div key={project.id} className="group flex flex-col bg-white border border-slate-100 hover:border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-2">
                         <div className="p-10 flex-grow">
                            <div className="flex items-center justify-between mb-8">
                               <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border border-slate-100 ${
                                 project.status === 'ongoing' ? 'bg-blue-50 text-blue-600' : 
                                 project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                 'bg-slate-50 text-slate-400'
                               }`}>
                                  {project.status}
                               </span>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(project.start_date).getFullYear()}</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-primary-darker tracking-tighter uppercase font-serif mb-6 leading-tight group-hover:text-primary transition-colors italic">
                               {project.title}
                            </h3>
                            
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                               {project.description}
                            </p>

                            <div className="space-y-4 pt-8 border-t border-slate-50">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary">
                                     <User size={14} />
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('principalInvestigator')}</p>
                                     <p className="text-[11px] font-black text-primary-darker uppercase tracking-tight">{project.principal_investigator?.full_name || 'TBD'}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                     <Layers size={14} />
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('hostInstitution')}</p>
                                     <p className="text-[11px] font-black text-primary-darker uppercase tracking-tight">{project.school?.title || project.school?.name || t('institutionalWide')}</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-10 pt-0 flex items-center justify-between border-t border-slate-50 bg-slate-50/30 group-hover:bg-white transition-colors">
                            <div className="flex flex-wrap gap-2">
                               {project.research_themes?.slice(0, 2).map((theme: string) => (
                                  <span key={theme} className="text-[9px] font-black uppercase tracking-widest text-slate-400">#{theme}</span>
                               ))}
                            </div>
                            {project.principal_investigator?.slug && (
                              <Link href={`/research/scholar/${project.principal_investigator.slug}`} className="w-10 h-10 bg-primary-darker text-white flex items-center justify-center group-hover:bg-primary transition-all">
                                 <ArrowRight size={16} />
                              </Link>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
              )}
              {total > limit && (
                <ServerPagination 
                  currentPage={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                />
              )}
           </div>
        </section>

        <section className="py-24 bg-slate-50 text-center border-t border-slate-100">
           <div className="max-w-2xl mx-auto space-y-8 px-6 text-primary-darker">
              <Users className="mx-auto text-primary" size={64} strokeWidth={2.5} />
              <h2 className="text-4xl font-black uppercase tracking-tighter font-serif">{t('collaborateTitle')}</h2>
              <p className="text-slate-500 font-medium">{t('collaborateBody')}</p>
              <div className="flex justify-center flex-wrap gap-8 pt-4">
                 <Link href="/about/staff" className="btn-primary py-5 px-12 text-sm font-black uppercase tracking-widest">
                    {t('findCollaborators')}
                 </Link>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
