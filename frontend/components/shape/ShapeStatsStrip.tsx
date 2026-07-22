"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { Link } from "@/i18n/routing";

type Stat = { value: string | number; label: string };

const ease = [0.22, 1, 0.36, 1] as const;

function parseStatValue(raw: string | number): {
  prefix: string;
  end: number;
  suffix: string;
  isNumeric: boolean;
  display: string;
  isFraction: boolean;
  denom?: string;
} {
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
    return {
      prefix: "",
      end: 0,
      suffix: "",
      isNumeric: false,
      display,
      isFraction: false,
    };
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

function StatValue({ value, active }: { value: string | number; active: boolean }) {
  const parsed = parseStatValue(value);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active || reduce || !parsed.isNumeric) {
      setN(parsed.end);
      return;
    }
    mv.set(0);
    const controls = animate(mv, parsed.end, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setN(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [
    active,
    reduce,
    parsed.end,
    parsed.isNumeric,
    mv,
    rounded,
  ]);

  if (!parsed.isNumeric) {
    return <span className="shape-stat-value">{parsed.display}</span>;
  }

  if (parsed.isFraction) {
    return (
      <span className="shape-stat-value inline-flex items-baseline gap-0.5 tabular-nums">
        <span>{n}</span>
        <span className="text-[0.45em] font-bold text-slate-400 tracking-normal">
          /{parsed.denom}
        </span>
      </span>
    );
  }

  return (
    <span className="shape-stat-value tabular-nums">
      {parsed.prefix}
      {n}
      {parsed.suffix}
    </span>
  );
}

function StatCell({
  stat,
  index,
  total,
}: {
  stat: Stat;
  index: number;
  total: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={`shape-stat group relative ${
        index < total - 1
          ? "md:after:absolute md:after:right-0 md:after:top-3 md:after:bottom-3 md:after:w-px md:after:bg-slate-200"
          : ""
      }`}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: index * 0.06, duration: 0.55, ease }}
    >
      <span className="shape-stat-index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>
      <StatValue value={stat.value} active={inView} />
      <span className="shape-stat-label">{stat.label}</span>
    </motion.div>
  );
}

export default function ShapeStatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <section
      id="shape-home-stats"
      className="relative scroll-mt-24 bg-[#f7fafb] border-y border-slate-200/80"
      aria-label="Project figures"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" aria-hidden />

      <div className="container mx-auto px-6 py-12 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 md:mb-10">
          <div>
            <p className="shape-eyebrow mb-2">At a glance</p>
            <h2 className="font-serif text-xl md:text-2xl font-black text-primary-darker uppercase tracking-tight">
              Key figures
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"
          >
            Full dashboard →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4 md:gap-x-0">
          {stats.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} index={i} total={stats.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
