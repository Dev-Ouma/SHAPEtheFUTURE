"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SHAPE_EASE } from "@/lib/shape-motion";

/**
 * Reusable heading reveal — each word rises from behind a clip mask, staggered,
 * the first time the heading scrolls into view. Wrap-safe (words break onto new
 * lines naturally). Honours reduced-motion by rendering plain text. Shares the
 * hero's easing so section headings read as one system.
 */

type Tag = "h1" | "h2" | "h3" | "h4" | "p";

type Props = {
  children: string;
  as?: Tag;
  className?: string;
  /** Delay before the first word (seconds). */
  delay?: number;
  /** Per-word stagger (seconds). */
  stagger?: number;
  once?: boolean;
};

const wordVariant = {
  hidden: { y: "115%" },
  show: {
    y: "0%",
    transition: { duration: 0.8, ease: SHAPE_EASE.editorial },
  },
} as const;

export default function RevealHeading({
  children,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.075,
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  const words = children.split(" ");

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const MotionTag = motion[as] as typeof motion.h2;

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-10% 0px" }}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <React.Fragment key={`${w}-${i}`}>
            <span className="inline-block overflow-hidden align-bottom py-[0.12em] -my-[0.12em]">
              <motion.span variants={wordVariant} className="inline-block">
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </React.Fragment>
        ))}
      </span>
    </MotionTag>
  );
}
