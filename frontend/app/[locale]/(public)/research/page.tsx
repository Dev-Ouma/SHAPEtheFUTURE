export const revalidate = 300;
import React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { 
  BookOpen, 
  FileText, 
  Award,
  ChevronRight,
  Cpu,
  Sprout,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Quote
} from "lucide-react";
import { getPage, getResearchStats } from "@/lib/api";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [page, t] = await Promise.all([
    getPage("research", locale),
    getTranslations({ locale, namespace: "Research" }),
  ]);
  return {
    title: page?.title || t("metaTitleFallback"),
    description: page?.summary || t("metaDescFallback"),
  };
}

export default async function ResearchLandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [page, stats, t] = await Promise.all([
    getPage("research", locale),
    getResearchStats(),
    getTranslations({ locale, namespace: "Research" }),
  ]);

  const pillars = [
    {
      title: t("pillarPedagogy"),
      icon: <BookOpen className="text-primary" size={32} />,
      desc: t("pillarPedagogyDesc"),
    },
    {
      title: t("pillarAi"),
      icon: <Cpu className="text-[#ff7f50]" size={32} />,
      desc: t("pillarAiDesc"),
    },
    {
      title: t("pillarSustainability"),
      icon: <Sprout className="text-emerald-500" size={32} />,
      desc: t("pillarSustainabilityDesc"),
    },
    {
      title: t("pillarPolicy"),
      icon: <BarChart3 className="text-amber-500" size={32} />,
      desc: t("pillarPolicyDesc"),
    },
  ];

  return (
    <div className="bg-white min-h-screen">

      <header className="bg-primary-darker pt-48 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
           <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-[#ff7f50]/10 rounded-full blur-[100px] -ml-32" />
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
           <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-1 bg-[#ff7f50]" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t("eyebrow")}</span>
           </div>

           <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif mb-12 italic">
              {t("title")} <br /> <span className="text-primary not-italic">{t("titleAccent")}</span>
           </h1>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
              <div className="lg:col-span-8">
                <p className="text-2xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-12">
                  {page?.summary || t("summaryFallback")}
                </p>
                
                <div className="flex flex-wrap gap-6">
                  <Link href="/research/publications" className="group relative z-10">
                     <button className="bg-primary !text-white py-5 px-10 text-xs font-black uppercase tracking-widest flex items-center space-x-4 shadow-3xl shadow-primary/30 transition-all hover:scale-105">
                        <span>{t("exploreRepository")}</span>
                        <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                     </button>
                  </Link>
                  <div className="relative group max-w-xs w-full">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                     <input 
                      type="text" 
                      placeholder={t("findResearcher")}
                      className="w-full bg-white/5 border border-white/10 pl-16 pr-6 py-5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-slate-600"
                     />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-end">
                 <div className="flex items-center gap-4 text-primary font-black uppercase tracking-widest text-[10px] mb-6">
                    <Zap size={14} className="animate-bounce" /> {t("liveImpact")}
                 </div>
                 <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="text-right">
                       <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{stats.publications}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t("publications")}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{stats.citations}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t("globalCitations")}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </header>

      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Link href="/research/publications" className="col-span-1 md:col-span-2 bg-slate-50 p-12 border border-slate-100 group relative overflow-hidden transition-all hover:border-primary/20 hover:bg-white hover:shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-transform">
                 <FileText size={160} className="text-primary-darker" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-12">{t("registry01")}</p>
              <h3 className="text-5xl font-black text-primary-darker tracking-tighter uppercase font-serif mb-6 leading-none">{t("accessPublications")} <br/> {t("accessPublicationsAccent")}</h3>
              <p className="text-slate-500 font-medium max-w-md mb-12">{t("accessPublicationsBody")}</p>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest group-hover:translate-x-4 transition-transform">
                 {t("openRepository")} <ArrowRight size={16} />
              </div>
           </Link>

            <div className="space-y-8">
               <Link href="/research/projects" className="block bg-primary-darker p-10 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl hover:shadow-primary/10">
                  <TrendingUp className="absolute bottom-[-20px] right-[-20px] text-white/5 w-40 h-40 group-hover:rotate-12 transition-transform" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-8">{t("metricsHub")}</p>
                  <p className="text-6xl font-black tracking-tighter mb-2">{stats.projects}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("activeProjects")}</p>
                  <div className="absolute top-8 right-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowRight size={20} />
                  </div>
               </Link>
               <Link href="/research/grants" className="block bg-primary-darker p-10 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl hover:shadow-primary/10 border border-white/5">
                  <Award className="absolute bottom-[-20px] right-[-20px] text-white/10 w-40 h-40 group-hover:rotate-12 transition-transform" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-8">{t("fundingEcosystem")}</p>
                  <p className="text-6xl font-black tracking-tighter mb-2">{stats.grants}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("grantsAwarded")}</p>
                  <div className="absolute top-8 right-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowRight size={20} />
                  </div>
               </Link>
            </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl text-primary-darker">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
              <div className="max-w-2xl">
                 <h2 className="text-5xl font-black uppercase tracking-tighter leading-none font-serif mb-6">{t("pillarsTitle")}</h2>
                 <p className="text-slate-500 font-medium text-lg leading-relaxed">{t("pillarsBody")}</p>
              </div>
              <Link href="/about" className="text-xs font-black uppercase tracking-widest border-b-2 border-primary pb-2 hover:text-primary transition-colors">
                 {t("institutionalRoadmap")}
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((p, i) => (
                <div key={i} className="bg-white p-12 transition-all group flex flex-col border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2">
                   <div className="mb-12 w-16 h-16 bg-slate-50 flex items-center justify-center group-hover:bg-[#ff7f50] transition-colors">
                      <div className="group-hover:text-white transition-colors">{p.icon}</div>
                   </div>
                   <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{p.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed font-medium">{p.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-40 bg-white text-center">
         <div className="max-w-3xl mx-auto space-y-12 px-6">
            <Quote className="mx-auto text-primary" size={64} strokeWidth={2.5} />
            <h2 className="text-5xl md:text-7xl font-black text-primary-darker uppercase tracking-tighter font-serif leading-none italic">
               {t("ctaTitle")} <br /> <span className="text-primary not-italic">{t("ctaTitleAccent")}</span>
            </h2>
            <div className="flex justify-center flex-wrap gap-8 pt-6">
               <Link href="/research/publications">
                  <button className="bg-primary-darker !text-white py-6 px-16 text-sm font-black uppercase tracking-widest shadow-3xl shadow-slate-950/20 hover:bg-slate-800 transition-all">
                     {t("accessPortal")}
                  </button>
               </Link>
               <Link href="/about/governing-council">
                  <button className="bg-primary !text-white py-6 px-16 text-sm font-black uppercase tracking-widest shadow-3xl shadow-primary/20 hover:scale-105 transition-all">
                     {t("ourGovernance")}
                  </button>
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
