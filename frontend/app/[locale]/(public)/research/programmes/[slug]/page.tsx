import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { 
  getResearchProgramme, 
  getProjects, 
  getPublications,
  resolveImageUrl 
} from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Globe, 
  FlaskConical,
  Award,
  ChevronRight,
  User,
  FileText,
  Activity
} from 'lucide-react';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }): Promise<Metadata> {
  const programme = await getResearchProgramme(params.slug);
  if (!programme) return { title: 'Programme Not Found' };
  return {
    title: `${programme.title} | Research Programmes | OUK`,
    description: programme.summary || programme.overview?.substring(0, 160),
    openGraph: {
      title: programme.title,
      description: programme.summary || programme.overview?.substring(0, 160),
    }
  };
}

export default async function ResearchProgrammeDetailPage({ params }: { params: { slug: string; locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  const programme = await getResearchProgramme(params.slug);
  if (!programme) notFound();

  const [projectsRes, publicationsRes] = await Promise.all([
    getProjects({ programmeId: programme.id, limit: 10 }),
    getPublications({ programmeId: programme.id, limit: 10, locale: params.locale })
  ]);

  const projects      = projectsRes.data      || [];
  const publications  = publicationsRes.data  || [];
  const coverUrl      = resolveImageUrl(programme.cover_image_url);

  const statusBadge =
    programme.status === 'active'    ? 'bg-emerald-900/60 text-emerald-400 border-emerald-800' :
    programme.status === 'completed' ? 'bg-slate-800 text-slate-400 border-slate-700' :
    programme.status === 'planned'   ? 'bg-amber-900/60 text-amber-400 border-amber-800' :
                                       'bg-slate-800 text-slate-500 border-slate-700';

  const strategyItems = [
    { icon: <Target size={16} />, label: t('objectives'), color: 'text-primary', value: programme.objectives },
    { icon: <FlaskConical size={16} />, label: t('methodology'), color: 'text-[#ff7f50]', value: programme.methodology },
    { icon: <Award size={16} />, label: t('expectedOutcomes'), color: 'text-emerald-600', value: programme.expected_outcomes },
    { icon: <Globe size={16} />, label: t('nationalImpact'), color: 'text-slate-700', value: programme.impact },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="relative bg-primary-darker overflow-hidden">
        {coverUrl ? (
          <>
            <div className="absolute inset-0">
              <img
                src={coverUrl}
                alt={programme.title}
                className="w-full h-full object-cover opacity-25"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[160px] -mr-80 -mt-80" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff7f50]/8 rounded-full blur-[120px] -ml-40 -mb-40" />
          </>
        )}

        <div className="container mx-auto max-w-7xl px-6 pt-48 pb-24 relative z-10">
          <Link
            href="/research/programmes"
            className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-primary transition-all mb-16 group"
          >
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            <span>{t('allProgrammesBack')}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border ${statusBadge}`}>
              {programme.status}
            </span>
            {programme.school?.name && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {programme.school.name}
              </span>
            )}
            {programme.start_date && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Calendar size={12} />
                {t('sinceYear', { year: new Date(programme.start_date).getFullYear() })}
              </div>
            )}
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] italic font-serif mb-10 max-w-5xl">
            {programme.title}
          </h1>

          {programme.summary && (
            <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-2xl">
              {programme.summary}
            </p>
          )}
        </div>
      </header>

      <main className="pb-32">
        <div className="container mx-auto px-6 max-w-7xl pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            <div className="lg:col-span-8 space-y-24">
              <div className="p-12 bg-slate-50 border-l-4 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Target size={120} />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">{t('pillarOverview')}</h2>
                <p className="text-2xl text-primary-darker font-medium leading-relaxed italic font-serif">
                  {programme.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {strategyItems.map((item, i) => (
                  <div key={i} className="space-y-5">
                    <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] ${item.color} flex items-center gap-3`}>
                      {item.icon} {item.label}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-[15px]">
                      {item.value || <span className="text-slate-300 italic">{t('pendingPublication')}</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-primary-darker font-serif italic">
                    {t('activeProjects')}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('initiativesCount', { count: projects.length })}
                  </span>
                </div>

                {projects.length === 0 ? (
                  <p className="text-slate-300 italic font-medium text-sm">{t('noProjectsUnderPillar')}</p>
                ) : (
                  <div className="space-y-6">
                    {projects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/research/projects/${project.id}`}
                        className="group bg-white border border-slate-100 p-10 hover:border-slate-300 hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                      >
                        <div className="space-y-3 min-w-0">
                          <h4 className="text-xl font-black uppercase tracking-tight text-primary-darker group-hover:text-primary transition-colors leading-tight">
                            {project.title}
                          </h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User size={11} />
                            {project.principal_investigator?.full_name || t('institutionalLead')}
                          </p>
                        </div>
                        <div className="flex items-center gap-10 shrink-0">
                          {project.budget && (
                            <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-widest text-primary-darker">
                                {project.currency} {parseFloat(project.budget || '0').toLocaleString()}
                              </p>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{t('budget')}</p>
                            </div>
                          )}
                          <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-primary-darker font-serif italic">
                    {t('scholarlyOutput')}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t('papersCount', { count: publications.length })}
                  </span>
                </div>

                {publications.length === 0 ? (
                  <p className="text-slate-300 italic font-medium text-sm">{t('noPubsLinked')}</p>
                ) : (
                  <div className="space-y-14">
                    {publications.map((pub: any) => (
                      <Link
                        key={pub.id}
                        href={`/research/publications/${pub.slug}`}
                        className="group block"
                      >
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-primary mb-3">
                          <FileText size={11} /> {pub.type?.replace('_', ' ')}
                        </div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-primary-darker group-hover:text-primary transition-colors leading-tight mb-3">
                          {pub.title}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">{pub.abstract}</p>
                        <div className="flex items-center gap-5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pub.publication_year}</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{pub.journal_name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-10">
                <div className="bg-primary-darker p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 -mr-16 -mt-16 rounded-full blur-3xl" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-10">{t('programmeLeadership')}</h3>

                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-white/5 flex items-center justify-center text-white/60 shrink-0">
                      <User size={28} />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-tight text-base text-white leading-tight">
                        {programme.lead_researcher?.full_name || t('institutionalLead')}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        {programme.lead_researcher?.job_title || t('leadInvestigator')}
                      </p>
                      {programme.lead_researcher?.profile_slug && (
                        <Link
                          href={`/research/scholar/${programme.lead_researcher.profile_slug}`}
                          className="text-[9px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-0.5 mt-3 inline-block hover:border-primary transition-all"
                        >
                          {t('scholarProfile')}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/5">
                    {[
                      { label: t('hostSchool'), value: programme.school?.name || t('institutionalCentral') },
                      { label: t('statusLabel'), value: programme.status },
                      { label: t('startDate'), value: programme.start_date ? new Date(programme.start_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : t('activeLabel') },
                      ...(programme.end_date ? [{ label: t('targetEnd'), value: new Date(programme.end_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) }] : []),
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-start gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">{row.label}</p>
                        <p className="text-[11px] font-black uppercase text-white text-right">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 border border-slate-100 bg-slate-50">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-darker mb-8">{t('resourceEcosystem')}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('fundingBody')}</p>
                      <p className="text-sm font-black uppercase text-primary-darker">{programme.funding_source || t('institutionalBudget')}</p>
                    </div>
                    {programme.grant_amount && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('appropriatedValue')}</p>
                        <p className="text-sm font-black uppercase text-primary-darker">
                          KES {parseFloat(programme.grant_amount).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {programme.partners && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('partnersLabel')}</p>
                        <div className="space-y-1">
                          {programme.partners.split('\n').filter(Boolean).map((p: string, i: number) => (
                            <p key={i} className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{p}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {programme.team_members && programme.team_members.length > 0 && (
                  <div className="p-10 border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-darker mb-8">
                      {t('researchCohort')}
                      <span className="ml-3 text-slate-300">{programme.team_members.length}</span>
                    </h3>
                    <div className="space-y-5">
                      {programme.team_members.map((member: any) => (
                        <Link
                          key={member.id}
                          href={`/research/scholar/${member.profile_slug}`}
                          className="flex items-center gap-4 group"
                        >
                          <div className="w-9 h-9 bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-tight text-primary-darker group-hover:text-primary transition-colors truncate">
                              {member.full_name}
                            </p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{member.job_title || t('researcherLabel')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-10 bg-primary text-white">
                  <Activity className="mb-6 opacity-60" size={32} />
                  <h3 className="font-black uppercase tracking-tighter text-xl mb-4 leading-tight">{t('joinThisResearch')}</h3>
                  <p className="text-white/70 text-sm font-medium mb-8">{t('joinThisResearchBody')}</p>
                  <Link href="/about/contact" className="bg-white text-primary px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all inline-block">
                    {t('getInTouch')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
