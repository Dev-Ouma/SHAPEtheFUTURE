"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

type ShapeHomeHeroProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  tagline?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease },
  },
};

export default function ShapeHomeHero({
  eyebrow = "East Africa • Higher Education • Smart Cities",
  title = "SHAPE",
  text = "Co-funded by the Erasmus+ programme of the European Union, SHAPE strengthens higher education for smart cities across East Africa and Europe — building curricula, digital learning, and institutional capacity with nine partner universities.",
  tagline = "Strengthening Higher Education for Smart Cities",
}: ShapeHomeHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden shape-hero-pattern">
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#013d48] via-[#025a69] to-[#037b90]" />

      {/* Slow drifting coral bloom */}
      <div
        className={`absolute -top-1/4 -right-1/4 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(255,127,80,0.32)_0%,transparent_68%)] blur-2xl ${
          reduce ? "" : "shape-hero-bloom"
        }`}
        aria-hidden
      />
      {/* Soft teal counter-light */}
      <div
        className={`absolute -bottom-1/3 -left-1/4 h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(3,123,144,0.55)_0%,transparent_70%)] blur-3xl ${
          reduce ? "" : "shape-hero-bloom-alt"
        }`}
        aria-hidden
      />

      {/* Drifting grid */}
      <div
        className={`absolute inset-0 opacity-[0.11] ${reduce ? "" : "shape-hero-grid"}`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Bottom fade into page */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto px-6 relative z-10 pb-20 md:pb-28 pt-40">
        <motion.div
          className="max-w-4xl"
          variants={reduce ? undefined : container}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <motion.p
            variants={reduce ? undefined : item}
            className="text-[11px] font-black uppercase tracking-[0.45em] text-secondary mb-6"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            variants={reduce ? undefined : item}
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={reduce ? undefined : item}
            className="font-serif text-xl md:text-3xl text-white/90 font-semibold tracking-tight max-w-2xl mb-4 leading-snug"
          >
            {tagline}
          </motion.p>

          <motion.p
            variants={reduce ? undefined : item}
            className="text-base md:text-lg text-white/70 max-w-xl mb-10 leading-relaxed"
          >
            {text}
          </motion.p>

          <motion.div
            variants={reduce ? undefined : item}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/the-project"
              className="group inline-flex items-center gap-2 bg-secondary text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest transition-transform duration-300 hover:translate-x-0.5 hover:bg-white hover:text-primary-darker"
            >
              The Project{" "}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-primary-darker hover:border-white"
            >
              Partners
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-primary-darker hover:border-white"
            >
              Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {!reduce ? (
        <motion.a
          href="#shape-home-stats"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          aria-label="Scroll to project statistics"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.35em]">
            Scroll
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} strokeWidth={2} />
          </motion.span>
        </motion.a>
      ) : null}
    </section>
  );
}
