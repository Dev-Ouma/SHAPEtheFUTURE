"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import { 
  Search, 
  UserCheck, 
  FilePlus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { sanitizeHtml } from "@/lib/sanitize";

interface HowToApplyLayoutProps {
  page: any;
  breadcrumbs: any[];
}

const HowToApplyLayout: React.FC<HowToApplyLayoutProps> = ({ page, breadcrumbs }) => {
  const t = useTranslations("CmsLayouts");
  const steps = page.layout_data?.steps || [];
  const requirements = page.layout_data?.requirements || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "search": return <Search className="text-primary" size={24} />;
      case "user-check": return <UserCheck className="text-secondary" size={24} />;
      case "file-plus": return <FilePlus className="text-slate-400" size={24} />;
      case "shield-check": return <ShieldCheck className="text-primary" size={24} />;
      default: return <CheckCircle2 className="text-primary" size={24} />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case "primary": return "bg-primary";
      case "secondary": return "bg-secondary";
      case "slate": return "bg-slate-400";
      default: return "bg-primary";
    }
  };

  const portalLink = page.layout_data?.portal_link || "https://portal.ouk.ac.ke/register";
  const supportLink = page.layout_data?.support_link || "/portal";
  const isExternalSupport = supportLink.startsWith("http") || supportLink.includes("portal");

  return (
    <PageLayout
      title={page.title}
      summary={page.summary}
      breadcrumbs={breadcrumbs}
      bannerImage={page.banner_image}
      isWide={true}
    >
      <div className="space-y-32">
        {/* Pathway Header */}
        <section className="max-w-4xl">
           <div className="space-y-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-6">{t("pathwayBadge")}</span>
              <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-[0.85]">
                {t("digital")} <br/> <span className="italic">{t("first")}</span> <br/> {t("admissions")}
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                {t("pathwayBody")}
              </p>
           </div>
        </section>

        {/* Progressive Timeline */}
        <section className="relative">
           {/* Center Line for desktop */}
           <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-100 -translate-x-1/2 hidden md:block" />
           
           <div className="space-y-24">
              {steps.map((item: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-start gap-12 md:gap-24 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                    <div className="flex items-center space-x-6 text-slate-300">
                       <span className="text-5xl font-black font-serif italic">{item.step}</span>
                       <div className="h-[2px] w-12 bg-slate-100" />
                    </div>
                    
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-primary-darker">{item.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    
                    {item.link && (
                      item.link.startsWith('http') || item.link.includes('portal') ? (
                        <a 
                          href={item.link} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                           <span>{item.link_text || t("learnMore")}</span>
                           <ArrowRight size={14} />
                        </a>
                      ) : (
                        <Link 
                          href={item.link} 
                          className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                           <span>{item.link_text || t("learnMore")}</span>
                           <ArrowRight size={14} />
                        </Link>
                      )
                    )}
                    {!item.link && item.link_text && (
                      <div className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                         <Clock size={14} />
                         <span>{item.link_text}</span>
                      </div>
                    )}
                  </div>

                  {/* Marker */}
                  <div className="relative z-10 hidden md:block">
                     <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-xl group hover:border-[#ff7f50] transition-colors">
                        {getIcon(item.icon_type)}
                     </div>
                  </div>

                  <div className="w-full md:w-1/2 hidden md:block" />
                </motion.div>
              ))}
           </div>
        </section>

        {/* Requirements Matrix */}
        <section id="requirements" className="bg-slate-50 -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 border-y border-slate-100">
           <div className="max-w-7xl mx-auto space-y-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">{t("registryMatrix")}</span>
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary-darker font-serif leading-none">{t("entryRequirements")}</h2>
                 </div>
                 <p className="text-slate-500 font-medium max-w-sm">{t("requirementsBody")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {requirements.map((req: any, i: number) => (
                   <motion.div 
                     key={i}
                     whileHover={{ y: -10 }}
                     className="bg-white p-12 border border-slate-100 shadow-sm space-y-10 group"
                   >
                      <div className="space-y-3">
                         <div className={`h-1 w-12 ${getColorClass(req.color_type)} opacity-40 group-hover:w-full group-hover:opacity-100 transition-all duration-700`} />
                         <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker">{req.level}</h3>
                      </div>
                      
                      <ul className="space-y-6">
                         {req.docs.map((doc: string, j: number) => (
                           <li key={j} className="flex items-start space-x-4 text-xs font-medium text-slate-500 transition-colors">
                              <CheckCircle2 size={16} className="text-slate-200 mt-[-2px] group-hover:text-primary transition-colors" />
                              <span>{doc}</span>
                           </li>
                         ))}
                      </ul>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* High Impact CTA Portal */}
        <section className="bg-primary-darker py-32 px-12 rounded-[3rem] text-center space-y-16 relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 flex items-center justify-center rounded-full mb-8">
                 <ShieldCheck size={40} className="text-white/50" />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] max-w-3xl">
                {t("ctaReady")} <br/> <span className="text-white italic lowercase">{t("ctaThe")}</span> {t("ctaOpen")} <br/> <span className="text-secondary italic lowercase">{t("ctaOf")}</span> {t("ctaKenya")}
              </h2>
              
              <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto uppercase tracking-[0.2em] text-[10px]">
                {t("ctaProtocol")}
              </p>

              <div className="pt-10 flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <a 
                  href={portalLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-primary !text-white px-16 py-7 text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-3xl shadow-primary/20 flex items-center space-x-4">
                    <span>{t("startApplication")}</span>
                    <ExternalLink size={16} />
                  </button>
                </a>
                {isExternalSupport ? (
                  <a 
                    href={supportLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="bg-white/10 !text-white border border-white/20 px-16 py-7 text-sm font-black uppercase tracking-[0.3em] hover:bg-white hover:text-primary-darker transition-all">
                      {t("supportPortal")}
                    </button>
                  </a>
                ) : (
                  <Link href={supportLink}>
                    <button className="bg-white/10 !text-white border border-white/20 px-16 py-7 text-sm font-black uppercase tracking-[0.3em] hover:bg-white hover:text-primary-darker transition-all">
                      {t("supportPortal")}
                    </button>
                  </Link>
                )}
              </div>
            </div>
        </section>

        <div 
          className="dynamic-content prose prose-slate max-w-none pt-12"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} 
        />
      </div>
    </PageLayout>
  );
};

export default HowToApplyLayout;
