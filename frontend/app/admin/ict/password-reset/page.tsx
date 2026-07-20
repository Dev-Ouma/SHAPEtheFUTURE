"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  KeyRound, Search, Loader2, Mail, ShieldCheck, Unlock, User, Copy,
  AlertTriangle, CheckCircle2, LockKeyhole, PauseCircle, PlayCircle,
  PackagePlus, Clock, X, Shield,
} from "lucide-react";
import { getApi, postApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function IctAccountAssist() {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);

  // Grant form
  const [grantModuleId, setGrantModuleId] = useState("");
  const [grantDays, setGrantDays] = useState(7);
  const [grantReason, setGrantReason] = useState("");

  useEffect(() => {
    getApi("/ict/admin/password/modules").then((d) => setModules(Array.isArray(d) ? d : []));
  }, []);

  const groupedModules = useMemo(() => {
    const g: Record<string, any[]> = {};
    modules.forEach((m) => { const k = m.slug.split(".")[0]; (g[k] = g[k] || []).push(m); });
    return g;
  }, [modules]);

  const lookup = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) { toast.error("Enter an email or username"); return; }
    setLoading(true);
    setAccount(null);
    setTempPassword(null);
    try {
      const data = await getApi(`/ict/admin/password/lookup?query=${encodeURIComponent(term)}`);
      if (data?.id) setAccount(data);
      else toast.error("No account found for that email or username");
    } catch {
      toast.error("No account found for that email or username");
    } finally {
      setLoading(false);
    }
  };

  // Silent re-fetch after an action (e.g. re-pulling failed-login count after
  // an unlock). Deliberately does NOT go through lookup()'s reset — lookup()
  // clears tempPassword/account, which would immediately wipe a just-provisioned
  // password banner before the admin can read or copy it.
  const refresh = async () => {
    if (!account) return;
    try {
      const data = await getApi(`/ict/admin/password/lookup?query=${encodeURIComponent(account.email)}`);
      if (data?.id) setAccount(data);
    } catch {
      // Keep showing the last known account state; the action's own toast already reported success/failure.
    }
  };

  const action = async (kind: string, body?: any) => {
    setBusy(kind);
    setTempPassword(null);
    try {
      const res = await postApi(`/ict/admin/password/${kind}`, { query: account.email, ...body });
      const messages: Record<string, string> = {
        "reset-link": `Reset link sent to ${account.email}`,
        provision: "Temporary password provisioned & emailed",
        unlock: "Account unlocked & reactivated",
        suspend: "Account paused (suspended)",
        reactivate: "Account reactivated",
        "grant-module": "Module granted",
        "revoke-grant": "Grant revoked",
      };
      if (kind === "provision") setTempPassword(res?.temporary_password || null);
      toast.success(messages[kind] || "Done");
      if (kind === "grant-module") { setGrantModuleId(""); setGrantReason(""); }
      refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  };

  const grant = () => {
    if (!grantModuleId) { toast.error("Pick a module to grant"); return; }
    action("grant-module", { permission_id: grantModuleId, days: Number(grantDays) || 1, reason: grantReason || undefined });
  };

  const copyTemp = () => { if (tempPassword) { navigator.clipboard.writeText(tempPassword); toast.success("Copied"); } };
  const isSuspended = account?.account_status === "suspended";

  return (
    <div className="space-y-6 pb-24 max-w-3xl">
      <div>
        <h2 className="text-3xl font-black text-primary-darker mb-1 font-serif tracking-tighter flex items-center gap-3">
          <KeyRound className="text-primary" size={28} /> Account Assist Desk
        </h2>
        <p className="text-slate-500 font-medium text-sm">Reset access, pause accounts, and grant temporary modules for a task — using the same identity records as User Management.</p>
      </div>

      {/* Lookup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="Search by email or username..."
            className="w-full bg-slate-50 p-3 pl-10 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400" />
        </div>
        <button onClick={() => lookup()} disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-all">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Look Up
        </button>
      </div>

      {account && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Identity */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><User size={22} /></div>
              <div className="min-w-0">
                <p className="text-lg font-black text-primary-darker truncate">{account.full_name}</p>
                <p className="text-sm text-slate-500 truncate flex items-center gap-1"><Mail size={13} />{account.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${isSuspended ? "bg-red-50 text-red-600 border-red-200" : account.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {isSuspended ? "Suspended" : account.is_active ? "Active" : "Inactive"}
              </span>
              {account.is_locked && <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1"><LockKeyhole size={9} /> Locked</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[9px] font-black uppercase tracking-widest pt-2 border-t border-slate-100">
            <div><span className="block text-slate-400">Role</span><span className="text-slate-700 normal-case tracking-normal text-sm flex items-center gap-1"><Shield size={12} className="text-primary" />{account.role}</span></div>
            <div><span className="block text-slate-400">Username</span><span className="text-slate-700 normal-case tracking-normal text-sm">{account.username || "—"}</span></div>
            <div><span className="block text-slate-400">Failed Logins</span><span className="text-slate-700 normal-case tracking-normal text-sm">{account.login_attempts ?? 0}</span></div>
            <div><span className="block text-slate-400">Last Login</span><span className="text-slate-700 normal-case tracking-normal text-sm">{account.last_login_at ? new Date(account.last_login_at).toLocaleDateString() : "Never"}</span></div>
          </div>

          {tempPassword && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1 mb-1"><CheckCircle2 size={11} /> Temporary password (also emailed)</p>
                <p className="font-mono text-lg font-black text-emerald-800">{tempPassword}</p>
              </div>
              <button onClick={copyTemp} className="p-2.5 bg-white rounded-xl text-emerald-600 hover:bg-emerald-100 transition-all"><Copy size={16} /></button>
            </div>
          )}

          {/* Password & access actions */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Access</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <ActionBtn onClick={() => action("reset-link")} busy={busy === "reset-link"} icon={<Mail size={14} />} label="Reset Link" />
              <ActionBtn onClick={() => action("provision")} busy={busy === "provision"} icon={<ShieldCheck size={14} />} label="Temp Password" primary />
              <ActionBtn onClick={() => action("unlock")} busy={busy === "unlock"} icon={<Unlock size={14} />} label="Unlock" amber />
              {isSuspended
                ? <ActionBtn onClick={() => action("reactivate")} busy={busy === "reactivate"} icon={<PlayCircle size={14} />} label="Reactivate" emerald />
                : <ActionBtn onClick={() => action("suspend")} busy={busy === "suspend"} icon={<PauseCircle size={14} />} label="Pause" red />}
            </div>
          </div>

          {/* Temporary modules */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><PackagePlus size={12} className="text-primary" /> Temporary Modules</p>

            {/* Active grants */}
            {(account.temporary_grants || []).length > 0 ? (
              <div className="space-y-2">
                {account.temporary_grants.map((g: any) => (
                  <div key={g.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{g.permission?.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> Expires {new Date(g.expires_at).toLocaleString()}{g.reason ? ` · ${g.reason}` : ""}
                      </p>
                    </div>
                    <button onClick={() => action("revoke-grant", { grant_id: g.id })} disabled={busy === "revoke-grant"}
                      className="p-2 text-slate-400 hover:text-red-500 shrink-0"><X size={16} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">No active temporary grants.</p>
            )}

            {/* Grant form */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end pt-1">
              <div className="sm:col-span-6">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Module</label>
                <select value={grantModuleId} onChange={(e) => setGrantModuleId(e.target.value)} className={inputCls}>
                  <option value="">Select a module…</option>
                  {Object.entries(groupedModules).map(([mod, perms]) => (
                    <optgroup key={mod} label={mod}>
                      {perms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Days</label>
                <input type="number" min={1} max={365} value={grantDays} onChange={(e) => setGrantDays(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="sm:col-span-3">
                <button onClick={grant} disabled={busy === "grant-module"}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker disabled:opacity-50 transition-all">
                  {busy === "grant-module" ? <Loader2 size={14} className="animate-spin" /> : <PackagePlus size={14} />} Grant
                </button>
              </div>
              <div className="sm:col-span-12">
                <input value={grantReason} onChange={(e) => setGrantReason(e.target.value)} placeholder="Reason (optional) — e.g. covering for colleague this week" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
            <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <p>Verify identity before changing access. Temporary modules are added to the user's permissions and auto-removed when they expire. Provisioned passwords expire in 24 hours and must be changed at first login.</p>
          </div>
        </motion.div>
      )}

      {!account && !loading && (
        <div className="py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-6 bg-white w-fit mx-auto rounded-full shadow-sm mb-4"><KeyRound size={32} className="text-slate-200" /></div>
          <h5 className="text-lg font-black text-primary-darker uppercase tracking-tighter">Look Up an Account</h5>
          <p className="text-xs text-slate-400 font-medium mt-1">Search by email or username to begin.</p>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-slate-50 p-3 rounded-xl font-medium text-sm text-primary-darker focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 border border-slate-100";

function ActionBtn({ onClick, busy, icon, label, primary, amber, red, emerald }: { onClick: () => void; busy: boolean; icon: React.ReactNode; label: string; primary?: boolean; amber?: boolean; red?: boolean; emerald?: boolean }) {
  const cls = primary ? "bg-primary text-white hover:bg-primary-darker"
    : amber ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
    : red ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
    : emerald ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200";
  return (
    <button onClick={onClick} disabled={busy}
      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all ${cls}`}>
      {busy ? <Loader2 size={14} className="animate-spin" /> : icon} {label}
    </button>
  );
}
