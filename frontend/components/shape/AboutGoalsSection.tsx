"use client";

import React from "react";
import { motion } from "framer-motion";

type ColumnProps = {
  eyebrow: string;
  title: string;
  items: string[];
  accent: "primary" | "secondary";
  delayBase?: number;
};

const ease = [0.22, 1, 0.36, 1] as const;

function GoalColumn({ eyebrow, title, items, accent, delayBase = 0 }: ColumnProps) {
  const accentBar = accent === "primary" ? "bg-primary" : "bg-secondary";
  const accentText = accent === "primary" ? "text-primary" : "text-secondary";
  const accentSoft =
    accent === "primary" ? "bg-primary/[0.06]" : "bg-secondary/[0.08]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay: delayBase, ease }}
      className="relative"
    >
      <div className={`absolute -left-px top-0 bottom-0 w-px ${accentSoft}`} />
      <p className={`shape-eyebrow mb-3 ${accentText}`}>{eyebrow}</p>
      <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight leading-[0.95] mb-10">
        {title}
      </h2>

      <ol className="space-y-0">
        {items.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.55,
              delay: delayBase + 0.08 + index * 0.08,
              ease,
            }}
            className="group relative grid grid-cols-[3.25rem_1fr] gap-4 py-5 border-t border-slate-200/80 last:border-b"
          >
            <span
              className={`font-serif text-2xl font-black tabular-nums leading-none pt-0.5 ${accentText} opacity-80 group-hover:opacity-100 transition-opacity`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative pl-4">
              <span
                className={`absolute left-0 top-1 bottom-1 w-0.5 ${accentBar} scale-y-0 origin-top transition-transform duration-500 group-hover:scale-y-100`}
              />
              <p className="text-slate-700 leading-relaxed text-[15px] md:text-base group-hover:text-primary-darker transition-colors duration-300">
                {item}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

type Props = {
  objectives: string[];
  outcomes: string[];
};

export default function AboutGoalsSection({ objectives, outcomes }: Props) {
  return (
    <section className="relative shape-section overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-[#037b90]/[0.04]" />
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(3,123,144,0.08), transparent 42%), radial-gradient(circle at 88% 70%, rgba(255,127,80,0.1), transparent 40%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.65, ease }}
          className="max-w-2xl mb-14 md:mb-16"
        >
          <p className="shape-eyebrow mb-3">Strategy</p>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-primary-darker uppercase tracking-tight leading-[0.92]">
            Ambition and impact
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed max-w-xl">
            What SHAPE sets out to achieve — and the results the consortium is building toward across six
            countries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-14 lg:gap-20">
          <GoalColumn
            eyebrow="Objectives"
            title="What we pursue"
            items={objectives}
            accent="primary"
            delayBase={0.05}
          />
          <GoalColumn
            eyebrow="Expected outcomes"
            title="What we deliver"
            items={outcomes}
            accent="secondary"
            delayBase={0.15}
          />
        </div>
      </div>
    </section>
  );
}
