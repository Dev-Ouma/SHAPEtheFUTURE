"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { 
  Users, 
  Star, 
  RefreshCw,
  Award,
  Music,
  Trophy,
  X,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { API_URL } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function StudentCampusLife() {
  const t = useTranslations("Students");
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [joinClubModalOpen, setJoinClubModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [joinForm, setJoinForm] = useState({ studentName: '', studentId: '', email: '', message: '' });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/students/clubs`)
      .then(r => r.json())
      .then(data => {
        setClubs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;
    setIsSubmittingJoin(true);
    try {
      const res = await fetch(`${API_URL}/students/clubs/${selectedClub.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || t("joinSuccess"));
        setJoinClubModalOpen(false);
        setJoinForm({ studentName: '', studentId: '', email: '', message: '' });
      } else {
        toast.error(data.message || t("joinFail"));
      }
    } catch {
      toast.error(t("joinError"));
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const reps = [
    { title: t("repAcademic"), name: "Sarah Connor", year: t("repYear1") },
    { title: t("repInternational"), name: "Ahmed Hassan", year: t("repYear2") },
    { title: t("repWelfare"), name: "Lucy Gray", year: t("repYear3") },
  ];

  return (
    <div className="space-y-0">
      <section className="bg-primary-darker pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("campusEyebrow")}</h2>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{t("campusTitle")} <span className="text-secondary not-italic">{t("campusTitleAccent")}</span></h1>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
               <div className="space-y-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("joinCommunity")}</h2>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark leading-none">{t("clubsTitle")} <span className="text-secondary not-italic">{t("clubsTitleAccent")}</span></h3>
               </div>
            </div>

            {loading ? (
               <div className="py-32 flex flex-col items-center justify-center space-y-6">
                  <RefreshCw className="animate-spin text-primary" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("loadingClubs")}</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {clubs.map((club, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -6 }}
                      className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                    >
                       <div className="p-6 flex justify-between items-start">
                          <div className="p-4 bg-slate-50 shadow-sm text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                             {club.category === 'Sports' && <Trophy size={24} />}
                             {club.category === 'Academic' && <Award size={24} />}
                             {club.category === 'Arts' && <Music size={24} />}
                             {club.category === 'Leadership' && <Star size={24} />}
                             {!['Sports','Academic','Arts','Leadership'].includes(club.category) && <Users size={24} />}
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{club.category}</span>
                       </div>
                       <div className="px-6 pb-6 flex-grow space-y-3">
                          <h4 className="text-2xl font-black uppercase tracking-tight text-secondary leading-tight">{club.name}</h4>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-3">{club.description}</p>
                       </div>
                       <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t("ledBy")}</p>
                             <p className="text-xs font-black text-primary-dark">{club.leader_name || t("tba")}</p>
                          </div>
                          <button
                            onClick={() => { setSelectedClub(club); setJoinClubModalOpen(true); }}
                            className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-all flex items-center gap-2 group/btn"
                          >
                             <span>{t("joinNow")}</span>
                             <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </div>
            )}
         </div>
      </section>

      <section className="py-24 bg-primary-darker text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-48 opacity-5 pointer-events-none">
            <Trophy size={300} />
         </div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("governanceEyebrow")}</h2>
                     <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                        {t("governanceTitle")} <br/> <span className="text-secondary not-italic">{t("governanceAccent")}</span>
                     </h3>
                  </div>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed border-l-4 border-slate-800 pl-8">
                     {t("governanceBody")}
                  </p>
                  <div className="flex gap-6">
                     <button className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                        {t("meetReps")}
                     </button>
                     <button className="px-10 py-5 border-2 border-white/20 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all">
                        {t("electionNews")}
                     </button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {reps.map((rep, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 flex items-center gap-8 group">
                       <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black text-2xl group-hover:bg-secondary group-hover:text-white transition-all">
                          {rep.name.charAt(0)}
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-secondary">{rep.title}</p>
                          <h4 className="text-xl font-black uppercase tracking-tight">{rep.name}</h4>
                          <p className="text-xs text-slate-400 font-medium italic">{rep.year}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {typeof window !== 'undefined' && ReactDOM.createPortal(
        <AnimatePresence>
          {joinClubModalOpen && selectedClub && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-primary-darker/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg shadow-2xl relative overflow-hidden"
              >
                <div className="p-8 bg-primary text-white flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest font-serif leading-tight">{t("joinClubTitle", { name: selectedClub.name })}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">{t("joinClubSub")}</p>
                  </div>
                  <button onClick={() => setJoinClubModalOpen(false)} className="text-white/50 hover:text-white transition-colors p-1"><X size={20} /></button>
                </div>
                <form onSubmit={handleJoinSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("fullName")}</label>
                    <input required value={joinForm.studentName} onChange={e => setJoinForm({...joinForm, studentName: e.target.value})} type="text" className="w-full bg-slate-50 border border-slate-200 p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none" placeholder={t("namePlaceholder")} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("regNumber")}</label>
                      <input required value={joinForm.studentId} onChange={e => setJoinForm({...joinForm, studentId: e.target.value})} type="text" className="w-full bg-slate-50 border border-slate-200 p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none" placeholder={t("regPlaceholder")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("studentEmail")}</label>
                      <input required value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} type="email" className="w-full bg-slate-50 border border-slate-200 p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none" placeholder={t("emailPlaceholder")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("whyJoin")}</label>
                    <textarea required value={joinForm.message} onChange={e => setJoinForm({...joinForm, message: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-4 font-medium text-slate-600 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" placeholder={t("whyJoinPlaceholder")} />
                  </div>
                  <div className="pt-4 flex justify-end gap-4">
                    <button type="button" onClick={() => setJoinClubModalOpen(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">{t("cancel")}</button>
                    <button type="submit" disabled={isSubmittingJoin} className="btn-primary px-8 py-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                      {isSubmittingJoin ? t("submitting") : t("sendJoin")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
