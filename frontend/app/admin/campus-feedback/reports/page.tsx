"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";
import {
  FileText, Download, RefreshCw, TrendingUp, BarChart2,
  PieChart as PieIcon, Users, Clock, Tag, AlertTriangle,
  CheckCircle2, Calendar, Filter
} from "lucide-react";
import { getApi, API_URL } from "@/lib/api";
import { toast } from "react-hot-toast";
import LegacyAdminFallbackBanner from "@/components/admin/LegacyAdminFallbackBanner";
import { motion } from "framer-motion";

const CHART_COLORS = ["#0d3b5e", "#ff7f50", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

export default function ComplaintsReports() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<string>("summary");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [analyticsData, complaintsData] = await Promise.all([
        getApi("/api/campus-feedback/admin/analytics"),
        getApi("/api/campus-feedback/admin/list"),
      ]);
      setAnalytics(analyticsData);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch {
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    if (dateRange === "all") return complaints;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === "today") cutoff.setDate(now.getDate() - 1);
    else if (dateRange === "week") cutoff.setDate(now.getDate() - 7);
    else if (dateRange === "month") cutoff.setMonth(now.getMonth() - 1);
    else if (dateRange === "quarter") cutoff.setMonth(now.getMonth() - 3);
    return complaints.filter(c => new Date(c.created_at) >= cutoff);
  }, [complaints, dateRange]);

  // Officer performance
  const officerStats = useMemo(() => {
    const map: Record<string, { name: string; assigned: number; resolved: number; }> = {};
    filteredComplaints.forEach(c => {
      if (c.assigned_to) {
        const id = c.assigned_to.id;
        if (!map[id]) map[id] = { name: c.assigned_to.full_name, assigned: 0, resolved: 0 };
        map[id].assigned++;
        if (["Resolved", "Closed"].includes(c.status)) map[id].resolved++;
      }
    });
    return Object.values(map).sort((a, b) => b.assigned - a.assigned);
  }, [filteredComplaints]);

  // Department stats
  const deptStats = useMemo(() => {
    const map: Record<string, { name: string; assigned: number; resolved: number; }> = {};
    filteredComplaints.forEach(c => {
      if (c.department?.name) {
        const d = c.department.name;
        if (!map[d]) map[d] = { name: d, assigned: 0, resolved: 0 };
        map[d].assigned++;
        if (["Resolved", "Closed"].includes(c.status)) map[d].resolved++;
      }
    });
    return Object.values(map).sort((a, b) => b.assigned - a.assigned);
  }, [filteredComplaints]);

  // By type
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    filteredComplaints.forEach(c => { const t = c.submitter_type || "External"; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredComplaints]);

  const stats = useMemo(() => ({
    total: filteredComplaints.length,
    open: filteredComplaints.filter(c => !["Resolved", "Closed", "Rejected"].includes(c.status)).length,
    resolved: filteredComplaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length,
    escalated: filteredComplaints.filter(c => c.is_escalated).length,
    critical: filteredComplaints.filter(c => c.priority === "Critical").length,
    overdue: filteredComplaints.filter(c => c.sla_due_date && new Date(c.sla_due_date) < new Date() && !["Resolved","Closed"].includes(c.status)).length,
  }), [filteredComplaints]);

  const REPORTS = [
    { id: "summary", label: "Summary Report", icon: <FileText size={14} /> },
    { id: "category", label: "Category Analysis", icon: <PieIcon size={14} /> },
    { id: "department", label: "Department Performance", icon: <BarChart2 size={14} /> },
    { id: "officer", label: "Officer Performance", icon: <Users size={14} /> },
    { id: "keywords", label: "Keyword Intelligence", icon: <Tag size={14} /> },
    { id: "trend", label: "Trend Analysis", icon: <TrendingUp size={14} /> },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 text-slate-300">
      <RefreshCw className="animate-spin mb-4" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest">Compiling reports...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <LegacyAdminFallbackBanner message="Legacy feedback reports. Strategic analytics now live under ICT Service Desk and Strategic Reports." />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-1 font-serif lowercase tracking-tighter capitalize">
            Reporting & Intelligence
          </h2>
          <p className="text-slate-500 font-medium text-sm">Comprehensive analytics, performance and compliance reports.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-[10px] font-black">
            {[["all","All Time"],["today","Today"],["week","This Week"],["month","This Month"],["quarter","Quarter"]].map(([val, label]) => (
              <button key={val} onClick={() => setDateRange(val)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${dateRange === val ? "bg-primary text-white" : "text-slate-400 hover:text-slate-700"}`}
              >{label}</button>
            ))}
          </div>
          <button onClick={() => window.open(`${API_URL}/reports/export?domain=complaints`, "_blank")}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-all shadow-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary rounded-xl shadow-sm">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar navigation */}
        <aside className="w-48 shrink-0 space-y-1">
          {REPORTS.map(r => (
            <button key={r.id} onClick={() => setActiveReport(r.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all ${activeReport === r.id ? "bg-primary text-white shadow" : "text-slate-500 hover:bg-slate-100"}`}>
              {r.icon} {r.label}
            </button>
          ))}
        </aside>

        {/* Report content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ─── SUMMARY ─── */}
          {activeReport === "summary" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Complaints", value: stats.total, color: "text-primary-darker", bg: "bg-slate-50", icon: <FileText size={16} /> },
                  { label: "Open Cases", value: stats.open, color: "text-blue-600", bg: "bg-blue-50", icon: <Clock size={16} /> },
                  { label: "Resolved", value: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle2 size={16} /> },
                  { label: "Escalated", value: stats.escalated, color: "text-orange-600", bg: "bg-orange-50", icon: <AlertTriangle size={16} /> },
                  { label: "Critical", value: stats.critical, color: "text-red-500", bg: "bg-red-50", icon: <AlertTriangle size={16} /> },
                  { label: "SLA Overdue", value: stats.overdue, color: "text-red-700", bg: "bg-red-100", icon: <Clock size={16} /> },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} p-5 rounded-2xl flex items-center justify-between border border-white shadow-sm`}>
                    <div>
                      <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
                    </div>
                    <div className={`${s.color}`}>{s.icon}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status breakdown table */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Status Breakdown</h4>
                  <div className="space-y-2">
                    {(analytics?.byStatus || []).map((s: any, i: number) => {
                      const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-28 text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0">{s.name}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 w-10 text-right">{s.value}</span>
                          <span className="text-[9px] text-slate-400 w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* By type */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">By Complaint Type</h4>
                  {byType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={byType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" nameKey="name">
                          {byType.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "none" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs text-slate-300 text-center py-8">No data</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── CATEGORY ─── */}
          {activeReport === "category" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Complaints by Category</h4>
                {analytics?.byCategory?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.byCategory} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} width={140} />
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "none" }} />
                        <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]}>
                          {analytics.byCategory.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Category</th>
                            <th className="text-right p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Cases</th>
                            <th className="text-right p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.byCategory.map((c: any, i: number) => (
                            <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-slate-700">{c.name}</td>
                              <td className="p-3 text-right font-black text-primary-darker">{c.value}</td>
                              <td className="p-3 text-right text-slate-400">{stats.total > 0 ? Math.round((c.value / stats.total) * 100) : 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : <p className="text-center text-slate-200 py-16 text-xs font-black">No category data available</p>}
              </div>
            </motion.div>
          )}

          {/* ─── DEPARTMENT ─── */}
          {activeReport === "department" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Department Performance</h4>
                {deptStats.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={deptStats}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "none" }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }} />
                        <Bar dataKey="assigned" name="Assigned" fill="#0d3b5e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Department</th>
                            <th className="text-right p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned</th>
                            <th className="text-right p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Resolved</th>
                            <th className="text-right p-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptStats.map((d, i) => (
                            <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                              <td className="p-3 font-bold text-slate-700">{d.name}</td>
                              <td className="p-3 text-right font-black text-primary-darker">{d.assigned}</td>
                              <td className="p-3 text-right font-black text-emerald-600">{d.resolved}</td>
                              <td className="p-3 text-right text-slate-400">{d.assigned > 0 ? Math.round((d.resolved / d.assigned) * 100) : 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : <p className="text-center text-slate-200 py-16 text-xs font-black">No department assignment data yet</p>}
              </div>
            </motion.div>
          )}

          {/* ─── OFFICER ─── */}
          {activeReport === "officer" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Officer Performance</h4>
                {officerStats.length > 0 ? (
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Officer</th>
                          <th className="text-right p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned</th>
                          <th className="text-right p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Resolved</th>
                          <th className="text-right p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Resolution Rate</th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officerStats.map((o, i) => {
                          const rate = o.assigned > 0 ? Math.round((o.resolved / o.assigned) * 100) : 0;
                          return (
                            <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-700">{o.name}</td>
                              <td className="p-4 text-right font-black text-primary-darker">{o.assigned}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{o.resolved}</td>
                              <td className="p-4 text-right font-black text-slate-500">{rate}%</td>
                              <td className="p-4">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-center text-slate-200 py-16 text-xs font-black">No officer assignments yet</p>}
              </div>
            </motion.div>
          )}

          {/* ─── KEYWORDS ─── */}
          {activeReport === "keywords" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Top Keywords — AI Intelligence</h4>
                {analytics?.topTags?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.topTags.slice(0, 10)}>
                        <XAxis dataKey="tag" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "none" }} />
                        <Bar dataKey="count" name="Frequency" fill="#ff7f50" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6">
                      <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Keyword Cloud</h5>
                      <div className="flex flex-wrap gap-2">
                        {analytics.topTags.map((t: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full font-black text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                            style={{ fontSize: `${Math.max(10, 10 + t.count * 2)}px` }}>
                            <Tag size={10} />{t.tag}
                            <span className="opacity-50 text-[9px]">×{t.count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : <p className="text-center text-slate-200 py-16 text-xs font-black">No keyword data yet. Submit and classify complaints to generate keyword intelligence.</p>}
              </div>
            </motion.div>
          )}

          {/* ─── TREND ─── */}
          {activeReport === "trend" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Monthly Submission Trend</h4>
                {analytics?.trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={analytics.trend}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d3b5e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0d3b5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "none" }} />
                      <Area type="monotone" dataKey="count" stroke="#0d3b5e" strokeWidth={2.5} fill="url(#trendFill)" name="Complaints" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-200 py-16 text-xs font-black">Not enough data for trend analysis</p>}
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Sentiment Over Time</h4>
                {analytics?.bySentiment?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.bySentiment.map((s: any, i: number) => {
                      const colors: Record<string, string> = { Urgent: "bg-red-500", Negative: "bg-amber-500", Neutral: "bg-slate-300", Positive: "bg-emerald-500" };
                      const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <span className="w-20 text-[9px] font-black uppercase tracking-widest text-slate-500">{s.name}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[s.name] || "bg-primary"} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 w-6 text-right">{s.value}</span>
                          <span className="text-[9px] text-slate-400 w-10">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-center text-slate-200 py-8 text-xs font-black">No sentiment data yet</p>}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
