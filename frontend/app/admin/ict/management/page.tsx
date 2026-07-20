"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/useAdminPermissions";
import { getApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  RefreshCw, TrendingUp, BarChart2, Clock, CheckCircle2, AlertTriangle,
  UserX, ShieldAlert, ArrowLeft, Users, User,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import PersonalAnalyticsPanel from "@/components/admin/ict/PersonalAnalyticsPanel";

type ViewMode = "team" | "mine";

export default function IctManagementDashboard() {
  const router = useRouter();
  const { can: canManage, loading: permLoading } = usePermission("ict.manage");
  const [mode, setMode] = useState<ViewMode>("team");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (permLoading) return;
    if (!canManage) {
      router.replace("/admin/ict");
      return;
    }
    if (mode === "team") fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permLoading, canManage, mode]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await getApi("/ict/admin/analytics?service_group=it");
      setAnalytics(data);
    } catch {
      toast.error("Failed to load team analytics");
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const stats = analytics?.summary || {};

  const teamCards = [
    { label: "Open Backlog", value: stats.open ?? "—", icon: <Clock size={16} />, color: "text-blue-600" },
    { label: "Overdue", value: stats.overdue ?? "—", icon: <AlertTriangle size={16} />, color: "text-red-500" },
    { label: "Unassigned", value: stats.unassigned ?? "—", icon: <UserX size={16} />, color: "text-amber-600" },
    { label: "Escalated", value: stats.escalated ?? "—", icon: <ShieldAlert size={16} />, color: "text-orange-600" },
    { label: "Resolved", value: stats.resolved ?? "—", icon: <CheckCircle2 size={16} />, color: "text-emerald-600" },
    { label: "Avg. Days", value: stats.avgResolutionDays ?? "—", icon: <TrendingUp size={16} />, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/admin/ict" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary mb-3">
            <ArrowLeft size={14} /> ICT Service Desk
          </Link>
          <h2 className="text-4xl font-black text-primary-darker mb-1 font-serif tracking-tighter flex items-center gap-3">
            <Users className="text-primary" size={32} /> IT Lane Management
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Org-wide ICT Technical Support health and your personal workload.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setMode("team")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "team" ? "bg-primary-darker text-white" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Users size={14} /> Team
            </button>
            <button
              onClick={() => setMode("mine")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === "mine" ? "bg-primary-darker text-white" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <User size={14} /> Mine
            </button>
          </div>
          {mode === "team" && (
            <button onClick={fetchTeam} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-2xl shadow-sm">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      {mode === "mine" ? (
        <PersonalAnalyticsPanel serviceGroup="it" title="My IT lane performance" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {teamCards.map((card) => (
              <div key={card.label} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
                <div className={card.color}>{card.icon}</div>
                <p className="text-3xl font-black text-primary-darker mt-3">{loading ? "—" : card.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Volume — Last 6 Months</h3>
              </div>
              {analytics?.trend?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics.trend}>
                    <defs>
                      <linearGradient id="mgmtTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d3b5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0d3b5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} />
                    <Area type="monotone" dataKey="count" stroke="#0d3b5e" strokeWidth={2} fill="url(#mgmtTrend)" name="Tickets" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-black uppercase">No trend data</div>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={16} className="text-secondary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Category Hotspots</h3>
              </div>
              {analytics?.byCategory?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.byCategory} layout="vertical">
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }} />
                    <Bar dataKey="value" fill="#ff7f50" radius={[0, 6, 6, 0]} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-300 text-xs font-black uppercase">No category data</div>
              )}
            </div>
          </div>

          <PersonalAnalyticsPanel serviceGroup="it" title="My assigned IT tickets" />
        </>
      )}
    </div>
  );
}
