"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  Activity, Users, Globe, Smartphone, MapPin, Search, MessageSquare, ArrowUpRight, ArrowDownRight, Monitor, SearchX, Clock, Gauge
} from "lucide-react";
import { getApi } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function EnterpriseAnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [devices, setDevices] = useState<any>(null);
  const [geo, setGeo] = useState<any>(null);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [chatStats, setChatStats] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [webVitals, setWebVitals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [
        overviewData,
        realtimeData,
        trendData,
        searchData,
        chatData,
        deviceData,
        geoData,
        pagesData,
        webVitalsData,
      ] = await Promise.all([
        getApi('/analytics/overview?days=30'),
        getApi('/analytics/realtime'),
        getApi('/analytics/trend?granularity=daily&days=30'),
        getApi('/analytics/search?days=30'),
        getApi('/analytics/chat?days=30'),
        getApi('/analytics/devices?days=30'),
        getApi('/analytics/geographic?days=30'),
        getApi('/analytics/pages?limit=10&days=30'),
        getApi('/analytics/web-vitals?days=30'),
      ]);

      if (overviewData) setOverview(overviewData);
      if (realtimeData) setRealtime(realtimeData);
      if (trendData) setTrend(trendData);
      if (searchData) setSearchStats(searchData);
      if (chatData) setChatStats(chatData);
      if (deviceData) setDevices(deviceData);
      if (geoData) setGeo(geoData);
      if (pagesData) setPages(pagesData);
      if (webVitalsData) setWebVitals(webVitalsData);
      
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh realtime stats every 30 seconds
    const interval = setInterval(() => {
      getApi('/analytics/realtime').then(data => {
        if (data) setRealtime(data);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Activity size={48} className="text-primary animate-pulse" />
      </div>
    );
  }

  // Formatting helpers
  const formatNum = (num: number) => num?.toLocaleString() || "0";
  /** Chrome CWV “good” thresholds (p75). */
  const webVitalTone = (metric: string, p75: number) => {
    const good =
      (metric === "LCP" && p75 <= 2500) ||
      (metric === "INP" && p75 <= 200) ||
      (metric === "CLS" && p75 <= 0.1) ||
      (metric === "FCP" && p75 <= 1800) ||
      (metric === "TTFB" && p75 <= 800);
    const poor =
      (metric === "LCP" && p75 > 4000) ||
      (metric === "INP" && p75 > 500) ||
      (metric === "CLS" && p75 > 0.25) ||
      (metric === "FCP" && p75 > 3000) ||
      (metric === "TTFB" && p75 > 1800);
    if (good) {
      return {
        label: "Good",
        card: "border-emerald-100 bg-emerald-50/50",
        badge: "text-emerald-600",
      };
    }
    if (poor) {
      return {
        label: "Poor",
        card: "border-rose-100 bg-rose-50/40",
        badge: "text-rose-600",
      };
    }
    return {
      label: "Fair",
      card: "border-amber-100 bg-amber-50/40",
      badge: "text-amber-600",
    };
  };
  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-emerald-500 bg-emerald-50";
    if (growth < 0) return "text-rose-500 bg-rose-50";
    return "text-slate-500 bg-slate-50";
  };
  const GrowthBadge = ({ growth }: { growth: number }) => {
    if (growth === undefined || growth === null) return null;
    const isPositive = growth > 0;
    return (
      <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getGrowthColor(growth)}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{Math.abs(growth)}%</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Realtime */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-primary-darker">
            Institutional Analytics
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Enterprise insights for traffic, search patterns, and AI interactions over the last 30 days.
          </p>
        </div>
        
        {/* Real-time pulse */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center space-x-4">
          <div className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Active Users Right Now</p>
            <p className="text-2xl font-black">{realtime?.activeUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden group rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
            <GrowthBadge growth={overview?.visitors?.growth} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Visitors (30d)</p>
          <h3 className="text-4xl font-black text-slate-800">{formatNum(overview?.visitors?.period)}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden group rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><LineChartIcon size={24} /></div>
            <GrowthBadge growth={overview?.sessions?.growth} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Unique Sessions</p>
          <h3 className="text-4xl font-black text-slate-800">{formatNum(overview?.sessions?.total)}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden group rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={24} /></div>
            <GrowthBadge growth={overview?.engagement?.avgDurationGrowth} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Session Time</p>
          <h3 className="text-4xl font-black text-slate-800">{overview?.engagement?.avgDuration || "0:00"}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-primary p-6 border border-primary-dark shadow-lg relative overflow-hidden group rounded-xl text-white">
          <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:scale-110 transition-transform"><MessageSquare size={100} /></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/10 text-white rounded-lg"><Activity size={24} /></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1 relative z-10">AI Resolution Rate</p>
          <div className="flex items-baseline space-x-2 relative z-10">
            <h3 className="text-4xl font-black">{chatStats?.summary?.resolutionRate || 0}%</h3>
            <span className="text-xs font-medium text-white/70">({formatNum(chatStats?.summary?.totalConversations)} chats)</span>
          </div>
        </motion.div>
      </div>

      {/* First-party RUM (consent-gated WEB_VITAL ingest) */}
      <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-primary" />
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Core Web Vitals</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              First-party RUM · last {webVitals?.days ?? 30} days · {formatNum(webVitals?.totalSamples || 0)} samples
            </p>
          </div>
          <p className="hidden sm:block max-w-xs text-right text-[10px] font-medium text-slate-400">
            p75 uses Chrome “good” thresholds: LCP ≤2500ms, INP ≤200ms, CLS ≤0.1
          </p>
        </div>
        {Array.isArray(webVitals?.metrics) && webVitals.metrics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {webVitals.metrics.map((m: any) => {
              const tone = webVitalTone(m.metric, m.p75);
              return (
                <div
                  key={m.metric}
                  className={`rounded-lg border p-4 ${tone.card}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.metric}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${tone.badge}`}>
                      {tone.label}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-800">
                    {m.avg}
                    <span className="ml-1 text-[10px] font-bold text-slate-400">{m.unit}</span>
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-500">
                    p75 {m.p75} · n={formatNum(m.samples)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center">
            <p className="text-sm font-medium text-slate-600">No Web Vital samples yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Samples appear after visitors accept analytics cookies on the public site.
            </p>
          </div>
        )}
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Traffic Growth Trend</h2>
            <p className="text-xs font-medium text-slate-500">Daily visitors and sessions over the last 30 days</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003366" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="visitors" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              <Area type="monotone" dataKey="sessions" stroke="#0ea5e9" strokeWidth={2} fill="none" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Search Analytics & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Search Intelligence */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded"><Search size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Search Intelligence</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">What users are looking for</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-bold text-slate-500 mb-1">Total Searches</p>
              <p className="text-2xl font-black text-slate-800">{formatNum(searchStats?.summary?.total)}</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-4">
              <p className="text-xs font-bold text-rose-600 mb-1">Failed Searches (0 res)</p>
              <p className="text-2xl font-black text-rose-700">{formatNum(searchStats?.summary?.failed)}</p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Top Successful Queries</h4>
              <ul className="space-y-2">
                {searchStats?.topSearches?.slice(0, 5).map((s: any, i: number) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{s.query}</span>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{s.count} times</span>
                    </div>
                  </li>
                ))}
                {(!searchStats?.topSearches || searchStats.topSearches.length === 0) && (
                  <li className="text-sm text-slate-400">No data available</li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-rose-400 mb-3 border-b border-rose-50 pb-2 flex items-center gap-2">
                <SearchX size={14} /> Content Gaps (Failed)
              </h4>
              <ul className="space-y-2">
                {searchStats?.failedSearches?.slice(0, 5).map((s: any, i: number) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">{s.query}</span>
                    <span className="text-xs text-rose-500 font-bold">{s.count} fails</span>
                  </li>
                ))}
                {(!searchStats?.failedSearches || searchStats.failedSearches.length === 0) && (
                  <li className="text-sm text-slate-400">No data available</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-teal-50 text-teal-600 rounded"><Activity size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Top Content</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Most viewed paths</p>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[10px] uppercase font-black tracking-widest bg-slate-50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Page Path</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pages?.slice(0, 8).map((page, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-darker truncate max-w-[200px]" title={page.path}>{page.path}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatNum(page.views)}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{page.avgDuration}</td>
                  </tr>
                ))}
                {(!pages || pages.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid: Devices & Geography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Device Breakdown */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded"><Monitor size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Device Types</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Desktop vs Mobile</p>
            </div>
          </div>
          
          <div className="space-y-5 mt-8">
            {devices?.devices?.slice(0, 4).map((d: any, i: number) => {
              const total = devices.devices.reduce((acc: number, curr: any) => acc + curr.value, 0);
              const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;
              const isMobile = d.label.toLowerCase().includes('mobile') || d.label.toLowerCase().includes('phone');
              
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2 text-sm font-bold text-slate-700 capitalize">
                      {isMobile ? <Smartphone size={16} className="text-slate-400" /> : <Monitor size={16} className="text-slate-400" />}
                      <span>{d.label}</span>
                    </div>
                    <span className="text-sm font-black text-primary-darker">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${isMobile ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {(!devices?.devices || devices.devices.length === 0) && (
               <p className="text-center text-sm text-slate-400 py-4">No device data available</p>
            )}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div className="bg-white border border-slate-200 p-8 shadow-sm rounded-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded"><MapPin size={20} /></div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800">Geographic Spread</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Top Regions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {geo?.regions?.slice(0, 5).map((r: any, i: number) => {
               const total = geo.regions.reduce((acc: number, curr: any) => acc + curr.value, 0);
               const percentage = total > 0 ? Math.round((r.value / total) * 100) : 0;
               return (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-bold text-slate-700">{r.label === 'Unknown' ? 'Local / Unmapped' : r.label}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400">{formatNum(r.value)}</span>
                    <span className="text-sm font-black text-emerald-600 w-10 text-right">{percentage}%</span>
                  </div>
                </div>
               );
            })}
            {(!geo?.regions || geo.regions.length === 0) && (
               <p className="text-center text-sm text-slate-400 py-4">No geographic data available</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
