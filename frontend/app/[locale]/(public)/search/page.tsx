"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  Newspaper,
  FileText,
  ArrowRight,
  GraduationCap,
  Navigation,
  RefreshCw,
  Users,
  FlaskConical,
  X,
  ChevronRight,
} from "lucide-react";
import { getApiCached } from "@/lib/api";

type FilterType = "all" | "programmes" | "news" | "pages" | "staff" | "research";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-primary font-black not-italic px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchPage() {
  const t = useTranslations("SearchPage");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<{
    programmes: any[];
    shortCourses: any[];
    courseUnits: any[];
    news: any[];
    pages: any[];
    menus: any[];
    staff: any[];
    publications: any[];
  }>({ programmes: [], shortCourses: [], courseUnits: [], news: [], pages: [], menus: [], staff: [], publications: [] });

  const suggestionTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      programme: "typeProgramme",
      short_course: "typeShortCourse",
      news: "typeNews",
      page: "typePage",
      staff: "typeStaff",
      Programme: "typeProgramme",
      "Short Course": "typeShortCourse",
      News: "typeNews",
      Page: "typePage",
      Staff: "typeStaff",
    };
    const key = keyMap[type];
    return key ? t(key) : type;
  };
  const [facets, setFacets] = useState<any>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const staticFrontendViews = [
    {
      id: "static-admissions",
      title: t("staticAdmissionsTitle"),
      slug: "admissions",
      summary: t("staticAdmissionsSummary"),
      content: t("staticAdmissionsBody"),
    },
    {
      id: "static-about",
      title: t("staticAboutTitle"),
      slug: "about",
      summary: t("staticAboutSummary"),
      content: t("staticAboutBody"),
    },
    {
      id: "static-research",
      title: t("staticResearchTitle"),
      slug: "research",
      summary: t("staticResearchSummary"),
      content: t("staticResearchBody"),
    },
    {
      id: "static-library",
      title: t("staticLibraryTitle"),
      slug: "library",
      summary: t("staticLibrarySummary"),
      content: t("staticLibraryBody"),
    },
  ];

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: t("filterAll"), icon: <SearchIcon size={13} /> },
    { key: "programmes", label: t("filterProgrammes"), icon: <GraduationCap size={13} /> },
    { key: "news", label: t("filterNews"), icon: <Newspaper size={13} /> },
    { key: "pages", label: t("filterPages"), icon: <FileText size={13} /> },
    { key: "staff", label: t("filterStaff"), icon: <Users size={13} /> },
    { key: "research", label: t("filterResearch"), icon: <FlaskConical size={13} /> },
  ];

  // Use translated labels as queries so /sw searches match localized content.
  const emptyChips = [
    { label: t("chipProgrammes"), q: t("chipProgrammes") },
    { label: t("chipResearch"), q: t("chipResearch") },
    { label: t("chipNews"), q: t("chipNews") },
    { label: t("chipAdmissions"), q: t("chipAdmissions") },
    { label: t("chipLibrary"), q: t("chipLibrary") },
  ];

  const browseChips = [
    { label: t("chipAbout"), href: "/about" },
    { label: t("chipAdmissions"), href: "/admissions" },
    { label: t("chipAcademics"), href: "/academics" },
    { label: t("chipResearch"), href: "/research" },
  ];

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!inputVal || inputVal.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await getApiCached(
          `/search/suggestions?q=${encodeURIComponent(inputVal)}&locale=${encodeURIComponent(locale)}`,
          { revalidate: 45 },
        );
        if (Array.isArray(data)) setSuggestions(data);
      } catch { /* silent */ }
    }, 200);
    return () => clearTimeout(timer);
  }, [inputVal, locale]);

  // Fetch full search results
  useEffect(() => {
    if (!query) {
      setAllData({ programmes: [], shortCourses: [], courseUnits: [], news: [], pages: [], menus: [], staff: [], publications: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getApiCached(
          `/search?q=${encodeURIComponent(query)}&filter=${activeFilter}&locale=${encodeURIComponent(locale)}`,
          { revalidate: 30 },
        );
        const staticMatches = staticFrontendViews.filter(v =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.content.toLowerCase().includes(query.toLowerCase())
        );
        setAllData({
          programmes: data?.programs || [],
          shortCourses: data?.shortCourses || [],
          courseUnits: data?.courseUnits || [],
          news: data?.news || [],
          pages: [...(data?.pages || []), ...staticMatches],
          menus: data?.menus || [],
          staff: data?.staff || [],
          publications: data?.publications || [],
        });
        if (data?.facets) {
          setFacets(data.facets);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeFilter, locale]);

  // Sync URL query
  useEffect(() => {
    setQuery(initialQuery);
    setInputVal(initialQuery);
  }, [initialQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!suggestionsRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pushSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      setQuery(inputVal.trim());
      pushSearch(inputVal.trim());
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    if (suggestion?.href) {
      router.push(suggestion.href);
      return;
    }
    setInputVal(suggestion.label);
    setQuery(suggestion.label);
    pushSearch(suggestion.label);
  };

  const results = allData;

  // Count per filter using true backend facets if available
  const counts = {
    all: (facets.programs || 0) + (facets.shortCourses || 0) + (facets.courseUnits || 0) + (facets.news || 0) + (facets.pages || 0) + (facets.menus || 0) + (facets.staff || 0) + (facets.publications || 0) || (results.programmes.length + results.shortCourses.length + results.courseUnits.length + results.news.length + results.pages.length + results.menus.length + results.staff.length + results.publications.length),
    programmes: (facets.programs || 0) + (facets.shortCourses || 0) + (facets.courseUnits || 0) || (results.programmes.length + results.shortCourses.length + results.courseUnits.length),
    news: (facets.news || 0) || results.news.length,
    pages: (facets.pages || 0) + (facets.menus || 0) || (results.pages.length + results.menus.length),
    staff: (facets.staff || 0) || results.staff.length,
    research: (facets.publications || 0) || results.publications.length,
  };

  const totalCount = counts[activeFilter];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Search Bar */}
      <div className="bg-primary-darker pt-32 pb-6 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              {t("title")}
            </h1>
            {query && !loading && (
              <p className="text-slate-300 text-lg">
                {t(totalCount === 1 ? "resultFor" : "resultsFor", { count: totalCount })}{" "}
                <span className="text-white font-semibold">"{query}"</span>
              </p>
            )}
          </motion.div>

          {/* Search Input with Autocomplete */}
          <div className="relative">
            <form onSubmit={handleSubmit} className="relative" role="search">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} aria-hidden="true" />
              <input
                ref={inputRef}
                id="main-search-input"
                type="search"
                value={inputVal}
                onChange={e => { setInputVal(e.target.value); setShowSuggestions(true); }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={t("placeholder")}
                aria-label={t("ariaLabel")}
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={showSuggestions && suggestions.length > 0}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 py-4 pl-12 pr-32 text-lg font-medium outline-none focus:border-white/50 focus:bg-white/20 transition-all shadow-lg"
              />
              {inputVal && (
                <button
                  type="button"
                  aria-label={t("clear")}
                  onClick={() => { setInputVal(""); setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                  className="absolute right-32 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-primary-darker hover:bg-slate-100 transition-colors px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm"
              >
                {t("search")}
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  id="search-suggestions"
                  ref={suggestionsRef}
                  role="listbox"
                  aria-label={t("suggestions")}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 shadow-2xl mt-1"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      role="option"
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-none group"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded-sm w-24 text-center shrink-0">
                          {suggestionTypeLabel(s.type)}
                        </span>
                        <span className="font-bold text-primary-darker text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {s.label}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Tabs */}
          {query && (
            <div className="flex items-center space-x-1 mt-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex items-center space-x-2 px-4 py-2 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-all rounded-full border ${
                    activeFilter === f.key
                      ? "bg-white text-primary border-white"
                      : "bg-transparent text-white border-white/20 hover:bg-white/10"
                  }`}
                >
                  {f.icon}
                  <span>{f.label}</span>
                  {counts[f.key] > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === f.key ? "bg-primary/10 text-primary" : "bg-white/20 text-white"}`}>
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        {loading ? (
          <div className="flex flex-col items-center py-32 space-y-6">
            <RefreshCw className="animate-spin text-primary" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t("loading")}
            </p>
          </div>
        ) : !query ? (
          <div className="text-center py-24 space-y-6">
            <SearchIcon size={56} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              {t("emptyPrompt")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {emptyChips.map(chip => (
                <button
                  key={chip.q}
                  onClick={() => { setInputVal(chip.q); setQuery(chip.q); pushSearch(chip.q); }}
                  className="border border-slate-200 hover:border-primary text-slate-500 hover:text-primary px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-24 space-y-6">
            <SearchIcon size={56} className="mx-auto text-slate-200" />
            <p className="font-black uppercase tracking-widest text-primary-darker text-lg">
              {t("noResults", { query })}
            </p>
            <p className="text-slate-400 font-medium">{t("noResultsHint")}</p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {browseChips.map(chip => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="border border-slate-200 hover:border-primary text-slate-600 hover:text-primary px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-16">

            {/* Academic Programmes */}
            {(activeFilter === "all" || activeFilter === "programmes") && (results.programmes.length > 0 || results.shortCourses.length > 0 || results.courseUnits.length > 0) && (
              <section>
                <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3">
                  <GraduationCap size={16} aria-hidden="true" className="text-primary" />
                  <span>{t("sectionProgrammes")} <span className="ml-1 text-slate-400 font-normal">({results.programmes.length + results.shortCourses.length + results.courseUnits.length})</span></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.programmes.map(p => (
                    <Link key={p.id} href={`/programmes/${p.slug}`}
                      className="group bg-white p-6 transition-all duration-300 border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full">
                      <div className="flex-1">
                        {p.school?.name && (
                          <p className="text-xs font-semibold text-primary/80 mb-3 uppercase tracking-wider">{p.school.name}</p>
                        )}
                        <h3 className="text-lg font-bold text-slate-800 transition-colors mb-3 line-clamp-2 group-hover:text-primary">
                          <Highlight text={p.title} query={query} />
                        </h3>
                        {p.level && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">{p.level}</span>}
                      </div>
                      <div className="mt-6 flex items-center space-x-2 text-[13px] font-semibold text-primary transition-colors">
                        <span>{t("viewProgramme")}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                  {results.shortCourses.map(p => (
                    <Link key={p.id} href={`/academics/professional-development-courses/${p.slug}`}
                      className="group bg-white p-6 transition-all duration-300 border border-slate-100 rounded-2xl hover:border-secondary/20 hover:shadow-xl hover:shadow-secondary/5 flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded-md">{t("professional")}</span>
                          {p.school?.name && (
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{p.school.name}</p>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 transition-colors mb-3 line-clamp-2 group-hover:text-secondary">
                          <Highlight text={p.title} query={query} />
                        </h3>
                      </div>
                      <div className="mt-6 flex items-center space-x-2 text-[13px] font-semibold text-secondary transition-colors">
                        <span>{t("viewShortCourse")}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                  {results.courseUnits.map((u: any) => {
                    const slug = u.slug || u.unit_code?.replace(/\s+/g, "-");
                    const parent =
                      u.program?.title || u.programme?.title || "";
                    return (
                      <Link
                        key={u.id}
                        href={`/units/${slug}`}
                        className="group bg-white p-6 transition-all duration-300 border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                              {t("typeCourseUnit")}
                            </span>
                            {u.unit_code && (
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {u.unit_code}
                              </p>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 transition-colors mb-3 line-clamp-2 group-hover:text-primary">
                            <Highlight text={u.title} query={query} />
                          </h3>
                          {parent && (
                            <p className="text-xs text-slate-500 line-clamp-1">{parent}</p>
                          )}
                        </div>
                        <div className="mt-6 flex items-center space-x-2 text-[13px] font-semibold text-primary transition-colors">
                          <span>{t("viewCourseUnit")}</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Staff */}
            {(activeFilter === "all" || activeFilter === "staff") && results.staff.length > 0 && (
              <section>
                <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3">
                  <Users size={16} aria-hidden="true" className="text-primary" />
                  <span>{t("sectionStaff")} <span className="ml-1 text-slate-400 font-normal">({results.staff.length})</span></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.staff.map((s: any) => (
                    <Link key={s.id} href={s.profile_slug ? `/about/staff/${s.profile_slug}` : "/about/staff"}
                      className="group flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-primary/20 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shrink-0 font-bold text-slate-600 text-lg group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {s.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 text-[15px] line-clamp-1 group-hover:text-primary transition-colors">
                          <Highlight text={s.full_name} query={query} />
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{s.job_title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Research & Publications */}
            {(activeFilter === "all" || activeFilter === "research") && results.publications.length > 0 && (
              <section>
                <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3">
                  <FlaskConical size={16} aria-hidden="true" className="text-primary" />
                  <span>{t("sectionResearch")} <span className="ml-1 text-slate-400 font-normal">({results.publications.length})</span></span>
                </h2>
                <div className="space-y-3">
                  {results.publications.map((p: any) => (
                    <Link key={p.id} href={`/research/publications/${p.slug || p.id}`}
                      className="group flex justify-between items-start p-5 bg-white border border-slate-100 rounded-xl hover:border-primary/20 hover:shadow-md transition-all">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 text-base line-clamp-2 group-hover:text-primary transition-colors">
                          <Highlight text={p.title} query={query} />
                        </p>
                        {p.journal_name && <p className="text-sm text-slate-500">{p.journal_name}</p>}
                        {p.doi && <p className="text-[11px] text-slate-400 font-mono mt-1">DOI: {p.doi}</p>}
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 shrink-0 mt-1 ml-4 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pages & Navigation */}
            {(activeFilter === "all" || activeFilter === "pages") && (results.pages.length > 0 || results.menus.length > 0) && (
              <section>
                <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3">
                  <FileText size={16} aria-hidden="true" className="text-primary" />
                  <span>{t("sectionPages")} <span className="ml-1 text-slate-400 font-normal">({results.pages.length + results.menus.length})</span></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.menus.map((m: any) => (
                    <Link key={m.id} href={m.link || `/${m.slug}`}
                      className="group flex justify-between items-center p-5 bg-white border border-slate-100 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <Navigation size={18} className="text-slate-400 group-hover:text-primary" aria-hidden="true" />
                        </div>
                        <span className="font-semibold text-slate-800 text-[15px] group-hover:text-primary transition-colors">
                          <Highlight text={m.title} query={query} />
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  {results.pages.map((pg: any) => (
                    <Link key={pg.id} href={`/${pg.slug}`}
                      className="group flex justify-between items-center p-5 bg-white border border-slate-100 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                          <FileText size={18} className="text-slate-400 group-hover:text-primary" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 pr-4">
                          <span className="font-semibold text-slate-800 text-[15px] block group-hover:text-primary transition-colors truncate">
                            <Highlight text={pg.title} query={query} />
                          </span>
                          {pg.summary && <span className="text-sm text-slate-500 line-clamp-1 mt-0.5">{pg.summary}</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 shrink-0 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* News */}
            {(activeFilter === "all" || activeFilter === "news") && results.news.length > 0 && (
              <section>
                <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3">
                  <Newspaper size={16} aria-hidden="true" className="text-primary" />
                  <span>{t("sectionNews")} <span className="ml-1 text-slate-400 font-normal">({results.news.length})</span></span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.news.map((n: any) => (
                    <Link key={n.id} href={`/news/${n.slug}`}
                      className="group bg-white p-6 border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full">
                      <div className="flex-1">
                        {n.category && (
                          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-3 block">{n.category}</span>
                        )}
                        <h3 className="text-lg font-bold text-slate-800 transition-colors mb-3 line-clamp-3 group-hover:text-primary leading-tight">
                          <Highlight text={n.title} query={query} />
                        </h3>
                      </div>
                      <div className="mt-6 flex items-center space-x-2 text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">
                        <span>{t("readArticle")}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-primary" size={48} /></div>}>
      <SearchPage />
    </Suspense>
  );
}
