"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@/i18n/routing";
import {
  Download, Printer, Clock, Shield, Star, ChevronDown, ChevronRight,
  ChevronLeft, Search, Phone, Mail, Play, FileText, FileSpreadsheet,
  Presentation, BookOpen, Megaphone, MessageSquare, Bot, BarChart3,
  Users, CheckCircle, TrendingUp, Headphones, HelpCircle, Eye, X,
  AlertCircle, ArrowRight, Loader2, RefreshCw
} from "lucide-react";
import { useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── API HELPERS ──────────────────────────────────────────────────────────────

async function apiFetch(path: string) {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Meta { total: number; page: number; limit: number; totalPages: number }
interface Paginated<T> { data: T[]; meta: Meta }

interface ServiceItem { id: string; category: string; service: string; timeline: string; unit: string; email: string; phone: string; docs: string[]; steps: string[]; faqs: string[] }
interface Video { id: string; title: string; description: string; category: string; duration: string; view_count: number; thumbnail_url?: string; video_url?: string }
interface Document { id: string; title: string; file_type: string; file_size: string; category: string; version: string; download_count: number; file_url?: string }
interface Faq { id: string; question: string; answer: string; category: string }
interface Notice { id: string; title: string; body: string; type: 'info' | 'warning' | 'success' | 'danger'; created_at: string }
interface Metric { id: string; label: string; value: string; sub_label: string; icon: string }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FILE_ICON_MAP: Record<string, React.ComponentType<any>> = { PDF: FileText, DOCX: BookOpen, XLSX: FileSpreadsheet, PPTX: Presentation };
const FILE_COLOR_MAP: Record<string, string> = {
  PDF: "bg-red-50 text-red-600 border-red-100",
  DOCX: "bg-blue-50 text-blue-600 border-blue-100",
  XLSX: "bg-green-50 text-green-600 border-green-100",
  PPTX: "bg-orange-50 text-orange-600 border-orange-100",
};
const VIDEO_COLORS = ["from-primary/80 to-primary-darker","from-slate-700 to-slate-900","from-teal-600 to-teal-900","from-indigo-600 to-indigo-900","from-rose-600 to-rose-900","from-amber-600 to-amber-900"];
const ICON_MAP: Record<string, React.ComponentType<any>> = { Clock, CheckCircle, BarChart3, Star, Shield, TrendingUp, Users, Megaphone };

// ─── PAGINATION COMPONENT ─────────────────────────────────────────────────────

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
  const t = useTranslations("ServiceCharter");
  if (meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1);
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
      <p className="text-xs text-slate-400 font-medium">
        {t("showingResults", { from, to, total: meta.total.toLocaleString() })}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}
          className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={14} />
        </button>
        {visible.map((p, i) => {
          const prev = visible[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && <span className="px-1 text-slate-300 text-xs">…</span>}
              <button onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-colors border ${
                  p === meta.page ? "bg-primary text-white border-primary" : "border-slate-200 hover:border-primary hover:text-primary"
                }`}>
                {p}
              </button>
            </React.Fragment>
          );
        })}
        <button onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}
          className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = ICON_MAP[metric.icon] || BarChart3;
  const [count, setCount] = useState(0);
  const numericVal = parseFloat(metric.value.replace(/[^0-9.]/g, ""));
  const suffix = metric.value.replace(/[0-9.,]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const step = numericVal / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= numericVal) { setCount(numericVal); clearInterval(timer); }
          else setCount(Math.floor(start * 10) / 10);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [numericVal]);

  return (
    <div ref={ref} className="group bg-white border border-slate-100 hover:border-primary/30 p-8 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="w-12 h-12 bg-primary/5 group-hover:bg-primary flex items-center justify-center mb-6 transition-colors">
        <Icon size={20} className="text-primary group-hover:text-white transition-colors" />
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter">{count.toLocaleString()}{suffix}</div>
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mt-1">{metric.label}</div>
      <div className="text-xs text-slate-400 font-medium mt-1">{metric.sub_label}</div>
    </div>
  );
}

// ─── SERVICE STANDARDS ────────────────────────────────────────────────────────

function ServiceStandards() {
  const t = useTranslations("ServiceCharter");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState<Paginated<ServiceItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "10" });
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    const data = await apiFetch(`/service-charter/items?${params}`);
    setResult(data);
    setLoading(false);
  }, [search, category, page]);

  useEffect(() => { apiFetch("/service-charter/items/categories").then(d => setCategories(d || [])); }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); fetch(1); }, 400);
  }, [search, category]);

  useEffect(() => { fetch(); }, [page]);

  const allCats = ["All", ...categories];

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t("searchServices")} value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {allCats.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${category === cat ? "bg-primary text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
            {cat === "All" ? t("allCategories") : cat}
          </button>
        ))}
      </div>

      <div className="border border-slate-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 bg-slate-50 px-6 py-3 border-b border-slate-100">
          <div className="col-span-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t("colService")}</div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t("colCategory")}</div>
          <div className="col-span-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t("colTimeline")}</div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t("colOffice")}</div>
          <div className="col-span-1"></div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="mx-auto mb-3 text-primary animate-spin" />
            <p className="text-xs text-slate-400 font-medium">{t("loadingServices")}</p>
          </div>
        ) : !result?.data?.length ? (
          <div className="py-16 text-center text-slate-400">
            <Search size={32} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">{t("noServices")}</p>
          </div>
        ) : result.data.map(service => (
          <div key={service.id} className="border-b border-slate-50 last:border-0">
            <button className="w-full text-left" onClick={() => setExpanded(expanded === service.id ? null : service.id)}>
              <div className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="col-span-12 md:col-span-4 font-black text-slate-800 text-sm uppercase tracking-tight">{service.service}</div>
                <div className="col-span-6 md:col-span-2 mt-1 md:mt-0">
                  <span className="inline-block px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">{service.category}</span>
                </div>
                <div className="col-span-6 md:col-span-3 mt-1 md:mt-0 flex items-center gap-2 text-slate-600 text-xs font-bold">
                  <Clock size={12} className="text-primary shrink-0" />{service.timeline}
                </div>
                <div className="hidden md:block col-span-2 text-xs text-slate-400 font-medium truncate">{service.unit}</div>
                <div className="hidden md:flex col-span-1 justify-end">
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${expanded === service.id ? "rotate-180 text-primary" : ""}`} />
                </div>
              </div>
            </button>

            {expanded === service.id && (
              <div className="px-6 pb-6 bg-slate-50 border-t border-slate-100 grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 mt-4">{t("requiredDocs")}</h4>
                  <ul className="space-y-1">
                    {service.docs.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                        <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />{d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 mt-4">{t("processSteps")}</h4>
                  <ol className="space-y-2">
                    {service.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                        <span className="shrink-0 w-5 h-5 bg-primary text-white flex items-center justify-center text-[9px] font-black">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 mt-4">{t("contactUnit")}</h4>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{service.unit}</p>
                    <a href={`mailto:${service.email}`} className="flex items-center gap-2 text-xs text-primary font-bold hover:underline">
                      <Mail size={12} />{service.email}
                    </a>
                    {service.phone && <a href={`tel:${service.phone}`} className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                      <Phone size={12} />{service.phone}
                    </a>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {result?.meta && <Pagination meta={result.meta} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
    </div>
  );
}

// ─── VIDEO LIBRARY ────────────────────────────────────────────────────────────

function VideoLibrary() {
  const t = useTranslations("ServiceCharter");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState<Paginated<Video> | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "6" });
    if (category !== "All") params.set("category", category);
    const data = await apiFetch(`/service-charter/videos?${params}`);
    setResult(data);
    setLoading(false);
  }, [category, page]);

  useEffect(() => { apiFetch("/service-charter/videos/categories").then(d => setCategories(d || [])); }, []);
  useEffect(() => { setPage(1); fetch(1); }, [category]);
  useEffect(() => { fetch(); }, [page]);

  const handlePlay = (video: Video) => {
    setActiveVideo(video);
    fetch(page); // fire view increment via optimistic update
    window.fetch(`${API}/service-charter/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", ...categories].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${category === cat ? "bg-primary text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
            {cat === "All" ? t("allCategories") : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={24} className="mx-auto text-primary animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {result?.data?.map((video, i) => (
            <button key={video.id} onClick={() => handlePlay(video)}
              className="group text-left border border-slate-100 hover:border-primary/30 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`aspect-video bg-gradient-to-br ${VIDEO_COLORS[i % VIDEO_COLORS.length]} flex flex-col items-center justify-center relative overflow-hidden`}>
                {video.thumbnail_url
                  ? <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                  : null}
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all z-10">
                  <Play size={22} className="text-white ml-1" fill="white" />
                </div>
                <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5">{video.duration}</span>
                <span className="absolute top-3 left-3 bg-white/10 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-white/20">{video.category}</span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">{video.title}</h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-2">{video.description}</p>
                <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-400 font-bold">
                  <Eye size={10} />{t("viewsCount", { count: video.view_count.toLocaleString() })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}

      {activeVideo && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-6" onClick={() => setActiveVideo(null)}>
          <div className="bg-white w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 max-w-lg line-clamp-1">{activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className={`aspect-video bg-gradient-to-br ${VIDEO_COLORS[0]} flex flex-col items-center justify-center`}>
              {activeVideo.video_url
                ? <video src={activeVideo.video_url} controls className="w-full h-full object-cover" autoPlay />
                : <>
                    <Play size={48} className="text-white/80" fill="white" />
                    <p className="text-white/50 text-sm mt-4 font-medium">{t("videoUploadHint")}</p>
                  </>
              }
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 font-medium">{activeVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOCUMENT CENTRE ─────────────────────────────────────────────────────────

function DocumentCenter() {
  const t = useTranslations("ServiceCharter");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<Paginated<Document> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "8" });
    if (search) params.set("search", search);
    const data = await apiFetch(`/service-charter/documents?${params}`);
    setResult(data);
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); fetch(1); }, 400);
  }, [search]);

  useEffect(() => { fetch(); }, [page]);

  const handleDownload = async (doc: Document) => {
    await window.fetch(`${API}/service-charter/documents/${doc.id}/download`, { method: "POST" }).catch(() => {});
    if (doc.file_url) window.open(doc.file_url, "_blank");
    else alert(t("uploadNotConfigured"));
  };

  return (
    <div>
      <div className="relative mb-8">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder={t("searchDocuments")} value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-3 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={24} className="mx-auto text-primary animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {result?.data?.map(doc => {
            const Icon = FILE_ICON_MAP[doc.file_type] || FileText;
            const colorClass = FILE_COLOR_MAP[doc.file_type] || "bg-slate-50 text-slate-600 border-slate-100";
            return (
              <div key={doc.id} className="group border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all p-5 flex flex-col hover:-translate-y-0.5">
                <div className={`w-10 h-10 flex items-center justify-center border mb-4 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-800 leading-snug mb-2 group-hover:text-primary transition-colors">{doc.title}</h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold mb-3">
                    <span>{doc.file_type} · {doc.file_size}</span>
                    <span>{doc.version}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Download size={10} />{t("downloadsCount", { count: doc.download_count.toLocaleString() })}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                  <button onClick={() => doc.file_url && window.open(doc.file_url, "_blank")}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all">
                    <Eye size={10} /> {t("view")}
                  </button>
                  <button onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary/5 hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest text-primary transition-all">
                    <Download size={10} /> {t("download")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}
    </div>
  );
}

// ─── FAQ SECTION ─────────────────────────────────────────────────────────────

function FAQSection() {
  const t = useTranslations("ServiceCharter");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [result, setResult] = useState<Paginated<Faq> | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(async (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "8" });
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    const data = await apiFetch(`/service-charter/faqs?${params}`);
    setResult(data);
    setLoading(false);
  }, [search, category, page]);

  useEffect(() => { apiFetch("/service-charter/faqs/categories").then(d => setCategories(d || [])); }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); fetch(1); }, 400);
  }, [search, category]);

  useEffect(() => { fetch(); }, [page]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={t("searchFaqs")} value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${category === cat ? "bg-primary text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              {cat === "All" ? t("allCategories") : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center"><Loader2 size={24} className="mx-auto text-primary animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {!result?.data?.length ? (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle size={32} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">{t("noFaqs")}</p>
            </div>
          ) : result.data.map(faq => (
            <div key={faq.id} className="border border-slate-100 hover:border-primary/20 transition-colors">
              <button onClick={() => {
                setExpanded(expanded === faq.id ? null : faq.id);
                if (expanded !== faq.id) window.fetch(`${API}/service-charter/faqs/${faq.id}/view`, { method: "POST" }).catch(() => {});
              }} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-snug">{faq.question}</span>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded === faq.id ? "rotate-180 text-primary" : ""}`} />
              </button>
              {expanded === faq.id && (
                <div className="px-6 pb-5 text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-12">
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-4">{badge}</span>
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase font-serif">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 font-medium mt-3 max-w-2xl">{subtitle}</p>}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ServiceCharterPage() {
  const t = useTranslations("ServiceCharter");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");

  useEffect(() => {
    apiFetch("/service-charter/metrics").then(d => setMetrics(d || []));
    apiFetch("/service-charter/notices").then(d => setNotices(d || []));
  }, []);

  const CORE_VALUES = [
    { icon: Shield, title: t("valueIntegrity"), desc: t("valueIntegrityDesc") },
    { icon: Star, title: t("valueExcellence"), desc: t("valueExcellenceDesc") },
    { icon: Users, title: t("valueInclusivity"), desc: t("valueInclusivityDesc") },
    { icon: TrendingUp, title: t("valueInnovation"), desc: t("valueInnovationDesc") },
  ];

  const CONTACTS = [
    { dept: t("deptAdmissions"), email: "admissions@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursWeekday") },
    { dept: t("deptStudentAffairs"), email: "studentaffairs@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursWeekday") },
    { dept: t("deptIct"), email: "ict@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursIct") },
    { dept: t("deptFinance"), email: "finance@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursFinance") },
    { dept: t("deptLibrary"), email: "library@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursLibrary") },
    { dept: t("deptExams"), email: "exams@ouk.ac.ke", phone: "+254 20 2311438", hours: t("hoursWeekday") },
  ];

  const AI_SUGGESTIONS = [t("aiQ1"), t("aiQ2"), t("aiQ3"), t("aiQ4")];

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* HERO */}
      <header className="relative bg-primary-darker text-white overflow-hidden pt-48 pb-32">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--color-primary)) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--color-secondary)) 0%, transparent 50%)" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-white/60 text-[10px] font-black uppercase tracking-[0.25em]"><Shield size={10} /> {t("officialDoc")}</span>
              <span className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.25em]">{t("versionUpdated")}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter font-serif leading-none">
              {t("title")}<br /><span className="text-primary">{t("titleAccent")}</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
              {t("heroBody")}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center gap-2 text-xs tracking-widest uppercase py-3 px-6">
                <Download size={14} /> {t("downloadCharter")}
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                <Printer size={14} /> {t("printCharter")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section className="py-24 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionHeader badge={t("aboutBadge")} title={t("aboutTitle")} />
              <div className="space-y-5 text-sm text-slate-500 font-medium leading-relaxed">
                <p>{t("aboutP1")}</p>
                <p>{t("aboutP2")}</p>
                <p>{t("aboutP3")}</p>
              </div>
              <div className="mt-8 p-6 bg-primary/5 border-l-4 border-primary">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">{t("qaStatement")}</h4>
                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                  &ldquo;{t("qaQuote")}&rdquo;
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">{t("coreValues")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {CORE_VALUES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="group p-6 border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-primary flex items-center justify-center mb-4 transition-colors">
                      <Icon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-1">{title}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE DASHBOARD */}
      {metrics.length > 0 && (
        <section className="py-24 bg-slate-50 border-b border-slate-100">
          <div className="container mx-auto px-6">
            <SectionHeader badge={t("livePerfBadge")} title={t("dashboardTitle")} subtitle={t("dashboardSubtitle")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map(m => <MetricCard key={m.id} metric={m} />)}
            </div>
          </div>
        </section>
      )}

      {/* SERVICE STANDARDS */}
      <section className="py-24 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <SectionHeader badge={t("standardsBadge")} title={t("standardsTitle")} subtitle={t("standardsSubtitle")} />
          <ServiceStandards />
        </div>
      </section>

      {/* VIDEO LIBRARY */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <SectionHeader badge={t("videoBadge")} title={t("videoTitle")} subtitle={t("videoSubtitle")} />
          <VideoLibrary />
        </div>
      </section>

      {/* DOCUMENT CENTRE */}
      <section className="py-24 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <SectionHeader badge={t("docsBadge")} title={t("docsTitle")} subtitle={t("docsSubtitle")} />
          <DocumentCenter />
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <SectionHeader badge={t("faqsBadge")} title={t("faqsTitle")} subtitle={t("faqsSubtitle")} />
          <FAQSection />
        </div>
      </section>

      {/* NOTICES */}
      {notices.length > 0 && (
        <section className="py-24 border-b border-slate-100">
          <div className="container mx-auto px-6">
            <SectionHeader badge={t("noticesBadge")} title={t("noticesTitle")} />
            <div className="space-y-4 max-w-4xl">
              {notices.map(n => (
                <div key={n.id} className={`p-6 border-l-4 flex gap-5 ${
                  n.type === "warning" ? "bg-amber-50 border-amber-400" :
                  n.type === "success" ? "bg-emerald-50 border-emerald-400" :
                  n.type === "danger" ? "bg-red-50 border-red-400" :
                  "bg-blue-50 border-blue-400"
                }`}>
                  <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
                    n.type === "warning" ? "text-amber-500" :
                    n.type === "success" ? "text-emerald-500" :
                    n.type === "danger" ? "text-red-500" : "text-blue-500"
                  }`} />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 mb-1">{n.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">{n.body}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {new Date(n.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT & AI */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionHeader badge={t("contactBadge")} title={t("officeContacts")} />
              <div className="space-y-4">
                {CONTACTS.map((c, i) => (
                  <div key={i} className="group p-5 bg-white border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all grid sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-slate-800 group-hover:text-primary transition-colors">{c.dept}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1"><Clock size={9} />{c.hours}</p>
                    </div>
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-primary font-bold hover:underline">
                      <Mail size={12} className="shrink-0" /><span className="truncate">{c.email}</span>
                    </a>
                    <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                      <Phone size={12} className="shrink-0" />{c.phone}
                    </a>
                  </div>
                ))}
                <div className="flex gap-4 mt-6">
                  <Link href="/about/complaints" className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-colors">
                    <MessageSquare size={12} /> {t("lodgeComplaint")}
                  </Link>
                  <Link href="/contact" className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
                    <Headphones size={12} /> {t("contactHelpdesk")}
                  </Link>
                </div>
              </div>
            </div>
            <div>
              <SectionHeader badge={t("aiBadge")} title={t("askAssistant")} />
              <div className="bg-gradient-to-br from-primary-darker to-slate-900 text-white p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 flex items-center justify-center"><Bot size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t("aiPowered")}</div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{t("serviceAssistant")}</h3>
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-8">{t("aiBody")}</p>
                <div className="relative">
                  <input type="text" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                    placeholder={t("aiPlaceholder")}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary text-white placeholder-white/30 px-5 py-4 pr-14 text-sm font-medium outline-none transition-colors" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary flex items-center justify-center hover:bg-primary-darker transition-colors">
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{t("suggestedQuestions")}</p>
                  <div className="flex flex-wrap gap-2">
                    {AI_SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => setAiQuestion(s)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 text-xs text-slate-300 font-medium transition-all text-left">{s}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">{t("poweredByKb")}</p>
                  <Link href="/contact" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                    <Headphones size={12} /> {t("speakToHuman")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-primary-darker text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-white/50 text-[10px] font-black uppercase tracking-[0.25em]"><Shield size={10} /> {t("accountabilityBadge")}</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-serif">{t("ctaTitle")}<br />{t("ctaTitleAccent")}</h2>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-lg mx-auto">
              {t("ctaBody")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about/complaints" className="btn-primary text-xs tracking-widest uppercase py-3 px-8">{t("submitFeedback")}</Link>
              <button className="flex items-center gap-2 px-8 py-3 border border-white/30 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                <Download size={14} /> {t("downloadFull")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
