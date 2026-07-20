"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Eye, RefreshCw, MessageSquare, Clock, AlertCircle,
  CheckCircle2, AlertTriangle, Download, User, Calendar,
  TrendingUp, BarChart2, Tag, Zap, ShieldAlert, Globe,
  GraduationCap, Briefcase, Filter, X, ChevronDown,
  ArrowUpRight, Minus
} from "lucide-react";
import { getApi, API_URL } from "@/lib/api";
import { toast } from "react-hot-toast";
import LegacyAdminFallbackBanner from "@/components/admin/LegacyAdminFallbackBanner";
import { overdueBannerCopy, OVERDUE_CTA } from "@/lib/service-desk-copy";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-600 border-slate-200",
  Acknowledged: "bg-blue-50 text-blue-600 border-blue-200",
  "Under Review": "bg-amber-50 text-amber-600 border-amber-200",
  "In Progress": "bg-purple-50 text-purple-600 border-purple-200",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Closed: "bg-slate-50 text-slate-500 border-slate-200",
  Rejected: "bg-red-50 text-red-500 border-red-200",
  Escalated: "bg-orange-50 text-orange-600 border-orange-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "text-slate-400",
  Medium: "text-blue-500",
  High: "text-amber-500",
  Critical: "text-red-500",
};

const CHART_COLORS = ["#0d3b5e", "#ff7f50", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

const TYPE_TABS = [
  { id: "all", label: "All Types", icon: <MessageSquare size={14} /> },
  { id: "External", label: "External", icon: <Globe size={14} /> },
  { id: "Student", label: "Student", icon: <GraduationCap size={14} /> },
  { id: "Staff", label: "Staff", icon: <Briefcase size={14} /> },
];

const STATUSES = ["all", "Submitted", "Acknowledged", "Under Review", "In Progress", "Resolved", "Closed", "Rejected", "Escalated"];
const PRIORITIES = ["all", "Low", "Medium", "High", "Critical"];

export default function ComplaintsDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "list">("dashboard");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
    fetchAnalytics();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data = await getApi("/api/campus-feedback/admin/list");
      if (!data) data = await getApi("/complaints/admin/all");
      setComplaints(Array.isArray(data) ? data : []);
      if (!data) toast.error("Could not load cases — try logging out and back in.");
    } catch {
      toast.error("Failed to load complaints registry");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      let data = await getApi("/api/campus-feedback/admin/analytics");
      if (!data) data = await getApi("/complaints/admin/analytics");
      setAnalytics(data);
    } catch {
      // analytics may fail gracefully
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return complaints.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        c.reference_number?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.category?.name?.toLowerCase().includes(q) ||
        (c.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
        (c.keywords || []).some((k: string) => k.toLowerCase().includes(q));
      const matchesType = typeFilter === "all" || c.submitter_type === typeFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [complaints, search, typeFilter, statusFilter, priorityFilter]);

  const localStats = useMemo(() => ({
    total: complaints.length,
    open: complaints.filter(c => !["Resolved", "Closed", "Rejected"].includes(c.status)).length,
    resolved: complaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length,
    critical: complaints.filter(c => c.priority === "Critical" && !["Resolved", "Closed"].includes(c.status)).length,
    escalated: complaints.filter(c => c.is_escalated).length,
    overdue: complaints.filter(c => c.sla_due_date && new Date(c.sla_due_date) < new Date() && !["Resolved", "Closed"].includes(c.status)).length,
  }), [complaints]);

  const stats = analytics?.summary || localStats;

  return (
    <div className="space-y-8 pb-24">
      <LegacyAdminFallbackBanner />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-1 font-serif lowercase tracking-tighter capitalize">
            Campus Feedback Intelligence Hub
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            University-wide case management, analytics & compliance registry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setView("dashboard")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "dashboard" ? "bg-primary text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "list" ? "bg-primary text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
            >
              Case List
            </button>
          </div>
          <button
            onClick={() => window.open(`${API_URL}/reports/export?domain=complaints`, "_blank")}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-2xl shadow-sm flex items-center gap-2"
          >
            <Download size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Export</span>
          </button>
          <button onClick={() => { fetchData(); fetchAnalytics(); }} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-2xl shadow-sm">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Overdue banner */}
      {(stats.overdue > 0) && (() => {
        const overdue = overdueBannerCopy(stats.overdue);
        return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl animate-pulse shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-widest">⚠ {overdue.title}</p>
              <p className="text-[10px] font-medium opacity-80 mt-1 leading-relaxed">
                {overdue.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setView("list"); setStatusFilter("Submitted"); }}
            className="px-5 py-2 bg-white text-red-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shrink-0"
          >
            {OVERDUE_CTA}
          </button>
        </motion.div>
        );
      })()}

      {/* ─── DASHBOARD VIEW ─── */}
      {view === "dashboard" && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Cases", value: stats.total, icon: <MessageSquare size={16} />, color: "text-primary-darker", bg: "bg-white", border: "border-slate-100" },
              { label: "Open", value: stats.open, icon: <Clock size={16} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
              { label: "Resolved", value: stats.resolved, icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              { label: "Escalated", value: stats.escalated, icon: <ShieldAlert size={16} />, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
              { label: "Critical", value: stats.critical, icon: <AlertTriangle size={16} />, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
              { label: "Avg. Days", value: stats.avgResolutionDays ?? "—", icon: <TrendingUp size={16} />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-2xl ${card.bg} border ${card.border} flex flex-col gap-3 hover:scale-[1.02] transition-all shadow-sm`}
              >
                <div className={`${card.color}`}>{card.icon}</div>
                <div>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Submissions — Last 6 Months</h3>
              </div>
              {analyticsLoading ? (
                <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-black uppercase tracking-widest">Loading...</div>
              ) : analytics?.trend ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analytics.trend}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d3b5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0d3b5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 11 }} />
                    <Area type="monotone" dataKey="count" stroke="#0d3b5e" strokeWidth={2.5} fill="url(#trendGrad)" name="Complaints" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-200 text-xs font-black">No trend data yet</div>
              )}
            </div>

            {/* By Type Pie */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={16} className="text-secondary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">By Complaint Type</h3>
              </div>
              {analytics?.byType?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={analytics.byType} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                      {analytics.byType.map((_: any, index: number) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-200 text-xs font-black">No data yet</div>
              )}
            </div>
          </div>

          {/* Second Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Top Categories</h3>
              </div>
              {analytics?.byCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.byCategory} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} width={120} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} />
                    <Bar dataKey="value" fill="#0d3b5e" radius={[0, 6, 6, 0]} name="Cases" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-200 text-xs font-black">No data yet</div>
              )}
            </div>

            {/* AI Tags Cloud + Sentiment */}
            <div className="space-y-6">
              {/* AI Tags */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">AI-Detected Top Tags</h3>
                </div>
                {analytics?.topTags?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analytics.topTags.map((t: any, i: number) => (
                      <span
                        key={i}
                        onClick={() => { setSearch(t.tag); setView("list"); }}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
                        style={{ fontSize: `${Math.max(10, 10 + t.count * 1.5)}px` }}
                      >
                        <Tag size={10} />
                        {t.tag}
                        <span className="opacity-50">×{t.count}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 font-black uppercase tracking-widest">No AI tags generated yet. Submit complaints to train the engine.</p>
                )}
              </div>

              {/* Sentiment */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert size={16} className="text-purple-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Sentiment Distribution</h3>
                </div>
                {analytics?.bySentiment?.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.bySentiment.map((s: any, i: number) => {
                      const pct = Math.round((s.value / stats.total) * 100);
                      const colors: Record<string, string> = { Urgent: "bg-red-500", Negative: "bg-amber-500", Neutral: "bg-slate-300", Positive: "bg-emerald-500" };
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest w-16 text-slate-500 shrink-0">{s.name}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[s.name] || "bg-primary"} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 w-8 text-right">{s.value}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 font-black uppercase tracking-widest">No sentiment data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Cases Preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Recent Submissions</h3>
              </div>
              <button onClick={() => setView("list")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary flex items-center gap-1">
                View All <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {complaints.slice(0, 5).map((c, i) => (
                <Link key={c.id} href={`/admin/campus-feedback/${c.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[9px] font-black font-mono bg-primary-darker text-white px-2 py-1 rounded-lg shrink-0">{c.reference_number}</span>
                      <span className="text-sm font-bold text-slate-700 truncate group-hover:text-primary transition-colors">{c.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-500"}`}>{c.status}</span>
                      {c.is_escalated && <ShieldAlert size={12} className="text-orange-500" />}
                    </div>
                  </motion.div>
                </Link>
              ))}
              {complaints.length === 0 && !loading && (
                <p className="text-center text-slate-300 py-8 text-xs font-black uppercase tracking-widest">No complaints submitted yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LIST VIEW ─── */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Type Tabs */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm w-fit">
            {TYPE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === tab.id ? "bg-primary text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
              >
                {tab.icon} {tab.label}
                {tab.id !== "all" && (
                  <span className={`ml-1 rounded-full w-4 h-4 text-[8px] flex items-center justify-center ${typeFilter === tab.id ? "bg-white/20" : "bg-slate-100"}`}>
                    {complaints.filter(c => c.submitter_type === tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by reference, subject, name, category, or AI tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 p-3 pl-10 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showFilters ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-primary"}`}
              >
                <Filter size={14} /> Filters
                {(statusFilter !== "all" || priorityFilter !== "all") && (
                  <span className="w-4 h-4 bg-secondary text-white rounded-full text-[8px] flex items-center justify-center">!</span>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map(s => (
                          <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary"}`}
                          >{s === "all" ? "All" : s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                      <div className="flex flex-wrap gap-2">
                        {PRIORITIES.map(p => (
                          <button key={p} onClick={() => setPriorityFilter(p)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${priorityFilter === p ? "bg-primary text-white border-primary" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary"}`}
                          >{p === "all" ? "All" : p}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); setSearch(""); }}
                      className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <X size={12} /> Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {filtered.length} case{filtered.length !== 1 ? "s" : ""} found
              {(search || statusFilter !== "all" || typeFilter !== "all" || priorityFilter !== "all") && (
                <span className="ml-2 text-primary">· Filtered</span>
              )}
            </p>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4 text-slate-300">
                <RefreshCw className="animate-spin" size={40} />
                <span className="text-[10px] font-black uppercase tracking-widest">Loading Registry...</span>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      {/* Priority indicator */}
                      <div className={`w-1.5 h-16 rounded-full shrink-0 mt-1 ${item.priority === "Critical" ? "bg-red-500 animate-pulse" : item.priority === "High" ? "bg-amber-500" : item.priority === "Medium" ? "bg-blue-400" : "bg-slate-200"}`} />

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black font-mono bg-primary-darker text-white px-2.5 py-1 rounded-lg">{item.reference_number}</span>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>{item.status}</span>
                          {item.submitter_type && (
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center gap-1">
                              {item.submitter_type === "Student" ? <GraduationCap size={9} /> : item.submitter_type === "Staff" ? <Briefcase size={9} /> : <Globe size={9} />}
                              {item.submitter_type}
                            </span>
                          )}
                          {item.is_escalated && (
                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 flex items-center gap-1">
                              <ShieldAlert size={9} /> Escalated
                            </span>
                          )}
                          <span className={`text-[9px] font-black ${PRIORITY_COLORS[item.priority]}`}>{item.priority} Priority</span>
                        </div>

                        <h4 className="text-base font-black text-primary-darker group-hover:text-primary transition-colors leading-snug">{item.subject}</h4>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-1">
                            <User size={10} className="text-secondary" />
                            {item.is_anonymous ? "Anonymous" : item.full_name || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag size={10} className="text-primary" />
                            {item.category?.name || "Uncategorized"}
                            {item.subcategory && ` · ${item.subcategory}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <span className={`flex items-center gap-1 ${item.sla_due_date && new Date(item.sla_due_date) < new Date() && !["Resolved","Closed"].includes(item.status) ? "text-red-500" : ""}`}>
                            <Clock size={10} />
                            SLA: {item.sla_due_date ? new Date(item.sla_due_date).toLocaleDateString() : "—"}
                          </span>
                        </div>

                        {/* AI Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.tags.slice(0, 5).map((tag: string, ti: number) => (
                              <span key={ti} className="inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                                <Tag size={7} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {item.assigned_to && (
                        <div className="hidden lg:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                            <User size={12} />
                          </div>
                          <span className="truncate max-w-[80px]">{item.assigned_to.full_name?.split(" ")[0]}</span>
                        </div>
                      )}
                      <Link
                        href={`/admin/campus-feedback/${item.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <Eye size={14} /> Review
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="p-6 bg-white w-fit mx-auto rounded-full shadow-sm mb-4">
                  <Search size={32} className="text-slate-200" />
                </div>
                <h5 className="text-lg font-black text-primary-darker uppercase tracking-tighter">No Cases Found</h5>
                <p className="text-xs text-slate-400 font-medium mt-1">Try adjusting your search or filter criteria.</p>
                <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setPriorityFilter("all"); }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
