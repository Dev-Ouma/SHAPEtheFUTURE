"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  RefreshCw, Plus, X, Loader2, BookOpen, Search, Eye, Pencil, Trash2,
  ThumbsUp, FileText, CheckCircle2, Globe, Lock,
} from "lucide-react";
import { getApi, postApi, putApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { KB_STATUS_COLORS } from "../ict-ui";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

export default function IctKnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [editing, setEditing] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([getApi("/ict/admin/knowledge"), getApi("/ict/admin/knowledge/stats")]);
      setArticles(Array.isArray(a) ? a : []);
      setStats(s);
    } catch {
      toast.error("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => articles.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) ||
      (a.tags || []).some((t: string) => t.toLowerCase().includes(q));
    const matchesFilter = filter === "all" || (filter === "published" ? a.is_published : !a.is_published);
    return matchesSearch && matchesFilter;
  }), [articles, search, filter]);

  const remove = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await deleteApi(`/ict/admin/knowledge/${id}`);
      toast.success("Article deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePublish = async (a: any) => {
    try {
      await putApi(`/ict/admin/knowledge/${a.id}`, { is_published: !a.is_published });
      toast.success(a.is_published ? "Unpublished" : "Published");
      fetchAll();
    } catch {
      toast.error("Failed to update");
    }
  };

  const KPIS = [
    { label: "Articles", value: stats?.total ?? articles.length, icon: <FileText size={16} />, color: "text-primary-darker", bg: "bg-white", border: "border-slate-100" },
    { label: "Published", value: stats?.published ?? 0, icon: <Globe size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Drafts", value: stats?.drafts ?? 0, icon: <Lock size={16} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Total Views", value: stats?.totalViews ?? 0, icon: <Eye size={16} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Helpful Votes", value: stats?.helpful ?? 0, icon: <ThumbsUp size={16} />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-1 font-serif tracking-tighter flex items-center gap-3">
            <BookOpen className="text-primary" size={28} /> IT Knowledge Base
          </h2>
          <p className="text-slate-500 font-medium text-sm">Self-service how-to guides & troubleshooting articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditing(null); setShowEditor(true); }} className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-all">
            <Plus size={16} /> New Article
          </button>
          <button onClick={fetchAll} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-2xl shadow-sm">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPIS.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl ${card.bg} border ${card.border} flex flex-col gap-3 shadow-sm`}>
            <div className={card.color}>{card.icon}</div>
            <div>
              <p className={`text-3xl font-black ${card.color}`}>{loading ? "—" : card.value}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search by title, category, or tag..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 p-3 pl-10 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400" />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-primary text-white shadow" : "text-slate-400 hover:text-slate-700"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4 text-slate-300"><RefreshCw className="animate-spin" size={40} /><span className="text-[10px] font-black uppercase tracking-widest">Loading...</span></div>
        ) : filtered.length > 0 ? filtered.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 rounded-xl bg-slate-50 text-primary shrink-0"><FileText size={16} /></div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${a.is_published ? KB_STATUS_COLORS.Published : KB_STATUS_COLORS.Draft}`}>{a.is_published ? "Published" : "Draft"}</span>
                    {a.category && <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">{a.category}</span>}
                  </div>
                  <h4 className="text-base font-black text-primary-darker group-hover:text-primary transition-colors leading-snug">{a.title}</h4>
                  {a.summary && <p className="text-xs text-slate-500 line-clamp-1">{a.summary}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1"><Eye size={10} />{a.views || 0} views</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={10} />{a.helpful_yes || 0} helpful</span>
                    {(a.tags || []).slice(0, 3).map((t: string, ti: number) => (
                      <span key={ti} className="text-primary/60">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublish(a)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${a.is_published ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                  {a.is_published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => { setEditing(a); setShowEditor(true); }} className="p-2 text-slate-400 hover:text-primary"><Pencil size={16} /></button>
                <button onClick={() => remove(a.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="p-6 bg-white w-fit mx-auto rounded-full shadow-sm mb-4"><BookOpen size={32} className="text-slate-200" /></div>
            <h5 className="text-lg font-black text-primary-darker uppercase tracking-tighter">No Articles Yet</h5>
            <p className="text-xs text-slate-400 font-medium mt-1">Write your first how-to guide to power self-service support.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEditor && <ArticleEditor article={editing} onClose={() => setShowEditor(false)} onSaved={() => { setShowEditor(false); fetchAll(); }} />}
      </AnimatePresence>
    </div>
  );
}

function ArticleEditor({ article, onClose, onSaved }: { article: any | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!article;
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(article?.title || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [category, setCategory] = useState(article?.category || "");
  const [tags, setTags] = useState((article?.tags || []).join(", "));
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false);
  const [body, setBody] = useState(article?.body || "");

  const submit = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const payload = {
        title, summary: summary || undefined, body, category: category || undefined,
        tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        is_published: isPublished,
      };
      if (isEdit) await putApi(`/ict/admin/knowledge/${article.id}`, payload);
      else await postApi("/ict/admin/knowledge", payload);
      toast.success(isEdit ? "Article saved" : "Article created");
      onSaved();
    } catch {
      toast.error("Failed to save article");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-slate-50 p-3 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 border border-slate-100";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black text-primary-darker flex items-center gap-2"><BookOpen size={18} className="text-primary" /> {isEdit ? "Edit Article" : "New Article"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. How to reset your OUK portal password" />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={inputCls} placeholder="One-line description shown in search results" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Accounts, Network, LMS" />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tags (comma-separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="password, login, moodle" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Body</label>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <TiptapEditor content={body} onChange={setBody} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1"><CheckCircle2 size={12} /> Publish (visible to all users)</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest">Cancel</button>
          <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-all">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} {isEdit ? "Save Changes" : "Create Article"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
