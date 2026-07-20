"use client";

import React, { useState, useEffect } from "react";
import { getApi } from "@/lib/api";
import { Tag, Search, RefreshCw, BarChart2, Hash, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import LegacyAdminFallbackBanner from "@/components/admin/LegacyAdminFallbackBanner";

export default function KeywordIntelligence() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getApi("/api/campus-feedback/admin/analytics");
      setAnalytics(data);
    } catch {
      toast.error("Failed to load keyword intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const topTags = analytics?.topTags || [];
  const filteredTags = topTags.filter((t: any) => t.tag.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-24">
      <LegacyAdminFallbackBanner message="Legacy keyword analytics for campus feedback." />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-1 font-serif lowercase tracking-tighter capitalize">
            Keyword Intelligence
          </h2>
          <p className="text-slate-500 font-medium text-sm">AI-extracted entities and tags from all institutional grievances.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary shadow-sm w-64"
            />
          </div>
          <button onClick={fetchAnalytics} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary rounded-xl shadow-sm">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <span className="text-[10px] font-black uppercase tracking-widest">Processing Intelligence...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Keyword List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Hash className="text-primary" size={24} />
                <h3 className="text-lg font-black text-primary-darker">Extracted Entities & Tags</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTags.length > 0 ? filteredTags.map((t: any, i: number) => {
                  // Calculate size relative to max
                  const maxCount = Math.max(...topTags.map((x: any) => x.count));
                  const pct = Math.max(20, Math.round((t.count / maxCount) * 100));
                  
                  return (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors">{t.tag}</span>
                        <span className="text-[10px] font-black bg-white text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">{t.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <p className="text-sm font-medium mb-1">No keywords found matching "{searchQuery}"</p>
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-60">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            <div className="bg-primary-darker rounded-3xl p-8 text-white shadow-lg">
               <div className="flex items-center gap-3 mb-6">
                 <BarChart2 className="text-secondary" size={24} />
                 <h3 className="text-sm font-black uppercase tracking-widest">Intelligence Summary</h3>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Total Unique Tags</p>
                    <p className="text-4xl font-black">{topTags.length}</p>
                  </div>
                  
                  {topTags.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Top Trending Issue</p>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <p className="text-lg font-black text-secondary mb-1">#{topTags[0].tag}</p>
                        <p className="text-xs text-white/70 font-medium">Appears in {topTags[0].count} cases</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-white/60 leading-relaxed">
                    Tags and entities are automatically extracted by our AI engine from complaint descriptions and subjects to help identify systemic issues.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
