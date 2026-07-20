"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Search, Edit, Trash2, RefreshCw, BookOpen, X, Check,
  ChevronDown, Filter, Globe, Tag, ArrowRight, Eye, EyeOff
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "@/components/RichTextEditor";
import { ServerPagination } from "@/components/research/ServerPagination";

// ─── Searchable Select Component ────────────────────────────────────────────
function SearchableSelect({
  label, options, value, onChange, placeholder = "Select...", getId, getLabel
}: {
  label: string;
  options: any[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  getId: (o: any) => string;
  getLabel: (o: any) => string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter(o => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => getId(o) === value);

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
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center"
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
              className="absolute z-50 w-full bg-white border border-slate-200 shadow-xl mt-1 max-h-56 overflow-y-auto"
            >
              <div className="p-2 border-b border-slate-100">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {filtered.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">No matches</div>
              ) : (
                filtered.map(o => (
                  <button
                    key={getId(o)}
                    type="button"
                    onClick={() => { onChange(getId(o)); setOpen(false); setSearch(""); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${value === getId(o) ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    {getLabel(o)}
                  </button>
                ))
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
const STUDY_LEVELS = ["Certificate", "Diploma", "Undergraduate", "Postgraduate"];
const YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];
const SEMESTERS = ["Sem 1", "Sem 2", "Sem 3"];
const DEPARTMENTS = [
  "Computer Science", "Data Science", "Mathematics", "Physical Sciences", 
  "Biological Sciences", "Information Technology", "Business & Management",
  "Economics & Statistics", "Education Foundations", "Educational Tech",
  "Humanities", "Social Sciences"
];
const LANGUAGES = ["English", "Swahili", "Bilingual"];
const STATUSES = ["Active", "Draft", "Archived"];

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Draft: "bg-orange-50 text-orange-700",
  Archived: "bg-slate-100 text-slate-500",
};

export default function CourseUnitsAdmin() {
  const [selected, setSelected] = useState<any>(null);
  
  // Pagination & Server-side filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  const [limit] = useState(10);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [units, setUnits] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [programmes, setPrograms] = useState<any[]>([]);

  const emptyForm = {
    unit_code: "", title: "", description: "", 
    credits: "", year: "Year 1", semester: "Sem 1", 
    department: "Computer Science", study_level: "Undergraduate", status: "Draft",
    language: "English", learning_outcomes: "", assessment_methods: "", prerequisites: "",
    schoolId: "", programId: ""
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [page, search, filterSchool]);

  const fetchMetadata = async () => {
    try {
      const [s, p] = await Promise.all([
        getApi('/schools'),
        getApi('/programmes'),
      ]);
      setSchools(s?.data || s || []);
      setPrograms(p?.data || p || []);
    } catch { toast.error("Failed to load schools/programmes"); }
  };

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        schoolId: filterSchool
      }).toString();
      
      const res = await getApi(`/course-units?${params}`);
      setUnits(res.data || []);
      setTotalUnits(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch { toast.error("Failed to load registries"); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelected(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (unit: any) => {
    setSelected(unit);
    // Parse "Year 1 Sem 2" -> ["Year 1", "Sem 2"]
    const parts = (unit.year_level || "").split(" ");
    let y = "Year 1";
    let s = "Sem 1";
    if (parts.length >= 2) {
      if (parts[0] === 'Year') {
        y = `Year ${parts[1]}`;
        // Support both "Sem 1" and "Semester 1" formats from legacy data
        const semIdx = parts.findIndex((p: string) => p.startsWith('Sem'));
        if (semIdx !== -1 && parts[semIdx+1]) s = `Sem ${parts[semIdx+1]}`;
      }
    }

    setForm({
      unit_code: unit.unit_code || "", 
      title: unit.title || "", 
      description: unit.description || "", 
      credits: unit.credits || "", 
      year: y, 
      semester: s, 
      department: unit.department || "Computer Science",
      study_level: unit.study_level || "Undergraduate", 
      status: unit.status || "Draft",
      language: unit.language || "English", 
      learning_outcomes: unit.learning_outcomes || "",
      assessment_methods: unit.assessment_methods || "", 
      prerequisites: unit.prerequisites || "",
      schoolId: unit.school?.id || "", 
      programId: unit.program?.id || "" 
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.unit_code || !form.title) { toast.error("Course code and title are required"); return; }
    setSaving(true);
    try {
      const payload: any = { 
        ...form, 
        credits: form.credits ? Number(form.credits) : null,
        year_level: `${form.year} ${form.semester}`
      };
      if (form.schoolId) payload.school = { id: form.schoolId };
      if (form.programId) payload.program = { id: form.programId };
      delete payload.schoolId; delete payload.programId;
      delete payload.year; delete payload.semester;

      if (selected) {
        await patchApi(`/course-units/${selected.id}`, payload);
        toast.success("Course unit updated");
      } else {
        await postApi('/course-units', payload);
        toast.success("Course unit created");
      }
      setIsModalOpen(false);
      fetchUnits();
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course unit?")) return;
    try { await deleteApi(`/course-units/${id}`); toast.success("Deleted"); fetchUnits(); }
    catch { toast.error("Delete failed"); }
  };

  // Filter units solely by status on the client for instant UX (since status is low-cardinality)
  const filtered = units.filter(u => {
    return !filterStatus || u.status === filterStatus;
  });

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tighter">
            Course Unit Registry
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Manage reusable academic modules across programmes and schools.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          <span>New Course Unit</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text" placeholder="Search by title, code, or department..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 p-4 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
          className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary text-slate-600"
        >
          <option value="">All Schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}
        </select>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary text-slate-600"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Capacity", val: totalUnits },
          { label: "Available in Registry", val: units.length },
          { label: "Page Offset", val: `${page}/${totalPages}` },
          { label: "Schools Linked", val: schools.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-100 p-6">
            <div className="text-3xl font-black text-primary-darker">{stat.val}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center border-4 border-dashed border-slate-100">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 uppercase font-black tracking-widest text-sm">No course units found</p>
          <button onClick={openCreate} className="mt-6 btn-primary py-3 px-8 text-xs font-black uppercase tracking-widest">
            Create First Unit
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">School</div>
            <div className="col-span-1">Level</div>
            <div className="col-span-1">Credits</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((unit, i) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group"
            >
              <div className="col-span-2">
                <span className="font-black text-primary text-xs uppercase tracking-widest">{unit.unit_code}</span>
              </div>
              <div className="col-span-3">
                <p className="font-black text-primary-darker text-sm uppercase tracking-tight line-clamp-1">{unit.title}</p>
                {unit.department && <p className="text-[10px] text-slate-400 uppercase tracking-widest">{unit.department}</p>}
              </div>
              <div className="col-span-2 text-xs font-bold text-slate-500">{unit.school?.name || unit.school?.title || "Registry Entry"}</div>
              <div className="col-span-1 text-xs font-bold text-slate-500">{unit.program?.title || "—"}</div>
              <div className="col-span-1 text-xs font-bold text-slate-500">{unit.credits || "0"}</div>
              <div className="col-span-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-sm ${STATUS_COLORS[unit.status] || "bg-slate-100 text-slate-500"}`}>
                  {unit.status}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(unit)} className="p-3 text-slate-300 hover:text-primary transition-colors bg-white hover:shadow-md rounded-xl border border-slate-100">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(unit.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-white hover:shadow-md rounded-xl border border-slate-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          
          {/* Enhanced Pagination Container */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
             <ServerPagination 
               currentPage={page} 
               totalPages={totalPages} 
               onPageChange={(p: number) => setPage(p)} 
               total={totalUnits}
               limit={limit}
             />
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-darker/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="p-8 bg-primary-darker text-white flex justify-between items-center flex-shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{selected ? "Edit Course Unit" : "New Course Unit"}</h3>
                  <p className="text-slate-400 text-xs mt-1">{selected ? `Editing: ${selected.unit_code}` : "Create a new reusable academic module"}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto p-8 space-y-8 flex-1">
                
                {/* Identity */}
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 mb-6">Core Identity</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Code *</label>
                      <input value={form.unit_code} onChange={e => f("unit_code", e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 p-4 font-black text-primary outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest"
                        placeholder="e.g. CSC 1101" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credits</label>
                      <input type="number" value={form.credits} onChange={e => f("credits", e.target.value)}
                        className="w-full bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 3" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title (English) *</label>
                      <input value={form.title} onChange={e => f("title", e.target.value)}
                        className="w-full bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-primary" placeholder="Full course title" />
                    </div>
                  </div>
                </section>

                {/* Classification */}
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 mb-6">Classification & Assignment</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <SearchableSelect label="School / Faculty" options={schools} value={form.schoolId}
                      onChange={v => f("schoolId", v)} placeholder="Select school..." getId={o => o.id} getLabel={o => o.name} />
                    <SearchableSelect label="Primary Programme" options={programmes} value={form.programId}
                      onChange={v => f("programId", v)} placeholder="Select programme..." getId={o => o.id} getLabel={o => o.title} />
                    
                    <SearchableSelect label="Department" options={DEPARTMENTS.map(d => ({id: d, name: d}))} value={form.department}
                      onChange={v => f("department", v)} placeholder="Select department..." getId={o => o.id} getLabel={o => o.name} />

                    <CleanSelect label="Study Level" options={STUDY_LEVELS} value={form.study_level}
                      onChange={v => f("study_level", v)} placeholder="Select level..." />

                    <div className="grid grid-cols-2 gap-4">
                      <CleanSelect label="Academic Year" options={YEARS} value={form.year}
                        onChange={v => f("year", v)} placeholder="Year..." />
                      <CleanSelect label="Semester" options={SEMESTERS} value={form.semester}
                        onChange={v => f("semester", v)} placeholder="Sem..." />
                    </div>

                    <CleanSelect label="Instruction Language" options={LANGUAGES} value={form.language}
                      onChange={v => f("language", v)} placeholder="Select..." />
                  </div>
                </section>

                {/* Content */}
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 mb-6">Descriptions & Outcomes</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (English)</label>
                       <RichTextEditor 
                         content={form.description} 
                         onChange={html => f("description", html)} 
                         placeholder="Detailed syllabus and exploration of core principles..." 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Learning Outcomes</label>
                       <RichTextEditor 
                         content={form.learning_outcomes} 
                         onChange={html => f("learning_outcomes", html)} 
                         placeholder="By the end of this course, students will be able to..." 
                       />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment Methods</label>
                         <RichTextEditor 
                           content={form.assessment_methods} 
                           onChange={html => f("assessment_methods", html)} 
                           placeholder="Assignments, exams, projects..." 
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prerequisites</label>
                         <RichTextEditor 
                           content={form.prerequisites} 
                           onChange={html => f("prerequisites", html)} 
                           placeholder="Required courses or qualifications..." 
                         />
                       </div>
                    </div>
                  </div>
                </section>

                {/* Workflow */}
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 mb-6">Publication Status</h4>
                  <div className="flex space-x-4">
                    {STATUSES.map(s => (
                      <button key={s} type="button" onClick={() => f("status", s)}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-2 transition-all ${form.status === s ? "border-primary bg-primary text-white" : "border-slate-200 text-slate-400 hover:border-slate-400"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Modal footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4 flex-shrink-0">
                <button onClick={() => setIsModalOpen(false)}
                  className="py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary py-4 px-10 flex items-center space-x-3 text-xs font-black uppercase tracking-widest shadow-xl disabled:opacity-50">
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>{selected ? "Save Changes" : "Create Unit"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
