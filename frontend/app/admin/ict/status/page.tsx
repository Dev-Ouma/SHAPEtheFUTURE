"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw, Plus, X, Loader2, Activity, CheckCircle2, AlertTriangle,
  Wrench, Server, Trash2, Pencil, Clock, Megaphone, ChevronRight, History,
  HardDrive, Cpu, Database,
} from "lucide-react";
import { getApi, postApi, putApi, deleteApi, API_URL } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SYSTEM_STATUS_META, INCIDENT_STATUS_COLORS, IMPACT_COLORS } from "../ict-ui";

const SYSTEM_STATUSES = ["Operational", "Degraded", "Partial Outage", "Major Outage", "Maintenance"];
const INCIDENT_STATUSES = ["Investigating", "Identified", "Monitoring", "Resolved"];
const MAINTENANCE_STATUSES = ["Scheduled", "In Progress", "Completed"];
const SEVERITY: Record<string, number> = { Operational: 0, Maintenance: 1, Degraded: 2, "Partial Outage": 3, "Major Outage": 4 };
const RESOLVED = ["Resolved", "Completed"];

export default function IctStatusBoard() {
  const [systems, setSystems] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [systemModal, setSystemModal] = useState<{ open: boolean; editing: any | null }>({ open: false, editing: null });
  const [incidentModal, setIncidentModal] = useState(false);
  const [openIncident, setOpenIncident] = useState<any | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, i, h] = await Promise.all([
        getApi("/ict/admin/systems"),
        getApi("/ict/admin/incidents"),
        // Terminus returns 503 (with the health body) when degraded, so read the body
        // directly rather than via getApi (which discards non-200 responses).
        fetch(`${API_URL}/ict/admin/system-health`, { credentials: "include", cache: "no-store" })
          .then((r) => r.json())
          .catch(() => null),
      ]);
      setSystems(Array.isArray(s) ? s : []);
      setIncidents(Array.isArray(i) ? i : []);
      setHealth(h);
    } catch {
      toast.error("Failed to load status board");
    } finally {
      setLoading(false);
    }
  };

  const overall = useMemo(() => {
    const active = (Array.isArray(systems) ? systems : []).filter((s) => s.is_active);
    if (!active.length) return "Operational";
    const worst = active.reduce((m, s) => Math.max(m, SEVERITY[s.status] ?? 0), 0);
    return Object.keys(SEVERITY).find((k) => SEVERITY[k] === worst) || "Operational";
  }, [systems]);

  const activeIncidents = (Array.isArray(incidents) ? incidents : []).filter((i) => !RESOLVED.includes(i.status) && i.type === "Incident");
  const maintenance = (Array.isArray(incidents) ? incidents : []).filter((i) => !RESOLVED.includes(i.status) && i.type === "Maintenance");
  const resolved = (Array.isArray(incidents) ? incidents : []).filter((i) => RESOLVED.includes(i.status)).slice(0, 5);
  const allOperational = overall === "Operational" && activeIncidents.length === 0;

  const setStatus = async (id: string, status: string) => {
    try {
      await putApi(`/ict/admin/systems/${id}/status`, { status });
      setSystems((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const removeSystem = async (id: string) => {
    if (!confirm("Remove this system from the board?")) return;
    try {
      await deleteApi(`/ict/admin/systems/${id}`);
      toast.success("System removed");
      fetchAll();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-1 font-serif tracking-tighter flex items-center gap-3">
            <Activity className="text-primary" size={28} /> System Status Board
          </h2>
          <p className="text-slate-500 font-medium text-sm">Live operational status, incidents & scheduled maintenance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIncidentModal(true)} className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:text-primary rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest transition-all">
            <Megaphone size={16} /> Report Incident
          </button>
          <button onClick={() => setSystemModal({ open: true, editing: null })} className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-all">
            <Plus size={16} /> Add System
          </button>
          <button onClick={fetchAll} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all rounded-2xl shadow-sm">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Overall banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl flex items-center justify-between shadow-lg ${allOperational ? "bg-emerald-600" : overall === "Major Outage" ? "bg-red-900" : overall === "Maintenance" ? "bg-blue-700" : "bg-amber-600"} text-white`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            {allOperational ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} className="animate-pulse" />}
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">{allOperational ? "All Systems Operational" : `Service Disruption — ${SYSTEM_STATUS_META[overall]?.label || overall}`}</p>
            <p className="text-[10px] uppercase font-bold opacity-70 mt-0.5">
              {activeIncidents.length} active incident{activeIncidents.length !== 1 ? "s" : ""} · {maintenance.length} scheduled maintenance · Updated {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Systems grid */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Server size={14} /> Monitored Systems</h3>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-300"><RefreshCw className="animate-spin" size={32} /><span className="text-[10px] font-black uppercase tracking-widest">Loading...</span></div>
        ) : systems.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Server size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No systems yet — add LMS, Email, Portal, Network…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systems.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 ${s.is_active ? "border-slate-100" : "border-dashed border-slate-200 opacity-60"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${SYSTEM_STATUS_META[s.status]?.dot || "bg-slate-300"} ${s.status !== "Operational" ? "animate-pulse" : ""}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-primary-darker truncate">{s.name}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.category || "Uncategorized"}{!s.is_active && " · Hidden"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)}
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${SYSTEM_STATUS_META[s.status]?.badge || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {SYSTEM_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <button onClick={() => setSystemModal({ open: true, editing: s })} className="p-1.5 text-slate-400 hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => removeSystem(s.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Infrastructure health (same data as admin Observability) */}
      <InfraHealthPanel health={health} loading={loading} />

      {/* Active incidents */}
      <IncidentSection title="Active Incidents" icon={<AlertTriangle size={14} className="text-red-500" />} items={activeIncidents} empty="No active incidents 🎉" onOpen={setOpenIncident} />
      {/* Maintenance */}
      <IncidentSection title="Scheduled Maintenance" icon={<Wrench size={14} className="text-blue-500" />} items={maintenance} empty="No maintenance scheduled" onOpen={setOpenIncident} />
      {/* Recently resolved */}
      <IncidentSection title="Recently Resolved" icon={<CheckCircle2 size={14} className="text-emerald-500" />} items={resolved} empty="Nothing resolved recently" onOpen={setOpenIncident} muted />

      <AnimatePresence>
        {systemModal.open && <SystemModal editing={systemModal.editing} onClose={() => setSystemModal({ open: false, editing: null })} onSaved={() => { setSystemModal({ open: false, editing: null }); fetchAll(); }} />}
        {incidentModal && <IncidentModal systems={systems} onClose={() => setIncidentModal(false)} onSaved={() => { setIncidentModal(false); fetchAll(); }} />}
        {openIncident && <IncidentDetailModal incident={openIncident} onClose={() => setOpenIncident(null)} onChanged={() => { setOpenIncident(null); fetchAll(); }} />}
      </AnimatePresence>
    </div>
  );
}

const HEALTH_ICONS: Record<string, React.ReactNode> = {
  database: <Database size={16} />,
  memory_heap: <Cpu size={16} />,
  memory_rss: <Cpu size={16} />,
  disk_space: <HardDrive size={16} />,
};

function InfraHealthPanel({ health, loading }: { health: any; loading: boolean }) {
  if (loading) return null;
  if (!health) {
    return (
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Server size={14} /> Infrastructure Health</h3>
        <p className="text-xs text-slate-300 font-bold uppercase tracking-widest px-4 py-3 bg-slate-50 rounded-xl">Infrastructure metrics unavailable</p>
      </div>
    );
  }
  // Terminus shape: { status, info: {...}, error: {...}, details: {...} }
  const details = health.details || { ...(health.info || {}), ...(health.error || {}) };
  const overallOk = health.status === "ok";
  const fmt = (k: string, v: any) =>
    typeof v === "number" ? (v > 1024 * 1024 ? `${(v / 1024 / 1024).toFixed(0)} MB` : String(v)) : String(v);

  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
        <Server size={14} /> Infrastructure Health
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${overallOk ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
          {overallOk ? "Healthy" : "Degraded"}
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(details).map(([key, val]: [string, any]) => {
          const up = val?.status === "up";
          return (
            <div key={key} className={`bg-white border rounded-2xl p-4 shadow-sm ${up ? "border-slate-100" : "border-red-200 bg-red-50/40"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${up ? "bg-slate-50 text-primary" : "bg-red-100 text-red-600"}`}>{HEALTH_ICONS[key] || <Server size={16} />}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${up ? "text-emerald-600" : "text-red-600"}`}>{val?.status || "?"}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 capitalize">{key.replace(/_/g, " ")}</p>
              <div className="mt-1 space-y-0.5">
                {Object.entries(val || {}).filter(([k]) => k !== "status").map(([k, v]) => (
                  <p key={k} className="text-[10px] text-slate-400 flex justify-between gap-2">
                    <span className="capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="font-bold text-slate-600 truncate max-w-[100px]" title={String(v)}>{fmt(k, v)}</span>
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IncidentSection({ title, icon, items, empty, onOpen, muted }: { title: string; icon: React.ReactNode; items: any[]; empty: string; onOpen: (i: any) => void; muted?: boolean }) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">{icon} {title} <span className="text-slate-300">({items.length})</span></h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-300 font-bold uppercase tracking-widest px-4 py-3 bg-slate-50 rounded-xl">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <button key={it.id} onClick={() => onOpen(it)}
              className={`w-full text-left bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all group flex items-center justify-between gap-3 ${muted ? "opacity-75" : ""}`}>
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-1.5 h-12 rounded-full shrink-0 ${IMPACT_COLORS[it.impact]?.replace("text-", "bg-") || "bg-slate-300"}`} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${INCIDENT_STATUS_COLORS[it.status] || "bg-slate-100 text-slate-500"}`}>{it.status}</span>
                    {it.system && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500">{it.system.name}</span>}
                    <span className={`text-[9px] font-black ${IMPACT_COLORS[it.impact] || "text-slate-400"}`}>{it.impact}</span>
                  </div>
                  <p className="text-sm font-black text-primary-darker truncate group-hover:text-primary transition-colors">{it.title}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                    {it.type === "Maintenance" && it.starts_at ? `Window: ${new Date(it.starts_at).toLocaleString()}` : `${(it.updates || []).length} update${(it.updates || []).length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-primary shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-slate-50 p-3 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 border border-slate-100";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</label>{children}</div>;
}
function Shell({ title, icon, onClose, children, footer }: { title: string; icon: React.ReactNode; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-black text-primary-darker flex items-center gap-2">{icon} {title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white">{footer}</div>
      </motion.div>
    </motion.div>
  );
}

function SystemModal({ editing, onClose, onSaved }: { editing: any | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!editing;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    name: editing?.name || "", category: editing?.category || "", description: editing?.description || "",
    status: editing?.status || "Operational", order: editing?.order ?? 0, is_active: editing?.is_active ?? true,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (isEdit) await putApi(`/ict/admin/systems/${editing.id}`, payload);
      else await postApi("/ict/admin/systems", payload);
      toast.success(isEdit ? "System updated" : "System added");
      onSaved();
    } catch {
      toast.error("Failed to save system");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell title={isEdit ? "Edit System" : "Add System"} icon={<Server size={18} className="text-primary" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest">Cancel</button>
        <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {isEdit ? "Save" : "Add"}
        </button>
      </>}>
      <Field label="Name *"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="e.g. Learning Management System" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category"><input value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="Academic, Infrastructure…" /></Field>
        <Field label="Initial Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Description"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Display Order"><input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className={inputCls} /></Field>
        <label className="flex items-center gap-2 p-3 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visible on board</span>
        </label>
      </div>
    </Shell>
  );
}

function IncidentModal({ systems, onClose, onSaved }: { systems: any[]; onClose: () => void; onSaved: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    title: "", type: "Incident", impact: "Minor", system_id: "", message: "",
    system_status: "", starts_at: "", ends_at: "",
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const isMaint = form.type === "Maintenance";

  const submit = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, type: form.type, impact: isMaint ? "Maintenance" : form.impact };
      if (form.system_id) payload.system_id = form.system_id;
      if (form.message) payload.message = form.message;
      if (form.system_status) payload.system_status = form.system_status;
      if (isMaint && form.starts_at) payload.starts_at = new Date(form.starts_at).toISOString();
      if (isMaint && form.ends_at) payload.ends_at = new Date(form.ends_at).toISOString();
      await postApi("/ict/admin/incidents", payload);
      toast.success(isMaint ? "Maintenance scheduled" : "Incident reported");
      onSaved();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell title={isMaint ? "Schedule Maintenance" : "Report Incident"} icon={<Megaphone size={18} className="text-primary" />} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest">Cancel</button>
        <button onClick={submit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Publish
        </button>
      </>}>
      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl w-fit">
        {["Incident", "Maintenance"].map((t) => (
          <button key={t} onClick={() => set("type", t)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${form.type === t ? "bg-primary text-white shadow" : "text-slate-400"}`}>{t}</button>
        ))}
      </div>
      <Field label="Title *"><input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder={isMaint ? "e.g. LMS upgrade window" : "e.g. Email delivery delays"} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Affected System">
          <select value={form.system_id} onChange={(e) => set("system_id", e.target.value)} className={inputCls}>
            <option value="">None / General</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        {!isMaint && (
          <Field label="Impact">
            <select value={form.impact} onChange={(e) => set("impact", e.target.value)} className={inputCls}>
              {["Minor", "Major", "Critical"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
        {isMaint && (
          <Field label="Set System To">
            <select value={form.system_status} onChange={(e) => set("system_status", e.target.value)} className={inputCls}>
              <option value="">Leave unchanged</option>
              {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        )}
      </div>
      {isMaint && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts"><input type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={inputCls} /></Field>
          <Field label="Ends"><input type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={inputCls} /></Field>
        </div>
      )}
      {!isMaint && (
        <Field label="Set System To (optional)">
          <select value={form.system_status} onChange={(e) => set("system_status", e.target.value)} className={inputCls}>
            <option value="">Leave unchanged</option>
            {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <Field label="Initial Message"><textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} className={inputCls} placeholder="What's happening and what you're doing about it…" /></Field>
    </Shell>
  );
}

function IncidentDetailModal({ incident, onClose, onChanged }: { incident: any; onClose: () => void; onChanged: () => void }) {
  const isMaint = incident.type === "Maintenance";
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(incident.status);
  const [systemStatus, setSystemStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const statusOptions = isMaint ? MAINTENANCE_STATUSES : INCIDENT_STATUSES;

  const addUpdate = async () => {
    if (!message.trim()) { toast.error("Update message is required"); return; }
    setSubmitting(true);
    try {
      const payload: any = { message, status };
      if (systemStatus) payload.system_status = systemStatus;
      await postApi(`/ict/admin/incidents/${incident.id}/updates`, payload);
      toast.success("Update posted");
      onChanged();
    } catch {
      toast.error("Failed to post update");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this incident permanently?")) return;
    try {
      await deleteApi(`/ict/admin/incidents/${incident.id}`);
      toast.success("Deleted");
      onChanged();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <Shell title={incident.title} icon={isMaint ? <Wrench size={18} className="text-primary" /> : <AlertTriangle size={18} className="text-primary" />} onClose={onClose}
      footer={<>
        <button onClick={remove} className="mr-auto flex items-center gap-1 px-3 py-2.5 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest"><Trash2 size={14} /> Delete</button>
        <button onClick={onClose} className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-widest">Close</button>
        <button onClick={addUpdate} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Post Update
        </button>
      </>}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${INCIDENT_STATUS_COLORS[incident.status] || "bg-slate-100 text-slate-500"}`}>{incident.status}</span>
        {incident.system && <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">{incident.system.name}</span>}
        <span className={`text-[9px] font-black ${IMPACT_COLORS[incident.impact] || "text-slate-400"}`}>{incident.impact}</span>
        {incident.starts_at && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Clock size={10} />{new Date(incident.starts_at).toLocaleString()}</span>}
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><History size={11} /> Timeline</p>
        <div className="space-y-2">
          {(incident.updates || []).length === 0 && <p className="text-xs text-slate-300 font-bold py-2">No updates yet.</p>}
          {[...(incident.updates || [])].reverse().map((u: any, i: number) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${INCIDENT_STATUS_COLORS[u.status] || "bg-slate-100 text-slate-500"}`}>{u.status}</span>
                <span className="text-[9px] font-bold text-slate-400">{new Date(u.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600">{u.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add update */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Post an Update</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="New Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          {incident.system && (
            <Field label="System Status">
              <select value={systemStatus} onChange={(e) => setSystemStatus(e.target.value)} className={inputCls}>
                <option value="">Unchanged</option>
                {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          )}
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} placeholder="Progress update…" />
      </div>
    </Shell>
  );
}

