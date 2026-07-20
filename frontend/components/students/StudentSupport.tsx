"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Cpu, 
  DollarSign, 
  Accessibility, 
  HelpCircle, 
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { API_URL } from "@/lib/api";

export default function StudentSupport() {
  const t = useTranslations("Students");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/students/support-services`)
      .then(r => r.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      });
  }, []);

  const faqs = [
    { q: t("supportFaq1q"), a: t("supportFaq1a") },
    { q: t("supportFaq2q"), a: t("supportFaq2a") },
    { q: t("supportFaq3q"), a: t("supportFaq3a") },
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-darker pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("supportPageEyebrow")}</h2>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{t("supportPageTitle")} <span className="text-secondary not-italic">{t("supportPageAccent")}</span></h1>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            {loading ? (
               <div className="py-32 flex flex-col items-center justify-center space-y-6">
                  <RefreshCw className="animate-spin text-primary" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("loadingSupport")}</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {services.map((service, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      className="p-12 bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-12 group hover:bg-white hover:shadow-2xl transition-all"
                    >
                       <div className="p-8 bg-white shadow-xl text-primary shrink-0 h-fit group-hover:bg-primary group-hover:text-white transition-all">
                          {service.category === 'Counseling' && <Heart size={40} />}
                          {service.category === 'ICT' && <Cpu size={40} />}
                          {service.category === 'Financial Aid' && <DollarSign size={40} />}
                          {service.category === 'Accessibility' && <Accessibility size={40} />}
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{t("categorySupport", { category: service.category })}</span>
                             <h4 className="text-3xl font-black uppercase tracking-tight text-primary-dark">{service.name}</h4>
                             <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{service.description}</p>
                          </div>
                          <div className="pt-6 border-t border-slate-200 flex flex-col gap-4">
                             {service.contact_info && (
                               <a 
                                 href={service.contact_info.includes('@') ? `mailto:${service.contact_info}` : `tel:${service.contact_info}`}
                                 className="flex items-center gap-3 group/link"
                               >
                                  <MessageSquare size={16} className="text-slate-300 group-hover/link:text-secondary transition-colors" />
                                  <span className="text-xs font-bold text-slate-400 group-hover/link:text-secondary transition-colors">{service.contact_info}</span>
                               </a>
                             )}
                             {(service.apply_link || service.contact_info) ? (
                               <a 
                                  href={service.apply_link || (service.contact_info?.includes('@') ? `mailto:${service.contact_info}` : `tel:${service.contact_info}`)}
                                  target={service.apply_link ? "_blank" : "_self"}
                                  rel={service.apply_link ? "noopener noreferrer" : ""}
                                  className="w-fit px-8 py-3 bg-primary-dark text-white text-[9px] font-black uppercase tracking-widest hover:bg-secondary transition-all block text-center"
                               >
                                  {t("accessService")}
                               </a>
                             ) : (
                               <button disabled className="w-fit px-8 py-3 bg-slate-200 text-slate-400 text-[9px] font-black uppercase tracking-widest block text-center cursor-not-allowed">
                                  {t("accessService")}
                               </button>
                             )}
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            )}
         </div>
      </section>

      <section className="py-24 bg-primary-darker text-white">
         <div className="container mx-auto px-6 max-w-3xl text-center space-y-12">
            <div className="space-y-6">
               <HelpCircle size={64} className="mx-auto text-secondary" />
               <h3 className="text-4xl font-black uppercase tracking-tighter italic">{t("supportFaqsTitle")} <span className="text-secondary not-italic">{t("supportFaqsAccent")}</span></h3>
            </div>
            <div className="space-y-4 text-left">
               {faqs.map((faq, i) => (
                 <div key={i} className="p-8 bg-white/5 border border-white/10 space-y-4 hover:bg-white/10 transition-all">
                    <h4 className="text-lg font-black uppercase tracking-tight text-secondary">{faq.q}</h4>
                    <p className="text-slate-400 text-sm font-medium italic leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
