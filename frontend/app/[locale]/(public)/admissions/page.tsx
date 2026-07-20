import React from "react";
import { Link } from "@/i18n/routing";
import { 
  ClipboardCheck, 
  CreditCard, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  CalendarDays,
  ShieldAlert
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import AdmissionsCTA from "@/components/AdmissionsCTA";
import { getPage } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const page = await getPage("admissions", locale);
  const t = await getTranslations({ locale, namespace: "Admissions" });
  return withLocaleSeo("/admissions", locale, {
    title: page?.title || `Admissions | The Open University of Kenya`,
    description: page?.summary || t("summaryFallback"),
  });
}

export default async function AdmissionsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Admissions" });
  const page = await getPage("admissions", locale);

  const steps = [
    { title: t("stepIdentify"), desc: t("stepIdentifyDesc"), icon: <ClipboardCheck size={24}/> },
    { title: t("stepCredentials"), desc: t("stepCredentialsDesc"), icon: <FileText size={24}/> },
    { title: t("stepOffer"), desc: t("stepOfferDesc"), icon: <CheckCircle2 size={24}/> },
  ];

  const paths = [
    { title: t("pathUndergrad"), path: "/programmes", desc: t("pathUndergradDesc") },
    { title: t("pathPostgrad"), path: "/programmes?level=postgraduate", desc: t("pathPostgradDesc") },
    { title: t("pathProfessional"), path: "/academics/professional-development-courses", desc: t("pathProfessionalDesc") },
  ];

  const titleWords = page?.title ? page.title.split(" ") : null;

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-primary-darker pt-48 pb-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
           <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32" />
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10 space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
           <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-1 bg-secondary" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t("eyebrow")}</span>
           </div>

           <h1 className="text-4xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif italic mb-8">
             {titleWords ? titleWords[0] : t("titleFallbackBegin")} <br />{" "}
             <span className="text-primary not-italic">
               {titleWords ? titleWords.slice(1).join(" ") : t("titleFallbackJourney")}
             </span>
           </h1>
           <p className="text-base md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed border-l-0 md:border-l-4 border-primary/30 md:pl-8">
             {page?.summary || t("summaryFallback")}
           </p>
        </div>
      </header>

      {page?.content && (
        <section className="py-20 bg-white border-b border-slate-100">
           <div className="container mx-auto px-6 max-w-3xl text-lg text-slate-600 font-medium leading-relaxed prose prose-lg prose-slate prose-headings:text-primary-darker prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif"
             dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
           />
        </section>
      )}

      <section className="py-24 container mx-auto px-6 max-w-7xl -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-primary-darker">
           {paths.map((cat, i) => (
             <Link key={i} href={cat.path} className="bg-white p-12 shadow-[20px_20px_0px_0px_rgba(15,23,42,0.05)] hover:shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] group hover:-translate-y-4 transition-all duration-500 rounded-sm overflow-hidden flex flex-col h-full border border-slate-100/50">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{cat.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-10 flex-grow">{cat.desc}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{t("exploreNow")}</span>
                   <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
             </Link>
           ))}
        </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-xl space-y-4">
               <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter leading-none">{t("roadmapTitle")}</h2>
               <p className="text-slate-500 font-medium">{t("roadmapSubtitle")}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
               <Clock size={16} />
               <span>{t("roadmapTurnaround")}</span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="space-y-8 group">
                 <div className="w-16 h-16 bg-primary-darker text-white flex items-center justify-center rounded-sm shadow-xl group-hover:bg-[#ff7f50] hover:text-white transition-colors">
                    {step.icon}
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xl font-black uppercase tracking-tight">{step.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <section className="py-32 bg-slate-50 border-none">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-white shadow-[25px_25px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 rounded-sm overflow-hidden">
               <div className="lg:w-1/2 p-16 md:p-24 space-y-10 focus-group bg-white">
                  <div className="flex items-center space-x-4 text-primary">
                     <CreditCard size={32} strokeWidth={2.5} />
                     <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-primary-darker">{t("financeTitle")}</h2>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">{t("financeBody")}</p>
                  <ul className="space-y-4">
                     {[t("financeBullet1"), t("financeBullet2"), t("financeBullet3")].map((item, i) => (
                       <li key={i} className="flex items-center space-x-3 text-sm font-black text-slate-400 uppercase tracking-widest">
                          <CheckCircle2 size={16} className="text-primary" />
                          <span>{item}</span>
                       </li>
                     ))}
                  </ul>
               </div>
               <div className="lg:w-1/2 p-16 md:p-24 bg-slate-50/50 space-y-12">
                  <div className="space-y-6">
                     <div className="space-y-2 text-primary-darker">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("currentIntake")}</p>
                        <h4 className="text-2xl font-black uppercase">{t("cohortMay2024")}</h4>
                     </div>
                     <Link href="/admissions/calendar" className="text-[11px] font-black tracking-widest uppercase text-slate-500 border-b border-transparent hover:border-slate-900 pb-1 flex items-center space-x-2 w-fit transition-all">
                        <CalendarDays size={14} />
                        <span>{t("viewCalendar")}</span>
                     </Link>
                  </div>
                  <Link href="/admissions" className="block w-full btn-primary py-6 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 text-center">
                     {t("startApplication")}
                  </Link>
               </div>
            </div>
         </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-5xl">
         <div className="text-center space-y-6 mb-20 text-primary-darker">
            <HelpCircle size={48} className="mx-auto text-primary" strokeWidth={2.5} />
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none font-serif">{t("faqTitle")}</h2>
         </div>

         <div className="mt-20 p-12 bg-primary-darker text-white flex flex-col md:flex-row items-center justify-between gap-8 rounded-sm shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center space-x-6">
               <ShieldAlert className="text-secondary" size={48} />
               <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase tracking-tighter">{t("identityTitle")}</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t("identitySubtitle")}</p>
               </div>
            </div>
            <Link href="/contact" className="px-8 py-4 bg-white/10 hover:bg-[#ff7f50] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border border-white/5">
               {t("identitySubtitle")}
            </Link>
         </div>
      </section>

      <AdmissionsCTA />
    </div>
  );
}
