"use client";

import React from "react";
import { motion } from "framer-motion";
import { resolveImageUrl } from "@/lib/api";

export type NewsVisualAssets = {
  tablet: string;
  orb: string;
  cards: string;
};

/**
 * Classy CSS-3D floating assets for the news hub.
 * Image URLs come from CMS settings (DB).
 */
export default function NewsSearchVisuals({
  searching = false,
  assets,
}: {
  searching?: boolean;
  assets: NewsVisualAssets;
}) {
  const tablet = resolveImageUrl(assets.tablet) || assets.tablet;
  const orb = resolveImageUrl(assets.orb) || assets.orb;
  const cards = resolveImageUrl(assets.cards) || assets.cards;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="absolute right-[8%] top-[18%] w-64 h-64 rounded-full bg-secondary/20 blur-3xl"
        animate={{ opacity: searching ? [0.35, 0.65, 0.35] : [0.2, 0.35, 0.2], scale: [1, 1.12, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[2%] top-[8%] w-[220px] md:w-[280px] lg:w-[320px] hidden sm:block"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, rotateY: -28, rotateX: 12 }}
        animate={{
          opacity: searching ? 1 : 0.85,
          rotateY: searching ? [-16, -6, -16] : [-20, -12, -20],
          rotateX: searching ? [8, 14, 8] : [10, 12, 10],
          y: searching ? [0, -14, 0] : [0, -8, 0],
        }}
        transition={{ duration: searching ? 5.5 : 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tablet}
          alt=""
          className="w-full h-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)] select-none"
          draggable={false}
        />
      </motion.div>

      <motion.div
        className="absolute right-[24%] bottom-[4%] w-[150px] md:w-[190px] hidden md:block"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: searching ? 1 : 0.55,
          scale: searching ? [1, 1.06, 1] : [0.92, 0.98, 0.92],
          rotateZ: searching ? [0, 8, 0] : [0, 4, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={orb}
          alt=""
          className="w-full h-auto drop-shadow-[0_24px_40px_rgba(3,123,144,0.5)] select-none"
          draggable={false}
        />
      </motion.div>

      <motion.div
        className="absolute left-[1%] bottom-[-8%] w-[240px] md:w-[300px] opacity-50 md:opacity-80 hidden lg:block"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateY: searching ? [12, 22, 12] : [8, 14, 8],
          rotateX: [6, 10, 6],
          y: searching ? [0, -16, 0] : [0, -10, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cards}
          alt=""
          className="w-full h-auto drop-shadow-[0_28px_48px_rgba(0,0,0,0.4)] select-none"
          draggable={false}
        />
      </motion.div>

      {searching ? (
        <motion.div
          className="absolute right-[18%] top-[40%] w-24 h-24 border border-secondary/40"
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{
            rotate: { duration: 14, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity },
          }}
        />
      ) : null}
    </div>
  );
}
