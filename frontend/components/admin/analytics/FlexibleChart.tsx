"use client";

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { ChartVisualType } from "@/lib/analytics-chart-prefs";

export const CHART_COLORS = [
  "#0d3b5e", "#ff7f50", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white shadow-xl">
      {label != null && label !== "" && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-xs font-medium">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color || p.payload?.fill || p.stroke }}
          />
          {p.name}: <span className="font-semibold tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

type Datum = Record<string, any>;

type Props = {
  type: ChartVisualType;
  data: Datum[];
  /** Category / time axis key */
  nameKey?: string;
  /** Numeric value key */
  valueKey?: string;
  /** Series display name */
  seriesName?: string;
  height?: number;
  /** Horizontal bars for category rankings */
  layout?: "horizontal" | "vertical";
  /** Optional label mapper for nameKey values (e.g. feedback_type → human label) */
  formatName?: (name: string) => string;
  colors?: string[];
  /** Center label for pie/donut */
  centerLabel?: { value: string | number; caption?: string };
};

export default function FlexibleChart({
  type,
  data,
  nameKey = "name",
  valueKey = "value",
  seriesName = "Count",
  height = 280,
  layout = "horizontal",
  formatName,
  colors = CHART_COLORS,
  centerLabel,
}: Props) {
  const rows = (data || []).map((d) => ({
    ...d,
    [nameKey]: formatName ? formatName(String(d[nameKey] ?? "")) : d[nameKey],
  }));

  if (!rows.length) {
    return (
      <div
        className="flex items-center justify-center text-sm font-medium text-slate-400"
        style={{ height }}
      >
        No data for this view.
      </div>
    );
  }

  if (type === "table") {
    return (
      <div
        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
        style={{ maxHeight: height }}
      >
        <div className="h-full overflow-y-auto">
          <table className="w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[72%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Label</th>
                <th className="px-4 py-2.5 text-right">{seriesName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${row[nameKey]}-${i}`} className="border-t border-slate-100">
                  <td className="truncate px-4 py-2.5 font-medium text-slate-700">
                    {row[nameKey]}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                    {row[valueKey]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={Math.min(90, height / 3)}
              paddingAngle={3}
              stroke="none"
            >
              {rows.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-slate-800">
              {centerLabel.value}
            </span>
            {centerLabel.caption && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {centerLabel.caption}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const isVerticalBars = type === "bar" && layout === "vertical";

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="flexAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.18} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={valueKey}
              name={seriesName}
              stroke={colors[0]}
              strokeWidth={2.5}
              fill="url(#flexAreaFill)"
            />
          </AreaChart>
        ) : type === "line" ? (
          <LineChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={valueKey}
              name={seriesName}
              stroke={colors[0]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors[0] }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        ) : isVerticalBars ? (
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              dataKey={nameKey}
              type="category"
              width={140}
              tick={{ fontSize: 10, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
            <Bar dataKey={valueKey} name={seriesName} radius={[0, 6, 6, 0]} barSize={18}>
              {rows.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={valueKey} name={seriesName} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
