"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "@/i18n/routing";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  LifeBuoy, 
  MessageSquare,
  ArrowRight,
  Bell,
  Cpu,
  Heart,
  DollarSign,
  Accessibility,
  Users,
  Star,
  Download,
  HelpCircle,
  FileText,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";

export default function StudentHome() {
  const t = useTranslations("Students");
  const locale = useLocale();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [supportServices, setSupportServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Join Club Modal State
  const [joinClubModalOpen, setJoinClubModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [joinForm, setJoinForm] = useState({ studentName: '', studentId: '', email: '', message: '' });
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

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
    } catch (error) {
      toast.error(t("joinError"));
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const iconMap: Record<string, any> = {
    Clock, FileText, BookOpen, Cpu, MessageSquare, Calendar, Heart, 
    Accessibility, DollarSign, Users, Star, LifeBuoy, Download, HelpCircle
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, suppRes, eveRes, clubsRes, qaRes, resRes] = await Promise.all([
          fetch(`${API_URL}/students/announcements`).then(r => r.json()),
          fetch(`${API_URL}/students/support-services`).then(r => r.json()),
          fetch(`${API_URL}/students/events?locale=${encodeURIComponent(locale)}`).then(r => r.json()),
          fetch(`${API_URL}/students/clubs`).then(r => r.json()),
          fetch(`${API_URL}/students/quick-actions`).then(r => r.json()),
          fetch(`${API_URL}/students/resources`).then(r => r.json()),
        ]);
        setAnnouncements(Array.isArray(annRes) ? annRes : []);
        setSupportServices(Array.isArray(suppRes) ? suppRes : []);
        setEvents(Array.isArray(eveRes) ? eveRes : []);
        setClubs(Array.isArray(clubsRes) ? clubsRes : []);
        setQuickActions(Array.isArray(qaRes) ? qaRes : []);
        setResources(Array.isArray(resRes) ? resRes : []);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  return (
    <div className="space-y-0">
      {/* 🟦 HERO SECTION */}
      <section className="bg-primary-darker py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end md:gap-8 gap-6">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.85] italic shrink-0 order-last md:order-first">
                   {t("heroTitle")} <br/> <span className="text-secondary not-italic">{t("heroTitleAccent")}</span>
                </h1>
                <div className="inline-flex items-center space-x-3 text-secondary order-first md:order-last md:pb-2">
                  <div className="w-12 h-px bg-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("heroEyebrow")}</span>
                </div>
              </div>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg border-l-4 border-slate-800 pl-8">
                 {t("heroBody")}
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/students/academics" className="px-10 py-5 bg-secondary text-white font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-2xl">
                   {t("accessResources")}
                </Link>
                <Link href="/academics/timetables" className="px-10 py-5 border-2 border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-primary-dark transition-all">
                   {t("viewTimetable")}
                </Link>
              </div>
            </div>
            <div className="relative group hidden lg:block aspect-[4/3]">
               <div className="absolute -inset-4 bg-secondary/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
               <SafeImage
                 src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920"
                 className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 border border-white/10 relative z-10 object-cover"
                 alt="Students"
                 fill
                 priority
                 sizes="50vw"
               />
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ QUICK ACTIONS */}
      <section className="-mt-16 relative z-30 mb-24">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {quickActions.map((action, i) => {
                 const IconComponent = iconMap[action.icon] || HelpCircle;
                 return (
                 <Link 
                   key={i} 
                   href={action.href}
                   className="p-8 bg-white border border-slate-100 shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center space-y-6"
                 >
                    <div className="p-4 bg-slate-50 text-slate-400 group-hover:text-white transition-all rounded-full" style={{ backgroundColor: action.color ? action.color + '15' : '', color: action.color }}>
                       <IconComponent size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark">{action.title}</span>
                 </Link>
               )})}
            </div>
         </div>
      </section>

      {/* 📢 ANNOUNCEMENTS */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
               <div className="space-y-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("announcementsEyebrow")}</h2>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-primary-dark leading-none italic">
                     {t("announcementsTitle")} <span className="text-secondary not-italic">{t("announcementsTitleAccent")}</span>
                  </h3>
               </div>
               <Link href="/news" className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center space-x-3 group border-b-2 border-primary pb-2">
                  <span>{t("viewAllNews")}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {announcements.map((ann, i) => (
                 <div key={i} className="p-10 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group flex gap-8">
                    <div className="shrink-0 pt-1">
                       <div className={`w-12 h-12 flex items-center justify-center text-white ${
                         ann.priority === 'Urgent' ? 'bg-red-500' : 'bg-primary'
                       }`}>
                          <Bell size={20} />
                       </div>
                    </div>
                    <div className="space-y-4 w-full">
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{ann.category}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-2xl font-black uppercase tracking-tight text-primary-dark leading-tight group-hover:text-secondary transition-colors">{ann.title}</h4>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{ann.content}</p>

                       {ann.media_url && (
                          <div className="mt-6 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white group-hover:shadow-md transition-all">
                             {ann.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video src={ann.media_url} controls className="w-full h-auto max-h-[250px] object-cover bg-black" />
                             ) : (
                                <div className="relative w-full h-[250px]">
                                  <SafeImage
                                    src={resolveImageUrl(ann.media_url)}
                                    alt={ann.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 600px"
                                    className="object-cover"
                                  />
                                </div>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 🤝 STUDENT SUPPORT */}
      <section className="py-32 bg-primary-darker text-white relative overflow-hidden">
         <div className="absolute bottom-0 right-0 p-48 opacity-10 pointer-events-none">
            <LifeBuoy size={300} />
         </div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("supportEyebrow")}</h2>
                     <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                        {t("supportTitle")} <br/> <span className="text-secondary not-italic">{t("supportTitleAccent")}</span>
                     </h3>
                  </div>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed border-l-4 border-slate-800 pl-8">
                     {t("supportBody")}
                  </p>
                  <Link href="/students/support" className="inline-flex px-10 py-5 bg-white text-primary-dark font-black uppercase tracking-widest text-[11px] hover:bg-secondary hover:text-white transition-all shadow-2xl">
                     {t("getHelpNow")}
                  </Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supportServices.map((service, i) => (
                    <div key={i} className="p-10 bg-white/5 border border-white/10 hover:bg-white/10 transition-all space-y-6 group">
                       <div className="text-secondary group-hover:scale-110 transition-transform w-fit">
                          {/* Map icons dynamically */}
                          {service.category === 'Counseling' && <Heart size={32} />}
                          {service.category === 'ICT' && <Cpu size={32} />}
                          {service.category === 'Financial Aid' && <DollarSign size={32} />}
                          {service.category === 'Accessibility' && <Accessibility size={32} />}
                       </div>
                       <h4 className="text-xl font-black uppercase tracking-tight">{service.name}</h4>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed">{service.description}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🌟 CAMPUS LIFE & EVENTS */}
      <section className="py-32 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-24">
               {/* Campus Life */}
               <div className="lg:w-1/2 space-y-16">
                  <div className="space-y-6 text-left">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("campusEyebrow")}</h2>
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark italic">{t("campusTitle")} <span className="text-secondary not-italic">{t("campusTitleAccent")}</span></h3>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed">{t("campusBody")}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {clubs.length > 0 ? clubs.map((club, i) => {
                         const getClubIcon = (cat: string) => {
                           switch(cat) {
                             case 'Sports': return LifeBuoy;
                             case 'Academic': return BookOpen;
                             case 'Arts': return Star;
                             case 'Leadership': return Star;
                             default: return Users;
                           }
                         };
                         const getCategoryColor = (cat: string) => {
                           switch(cat) {
                             case 'Sports': return 'bg-blue-500';
                             case 'Academic': return 'bg-primary';
                             case 'Arts': return 'bg-purple-500';
                             case 'Leadership': return 'bg-secondary';
                             default: return 'bg-slate-600';
                           }
                         };
                         const ClubIcon = getClubIcon(club.category);
                         return (
                         <div key={i} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                            {/* Card Header */}
                            <div className="p-6 flex justify-between items-start">
                               <div className={`w-14 h-14 ${getCategoryColor(club.category)} flex items-center justify-center text-white shrink-0`}>
                                  <ClubIcon size={24} />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  {club.category || 'General'}
                               </span>
                            </div>
                            {/* Card Body */}
                            <div className="px-6 pb-6 flex-grow space-y-3">
                               <h4 className="text-2xl font-black uppercase tracking-tight text-secondary leading-tight">{club.name}</h4>
                               <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{club.description}</p>
                            </div>
                            {/* Card Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                               {club.leader_name ? (
                                 <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("ledBy")}</p>
                                   <p className="text-sm font-black text-primary-darker">{club.leader_name}</p>
                                 </div>
                               ) : (
                                 <div className="text-[10px] text-slate-300 uppercase font-bold tracking-widest">{t("noLeader")}</div>
                               )}
                               <button
                                 onClick={() => { setSelectedClub(club); setJoinClubModalOpen(true); }}
                                 className="flex items-center gap-2 text-secondary hover:text-primary font-black uppercase tracking-widest text-[11px] transition-colors group/btn"
                               >
                                 <span>{t("joinNow")}</span>
                                 <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                               </button>
                            </div>
                         </div>
                      )}) : (
                         <div className="col-span-2 p-8 text-center text-slate-400 text-sm font-medium border border-slate-100 bg-slate-50">{t("noClubs")}</div>
                      )}
                  </div>
               </div>

               {/* Events */}
               <div className="lg:w-1/2 space-y-16">
                  <div className="space-y-6 text-left">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("eventsEyebrow")}</h2>
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark italic">{t("eventsTitle")} <span className="text-secondary not-italic">{t("eventsTitleAccent")}</span></h3>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed">{t("eventsBody")}</p>
                  </div>
                  <div className="space-y-8">
                     {events.slice(0, 3).map((event, i) => (
                       <div key={i} className="flex gap-8 group">
                          <div className="shrink-0 text-center space-y-1 bg-slate-50 p-4 border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all h-fit">
                             <span className="block text-2xl font-black italic font-serif leading-none">{new Date(event.date).getDate()}</span>
                             <span className="block text-[8px] font-black uppercase tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-secondary">
                                <span>{event.type}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-slate-400 italic">{event.location}</span>
                             </div>
                             <h4 className="text-xl font-black uppercase tracking-tight text-primary-dark leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                             <p className="text-sm text-slate-500 font-medium line-clamp-2">{event.description}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  <Link href="/students/campus-life" className="inline-flex text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-2 hover:text-secondary hover:border-secondary transition-all">
                     {t("viewAllEvents")}
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* 📥 RESOURCES & DOWNLOADS */}
      <section className="py-32 bg-slate-50">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-white p-12 md:p-20 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
               <div className="md:w-1/2 space-y-8">
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black uppercase tracking-tighter text-primary-dark leading-none">{t("formsTitle")} <br/> <span className="text-secondary not-italic">{t("formsTitleAccent")}</span></h3>
                     <p className="text-lg text-slate-500 font-medium">{t("formsBody")}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {resources.length > 0 ? resources.map((res, i) => (
                       <a href={res.file_url} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-4 text-primary hover:text-secondary cursor-pointer transition-all">
                          <Download size={20} />
                          <span className="text-xs font-black uppercase tracking-widest">{res.title}</span>
                       </a>
                     )) : (
                        <span className="text-slate-400 text-sm">{t("noResources")}</span>
                     )}
                  </div>
               </div>
               <div className="md:w-1/2 bg-primary-darker p-12 text-white space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 opacity-10">
                     <HelpCircle size={100} />
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-secondary">{t("needAssistance")}</h4>
                  <p className="text-slate-400 text-sm font-medium">{t("helpdeskBody")}</p>
                  <div className="flex gap-4">
                     <button className="px-8 py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">{t("chatAi")}</button>
                     <button className="px-8 py-4 border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-dark transition-all">{t("raiseTicket")}</button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Join Club Modal — rendered via Portal to escape parent overflow */}
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
