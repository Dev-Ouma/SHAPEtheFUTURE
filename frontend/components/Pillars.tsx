"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getSettings } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";

type PillarsProps = { initialPillars?: any[] | null };

export default function Pillars({ initialPillars }: PillarsProps = {}) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const defaultPillars = useMemo(
    () => [
      {
        title: t("pillarFlexibility"),
        description: t("pillarFlexibilityDesc"),
        icon: "GraduationCap",
        color: "text-[#F2744D]",
      },
      {
        title: t("pillarOpenness"),
        description: t("pillarOpennessDesc"),
        icon: "Globe",
        color: "text-[#006A7D]",
      },
      {
        title: t("pillarInclusivity"),
        description: t("pillarInclusivityDesc"),
        icon: "Users",
        color: "text-[#F2744D]",
      },
      {
        title: t("pillarCertification"),
        description: t("pillarCertificationDesc"),
        icon: "Award",
        color: "text-[#006A7D]",
      },
    ],
    [t],
  );
  const hasServerPillars =
    Array.isArray(initialPillars) && initialPillars.length > 0;
  const [pillars, setPillars] = useState<any[]>(
    hasServerPillars ? initialPillars! : defaultPillars,
  );

  useEffect(() => {
    if (hasServerPillars) {
      setPillars(initialPillars!);
      return;
    }
    setPillars(defaultPillars);
    const fetchPillars = async () => {
      const data = await getSettings(locale);
      if (data && data.home_pillars_data) {
        try {
          const parsed = JSON.parse(data.home_pillars_data);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
            setPillars(parsed);
          }
        } catch (e) {
          console.error("Failed to parse pillars data");
        }
      }
    };
    fetchPillars();
  }, [locale, defaultPillars, hasServerPillars, initialPillars]);

  const renderIcon = (iconName: string, colorClass: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Layers;
    return <IconComponent size={24} strokeWidth={2} className={colorClass} />;
  };

  return (
    <section className="bg-white py-16 border-y border-slate-50 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={`${pillar.title}-${index}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-5 group text-center md:text-left"
            >
              <div className="bg-slate-50 p-4 rounded-sm transition-all duration-300 group-hover:bg-white group-hover:shadow-md border border-transparent group-hover:border-slate-100 flex-shrink-0">
                {renderIcon(pillar.icon, pillar.color || (index % 2 === 0 ? "text-[#F2744D]" : "text-[#006A7D]"))}
              </div>
              <div className="pt-0 md:pt-2">
                <h3 className="text-sm font-bold text-primary-darker mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
