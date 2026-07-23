"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useInView,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { SHAPE_EASE } from "@/lib/shape-motion";

/**
 * Self-contained count-up number. Animates from 0 → target the first time it
 * scrolls into view. Understands plain numbers ("4500"), prefixed/suffixed
 * values ("$1.2M", "26%") and fractions ("10/32"). Honours reduced-motion by
 * rendering the final value immediately. Tokens from `lib/shape-motion.ts`.
 */

type Parsed = {
  prefix: string;
  end: number;
  suffix: string;
  isNumeric: boolean;
  display: string;
  isFraction: boolean;
  denom?: string;
};

function parseValue(raw: string | number): Parsed {
  const display = String(raw);
  const slash = display.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slash) {
    return {
      prefix: "",
      end: Number(slash[1]),
      suffix: "",
      isNumeric: true,
      display,
      isFraction: true,
      denom: slash[2],
    };
  }
  const m = display.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) {
    return { prefix: "", end: 0, suffix: "", isNumeric: false, display, isFraction: false };
  }
  return {
    prefix: m[1] || "",
    end: Number(m[2]),
    suffix: m[3] || "",
    isNumeric: true,
    display,
    isFraction: false,
  };
}

type Props = {
  value: string | number;
  className?: string;
  duration?: number;
  once?: boolean;
};

export default function CountUp({ value, className, duration = 1.2, once = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-48px" });
  const parsed = parseValue(value);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || reduce || !parsed.isNumeric) {
      setN(parsed.end);
      return;
    }
    mv.set(0);
    const controls = animate(mv, parsed.end, { duration, ease: SHAPE_EASE.editorial });
    const unsub = rounded.on("change", (v) => setN(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, reduce, parsed.isNumeric, parsed.end, duration, mv, rounded]);

  if (!parsed.isNumeric) {
    return (
      <span ref={ref} className={className}>
        {parsed.display}
      </span>
    );
  }

  if (parsed.isFraction) {
    return (
      <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
        {n}
        <span className="opacity-60">/{parsed.denom}</span>
      </span>
    );
  }

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {parsed.prefix}
      {n}
      {parsed.suffix}
    </span>
  );
}
