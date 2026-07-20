"use client";

import React from "react";
import { motion } from "framer-motion";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function ShapePageHero({ eyebrow, title, subtitle, children }: Props) {
  return (
    <header className="shape-page-hero shape-hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-dark to-primary/40" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          {eyebrow ? (
            <p className="text-secondary text-[11px] font-black tracking-[0.4em] uppercase mb-5">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.05] mb-6">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-2xl normal-case tracking-normal">
              {subtitle}
            </p>
          ) : null}
          {children}
        </motion.div>
      </div>
    </header>
  );
}
