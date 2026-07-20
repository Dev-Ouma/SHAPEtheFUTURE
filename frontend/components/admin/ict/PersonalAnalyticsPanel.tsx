"use client";

import React, { useEffect, useState } from "react";
import { getApi } from "@/lib/api";
import { Loader2, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  readChartPref, writeChartPref, type ChartVisualType,
} from "@/lib/analytics-chart-prefs";
import ChartTypeSwitcher from "@/components/admin/analytics/ChartTypeSwitcher";
import FlexibleChart from "@/components/admin/analytics/FlexibleChart";

type Props = {
  serviceGroup?: "helpdesk" | "it";
  range?: string;
  title?: string;
  /** personal = tickets assigned to me; queue = all tickets in the visible lane */
  scope?: "personal" | "queue";
};

export default function PersonalAnalyticsPanel({
  serviceGroup,
  range = "last-30",
  title = "My Performance",
  scope = "personal",
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartVisualType>("bar");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setChartType(readChartPref(`queue_${scope}_trend`, "bar"));
    try {
      const c = localStorage.getItem(`ouk_sd_analytics_collapsed_${scope}`);
      if (c === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, [scope]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ range });
    if (serviceGroup) params.set("service_group", serviceGroup);
    const endpoint =
      scope === "queue"
        ? `/ict/admin/analytics/queue?${params}`
        : `/ict/admin/analytics/personal?${params}`;
    getApi(endpoint)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [serviceGroup, range, scope]);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(`ouk_sd_analytics_collapsed_${scope}`, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={18} /> Loading analytics…
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Analytics unavailable</p>
        <p className="mt-1 text-sm text-slate-500">Could not load performance metrics for this desk.</p>
      </div>
    );
  }

  const { summary, trend, byCategory } = data;
  const assignedValue = scope === "queue" ? (summary.assigned ?? 0) : summary.total;
  const cards = [
    { label: scope === "queue" ? "In Queue" : "Assigned", value: scope === "queue" ? summary.total : assignedValue, icon: <TrendingUp size={16} />, color: "text-primary" },
    { label: "Open", value: summary.open, icon: <Clock size={16} />, color: "text-blue-600" },
    { label: "Resolved", value: summary.resolved, icon: <CheckCircle2 size={16} />, color: "text-emerald-600" },
    { label: "Overdue", value: summary.overdue, icon: <AlertTriangle size={16} />, color: "text-red-500" },
  ];

  const trendRows = Array.isArray(trend)
    ? trend.slice(-14).map((t: any) => ({
        name: String(t.day || t.label || "").slice(5) || t.day || t.label,
        value: t.count,
      }))
    : [];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              {collapsed ? "Show" : "Hide"}
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {scope === "personal"
              ? (serviceGroup === "helpdesk"
                  ? "Helpdesk lane · assigned to you"
                  : serviceGroup === "it"
                    ? "ICT Technical Support · assigned to you"
                    : "All tickets assigned to you")
              : (serviceGroup === "helpdesk"
                  ? "Helpdesk / infrastructure lane"
                  : serviceGroup === "it"
                    ? "ICT Technical Support lane"
                    : "All lanes")}
            {summary.avgResolutionHours != null && ` · Avg resolution ${summary.avgResolutionHours}h`}
          </p>
        </div>
        {!collapsed && (
          <ChartTypeSwitcher
            value={chartType}
            onChange={(v) => {
              setChartType(v);
              writeChartPref(`queue_${scope}_trend`, v);
            }}
            allowed={["bar", "area", "line", "pie", "table"]}
          />
        )}
      </div>

      {!collapsed && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                <div className={c.color}>{c.icon}</div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-primary-darker">{c.value}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{c.label}</p>
              </div>
            ))}
          </div>

          {(() => {
            const useCategoryPie = chartType === "pie" && Array.isArray(byCategory) && byCategory.length > 0;
            const chartData = useCategoryPie
              ? byCategory.slice(0, 8).map((c: any) => ({ name: c.name, value: c.value }))
              : trendRows;
            if (!chartData.length) return null;
            return (
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {useCategoryPie
                    ? "Category mix"
                    : range === "this-year"
                      ? "Activity this year"
                      : range === "last-7"
                        ? "7-day activity"
                        : "30-day activity"}
                </p>
                <FlexibleChart
                  type={chartType}
                  data={chartData}
                  nameKey="name"
                  valueKey="value"
                  seriesName="Tickets"
                  height={chartType === "table" ? 220 : 180}
                  centerLabel={
                    useCategoryPie
                      ? { value: summary.total ?? assignedValue, caption: "Total" }
                      : undefined
                  }
                />
              </div>
            );
          })()}

          {Array.isArray(byCategory) && byCategory.length > 0 && chartType !== "pie" && (
            <div className="flex flex-wrap gap-2">
              {byCategory.slice(0, 5).map((c: any) => (
                <span
                  key={c.name}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {c.name}: {c.value}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
