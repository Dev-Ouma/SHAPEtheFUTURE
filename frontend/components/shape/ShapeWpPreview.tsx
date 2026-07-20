"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import ProgressBar from "@/components/shape/ProgressBar";
import type { ShapeWorkPackage } from "@/lib/shape-api";

export default function ShapeWpPreview({ packages }: { packages: ShapeWorkPackage[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((wp, i) => (
        <motion.div
          key={wp.id || wp.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
        >
          <Link
            href={`/work-packages/${wp.slug}`}
            className="block h-full border border-slate-200 p-6 hover:border-primary hover:bg-slate-50/80 transition-colors group"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-3">
              {wp.code}
            </p>
            <h3 className="font-serif text-lg font-black text-primary-darker uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
              {wp.title}
            </h3>
            <p className="text-sm text-slate-500 mb-5 line-clamp-2">{wp.summary}</p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <span>Progress</span>
              <span>{wp.progress ?? 0}%</span>
            </div>
            <ProgressBar value={wp.progress ?? 0} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
