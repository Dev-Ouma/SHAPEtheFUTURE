"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

/**
 * Scroll-triggered reveal for SHAPE sections — calm fade + lift.
 * Honours prefers-reduced-motion.
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
