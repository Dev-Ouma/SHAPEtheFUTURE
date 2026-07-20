"use client";

import React from "react";
import { motion } from "framer-motion";

type Stat = { value: string | number; label: string };

export default function ShapeStatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-white border-y border-slate-100">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="shape-stat"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
            >
              <span className="shape-stat-value">{stat.value}</span>
              <span className="shape-stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
