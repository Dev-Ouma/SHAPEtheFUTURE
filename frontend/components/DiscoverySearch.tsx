"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, X } from "lucide-react";
import { getApiCached } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import Highlight from "@/components/Highlight";

interface DiscoverySearchProps {
  theme?: 'glass' | 'light';
  animate?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export default function DiscoverySearch({ theme = 'glass', animate = true, layout = 'horizontal' }: DiscoverySearchProps) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ programs: any[], others: any[] }>({ programs: [], others: [] });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ programs: [], others: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await getApiCached(
          `/search?q=${encodeURIComponent(searchQuery)}&locale=${encodeURIComponent(locale)}`,
          { revalidate: 30 },
        );
        const programs = Array.isArray(data.programs) ? data.programs.slice(0, 5) : [];
        const shortCourseMatches = Array.isArray(data.shortCourses) 
          ? data.shortCourses.map((sc: any) => ({ ...sc, type: t("shortCourse"), kind: "short" }))
          : [];
        const unitMatches = Array.isArray(data.courseUnits)
          ? data.courseUnits.map((u: any) => ({ 
              ...u, 
              parentProgram: u.program?.title || u.programme?.title || t("coreCurriculum"), 
              type: t("courseUnit"),
              kind: "unit",
              slug: u.slug || u.unit_code?.replace(/\s+/g, '-')
            }))
          : [];

        setSearchResults({
          programs,
          others: [...shortCourseMatches, ...unitMatches].slice(0, 8)
        });
      } catch (err) {
        console.error("Discovery search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, t, locale]);

  const goToSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="relative w-full max-w-4xl" ref={searchRef}>
      <motion.div 
        layoutId="discovery-search-box"
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        className={`relative ${layout === 'vertical' ? 'p-4 md:p-6' : 'p-3 md:p-4'} transition-all ${
          theme === 'glass' 
            ? 'bg-white/10 backdrop-blur-2xl border border-white/10 focus-within:ring-primary/10 shadow-2xl z-50' 
            : 'bg-white border border-slate-100 focus-within:ring-primary/5'
        }`}
      >
        <div className={`flex ${layout === 'vertical' ? 'flex-col space-y-4' : 'flex-col space-y-4 md:space-y-0 md:flex-row md:items-stretch'}`}>
          <div className={`flex flex-1 items-center px-4 md:px-6 ${layout === 'vertical' ? 'py-3' : 'py-1'} border ${
            theme === 'glass' ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-50'
          }`}>
            <Search size={22} className={theme === 'glass' ? 'text-white/60' : 'text-slate-400'} />
            <div className={`w-[1px] h-8 mx-4 md:mx-6 ${theme === 'glass' ? 'bg-white/10' : 'bg-slate-200'}`} />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goToSearch();
                }
              }}
              className={`flex-1 bg-transparent border-none py-2 outline-none font-bold text-base min-w-0 ${
                theme === 'glass' ? 'text-white placeholder:text-white/30' : 'text-primary-darker placeholder:text-slate-300'
              }`}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => { setSearchQuery(""); setIsDropdownOpen(false); }}
                className={`ml-2 p-1.5 rounded-full hover:bg-slate-200/20 transition-colors ${theme === 'glass' ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={goToSearch}
            disabled={!searchQuery.trim() || loading}
            className={`bg-primary hover:bg-secondary text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shrink-0 disabled:opacity-60 ${
            layout === 'vertical' ? 'w-full py-4' : 'px-12 py-5 md:py-0'
          } ${
            theme === 'glass' ? 'shadow-xl shadow-primary/20' : ''
          }`}>
            <span>{t("findNow")}</span>
            {layout === 'vertical' && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.div>

      {/* Results Dropdown - Local Absolute Positioning */}
      <AnimatePresence>
        {isDropdownOpen && searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute top-full left-0 w-full bg-white border border-slate-200 mt-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col ${layout === 'horizontal' ? 'md:flex-row md:divide-y-0 md:divide-x' : ''} divide-y divide-slate-100 z-[100] max-h-[70vh] overflow-y-auto custom-scrollbar`}
          >
            {/* Column 1: Programmes */}
            <div className={`p-8 ${layout === 'horizontal' ? 'flex-1' : ''}`}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center space-x-3">
                <div className="w-6 h-0.5 bg-secondary" />
                <span>{t("programmesLabel")}</span>
              </h4>
              <div className="space-y-4">
                {searchResults.programs.length > 0 ? (
                  searchResults.programs.map((p) => (
                    <Link key={p.id} href={`/programmes/${p.slug}`} className="block p-4 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                      <h5 className="font-bold text-primary-darker group-hover:text-primary transition-colors text-base leading-tight">
                        <Highlight text={p.title} query={searchQuery} />
                      </h5>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.level}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400">{t("noProgrammeMatches")}</p>
                )}
              </div>
            </div>

            {/* Column 2: Units & Short Courses */}
            <div className={`p-8 bg-slate-50/10 ${layout === 'horizontal' ? 'flex-1' : ''}`}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center space-x-3">
                <div className="w-6 h-0.5 bg-primary" />
                <span>{t("shortCoursesAndUnits")}</span>
              </h4>
              <div className="space-y-4">
                {searchResults.others.length > 0 ? (
                  searchResults.others.map((item, idx) => (
                    <Link key={idx} href={item.kind === 'unit' ? `/units/${item.slug}` : `/academics/professional-development-courses/${item.slug}`} className="block p-4 bg-white border border-slate-100 hover:border-primary/20 transition-all group shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-bold text-primary-darker text-sm leading-tight group-hover:text-primary">
                          <Highlight text={item.title} query={searchQuery} />
                        </h5>
                        <span className="text-[7px] font-black px-1.5 py-0.5 bg-primary-darker text-white uppercase">{item.type}</span>
                      </div>
                      {item.parentProgram && (
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">
                          <Highlight text={item.parentProgram} query={searchQuery} />
                        </p>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400">{t("noModulesFound")}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
