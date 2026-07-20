"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function ShapeHomeHero() {
  return (
    <section className="relative min-h-[100svh] flex items-end overflow-hidden shape-hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-[#013d48] via-[#025a69] to-[#037b90]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,127,80,0.28),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10 pb-20 md:pb-28 pt-40">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.45em] text-secondary mb-6">
            Erasmus+ · Co-funded by the European Union
          </p>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-6">
            SHAPE
          </h1>
          <p className="font-serif text-xl md:text-3xl text-white/90 font-semibold tracking-tight max-w-2xl mb-4 leading-snug">
            Strengthening Higher Education for Smart Cities
          </p>
          <p className="text-base md:text-lg text-white/70 max-w-xl mb-10 leading-relaxed">
            A three-year partnership of nine universities across six countries, building capacity for
            smart-city education in East Africa and Europe.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-secondary text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-colors"
            >
              About <ArrowRight size={14} />
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-colors"
            >
              Partners
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
