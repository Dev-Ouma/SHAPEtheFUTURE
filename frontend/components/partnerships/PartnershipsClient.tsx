"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiCached } from "@/lib/api";
import PartnershipCard from "@/components/PartnershipCard";
import { Search, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PartnershipsClient({
  initialPartners = [],
  initialCategories = [],
  initialStats = null,
}: {
  initialPartners?: any[];
  initialCategories?: any[];
  initialStats?: any;
}) {
  const t = useTranslations("Partnerships");
  const seededPartners = Array.isArray(initialPartners) ? initialPartners : [];
  const seededCategories = Array.isArray(initialCategories) ? initialCategories : [];
  const [partners, setPartners] = useState<any[]>(seededPartners);
  const [categories, setCategories] = useState<any[]>(seededCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(seededPartners.length === 0);
  const [stats, setStats] = useState<any>(initialStats);

  useEffect(() => {
    if (seededPartners.length > 0) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [partnersData, categoriesData, statsData] = await Promise.all([
          getApiCached("/partnerships", { revalidate: 300 }),
          getApiCached("/partnerships/categories", { revalidate: 300 }),
          getApiCached("/partnerships/stats", { revalidate: 300 }),
        ]);
        if (cancelled) return;
        setPartners(Array.isArray(partnersData) ? partnersData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setStats(statsData && typeof statsData === "object" ? statsData : null);
      } catch (err) {
        console.error("Failed to fetch partnerships", err);
        if (!cancelled) {
          setPartners([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [seededPartners.length]);

  const filteredPartners = partners.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.category?.slug === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.name || "").toLowerCase().includes(q) ||
      (p.partnership_type || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary-darker pt-40 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="container mx-auto px-6 relative z-10 text-left">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-6 block"
          >
            {t("eyebrow")}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none"
          >
            {t("title")} <br /> <span className="text-secondary font-serif italic lowercase">{t("titleAccent")}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl leading-relaxed font-medium"
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="bg-white border-b border-slate-100 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: t("statActiveAlliances"), value: stats.activePartners, icon: <Globe className="text-primary" size={24} /> },
                { label: t("statPartnerCountries"), value: stats.countriesReached, icon: <Globe className="text-primary" size={24} /> },
                { label: t("statCollaborativeProjects"), value: stats.jointProjects, icon: <Globe className="text-primary" size={24} /> },
                { label: t("statGlobalReach"), value: "24/7", icon: <Globe className="text-primary" size={24} /> }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/5 flex items-center justify-center rounded-xl">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-primary-darker">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === "all" ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {t("allPartners")}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.slug ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none px-12 py-3 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary/20 transition-all rounded-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredPartners.map(partner => (
                    <PartnershipCard key={partner.id} partner={partner} />
                  ))}
                </AnimatePresence>
              </div>

              {filteredPartners.length === 0 && (
                <div className="text-center py-40">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">{t("emptyTitle")}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-4">{t("emptyBody")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {/* Become a Partner CTA */}
      <section className="bg-primary py-24">
        <div className="container mx-auto px-6 text-left">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase tracking-tighter">{t("ctaTitle")} <span className="text-secondary">{t("ctaTitleBrand")}</span></h2>
          <p className="text-white/80 text-lg max-w-2xl mb-12 font-medium">
            {t("ctaBody")}
          </p>
          <button className="bg-white text-primary px-12 py-6 font-black uppercase tracking-[0.2em] text-xs hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl">
            {t("ctaButton")}
          </button>
        </div>
      </section>
    </main>
  );
}
