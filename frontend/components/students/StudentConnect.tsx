"use client";

import React, { useState } from "react";
import { 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Twitter, 
  Facebook, 
  Linkedin,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { API_URL } from "@/lib/api";

export default function StudentConnect() {
  const t = useTranslations("Students");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [settings, setSettings] = useState<any>({});

  React.useEffect(() => {
    fetch(`${API_URL}/settings/public`)
      .then(res => res.json())
      .then(data => {
        const settingsObj = Array.isArray(data) 
          ? data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
          : data;
        setSettings(settingsObj);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 2000);
  };

  const channels = [
    { icon: Phone, label: t("supportLine"), value: settings.student_support_phone || "+254 700 000 000", color: "text-blue-500" },
    { icon: Mail, label: t("supportEmailLabel"), value: settings.student_support_email || "students@ouk.ac.ke", color: "text-red-500" },
    { icon: MapPin, label: t("physicalOffice"), value: settings.student_support_office || "OUK Student Centre, 2nd Floor", color: "text-green-500" },
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-darker pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("connectPageEyebrow")}</h2>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{t("connectPageTitle")} <span className="text-secondary not-italic">{t("connectPageAccent")}</span></h1>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
               <div className="space-y-16">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("getInTouch")}</h2>
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark">{t("directChannels")} <span className="text-secondary not-italic">{t("directChannelsAccent")}</span></h3>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed">{t("directChannelsBody")}</p>
                  </div>

                  <div className="space-y-8">
                     {channels.map((item, i) => (
                       <div key={i} className="flex items-center gap-8 group cursor-pointer p-6 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <div className={`p-4 bg-white shadow-xl ${item.color} group-hover:scale-110 transition-transform`}>
                             <item.icon size={24} />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                             <p className="text-xl font-black text-primary-dark uppercase tracking-tight">{item.value}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-12 border-t border-slate-100 space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("followUpdates")}</h4>
                     <div className="flex gap-4">
                        {[Twitter, Facebook, Linkedin].map((Icon, i) => (
                          <button key={i} className="w-12 h-12 bg-primary-dark text-white flex items-center justify-center hover:bg-secondary transition-all shadow-xl">
                             <Icon size={20} />
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 p-12 md:p-16 border border-slate-100 relative overflow-hidden">
                  <div className="relative z-10 space-y-10">
                     <div className="space-y-4">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-primary-dark italic">{t("submitFeedback")} <span className="text-secondary not-italic">{t("submitFeedbackAccent")}</span></h3>
                        <p className="text-sm text-slate-500 font-medium">{t("feedbackHint")}</p>
                     </div>

                     <AnimatePresence mode="wait">
                        {formStatus === "success" ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-12 text-center space-y-6"
                          >
                             <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                <CheckCircle2 size={40} />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-2xl font-black uppercase tracking-tight text-primary-dark">{t("thankYou")}</h4>
                                <p className="text-slate-500 font-medium italic">{t("feedbackReceived")}</p>
                             </div>
                             <button 
                               onClick={() => setFormStatus("idle")}
                               className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-2"
                             >
                                {t("submitAnother")}
                             </button>
                          </motion.div>
                        ) : (
                          <motion.form 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit} 
                            className="space-y-6"
                          >
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("fullName")}</label>
                                   <input required type="text" className="w-full px-6 py-4 bg-white border border-slate-200 focus:border-primary outline-none transition-all font-medium text-sm" placeholder={t("namePlaceholder")} />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("regNumber")}</label>
                                   <input required type="text" className="w-full px-6 py-4 bg-white border border-slate-200 focus:border-primary outline-none transition-all font-medium text-sm" placeholder={t("regPlaceholder")} />
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("category")}</label>
                                <select className="w-full px-6 py-4 bg-white border border-slate-200 focus:border-primary outline-none transition-all font-medium text-sm">
                                   <option>{t("catGeneral")}</option>
                                   <option>{t("catAcademic")}</option>
                                   <option>{t("catFacilities")}</option>
                                   <option>{t("catFinancial")}</option>
                                   <option>{t("catOther")}</option>
                                </select>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("messageLabel")}</label>
                                <textarea required rows={4} className="w-full px-6 py-4 bg-white border border-slate-200 focus:border-primary outline-none transition-all font-medium text-sm resize-none" placeholder={t("messagePlaceholder")} />
                             </div>

                             <button 
                               disabled={formStatus === "submitting"}
                               type="submit" 
                               className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all shadow-2xl flex items-center justify-center space-x-4"
                             >
                                {formStatus === "submitting" ? (
                                  <>
                                     <RefreshCw size={16} className="animate-spin" />
                                     <span>{t("processing")}</span>
                                  </>
                                ) : (
                                  <>
                                     <Send size={16} />
                                     <span>{t("submitResponse")}</span>
                                  </>
                                )}
                             </button>
                          </motion.form>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 bg-slate-50 border-t border-slate-100">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-white p-12 md:p-20 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
               <div className="md:w-1/2 space-y-8">
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark italic leading-none">{t("trackTicket")} <span className="text-secondary not-italic">{t("trackTicketAccent")}</span></h3>
                     <p className="text-lg text-slate-500 font-medium">{t("trackTicketBody")}</p>
                  </div>
                  <div className="flex gap-4">
                     <input type="text" className="flex-1 px-8 py-5 bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all font-black uppercase tracking-widest text-xs" placeholder={t("refPlaceholder")} />
                     <button className="px-10 py-5 bg-primary-dark text-white font-black uppercase tracking-widest text-[11px] hover:bg-primary transition-all">{t("track")}</button>
                  </div>
               </div>
               <div className="md:w-1/2 space-y-12">
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-left">{t("ourCommitment")}</h4>
                     <p className="text-xl text-primary-dark font-black uppercase tracking-tight italic leading-snug">&ldquo;{t("commitmentQuote")}&rdquo;</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-3xl font-black text-secondary">98%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("resolutionRate")}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black text-secondary">24h</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("avgResponse")}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
