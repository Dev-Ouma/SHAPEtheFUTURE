"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import type { ShapeObjective } from "@/lib/shape-api";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  objectives: ShapeObjective[];
};

export default function HomeObjectives({ objectives }: Props) {
  return (
    <section className="shape-section bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <p className="shape-eyebrow mb-3">Project objectives</p>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-primary-darker uppercase tracking-tight leading-[0.92] mb-4">
            Three outcomes that steer the consortium
          </h2>
          <p className="text-slate-600 leading-relaxed">
            SHAPE focuses institutional capacity, curriculum co-design, and collaborative culture so
            partner universities can deliver smart-city higher education at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {objectives.map((obj, i) => (
            <motion.article
              key={obj.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              className="border border-slate-200 bg-white p-7 border-t-4 border-t-primary"
            >
              <span className="font-serif text-3xl font-black text-secondary tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight mt-4 mb-3 leading-snug">
                {obj.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{obj.text}</p>
            </motion.article>
          ))}
        </div>

        <Link
          href="/the-project"
          className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
        >
          Read more about the project →
        </Link>
      </div>
    </section>
  );
}
