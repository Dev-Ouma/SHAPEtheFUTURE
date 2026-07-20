"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, ArrowLeft, Upload, FileText, Globe, Lock, Plus, Trash2, Loader2, Search, Briefcase, Calendar, DollarSign, Users } from 'lucide-react';
import { getApi, postApi, patchApi, getSchools, getDepartments, getStaffDirectory } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [schools, setSchools] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'ongoing',
    budget: '',
    currency: 'KES',
    principal_investigator_id: '',
    team_member_ids: [],
    school_id: '',
    external_partners: '',
    research_themes: [],
    meta_title: '',
    meta_description: ''
  });

  const [themeInput, setThemeInput] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  const filteredStaff = staff.filter(m => 
    m.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    m.job_title?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsData, staffResponse] = await Promise.all([
          getSchools(),
          getStaffDirectory(undefined, undefined, undefined, 1000)
        ]);
        setSchools(schoolsData);
        const staffResponseTyped = staffResponse as any;
        setStaff(Array.isArray(staffResponseTyped) ? staffResponseTyped : (staffResponseTyped.data || []));

        if (isEdit) {
          const project = await getApi(`/research/projects/${id}`);
          setFormData({
            ...project,
            school_id: project.school?.id || '',
            principal_investigator_id: project.principal_investigator?.id || '',
            team_member_ids: project.team_members?.map((m: any) => m.id) || [],
            research_themes: project.research_themes || [],
            start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
            end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
          });
        }
      } catch (e) {
        toast.error('Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await patchApi(`/research/projects/${id}`, formData);
        toast.success('Project updated');
      } else {
        await postApi('/research/projects', formData);
        toast.success('Project initiated');
      }
      router.push('/admin/research/projects');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const addTheme = () => {
    if (!themeInput.trim()) return;
    if (formData.research_themes.includes(themeInput.trim())) return;
    setFormData({ ...formData, research_themes: [...formData.research_themes, themeInput.trim()] });
    setThemeInput("");
  };

  const removeTheme = (theme: string) => {
    setFormData({ ...formData, research_themes: formData.research_themes.filter((t: string) => t !== theme) });
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading project data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary-darker hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-primary-darker tracking-tight uppercase italic font-serif">
              {isEdit ? 'Modify Initiative' : 'Initiation Protocol'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Research Project v1.0</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/admin/research/projects')}
            className="px-8 py-4 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="px-10 py-4 bg-[#037b90] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] transition-all shadow-xl shadow-[#037b90]/20 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Commit Changes' : 'Launch Project'}
          </button>
        </div>
      </div>

      <form className="space-y-12 pb-32">
        {/* Core Identity */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 flex items-center justify-center opacity-10 rotate-12">
              <Briefcase size={80} />
           </div>
           
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Project Identity
           </h2>

           <div className="grid grid-cols-1 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Official project designation..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Canonical Slug</label>
                  <input 
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="project-slug-identifier"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Administrative School</label>
                  <select 
                    value={formData.school_id}
                    onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-xs font-black uppercase tracking-widest border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner cursor-pointer appearance-none"
                  >
                    <option value="">Host Institution / School</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name || s.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Narrative Description</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Detailed project summary and research objectives..."
                />
              </div>
           </div>
        </section>

        {/* Personnel & Teams */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Research Personnel
           </h2>

           <div className="grid grid-cols-1 gap-12">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Principal Investigator (Lead)</label>
                 <select 
                   value={formData.principal_investigator_id}
                   onChange={(e) => setFormData({...formData, principal_investigator_id: e.target.value})}
                   className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner appearance-none"
                 >
                    <option value="">Select Lead Investigator</option>
                    {staff.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                 </select>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between gap-4 mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Team Members</label>
                    <div className="relative w-full sm:w-64">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" 
                         value={staffSearch}
                         onChange={(e) => setStaffSearch(e.target.value)}
                         placeholder="Filter personnel..."
                         className="w-full bg-slate-100 border-none pl-10 pr-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner"
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-slate-50 border border-slate-100 shadow-inner">
                    {filteredStaff.map(member => (
                       <label key={member.id} className={`flex items-center gap-3 p-3 bg-white border cursor-pointer hover:border-primary/30 transition-all select-none ${formData.team_member_ids.includes(member.id) ? 'border-primary ring-1 ring-primary/10' : 'border-slate-100'}`}>
                          <input 
                            type="checkbox"
                            checked={formData.team_member_ids.includes(member.id)}
                            onChange={(e) => {
                               const ids = e.target.checked 
                                ? [...formData.team_member_ids, member.id]
                                : formData.team_member_ids.filter((id: string) => id !== member.id);
                               setFormData({...formData, team_member_ids: ids});
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary rounded-none"
                          />
                          <span className={`text-[10px] font-black uppercase tracking-widest line-clamp-1 ${formData.team_member_ids.includes(member.id) ? 'text-primary' : 'text-slate-600'}`}>
                            {member.full_name}
                          </span>
                       </label>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Resources & Timeline */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Timeline & Resources
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Launch Date</label>
                       <input 
                         type="date"
                         value={formData.start_date}
                         onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                         className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provisional End</label>
                       <input 
                         type="date"
                         value={formData.end_date}
                         onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                         className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Protocol</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['ongoing', 'completed', 'planned'].map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({...formData, status: s})}
                            className={`py-4 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.status === s ? 'bg-primary-darker border-slate-950 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                          >
                             {s}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</label>
                       <select 
                         value={formData.currency}
                         onChange={(e) => setFormData({...formData, currency: e.target.value})}
                         className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner appearance-none"
                       >
                          <option value="KES">KES</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                       </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget Appropriation</label>
                       <div className="relative">
                          <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input 
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                            placeholder="Amount..."
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Research Themes (Classification)</label>
                    <div className="flex gap-2">
                       <input 
                         type="text"
                         value={themeInput}
                         onChange={(e) => setThemeInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                         className="flex-1 bg-slate-50 p-4 text-xs font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                         placeholder="New theme..."
                       />
                       <button type="button" onClick={addTheme} className="px-6 bg-primary-darker text-white text-[10px] font-black uppercase hover:bg-primary transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                       {formData.research_themes.map((t: string) => (
                          <span key={t} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                             {t}
                             <button type="button" onClick={() => removeTheme(t)} className="text-red-400 hover:text-red-500"><X size={12} /></button>
                          </span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </form>
    </div>
  );
}
