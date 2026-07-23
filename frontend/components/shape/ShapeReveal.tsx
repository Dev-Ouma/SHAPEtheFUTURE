"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SHAPE_EASE, SECTION_REVEAL } from "@/lib/shape-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

/**
 * Scroll-triggered reveal for SHAPE sections — calm fade + lift.
 * Honours prefers-reduced-motion. Tokens from `lib/shape-motion.ts`.
 */
export default function ShapeReveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ ...SECTION_REVEAL.hidden, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease: SHAPE_EASE.editorial }}
    >
      {children}
    </motion.div>
  );
}
