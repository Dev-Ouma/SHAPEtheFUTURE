"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  CreditCard, 
  Globe, 
  ChevronRight,
  School as SchoolIcon,
  Tag,
  Zap,
  LayoutGrid,
  List
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { resolveImageUrl, getShortCourses } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";

interface ShortCourse {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
  duration: string;
  cost: string;
  mode_of_delivery: string;
  overview: string;
  level: string;
  course_category?: { name: string };
  school?: { name: string };
}

export default function ShortCourseCatalogClient({ 
  initialCourses,
  categories,
  methods,
  schools,
  departments,
  initialTotal,
  initialTotalPages,
  initialFilters
}: { 
  initialCourses: ShortCourse[];
  categories: any[];
  methods: any[];
  schools: any[];
  departments: any[];
  initialTotal: number;
  initialTotalPages: number;
  initialFilters: any;
}) {
  const t = useTranslations("ShortCourses");
  const locale = useLocale();
  const modeOptions = [
    { value: "Online", label: t("modeOnline") },
    { value: "Blended", label: t("modeBlended") },
    { value: "In-Person", label: t("modeInPerson") },
    { value: "Hybrid", label: t("modeHybrid") },
  ];
  const levelOptions = [
    { value: "Beginner", label: t("levelBeginner") },
    { value: "Intermediate", label: t("levelIntermediate") },
    { value: "Advanced", label: t("levelAdvanced") },
  ];
  const [courses, setCourses] = useState<ShortCourse[]>(initialCourses);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialFilters.search || "");
  const [page, setPage] = useState(initialFilters.page || 1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  
  const [activeFilters, setActiveFilters] = useState<any>({
    category: initialFilters.category || "",
    level: initialFilters.level || "",
    mode: initialFilters.mode || "",
    school: initialFilters.school || "",
    department: initialFilters.department || ""
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Optimized Server-Side Fetch Effect
  useEffect(() => {
    // Skip initial fetch if it matches server-side data
    const isInitial = 
      !search && 
      !activeFilters.category && 
      !activeFilters.level && 
      !activeFilters.mode && 
      !activeFilters.school && 
      !activeFilters.department && 
      page === 1;

    if (isInitial && courses.length > 0) return;

    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        const res = await getShortCourses({
          search: search,
          category: activeFilters.category,
          level: activeFilters.level,
          mode: activeFilters.mode,
          school: activeFilters.school,
          department: activeFilters.department,
          page,
          limit,
          locale,
        });

        if (res && res.data) {
          setCourses(res.data);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (error) {
        console.error("Discovery error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFilteredData, 500);
    
    // Sync URL params
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (activeFilters.category) params.set('category', activeFilters.category);
    if (activeFilters.level) params.set('level', activeFilters.level);
    if (activeFilters.mode) params.set('mode', activeFilters.mode);
    if (activeFilters.school) params.set('school', activeFilters.school);
    if (activeFilters.department) params.set('department', activeFilters.department);
    if (page > 1) params.set('page', page.toString());
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);

    return () => clearTimeout(timer);
  }, [search, activeFilters, page, limit, locale]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setActiveFilters({ category: "", level: "", mode: "", school: "", department: "" });
    setSearch("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start relative">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-32 relative z-30 h-max">
        <aside className={`${isSidebarOpen ? 'fixed inset-0 z-50 bg-white p-8 overflow-y-auto' : 'hidden lg:block'}`}>
        <div className="lg:h-[calc(100vh-10rem)] lg:overflow-y-auto pr-4 space-y-10 custom-scrollbar pb-8">
          <div className="flex items-center justify-between lg:hidden mb-12">
           <h2 className="text-xl font-black uppercase tracking-widest">{t("filters")}</h2>
           <button onClick={() => setIsSidebarOpen(false)}><X /></button>
        </div>

        {/* Search */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("searchCertification")}</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-slate-50 border-none p-4 pl-12 font-bold outline-none ring-2 ring-transparent focus:ring-primary transition-all uppercase tracking-widest text-[11px]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
           <div className="flex items-center space-x-3 text-primary">
              <Tag size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">{t("courseCategory")}</h3>
           </div>
           <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveFilters({...activeFilters, category: activeFilters.category === cat.slug ? "" : cat.slug})}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeFilters.category === cat.slug ? 'bg-primary border-primary text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {cat.name}
                </button>
              ))}
           </div>
        </div>

        {/* School & Department */}
        <div className="space-y-6">
           <div className="flex items-center space-x-3 text-primary">
              <SchoolIcon size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">{t("institutionalContext")}</h3>
           </div>
           <div className="space-y-4">
              <select 
                value={activeFilters.school}
                onChange={e => setActiveFilters({...activeFilters, school: e.target.value, department: ""})}
                className="w-full bg-slate-50 p-4 font-black uppercase tracking-widest text-[10px] outline-none border-l-2 border-primary"
              >
                <option value="">{t("allSchools")}</option>
                {schools.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>

              <select 
                value={activeFilters.department}
                onChange={e => setActiveFilters({...activeFilters, department: e.target.value})}
                className="w-full bg-slate-50 p-4 font-black uppercase tracking-widest text-[10px] outline-none border-l-2 border-primary/30"
              >
                <option value="">{t("allDepartments")}</option>
                {departments
                  .filter(d => !activeFilters.school || d.school?.slug === activeFilters.school)
                  .map(d => <option key={d.id} value={d.slug}>{d.name}</option>)
                }
              </select>
           </div>
        </div>

        {/* Delivery & Level */}
        <div className="grid grid-cols-1 gap-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("mode")}</h3>
              <div className="flex flex-col space-y-2">
                 {modeOptions.map(({ value, label }) => (
                   <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={activeFilters.mode === value}
                        onChange={() => setActiveFilters({...activeFilters, mode: activeFilters.mode === value ? "" : value})}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${activeFilters.mode === value ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
                   </label>
                 ))}
              </div>
           </div>
           
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("proficiencyLevel")}</h3>
              <div className="flex flex-col space-y-2">
                 {levelOptions.map(({ value, label }) => (
                   <label key={value} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={activeFilters.level === value}
                        onChange={() => setActiveFilters({...activeFilters, level: activeFilters.level === value ? "" : value})}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${activeFilters.level === value ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
                   </label>
                 ))}
              </div>
           </div>
        </div>

          <button 
            onClick={clearFilters}
            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-2 border-dashed border-slate-200 hover:border-[#ff7f50] hover:text-primary transition-all"
          >
            {t("clearAllFilters")}
          </button>
        </div>
        </aside>
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-w-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-[1px]">
             <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">{t("filteringDb")}</p>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 py-4 pb-6 border-b border-slate-100">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             {t("showingCertsPrefix")} <span className="text-secondary">{total}</span> {t("showingCertsSuffix")}
           </p>
           <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center bg-slate-50 p-1 border border-slate-100">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-white'}`}
                >
                   <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-white'}`}
                >
                   <List size={16} />
                </button>
             </div>
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="lg:hidden flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary"
             >
                <Filter size={14} />
                <span>{t("filters")}</span>
             </button>
           </div>
        </div>

        {courses.length > 0 ? (
          <motion.div layout className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <AnimatePresence mode="popLayout">
              {courses.map((course, idx) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                  className={`group bg-white border border-slate-100 hover:border-slate-900 transition-all duration-500 flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'}`}
                >
                  <div className={`relative overflow-hidden bg-primary-darker shrink-0 ${viewMode === 'list' ? 'sm:w-72' : 'aspect-video'}`}>
                    <SafeImage
                      src={resolveImageUrl(course.image_url) || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop`}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-secondary text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-white/20">
                         {course.course_category?.name || t("professional")}
                       </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-grow flex flex-col justify-center">
                    <div className="space-y-2">
                       <h3 className="text-xl font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                         {course.title}
                       </h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         {course.school?.name || t("globalOutreach")}
                       </p>
                    </div>

                    {viewMode === 'list' && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 flex-grow">
                        {course.overview}
                      </p>
                    )}

                    <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                       <div className="flex items-center space-x-3 text-slate-400">
                          <Clock size={14} className="text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{course.duration}</span>
                       </div>
                       <div className="flex items-center space-x-3 text-slate-400">
                          <Globe size={14} className="text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{course.mode_of_delivery}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t("courseInvestment")}</p>
                          <p className="font-black text-primary-darker">{course.cost}</p>
                       </div>
                       <Link href={`/academics/professional-development-courses/${course.slug}`}>
                          <button className="w-10 h-10 bg-primary-darker text-white flex items-center justify-center group-hover:bg-[#ff7f50] hover:text-white transition-all">
                             <ChevronRight size={18} />
                          </button>
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center space-y-6 bg-slate-50 border-2 border-dashed border-slate-100 mt-12">
             <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={32} />
             </div>
             <p className="font-black uppercase tracking-[0.2em] text-slate-400 text-xs">{t("noMatching")}</p>
             <button onClick={clearFilters} className="text-primary font-black uppercase text-[10px] tracking-widest underline underline-offset-8">{t("resetDiscovery")}</button>
          </div>
        )}

        {/* Pagination Controls */}
        {total > 0 && (
          <div className="mt-16 flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-4 bg-slate-50 text-primary-darker disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff7f50] hover:text-white transition-all border border-slate-100"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-12 h-12 flex items-center justify-center text-[10px] font-black transition-all border ${
                    page === p 
                    ? 'bg-primary-darker text-white border-slate-900 shadow-xl scale-110 z-10' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-900 hover:text-white'
                  }`}
                >
                  {p.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-4 bg-slate-50 text-primary-darker disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ff7f50] hover:text-white transition-all border border-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
