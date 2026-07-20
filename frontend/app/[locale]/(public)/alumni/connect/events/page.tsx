"use client";

import React, { useState, useEffect } from "react";
import AlumniLayout from "@/components/alumni/AlumniLayout";
import { Calendar, MapPin, RefreshCw, Clock, Filter, Search, ChevronRight, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { API_URL, getSettings } from "@/lib/api";

const STATUS_KEYS = ["Upcoming", "Past", "All"] as const;
const TYPE_KEYS = ["All Events", "Webinars", "Reunions", "Conferences", "Networking"] as const;

export default function AlumniEventsPage() {
  const t = useTranslations("Alumni");
  const locale = useLocale();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All Events");
  const [selectedStatus, setSelectedStatus] = useState<string>("Upcoming");

  useEffect(() => {
    fetch(`${API_URL}/alumni/events?locale=${encodeURIComponent(locale)}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    getSettings(locale).then(data => setSettings(data));
  }, [locale]);

  const statusLabel = (key: string) => {
    if (key === "Upcoming") return t("statusUpcoming");
    if (key === "Past") return t("statusPast");
    return t("statusAll");
  };

  const typeLabel = (key: string) => {
    const map: Record<string, string> = {
      "All Events": t("catAllEvents"),
      Webinars: t("catWebinars"),
      Reunions: t("catReunions"),
      Conferences: t("catConferences"),
      Networking: t("catNetworking"),
    };
    return map[key] || key;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isUpcoming = new Date(event.date) >= new Date();
    const matchesStatus = selectedStatus === "All" || (selectedStatus === "Upcoming" ? isUpcoming : !isUpcoming);
    const matchesType = selectedType === "All Events" || (event.type && event.type === selectedType);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AlumniLayout>
      <div className="bg-primary-dark pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6 max-w-3xl">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("eventsPageEyebrow")}</h2>
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic">{t("eventsPageTitle")} <span className="text-secondary not-italic">{t("eventsPageAccent")}</span></h1>
               <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  {settings.alumni_events_hero || t("eventsHeroFallback")}
               </p>
            </div>
         </div>
      </div>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
               <div className="lg:col-span-1">
                  <div className="sticky top-32 space-y-8">
                     <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input 
                             type="text" 
                             placeholder={t("searchEvents")} 
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full bg-slate-50 border border-transparent p-4 pl-12 rounded-2xl text-sm font-bold text-primary-dark outline-none focus:bg-white focus:border-primary transition-all focus:ring-4 focus:ring-primary/5"
                           />
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-8">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <Filter size={14} />
                              {t("eventStatus")}
                           </h4>
                           <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                              {STATUS_KEYS.map(status => (
                                 <button
                                   key={status}
                                   onClick={() => setSelectedStatus(status)}
                                   className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                     selectedStatus === status ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-primary-dark'
                                   }`}
                                 >
                                    {statusLabel(status)}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("categories")}</h4>
                           <div className="space-y-2">
                              {TYPE_KEYS.map((type, i) => (
                                 <label key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors border border-transparent hover:border-slate-100">
                                    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${selectedType === type ? 'text-primary' : 'text-slate-500 group-hover:text-primary-dark'}`}>
                                       {typeLabel(type)}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedType === type ? 'border-primary' : 'border-slate-300'}`}>
                                       {selectedType === type && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <input 
                                      type="radio" 
                                      name="eventType" 
                                      className="hidden" 
                                      checked={selectedType === type}
                                      onChange={() => setSelectedType(type)}
                                    />
                                 </label>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-3">
                  {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <RefreshCw className="animate-spin text-primary" size={48} />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("syncingEvents")}</p>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                       <Calendar size={64} className="text-slate-300" />
                       <div className="space-y-2">
                          <h3 className="text-xl font-black uppercase tracking-tight text-primary-dark">{t("noEventsFound")}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("noEventsHint")}</p>
                       </div>
                       <button 
                         onClick={() => {setSearchTerm(""); setSelectedStatus("All"); setSelectedType("All Events");}}
                         className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-slate-50 transition-all shadow-sm mt-4"
                       >
                         {t("clearFilters")}
                       </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-8">
                       <AnimatePresence mode="popLayout">
                          {filteredEvents.map((event, i) => (
                            <motion.div 
                              key={event.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex flex-col md:flex-row bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:border-primary/20 transition-all duration-500 group overflow-hidden"
                            >
                               <div className="md:w-2/5 relative overflow-hidden min-h-[250px]">
                                  <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                  
                                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl text-center border border-white/20">
                                     <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none mb-1">
                                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                                     </p>
                                     <p className="text-2xl font-black text-primary-dark leading-none">
                                        {new Date(event.date).getDate()}
                                     </p>
                                  </div>
                               </div>
                               <div className="p-8 md:p-10 flex-1 space-y-8 flex flex-col justify-between bg-white relative z-10">
                                  <div className="space-y-5">
                                     <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${new Date(event.date) >= new Date() ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-500'}`}>
                                           {new Date(event.date) >= new Date() ? t("statusUpcoming") : t("pastEvent")}
                                        </span>
                                        {event.type && (
                                           <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
                                              {event.type}
                                           </span>
                                        )}
                                     </div>
                                     
                                     <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary-dark leading-tight group-hover:text-primary transition-colors">
                                        {event.title}
                                     </h4>
                                     
                                     <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                                        {event.description}
                                     </p>
                                     
                                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl">
                                           <MapPin size={16} className="text-secondary shrink-0" />
                                           <span className="text-[10px] font-bold uppercase tracking-widest truncate" title={event.location}>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl">
                                           <Clock size={16} className="text-primary shrink-0" />
                                           <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">10:00 AM</span>
                                        </div>
                                     </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-6">
                                     <div className="flex items-center gap-2 text-slate-400">
                                        <Users size={16} />
                                        <span className="text-xs font-bold">{t("openToAllAlumni")}</span>
                                     </div>
                                     <a 
                                       href={event.rsvp_link} 
                                       target="_blank" 
                                       className="px-8 py-4 bg-primary-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:shadow-lg hover:shadow-secondary/30 transition-all flex items-center gap-3 group/btn"
                                     >
                                        <span>{new Date(event.date) >= new Date() ? t("rsvpNow") : t("viewRecap")}</span>
                                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                     </a>
                                  </div>
                               </div>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </section>
    </AlumniLayout>
  );
}
