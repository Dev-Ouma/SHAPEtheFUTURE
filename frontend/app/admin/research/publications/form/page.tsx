"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, ArrowLeft, Upload, FileText, Globe, Lock, Plus, Trash2, Loader2, Search } from 'lucide-react';
import { getApi, postApi, patchApi, getSchools, getDepartments, getStaffDirectory, uploadFile } from '@/lib/api';
import toast from 'react-hot-toast';
import PermissionGate from '@/components/admin/PermissionGate';

export default function PublicationForm() {
  return (
    <PermissionGate permission="programmes.manage">
      <PublicationFormInner />
    </PermissionGate>
  );
}

function PublicationFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    abstract: '',
    publication_year: new Date().getFullYear(),
    type: 'journal',
    school_id: '',
    department_id: '',
    author_ids: [],
    external_authors: '',
    journal_name: '',
    publisher: '',
    volume: '',
    issue: '',
    pages: '',
    issn_isbn: '',
    doi: '',
    url: '',
    pdf_file_url: '',
    is_open_access: true,
    access_level: 'public',
    keywords: [],
    status: 'Published',
    meta_title: '',
    meta_description: ''
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  const filteredStaff = staff.filter(m => 
    m.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    m.job_title?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsData, departmentsData, staffResponse] = await Promise.all([
          getSchools(),
          getDepartments(),
          getStaffDirectory(undefined, undefined, undefined, 1000)
        ]);
        setSchools(schoolsData);
        setDepartments(departmentsData);
        const staffResponseTyped = staffResponse as any;
        setStaff(Array.isArray(staffResponseTyped) ? staffResponseTyped : (staffResponseTyped.data || []));

        if (isEdit) {
          const pub = await getApi(`/research/publications/${id}`);
          if (!pub) {
            toast.error('Publication not found');
            setLoading(false);
            return;
          }
          setFormData({
            ...pub,
            school_id: pub.school?.id || '',
            department_id: pub.department?.id || '',
            author_ids: pub.staff_authors?.map((a: any) => a.id) || [],
            keywords: pub.keywords || []
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
        await patchApi(`/research/publications/${id}`, formData);
        toast.success('Publication updated');
      } else {
        await postApi('/research/publications', formData);
        toast.success('Publication created');
      }
      router.push('/admin/research/publications');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save publication');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() || "";
    if (ext !== 'PDF') {
      toast.error('Only PDF files are allowed');
      return;
    }

    const toastId = toast.loading('Uploading manuscript...');
    try {
      const res = await uploadFile(file);
      setFormData({ ...formData, pdf_file_url: res.url });
      toast.success('File uploaded', { id: toastId });
    } catch (e) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    if (formData.keywords.includes(keywordInput.trim())) return;
    setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
    setKeywordInput("");
  };

  const removeKeyword = (tag: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter((k: string) => k !== tag) });
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading publication data...</div>;

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
              {isEdit ? 'Refine Contribution' : 'Registry Entry'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Research Metadata v2.1</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/admin/research/publications')}
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
            {isEdit ? 'Commit Changes' : 'Archive Entry'}
          </button>
        </div>
      </div>

      <form className="space-y-12 pb-32">
        {/* Core Identity Section */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 flex items-center justify-center opacity-10 rotate-12">
              <FileText size={80} />
           </div>
           
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Scholarly Identity
           </h2>

           <div className="grid grid-cols-1 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publication Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  placeholder="Full title of the scholarly work..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Index Slug</label>
                  <input 
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="canonical-url-slug"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publication Year</label>
                  <input 
                    type="number"
                    value={formData.publication_year}
                    onChange={(e) => setFormData({...formData, publication_year: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Executive Abstract</label>
                <textarea 
                  rows={6}
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Summarize the core research findings and objectives..."
                />
              </div>
           </div>
        </section>

        {/* Authorship & Affiliation */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Authorship & Affiliations
           </h2>

           <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Researchers</label>
                    <div className="relative w-full sm:w-64 group">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#037b90] transition-colors" />
                       <input 
                         type="text" 
                         value={staffSearch}
                         onChange={(e) => setStaffSearch(e.target.value)}
                         placeholder="Find researcher..."
                         className="w-full bg-slate-100 border-none pl-10 pr-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-[#037b90] shadow-inner"
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-4 bg-slate-50 border border-slate-100 shadow-inner scrollbar-hide">
                    {filteredStaff.length === 0 ? (
                       <div className="col-span-full py-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No researchers found matched your search</div>
                    ) : filteredStaff.map(member => (
                       <label key={member.id} className={`flex items-center gap-3 p-3 bg-white border cursor-pointer hover:border-[#037b90]/30 transition-all select-none ${formData.author_ids.includes(member.id) ? 'border-[#037b90] ring-1 ring-[#037b90]/10' : 'border-slate-100'}`}>
                          <input 
                            type="checkbox"
                            checked={formData.author_ids.includes(member.id)}
                            onChange={(e) => {
                               const ids = e.target.checked 
                                ? [...formData.author_ids, member.id]
                                : formData.author_ids.filter((id: string) => id !== member.id);
                               setFormData({...formData, author_ids: ids});
                            }}
                            className="w-4 h-4 text-[#037b90] focus:ring-[#037b90] rounded-none border-slate-200"
                          />
                          <span className={`${formData.author_ids.includes(member.id) ? 'text-[#037b90]' : 'text-slate-600'} text-[10px] font-black uppercase tracking-widest line-clamp-1`}>{member.full_name}</span>
                       </label>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">External Collaborators (Comma Separated)</label>
                <input 
                  type="text"
                  value={formData.external_authors}
                  onChange={(e) => setFormData({...formData, external_authors: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Prof. John Doe, Dr. Jane Smith..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic School</label>
                    <select 
                      value={formData.school_id}
                      onChange={(e) => setFormData({...formData, school_id: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-xs font-black uppercase tracking-widest border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner cursor-pointer appearance-none"
                    >
                      <option value="">Select School</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</label>
                    <select 
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-xs font-black uppercase tracking-widest border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner cursor-pointer appearance-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </section>

        {/* Bibligraphic Data Section */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Bibliographic Metadata
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Journal / Conference Name</label>
                 <input 
                    type="text"
                    value={formData.journal_name}
                    onChange={(e) => setFormData({...formData, journal_name: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publisher</label>
                 <input 
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    placeholder="e.g. Elsevier, Springer..."
                 />
              </div>
              <div className="grid grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Volume</label>
                    <input 
                       type="text"
                       value={formData.volume}
                       onChange={(e) => setFormData({...formData, volume: e.target.value})}
                       className="w-full bg-slate-50 p-5 text-xs font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Issue</label>
                    <input 
                       type="text"
                       value={formData.issue}
                       onChange={(e) => setFormData({...formData, issue: e.target.value})}
                       className="w-full bg-slate-50 p-5 text-xs font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pages</label>
                    <input 
                       type="text"
                       value={formData.pages}
                       onChange={(e) => setFormData({...formData, pages: e.target.value})}
                       className="w-full bg-slate-50 p-5 text-xs font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOI / URI</label>
                 <input 
                    type="text"
                    value={formData.doi}
                    onChange={(e) => setFormData({...formData, doi: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    placeholder="10.xxxx/xxxx"
                 />
              </div>
           </div>
        </section>

        {/* Digital Assets & Access Section */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Digital Governance
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                       <Globe size={18} className="text-primary" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Open Access</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Global visibility enabled</span>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={formData.is_open_access}
                         onChange={(e) => setFormData({...formData, is_open_access: e.target.checked})}
                         className="sr-only peer" 
                       />
                       <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manuscript Upload (PDF)</label>
                    <div className="relative group">
                       <input 
                         type="file" 
                         accept=".pdf"
                         onChange={handleFileUpload}
                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
                       />
                       <div className="flex items-center gap-4 p-6 bg-slate-50 border-2 border-dashed border-slate-200 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                          <Upload size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                                {formData.pdf_file_url ? "Manuscript Indexed" : "Select Research PDF"}
                             </span>
                             <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest truncate max-w-[200px]">
                                {formData.pdf_file_url || "Max 25MB encoded"}
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Published', 'Draft'].map(s => (
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

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publication Taxonomy (Keywords)</label>
                    <div className="flex gap-2 mb-4">
                       <input 
                         type="text"
                         value={keywordInput}
                         onChange={(e) => setKeywordInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                         className="flex-1 bg-slate-50 p-4 text-xs font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                         placeholder="Add keyword..."
                       />
                       <button 
                         type="button"
                         onClick={addKeyword}
                         className="px-6 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                       >
                         Add
                       </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.keywords.map((tag: string) => (
                          <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500">
                             {tag}
                             <button type="button" onClick={() => removeKeyword(tag)} className="text-red-400 hover:text-red-500">
                                <X size={12} />
                             </button>
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
