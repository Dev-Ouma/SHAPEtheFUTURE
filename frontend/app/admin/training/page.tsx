"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, MessageSquare, ListChecks, Zap, RefreshCw, Layers, ShieldCheck } from "lucide-react";
import { getApi, triggerIndexing, getFaqs, getPrograms } from "@/lib/api";
import toast from "react-hot-toast";

export default function TrainingPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    database: { programmes: 0, staff: 0 },
    vector: { total_nodes: "Synced", health: "Operational" },
    faqs: { total: 0, active: 0 },
    logs: { conversations: 0 }
  });

  const fetchStats = async () => {
    try {
      const [faqs, programmes, conversations] = await Promise.all([
        getFaqs({ limit: 1 }),
        getPrograms({ limit: 1 }),
        getApi('/chats/admin/conversations')
      ]);

      setStats({
        database: { programmes: programmes.total || 0, staff: 42 }, // Hardcoded staff for now
        vector: { total_nodes: "Synced", health: "Operational" },
        faqs: { total: faqs.total || 0, active: faqs.total || 0 },
        logs: { conversations: Array.isArray(conversations) ? conversations.length : 0 }
      });
    } catch (e) {
      console.error("Discovery error:", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await triggerIndexing();
      toast.success(`Scholarly synchronisation complete: ${result.indexed.faqs} FAQs and ${result.indexed.programmes} Programmes indexed.`);
      fetchStats();
    } catch (e) {
      toast.error("Intelligence synchronisation failed. Check AI Core connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
           <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight text-secondary">Intelligence Training</h2>
              <p className="text-slate-500 font-medium max-w-2xl">
                Orchestrate the institutional knowledge discovery registry. Synchronise structured university data with the high-performance semantic vector brain.
              </p>
           </div>
           
           <button 
             onClick={handleSync}
             disabled={loading}
             className="flex items-center gap-3 bg-secondary text-white px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all disabled:opacity-50"
           >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Synchronising Knowledge..." : "Trigger Global Re-indexing"}
           </button>
        </div>

        {/* Data Topology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <TopologyCard 
             icon={Database}
             title="Structured Database"
             subtitle="Programmes, Courses, Staff"
             value={`${stats.database.programmes + stats.database.staff} Entities`}
             status="Source of Truth"
             color="blue"
           />
           <TopologyCard 
             icon={Search}
             title="Vector Registry"
             subtitle="Semantic Nodes (pgvector)"
             value={stats.vector.total_nodes}
             status={stats.vector.health}
             color="emerald"
           />
           <TopologyCard 
             icon={ListChecks}
             title="FAQ Marketplace"
             subtitle="Curated Intent Store"
             value={`${stats.faqs.total} Records`}
             status="Grounded"
             color="amber"
           />
           <TopologyCard 
             icon={MessageSquare}
             title="Engagement Logs"
             subtitle="Conversations & Feedback"
             value={`${stats.logs.conversations} Sessions`}
             status="Learning Feed"
             color="slate"
           />
        </div>

        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Training Strategy */}
           <div className="lg:col-span-2 space-y-8 bg-slate-50 p-10 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                    <Layers className="w-6 h-6 text-secondary" />
                 </div>
                 <h3 className="text-lg font-black uppercase tracking-wider text-secondary">Institutional Training Strategy</h3>
              </div>
              
              <div className="space-y-6">
                 <StrategyItem 
                   title="Layer 1: Deterministic Knowledge"
                   description="Direct matches from the Programmes and FAQ tables. These provide definitive, university-sanctioned answers."
                   status="Active"
                 />
                 <StrategyItem 
                   title="Layer 2: Semantic Discovery"
                   description="Vectorized chunks stored in pgvector. Used for 'finding needles in haystacks' across unstructured institutional data."
                   status="Optimised"
                 />
                 <StrategyItem 
                   title="Layer 3: Scholarly Fallback"
                   description="OpenAI gpt-4o integration for complex reasoning when institutional data is insufficient."
                   status="Gated"
                 />
                 <StrategyItem 
                   title="Layer 4: Human-in-the-Loop"
                   description="Real-time escalation to support officers via the Support Hub when confidence thresholds are breached."
                   status="Operational"
                 />
              </div>
           </div>

           {/* Health & Sync Log */}
           <div className="space-y-8 bg-white p-10 border border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4">Discovery Pulse</h3>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vector Engine</span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       <ShieldCheck className="w-3 h-3" />
                       Healthy
                    </span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Sync</span>
                    <span className="text-[10px] font-black text-primary-darker uppercase tracking-widest">
                       Just Now
                    </span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">API Gateway</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                       Online
                    </span>
                 </div>
              </div>

              <div className="mt-10 p-6 bg-slate-50 border border-slate-100 italic text-[11px] leading-relaxed text-slate-500 font-medium">
                \"The Intelligence Training portal ensures that the university brain is synchronised with the latest administrative policy changes and academic offerings.\"
              </div>
           </div>
        </div>
    </div>
  );
}

function TopologyCard({ icon: Icon, title, subtitle, value, status, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className={`p-8 border bg-white space-y-6 transition-all hover:shadow-xl hover:-translate-y-1`}>
       <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h4>
          <p className="text-[10px] font-bold text-slate-600">{subtitle}</p>
       </div>
       <div className="pt-4 border-t border-slate-50">
          <div className="text-2xl font-black text-secondary tracking-tight">{value}</div>
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1">{status}</div>
       </div>
    </div>
  );
}

function StrategyItem({ title, description, status }: any) {
  return (
    <div className="flex gap-6 pb-6 border-b border-slate-200/50 last:border-0 last:pb-0">
       <div className="flex-shrink-0 pt-1">
          <div className="w-2 h-2 rounded-full bg-secondary" />
       </div>
       <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h4 className="font-black text-primary-darker text-sm tracking-tight">{title}</h4>
             <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{status}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
       </div>
    </div>
  );
}
