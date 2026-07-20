"use client";

import React, { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle, Clock, Calendar, ExternalLink, CheckCircle, Activity, Database, Globe } from "lucide-react";
import PermissionGate from "@/components/admin/PermissionGate";
import { API_URL } from "@/lib/api";

async function getSettings() {
    try {
        const r = await fetch(`${API_URL}/settings`, { cache: "no-store", credentials: "include" });
        return r.ok ? r.json() : {};
    } catch { return {}; }
}

interface PlannerStatus { schools: number; ok: boolean; latency: number; }

async function pingPlanner(): Promise<PlannerStatus> {
    const t0 = Date.now();
    try {
        const r = await fetch(`${API_URL}/timetables/schools`, { credentials: "include" });
        const data = r.ok ? await r.json() : [];
        return { ok: r.ok, schools: Array.isArray(data) ? data.length : 0, latency: Date.now() - t0 };
    } catch { return { ok: false, schools: 0, latency: Date.now() - t0 }; }
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${accent ? "bg-[#00a3a1]/5 border-[#00a3a1]/20" : "bg-white border-slate-100"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? "bg-[#00a3a1]/10 text-[#00a3a1]" : "bg-slate-100 text-slate-400"}`}>
                {icon}
            </div>
            <div>
                <div className="text-lg font-black text-primary-darker">{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
            </div>
        </div>
    );
}

// ─── URL field ────────────────────────────────────────────────────────────────

function UrlField({ label, description, value, onChange, href }: {
    label: string; description: string; value: string;
    onChange: (v: string) => void; href: string;
}) {
    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
            <div className="flex gap-2">
                <input type="url" value={value} onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-[#00a3a1] rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all"
                />
                <a href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                    <ExternalLink size={14} /> Test
                </a>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TimetablesConfigPage() {
    return (
        <PermissionGate permission="settings.view">
            <TimetablesConfigPageInner />
        </PermissionGate>
    );
}

function TimetablesConfigPageInner() {
    const [settings, setSettings] = useState<any>({
        timetable_url: "https://planner.ouk.ac.ke/timetable",
        examination_url: "https://planner.ouk.ac.ke/examinations",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [status, setStatus] = useState<PlannerStatus | null>(null);
    const [pinging, setPinging] = useState(false);

    useEffect(() => {
        getSettings().then(data => {
            setSettings((prev: any) => ({ ...prev, ...data }));
            setLoading(false);
        });
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setPinging(true);
        const s = await pingPlanner();
        setStatus(s);
        setPinging(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const keys = ["timetable_url", "examination_url"];
            await Promise.all(keys.map(key =>
                fetch(`${API_URL}/settings/${key}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ value: settings[key] }),
                })
            ));
            setMessage({ type: "success", text: "Settings saved and applied successfully." });
        } catch {
            setMessage({ type: "error", text: "Failed to save settings. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-slate-400" size={28} />
        </div>
    );

    return (
        <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#00a3a1] mb-1">Admin Panel</p>
                    <h2 className="text-2xl font-black text-primary-darker tracking-tight">Timetables Configuration</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage the OUK Planner integration and scraper settings.</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2.5 bg-primary text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-[#ff7f50] hover:text-white shadow-xl shadow-slate-900/10 self-start sm:self-auto">
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </div>

            {/* Status message */}
            {message.text && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            {/* Planner status strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<Activity size={18} />} label="Planner Status"
                    value={pinging ? <RefreshCw size={16} className="animate-spin text-slate-400" /> : status?.ok ? <span className="text-emerald-600">Online</span> : <span className="text-red-500">Offline</span>}
                    accent={status?.ok}
                />
                <StatCard icon={<Database size={18} />} label="Schools Loaded" value={status?.schools ?? "—"} />
                <StatCard icon={<Globe size={18} />} label="Latency" value={status ? `${status.latency}ms` : "—"} />
                <div className="col-span-2 sm:col-span-1 flex items-center">
                    <button onClick={checkStatus} disabled={pinging}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-2xl px-4 py-3.5 text-xs font-bold transition-all hover:shadow-sm">
                        <RefreshCw size={14} className={pinging ? "animate-spin" : ""} /> Refresh Status
                    </button>
                </div>
            </div>

            {/* Config cards */}
            <div className="grid sm:grid-cols-2 gap-6">
                {/* Class Timetable URL */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-5">
                        <Clock size={80} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#00a3a1]/10 rounded-xl flex items-center justify-center text-[#00a3a1]">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-primary-darker">Class Timetable</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Planner module URL</p>
                        </div>
                    </div>
                    <UrlField
                        label="Timetable URL"
                        description="Base URL of the OUK Class Timetable planner. The scraper appends school_id, programme_id and level params."
                        value={settings.timetable_url || ""}
                        onChange={v => setSettings((p: any) => ({ ...p, timetable_url: v }))}
                        href={settings.timetable_url || "#"}
                    />
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Endpoints</p>
                        {[
                            `${settings.timetable_url}?school_id=1&programme_id=1&level=1.1`,
                            `${API_URL}/timetables/schools`,
                            `${API_URL}/timetables/class`,
                        ].map(ep => (
                            <p key={ep} className="text-[10px] font-mono text-slate-500 truncate">{ep}</p>
                        ))}
                    </div>
                </div>

                {/* Examinations URL */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-5">
                        <Calendar size={80} />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-primary-darker">Examinations</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Exams portal URL</p>
                        </div>
                    </div>
                    <UrlField
                        label="Examinations URL"
                        description="Base URL of the OUK Examinations portal. The scraper parses the exam schedule table from this page."
                        value={settings.examination_url || ""}
                        onChange={v => setSettings((p: any) => ({ ...p, examination_url: v }))}
                        href={settings.examination_url || "#"}
                    />
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Endpoints</p>
                        {[
                            `${settings.examination_url}?school_id=1`,
                            `${API_URL}/timetables/exams`,
                            `${API_URL}/timetables/levels`,
                        ].map(ep => (
                            <p key={ep} className="text-[10px] font-mono text-slate-500 truncate">{ep}</p>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it works */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-primary-darker mb-5">How the Scraper Works</h3>
                <div className="grid sm:grid-cols-4 gap-4">
                    {[
                        { step: "1", title: "Student selects filters", desc: "School → Programme → Level/Semester chosen on the public timetables page" },
                        { step: "2", title: "Backend fetches planner", desc: "NestJS service hits the planner URL with filter params and parses the HTML response" },
                        { step: "3", title: "Cheerio parses HTML", desc: "Lesson cards, instructor images, course codes, delivery mode and session times are extracted" },
                        { step: "4", title: "JSON served to frontend", desc: "Structured data returned to the React UI and rendered in a premium grid or list view" },
                    ].map(s => (
                        <div key={s.step} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary-darker text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                            <div>
                                <p className="text-xs font-black text-slate-800">{s.title}</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sync notice */}
            <div className="bg-primary-darker rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#00a3a1]/20 rounded-2xl flex items-center justify-center text-[#00a3a1] flex-shrink-0">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#00a3a1] mb-1">Real-time Sync</p>
                        <p className="text-xs text-slate-400">Changes are applied immediately — no cache invalidation or rebuild required.</p>
                    </div>
                </div>
                <a href="/academics/timetables" target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-black text-white bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap">
                    <ExternalLink size={14} /> View Public Page
                </a>
            </div>
        </div>
    );
}
