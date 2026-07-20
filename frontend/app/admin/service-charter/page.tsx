"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
  FileText, Video, HelpCircle, Megaphone, BarChart3, Shield,
  Eye, EyeOff, Save, X, Loader2, RefreshCw, AlertCircle,
  CheckCircle, Clock, BookOpen, ListOrdered
} from "lucide-react";
import { getApi, postApi, putApi, deleteApi, uploadFile } from "@/lib/api";
import PermissionGate from "@/components/admin/PermissionGate";

const API_BASE = "/service-charter";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Meta { total: number; page: number; limit: number; totalPages: number }
interface Paginated<T> { data: T[]; meta: Meta }
interface ServiceItem { id: string; category: string; service: string; timeline: string; unit: string; email: string; phone: string; docs: string[]; steps: string[]; faqs: string[]; status: string }
interface Video { id: string; title: string; category: string; duration: string; view_count: number; status: string; video_url?: string }
interface Document { id: string; title: string; file_type: string; category: string; version: string; download_count: number; status: string }
interface Faq { id: string; question: string; answer: string; category: string; is_active: boolean; view_count: number }
interface Notice { id: string; title: string; type: string; is_active: boolean }
interface Metric { id: string; key: string; label: string; value: string; sub_label: string; icon: string }

type Tab = "metrics" | "services" | "videos" | "documents" | "faqs" | "notices";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <p className="text-xs text-slate-400">
        {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}
          className="w-7 h-7 flex items-center justify-center border border-slate-200 hover:border-primary disabled:opacity-30 text-xs">
          <ChevronLeft size={12} />
        </button>
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
          .map((p, i, arr) => (
            <React.Fragment key={p}>
              {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 text-xs px-1">…</span>}
              <button onClick={() => onPageChange(p)}
                className={`w-7 h-7 flex items-center justify-center text-xs font-black border transition-colors ${p === meta.page ? "bg-primary text-white border-primary" : "border-slate-200 hover:border-primary"}`}>
                {p}
              </button>
            </React.Fragment>
          ))}
        <button onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}
          className="w-7 h-7 flex items-center justify-center border border-slate-200 hover:border-primary disabled:opacity-30 text-xs">
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700", published: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700", inactive: "bg-slate-50 text-slate-500",
    archived: "bg-slate-100 text-slate-400", info: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700", warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  };
  return <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${colors[color] || "bg-slate-50 text-slate-500"}`}>{text}</span>;
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors";
const textareaCls = `${inputCls} resize-none`;

// ─── METRICS PANEL ────────────────────────────────────────────────────────────

function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [editing, setEditing] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMetrics((await getApi(`${API_BASE}/metrics`)) || []); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await putApi(`${API_BASE}/metrics/${editing.id}`, editing);
      setEditing(null);
      load();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="py-12 text-center"><Loader2 className="mx-auto text-primary animate-spin" size={24} /></div>;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.id} className="border border-slate-100 p-5 group hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.key}</span>
              <button onClick={() => setEditing({ ...m })}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all"><Edit size={14} /></button>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{m.value}</div>
            <div className="text-xs font-black uppercase tracking-tight text-primary mt-1">{m.label}</div>
            <div className="text-[10px] text-slate-400 mt-1">{m.sub_label}</div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title="Edit Metric" onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Label"><input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} className={inputCls} /></Field>
            <Field label="Value (displayed)"><input value={editing.value} onChange={e => setEditing({ ...editing, value: e.target.value })} className={inputCls} placeholder="e.g. 98.4% or 4.2 hrs" /></Field>
            <Field label="Sub-label"><input value={editing.sub_label} onChange={e => setEditing({ ...editing, sub_label: e.target.value })} className={inputCls} /></Field>
            <Field label="Icon (Lucide name)"><input value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} className={inputCls} placeholder="Clock, Star, CheckCircle..." /></Field>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SERVICES PANEL ───────────────────────────────────────────────────────────

function ServicesPanel() {
  const [result, setResult] = useState<Paginated<ServiceItem> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Partial<ServiceItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const isNew = modal && !modal.id;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (search) params.set("search", search);
      setResult(await getApi(`${API_BASE}/items/admin/all?${params}`));
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { const t = setTimeout(() => { setPage(1); load(1); }, 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { load(); }, [page]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const payload = { ...modal, docs: modal.docs || [], steps: modal.steps || [], faqs: modal.faqs || [] };
      modal.id ? await putApi(`${API_BASE}/items/${modal.id}`, payload) : await postApi(`${API_BASE}/items`, payload);
      setModal(null); load(1);
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service item?")) return;
    await deleteApi(`${API_BASE}/items/${id}`);
    load(page);
  };

  const blankItem = (): Partial<ServiceItem> => ({ category: "", service: "", timeline: "", unit: "", email: "", phone: "", docs: [], steps: [], status: "active" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..."
            className="pl-8 pr-4 py-2 border border-slate-200 text-xs focus:outline-none focus:border-primary transition-colors w-64" />
        </div>
        <button onClick={() => setModal(blankItem())}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-colors">
          <Plus size={12} /> Add Service
        </button>
      </div>

      <div className="border border-slate-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>{["Service","Category","Timeline","Unit","Status",""].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center"><Loader2 size={20} className="mx-auto text-primary animate-spin" /></td></tr>
            ) : result?.data?.map(item => (
              <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-black text-slate-800 uppercase tracking-tight">{item.service}</td>
                <td className="px-4 py-3 text-slate-500">{item.category}</td>
                <td className="px-4 py-3 font-medium text-slate-600">{item.timeline}</td>
                <td className="px-4 py-3 text-slate-400 truncate max-w-[160px]">{item.unit}</td>
                <td className="px-4 py-3"><Badge text={item.status} color={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ ...item })} className="text-slate-400 hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => remove(item.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}

      {modal !== null && (
        <Modal title={isNew ? "Add Service Item" : "Edit Service Item"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Service Name"><input value={modal.service || ""} onChange={e => setModal({ ...modal, service: e.target.value })} className={inputCls} /></Field>
              <Field label="Category"><input value={modal.category || ""} onChange={e => setModal({ ...modal, category: e.target.value })} className={inputCls} placeholder="Admissions, Academic..." /></Field>
              <Field label="Timeline"><input value={modal.timeline || ""} onChange={e => setModal({ ...modal, timeline: e.target.value })} className={inputCls} placeholder="e.g. 5 Working Days" /></Field>
              <Field label="Unit / Office"><input value={modal.unit || ""} onChange={e => setModal({ ...modal, unit: e.target.value })} className={inputCls} /></Field>
              <Field label="Email"><input value={modal.email || ""} onChange={e => setModal({ ...modal, email: e.target.value })} className={inputCls} /></Field>
              <Field label="Phone"><input value={modal.phone || ""} onChange={e => setModal({ ...modal, phone: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Required Documents (one per line)">
              <textarea rows={4} value={(modal.docs || []).join("\n")} onChange={e => setModal({ ...modal, docs: e.target.value.split("\n").filter(Boolean) })} className={textareaCls} />
            </Field>
            <Field label="Process Steps (one per line)">
              <textarea rows={4} value={(modal.steps || []).join("\n")} onChange={e => setModal({ ...modal, steps: e.target.value.split("\n").filter(Boolean) })} className={textareaCls} />
            </Field>
            <Field label="Status">
              <select value={modal.status || "active"} onChange={e => setModal({ ...modal, status: e.target.value })} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {isNew ? "Create" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FAQs PANEL ──────────────────────────────────────────────────────────────

function FaqsPanel() {
  const [result, setResult] = useState<Paginated<Faq> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Partial<Faq> | null>(null);
  const [saving, setSaving] = useState(false);
  const isNew = modal && !modal.id;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (search) params.set("search", search);
      setResult(await getApi(`${API_BASE}/faqs/admin/all?${params}`));
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { const t = setTimeout(() => { setPage(1); load(1); }, 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { load(); }, [page]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      modal.id ? await putApi(`${API_BASE}/faqs/${modal.id}`, modal) : await postApi(`${API_BASE}/faqs`, modal);
      setModal(null); load(1);
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await deleteApi(`${API_BASE}/faqs/${id}`);
    load(page);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs..."
            className="pl-8 pr-4 py-2 border border-slate-200 text-xs focus:outline-none focus:border-primary transition-colors w-64" />
        </div>
        <button onClick={() => setModal({ question: "", answer: "", category: "", is_active: true })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-colors">
          <Plus size={12} /> Add FAQ
        </button>
      </div>

      <div className="border border-slate-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>{["Question","Category","Views","Active",""].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><Loader2 size={20} className="mx-auto text-primary animate-spin" /></td></tr>
            ) : result?.data?.map(faq => (
              <tr key={faq.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800 max-w-sm truncate">{faq.question}</td>
                <td className="px-4 py-3 text-slate-400">{faq.category}</td>
                <td className="px-4 py-3 text-slate-400">{faq.view_count}</td>
                <td className="px-4 py-3">{faq.is_active ? <CheckCircle size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-slate-300" />}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ ...faq })} className="text-slate-400 hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => remove(faq.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}

      {modal !== null && (
        <Modal title={isNew ? "Add FAQ" : "Edit FAQ"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Question"><textarea rows={2} value={modal.question || ""} onChange={e => setModal({ ...modal, question: e.target.value })} className={textareaCls} /></Field>
            <Field label="Answer"><textarea rows={5} value={modal.answer || ""} onChange={e => setModal({ ...modal, answer: e.target.value })} className={textareaCls} /></Field>
            <Field label="Category"><input value={modal.category || ""} onChange={e => setModal({ ...modal, category: e.target.value })} className={inputCls} placeholder="Admissions, Academic, ICT..." /></Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={modal.is_active ?? true} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-xs font-bold text-slate-600">Active (visible to public)</span>
            </label>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {isNew ? "Create" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── NOTICES PANEL ────────────────────────────────────────────────────────────

function NoticesPanel() {
  const [result, setResult] = useState<Paginated<Notice> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const isNew = modal && !modal.id;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try { setResult(await getApi(`${API_BASE}/notices/admin/all?page=${p}&limit=10`)); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [page]);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      modal.id ? await putApi(`${API_BASE}/notices/${modal.id}`, modal) : await postApi(`${API_BASE}/notices`, modal);
      setModal(null); load(1);
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    await deleteApi(`${API_BASE}/notices/${id}`);
    load(page);
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => setModal({ title: "", body: "", type: "info", is_active: true })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-colors">
          <Plus size={12} /> Add Notice
        </button>
      </div>

      <div className="border border-slate-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>{["Title","Type","Active",""].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><Loader2 size={20} className="mx-auto text-primary animate-spin" /></td></tr>
            ) : result?.data?.map(n => (
              <tr key={n.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{n.title}</td>
                <td className="px-4 py-3"><Badge text={n.type} color={n.type} /></td>
                <td className="px-4 py-3">{n.is_active ? <CheckCircle size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-slate-300" />}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ ...n })} className="text-slate-400 hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => remove(n.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}

      {modal !== null && (
        <Modal title={isNew ? "Add Notice" : "Edit Notice"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Title"><input value={modal.title || ""} onChange={e => setModal({ ...modal, title: e.target.value })} className={inputCls} /></Field>
            <Field label="Body"><textarea rows={4} value={modal.body || ""} onChange={e => setModal({ ...modal, body: e.target.value })} className={textareaCls} /></Field>
            <Field label="Type">
              <select value={modal.type || "info"} onChange={e => setModal({ ...modal, type: e.target.value })} className={inputCls}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={modal.is_active ?? true} onChange={e => setModal({ ...modal, is_active: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-xs font-bold text-slate-600">Active (visible to public)</span>
            </label>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {isNew ? "Create" : "Save"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DOCUMENTS PANEL ─────────────────────────────────────────────────────────

function DocumentsPanel() {
  const [result, setResult] = useState<Paginated<Document> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const isNew = modal && !modal.id;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "10" });
      if (search) params.set("search", search);
      setResult(await getApi(`${API_BASE}/documents/admin/all?${params}`));
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { const t = setTimeout(() => { setPage(1); load(1); }, 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { load(); }, [page]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await uploadFile(file);
      if (res?.url) {
        const ext = file.name.split('.').pop()?.toUpperCase() || "";
        if (ext !== 'PDF') {
          alert("Only PDF documents are allowed");
          setUploadingFile(false);
          return;
        }
        const file_type = 'PDF';
        
        // Calculate file size
        const sizeMB = file.size / (1024 * 1024);
        const file_size = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

        setModal({ ...modal, file_url: res.url, file_size, file_type });
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("File upload failed.");
    } finally {
      setUploadingFile(false);
    }
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      modal.id ? await putApi(`${API_BASE}/documents/${modal.id}`, modal) : await postApi(`${API_BASE}/documents`, modal);
      setModal(null); load(1);
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await deleteApi(`${API_BASE}/documents/${id}`);
    load(page);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
            className="pl-8 pr-4 py-2 border border-slate-200 text-xs focus:outline-none focus:border-primary transition-colors w-64" />
        </div>
        <button onClick={() => setModal({ title: "", file_type: "PDF", category: "", version: "v1.0", status: "published" })}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-colors">
          <Plus size={12} /> Add Document
        </button>
      </div>

      <div className="border border-slate-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>{["Title","Type","Category","Version","Downloads","Status",""].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center"><Loader2 size={20} className="mx-auto text-primary animate-spin" /></td></tr>
            ) : result?.data?.map(doc => (
              <tr key={doc.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{doc.title}</td>
                <td className="px-4 py-3"><Badge text={doc.file_type} color="info" /></td>
                <td className="px-4 py-3 text-slate-400">{doc.category}</td>
                <td className="px-4 py-3 text-slate-400">{doc.version}</td>
                <td className="px-4 py-3 text-slate-400">{doc.download_count}</td>
                <td className="px-4 py-3"><Badge text={doc.status} color={doc.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal({ ...doc })} className="text-slate-400 hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => remove(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result?.meta && <Pagination meta={result.meta} onPageChange={setPage} />}

      {modal !== null && (
        <Modal title={isNew ? "Add Document" : "Edit Document"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Title"><input value={modal.title || ""} onChange={e => setModal({ ...modal, title: e.target.value })} className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="File Type">
                <select value={modal.file_type || "PDF"} onChange={e => setModal({ ...modal, file_type: e.target.value })} className={inputCls}>
                  {["PDF","DOCX","XLSX","PPTX"].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="File Size"><input value={modal.file_size || ""} onChange={e => setModal({ ...modal, file_size: e.target.value })} className={inputCls} placeholder="e.g. 2.4 MB" /></Field>
              <Field label="Category"><input value={modal.category || ""} onChange={e => setModal({ ...modal, category: e.target.value })} className={inputCls} placeholder="Charter, Forms, Manuals..." /></Field>
              <Field label="Version"><input value={modal.version || ""} onChange={e => setModal({ ...modal, version: e.target.value })} className={inputCls} placeholder="v1.0" /></Field>
            </div>
            
            <Field label="Upload Document (PDF Only)">
              <div className="relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload} 
                  disabled={uploadingFile}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:border-0
                    file:text-xs file:font-black file:uppercase file:tracking-widest
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 transition-all
                    border border-slate-200"
                />
                {uploadingFile && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />}
              </div>
            </Field>

            <Field label="File URL (Auto-filled on upload)">
              <input 
                value={modal.file_url || ""} 
                onChange={e => setModal({ ...modal, file_url: e.target.value })} 
                className={inputCls} 
                placeholder="https://..." 
                disabled={modal.file_type !== "PDF"}
                title={modal.file_type !== "PDF" ? "Only PDF files can use direct URLs" : ""}
              />
            </Field>
            <Field label="Status">
              <select value={modal.status || "published"} onChange={e => setModal({ ...modal, status: e.target.value })} className={inputCls}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {isNew ? "Create" : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { key: "metrics", label: "Performance Metrics", icon: BarChart3 },
  { key: "services", label: "Service Standards", icon: ListOrdered },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "notices", label: "Notices", icon: Megaphone },
  { key: "documents", label: "Documents", icon: FileText },
];

export default function ServiceCharterAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("metrics");

  return (
    <PermissionGate permission="content.manage">
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Admin</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Service Charter</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Manage all service charter content from this panel.</p>
          </div>
          <Link href="/service-charter" target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-colors">
            <Eye size={12} /> View Public Page
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`p-4 text-left border transition-all ${activeTab === key ? "border-primary bg-primary/5" : "border-slate-100 bg-white hover:border-slate-200"}`}>
              <Icon size={16} className={activeTab === key ? "text-primary" : "text-slate-400"} />
              <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${activeTab === key ? "text-primary" : "text-slate-400"}`}>{label}</p>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white border border-slate-100 p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
              {TABS.find(t => t.key === activeTab)?.label}
            </h2>
          </div>

          {activeTab === "metrics" && <MetricsPanel />}
          {activeTab === "services" && <ServicesPanel />}
          {activeTab === "faqs" && <FaqsPanel />}
          {activeTab === "notices" && <NoticesPanel />}
          {activeTab === "documents" && <DocumentsPanel />}
        </div>
      </div>
    </PermissionGate>
  );
}
