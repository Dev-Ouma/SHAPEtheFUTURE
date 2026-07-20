"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getApiCached, resolveImageUrl } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";

type BackLinksProps = {
  initialPartners?: any[];
  initialStats?: any;
};

export default function BackLinks({
  initialPartners,
  initialStats,
}: BackLinksProps = {}) {
  const t = useTranslations("Home");
  const hasServerData = Array.isArray(initialPartners);
  const [partners, setPartners] = useState<any[]>(
    Array.isArray(initialPartners) ? initialPartners : [],
  );
  const [stats, setStats] = useState<any>(
    hasServerData ? initialStats ?? null : null,
  );

  useEffect(() => {
    if (hasServerData) {
      setPartners(Array.isArray(initialPartners) ? initialPartners : []);
      setStats(initialStats ?? null);
      return;
    }
    const fetchData = async () => {
      try {
        const [partnersData, statsData] = await Promise.all([
          getApiCached("/partnerships?featured=true", { revalidate: 300 }),
          getApiCached("/partnerships/stats", { revalidate: 300 }),
        ]);

        if (Array.isArray(partnersData)) {
          setPartners(partnersData);
        }
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch partnership data", err);
      }
    };
    fetchData();
  }, [hasServerData, initialPartners, initialStats]);

  if (partners.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 border-b border-slate-100 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block"
            >
              {t("partnersEyebrow")}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-primary-darker uppercase tracking-tighter leading-none"
            >
              {t("partnersTitle")} <br /> <span className="text-secondary font-serif italic lowercase">{t("partnersTitleAccent")}</span>
            </motion.h2>
          </div>

          <Link href="/partnerships">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors group"
            >
              <span>{t("viewAllPartners")}</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </Link>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {[
              { label: t("statActivePartners"), value: stats.activePartners, suffix: "+" },
              { label: t("statCountries"), value: stats.countriesReached, suffix: "" },
              { label: t("statJointProjects"), value: stats.jointProjects, suffix: "+" },
              { label: t("statFeaturedImpact"), value: stats.featuredPartners, suffix: "" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 border-b-2 border-slate-100 hover:border-primary transition-all shadow-sm"
              >
                <div className="text-3xl font-black text-primary mb-1">{stat.value}{stat.suffix}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {partners.map((partner) => (
            <motion.a
              key={partner.id}
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="flex items-center justify-center group"
              title={partner.name}
            >
              {partner.logo_url ? (
                <SafeImage
                  src={resolveImageUrl(partner.logo_url)}
                  alt={partner.name}
                  width={160}
                  height={56}
                  className="h-10 md:h-14 w-auto object-contain transition-transform group-hover:brightness-110"
                />
              ) : (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{partner.name}</span>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
