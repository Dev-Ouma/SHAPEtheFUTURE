"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Linkedin, 
  MapPin, 
  Briefcase, 
  RefreshCw,
  User,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { API_URL, resolveImageUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";

export default function AlumniDirectory() {
  const t = useTranslations("Alumni");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    year: "",
    programme: "",
    industry: "",
  });
  
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [programmes, setProgrammes] = useState<string[]>([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    fetch(`${API_URL}/programmes?limit=100`)
      .then(res => res.json())
      .then(data => {
         const pList = data.data ? data.data.map((p: any) => p.title) : [];
         setProgrammes(pList);
      })
      .catch(err => console.error("Failed to load programmes", err));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  useEffect(() => {
    fetchProfiles();
  }, [search, filters, page]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        year: filters.year,
        programme: filters.programme,
        industry: filters.industry,
        page: page.toString(),
        limit: "9",
      });
      const res = await fetch(`${API_URL}/alumni/profiles?${params}`);
      const data = await res.json();
      setProfiles(data.data || []);
      setLastPage(data.lastPage || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
         <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 mb-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
               <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t("dirSearchPlaceholder")} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent hover:border-slate-200 p-5 pl-16 rounded-2xl text-sm font-bold text-primary-dark outline-none focus:bg-white focus:border-primary transition-all focus:ring-4 focus:ring-primary/5"
                  />
               </div>
               <div className="flex flex-col md:flex-row gap-4">
                 <select 
                   className="bg-slate-50 border border-transparent hover:border-slate-200 p-5 rounded-2xl text-sm font-bold text-primary-dark outline-none focus:bg-white focus:border-primary transition-all focus:ring-4 focus:ring-primary/5 cursor-pointer min-w-[200px]"
                   value={filters.year}
                   onChange={(e) => setFilters({...filters, year: e.target.value})}
                 >
                    <option value="">{t("allGradYears")}</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
                 <div className="relative min-w-[250px]">
                   <input 
                     list="directory-programmes"
                     placeholder={t("selectProgramme")}
                     value={filters.programme}
                     onChange={(e) => setFilters({...filters, programme: e.target.value})}
                     className="w-full bg-slate-50 border border-transparent hover:border-slate-200 p-5 rounded-2xl text-sm font-bold text-primary-dark outline-none focus:bg-white focus:border-primary transition-all focus:ring-4 focus:ring-primary/5"
                   />
                   <datalist id="directory-programmes">
                      {programmes.map(p => <option key={p} value={p} />)}
                   </datalist>
                 </div>
                 <button 
                   onClick={() => {setSearch(""); setFilters({year: "", programme: "", industry: ""})}}
                   className="p-5 bg-primary-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-xl shadow-primary-dark/20 flex items-center justify-center min-w-[140px]"
                 >
                    {t("resetFilters")}
                 </button>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-4">
               <div className="flex flex-wrap items-center gap-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">{t("quickFilters")}</span>
                 {['Tech', 'Finance', 'Healthcare', 'Engineering'].map(ind => (
                   <button 
                     key={ind}
                     onClick={() => setFilters({...filters, industry: ind})}
                     className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                       filters.industry === ind 
                         ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                         : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                     }`}
                   >
                     {ind}
                   </button>
                 ))}
               </div>
               
               <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <ListIcon size={18} />
                  </button>
               </div>
            </div>
         </div>

         {loading ? (
           <div className="py-32 flex flex-col items-center justify-center space-y-6">
              <RefreshCw className="animate-spin text-primary" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("filteringDirectory")}</p>
           </div>
         ) : profiles.length === 0 ? (
           <div className="py-32 text-left space-y-6">
              <User size={64} className="mx-auto text-slate-100" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("noAlumniFound")}</p>
           </div>
         ) : viewMode === 'grid' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
              <AnimatePresence mode="popLayout">
                 {profiles.map((alum) => (
                   <motion.div 
                     key={alum.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white border border-slate-100 p-10 rounded-3xl group hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                   >
                      {alum.isFeatured && (
                        <div className="absolute top-0 right-0 px-6 py-2 bg-secondary text-white text-[8px] font-black uppercase tracking-widest italic rounded-bl-xl shadow-lg">
                           {t("featuredSpotlight")}
                        </div>
                      )}
                      <div className="flex items-center gap-6 mb-8">
                         <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl group-hover:border-primary/10 transition-colors">
                            <SafeImage
                              src={resolveImageUrl(alum.image_url)}
                              alt={alum.name}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tight text-primary-dark group-hover:text-primary transition-colors">{alum.name}</h4>
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                               <MapPin size={10} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{alum.country}</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 mt-auto relative z-10">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                               <div className="flex items-center gap-2 text-slate-400">
                                  <GraduationCap size={14} className="text-primary" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">{t("graduated")}</span>
                               </div>
                               <p className="text-sm font-bold text-primary-dark">{alum.graduationYear}</p>
                            </div>
                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                               <div className="flex items-center gap-2 text-slate-400">
                                  <Briefcase size={14} className="text-secondary" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">{t("industry")}</span>
                               </div>
                               <p className="text-sm font-bold text-primary-dark truncate" title={alum.industry}>{alum.industry}</p>
                            </div>
                         </div>
                         
                         <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner group-hover:bg-primary-darker transition-colors duration-500">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{t("currentEmployer")}</p>
                            <p className="text-base font-bold italic truncate" title={alum.employer}>{alum.employer}</p>
                         </div>

                         <div className="flex items-center justify-between pt-4">
                            <a href={alum.linkedIn} target="_blank" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#0A66C2] hover:text-white transition-colors shadow-sm">
                               <Linkedin size={16} />
                            </a>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center gap-2 group/btn">
                               <span>{t("viewProfile")}</span>
                               <span className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                                 <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                               </span>
                            </button>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
         ) : (
           <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mt-12">
              <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="col-span-4">{t("colProfile")}</div>
                 <div className="col-span-2">{t("colProgramme")}</div>
                 <div className="col-span-2">{t("colGraduation")}</div>
                 <div className="col-span-3">{t("colIndustry")}</div>
                 <div className="col-span-1 text-right">{t("colConnect")}</div>
              </div>
              <div className="divide-y divide-slate-50">
                 <AnimatePresence mode="popLayout">
                    {profiles.map((alum) => (
                      <motion.div 
                        key={alum.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-slate-50/50 transition-colors items-center group"
                      >
                         <div className="col-span-4 flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                               <SafeImage
                                 src={resolveImageUrl(alum.image_url)}
                                 alt={alum.name}
                                 fill
                                 sizes="48px"
                                 className="object-cover"
                               />
                            </div>
                            <div>
                               <h4 className="font-black text-primary-dark uppercase tracking-tight text-sm flex items-center gap-2">
                                  {alum.name}
                                  {alum.isFeatured && <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(255,127,80,0.5)]"></span>}
                               </h4>
                               <div className="flex items-center gap-1 text-slate-400 mt-1">
                                  <MapPin size={10} />
                                  <span className="text-[9px] font-bold uppercase tracking-widest">{alum.country}</span>
                               </div>
                            </div>
                         </div>
                         <div className="col-span-2 text-xs font-bold text-slate-600 truncate pr-4">
                            {alum.programme}
                         </div>
                         <div className="col-span-2 flex items-center gap-2">
                            <GraduationCap size={14} className="text-primary" />
                            <span className="text-xs font-bold text-slate-600">{alum.graduationYear}</span>
                         </div>
                         <div className="col-span-3">
                            <p className="text-xs font-bold text-primary-dark">{alum.industry}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{alum.employer}</p>
                         </div>
                         <div className="col-span-1 flex items-center justify-end gap-3">
                            <a href={alum.linkedIn} target="_blank" className="p-2 text-slate-300 hover:text-[#0A66C2] transition-colors">
                               <Linkedin size={18} />
                            </a>
                            <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                               <ChevronRight size={14} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
         )}
         
         {!loading && profiles.length > 0 && lastPage > 1 && (
           <div className="flex justify-center items-center space-x-6 mt-16">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-6 py-3 border border-slate-200 text-xs font-black uppercase tracking-widest text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t("previous")}
              </button>
              <span className="text-xs font-bold text-slate-500">{t("pageOf", { page, lastPage })}</span>
              <button 
                disabled={page === lastPage}
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                className="px-6 py-3 border border-slate-200 text-xs font-black uppercase tracking-widest text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t("next")}
              </button>
           </div>
         )}
      </div>
    </div>
  );
}
