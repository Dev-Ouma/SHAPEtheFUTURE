"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";

const ease = [0.22, 1, 0.36, 1] as const;

function normalize(p: ShapePartner & Record<string, any>): ShapePartner & {
  region?: string;
  consortium_role?: string;
} {
  return {
    ...p,
    website: p.website || p.website_url,
    contact_name: p.contact_name || p.contact_person,
    role: p.role || p.consortium_role || "Partner",
    description: p.description,
    lat: p.lat ?? p.latitude,
    lng: p.lng ?? p.longitude,
  };
}

export default function PartnersGrid({ partners }: { partners: ShapePartner[] }) {
  const locale = useLocale();
  const items = useMemo(() => partners.map((p) => normalize(p as any)), [partners]);
  const [filter, setFilter] = useState<"all" | "east_africa" | "europe">("all");

  const displayName = (p: ShapePartner) =>
    locale === "sw" && p.name_sw ? p.name_sw : p.name;
  const displayDesc = (p: ShapePartner) =>
    locale === "sw" && p.description_sw ? p.description_sw : p.description;

  const filtered = items.filter((p: any) => {
    if (filter === "all") return true;
    return (p.region || "").toLowerCase() === filter;
  });

  const east = items.filter((p: any) => p.region === "east_africa").length;
  const europe = items.filter((p: any) => p.region === "europe").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
        <div>
          <p className="shape-eyebrow mb-3">Consortium</p>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight">
            Nine institutions · six countries
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `All (${items.length})` },
              { id: "east_africa", label: `East Africa (${east})` },
              { id: "europe", label: `Europe (${europe})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                filter === tab.id
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id || p.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.5, ease }}
            >
              <Link
                href={`/partners/${p.slug}`}
                className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white hover:border-primary transition-colors"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-secondary scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-center justify-between gap-3 px-6 pt-6">
                  <div className="h-12 flex items-center">
                    {p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(p.logo_url)}
                        alt={`${displayName(p)} logo`}
                        className="h-10 w-auto max-w-[160px] object-contain"
                      />
                    ) : (
                      <span className="font-serif text-2xl font-black text-primary tracking-tight">
                        {p.short_name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 ${
                      (p as any).region === "europe"
                        ? "text-secondary bg-secondary/10"
                        : "text-primary bg-primary/10"
                    }`}
                  >
                    {p.role}
                  </span>
                </div>

                <div className="px-6 pt-5 pb-6 flex-1 flex flex-col">
                  <h2 className="font-serif text-xl md:text-2xl font-black text-primary-darker uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {displayName(p)}
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <MapPin size={12} className="text-secondary" />
                    {[p.city, p.country].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-4 normal-case tracking-normal flex-1">
                    {displayDesc(p) ||
                      (locale === "sw" && p.responsibilities_sw
                        ? p.responsibilities_sw
                        : p.responsibilities)}
                  </p>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      View profile
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
