import React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { 
  FlaskConical,
  Globe,
  Briefcase,
  User,
  Users,
  ArrowRight,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getResearchProgrammes, getSchools, resolveImageUrl } from "@/lib/api";
import ResearchProgrammesFilter from "@/components/research/ResearchProgrammesFilter";

export const revalidate = 60;

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-slate-50   text-slate-500   border-slate-100",
  planned:   "bg-amber-50   text-amber-700   border-amber-100",
  archived:  "bg-red-50     text-red-500     border-red-100",
};

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Research" });
  return {
    title: t("progListMetaTitle"),
    description: t("progListMetaDesc"),
  };
}

export default async function ResearchProgrammesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "Research" });
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const [programmesData, schools] = await Promise.all([
    getResearchProgrammes({
      ...searchParams,
      page,
      statusVisibility: "Published",
      locale: params.locale,
    }),
    getSchools(params.locale),
  ]);

  const programmes = programmesData?.data || [];
  const total      = programmesData?.total || 0;
  const limit      = programmesData?.limit || 10;
  const totalPages = programmesData?.lastPage || Math.ceil(total / limit) || 1;

  const buildPageUrl = (p: number) => {
    const urlParams = new URLSearchParams(searchParams);
    urlParams.set("page", String(p));
    return `/research/programmes?${urlParams.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[140px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ff7f50]/8 rounded-full blur-[120px] -ml-40 -mb-40" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-1 bg-[#ff7f50]" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t("progListEyebrow")}</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-7">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase font-serif mb-6">
                {t("progListTitle")} <span className="text-primary italic">{t("progListTitleAccent")}</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed mb-6">
                {t("progListBody")}
              </p>
              <p className="text-sm text-slate-500 font-medium border-l-2 border-primary pl-4 max-w-xl">
                {t("progListBody2")}
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-12">
              <div className="grid grid-cols-2 gap-12">
                {[
                  { icon: <Activity size={20} />, value: String(total), label: t("totalProgrammes"), color: "text-primary" },
                  { icon: <Briefcase size={20} />, value: String(schools.length) || '0', label: t("hostSchools"), color: "text-[#ff7f50]" },
                ].map((st, i) => (
                  <div key={i} className="space-y-2">
                    <div className={`${st.color}`}>{st.icon}</div>
                    <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{st.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <React.Suspense fallback={<div className="h-[73px] bg-white border-b border-slate-100" />}>
        <ResearchProgrammesFilter schools={schools} />
      </React.Suspense>

      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-16 pb-8 border-b border-slate-50">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker italic">
                {searchParams.search ? t("resultsFor", { search: searchParams.search }) : t("allProgrammes")}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                {t("initiativesFound", { count: total })}
              </p>
            </div>
            {searchParams.search || searchParams.schoolId || searchParams.status ? (
              <Link
                href="/research/programmes"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-darker border-b border-slate-200 pb-0.5 transition-colors"
              >
                {t("clearFilters")}
              </Link>
            ) : null}
          </div>

          {programmes.length === 0 ? (
            <div className="py-48 text-center bg-slate-50 border border-slate-100">
              <FlaskConical size={64} className="mx-auto text-slate-200 mb-8" />
              <h3 className="text-xl font-black uppercase tracking-tighter font-serif text-primary-darker italic mb-4">
                {t("noProgrammesFound")}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-xs mx-auto">
                {t("noProgrammesHint")}
              </p>
              <Link href="/research/programmes" className="mt-8 inline-block text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-0.5">
                {t("clearAllFilters")}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {programmes.map((prog: any) => {
                const statusCls = STATUS_STYLES[prog.status] || STATUS_STYLES.planned;
                const coverUrl  = resolveImageUrl(prog.cover_image_url);
                const teamCount = prog.team_members?.length || 0;
                const year      = prog.start_date ? new Date(prog.start_date).getFullYear() : null;

                return (
                  <Link
                    key={prog.id}
                    href={`/research/programmes/${prog.slug}`}
                    className="group flex flex-col bg-white border border-slate-100 hover:border-slate-300 hover:shadow-2xl transition-all duration-500"
                  >
                    {coverUrl ? (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={coverUrl}
                          alt={prog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-primary-darker/40" />
                        <span className={`absolute top-4 left-4 px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${statusCls}`}>
                          {prog.status}
                        </span>
                      </div>
                    ) : (
                      <div className="h-48 bg-primary-darker relative overflow-hidden flex items-center justify-center">
                        <FlaskConical size={80} className="text-primary/20" />
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        <span className={`absolute top-4 left-4 px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${statusCls}`}>
                          {prog.status}
                        </span>
                        {year && (
                          <span className="absolute top-4 right-4 text-[10px] font-black text-white/40 uppercase tracking-widest">{year}</span>
                        )}
                      </div>
                    )}

                    <div className="p-10 flex-grow flex flex-col gap-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">
                          {prog.school?.name || t("institutionalInitiative")}
                        </p>
                        <h3 className="text-2xl font-black uppercase tracking-tighter font-serif italic text-primary-darker leading-tight group-hover:text-primary transition-colors">
                          {prog.title}
                        </h3>
                      </div>

                      <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 flex-grow">
                        {prog.summary || prog.overview}
                      </p>

                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <User size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("lead")}</p>
                            <p className="text-[10px] font-black uppercase tracking-tight text-primary-darker truncate">
                              {prog.lead_researcher?.full_name || t("institutional")}
                            </p>
                          </div>
                        </div>

                        {prog.funding_source ? (
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <DollarSign size={13} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("fundedBy")}</p>
                              <p className="text-[10px] font-black uppercase tracking-tight text-primary-darker truncate">
                                {prog.funding_source}
                              </p>
                            </div>
                          </div>
                        ) : teamCount > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                              <Users size={13} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("team")}</p>
                              <p className="text-[10px] font-black uppercase tracking-tight text-primary-darker">{t("researchersCount", { count: teamCount })}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="px-10 py-6 bg-slate-50 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                      {prog.grant_amount ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          KES {parseFloat(prog.grant_amount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{t("exploreProgramme")}</span>
                      )}
                      <div className="w-9 h-9 bg-primary-darker text-white flex items-center justify-center group-hover:bg-primary transition-all">
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="mt-24 flex items-center justify-center gap-4">
              {page > 1 && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary-darker hover:text-white hover:border-slate-900 transition-all"
                >
                  <ChevronLeft size={18} />
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={`w-12 h-12 flex items-center justify-center text-[11px] font-black uppercase tracking-widest transition-all border ${
                    p === page
                      ? "bg-primary-darker text-white border-slate-900"
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-primary-darker"
                  }`}
                >
                  {p}
                </Link>
              ))}

              {page < totalPages && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary-darker hover:text-white hover:border-slate-900 transition-all"
                >
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>
          )}

          {total > 0 && (
            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
              {t("showingProgrammes", {
                from: Math.min((page - 1) * limit + 1, total),
                to: Math.min(page * limit, total),
                total,
              })}
            </p>
          )}
        </div>
      </section>

      <section className="py-32 bg-primary-darker text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto px-6 relative z-10 space-y-10">
          <Globe className="mx-auto text-primary" size={56} strokeWidth={1.5} />
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none font-serif italic">
            {t("partnerInventors")} <br /><span className="text-primary not-italic">{t("partnerInventorsAccent")}</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-medium text-lg leading-relaxed">
            {t("partnerInventorsBody")}
          </p>
          <div className="flex justify-center gap-6 pt-4 flex-wrap">
            <Link href="/about/contact" className="bg-primary text-white py-5 px-14 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] transition-all">
              {t("initiatePartnership")}
            </Link>
            <Link href="/research" className="bg-white/5 border border-white/10 text-white py-5 px-14 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              {t("researchHub")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
