"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type Props = {
  value: number;
  className?: string;
  tone?: "primary" | "secondary";
};

export default function ProgressBar({ value, className = "", tone = "primary" }: Props) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [width, setWidth] = useState(reduce ? pct : 0);

  useEffect(() => {
    if (reduce) {
      setWidth(pct);
      return;
    }
    if (inView) setWidth(pct);
  }, [inView, pct, reduce]);

  return (
    <div
      ref={ref}
      className={`progress-bar ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={
          tone === "secondary" ? "progress-bar-fill-secondary" : "progress-bar-fill"
        }
        style={{
          width: `${width}%`,
          transition: reduce ? undefined : "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#037b90"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl font-black text-primary-darker">{Math.round(pct)}%</span>
        {label ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
