"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Save, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL, getAdminAuthHeaders } from "@/lib/api";
import PermissionGate from "@/components/admin/PermissionGate";
const AVAILABLE_MODULES = [
  "programmes", "short-courses", "research", "staff", "alumni", "students", "news", "tenders", "library", "about", "academics", "admissions"
];

export default function MaintenanceSettingsPage() {
  return (
    <PermissionGate permission={["settings.view", "settings.manage"]}>
      <MaintenanceSettingsPageInner />
    </PermissionGate>
  );
}

function MaintenanceSettingsPageInner() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    mode: "LIVE",
    message: "",
    starts_at: "",
    ends_at: "",
    is_emergency: false,
    allowed_modules: [] as string[]
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/maintenance/settings`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          ...data,
          starts_at: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : "",
          ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : "",
          allowed_modules: data.allowed_modules || []
        });
      }
    } catch (e) {
      toast.error("Failed to load maintenance settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (emergency = false) => {
    setSaving(true);
    try {
      const payload = emergency 
        ? { mode: "FULL", is_emergency: true }
        : {
            mode: settings.mode,
            message: settings.message,
            is_emergency: false,
            allowed_modules: settings.allowed_modules,
            ...(settings.starts_at ? { starts_at: new Date(settings.starts_at).toISOString() } : {}),
            ...(settings.ends_at ? { ends_at: new Date(settings.ends_at).toISOString() } : {})
          };

      const res = await fetch(`${API_URL}/maintenance/settings`, {
        method: "POST",
        headers: getAdminAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(emergency ? "EMERGENCY LOCKDOWN ACTIVATED" : "Settings saved successfully");
        fetchSettings();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (module: string) => {
    setSettings(prev => ({
      ...prev,
      allowed_modules: prev.allowed_modules.includes(module)
        ? prev.allowed_modules.filter(m => m !== module)
        : [...prev.allowed_modules, module]
    }));
  };

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Wrench className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Maintenance Engine</h1>
            <p className="text-slate-500 text-sm">Operational control for public routing and site availability.</p>
          </div>
        </div>
        
        <button 
          onClick={() => saveSettings(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-red-600/20"
        >
          <ShieldAlert size={20} />
          <span>EMERGENCY LOCKDOWN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">Operation Mode</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'LIVE', label: 'Live', desc: 'All systems operational', color: 'bg-green-50 text-green-700 border-green-200 ring-green-500' },
                  { id: 'PARTIAL', label: 'Partial', desc: 'Selective modules only', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500' },
                  { id: 'FULL', label: 'Maintenance', desc: 'Total public block', color: 'bg-red-50 text-red-700 border-red-200 ring-red-500' }
                ].map(mode => (
                  <div 
                    key={mode.id}
                    onClick={() => setSettings({...settings, mode: mode.id})}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      settings.mode === mode.id 
                        ? mode.color + ' ring-2 ring-offset-2' 
                        : 'bg-white border-slate-200 hover:border-primary text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-black uppercase tracking-tight text-sm md:text-base break-words truncate">{mode.label}</span>
                      {settings.mode === mode.id && <CheckCircle2 size={18} className="shrink-0" />}
                    </div>
                    <p className="text-xs opacity-80">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Public Message</label>
              <textarea 
                value={settings.message || ''}
                onChange={e => setSettings({...settings, message: e.target.value})}
                placeholder="We're currently performing operational maintenance..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Scheduled Start</label>
                <input 
                  type="datetime-local"
                  value={settings.starts_at}
                  onChange={e => setSettings({...settings, starts_at: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Scheduled End</label>
                <input 
                  type="datetime-local"
                  value={settings.ends_at}
                  onChange={e => setSettings({...settings, ends_at: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center"><AlertTriangle size={14} className="mr-2 text-yellow-500" /> If scheduled, system auto-switches mode based on these times.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-100 transition-opacity ${settings.mode !== 'PARTIAL' ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">Allowed Modules</h2>
            <p className="text-xs text-slate-500 mb-6">Select which sections remain accessible during Partial Maintenance.</p>
            
            <div className="space-y-3">
              {AVAILABLE_MODULES.map(module => (
                <label key={module} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                  <input 
                    type="checkbox"
                    checked={settings.allowed_modules.includes(module)}
                    onChange={() => toggleModule(module)}
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-slate-700 capitalize">{module.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={() => saveSettings(false)}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
