"use client";

import React from "react";
import { AreaChart, BarChart3, LineChart, PieChart, Table2 } from "lucide-react";
import type { ChartVisualType } from "@/lib/analytics-chart-prefs";

const OPTIONS: { id: ChartVisualType; label: string; icon: React.ReactNode }[] = [
  { id: "area", label: "Area", icon: <AreaChart size={13} /> },
  { id: "bar", label: "Bar", icon: <BarChart3 size={13} /> },
  { id: "line", label: "Line", icon: <LineChart size={13} /> },
  { id: "pie", label: "Pie", icon: <PieChart size={13} /> },
  { id: "table", label: "Table", icon: <Table2 size={13} /> },
];

type Props = {
  value: ChartVisualType;
  onChange: (next: ChartVisualType) => void;
  /** Restrict which visuals are offered for this panel. */
  allowed?: ChartVisualType[];
  className?: string;
};

export default function ChartTypeSwitcher({
  value,
  onChange,
  allowed,
  className = "",
}: Props) {
  const opts = allowed?.length
    ? OPTIONS.filter((o) => allowed.includes(o.id))
    : OPTIONS;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 ${className}`}
      role="group"
      aria-label="Chart display type"
    >
      {opts.map((opt) => (
        <button
          key={opt.id}
          type="button"
          title={opt.label}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors ${
            value === opt.id
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
