"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import ProgressBar from "@/components/shape/ProgressBar";
import type { ShapeWorkPackage } from "@/lib/shape-api";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ShapeWpPreview({
  packages,
  limit,
}: {
  packages: ShapeWorkPackage[];
  limit?: number;
}) {
  const items = limit ? packages.slice(0, limit) : packages;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      {items.map((wp, i) => (
        <motion.div
          key={wp.id || wp.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: Math.min(i * 0.06, 0.35), duration: 0.5, ease }}
        >
          <Link
            href={`/work-packages/${wp.slug}`}
            className="relative block h-full border border-slate-200 p-6 hover:border-primary transition-colors group overflow-hidden"
          >
            <span className="absolute top-0 left-0 right-0 h-0.5 bg-secondary scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-3">
              {wp.code}
            </p>
            <h3 className="font-serif text-lg font-black text-primary-darker uppercase tracking-tight mb-3 group-hover:text-primary transition-colors leading-snug">
              {wp.title}
            </h3>
            <p className="text-sm text-slate-500 mb-5 line-clamp-3 normal-case tracking-normal">
              {wp.summary || wp.description}
            </p>
            {wp.leader ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                Lead · {wp.leader}
              </p>
            ) : null}
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <span>Progress</span>
              <span className="tabular-nums">{wp.progress ?? 0}%</span>
            </div>
            <ProgressBar value={wp.progress ?? 0} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
