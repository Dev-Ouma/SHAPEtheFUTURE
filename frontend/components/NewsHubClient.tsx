"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Calendar, 
  Tag, 
  ChevronRight,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import SafeImage from "@/components/ui/SafeImage";
import SocialFeed from "./SocialFeed";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  created_at: string;
  image_url?: string;
}

interface NewsHubClientProps {
  initialNews: NewsItem[];
  totalPages: number;
  currentPage: number;
  total: number;
  categories: string[];
}

const NewsHubClient: React.FC<NewsHubClientProps> = ({ 
  initialNews, 
  totalPages, 
  currentPage, 
  total,
  categories: availableCategories
}) => {
  const t = useTranslations("News");
  const router = useRouter();
  const searchParams = useSearchParams();
  const allUpdatesLabel = t("allUpdates");
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const activeCategory = searchParams.get("category") || allUpdatesLabel;

  const categories = [allUpdatesLabel, ...availableCategories];

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === null || newFilters[key] === allUpdatesLabel || newFilters[key] === "All Updates" || newFilters[key] === "") {
        params.delete(key);
      } else {
        params.set(key, newFilters[key]);
      }
    });
    // Always reset to page 1 on filter change
    if (!newFilters.page) params.set("page", "1");
    
    router.push(`/news?${params.toString()}`);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    
    if (params.get("q") !== searchParams.get("q")) {
      router.push(`/news?${params.toString()}`);
    }
  }, [debouncedSearch]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Search & Header Section */}
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-40 -mb-40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 mb-8"
              >
                <div className="w-12 h-[2px] bg-secondary" />
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">{t("eyebrow")}</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight uppercase mb-0"
              >
                {t("hubTitle")} <span className="text-primary">{t("hubTitleAccent")}</span>
              </motion.h1>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full md:w-96 relative group"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 pl-16 pr-8 py-6 outline-none focus:bg-white/10 focus:border-primary/50 transition-all font-bold tracking-widest text-xs uppercase shadow-2xl backdrop-blur-md"
              />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Social Feed Component */}
      <SocialFeed />

      <main className="container mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content: News Feed */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-16 pb-8 border-b border-slate-200">
               <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">{t("liveStream")}</h2>
                  <p className="text-2xl font-black text-primary-darker uppercase tracking-tighter">{t("scholarlyUpdates")}</p>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("institutionalPulse")}</span>
               </div>
            </div>

            <div className="space-y-20">
              <AnimatePresence mode="popLayout">
                {initialNews.length > 0 ? (
                  initialNews.map((item, index) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex flex-col md:flex-row gap-10 items-start"
                    >
                      <div className="w-full md:w-1/3 relative aspect-institutional-card overflow-hidden bg-slate-200 shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
                        {item.image_url ? (
                          <SafeImage
                            src={resolveImageUrl(item.image_url)}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="standard-image object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-darker">
                             <Tag size={40} className="text-white/10" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 shadow-xl">
                          {item.category}
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <Calendar size={12} className="text-secondary" />
                           <span>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tighter leading-[0.9] group-hover:text-primary transition-colors">
                          <Link href={`/news/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium">
                          {stripHtml(item.content).substring(0, 240)}...
                        </p>
                        <Link 
                          href={`/news/${item.slug}`}
                          className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b-2 border-primary/20 hover:border-primary pb-1 group-hover:translate-x-2 transition-all"
                        >
                          <span>{t("inDepth")}</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">{t("empty")}</p>
                    <button 
                      onClick={() => { setSearchQuery(""); updateFilters({ category: allUpdatesLabel, q: "" }); }}
                      className="mt-4 text-primary font-black uppercase tracking-widest text-xs"
                    >
                      {t("clearSelection")}
                    </button>
                  </div>
                )}
              </AnimatePresence>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-12 border-t border-slate-200">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t("showingOf", { shown: initialNews.length, total })}
                   </p>
                   <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <ArrowLeft size={16} />
                        <span>{t("previous")}</span>
                      </button>
                      <div className="flex items-center space-x-2">
                         <span className="text-xs font-black text-primary-darker">{t("pageOf", { page: currentPage, total: totalPages })}</span>
                      </div>
                      <button 
                        onClick={() => updateFilters({ page: Math.min(totalPages, currentPage + 1) })}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <span>{t("next")}</span>
                        <ChevronRight size={16} />
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:w-1/3 lg:sticky lg:top-32 self-start space-y-12 z-20">
            {/* Category Navigation */}
            <div className="bg-white border border-slate-100 p-10 shadow-xl relative overflow-hidden group/sidebar">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover/sidebar:bg-primary/10 transition-all" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-slate-100 flex items-center justify-between">
                <span>{t("disciplines")}</span>
                <Filter size={12} className="text-primary" />
              </h4>
              <div className="flex flex-col space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => updateFilters({ category })}
                    className={`text-[11px] font-black uppercase tracking-widest py-3 px-6 text-left transition-all relative ${
                      activeCategory === category 
                      ? "text-primary bg-primary/5 translate-x-2" 
                      : "text-slate-400 hover:text-primary-darker hover:translate-x-1"
                    }`}
                  >
                    {activeCategory === category && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Insights Spotlights */}
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-4">{t("insights")}</h4>
               <div className="space-y-4">
                  {initialNews.slice(0, 3).map(item => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="block group/side">
                        <div className="bg-primary-darker p-8 hover:bg-primary transition-all duration-500 shadow-xl group/card">
                           <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-4 block group-hover/card:text-white/60">
                              {new Date(item.created_at).getFullYear()} Update
                           </span>
                           <h5 className="text-white font-black text-lg leading-tight uppercase tracking-tighter group-hover/card:text-white transition-colors">
                              {item.title}
                           </h5>
                        </div>
                    </Link>
                  ))}
               </div>
            </div>

            {/* Quick Links / Newsletter Card */}
            <div className="bg-primary p-12 text-white shadow-2xl relative overflow-hidden group/cta">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "20px 20px" }} />
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 relative z-10">{t("institutionalSubmissions")}</h4>
              <p className="text-sm font-medium text-white/80 mb-10 leading-relaxed relative z-10">
                {t("submissionsBody")}
              </p>
              <button className="w-full bg-white text-primary py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker hover:text-white transition-all relative z-10 shadow-xl">
                {t("submitSpotlight")}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsHubClient;
