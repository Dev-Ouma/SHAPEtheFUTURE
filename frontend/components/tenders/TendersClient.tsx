"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Calendar, Clock, ArrowRight, Filter, RefreshCw, FileCheck } from "lucide-react";
import { getApiCached } from "@/lib/api";
import SectionHubLayout from "@/components/layouts/SectionHubLayout";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const STATUS_KEYS = ["Open", "Closed", "Awarded"] as const;

export default function TendersClient({
  initialTenders = [],
  initialCategories = [],
}: {
  initialTenders?: any[];
  initialCategories?: any[];
}) {
  const t = useTranslations("Tenders");
  const locale = useLocale();
  const seededTenders = Array.isArray(initialTenders) ? initialTenders : [];
  const seededCategories = Array.isArray(initialCategories) ? initialCategories : [];
  const [tenders, setTenders] = useState<any[]>(seededTenders);
  const [categories, setCategories] = useState<any[]>(seededCategories);
  const [loading, setLoading] = useState(seededTenders.length === 0);
  const [activeTab, setActiveTab] = useState("Open");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (seededTenders.length > 0) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [tendersData, catsData] = await Promise.all([
          getApiCached(`/tenders?locale=${encodeURIComponent(locale)}`, { revalidate: 120 }),
          getApiCached("/tenders/categories", { revalidate: 300 }),
        ]);
        if (cancelled) return;
        setTenders(Array.isArray(tendersData) ? tendersData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
      } catch (error) {
        console.error("Procurement sync failed:", error);
        if (!cancelled) {
          setTenders([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [locale, seededTenders.length]);

  const statusLabel = (status: string) => {
    if (status === "Open") return t("statusOpen");
    if (status === "Closed") return t("statusClosed");
    if (status === "Awarded") return t("statusAwarded");
    return status;
  };

  const tabLabel = (status: string) => {
    if (status === "Open") return t("tabOpen");
    if (status === "Closed") return t("tabClosed");
    if (status === "Awarded") return t("tabAwarded");
    return status;
  };

  const filteredTenders = tenders.filter((item) => {
    const matchesTab = item.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      (item.title || "").toLowerCase().includes(q) ||
      (item.referenceNumber || "").toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "All" || item.category?.name === selectedCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const dateLocale = locale === "sw" ? "sw-KE" : "en-GB";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-6">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const pageHeader = {
    title: t("title"),
    summary: t("summary"),
    content: ""
  };

  return (
    <SectionHubLayout page={pageHeader} parentSlug="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col space-y-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              {STATUS_KEYS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${
                    activeTab === tab 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tabLabel(tab)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-slate-200 outline-none focus:border-primary transition-all w-full md:w-64 text-xs font-medium"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 border transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary'}`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 block">{t("serviceCategory")}</label>
                    <div className="flex flex-wrap gap-2">
                      {["All", ...categories.map(c => c.name)].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tight transition-all border ${
                            selectedCategory === cat 
                            ? "bg-primary-darker border-slate-900 text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {cat === "All" ? t("all") : cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-end justify-end">
                     <Link 
                      href="/programmes"
                      className="flex items-center space-x-3 px-8 py-3.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-secondary/20"
                    >
                      <FileText size={14} />
                      <span>{t("viewProgrammes")}</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="wait">
            {filteredTenders.length > 0 ? (
              <motion.div 
                key={activeTab + selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-6"
              >
                {filteredTenders.map((tender, i) => (
                  <motion.div 
                    key={tender.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                    className="group bg-white border border-slate-100 p-6 md:p-10 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col md:flex-row md:items-center gap-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-darker group-hover:bg-primary transition-colors" />
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                           <span className="px-4 py-1.5 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
                            {tender.referenceNumber}
                          </span>
                        </div>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                          tender.status === 'Open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {statusLabel(tender.status)}
                        </span>
                        {tender.category && (
                          <div className="flex items-center space-x-2 text-slate-400 group-hover:text-primary transition-colors">
                            <Filter size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {tender.category.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker group-hover:text-primary transition-colors mb-6 leading-tight max-w-3xl">
                        {tender.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex items-center space-x-4 text-slate-500">
                          <div className="p-2.5 bg-slate-50 text-primary rounded-lg group-hover:bg-primary/5 transition-colors">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("published")}</p>
                            <p className="text-xs font-bold text-slate-700">{new Date(tender.publishedAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-slate-500">
                          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("deadline")}</p>
                            <p className="text-xs font-bold text-slate-700">{new Date(tender.closingAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {tender.department && (
                          <div className="flex items-center space-x-4 text-slate-500">
                            <div className="p-2.5 bg-slate-50 text-primary rounded-lg">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("issuingEntity")}</p>
                              <p className="text-xs font-bold text-slate-700">{tender.department.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-8 md:pt-0 md:pl-10 md:border-l border-slate-100 flex flex-col items-center justify-center space-y-4">
                      <Link 
                        href={`/tenders/${tender.slug}`}
                        className="flex items-center justify-center space-x-4 px-10 py-5 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all group/btn shadow-xl shadow-black/10"
                      >
                        <span>{t("examine")}</span>
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-2xl"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-full mb-8">
                  <FileText size={40} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-400">{t("emptyTitle")}</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">{t("emptyBody")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-20 p-12 bg-primary-darker text-white relative overflow-hidden group">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">{t("supportTitle")}</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 max-w-xl">
                {t("supportBody")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all">
                  {t("contactOffice")}
                </Link>
                <Link href="/faqs" className="px-8 py-4 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                  {t("faqsGuidelines")}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: t("totalAwarded"), value: 'KES 450M+', icon: FileCheck },
                { label: t("activeSellers"), value: '1,200+', icon: RefreshCw },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                  <stat.icon size={24} className="text-primary mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </SectionHubLayout>
  );
}
