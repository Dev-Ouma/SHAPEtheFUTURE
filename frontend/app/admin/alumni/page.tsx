"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw, UserCircle, Calendar, BookOpen, Briefcase, MapPin, X, Save, ArrowLeft, Settings, Handshake, Search, LayoutDashboard, BarChart3, Mail, CheckCircle, XCircle, Clock, Award, Globe, Users, TrendingUp, Download, Send, Bell, Shield, Star } from "lucide-react";
import { getApi, postApi, patchApi, deleteApi, uploadFile, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAlert } from "@/context/AlertContext";
import ReactDOM from "react-dom";

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, api: '/alumni/stats', adminApi: '' },
  { id: 'profiles', label: 'Alumni Directory', icon: UserCircle, api: '/alumni/profiles', adminApi: '/alumni/admin/profiles' },
  { id: 'events', label: 'Events', icon: Calendar, api: '/alumni/events', adminApi: '/alumni/admin/events' },
  { id: 'stories', label: 'Success Stories', icon: BookOpen, api: '/alumni/stories', adminApi: '/alumni/admin/stories' },
  { id: 'careers', label: 'Opportunities', icon: Briefcase, api: '/alumni/careers', adminApi: '/alumni/admin/careers' },
  { id: 'mentorship', label: 'Mentorship', icon: Handshake, api: '/alumni/mentors', adminApi: '/alumni/admin/mentors' },
  { id: 'chapters', label: 'Chapters', icon: MapPin, api: '/alumni/chapters', adminApi: '/alumni/admin/chapters' },
  { id: 'communications', label: 'Communications', icon: Mail, api: '', adminApi: '' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, api: '/alumni/stats', adminApi: '' },
  { id: 'settings', label: 'Portal Content', icon: Settings, api: '/settings', adminApi: '/settings' }
];

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "South Sudan", "Ethiopia", "Somalia", 
  "Nigeria", "Ghana", "South Africa", "Egypt", "Morocco", "United States", "United Kingdom", 
  "Canada", "Australia", "Germany", "France", "United Arab Emirates", "India", "China", "Japan"
].sort();

const INDUSTRIES = [
  "Technology & Software", "Finance & Banking", "Healthcare & Medicine", "Education & Research",
  "Engineering & Manufacturing", "Government & Public Sector", "Media & Entertainment", 
  "Legal Services", "Consulting & Management", "Non-Profit & NGO", "Real Estate & Construction",
  "Agriculture & Environmental", "Telecommunications", "Retail & E-commerce"
].sort();

const ImageUploadField = ({ value, onChange, label = "Image" }: { value: string, onChange: (val: string) => void, label?: string }) => {
  const [mode, setMode] = useState<'url'|'upload'>('url');
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    try {
       const data = await uploadFile(file);
       if(data?.url) {
         onChange(resolveImageUrl(data.url));
       } else {
         toast.error(data?.message || "Upload failed");
       }
    } catch(err) {
       toast.error("Upload failed");
    } finally {
       setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
         <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">{label}</label>
         <div className="flex gap-2">
            <button type="button" onClick={() => setMode('url')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${mode === 'url' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>URL</button>
            <span className="text-slate-200">|</span>
            <button type="button" onClick={() => setMode('upload')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${mode === 'upload' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>Upload</button>
         </div>
      </div>
      {mode === 'url' ? (
         <input type="url" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="https://" />
      ) : (
         <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 relative flex flex-col items-center justify-center hover:bg-slate-100 transition-all cursor-pointer group">
            {uploading ? (
              <div className="flex items-center space-x-2 text-primary">
                 <RefreshCw size={18} className="animate-spin" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Uploading...</span>
              </div>
            ) : (
              <div className="text-center">
                 <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-primary transition-colors">
                    <Plus size={18} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Click to browse file</span>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1">JPG, PNG, WEBP max 50MB</p>
              </div>
            )}
            <input type="file" onChange={handleUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
         </div>
      )}
      {value && mode === 'upload' && <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest truncate">✓ Selected: {value}</p>}
    </div>
  );
};

export default function AlumniAdmin() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [storyCategories, setStoryCategories] = useState<string[]>([
    'career_success', 'entrepreneurship', 'research', 'community_impact', 'innovation', 'mentorship'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Alumni search for mentorship picker
  const [alumniSearchTerm, setAlumniSearchTerm] = useState('');
  const [alumniSearchResults, setAlumniSearchResults] = useState<any[]>([]);
  const [alumniSearchLoading, setAlumniSearchLoading] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);

  const searchAlumni = async (term: string) => {
    setAlumniSearchTerm(term);
    if (term.length < 2) { setAlumniSearchResults([]); return; }
    setAlumniSearchLoading(true);
    try {
      const res = await getApi(`/alumni/profiles?search=${encodeURIComponent(term)}&limit=8`);
      setAlumniSearchResults(Array.isArray(res) ? res : (res?.data || []));
    } catch { setAlumniSearchResults([]); }
    finally { setAlumniSearchLoading(false); }
  };

  const selectAlumni = (alum: any) => {
    setSelectedAlumni(alum);
    setAlumniSearchTerm(alum.name);
    setAlumniSearchResults([]);
    handleChange('alumniId', alum.id);
  };
  
  const [settingsData, setSettingsData] = useState<any>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Dashboard & Analytics
  const [stats, setStats] = useState<any>(null);
  
  // Communications
  const [announcement, setAnnouncement] = useState({ title: '', body: '', audience: 'all' });
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  useEffect(() => {
    // Always fetch stats for the dashboard widget
    getApi('/alumni/stats').then(data => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    // Fetch dynamic programmes on mount for the dropdowns
    const fetchProgrammes = async () => {
       try {
          const res = await getApi('/programmes?limit=100');
          const pList = res.data ? res.data.map((p: any) => p.title) : [];
          setProgrammes(pList);
       } catch (err) {
          console.error("Failed to fetch programmes", err);
       }
    };
    fetchProgrammes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab.id === 'dashboard' || activeTab.id === 'communications') {
        setLoading(false);
        return;
      }
      if (activeTab.id === 'analytics') {
        const res = await getApi('/alumni/stats');
        setStats(res);
        setLoading(false);
        return;
      }
      if (activeTab.id === 'settings') {
        const res = await getApi(activeTab.api);
        setSettingsData(res || {});
      } else {
        const res = await getApi(activeTab.api);
        setData(Array.isArray(res) ? res : (res?.data || []));
      }
    } catch {
      toast.error(`Failed to load ${activeTab.label}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = (field: string, value: any) => {
    setSettingsData({ ...settingsData, [field]: value });
  };

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await patchApi(`/alumni/admin/profiles/${id}`, { verificationStatus: status });
      toast.success(`Profile ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update verification status');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingAnnouncement(true);
    try {
      await postApi(`/settings/alumni_announcement`, {
        value: JSON.stringify({ ...announcement, sentAt: new Date().toISOString() }),
      });
      toast.success('Announcement published successfully!');
      setAnnouncement({ title: '', body: '', audience: 'all' });
    } catch { toast.error('Failed to send announcement'); }
    finally { setIsSendingAnnouncement(false); }
  };

  const exportCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeTab.id}_export.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const renderDashboard = () => (
    <div className="space-y-10">
      {/* Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Alumni', value: stats?.alumniRegistered?.toLocaleString() ?? '—', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Active Mentors', value: stats?.activeMentors?.toLocaleString() ?? '—', icon: Handshake, color: 'text-secondary', bg: 'bg-secondary/5' },
          { label: 'Events Hosted', value: stats?.eventsHosted?.toLocaleString() ?? '—', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Countries', value: stats?.countriesRepresented?.toLocaleString() ?? '—', icon: Globe, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={24} className={s.color} />
            </div>
            <div>
              <p className="text-3xl font-black text-primary-dark tracking-tight">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Add Alumni', icon: UserCircle, tab: 'profiles' },
            { label: 'Create Event', icon: Calendar, tab: 'events' },
            { label: 'Publish Story', icon: BookOpen, tab: 'stories' },
            { label: 'Add Opportunity', icon: Briefcase, tab: 'careers' },
            { label: 'Add Mentor', icon: Handshake, tab: 'mentorship' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => {
                const tab = TABS.find(t => t.id === action.tab);
                if (tab) { setActiveTab(tab); setTimeout(() => handleOpenModal(), 100); }
              }}
              className="flex flex-col items-center gap-3 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-primary hover:border-primary hover:text-white transition-all group"
            >
              <action.icon size={22} className="text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Verifications</h3>
          <button onClick={() => setActiveTab(TABS.find(t => t.id === 'profiles')!)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All →</button>
        </div>
        <div className="space-y-3">
          {data.filter((d: any) => d.verificationStatus === 'pending' || !d.verificationStatus).slice(0, 5).map((alum: any) => (
            <div key={alum.id} className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-200 shrink-0">
                <img src={alum.image_url} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-primary-dark text-sm">{alum.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{alum.programme} · {alum.graduationYear}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleVerify(alum.id, 'verified')} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors">Verify</button>
                <button onClick={() => handleVerify(alum.id, 'rejected')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">Reject</button>
              </div>
            </div>
          ))}
          {data.filter((d: any) => d.verificationStatus === 'pending' || !d.verificationStatus).length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">All alumni verified</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase tracking-tight text-primary-dark">Alumni Analytics Overview</h3>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Alumni', value: stats?.alumniRegistered?.toLocaleString() ?? '—', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Active Mentors', value: stats?.activeMentors?.toLocaleString() ?? '—', icon: Handshake, color: 'text-secondary', bg: 'bg-secondary/5' },
          { label: 'Events Hosted', value: stats?.eventsHosted?.toLocaleString() ?? '—', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Global Reach', value: `${stats?.countriesRepresented ?? '—'} Countries`, icon: Globe, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <p className="text-3xl font-black text-primary-dark">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Verification Status Breakdown</h4>
          <div className="space-y-4">
            {[
              { label: 'Verified', count: data.filter((d:any) => d.verificationStatus === 'verified').length, color: 'bg-green-500' },
              { label: 'Pending', count: data.filter((d:any) => d.verificationStatus === 'pending' || !d.verificationStatus).length, color: 'bg-amber-400' },
              { label: 'Rejected', count: data.filter((d:any) => d.verificationStatus === 'rejected').length, color: 'bg-red-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 w-20">{item.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${data.length ? Math.round((item.count / data.length) * 100) : 0}%` }} />
                </div>
                <span className="text-xs font-black text-slate-600 w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Top Industries</h4>
          <div className="space-y-3">
            {Object.entries(
              data.reduce((acc: any, alum: any) => { if(alum.industry) { acc[alum.industry] = (acc[alum.industry] || 0) + 1; } return acc; }, {})
            ).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5).map(([industry, count]: any, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 truncate max-w-[60%]">{industry}</span>
                <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
            {data.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No data — switch to Alumni Directory tab first to load profiles</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunications = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcement Composer */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSendAnnouncement} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <Send size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-primary-dark uppercase tracking-tight">New Announcement</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publish to alumni portal</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Announcement Title</label>
              <input
                required value={announcement.title}
                onChange={e => setAnnouncement({...announcement, title: e.target.value})}
                placeholder="e.g., Annual Alumni Gala 2025 — Registration Now Open"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-primary-dark focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message Body</label>
              <textarea
                required value={announcement.body}
                onChange={e => setAnnouncement({...announcement, body: e.target.value})}
                placeholder="Write your announcement message here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-primary-dark focus:ring-2 focus:ring-primary outline-none min-h-[160px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Audience</label>
              <div className="flex gap-3">
                {['all', 'mentors', 'kenyan', 'international'].map(aud => (
                  <button
                    key={aud} type="button"
                    onClick={() => setAnnouncement({...announcement, audience: aud})}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                      announcement.audience === aud ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {aud === 'all' ? 'All Alumni' : aud === 'kenyan' ? 'Kenya' : aud === 'international' ? 'International' : 'Mentors'}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSendingAnnouncement} className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              {isSendingAnnouncement ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {isSendingAnnouncement ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Channels</h4>
            {[
              { icon: Bell, label: 'Portal Notifications', desc: 'Visible on alumni portal homepage' },
              { icon: Mail, label: 'Email Digest', desc: 'Included in next newsletter send' },
              { icon: Globe, label: 'Chapter Boards', desc: 'Posted to relevant chapter pages' },
            ].map((ch, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ch.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary-dark">{ch.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">💡 Best Practices</h4>
            <ul className="space-y-2 text-[10px] font-medium text-slate-600">
              <li>• Keep subject lines under 60 characters</li>
              <li>• Include a clear call to action</li>
              <li>• Target specific audiences for higher engagement</li>
              <li>• Schedule major announcements at least 48h ahead</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updatePromises = Object.entries(settingsData).map(([key, value]) =>
        postApi(`/settings/${key}`, { value })
      );
      await Promise.all(updatePromises);
      toast.success("Portal content updated successfully");
    } catch (err) {
      toast.error("Failed to update portal content");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setIsEdit(true);
      let editData = { ...item };
      if (activeTab.id === 'events' && editData.date) {
        editData.date = new Date(editData.date).toISOString().slice(0, 16);
      }
      setFormData(editData);
      // Pre-populate alumni picker if editing mentorship or stories with a linked alumni
      if ((activeTab.id === 'mentorship' || activeTab.id === 'stories') && item.alumni) {
        setSelectedAlumni(item.alumni);
        setAlumniSearchTerm(item.alumni.name || '');
      } else {
        // Reset picker for tabs that don't use it, or when no alumni linked
        setSelectedAlumni(null);
        setAlumniSearchTerm('');
        setAlumniSearchResults([]);
      }
    } else {
      setIsEdit(false);
      setFormData({});
      setSelectedAlumni(null);
      setAlumniSearchTerm('');
      setAlumniSearchResults([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setIsEdit(false);
    setSelectedAlumni(null);
    setAlumniSearchTerm('');
    setAlumniSearchResults([]);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEdit) {
        await patchApi(`${activeTab.adminApi}/${formData.id}`, formData);
        toast.success("Updated successfully");
      } else {
        await postApi(activeTab.adminApi, formData);
        toast.success("Created successfully");
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    showAlert({
      title: `Delete ${activeTab.label}?`,
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteApi(`${activeTab.adminApi}/${id}`);
          toast.success("Deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  const renderFormFields = () => {
    switch (activeTab.id) {
      case 'profiles':
        return (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Full Name</label>
              <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Graduation Year</label>
                <input required type="number" value={formData.graduationYear || ''} onChange={e => handleChange('graduationYear', parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Programme</label>
                <input 
                  list="admin-programmes"
                  required 
                  value={formData.programme || ''} 
                  onChange={e => handleChange('programme', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Search or select programme..."
                />
                <datalist id="admin-programmes">
                  {programmes.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Industry</label>
                <input 
                  list="admin-industries"
                  required 
                  value={formData.industry || ''} 
                  onChange={e => handleChange('industry', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Search or select industry..."
                />
                <datalist id="admin-industries">
                  {INDUSTRIES.map(i => <option key={i} value={i} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Employer</label>
                <input value={formData.employer || ''} onChange={e => handleChange('employer', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Country</label>
                <input 
                  list="admin-countries"
                  value={formData.country || ''} 
                  onChange={e => handleChange('country', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Search or select country..."
                />
                <datalist id="admin-countries">
                  {COUNTRIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">LinkedIn URL</label>
                <input type="url" value={formData.linkedIn || ''} onChange={e => handleChange('linkedIn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <ImageUploadField label="Profile Picture" value={formData.image_url || ''} onChange={(val: string) => handleChange('image_url', val)} />
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Bio</label>
              <textarea value={formData.bio || ''} onChange={e => handleChange('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Achievements</label>
              <textarea value={formData.achievements || ''} onChange={e => handleChange('achievements', e.target.value)} placeholder="e.g., Forbes 30 Under 30, TEDx Speaker..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[70px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Student Number</label>
                <input value={formData.studentNumber || ''} onChange={e => handleChange('studentNumber', e.target.value)} placeholder="e.g., OUK/2018/001" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Twitter / X Handle</label>
                <input value={formData.twitter || ''} onChange={e => handleChange('twitter', e.target.value)} placeholder="@handle" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Personal / Portfolio Website</label>
              <input type="url" value={formData.website || ''} onChange={e => handleChange('website', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>

            {/* Verification Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block flex items-center gap-2"><Shield size={14} /> Verification Status</label>
              <div className="flex gap-3">
                {[
                  { val: 'verified', label: 'Verified', color: 'green' },
                  { val: 'pending', label: 'Pending', color: 'amber' },
                  { val: 'rejected', label: 'Rejected', color: 'red' },
                ].map(({ val, label, color }) => (
                  <button
                    key={val} type="button"
                    onClick={() => handleChange('verificationStatus', val)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      (formData.verificationStatus || 'pending') === val
                        ? color === 'green' ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : color === 'red' ? 'bg-red-500 text-white border-red-500 shadow-md'
                          : 'bg-amber-400 text-white border-amber-400 shadow-md'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {val === 'verified' && '✓ '}{label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured || false} onChange={e => handleChange('isFeatured', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-bold text-slate-700">Feature this Profile</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={formData.isPublic !== false} onChange={e => handleChange('isPublic', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-bold text-slate-700">Visible in Directory</span>
              </label>
            </div>
          </>
        );
      case 'events':
        return (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Event Title</label>
              <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Title (Swahili) — optional</label>
              <input value={formData.title_sw || ''} onChange={e => handleChange('title_sw', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="Kichwa cha Kiswahili..." />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
              <textarea required value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description (Swahili) — optional</label>
              <textarea value={formData.description_sw || ''} onChange={e => handleChange('description_sw', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[80px]" placeholder="Maelezo ya Kiswahili..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Date & Time</label>
                <input required type="datetime-local" value={formData.date || ''} onChange={e => handleChange('date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
                <input 
                  list="admin-countries"
                  required 
                  value={formData.location || ''} 
                  onChange={e => handleChange('location', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="City, Country or Online..."
                />
              </div>
            </div>
            {/* Event Type — chip picker */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {['Reunion', 'Webinar', 'Conference', 'Networking', 'Workshop', 'Cultural'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleChange('type', t)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      formData.type === t ? 'bg-primary text-white border-primary shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/40'
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Status</label>
                <select value={formData.status || 'upcoming'} onChange={e => handleChange('status', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Capacity</label>
                <input type="number" min="1" value={formData.capacity || ''} onChange={e => handleChange('capacity', parseInt(e.target.value))} placeholder="e.g. 200" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">RSVP Deadline</label>
                <input type="date" value={formData.rsvp_deadline || ''} onChange={e => handleChange('rsvp_deadline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">RSVP Link</label>
              <input type="url" value={formData.rsvp_link || ''} onChange={e => handleChange('rsvp_link', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <ImageUploadField label="Event Banner" value={formData.image_url || ''} onChange={(val: string) => handleChange('image_url', val)} />
          </>
        );
      case 'stories':
        return (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Story Title</label>
              <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category</label>
              <div className="relative">
                <input
                  list="story-categories"
                  required
                  value={formData.category || ''}
                  onChange={e => handleChange('category', e.target.value)}
                  placeholder="Select or type a category..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-primary outline-none"
                />
                <datalist id="story-categories">
                  {storyCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </datalist>
              </div>
              {/* Add new category inline */}
              {formData.category && !storyCategories.includes(formData.category) && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex-1">
                    ✦ Add &quot;{formData.category}&quot; as a new category?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryCategories(prev => [...prev, formData.category]);
                      toast.success(`Category "${formData.category}" added!`);
                    }}
                    className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-secondary transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              )}
              {/* Existing categories as quick chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {storyCategories.map((cat, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleChange('category', cat)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      formData.category === cat
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Content</label>
              <textarea required value={formData.content || ''} onChange={e => handleChange('content', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[150px]" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Link to Alumni Profile <span className="text-slate-300 font-bold">(Optional)</span></label>
              {selectedAlumni ? (
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-primary/20 shadow-sm">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 shrink-0">
                    <img src={selectedAlumni.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-primary-dark text-sm">{selectedAlumni.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{selectedAlumni.programme} · Class of {selectedAlumni.graduationYear}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedAlumni(null); setAlumniSearchTerm(''); handleChange('alumniId', ''); }} className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={alumniSearchTerm}
                    onChange={e => searchAlumni(e.target.value)}
                    placeholder="Search alumni by name, employer..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-9 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                  {alumniSearchLoading && <RefreshCw size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />}
                  {alumniSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl z-50 divide-y divide-slate-50">
                      {alumniSearchResults.map(alum => (
                        <button key={alum.id} type="button" onClick={() => selectAlumni(alum)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0">
                            <img src={alum.image_url} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-primary-dark text-xs">{alum.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{alum.programme} · {alum.employer}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ImageUploadField label="Story Image" value={formData.image_url || ''} onChange={(val: string) => handleChange('image_url', val)} />
          </>
        );
      case 'careers':
        return (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Job / Role Title</label>
              <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Company</label>
                <input required value={formData.company || ''} onChange={e => handleChange('company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Type</label>
                <select value={formData.type || 'Job'} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
                <input 
                  list="admin-countries"
                  required 
                  value={formData.location || ''} 
                  onChange={e => handleChange('location', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="City, Country or Remote..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Status</label>
                <select value={formData.status || 'active'} onChange={e => handleChange('status', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
              <textarea required value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Application Link</label>
                <input type="url" value={formData.link || ''} onChange={e => handleChange('link', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Application Deadline</label>
                <input type="date" value={formData.deadline || ''} onChange={e => handleChange('deadline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">Listing Controls</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Visibility</label>
                  <div className="flex gap-2">
                    {['public', 'alumni-only'].map(v => (
                      <button key={v} type="button" onClick={() => handleChange('visibility', v)}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                          (formData.visibility || 'public') === v ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'
                        }`}>
                        {v === 'public' ? '🌍 Public' : '🔒 Alumni Only'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.featured || false} onChange={e => handleChange('featured', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Star size={11} className="text-amber-400" /> Feature this Listing</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        );
      case 'mentorship':
        return (
          <>
            {/* Step 1: Alumni Picker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">1</div>
                <label className="text-sm font-black uppercase tracking-widest text-primary-dark">Select Alumni Mentor</label>
              </div>
              
              {/* Selected alumni preview */}
              {selectedAlumni && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-primary/20 shadow-sm">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shrink-0">
                    <img src={selectedAlumni.image_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-primary-dark text-sm">{selectedAlumni.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{selectedAlumni.programme} · Class of {selectedAlumni.graduationYear}</p>
                    <p className="text-[9px] font-bold text-slate-400">{selectedAlumni.employer} — {selectedAlumni.country}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedAlumni(null); setAlumniSearchTerm(''); handleChange('alumniId', ''); }} className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={alumniSearchTerm}
                  onChange={e => searchAlumni(e.target.value)}
                  placeholder="Search by name, employer, or programme..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
                {alumniSearchLoading && (
                  <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                )}
              </div>

              {/* Search results dropdown */}
              {alumniSearchResults.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl divide-y divide-slate-50">
                  {alumniSearchResults.map(alum => (
                    <button
                      key={alum.id}
                      type="button"
                      onClick={() => selectAlumni(alum)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                        <img src={alum.image_url} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-primary-dark text-sm">{alum.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{alum.programme} · {alum.employer}</p>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">{alum.country}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Hidden required input for form validation */}
              <input type="hidden" required value={formData.alumniId || ''} onChange={() => {}} />
              {!formData.alumniId && <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">⚠ Please select an alumni to proceed</p>}
            </div>

            {/* Step 2: Expertise */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">2</div>
                <label className="text-sm font-black uppercase tracking-widest text-primary-dark">Areas of Expertise</label>
              </div>
              <textarea
                required
                value={formData.expertise || ''}
                onChange={e => handleChange('expertise', e.target.value)}
                placeholder="e.g., Software Engineering, Data Science, Product Management"
                className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none min-h-[100px] text-sm"
              />
              {/* Quick tags */}
              <div className="flex flex-wrap gap-2">
                {['Software Engineering', 'Data Science', 'Product Management', 'FinTech', 'Cybersecurity', 'Cloud Computing', 'AI & ML', 'Entrepreneurship'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleChange('expertise', formData.expertise ? `${formData.expertise}, ${tag}` : tag)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Availability */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">3</div>
                <label className="text-sm font-black uppercase tracking-widest text-primary-dark">Availability</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Weekdays only', 'Weekends only', 'Flexible — Any day', '1 hour/month', '2 hours/month', '4+ hours/month'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleChange('availability', opt)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      formData.availability === opt
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                value={formData.availability || ''}
                onChange={e => handleChange('availability', e.target.value)}
                placeholder="Or type custom availability..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none text-sm mt-2"
              />
            </div>

            {/* Step 4: Status */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">4</div>
                <label className="text-sm font-black uppercase tracking-widest text-primary-dark">Mentor Status</label>
              </div>
              <div className="flex gap-3">
                {[{val:'active',color:'green'},{val:'inactive',color:'red'},{val:'pending',color:'amber'}].map(({val, color}) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange('status', val)}
                    className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                      (formData.status || 'active') === val
                        ? color === 'green' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20'
                          : color === 'red' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                          : 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {val === 'active' && '✓ '}{val}
                  </button>
                ))}
              </div>
            </div>
          </>
        );
      case 'chapters':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Chapter Name</label>
                <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Region / Country</label>
                <input 
                  list="admin-countries"
                  required 
                  value={formData.region || ''} 
                  onChange={e => handleChange('region', e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Search or select region..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Chapter Head</label>
                <input required value={formData.head_name || ''} onChange={e => handleChange('head_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Contact Email</label>
                <input required type="email" value={formData.contact || ''} onChange={e => handleChange('contact', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      {!isModalOpen && (
        <div className="flex justify-between items-end border-b border-slate-100 pb-10">
          <div>
            <h2 className="text-4xl font-black text-primary-darker mb-2 uppercase tracking-tighter font-serif">Alumni Association</h2>
            <p className="text-slate-500 font-medium text-sm">Global networking hub and institutional engagement management.</p>
          </div>
          {activeTab.id !== 'settings' && (
            <button 
              onClick={() => handleOpenModal()}
              className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              <Plus size={20} />
              <span>New Entry</span>
            </button>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      {!isModalOpen && (
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab.id === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      )}

      {!isModalOpen && loading && (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      )}

      {!isModalOpen && !loading && activeTab.id === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-10 space-y-10 animate-in fade-in duration-300">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-100 pb-2">About Page Content</h4>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Statement</label>
                 <textarea 
                   value={settingsData.alumni_mission || ""} 
                   onChange={(e) => handleSettingsUpdate("alumni_mission", e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-primary-dark focus:ring-2 focus:ring-primary outline-none h-32"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ambassadors Count (e.g. 12,000+)</label>
                 <input 
                   type="text" 
                   value={settingsData.alumni_ambassadors_count || ""} 
                   onChange={(e) => handleSettingsUpdate("alumni_ambassadors_count", e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-primary-dark focus:ring-2 focus:ring-primary outline-none"
                 />
               </div>
             </div>

             <div className="space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-100 pb-2">Portal Heroes</h4>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jobs Hero Subtext</label>
                 <textarea 
                   value={settingsData.alumni_jobs_hero || ""} 
                   onChange={(e) => handleSettingsUpdate("alumni_jobs_hero", e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-primary-dark focus:ring-2 focus:ring-primary outline-none h-24"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events Hero Subtext</label>
                 <textarea 
                   value={settingsData.alumni_events_hero || ""} 
                   onChange={(e) => handleSettingsUpdate("alumni_events_hero", e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-primary-dark focus:ring-2 focus:ring-primary outline-none h-24"
                 />
               </div>
             </div>
           </div>

           <div className="flex justify-end pt-6 border-t border-slate-100">
              <button type="submit" disabled={isSavingSettings} className="btn-primary py-4 px-12 flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                {isSavingSettings ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                <span>{isSavingSettings ? 'Saving...' : 'Save Portal Content'}</span>
              </button>
           </div>
        </form>
      )}

      {!isModalOpen && !loading && activeTab.id === 'dashboard' && renderDashboard()}
      {!isModalOpen && !loading && activeTab.id === 'analytics' && renderAnalytics()}
      {!isModalOpen && !loading && activeTab.id === 'communications' && renderCommunications()}

      {!isModalOpen && !loading && !['settings','dashboard','analytics','communications'].includes(activeTab.id) && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="grid grid-cols-12 gap-4 flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-5">Resource / Entity</div>
              <div className="col-span-4">Metastate</div>
              <div className="col-span-3 text-right">Operations</div>
            </div>
            {data.length > 0 && (
              <button onClick={exportCSV} className="ml-6 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all shrink-0">
                <Download size={12} /> Export
              </button>
            )}
          </div>
          
          {data.length === 0 ? (
            <div className="py-20 text-center text-slate-400 uppercase font-black tracking-widest text-xs">
              No {activeTab.label.toLowerCase()} registered.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group">
                <div className="col-span-5">
                  <div className="flex items-center gap-3">
                    {(item.image_url || item.alumni?.image_url) && (
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                        <img src={item.image_url || item.alumni?.image_url} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black text-primary-darker text-sm tracking-tight truncate">
                        {activeTab.id === 'mentorship' 
                          ? (item.alumni?.name || 'Unknown Alumni')
                          : (item.name || item.title || item.role)
                        }
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate max-w-xs">
                        {activeTab.id === 'mentorship'
                          ? (item.alumni?.employer || item.alumniId)
                          : (item.bio || item.description || item.company)
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {activeTab.id === 'profiles' && (
                    <div className="flex items-center gap-3">
                      <span>Class of {item.graduationYear} | {item.industry}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        item.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                        item.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.verificationStatus || 'Pending'}
                      </span>
                    </div>
                  )}
                  {activeTab.id === 'events' && <span>{item.type || 'Event'} | {new Date(item.date).toLocaleDateString()}</span>}
                  {activeTab.id === 'stories' && <span>Featured: {item.isFeatured ? 'Yes' : 'No'} | {item.category}</span>}
                  {activeTab.id === 'careers' && <span>Location: {item.location} | {item.type}</span>}
                  {activeTab.id === 'mentorship' && <span>Status: {item.status} | {item.expertise?.substring(0, 40)}...</span>}
                  {activeTab.id === 'chapters' && <span>Region: {item.region} | {item.contact}</span>}
                </div>
                <div className="col-span-3 flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeTab.id === 'profiles' && item.verificationStatus !== 'verified' && (
                    <button onClick={() => handleVerify(item.id, 'verified')} title="Verify" className="p-1.5 text-slate-300 hover:text-green-500 transition-colors">
                      <CheckCircle size={15} />
                    </button>
                  )}
                  {activeTab.id === 'profiles' && item.verificationStatus !== 'rejected' && (
                    <button onClick={() => handleVerify(item.id, 'rejected')} title="Reject" className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <XCircle size={15} />
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit size={16} /></button>
                  <button 
                    onClick={() => handleDelete(item.id, item.name || item.title)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Immersive Inline Editor View */}
      {isModalOpen && (
        <div className="flex flex-col animate-in fade-in duration-300 bg-white border border-slate-200">
           <div className="flex justify-between items-center px-10 py-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-6">
                 <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full transition-all shadow-sm group">
                    <ArrowLeft size={20} className="text-slate-500 group-hover:-translate-x-1 transition-transform" />
                 </button>
                 <div>
                   <h2 className="text-3xl font-black uppercase tracking-tighter text-primary-darker font-serif italic">
                     {isEdit ? 'Edit Entry' : 'Create New Entry'}
                   </h2>
                   <div className="flex items-center space-x-2 mt-2">
                      <activeTab.icon size={14} className="text-slate-400" />
                      <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">{activeTab.label}</p>
                   </div>
                 </div>
              </div>
           </div>
           
           <form onSubmit={handleSave} className="flex flex-col">
              <div className="p-10 md:p-16 space-y-8 max-w-4xl w-full mx-auto">
                 {renderFormFields()}
              </div>
              
              <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center space-x-6">
                <button type="button" onClick={closeModal} className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                   Cancel Changes
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary py-4 px-12 flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{isSaving ? 'Processing...' : 'Save & Publish'}</span>
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}
