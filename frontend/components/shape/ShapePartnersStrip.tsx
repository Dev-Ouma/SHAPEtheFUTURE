"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";

export default function ShapePartnersStrip({ partners }: { partners: ShapePartner[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {partners.map((p, i) => {
        const role = (p as any).consortium_role || p.role;
        return (
          <motion.div
            key={p.id || p.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
          >
            <Link
              href={`/partners/${p.slug}`}
              className="group flex flex-col items-start justify-between min-h-[140px] border border-slate-200 p-5 hover:border-primary transition-colors bg-white"
            >
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(p.logo_url)}
                  alt={p.name}
                  className="h-8 w-auto max-w-full object-contain mb-4"
                />
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4">
                  {p.short_name || p.country}
                </span>
              )}
              <div>
                <p className="text-sm font-bold text-primary-darker leading-snug group-hover:text-primary transition-colors">
                  {p.short_name || p.name}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {p.country}
                </p>
                {role ? (
                  <p className="text-[9px] font-black uppercase tracking-widest text-secondary mt-2 line-clamp-2">
                    {role}
                  </p>
                ) : null}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
