"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, Check, ChevronDown } from 'lucide-react';
import { getApi, postApi, patchApi } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// ─── Custom Select Component ───────────────────────────────────────────────────
interface SelectProps {
    label?: string; value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
    searchable?: boolean;
}

function Select({ label, value, onChange, options, placeholder, disabled = false, searchable = false }: SelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        if (!open) { setQuery(""); return; }
        const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
    }, [open]);

    useEffect(() => {
        if (open && searchable) setTimeout(() => searchRef.current?.focus(), 60);
    }, [open, searchable]);

    const visible = searchable && query
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    return (
        <div className="space-y-1.5 w-full relative" ref={ref}>
            {label && <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">{label}</label>}
            <button
                type="button"
                onClick={() => !disabled && setOpen(o => !o)}
                disabled={disabled}
                className={[
                    "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-transparent text-sm font-medium text-left transition-all outline-none",
                    disabled ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : open ? "bg-white border-primary/20 ring-2 ring-primary/10 shadow-sm text-slate-800"
                            : "bg-slate-50 hover:bg-slate-100 text-primary-darker cursor-pointer",
                ].join(" ")}
            >
                <span className={`truncate ${!selected ? (disabled ? "text-slate-300" : "text-slate-400") : ""}`}>
                    {disabled ? "—" : (selected?.label ?? placeholder)}
                </span>
                <span className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-primary" : "text-slate-400"}`}>
                    <ChevronDown size={16} />
                </span>
            </button>

            {open && !disabled && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden origin-top"
                    style={{ animation: "ttDrop 0.14s ease-out both" }}>
                    {searchable && (
                        <div className="px-3 pt-3 pb-2 border-b border-slate-100 bg-slate-50">
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder={"Search " + placeholder.toLowerCase() + "..."}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    )}
                    <ul className="max-h-64 overflow-y-auto custom-scrollbar py-2 border-0 m-0 w-full" style={{ listStyle: "none" }}>
                        {visible.length === 0 ? (
                            <li className="px-4 py-3 text-xs text-slate-400 font-medium text-center">No results found</li>
                        ) : visible.map(o => {
                            const active = o.value === value;
                            return (
                                <li key={o.value}
                                    onClick={() => { onChange(o.value); setOpen(false); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group ${active ? "bg-primary/5 text-primary font-bold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
                                >
                                    <span className="truncate">{o.label}</span>
                                    {active && <Check size={14} className="text-primary" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
// ───────────────────────────────────────────────────────────────────────────────

function CareersFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [taxonomies, setTaxonomies] = useState<any>({ divisions: [], categories: [], specializations: [], departments: [] });

  const [formData, setFormData] = useState({
    title: '', title_sw: '', slug: '', reference_code: '', summary: '', summary_sw: '',
    description: '', description_sw: '',
    division_id: '', department_id: '', job_category_id: '', specialization_ids: [] as string[],
    employment_type: 'Full-time', experience_level: 'Mid-Level', job_grade: '', positions_available: 1,
    location: '', is_remote: false,
    responsibilities: '', responsibilities_sw: '', requirements: '', requirements_sw: '',
    qualifications: '', qualifications_sw: '', benefits: '', benefits_sw: '',
    additional_notes: '', additional_notes_sw: '',
    application_deadline: '', application_method: 'internal', application_url: '',
    status: 'Draft', is_featured: false, is_active: true
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [divs, cats, specs, depts] = await Promise.all([
          getApi('/careers/taxonomies/divisions'),
          getApi('/careers/taxonomies/categories'),
          getApi('/careers/taxonomies/specializations'),
          getApi('/menus') // Using standard departments if menus isn't right, just mock for now or omit if fetching fails.
        ]);
        setTaxonomies({ divisions: divs, categories: cats, specializations: specs, departments: [] });

        if (editId) {
          const job = await getApi(`/careers/admin/${editId}`);
          setFormData({
            ...job,
            division_id: job.division?.id || '',
            department_id: job.department?.id || '',
            job_category_id: job.job_category?.id || '',
            specialization_ids: job.specializations?.map((s: any) => s.id) || [],
            application_deadline: job.application_deadline ? new Date(job.application_deadline).toISOString().slice(0,16) : ''
          });
        }
      } catch (e) {
        toast.error('Failed to load form data');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'title') {
         next.slug = generateSlug(val as string);
         if (!editId && !next.reference_code) {
           next.reference_code = `OUK-${Math.floor(1000 + Math.random() * 9000)}`;
         }
      }
      return next;
    });
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSpecialization = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specialization_ids: prev.specialization_ids.includes(id) 
        ? prev.specialization_ids.filter(sid => sid !== id)
        : [...prev.specialization_ids, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        positions_available: Number(formData.positions_available),
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
      };

      if (editId) {
        await patchApi(`/careers/${editId}`, payload);
        toast.success('Job updated successfully');
      } else {
        await postApi('/careers', payload);
        toast.success('Job created successfully');
      }
      setTimeout(() => router.push('/admin/careers'), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-primary mr-2" /> Loading...</div>;
  }

  return (
    <div className="p-8 pb-32">
       <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/careers" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest mb-4 transition-colors">
               <ArrowLeft size={16} className="mr-3" /> Back to List
            </Link>
            <h1 className="text-2xl font-black text-primary-darker tracking-tight">{editId ? 'Edit Job Posting' : 'Create Job Posting'}</h1>
          </div>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-[#ff7f50] hover:text-white transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {editId ? 'Save Changes' : 'Publish Job'}
          </button>
       </div>

       <form onSubmit={handleSubmit} className="gap-8 flex flex-col md:flex-row items-start">
          <div className="w-full md:w-2/3 space-y-8">
             
             {/* Section 1: Basic Info */}
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 pb-4 border-b border-slate-50">Section 1: Basic Info</h3>
                
                <div className="space-y-5">
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Job Title *</label>
                     <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary-darker transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Job Title (Kiswahili)</label>
                     <input type="text" name="title_sw" value={formData.title_sw || ''} onChange={handleChange} placeholder="Kichwa cha Kiswahili…" className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary-darker transition-all" />
                   </div>
                   <div className="grid grid-cols-2 gap-5">
                     <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">URL Slug</label>
                       <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-slate-500 transition-all" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Reference Code *</label>
                       <input required type="text" name="reference_code" value={formData.reference_code} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-bold text-primary-darker uppercase transition-all" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Summary (Overview) *</label>
                     <textarea required name="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary-darker transition-all leading-relaxed" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Summary (Kiswahili)</label>
                     <textarea name="summary_sw" value={formData.summary_sw || ''} onChange={handleChange} rows={3} placeholder="Muhtasari wa Kiswahili…" className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary-darker transition-all leading-relaxed" />
                   </div>
                </div>
             </div>

             {/* Section 2: Application Configuration (Moved for visibility) */}
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 pb-4 border-b border-slate-50">Section 2: Application Config</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Application Deadline</label>
                       <input type="datetime-local" name="application_deadline" value={formData.application_deadline} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary-darker transition-all" />
                    </div>
                    <div>
                       <Select 
                         label="Application Method"
                         value={formData.application_method} 
                         onChange={(v) => handleSelectChange('application_method', v)}
                         options={[
                           {value: "internal", label: "Internal OUK Form"},
                           {value: "external", label: "External Link"}
                         ]}
                         placeholder="Select Method"
                       />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    {formData.application_method === 'external' ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">External Application URL *</label>
                        <input required type="url" name="application_url" placeholder="https://" value={formData.application_url} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-primary/20 rounded-xl outline-none font-medium text-primary transition-all" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Candidates will be redirected to this link when they click "Apply Now".</p>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center">
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Contact-based application (Direct Email)</p>
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Section 4: Content */}
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative z-0">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 pb-4 border-b border-slate-50">Section 4: Content (HTML Allowed)</h3>
                
                <div className="space-y-6">
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Full Description</label>
                     <RichTextEditor content={formData.description} onChange={(val) => handleRichTextChange('description', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Full Description (Kiswahili)</label>
                     <RichTextEditor content={formData.description_sw || ''} onChange={(val) => handleRichTextChange('description_sw', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Responsibilities</label>
                     <RichTextEditor content={formData.responsibilities} onChange={(val) => handleRichTextChange('responsibilities', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Responsibilities (Kiswahili)</label>
                     <RichTextEditor content={formData.responsibilities_sw || ''} onChange={(val) => handleRichTextChange('responsibilities_sw', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Requirements / Qualifications</label>
                     <RichTextEditor content={formData.requirements} onChange={(val) => handleRichTextChange('requirements', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Requirements (Kiswahili)</label>
                     <RichTextEditor content={formData.requirements_sw || ''} onChange={(val) => handleRichTextChange('requirements_sw', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Benefits</label>
                     <RichTextEditor content={formData.benefits} onChange={(val) => handleRichTextChange('benefits', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Benefits (Kiswahili)</label>
                     <RichTextEditor content={formData.benefits_sw || ''} onChange={(val) => handleRichTextChange('benefits_sw', val)} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Additional Notes (Kiswahili)</label>
                     <RichTextEditor content={formData.additional_notes_sw || ''} onChange={(val) => handleRichTextChange('additional_notes_sw', val)} />
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar Forms */}
          <div className="w-full md:w-1/3 space-y-8">
             
             {/* Status & Options */}
             <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative z-40">
                <div className="space-y-4">
                  <div>
                     <Select 
                       label="Status"
                       value={formData.status} 
                       onChange={(v) => handleSelectChange('status', v)}
                       options={[{value: "Draft", label: "Draft"}, {value: "Published", label: "Published"}, {value: "Closed", label: "Closed"}]}
                       placeholder="Select Status"
                     />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                     <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 accent-primary cursor-pointer" />
                     <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">Active (Visible)</label>
                  </div>
                </div>
             </div>

             {/* Section 2: Classification */}
             <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-5 relative z-30">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-3 border-b border-slate-50">2: Classification</h3>
                
                <div>
                   <Select 
                     label="Division"
                     value={formData.division_id} 
                     onChange={(v) => handleSelectChange('division_id', v)}
                     options={taxonomies.divisions.map((d: any) => ({value: d.id, label: d.name}))}
                     placeholder="-- Select Division --"
                     searchable
                   />
                </div>
                <div>
                   <Select 
                     label="Job Category"
                     value={formData.job_category_id} 
                     onChange={(v) => handleSelectChange('job_category_id', v)}
                     options={taxonomies.categories.map((c: any) => ({value: c.id, label: c.name}))}
                     placeholder="-- Select Category --"
                   />
                </div>
                <div className="relative z-0">
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Area of Specialisation</label>
                   <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-transparent">
                      {taxonomies.specializations.map((s: any) => (
                        <div key={s.id} onClick={() => toggleSpecialization(s.id)} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                           <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.specialization_ids.includes(s.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}>
                             {formData.specialization_ids.includes(s.id) && <Check size={12} strokeWidth={4} />}
                           </div>
                           <span className="text-xs font-bold text-slate-700">{s.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Section 3: Job Details */}
             <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-3 border-b border-slate-50">3: Job Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Positions</label>
                    <input type="number" name="positions_available" min="1" value={formData.positions_available} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-primary-darker" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Grade</label>
                    <input type="text" name="job_grade" placeholder="e.g. 12" value={formData.job_grade} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none font-medium text-primary-darker" />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Location</label>
                   <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none font-medium text-primary-darker" />
                </div>
                <div className="relative z-20">
                   <Select 
                     label="Employment Type"
                     value={formData.employment_type} 
                     onChange={(v) => handleSelectChange('employment_type', v)}
                     options={[
                       {value: "Full-time", label: "Full-time"},
                       {value: "Part-time", label: "Part-time"},
                       {value: "Contract", label: "Contract"},
                       {value: "Temporary", label: "Temporary"}
                     ]}
                     placeholder="Select Type"
                   />
                </div>
             </div>


          </div>
       </form>
    </div>
  );
}

export default function AdminCareersForm() {
   return (
     <Suspense fallback={<div className="p-8">Loading form...</div>}>
        <CareersFormInner />
     </Suspense>
   )
}
