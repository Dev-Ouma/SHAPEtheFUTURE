"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  BookOpen,
  Activity,
  Zap,
  Edit3,
  X,
  Save,
  Tag,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  BarChart2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";

const CATEGORIES = [
  "admissions", "fees", "academics", "exams", "programmes",
  "staff", "library", "research", "general", "it-support"
];
const TYPES = ["faq", "knowledge_chunk", "document_ref"];

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string }) {
  const colorMap: Record<string, string> = {
    red: "bg-red-50 border-red-100 text-red-600",
    green: "bg-green-50 border-green-100 text-green-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    primary: "bg-primary/5 border-primary/10 text-primary",
  };
  return (
    <div className={`border rounded-sm p-5 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">{label}</span>
        <div className="opacity-60">{icon}</div>
      </div>
      <p className="text-3xl font-black">{value}</p>
      {sub && <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function IntelligenceHubPage() {
  const [tab, setTab] = useState<"failures" | "training">("failures");
  const [showResolved, setShowResolved] = useState(false);
  const [failures, setFailures] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "general", type: "faq" });
  const [saving, setSaving] = useState(false);

  // Resolution state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "confidence">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Batch selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchResolving, setBatchResolving] = useState(false);

  // Indexing
  const [indexing, setIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState<any>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [f, i] = await Promise.all([
        getApi(`/chats/failures?includeResolved=${showResolved}`),
        getApi('/chats/intelligence'),
      ]);
      setFailures(f || []);
      setIntelligence(i || []);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [showResolved]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await patchApi(`/chats/intelligence/${editItem.id}`, form);
      } else {
        await postApi('/chats/intelligence', form);
      }
      setShowForm(false);
      setEditItem(null);
      setForm({ question: "", answer: "", category: "general", type: "faq" });
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this intelligence record?")) return;
    await deleteApi(`/chats/intelligence/${id}`);
    await fetchAll();
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setForm({ question: item.question, answer: item.answer, category: item.category || "general", type: item.type });
    setShowForm(true);
  };

  const handleResolve = async (id: string) => {
    await patchApi(`/chats/failures/${id}/resolve`, { note: resolveNote });
    setResolvingId(null);
    setResolveNote("");
    await fetchAll();
  };

  const handleBatchResolve = async () => {
    if (!selected.size) return;
    setBatchResolving(true);
    try {
      await Promise.all(Array.from(selected).map(id => patchApi(`/chats/failures/${id}/resolve`, { note: "Batch resolved" })));
      setSelected(new Set());
      await fetchAll();
    } finally {
      setBatchResolving(false);
    }
  };

  const handleIndex = async () => {
    setIndexing(true);
    setIndexResult(null);
    try {
      const result = await postApi('/chats/intelligence/index', {});
      setIndexResult(result);
    } catch {
      setIndexResult({ error: "Indexing failed. Check AI service." });
    } finally {
      setIndexing(false);
    }
  };

  const handlePromote = (failure: any) => {
    setForm({ question: failure.query, answer: "", category: "general", type: "faq" });
    setEditItem(null);
    setShowForm(true);
    setTab("training");
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (list: any[]) => {
    if (selected.size === list.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(list.map(f => f.id)));
    }
  };

  // Derived/filtered data
  const filteredFailures = useMemo(() => {
    let list = showResolved ? failures : failures.filter(f => !f.is_resolved);
    if (searchQuery) list = list.filter(f => f.query?.toLowerCase().includes(searchQuery.toLowerCase()) || f.bot_response?.toLowerCase().includes(searchQuery.toLowerCase()));
    list = list.sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortBy === "confidence") return dir * ((a.confidence || 0) - (b.confidence || 0));
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });
    return list;
  }, [failures, searchQuery, sortBy, sortDir]);

  const resolvedCount = useMemo(() => failures.filter(f => f.is_resolved).length, [failures]);
  const avgConfidence = useMemo(() => {
    if (!failures.length) return 0;
    return (failures.reduce((acc, f) => acc + (f.confidence || 0), 0) / failures.length * 100).toFixed(0);
  }, [failures]);

  const filteredIntelligence = useMemo(() => {
    let list = intelligence;
    if (searchQuery) list = list.filter(i => i.question?.toLowerCase().includes(searchQuery.toLowerCase()) || i.answer?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterCategory !== "all") list = list.filter(i => i.category === filterCategory);
    return list;
  }, [intelligence, searchQuery, filterCategory]);

  const handleExportFailures = () => {
    const exportData = filteredFailures.map(f => ({
      query: f.query,
      bot_response: f.bot_response || "",
      confidence: ((f.confidence || 0) * 100).toFixed(0) + "%",
      date: new Date(f.created_at).toLocaleDateString(),
      resolved: f.resolved ? "Yes" : "No",
    }));
    downloadCSV(exportData, `ouk-chat-failures-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportIntelligence = () => {
    const exportData = filteredIntelligence.map(i => ({
      question: i.question,
      answer: i.answer,
      category: i.category,
      type: i.type,
      created_at: new Date(i.created_at).toLocaleDateString(),
    }));
    downloadCSV(exportData, `ouk-chat-training-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const SortIcon = ({ field }: { field: "date" | "confidence" }) => {
    if (sortBy !== field) return null;
    return sortDir === "desc" ? <ChevronDown size={12} className="inline ml-1" /> : <ChevronUp size={12} className="inline ml-1" />;
  };

  const toggleSort = (field: "date" | "confidence") => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-primary-darker p-10 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary"><Brain size={20} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Hub</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter font-serif">Bot Training Centre.</h1>
          <p className="text-slate-400 font-medium max-w-lg text-sm leading-relaxed">
            Monitor knowledge gaps, train the AI with curated Q&amp;A, and trigger re-indexing in one unified intelligence platform.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 flex-wrap gap-y-3">
          <div className="bg-white/5 border border-white/10 p-5 text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Unresolved</p>
            <p className="text-3xl font-black text-red-400">{filteredFailures.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Resolved</p>
            <p className="text-3xl font-black text-green-400">{resolvedCount}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Training Items</p>
            <p className="text-3xl font-black text-blue-400">{intelligence.length}</p>
          </div>
          <button
            onClick={handleIndex}
            disabled={indexing}
            className="flex flex-col items-center justify-center w-20 h-[78px] bg-primary text-white hover:bg-[#ff7f50] transition-all shadow-lg disabled:opacity-60"
          >
            <Zap size={22} className={indexing ? "animate-pulse" : ""} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-1">{indexing ? "Indexing" : "Re-Index"}</span>
          </button>
          <button onClick={fetchAll} className="w-12 h-[78px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<MessageSquare size={16} />} label="Total Queries Logged" value={failures.length} sub="all time" color="primary" />
        <StatCard icon={<AlertTriangle size={16} />} label="Unresolved Failures" value={filteredFailures.length} sub="needing review" color="red" />
        <StatCard icon={<CheckCircle size={16} />} label="Resolved Issues" value={resolvedCount} sub="closed queries" color="green" />
        <StatCard icon={<BarChart2 size={16} />} label="Avg Confidence" value={`${avgConfidence}%`} sub="bot response quality" color="amber" />
      </div>

      {/* Index Result Banner */}
      {indexResult && (
        <div className={`p-5 flex items-center space-x-4 text-sm font-bold ${indexResult.error ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {indexResult.error ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>
            {indexResult.error
              ? indexResult.error
              : `Re-indexed: FAQs ${indexResult.indexed?.faqs} · Programmes ${indexResult.indexed?.programmes} · Pages ${indexResult.indexed?.pages} · Staff ${indexResult.indexed?.staff} · Intelligence ${indexResult.indexed?.intelligence}`
            }
          </span>
          <button onClick={() => setIndexResult(null)} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {([
          ["failures", "Failed Queries", AlertCircle],
          ["training", "Training Data", BookOpen],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearchQuery(""); setSelected(new Set()); }}
            className={`flex items-center space-x-2 px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
              tab === key
                ? `border-primary text-primary`
                : `border-transparent text-slate-400 hover:text-slate-700`
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {key === "failures" && filteredFailures.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{filteredFailures.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* === FAILED QUERIES TAB === */}
      {tab === "failures" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search failed queries..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={() => setShowResolved(r => !r)}
              className={`flex items-center space-x-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-all ${
                showResolved
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              <CheckCircle size={14} />
              <span>{showResolved ? 'Hiding Resolved' : 'Show Resolved'}</span>
            </button>
            {selected.size > 0 && (
              <button
                onClick={handleBatchResolve}
                disabled={batchResolving}
                className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-60"
              >
                <CheckCircle size={14} />
                <span>{batchResolving ? "Resolving..." : `Resolve ${selected.size} Selected`}</span>
              </button>
            )}
            <button
              onClick={handleExportFailures}
              className="flex items-center space-x-2 bg-slate-800 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-24 text-center">
                <div className="inline-flex items-center space-x-3 text-primary animate-pulse">
                  <Activity size={24} />
                  <span className="text-sm font-black uppercase tracking-widest">Loading failures...</span>
                </div>
              </div>
            ) : filteredFailures.length === 0 ? (
              <div className="p-24 text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {searchQuery ? "No matches for your search." : "No unresolved failures. The bot is performing well!"}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === filteredFailures.length && filteredFailures.length > 0}
                        onChange={() => toggleAll(filteredFailures)}
                        className="accent-primary w-4 h-4"
                      />
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User Query</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bot Response Preview</th>
                    <th
                      className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("confidence")}
                    >
                      Confidence<SortIcon field="confidence" />
                    </th>
                    <th
                      className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-primary"
                      onClick={() => toggleSort("date")}
                    >
                      Time<SortIcon field="date" />
                    </th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFailures.map((f) => {
                    const conf = (f.confidence || 0) * 100;
                    const severity = conf < 30 ? "critical" : conf < 60 ? "warning" : "low";
                    const severityColor = { critical: "bg-red-100 text-red-700", warning: "bg-amber-100 text-amber-700", low: "bg-green-100 text-green-700" }[severity];
                    return (
                      <tr key={f.id} className={`group hover:bg-slate-50/50 transition-all ${selected.has(f.id) ? "bg-primary/5" : ""}`}>
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selected.has(f.id)}
                            onChange={() => toggleSelect(f.id)}
                            className="accent-primary w-4 h-4"
                          />
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-sm font-bold text-slate-800 leading-relaxed">{f.query}</p>
                          <span className={`mt-1 inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${severityColor}`}>
                            {severity} confidence
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{f.bot_response || "—"}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${conf < 30 ? "bg-red-400" : conf < 60 ? "bg-amber-400" : "bg-green-400"}`}
                                style={{ width: `${conf}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-black ${conf < 30 ? "text-red-500" : conf < 60 ? "text-amber-500" : "text-green-500"}`}>
                              {conf.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Clock size={10} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                              {new Date(f.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {resolvingId === f.id ? (
                            <div className="flex items-center space-x-2 justify-end">
                              <input
                                type="text"
                                placeholder="Resolution note..."
                                value={resolveNote}
                                onChange={(e) => setResolveNote(e.target.value)}
                                className="text-[10px] border border-slate-200 px-3 py-2 outline-none focus:ring-1 focus:ring-primary w-36"
                              />
                              <button onClick={() => handleResolve(f.id)} className="bg-green-500 text-white p-2 hover:bg-green-600">
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => setResolvingId(null)} className="bg-slate-100 text-slate-500 p-2 hover:bg-slate-200">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-2">
                              <button
                                onClick={() => handlePromote(f)}
                                className="bg-primary text-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-[#ff7f50] transition-all"
                                title="Use this query to create a training entry"
                              >
                                Train Bot
                              </button>
                              <button
                                onClick={() => setResolvingId(f.id)}
                                className="bg-slate-100 text-slate-600 px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-slate-200 transition-all"
                              >
                                Resolve
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer count */}
          {filteredFailures.length > 0 && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
              Showing {filteredFailures.length} of {failures.length} total records · {selected.size} selected
            </p>
          )}
        </div>
      )}

      {/* === TRAINING DATA TAB === */}
      {tab === "training" && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-primary text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff7f50] transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Add Training Record</span>
              </button>
            )}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search training data..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportIntelligence}
              className="flex items-center space-x-2 bg-slate-800 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <div className="bg-white border border-primary/30 shadow-lg p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary text-white"><Brain size={16} /></div>
                  <h3 className="font-black text-primary-darker uppercase tracking-widest text-[11px]">
                    {editItem ? "Edit Training Record" : "New Training Record"}
                  </h3>
                </div>
                <button onClick={() => { setShowForm(false); setEditItem(null); setForm({ question: "", answer: "", category: "general", type: "faq" }); }}>
                  <X size={20} className="text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-2">Question / Trigger</label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="e.g. What are the fees for the MBA programme?"
                    className="w-full border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-2">Answer / Knowledge</label>
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    rows={5}
                    placeholder="Provide a clear, concise, fact-based answer. You can include a URL if relevant."
                    className="w-full border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-2">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-t border-slate-100 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.question || !form.answer}
                  className="flex items-center space-x-2 bg-primary text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ff7f50] transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{saving ? "Saving..." : "Save Record"}</span>
                </button>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Remember to Re-Index after saving.</p>
              </div>
            </div>
          )}

          {/* Training Records Table */}
          <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-24 text-center">
                <div className="inline-flex items-center space-x-3 text-primary animate-pulse">
                  <Activity size={24} />
                  <span className="text-sm font-black uppercase tracking-widest">Loading intelligence records...</span>
                </div>
              </div>
            ) : filteredIntelligence.length === 0 ? (
              <div className="p-24 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Brain size={28} className="text-slate-200" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  {searchQuery || filterCategory !== "all" ? "No matches for your filters." : "No training data yet. Add records to teach the bot."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Question</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Answer Preview</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredIntelligence.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="p-5 max-w-xs">
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">{item.question}</p>
                      </td>
                      <td className="p-5 max-w-sm">
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{item.answer}</p>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center space-x-2">
                          <Tag size={12} className="text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1">
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1">{item.type}</span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-slate-100 text-slate-600 p-2 hover:bg-primary hover:text-white transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-slate-100 text-slate-600 p-2 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredIntelligence.length > 0 && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
              Showing {filteredIntelligence.length} of {intelligence.length} records
            </p>
          )}
        </div>
      )}
    </div>
  );
}
