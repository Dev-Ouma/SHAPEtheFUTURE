"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";

export default function PartnersGrid({ partners }: { partners: ShapePartner[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map((p, i) => (
        <motion.div
          key={p.id || p.slug}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04, duration: 0.4 }}
        >
          <Link
            href={`/partners/${p.slug}`}
            className="block h-full border border-slate-200 p-6 md:p-8 hover:border-primary hover:bg-slate-50/80 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(p.logo_url)} alt="" className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">
                  {p.short_name || p.country.slice(0, 3)}
                </span>
              )}
              <span className="text-[9px] font-black uppercase tracking-widest text-secondary">
                {p.role || "Partner"}
              </span>
            </div>
            <h2 className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors mb-2">
              {p.name}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {[p.city, p.country].filter(Boolean).join(" · ")}
            </p>
            {p.responsibilities ? (
              <p className="mt-4 text-sm text-slate-500 line-clamp-3 normal-case tracking-normal">{p.responsibilities}</p>
            ) : null}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
