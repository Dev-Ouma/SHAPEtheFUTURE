"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Filter, 
  Clock, 
  Globe, 
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  ChevronLeft,
  X,
  School as SchoolIcon,
  LayoutGrid,
  List,
  RefreshCw
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getPrograms } from "@/lib/api";

interface School {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  level?: string;
  duration?: string;
  mode_of_delivery?: string[];
  overview?: string;
  enroll_link?: string;
  school: School;
}

export default function ProgrammesDiscovery({ 
  initialPrograms = [], 
  schools = [],
  initialTotal = 0,
  initialTotalPages = 1
}: { 
  initialPrograms: Program[], 
  schools: School[],
  initialTotal?: number,
  initialTotalPages?: number
}) {
  const t = useTranslations("Programmes");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get('school');
  const departmentParam = searchParams.get('department');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<any>({
    school: schoolParam || "",
    department: departmentParam || "",
    level: "",
    mode: ""
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // New states for server-side optimization
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Find selected school data based on active filter
  const selectedSchoolData = useMemo(() => {
    if (!activeFilters.school) return null;
    return schools.find(school => school.slug === activeFilters.school) || null;
  }, [activeFilters.school, schools]);

  // Sync state with URL params on initial mount
  useEffect(() => {
    setActiveFilters((prev: any) => ({ 
      ...prev, 
      school: schoolParam || "",
      department: departmentParam || ""
    }));
    setPage(parseInt(searchParams.get('page') || '1'));
  }, [schoolParam, departmentParam, searchParams]);

  // DB-Optimized Search & Filter Effect
  useEffect(() => {
    // Initial load check: skip if data already provided by server for the current view
    const isInitial = 
        !searchQuery && 
        !activeFilters.level && 
        !activeFilters.mode && 
        activeFilters.school === (schoolParam || "") && 
        page === parseInt(searchParams.get('page') || '1') &&
        programs === initialPrograms;

    if (isInitial && programs.length > 0) return;

    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        const res = await getPrograms({
          search: searchQuery,
          school: activeFilters.school,
          department: activeFilters.department,
          level: activeFilters.level,
          mode: activeFilters.mode,
          page,
          limit,
          locale,
        });
        setPrograms(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error("Discovery fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchFilteredData, 300); // 300ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeFilters, page, limit, schoolParam, locale]);

  const handleSchoolFilter = (slug: string) => {
    setActiveFilters({ ...activeFilters, school: slug, department: "" });
    setPage(1); // Reset to page 1 on filter change
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('school', slug);
    } else {
      params.delete('school');
    }
    params.delete('department');
    params.set('page', '1');
    router.push(`/programmes?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/programmes?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setActiveFilters({ school: "", department: "", level: "", mode: "" });
    setSearchQuery("");
    setPage(1);
    router.push(`/programmes`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. ACADEMIC HUB HEADER */}
      <section className="bg-primary-darker pt-48 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
           <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-32" />
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-1 bg-secondary" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t("eyebrow")}</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase font-serif italic leading-[0.85]">
               {t("title")}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed border-l-4 border-primary/30 pl-8">
               {t("subtitle")}
            </p>
        </div>
      </section>

      {/* 2. DUAL-VIEW CATALOG */}
      <main className="container mx-auto px-6 max-w-7xl py-24">
         <div className="flex flex-col lg:flex-row gap-12 items-start relative">
            
            {/* 2a. Sidebar Filters */}
            <div className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-32 relative z-30 h-max">
              <aside className={`${isSidebarOpen ? 'fixed inset-0 z-50 bg-white p-8 overflow-y-auto' : 'hidden lg:block'}`}>
              <div className="lg:h-[calc(100vh-10rem)] lg:overflow-y-auto pr-4 space-y-10 custom-scrollbar pb-8">
                <div className="flex items-center justify-between lg:hidden mb-12">
                 <h2 className="text-xl font-black uppercase tracking-widest">{t("filters")}</h2>
                 <button onClick={() => setIsSidebarOpen(false)}><X /></button>
              </div>

              {/* Search */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("searchLabel")}</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-slate-50 border-none p-4 pl-12 font-bold outline-none ring-2 ring-transparent focus:ring-primary transition-all tracking-widest text-[11px]"
                  />
                </div>
              </div>

              {/* Schools */}
              <div className="space-y-6">
                 <div className="flex items-center space-x-3 text-primary">
                    <SchoolIcon size={16} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">{t("schoolsLabel")}</h3>
                 </div>
                 <div className="space-y-4">
                    <select 
                      value={activeFilters.school}
                      onChange={e => handleSchoolFilter(e.target.value)}
                      aria-label={t("schoolsLabel")}
                      className="w-full bg-slate-50 p-4 font-black uppercase tracking-widest text-[9px] outline-none border-l-2 border-primary"
                    >
                      <option value="">{t("allSchools")}</option>
                      {schools.map(s => <option key={s.id} value={s.slug}>{s.name.replace('School of ', '').replace('Shule ya ', '')}</option>)}
                    </select>
                 </div>
              </div>

              {/* Level & Mode */}
              <div className="grid grid-cols-1 gap-8">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("levelLabel")}</h3>
                    <div className="flex flex-col space-y-2">
                       {[
                         { value: 'Undergraduate', label: t("levelUndergrad") },
                         { value: 'Postgraduate', label: t("levelPostgrad") },
                         { value: 'Diploma', label: t("levelDiploma") },
                         { value: 'Certificate', label: t("levelCertificate") },
                       ].map(l => (
                         <label key={l.value} className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={activeFilters.level === l.value}
                              onChange={() => setActiveFilters({ ...activeFilters, level: activeFilters.level === l.value ? "" : l.value })}
                              className="w-4 h-4 accent-primary" 
                            />
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${activeFilters.level === l.value ? 'text-primary' : 'text-slate-500'}`}>{l.label}</span>
                         </label>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("modeLabel")}</h3>
                    <div className="flex flex-col space-y-2">
                       {[
                         { value: 'Online', label: t("modeOnline") },
                         { value: 'Blended', label: t("modeBlended") },
                         { value: 'In-Person', label: t("modeInPerson") },
                         { value: 'Hybrid', label: t("modeHybrid") },
                       ].map(m => (
                         <label key={m.value} className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={activeFilters.mode === m.value}
                              onChange={() => setActiveFilters({ ...activeFilters, mode: activeFilters.mode === m.value ? "" : m.value })}
                              className="w-4 h-4 accent-primary" 
                            />
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${activeFilters.mode === m.value ? 'text-primary' : 'text-slate-500'}`}>{m.label}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-2 border-dashed border-slate-200 hover:border-[#ff7f50] hover:text-primary transition-all"
                >
                  {t("clearFilters")}
                </button>
              </div>
              </aside>
            </div>

            {/* 2b. Main Content Area */}
            <div className="flex-1 min-w-0">
               {/* Controls Header */}
               <div className="flex items-center justify-between mb-8 bg-white z-40 py-4 pb-6 border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t("showingTotal", { count: total })}
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center bg-slate-50 p-1 border border-slate-100">
                       <button 
                         type="button"
                         onClick={() => setViewMode('grid')}
                         aria-label={t("gridView")}
                         aria-pressed={viewMode === 'grid'}
                         className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-primary'}`}
                       >
                          <LayoutGrid size={16} />
                       </button>
                       <button 
                         type="button"
                         onClick={() => setViewMode('list')}
                         aria-label={t("listView")}
                         aria-pressed={viewMode === 'list'}
                         className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-primary'}`}
                       >
                          <List size={16} />
                       </button>
                    </div>
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary"
                    >
                       <Filter size={14} />
                       <span>{t("filtersLabel")}</span>
                    </button>
                  </div>
               </div>

               {/* Optional School Sentinel Banner if exploring a specific faculty */}
               <AnimatePresence>
                 {selectedSchoolData && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mb-12"
                   >
                     <div className="bg-primary-darker text-white p-8 md:p-12 relative overflow-hidden border-b-8 border-secondary">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 -mr-32 -mt-32 rounded-full blur-[60px]" />
                        <div className="relative z-10">
                           <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 font-serif leading-none italic">
                              {selectedSchoolData.name}
                           </h2>
                           <p className="text-slate-400 font-medium leading-relaxed max-w-xl text-sm">
                             {selectedSchoolData.description || `Explore our industry-leading curriculums within the ${selectedSchoolData.name}. We bridge the gap between academic theory and global market practice.`}
                           </p>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="relative">
                  {/* Loading Overlay */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center min-h-[400px]"
                      >
                         <RefreshCw className="animate-spin text-primary" size={48} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {programs.length > 0 ? (
                    <>
                      <motion.div layout className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        <AnimatePresence mode="popLayout">
                          {programs.map((prog, idx) => (
                            <ProgrammeCard key={prog.id} prog={prog} viewMode={viewMode} idx={idx} />
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="mt-16 flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-4 border border-slate-100 bg-white text-primary-darker disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff7f50] hover:text-white transition-all group"
                          >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                              .map((p, index, array) => (
                                <React.Fragment key={p}>
                                  {index > 0 && array[index - 1] !== p - 1 && (
                                    <span className="px-3 text-slate-300">...</span>
                                  )}
                                  <button
                                    onClick={() => handlePageChange(p)}
                                    className={`w-12 h-12 text-[10px] font-black uppercase tracking-widest transition-all border ${
                                      page === p 
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110 z-10' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-900 hover:text-white'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                </React.Fragment>
                              ))}
                          </div>

                          <button
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-4 border border-slate-100 bg-white text-primary-darker disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff7f50] hover:text-white transition-all group"
                          >
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-24 text-center space-y-6 bg-slate-50 border-2 border-dashed border-slate-100 mt-12">
                       <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <Search size={32} />
                       </div>
                       <p className="font-black uppercase tracking-[0.2em] text-slate-400 text-xs">{t("empty")}</p>
                       <button onClick={clearFilters} className="text-primary font-black uppercase text-[10px] tracking-widest underline underline-offset-8">{t("resetFilters")}</button>
                    </div>
                  )}
                </div>
            </div>
         </div>
      </main>
    </div>
  );
}

const ProgrammeCard = React.forwardRef<HTMLDivElement, { prog: Program, viewMode: 'grid' | 'list', idx: number }>(
  ({ prog, viewMode, idx }, ref) => {
    const t = useTranslations("Programmes");
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: idx * 0.05 }}
        layout
        className={`group bg-white border border-slate-100 hover:border-slate-900 transition-all duration-500 flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col p-10'}`}
      >
       {/* List View Left Anchor (Hidden in Grid) */}
       {viewMode === 'list' && (
         <div className="w-48 bg-slate-50 shrink-0 border-r border-slate-100 hidden sm:flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-[#ff7f50] hover:text-white group-hover:border-slate-900">
           <div className="w-16 h-16 bg-white text-primary-darker flex items-center justify-center mb-6 shadow-sm group-hover:text-primary transition-colors">
              {prog.school?.slug === 'school-of-science-technology' ? <Code size={28} /> : 
               prog.school?.slug === 'school-of-business-economics' ? <Briefcase size={28} /> : 
               <GraduationCap size={28} />}
           </div>
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 text-center leading-relaxed">
              {prog.school?.name?.replace('School of ', '') || "Foundation"}
           </span>
         </div>
       )}

       <div className={`flex-grow flex flex-col ${viewMode === 'list' ? 'p-10' : 'p-6'}`}>
           {/* Card Header (Used primarily in Grid View) */}
           {viewMode === 'grid' && (
             <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-primary-darker text-white flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-[#ff7f50] hover:text-white duration-500">
                   {prog.school?.slug === 'school-of-science-technology' ? <Code size={24} /> : 
                    prog.school?.slug === 'school-of-business-economics' ? <Briefcase size={24} /> : 
                    <GraduationCap size={24} />}
                </div>
                <div className="flex flex-col items-end space-y-2">
                   <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-primary-darker px-3 py-1.5 border border-slate-200">
                      {prog.level || t("fallbackLevel")}
                   </span>
                   <span className="text-[9px] font-black uppercase tracking-widest bg-secondary text-white px-3 py-1.5">
                      {t("cardOnlinePortal")}
                   </span>
                </div>
             </div>
           )}

           {/* Title & Info */}
           <div className="flex-grow space-y-6">
              {viewMode === 'list' && (
                <div className="flex space-x-2">
                   <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-primary-darker px-3 py-1.5 border border-slate-200">
                      {prog.level || t("fallbackLevel")}
                   </span>
                   <span className="text-[9px] font-black uppercase tracking-widest bg-secondary text-white px-3 py-1.5">
                      {t("cardOnlinePortal")}
                   </span>
                </div>
              )}
              
              <h3 className={`text-2xl font-black text-primary-darker group-hover:text-primary transition-colors leading-tight uppercase tracking-tighter font-serif`}>
                {prog.title}
              </h3>

              {viewMode === 'list' && (
                <p className={`text-slate-500 line-clamp-2 leading-relaxed font-medium text-base line-clamp-3`}>
                   {prog.overview || t("fallbackOverview")}
                </p>
              )}
              
              <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="flex items-center">
                    <Clock size={14} className="mr-2 text-primary" />
                    <span>{prog.duration || t("fallbackDuration")}</span>
                 </div>
                 <div className="flex items-center">
                    <Globe size={14} className="mr-2 text-primary" />
                    <span>{prog.mode_of_delivery?.[0] || t("modeOnline")}</span>
                 </div>
              </div>
           </div>

           {/* Action Paths */}
           <div className={`mt-8 pt-8 border-t border-slate-50 grid gap-4 ${viewMode === 'list' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              <Link 
                href={`/programmes/${prog.slug}`}
                className={`${viewMode === 'list' ? 'md:col-span-2' : ''} w-full bg-slate-100 text-primary-darker py-4 px-6 font-black uppercase tracking-widest text-[9px] flex items-center justify-center space-x-2 hover:bg-[#ff7f50] hover:text-white transition-all`}
              >
                 <Info size={14} />
                 <span>{t("cardProfile")}</span>
              </Link>
              
              <a 
                href={prog.enroll_link || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${viewMode === 'list' ? 'md:col-span-2' : ''} w-full bg-primary text-white py-4 px-6 font-black uppercase tracking-widest text-[9px] flex items-center justify-center space-x-2 hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg shadow-primary/10`}
              >
                 <ExternalLink size={14} />
                 <span>{t("cardEnroll")}</span>
              </a>
           </div>
       </div>
    </motion.div>
  );
});
ProgrammeCard.displayName = "ProgrammeCard";
