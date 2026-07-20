"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  RefreshCw,
  Activity,
  ArrowDownRight,
  Download,
  Calendar,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { getApi } from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from "framer-motion";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [pageVisitsData, setPageVisitsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const normalizePageVisits = (topPages: any) => {
    const pagesRaw = Array.isArray(topPages) ? topPages : [];
    const pages = pagesRaw
      .map((p: any) => ({
        page: p?.path ?? p?.page ?? p?.url ?? p?.name ?? 'Unknown',
        visits: Number.parseInt(String(p?.count ?? p?.visits ?? 0), 10) || 0,
      }))
      .filter((p: any) => p.visits > 0);

    const totalPageViews = pages.reduce((sum: number, p: any) => sum + p.visits, 0);
    const top = pages.sort((a: any, b: any) => b.visits - a.visits).slice(0, 5);

    return {
      pages: top.map((p: any) => ({
        ...p,
        percentage: totalPageViews > 0 ? Math.round((p.visits / totalPageViews) * 100) : 0,
      })),
      totalPageViews,
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      // Only show chart loading for timeframe changes, not initial load
      if (data) {
        setChartLoading(true);
      } else {
        setLoading(true);
      }
      
      try {
        let apiUrl = `/analytics/dashboard?`;
        
        if (timeframe === 'custom' && startDate && endDate) {
          apiUrl += `start=${startDate}&end=${endDate}`;
        } else {
          const days = timeframe.replace('d', '').replace('w', '').replace('m', '').replace('y', '');
          const unit = timeframe.includes('w') ? 'weeks' : timeframe.includes('m') ? 'months' : timeframe.includes('y') ? 'years' : 'days';
          apiUrl += `${unit}=${days}`;
        }
        
        const stats = await getApi(apiUrl);
        setData(stats);
        setPageVisitsData(normalizePageVisits(stats?.topPages));
      } catch (error) {
        console.error("Telemetry fetch deferred");
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };
    fetchStats();
  }, [timeframe, startDate, endDate]);

  // Real-time data fetching for visit counts
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        let apiUrl = `/analytics/dashboard?`;
        if (timeframe === 'custom' && startDate && endDate) {
          apiUrl += `start=${startDate}&end=${endDate}`;
        } else {
          const days = timeframe.replace('d', '').replace('w', '').replace('m', '').replace('y', '');
          const unit = timeframe.includes('w') ? 'weeks' : timeframe.includes('m') ? 'months' : timeframe.includes('y') ? 'years' : 'days';
          apiUrl += `${unit}=${days}`;
        }
        
        const stats = await getApi(apiUrl);
        setData(stats);
        setPageVisitsData(normalizePageVisits(stats?.topPages));
      } catch (error) {
        console.log("Real-time data update failed:", error);
      }
    };

    // Fetch immediately, then set up interval
    fetchRealTimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [timeframe, startDate, endDate]);

  const exportData = () => {
    if (!data?.overview?.trend) return;
    
    const csvContent = [
      ['Date', 'Visits', 'Page Views'],
      ...data.overview.trend.map((t: any) => [
        new Date(t.date).toLocaleDateString(),
        t.count || 0,
        t.pageViews || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `institutional-traffic-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    { name: "Total Global Reach", value: data?.overview?.totalVisits || "0", icon: Eye, trend: "All Time", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Interactions", value: data?.overview?.interactions || "0", icon: Activity, trend: "Stable", color: "text-primary", bg: "bg-primary/5" },
    { name: `Active Traffic (${timeframe})`, value: data?.overview?.recentVisits || "0", icon: TrendingUp, trend: "Live", color: "text-secondary", bg: "bg-secondary/5" },
    { name: "System Uptime", value: "99.9%", icon: Clock, trend: "Optimal", color: "text-green-600", bg: "bg-green-50" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-48 space-y-6">
       <RefreshCw className="animate-spin text-primary" size={64} />
       <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400">Orchestrating Telemetry Data...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <section className="bg-primary-darker p-12 text-white relative shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 -mr-48 -mt-48 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-5xl font-black mb-4 font-serif tracking-tighter">Institutional Intelligence.</h2>
            <Link href="/admin/analytics" className="inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 mb-6 rounded-sm transition-colors border border-primary/30">
              <Activity size={14} />
              Open Enterprise Analytics Dashboard
              <ArrowUpRight size={14} />
            </Link>
            
            {/* Enhanced Time Period Toggles */}
            <div className="flex flex-wrap items-center gap-3 mb-6 relative">
              <button 
                onClick={() => { setTimeframe('1d'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '1d' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Daily
              </button>
              <button 
                onClick={() => { setTimeframe('7d'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '7d' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => { setTimeframe('1w'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '1w' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => { setTimeframe('1m'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '1m' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => { setTimeframe('3m'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '3m' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Quarterly
              </button>
              <button 
                onClick={() => { setTimeframe('1y'); setShowCustomDates(false); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${timeframe === '1y' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                Yearly
              </button>
              <div className="relative z-10" style={{ transform: 'translateZ(0)' }}>
                <button 
                  onClick={() => setShowCustomDates(!showCustomDates)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all flex items-center gap-2 ${timeframe === 'custom' ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <Calendar size={14} />
                  Custom
                  <ChevronDown size={12} className={`transition-transform ${showCustomDates ? 'rotate-180' : ''}`} />
                </button>
                
                {showCustomDates && (
                  <>
                    <div 
                      className="fixed inset-0 bg-primary-darker/40 backdrop-blur-sm z-[9999998]"
                      onClick={() => setShowCustomDates(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-10 z-[9999999] w-[95%] max-w-[450px] min-w-[320px]">
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary-darker mb-4 border-b border-slate-100 pb-3">Select Custom Date Range</h4>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Start Date</label>
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-primary-darker bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">End Date</label>
                          <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-primary-darker bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button 
                            onClick={() => { 
                              if (startDate && endDate) { 
                                setTimeframe('custom'); 
                                setShowCustomDates(false); 
                              } 
                            }}
                            className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-md hover:bg-[#ff7f50] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!startDate || !endDate}
                          >
                            Apply
                          </button>
                          <button 
                            onClick={() => setShowCustomDates(false)}
                            className="flex-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-md hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Monitoring the digital heartbeat of the Open University of Kenya. Real-time insights for strategic decision making.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
             <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">System Integrity</div>
             <div className="text-3xl font-black text-white">99.9<span className="text-secondary text-sm ml-1 uppercase">Operational</span></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-10 border border-slate-200 group transition-all relative overflow-hidden shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className={`p-5 ${stat.bg} ${stat.color} transition-transform group-hover:rotate-6`}>
                <stat.icon size={28} />
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase flex items-center ${stat.trend.includes('+') ? 'text-green-500' : 'text-slate-400'}`}>
                {stat.trend}
                {stat.trend !== 'Stable' && (stat.trend.includes('+') ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />)}
              </span>
            </div>
            <p className="text-5xl font-black text-primary-darker tracking-tighter mb-2 relative z-10">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 relative z-10">{stat.name}</p>
            <div className={`absolute bottom-0 right-0 w-32 h-32 ${stat.bg} opacity-10 -mr-16 -mb-16 rounded-full group-hover:scale-150 transition-all duration-700`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Analytics Trend (Enhanced Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-2 bg-white border border-slate-200 p-12 shadow-sm hover:shadow-md transition-shadow"
        >
           <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-xl font-black uppercase tracking-[0.1em] text-primary-darker">Institutional Traffic Trend</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {timeframe === 'custom' && startDate && endDate 
                    ? `Custom range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                    : `Analytical trajectory over the ${timeframe} period`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-6">
                 <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-sm" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Traffic Volume</span>
                 </div>
                 <button 
                   onClick={exportData}
                   className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                   disabled={!data?.overview?.trend?.length}
                 >
                    <Download size={14} />
                    Export CSV
                 </button>
              </div>
           </div>
           
           <div className="h-96 w-full relative group bg-gradient-to-br from-slate-50/50 to-white rounded-lg p-6 border border-slate-100">
              {/* Chart Loading Indicator */}
              {chartLoading && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-30 rounded-lg">
                  <RefreshCw className="animate-spin text-primary mb-4" size={32} />
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400">Loading Chart Data...</p>
                </div>
              )}
              
              {/* Chart.js Line Chart */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`w-full h-full transition-opacity duration-300 ${chartLoading ? 'opacity-30' : 'opacity-100'}`}
              >
                {data?.overview?.trend?.length > 1 ? (
                  <Line
                    data={{
                      labels: data.overview.trend.map((t: any) => {
                        const date = new Date(t.date);
                        if (timeframe === '1d') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        if (timeframe === '7d' || timeframe === '1w') return date.toLocaleDateString('en-US', { weekday: 'short' });
                        if (timeframe === '1m') return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          label: 'Traffic Volume',
                          data: data.overview.trend.map((t: any) => t.count || 0),
                          borderColor: '#008080',
                          backgroundColor: (context: any) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return null;
                            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                            gradient.addColorStop(0, 'rgba(0, 128, 128, 0)');
                            gradient.addColorStop(1, 'rgba(0, 128, 128, 0.2)');
                            return gradient;
                          },
                          borderWidth: 4,
                          fill: true,
                          tension: 0.45,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                          pointBackgroundColor: '#008080',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      plugins: { 
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: '#0f172a',
                          titleFont: { size: 12, weight: 'bold', family: 'Inter' },
                          bodyFont: { size: 12, family: 'Inter' },
                          padding: 12,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            label: (context: any) => `Volume: ${context.parsed.y}`
                          }
                        }
                      },
                      scales: {
                        x: { 
                          grid: { display: false }, 
                          ticks: { 
                            font: { size: 10, weight: 'bold' }, 
                            color: '#64748b',
                            autoSkip: true,
                            maxRotation: 0
                          } 
                        },
                        y: { 
                          grid: { 
                            color: 'rgba(226, 232, 240, 0.4)',
                            drawTicks: false
                          }, 
                          border: { display: false },
                          ticks: { 
                            font: { size: 10, weight: 'bold' },
                            color: '#64748b',
                            padding: 10,
                            callback: (value: any) => value >= 1000 ? (value / 1000) + 'k' : value
                          } 
                        }
                      },
                      animations: {
                        y: {
                          duration: 2000,
                          easing: 'easeOutQuart',
                          from: (ctx: any) => ctx.type === 'data' ? ctx.chart.scales.y.getPixelForValue(0) : undefined
                        },
                        opacity: {
                          duration: 1000,
                          easing: 'linear'
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-300 text-sm">No data available for selected period</p>
                  </div>
                )}
              </motion.div>
           </div>
        </motion.div>

        {/* All Pages Visits Analysis */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow"
        >
           <div className="mb-8">
              <h3 className="text-lg font-black uppercase tracking-[0.1em] text-primary-darker mb-2">Top Pages Analysis</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Most visited pages overview</p>
           </div>
           
           <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto relative">
                {pageVisitsData?.pages?.length ? (
                  <Doughnut
                    data={{
                      labels: pageVisitsData.pages.map((p: any) => p.page),
                      datasets: [
                        {
                          data: pageVisitsData.pages.map((p: any) => p.percentage || 0),
                          backgroundColor: ['#008080', '#06b6d4', '#0891b2', '#0e7490', '#155e75'],
                          borderColor: '#ffffff',
                          borderWidth: 2,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '60%',
                      plugins: { legend: { display: false } },
                      animation: { animateRotate: true, animateScale: true, duration: 2000, easing: 'easeOutQuart' }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-slate-300 text-sm">No page visit data available</p>
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-2xl font-black text-primary-darker">{(pageVisitsData?.totalPageViews ?? 0).toLocaleString()}</p>
                   <p className="text-[8px] uppercase tracking-widest text-slate-400">Total Visits</p>
                </div>
              </div>
           </div>

           <div className="space-y-2">
              {(pageVisitsData?.pages || []).map((pageData: any, index: number) => {
                const colors = ['#008080', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];
                return (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-all">
                     <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="text-[10px] font-medium text-slate-700 truncate max-w-[120px]">{pageData.page}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-primary-darker">{pageData.percentage}%</span>
                        <span className="text-[8px] text-slate-400">{pageData.visits}</span>
                     </div>
                  </div>
                );
              })}
           </div>

           <div className="border-t border-slate-100 mt-6 pt-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pages</p>
                    <p className="text-xl font-black text-primary-darker">{pageVisitsData?.pages?.length || 0}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Duration</p>
                    <p className="text-xl font-black text-primary-darker">{data?.overview?.avgDuration || '0:00'}</p>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
