"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Search, Edit, Trash2, RefreshCw, BookOpen, X, Check,
  ChevronDown, Filter, Globe, Tag, ArrowRight, Eye, EyeOff,
  Zap, Clock, CreditCard, Layers, Users, Award,
  ChevronUp, ChevronDown as ChevronDownIcon
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import RichTextEditor from "@/components/RichTextEditor";

// ─── Searchable Select Component with "Just-in-Time" Creation ────────────────
function SearchableSelect({
  label, options, value, onChange, placeholder = "Select...", getId, getLabel, onAddNew
}: {
  label: string;
  options: any[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  getId: (o: any) => string;
  getLabel: (o: any) => string;
  onAddNew?: (val: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const filtered = options.filter(o => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => getId(o) === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setIsAdding(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newVal || !onAddNew) return;
    setSavingNew(true);
    try {
      await onAddNew(newVal);
      setIsAdding(false);
      setNewVal("");
      setSearch("");
    } catch {
      toast.error("Failed to create institutional metadata");
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center transition-all group hover:bg-slate-100"
        >
          <span className={selected ? "text-primary-darker" : "text-slate-400"}>
            {selected ? getLabel(selected) : placeholder}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-[100] w-full bg-white border border-slate-200 shadow-2xl mt-1 max-h-72 overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {filtered.map(o => (
                  <button
                    key={getId(o)}
                    type="button"
                    onClick={() => { onChange(getId(o)); setOpen(false); setSearch(""); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${value === getId(o) ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    {getLabel(o)}
                  </button>
                ))}
                {filtered.length === 0 && !isAdding && (
                  <div className="p-4 text-xs text-slate-400 text-center">No institutional matches</div>
                )}
              </div>
              {onAddNew && (
                <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                   {isAdding ? (
                     <div className="flex items-center space-x-2">
                        <input 
                          autoFocus
                          value={newVal}
                          onChange={e => setNewVal(e.target.value)}
                          placeholder={`New ${label.toLowerCase()}...`}
                          className="flex-1 bg-white border border-slate-200 p-2 text-xs font-bold outline-none"
                        />
                        <button 
                          onClick={handleCreate}
                          disabled={savingNew}
                          className="bg-primary text-white p-2 hover:bg-[#ff7f50] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {savingNew ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                     </div>
                   ) : (
                     <button 
                        onClick={() => { setIsAdding(true); setNewVal(search); }}
                        className="w-full flex items-center justify-center space-x-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-[#ff7f50] hover:text-white transition-colors"
                     >
                       <Plus size={12} />
                       <span>Register New {label.split(' ').pop()}</span>
                     </button>
                   )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Clean Custom Select Component ──────────────────────────────────────────
function CleanSelect({
  label, options, value, onChange, placeholder = "Select..."
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center transition-all group hover:bg-slate-100"
        >
          <span className={value ? "text-primary-darker" : "text-slate-400"}>
            {value || placeholder}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute z-[100] w-full bg-white border border-slate-200 shadow-2xl mt-1 overflow-hidden"
            >
              <div className="max-h-56 overflow-y-auto">
                {options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${value === opt ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MODES = ["Online", "Blended", "In-Person", "Hybrid"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const STATUSES = ["Published", "Review", "Draft", "Archived"];

const STATUS_COLORS: Record<string, string> = {
  Published: "bg-green-50 text-green-700",
  Review: "bg-blue-50 text-blue-700",
  Draft: "bg-orange-50 text-orange-700",
  Archived: "bg-slate-100 text-slate-500",
};

export default function ShortCoursesAdmin() {
  const [courses, setCourses] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"en" | "sw">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); fetchAll(); }, []);

  const emptyForm = {
    title: "", title_sw: "", code: "", slug: "",
    about: "", about_sw: "", overview: "", overview_sw: "",
    duration: "", cost: "", image_url: "",
    skills_gained: "", skills_gained_sw: "",
    target_audience: "", target_audience_sw: "",
    mode_of_delivery: "Online", level: "Beginner", status: "Draft",
    schoolId: "", categoryId: "", methodId: "", departmentId: "",
    modules: [] as any[]
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, s, d, cat, m] = await Promise.all([
        getApi('/short-courses'),
        getApi('/schools'),
        getApi('/short-courses/taxonomies/departments'),
        getApi('/short-courses/taxonomies/categories'),
        getApi('/short-courses/taxonomies/methods'),
      ]);
      // Extract data from paginated response for courses
      setCourses(Array.isArray(c) ? c : (c?.data || []));
      setSchools(s || []);
      setDepartments(d || []);
      setCategories(cat || []);
      setMethods(m || []);
    } catch { toast.error("Failed to load academic data"); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelected(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (course: any) => {
    setSelected(course);
    setForm({
      ...emptyForm,
      ...course,
      schoolId: course.school?.id || "",
      departmentId: course.department?.id || "",
      categoryId: course.course_category?.id || "",
      methodId: course.learning_method?.id || "",
      modules: course.modules || []
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.code) { toast.error("Title and Code are required"); return; }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (form.schoolId) payload.school = { id: form.schoolId };
      if (form.departmentId) payload.department = { id: form.departmentId };
      if (form.categoryId) payload.course_category = { id: form.categoryId };
      if (form.methodId) payload.learning_method = { id: form.methodId };
      if (!payload.slug) payload.slug = form.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      if (payload.modules) payload.modules = payload.modules.map((m: any, idx: number) => ({ ...m, order: idx + 1 }));

      if (selected) {
        await patchApi(`/short-courses/${selected.id}`, payload);
        toast.success("Certification updated");
      } else {
        await postApi('/short-courses', payload);
        toast.success("Certification registered");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch { toast.error("Registry sync failed"); }
    finally { setSaving(false); }
  };

  const { showAlert } = useAlert();

  const handleDelete = async (id: string, title: string) => {
    showAlert({
      title: "Remove Certification?",
      message: `Are you sure you want to move "${title}" to the Recycle Bin? It will be permanently deleted after 30 days.`,
      confirmText: "Move to Bin",
      onConfirm: async () => {
        try { 
          await deleteApi(`/short-courses/${id}`); 
          toast.success("Moved to Recycle Bin"); 
          fetchAll(); 
        } catch { 
          toast.error("Removal failed"); 
        }
      }
    });
  };

  const handleAddSchool = async (name: string) => {
    const res = await postApi('/schools', { name });
    await fetchAll();
    f("schoolId", res.id);
  };
  const handleAddDept = async (name: string) => {
    if (!form.schoolId) { toast.error("Select a Host School first"); return; }
    const res = await postApi('/departments', { name, school: { id: form.schoolId } });
    await fetchAll();
    f("departmentId", res.id);
  };
  const handleAddCategory = async (name: string) => {
    const res = await postApi('/short-courses/taxonomies/categories', { name });
    await fetchAll();
    f("categoryId", res.id);
  };
  const handleAddMethod = async (name: string) => {
    const res = await postApi('/short-courses/taxonomies/methods', { name });
    await fetchAll();
    f("methodId", res.id);
  };

  const filtered = (Array.isArray(courses) ? courses : []).filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase()));
  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-primary-darker/60 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-5xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            <div className="p-8 bg-primary-darker text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-6">
                 <div className="w-12 h-12 bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Award size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-widest">{selected ? "Edit Registry Certification" : "Register New Training"}</h3>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">{selected ? `Registry ID: ${selected.code}` : "Professional curriculum initialization"}</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="bg-slate-50 border-b border-slate-100 px-8 flex">
               <button onClick={() => setActiveTab("en")} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "en" ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>English Context</button>
               <button onClick={() => setActiveTab("sw")} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === "sw" ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Kiswahili Context</button>
            </div>
            <div className="overflow-y-auto p-12 space-y-12 flex-1 scrollbar-hide">
              <section className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Registry Metadata</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certification Code *</label><input value={form.code} onChange={e => f("code", e.target.value.toUpperCase())} className="w-full bg-slate-50 p-5 font-black text-primary outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest" placeholder="e.g. SC-AIB-26" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug (URL Path)</label><input value={form.slug} onChange={e => f("slug", e.target.value.toLowerCase())} className="w-full bg-slate-50 p-5 font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. ai-for-business" /></div>
                  <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certification Title ({activeTab === "en" ? "English" : "Swahili"}) *</label><input value={activeTab === "en" ? form.title : form.title_sw} onChange={e => f(activeTab === "en" ? "title" : "title_sw", e.target.value)} className="w-full bg-slate-100 p-5 font-black text-primary-darker outline-none border-l-4 border-primary focus:ring-0" placeholder={activeTab === "en" ? "Official Certification Title" : "Kichwa cha cheti cha kitaalamu"} /></div>
                  <div className="col-span-2 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Image URL</label>
                      <input 
                        value={form.image_url} 
                        onChange={e => f("image_url", e.target.value)} 
                        className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" 
                        placeholder="https://..." 
                      />
                    </div>
                    {form.image_url && (
                      <div className="relative group aspect-video w-full max-w-md border border-slate-200 p-1 bg-white overflow-hidden">
                        <img 
                          src={resolveImageUrl(form.image_url)} 
                          alt="Course Preview" 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                           <span className="text-[10px] font-black underline uppercase text-white tracking-widest">Asset Resolved</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              <section className="space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Pedagogical Framework</h4>
                 <div className="grid grid-cols-2 gap-8">
                    <SearchableSelect label="Host School" options={schools} value={form.schoolId} onChange={v => f("schoolId", v)} placeholder="Select school..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddSchool} />
                    <SearchableSelect label="Curriculum Department" options={departments.filter(d => !form.schoolId || d.school?.id === form.schoolId)} value={form.departmentId} onChange={v => f("departmentId", v)} placeholder="Select department..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddDept} />
                    <SearchableSelect label="Short Course Category" options={categories} value={form.categoryId} onChange={v => f("categoryId", v)} placeholder="Select category..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddCategory} />
                    <SearchableSelect label="Learning Method" options={methods} value={form.methodId} onChange={v => f("methodId", v)} placeholder="Select method..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddMethod} />
                    <CleanSelect label="Mode of Delivery" options={MODES} value={form.mode_of_delivery} onChange={v => f("mode_of_delivery", v)} />
                    <CleanSelect label="Registry Level" options={LEVELS} value={form.level} onChange={v => f("level", v)} />
                 </div>
              </section>
              <section className="space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Logistics & Investment</h4>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2 bg-slate-50 p-6"><div className="flex items-center space-x-2 text-primary mb-2"><Clock size={12} /><label className="text-[9px] font-bold uppercase tracking-widest">Duration</label></div><input value={form.duration} onChange={e => f("duration", e.target.value)} className="w-full bg-transparent p-0 font-black text-primary-darker outline-none text-xl" placeholder="e.g. 6 Weeks" /></div>
                    <div className="space-y-2 bg-slate-50 p-6"><div className="flex items-center space-x-2 text-primary mb-2"><CreditCard size={12} /><label className="text-[9px] font-bold uppercase tracking-widest">Global Cost</label></div><input value={form.cost} onChange={e => f("cost", e.target.value)} className="w-full bg-transparent p-0 font-black text-primary-darker outline-none text-xl" placeholder="KES 150,000" /></div>
                 </div>
              </section>
              <section className="space-y-12">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-4"><h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Pedagogical Structure (Modules)</h4><button type="button" onClick={() => { const newModules = [...(form.modules || [])]; newModules.push({ title: "", description: "", order: newModules.length + 1 }); f("modules", newModules); }} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors"><Plus size={14} /><span>Add Module</span></button></div>
                  <div className="space-y-6">{(form.modules || []).map((mod: any, idx: number) => (
                       <div key={idx} className="bg-slate-50 border border-slate-100 p-8 space-y-6 relative group overflow-hidden"><div className="absolute top-0 right-0 w-1 bg-primary h-full opacity-30 group-hover:opacity-100 transition-all" /><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><span className="w-8 h-8 bg-primary-darker text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</span><h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum Module {idx + 1}</h5></div><div className="flex items-center space-x-2"><button type="button" disabled={idx === 0} onClick={() => { const mods = [...form.modules]; [mods[idx], mods[idx-1]] = [mods[idx-1], mods[idx]]; f("modules", mods); }} className="p-1.5 text-slate-300 hover:text-primary disabled:opacity-30"><ChevronUp size={16} /></button><button type="button" onClick={() => { const mods = form.modules.filter((_: any, i: number) => i !== idx); f("modules", mods); }} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div></div><div className="grid grid-cols-1 gap-6"><div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Module Title (EN)</label><input value={mod.title} onChange={e => { const mods = [...form.modules]; mods[idx].title = e.target.value; f("modules", mods); }} className="w-full bg-white border border-slate-100 p-4 text-xs font-bold outline-none focus:border-primary" placeholder="e.g. Introduction to Neural Networks" /></div><div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Structural Narrative (EN)</label><textarea rows={3} value={mod.description} onChange={e => { const mods = [...form.modules]; mods[idx].description = e.target.value; f("modules", mods); }} className="w-full bg-white border border-slate-100 p-4 text-xs font-medium text-slate-600 outline-none focus:border-primary" placeholder="Core objectives and structural components of this unit..." /></div></div></div>
                     ))}{form.modules?.length === 0 && (<div className="py-12 bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-4 text-slate-300"><Layers size={32} /><p className="text-[10px] font-black uppercase tracking-widest">No curriculum modules defined</p><button type="button" onClick={() => f("modules", [{ title: "", description: "", order: 1 }])} className="text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-8">Initialize Curriculum Sequence</button></div>)}</div>
              </section>
              <section className="space-y-12">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Professional Narrative</h4>
                 <div className="space-y-10">
                    <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Overview ({activeTab === "en" ? "EN" : "SW"})</label><textarea rows={3} value={activeTab === "en" ? form.overview : form.overview_sw} onChange={e => f(activeTab === "en" ? "overview" : "overview_sw", e.target.value)} className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none border-l-4 border-slate-200 focus:border-primary transition-all" placeholder="High-level summary for the catalogue card..." /></div>
                    <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">About the Curriculum ({activeTab === "en" ? "EN" : "SW"})</label><RichTextEditor content={activeTab === "en" ? form.about : form.about_sw} onChange={html => f(activeTab === "en" ? "about" : "about_sw", html)} placeholder="Comprehensive pedagogical description..." /></div>
                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skills Gained (Comma Separated)</label><textarea value={activeTab === "en" ? form.skills_gained : form.skills_gained_sw} onChange={e => f(activeTab === "en" ? "skills_gained" : "skills_gained_sw", e.target.value)} className="w-full bg-slate-50 p-6 font-bold text-sm text-primary-darker outline-none" placeholder="e.g. AI Strategy, Digital Ethics, Python..." /></div>
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Audience Profile</label><textarea value={activeTab === "en" ? form.target_audience : form.target_audience_sw} onChange={e => f(activeTab === "en" ? "target_audience" : "target_audience_sw", e.target.value)} className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none" placeholder="Professional roles, prerequisites..." /></div>
                    </div>
                 </div>
              </section>
              <section className="bg-primary-darker p-12 relative overflow-hidden group"><div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -mr-32 -mt-32 rounded-full blur-3xl transition-all group-hover:bg-[#ff7f50] hover:text-white" /><div className="relative z-10 space-y-10"><h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">Institutional State Registry</h4><div className="grid grid-cols-4 gap-4">{STATUSES.map(s => (<button key={s} type="button" onClick={() => f("status", s)} className={`py-5 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.status === s ? 'bg-primary border-primary text-white shadow-lg' : 'bg-transparent border-white/20 text-white/40 hover:border-white/40'}`}>{s}</button>))}</div></div></section>
            </div>
            <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0"><div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry State: <span className="text-primary">{form.status}</span></div><div className="flex space-x-4"><button onClick={() => setIsModalOpen(false)} className="py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button><button onClick={handleSave} disabled={saving} className="btn-primary py-4 px-12 flex items-center space-x-4 text-xs font-black uppercase tracking-widest shadow-2xl disabled:opacity-50">{saving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={18} />}<span>{selected ? "Update Registry" : "Finalise Certification"}</span></button></div></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10"><div><h2 className="text-4xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tighter">Short Course Registry</h2><p className="text-slate-500 font-medium text-sm">Professional training and institutional certifications management.</p></div><button onClick={openCreate} className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"><Plus size={20} /><span>New Certification</span></button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ label: "Total Courses", val: Array.isArray(courses) ? courses.length : 0, icon: Layers },{ label: "Published", val: (Array.isArray(courses) ? courses : []).filter(c => c.status === "Published").length, icon: Zap },{ label: "Institutional Schools", val: schools.length, icon: Globe },{ label: "Taxonomy Categories", val: categories.length, icon: Tag }].map(stat => (<div key={stat.label} className="bg-white border border-slate-100 p-6 flex items-center justify-between"><div><div className="text-3xl font-black text-primary-darker">{stat.val}</div><div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div></div><stat.icon size={24} className="text-slate-100" /></div>))}</div>
      <div className="bg-white border border-slate-200 p-4"><div className="relative group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} /><input type="text" placeholder="Search certifications by title or code..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 p-4 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" /></div></div>
      {loading ? (<div className="flex items-center justify-center py-32"><RefreshCw className="animate-spin text-primary" size={48} /></div>) : filtered.length === 0 ? (<div className="py-32 text-center border-4 border-dashed border-slate-100"><BookOpen size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-slate-400 uppercase font-black tracking-widest text-sm">No certifications registered</p></div>) : (<div className="bg-white border border-slate-200 overflow-hidden"><div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400"><div className="col-span-1">Code</div><div className="col-span-4">Certification Title</div><div className="col-span-2">School</div><div className="col-span-2">Duration / Cost</div><div className="col-span-1">Status</div><div className="col-span-2 text-right">Actions</div></div>{filtered.map((course, i) => (<motion.div key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group cursor-pointer" onClick={() => openEdit(course)}><div className="col-span-1 text-xs font-black text-primary uppercase tracking-widest">{course.code}</div><div className="col-span-4"><p className="font-black text-primary-darker text-sm uppercase tracking-tight">{course.title}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">{course.course_category?.name || "Uncategorized"}</p></div><div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{course.school?.name || "—"}</div><div className="col-span-2"><p className="text-[10px] font-black text-primary-darker uppercase tracking-widest">{course.duration}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.cost}</p></div><div className="col-span-1"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${STATUS_COLORS[course.status] || "bg-slate-100 text-slate-500"}`}>{course.status}</span></div><div className="col-span-2 flex items-center justify-end space-x-2"><button className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit size={16} /></button><button onClick={(e) => { e.stopPropagation(); handleDelete(course.id, course.title); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></div></motion.div>))}</div>)}
      {mounted && createPortal(modalContent, document.body)}
    </div>
  );
}
