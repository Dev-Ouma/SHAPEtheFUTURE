import React from "react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { 
  BookMarked,
  Database,
  Search,
  ArrowRight,
  MonitorPlay,
  ShieldCheck,
  Archive,
  Globe
} from "lucide-react";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [page, t] = await Promise.all([
    getPage("library", locale),
    getTranslations({ locale, namespace: "Library" }),
  ]);
  return {
    title: page?.title || t("metaTitleFallback"),
    description: page?.summary || t("metaDescFallback"),
  };
}

export default async function LibraryHub({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [page, t] = await Promise.all([
    getPage("library", locale),
    getTranslations({ locale, namespace: "Library" }),
  ]);

  const titleParts = page?.title?.trim().split(/\s+/) || [];
  const titleLead = titleParts[0] || t("titleFallback");
  const titleRest = titleParts.length > 1 ? titleParts.slice(1).join(" ") : (page?.title ? "" : t("titleFallbackAccent"));

  const resources = [
    {
      title: t("ejournals"),
      desc: t("ejournalsDesc"),
      icon: <Database size={40} />,
      color: "text-primary",
      link: "/library/databases" as const,
    },
    {
      title: t("repository"),
      desc: t("repositoryDesc"),
      icon: <Archive size={40} />,
      color: "text-secondary",
      link: "/library/e-resources" as const,
    },
    {
      title: t("multimedia"),
      desc: t("multimediaDesc"),
      icon: <MonitorPlay size={40} />,
      color: "text-emerald-500",
      link: "/library" as const,
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
           <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32" />
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10 space-y-8">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-1 bg-secondary" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t("eyebrow")}</span>
           </div>

           <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif italic mb-8">
             {titleLead}{titleRest ? <> <br /> <span className="text-primary not-italic">{titleRest}</span></> : null}
           </h1>
           <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed border-l-4 border-primary/30 pl-8 mb-12">
             {page?.summary || t("summaryFallback")}
           </p>
           
           <div className="pt-6 w-full max-w-3xl">
              <div className="flex overflow-hidden rounded-sm shadow-[20px_20px_0px_0px_rgba(3,123,144,0.1)] bg-primary-darker/50 backdrop-blur-md border border-white/10 group focus-within:border-primary transition-all">
                 <div className="flex items-center justify-center px-6 text-slate-500 group-focus-within:text-primary transition-colors">
                   <Search size={24} />
                 </div>
                 <input 
                   type="text" 
                   placeholder={t("searchPlaceholder")}
                   className="w-full bg-transparent py-6 px-6 font-bold text-white outline-none placeholder:text-slate-500"
                 />
                 <button className="bg-primary text-white hover:bg-secondary font-black uppercase tracking-widest text-[11px] px-12 transition-colors">
                   {t("search")}
                 </button>
              </div>
           </div>
        </div>
      </header>

      {page?.content && (
        <section className="py-20 bg-white border-b border-slate-100">
           <div className="container mx-auto px-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed prose prose-lg prose-slate prose-headings:text-primary-darker prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif"
             dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
           />
        </section>
      )}

      <section className="py-32 bg-slate-50 border-none">
        <div className="container mx-auto px-6 max-w-7xl">
           <div className="mb-20">
              <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter leading-none font-serif">{t("hubsTitle")}</h2>
              <p className="text-slate-500 font-medium mt-4">{t("hubsBody")}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-primary-darker">
              {resources.map((res, i) => (
                <div key={i} className="bg-white p-12 transition-all group flex flex-col rounded-sm shadow-[15px_15px_0px_0px_rgba(15,23,42,0.05)] hover:shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-2 border border-slate-100">
                   <div className={`mb-10 transition-transform group-hover:scale-110 ${res.color}`}>
                      {res.icon}
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">{res.title}</h3>
                   <p className="text-slate-500 text-sm leading-relaxed font-medium flex-grow mb-8">{res.desc}</p>
                   <Link href={res.link} className={`inline-flex items-center space-x-3 ${res.color} font-black uppercase tracking-widest text-[11px] pb-1 transition-all`}>
                      <span>{t("browseCatalog")}</span>
                      <ArrowRight size={16} />
                   </Link>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="md:w-1/2 p-12 bg-white space-y-8 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] rounded-sm border border-slate-200 text-primary-darker">
               <div className="w-16 h-16 bg-primary-darker flex items-center justify-center text-white">
                 <Globe size={32} />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{t("openAccessTitle")}</h3>
               <p className="text-slate-600 font-medium leading-relaxed">
                  {t("openAccessBody")}
               </p>
               <ul className="space-y-4 pt-4">
                  {[t("openAccess1"), t("openAccess2"), t("openAccess3")].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm font-bold text-slate-500 uppercase tracking-widest">
                       <ShieldCheck size={16} className="text-primary" />
                       <span>{item}</span>
                    </li>
                  ))}
               </ul>
            </div>
            <div className="md:w-1/2 space-y-8">
               <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif">{t("economyTitle")} <br/> {t("economyTitleAccent")}</h2>
               <p className="text-slate-500 text-lg font-medium leading-relaxed">
                 {t("economyBody")}
               </p>
               <div className="pt-8 flex gap-6">
                 <div className="space-y-2">
                   <p className="text-4xl font-black text-primary-darker tracking-tighter">10M+</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("indexedArticles")}</p>
                 </div>
                 <div className="space-y-2">
                   <p className="text-4xl font-black text-primary-darker tracking-tighter">99.9%</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("platformUptime")}</p>
                 </div>
               </div>
            </div>
         </div>
      </section>

      <section className="bg-primary-darker py-24 text-center">
         <div className="max-w-2xl mx-auto space-y-8 px-6 text-white">
            <BookMarked className="mx-auto text-secondary" size={64} strokeWidth={2.5} />
            <h2 className="text-4xl font-black uppercase tracking-tighter font-serif">{t("readyExplore")}</h2>
            <div className="flex justify-center flex-wrap gap-8 pt-4">
               <button className="btn-primary py-5 px-12 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                  {t("searchCatalogs")}
               </button>
            </div>
         </div>
      </section>
    </div>
  );
}
