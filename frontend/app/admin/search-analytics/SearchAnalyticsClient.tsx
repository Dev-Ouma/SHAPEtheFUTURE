"use client";

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { Search, AlertCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  topQueries: { query: string; count: string }[];
  failedSearches: { query: string; count: string }[];
  totalSearches: number;
  failedCount: number;
}

export default function SearchAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApi('/search/analytics').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-96 rounded-2xl" />;
  }

  if (!data) {
    return <div>Error loading analytics data.</div>;
  }

  const successRate = data.totalSearches > 0 
    ? (((data.totalSearches - data.failedCount) / data.totalSearches) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Searches</p>
            <p className="text-2xl font-black text-slate-900">{data.totalSearches}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
            <p className="text-2xl font-black text-slate-900">{successRate}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Failed Queries</p>
            <p className="text-2xl font-black text-slate-900">{data.failedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Search size={16} className="text-primary" /> Top Searched Queries
          </h2>
          <div className="space-y-3">
            {data.topQueries.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <span className="font-bold text-slate-700 capitalize">{q.query}</span>
                <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{q.count}</span>
              </div>
            ))}
            {data.topQueries.length === 0 && <p className="text-slate-500 text-sm">No data available yet.</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" /> Top Failed Queries (0 Results)
          </h2>
          <div className="space-y-3">
            {data.failedSearches.map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                <span className="font-bold text-slate-700 capitalize">{q.query}</span>
                <span className="text-xs font-black bg-red-100 text-red-600 px-3 py-1 rounded-full">{q.count}</span>
              </div>
            ))}
            {data.failedSearches.length === 0 && <p className="text-slate-500 text-sm">No failed searches yet. Great!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
