"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  BarChart3, TrendingUp, ThumbsUp, ThumbsDown, Activity, Zap,
  Wrench, Building2, AlertTriangle, CheckCircle2, Clock, UserX,
} from "lucide-react";
import { overdueBannerCopy, OVERDUE_LABEL, OVERDUE_CTA } from "@/lib/service-desk-copy";
import {
  readChartPref, writeChartPref, type ChartVisualType,
} from "@/lib/analytics-chart-prefs";
import ChartTypeSwitcher from "@/components/admin/analytics/ChartTypeSwitcher";
import FlexibleChart from "@/components/admin/analytics/FlexibleChart";
import PermissionGate from "@/components/admin/PermissionGate";

type LaneView = "combined" | "helpdesk" | "it";
type Velocity = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const VELOCITY_OPTIONS: { id: Velocity; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

const FEEDBACK_LABELS: Record<string, string> = {
  service_request: "Technical Request",
  complaint: "Complaint",
  compliment: "Compliment",
};

function isAnalyticsPayload(data: unknown): data is { summary: Record<string, unknown> } {
  return Boolean(
    data &&
      typeof data === "object" &&
      (data as { summary?: unknown }).summary &&
      typeof (data as { summary: unknown }).summary === "object",
  );
}

export default function ServiceDeskCombinedAnalyticsPage() {
  return (
    <PermissionGate permission={["reports.view", "infrastructure_analytics.view"]}>
      <ServiceDeskCombinedAnalyticsInner />
    </PermissionGate>
  );
}

function ServiceDeskCombinedAnalyticsInner() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<LaneView>("combined");
  const [velocity, setVelocity] = useState<Velocity>("monthly");
  const [velocityChart, setVelocityChart] = useState<ChartVisualType>("area");
  const [mixChart, setMixChart] = useState<ChartVisualType>("pie");
  const [distChart, setDistChart] = useState<ChartVisualType>("bar");
  const [laneChart, setLaneChart] = useState<ChartVisualType>("bar");

  useEffect(() => {
    setVelocityChart(readChartPref("combined_velocity", "area"));
    setMixChart(readChartPref("combined_mix", "pie"));
    setDistChart(readChartPref("combined_dist", "bar"));
    setLaneChart(readChartPref("combined_lane", "bar"));
  }, []);

  const fetchSeq = useRef(0);
  const analyticsRef = useRef<any>(null);
  analyticsRef.current = analytics;

  useEffect(() => {
    const seq = ++fetchSeq.current;
    const initialLoad = !analyticsRef.current;
    if (initialLoad) setLoading(true);

    const params = new URLSearchParams({ velocity });
    // Same lane query style as Helpdesk — use canonical ICT group value.
    if (view === "helpdesk") params.set("service_group", "helpdesk");
    if (view === "it") params.set("service_group", "it_technical_support");
    if (velocity === "yearly") params.set("range", "yearly");
    else if (velocity === "quarterly") params.set("range", "quarterly");
    else if (velocity === "monthly") params.set("range", "last-30");
    else if (velocity === "weekly") params.set("range", "last-7");
    else if (velocity === "daily") params.set("range", "daily");

    const load = async () => {
      try {
        let data = await getApi(`/ict/admin/analytics/feedback?${params.toString()}`);
        // Fallback alias used elsewhere in the app.
        if (!isAnalyticsPayload(data) && view === "it") {
          params.set("service_group", "it");
          data = await getApi(`/ict/admin/analytics/feedback?${params.toString()}`);
        }
        if (seq !== fetchSeq.current) return;
        if (isAnalyticsPayload(data)) {
          setAnalytics(data);
        } else if (!analyticsRef.current) {
          setAnalytics(null);
          toast.error("Could not load analytics for this view.");
        } else {
          toast.error("Could not refresh this lane — previous view kept.");
        }
      } catch (err) {
        console.error(err);
        if (seq !== fetchSeq.current) return;
        if (!analyticsRef.current) {
          setAnalytics(null);
          toast.error("Could not load analytics for this view.");
        } else {
          toast.error("Could not refresh this lane — previous view kept.");
        }
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    };

    void load();
  }, [view, velocity]);

  const setPref = (
    key: string,
    setter: (v: ChartVisualType) => void,
    value: ChartVisualType,
  ) => {
    setter(value);
    writeChartPref(key, value);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <Zap className="mb-4 text-slate-300" size={48} />
        <h2 className="text-xl font-semibold text-slate-700">Analytics Unavailable</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Could not load Service Desk analytics. Try again shortly.
        </p>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const byCategory = analytics?.byCategory || [];
  const bySubcategory = analytics?.bySubcategory || [];
  const byFeedbackType = analytics?.byFeedbackType || [];
  const trend = analytics?.trend || [];
  const byGroup = analytics?.byGroup || [];
  const distribution = bySubcategory.length ? bySubcategory : byCategory;
  const distributionLabel = bySubcategory.length ? "Sub-Category Distribution" : "Category Distribution";
  const isHelpdesk = view === "helpdesk";
  const isIct = view === "it";
  const isCombined = view === "combined";

  const scopeLabel = isIct
    ? "ICT Technical Support"
    : isHelpdesk
      ? "General Helpdesk"
      : "Combined — both lanes";

  const laneTotals = {
    helpdesk: (byGroup || []).find((g: any) => /help/i.test(String(g.name)))?.value ?? 0,
    ict: (byGroup || []).find((g: any) => /ict|technical/i.test(String(g.name)))?.value ?? 0,
  };

  // Stable order + colours: Helpdesk (coral) then ICT (navy) — matches chart legend tiles.
  const LANE_CHART_COLORS = ["#ff7f50", "#0d3b5e"];
  const laneChartData = [...(byGroup || [])].sort((a: any, b: any) => {
    const rank = (n: string) => (/help/i.test(n) ? 0 : /ict|technical/i.test(n) ? 1 : 2);
    return rank(String(a.name)) - rank(String(b.name));
  });

  const trendRows = (trend || []).map((t: any) => ({
    name: t.label,
    value: t.count,
  }));

  const formatLaneName = (n: string) => {
    const v = n.toLowerCase();
    if (v.includes("help")) return "General Helpdesk";
    if (v.includes("ict") || v.includes("technical")) return "ICT Technical Support";
    return n;
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
          Campus feedback (General Helpdesk) and ICT Technical Support — executive overview.
        </p>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
          Showing
          <span className="text-primary-darker">{scopeLabel}</span>
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { id: "combined" as const, label: "Combined", icon: <BarChart3 size={14} /> },
            { id: "helpdesk" as const, label: "General Helpdesk", icon: <Building2 size={14} /> },
            { id: "it" as const, label: "ICT Technical Support", icon: <Wrench size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                view === tab.id
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {VELOCITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setVelocity(opt.id)}
              className={`rounded-md px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                velocity === opt.id
                  ? "bg-primary-darker text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Same engagement strip for every tab (Helpdesk / ICT / Combined) — avoids ICT-only crash paths. */}
      <div className={`grid grid-cols-1 gap-3 ${isIct ? "sm:grid-cols-1 sm:max-w-sm" : "sm:grid-cols-3"}`}>
        {!isIct && (
          <>
            <div className="rounded-xl border border-red-100 bg-red-50/80 p-4">
              <p className="text-2xl font-semibold tabular-nums text-red-600">{summary.complaints ?? 0}</p>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-red-500">
                <ThumbsDown size={12} /> Complaints
              </span>
              {isCombined && (
                <p className="mt-1.5 text-[10px] font-medium text-red-400/90">General Helpdesk</p>
              )}
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-2xl font-semibold tabular-nums text-emerald-600">{summary.compliments ?? 0}</p>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                <ThumbsUp size={12} /> Compliments
              </span>
              {isCombined && (
                <p className="mt-1.5 text-[10px] font-medium text-emerald-500/90">General Helpdesk</p>
              )}
            </div>
          </>
        )}
        <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-2xl font-semibold tabular-nums text-sky-700">{summary.serviceRequests ?? 0}</p>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-sky-600">
            <Wrench size={12} /> Technical Requests
          </span>
          {(isCombined || isIct) && (
            <p className="mt-1.5 text-[10px] font-medium text-sky-500/90">ICT Technical Support</p>
          )}
        </div>
      </div>

      {summary.overdue > 0 && (() => {
        const overdue = overdueBannerCopy(summary.overdue);
        return (
          <div className="flex flex-col gap-3 rounded-xl bg-red-900 p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="shrink-0 rounded-lg bg-white/10 p-2">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">{overdue.title}</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-white/80">
                  {overdue.message}
                  {isCombined ? " Open the relevant desk queue to attend." : ""}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {(isCombined || isHelpdesk) && (
                <Link
                  href="/admin/helpdesk"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[11px] font-semibold text-red-900 transition-colors hover:bg-red-50"
                >
                  {isCombined ? "Helpdesk queue" : OVERDUE_CTA}
                </Link>
              )}
              {(isCombined || isIct) && (
                <Link
                  href="/admin/ict"
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-[11px] font-semibold transition-colors ${
                    isCombined
                      ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
                      : "bg-white text-red-900 hover:bg-red-50"
                  }`}
                >
                  {isCombined ? "ICT queue" : OVERDUE_CTA}
                </Link>
              )}
            </div>
          </div>
        );
      })()}

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Pipeline · {scopeLabel}
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Tickets", value: summary.total, icon: <TrendingUp size={16} />, color: "text-primary-darker", bg: "bg-white", border: "border-slate-100" },
            { label: "Open", value: summary.open, icon: <Clock size={16} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Resolved", value: summary.resolved, icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Unassigned", value: summary.unassigned ?? 0, icon: <UserX size={16} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: OVERDUE_LABEL, value: summary.overdue, icon: <AlertTriangle size={16} />, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            { label: "Avg. Days", value: summary.avgResolutionDays ?? "—", icon: <Activity size={16} />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          ].map((card) => (
            <div key={card.label} className={`flex flex-col gap-2 rounded-xl border ${card.border} ${card.bg} p-4`}>
              <div className={card.color}>{card.icon}</div>
              <div>
                <p className={`text-2xl font-semibold tabular-nums ${card.color}`}>{card.value}</p>
                <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">{card.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Submission Velocity</h3>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {scopeLabel} · {velocity}
              </p>
            </div>
            <ChartTypeSwitcher
              value={velocityChart}
              onChange={(v) => setPref("combined_velocity", setVelocityChart, v)}
              allowed={["area", "bar", "line", "table"]}
            />
          </div>
          <FlexibleChart
            type={velocityChart}
            data={trendRows}
            nameKey="name"
            valueKey="value"
            seriesName="Submissions"
            height={280}
          />
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {isIct ? "Request Mix" : "Engagement Type"}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {isIct
                  ? "ICT technical request composition"
                  : isHelpdesk
                    ? "Helpdesk complaints & compliments"
                    : "Helpdesk engagement + ICT technical requests"}
              </p>
            </div>
            <ChartTypeSwitcher
              value={mixChart}
              onChange={(v) => setPref("combined_mix", setMixChart, v)}
              allowed={["pie", "bar", "table"]}
            />
          </div>
          <FlexibleChart
            type={mixChart}
            data={byFeedbackType || []}
            nameKey="name"
            valueKey="value"
            seriesName="Tickets"
            height={220}
            formatName={(n) => FEEDBACK_LABELS[n] || n.replace(/_/g, " ")}
            centerLabel={{ value: summary.total, caption: "Total" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">{distributionLabel}</h3>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {isIct
                  ? "ICT issue types (OUK APP catalogues)"
                  : isHelpdesk
                    ? "Campus feedback categories"
                    : "Issue types across both lanes (not lane totals)"}
              </p>
            </div>
            <ChartTypeSwitcher
              value={distChart}
              onChange={(v) => setPref("combined_dist", setDistChart, v)}
              allowed={["bar", "pie", "table", "line"]}
            />
          </div>
          <FlexibleChart
            type={distChart}
            data={distribution || []}
            nameKey="name"
            valueKey="value"
            seriesName="Tickets"
            height={280}
            layout={distChart === "bar" ? "vertical" : "horizontal"}
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Lane Mix</h3>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Volume by service desk lane only
              </p>
            </div>
            <ChartTypeSwitcher
              value={laneChart}
              onChange={(v) => setPref("combined_lane", setLaneChart, v)}
              allowed={["bar", "pie", "table"]}
            />
          </div>
          <FlexibleChart
            type={laneChart}
            data={laneChartData}
            nameKey="name"
            valueKey="value"
            seriesName="Tickets"
            height={200}
            formatName={formatLaneName}
            colors={LANE_CHART_COLORS}
            centerLabel={{ value: summary.total, caption: "Total" }}
          />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <span className="h-2 w-2 rounded-full bg-[#ff7f50]" />
                General Helpdesk
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary-darker">
                {laneTotals.helpdesk}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <span className="h-2 w-2 rounded-full bg-[#0d3b5e]" />
                ICT Technical Support
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary-darker">
                {laneTotals.ict}
              </p>
            </div>
          </div>
          {isCombined && (byCategory || []).length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Top categories (detail)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(byCategory || []).slice(0, 4).map((c: any) => (
                  <div key={c.name} className="rounded-lg border border-slate-100 px-3 py-2">
                    <p className="truncate text-[10px] font-medium text-slate-500">{c.name}</p>
                    <p className="text-sm font-semibold tabular-nums text-slate-800">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
