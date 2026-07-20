"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";

export default function ShapePartnersStrip({ partners }: { partners: ShapePartner[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {partners.map((p, i) => (
        <motion.div
          key={p.id || p.slug}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
        >
          <Link
            href={`/partners/${p.slug}`}
            className="flex flex-col items-start justify-between min-h-[120px] border border-slate-200 p-5 hover:border-primary hover:shadow-sm transition-all bg-white"
          >
            {p.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveImageUrl(p.logo_url)}
                alt={p.name}
                className="h-8 w-auto object-contain mb-4"
              />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4">
                {p.short_name || p.country}
              </span>
            )}
            <div>
              <p className="text-sm font-bold text-primary-darker leading-snug">{p.name}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                {p.country}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
