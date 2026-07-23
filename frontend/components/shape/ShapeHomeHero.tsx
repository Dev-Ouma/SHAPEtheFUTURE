"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import ShapeHeroSlideshow, {
  type HeroSlide,
} from "@/components/shape/ShapeHeroSlideshow";
import { HERO_COPY } from "@/lib/shape-motion";

type ShapeHomeHeroProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  tagline?: string;
  slides?: HeroSlide[];
};

export default function ShapeHomeHero({
  eyebrow = "East Africa • Higher Education • Smart Cities",
  title = "SHAPE",
  text = "Co-funded by the Erasmus+ programme of the European Union, SHAPE strengthens higher education for smart cities across East Africa and Europe — building curricula, digital learning, and institutional capacity with nine partner universities.",
  tagline = "Strengthening Higher Education for Smart Cities",
  slides,
}: ShapeHomeHeroProps) {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden isolate">
      {/* Imagery stays behind chrome */}
      <div className="absolute inset-0 z-0">
        <ShapeHeroSlideshow slides={slides} motionType="page" />
      </div>

      {/* Nav clearance scrim — keeps menus readable over bright plates */}
      <div
        className="absolute inset-x-0 top-0 z-[1] h-28 md:h-36 pointer-events-none bg-gradient-to-b from-black/70 via-black/40 to-transparent"
        aria-hidden
      />

      {/* Full-bleed dim + brand tint — baseline contrast under any slide */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-[#012f38]/55"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-[#013d48]/70 via-[#025a69]/45 to-transparent pointer-events-none"
        aria-hidden
      />

      {/* Copy scrim — left-weighted veil so body text clears WCAG on bright plates */}
      <div
        className="absolute inset-y-0 left-0 z-[1] w-full max-w-5xl pointer-events-none bg-gradient-to-r from-black/55 via-black/30 to-transparent"
        aria-hidden
      />

      <div
        className={`absolute -top-1/4 -right-1/4 z-[1] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(255,127,80,0.14)_0%,transparent_68%)] blur-2xl pointer-events-none ${
          reduce ? "" : "shape-hero-bloom"
        }`}
        aria-hidden
      />
      <div
        className={`absolute -bottom-1/3 -left-1/4 z-[1] h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(3,123,144,0.22)_0%,transparent_70%)] blur-3xl pointer-events-none ${
          reduce ? "" : "shape-hero-bloom-alt"
        }`}
        aria-hidden
      />

      <div
        className={`absolute inset-0 z-[1] opacity-[0.05] pointer-events-none ${reduce ? "" : "shape-hero-grid"}`}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="container mx-auto px-6 relative z-10 pb-20 md:pb-28 pt-44 md:pt-48">
        <motion.div
          className="max-w-4xl shape-hero-copy"
          variants={reduce ? undefined : HERO_COPY.container}
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <motion.p
            variants={reduce ? undefined : HERO_COPY.item}
            className="text-[11px] font-black uppercase tracking-[0.45em] text-[#ffb08a] mb-6 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            variants={reduce ? undefined : HERO_COPY.item}
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={reduce ? undefined : HERO_COPY.item}
            className="font-serif text-xl md:text-3xl text-white font-semibold tracking-tight max-w-2xl mb-4 leading-snug drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
          >
            {tagline}
          </motion.p>

          <motion.p
            variants={reduce ? undefined : HERO_COPY.item}
            className="text-base md:text-lg text-white/95 max-w-xl mb-10 leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,0.35)]"
          >
            {text}
          </motion.p>

          <motion.div
            variants={reduce ? undefined : HERO_COPY.item}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/the-project"
              className="group inline-flex items-center gap-2 bg-secondary text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:translate-x-0.5 hover:bg-white hover:text-primary-darker"
            >
              The Project{" "}
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 border border-white/70 bg-black/25 backdrop-blur-sm text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-primary-darker hover:border-white"
            >
              Partners
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-white/70 bg-black/25 backdrop-blur-sm text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:bg-white hover:text-primary-darker hover:border-white"
            >
              Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {!reduce ? (
        <motion.a
          href="#shape-home-stats"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/75 hover:text-white transition-colors drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
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
