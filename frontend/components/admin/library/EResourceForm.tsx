"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Globe, 
  Lock, 
  Unlock, 
  Link as LinkIcon, 
  FileText, 
  BookOpen, 
  Database as DbIcon,
  Tag,
  Building2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Eye,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getEResourceProviders, 
  getEResourceSubjects, 
  createEResource, 
  updateEResource,
  getEResource
} from '@/lib/api';
import { toast } from 'react-hot-toast';
import CustomSelect from '../CustomSelect';

interface EResourceFormProps {
  id?: string;
  initialData?: any;
}

export default function EResourceForm({ id, initialData }: EResourceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id && !initialData);
  const [providers, setProviders] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'access' | 'seo'>('content');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    resource_type: 'E-Book',
    access_type: 'Open Access',
    requires_login: false,
    access_instructions: '',
    external_url: '',
    file_url: '',
    thumbnail_url: '',
    is_featured: false,
    status: 'Published',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    providerId: '',
    subjectIds: [] as string[]
  });

  useEffect(() => {
    fetchTaxonomies();
    if (id && !initialData) {
      loadResource();
    } else if (initialData) {
      mapInitialData(initialData);
    }
  }, [id, initialData]);

  const fetchTaxonomies = async () => {
    try {
      const [p, s] = await Promise.all([
        getEResourceProviders(),
        getEResourceSubjects()
      ]);
      setProviders(p);
      setSubjects(s);
    } catch (error) {
      toast.error("Failed to load providers or subjects");
    }
  };

  const loadResource = async () => {
    setFetching(true);
    try {
      const data = await getEResource(id!);
      if (data) mapInitialData(data);
    } catch (error) {
      toast.error("Failed to load resource data");
    } finally {
      setFetching(false);
    }
  };

  const mapInitialData = (data: any) => {
    setFormData({
      ...formData,
      title: data.title || '',
      slug: data.slug || '',
      summary: data.summary || '',
      description: data.description || '',
      resource_type: data.resource_type || 'E-Book',
      access_type: data.access_type || 'Open Access',
      requires_login: data.requires_login || false,
      access_instructions: data.access_instructions || '',
      external_url: data.external_url || '',
      file_url: data.file_url || '',
      thumbnail_url: data.thumbnail_url || '',
      is_featured: data.is_featured || false,
      status: data.status || 'Published',
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      meta_keywords: data.meta_keywords || '',
      providerId: data.provider?.id || '',
      subjectIds: data.subjects?.map((s: any) => s.id) || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await updateEResource(id, formData);
        toast.success("E-Resource updated successfully");
      } else {
        await createEResource(formData);
        toast.success("E-Resource created successfully");
      }
      router.push('/admin/library/e-resources');
      router.refresh();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Action failed";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (sid: string) => {
    const updated = formData.subjectIds.includes(sid)
       ? formData.subjectIds.filter(id => id !== sid)
       : [...formData.subjectIds, sid];
    setFormData({ ...formData, subjectIds: updated });
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 italic">Syncing Scholarly Metadata...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Header Section */}
        <section className="bg-primary-darker p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 -translate-y-1/2 translate-x-1/2 rotate-12" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-widest">Digital Content</span>
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Library Resource Hub</span>
              </div>
              <h2 className="text-4xl font-black font-serif italic tracking-tighter">
                 {id ? "Refine" : "Catalogue"} <span className="text-primary not-italic">E-Resource</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  type="button" 
                  onClick={() => router.back()}
                  className="px-8 py-5 border border-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
               >
                  Cancel
               </button>
               <button 
                  type="submit"
                  disabled={loading}
                  className="px-10 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3 min-w-[200px] justify-center shadow-xl shadow-primary/20"
               >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {id ? "Guard Changes" : "Index Resource"}
               </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
           {['content', 'access', 'seo'].map((tab) => (
             <button
               key={tab}
               type="button"
               onClick={() => setActiveTab(tab as any)}
               className={`px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                 activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {tab}
               {activeTab === tab && (
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
               )}
             </button>
           ))}
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Fields */}
          <div className="lg:col-span-2 space-y-12">
            
            {activeTab === 'content' && (
              <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-2">Primary Information</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="E.g. The Future of Higher Ed"
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Slug</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e-future-higher-ed"
                      className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all font-mono"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Resource Type</label>
                    <select 
                      className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all appearance-none uppercase"
                      value={formData.resource_type}
                      onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    >
                      {['E-Book', 'E-Journal', 'Database', 'Institutional Repository', 'Open Access Resource', 'Past Paper'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Summary (Discovery Snippet)</label>
                  <textarea 
                    rows={3}
                    placeholder="High-level abstract for listing cards..."
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all resize-none"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</label>
                  <textarea 
                    rows={10}
                    placeholder="Full textual analysis of the resource contents..."
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-8">Access Governance</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Type</label>
                        <div className="flex gap-4">
                           {['Open Access', 'Institutional Access'].map((type) => (
                             <button
                               key={type}
                               type="button"
                               onClick={() => setFormData({ ...formData, access_type: type })}
                               className={`flex-1 p-6 border transition-all text-center ${
                                 formData.access_type === type 
                                 ? 'border-primary bg-primary/5 text-primary' 
                                 : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                               }`}
                             >
                                <div className="flex flex-col items-center gap-2">
                                   {type === 'Open Access' ? <Unlock size={20} /> : <Lock size={20} />}
                                   <span className="text-[9px] font-black uppercase tracking-widest">{type}</span>
                                </div>
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Portal Authentication</label>
                         <button
                           type="button"
                           onClick={() => setFormData({ ...formData, requires_login: !formData.requires_login })}
                           className={`w-full p-6 border transition-all flex items-center justify-between ${
                             formData.requires_login 
                             ? 'border-primary bg-primary/5' 
                             : 'border-slate-100 opacity-60'
                           }`}
                         >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${formData.requires_login ? 'text-primary' : 'text-slate-400'}`}>
                               Requires OUK Login
                            </span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.requires_login ? 'bg-primary' : 'bg-slate-200'}`}>
                               <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.requires_login ? 'translate-x-4' : ''}`} />
                            </div>
                         </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                       <LinkIcon size={12} />
                       External Knowledge URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://scholar.google.com/..."
                      className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all font-mono"
                      value={formData.external_url}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                       <AlertCircle size={12} />
                       Special Access Instructions
                    </label>
                    <textarea 
                      rows={4}
                      placeholder="Instructions for off-campus VPN, specific library logins, etc..."
                      className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all"
                      value={formData.access_instructions}
                      onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-2">Search Engine Optimisation</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Title</label>
                  <input 
                    type="text" 
                    placeholder="Focus Keyword - Primary Title..."
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter meta description for search results..."
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all resize-none"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Index Keywords</label>
                  <input 
                    type="text" 
                    placeholder="comma, separated, keywords"
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary focus:bg-white outline-none transition-all"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Classifications */}
          <div className="space-y-12">
            <div className="bg-white p-10 border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Catalogue Registry</h3>
               
               {/* Provider Select */}
               <CustomSelect 
                  label="Scholar Provider"
                  options={providers.map(p => ({ label: p.name, value: p.id }))}
                  value={formData.providerId}
                  onChange={(val) => setFormData({ ...formData, providerId: val })}
                  placeholder="Select Repository..."
               />

               <div className="pt-6 border-t border-slate-50">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Subject Taxonomies</label>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                     {subjects.map((sub) => {
                       const isActive = formData.subjectIds.includes(sub.id);
                       return (
                         <button
                           key={sub.id}
                           type="button"
                           onClick={() => toggleSubject(sub.id)}
                           className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                             isActive 
                             ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                             : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                           }`}
                         >
                           {sub.name}
                         </button>
                       );
                     })}
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Visibility Status</label>
                     <div className="flex gap-2">
                        {['Draft', 'Published'].map(s => (
                           <button
                             key={s}
                             type="button"
                             onClick={() => setFormData({ ...formData, status: s })}
                             className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border ${
                               formData.status === s 
                               ? (s === 'Published' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-800 bg-primary-darker text-white') 
                               : 'border-slate-100 text-slate-300'
                             }`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    className={`w-full p-4 border transition-all flex items-center justify-between ${
                      formData.is_featured ? 'border-amber-500 bg-amber-50' : 'border-slate-100 opacity-60'
                    }`}
                  >
                     <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_featured ? 'text-amber-600' : 'text-slate-400'}`}>
                        Promote to Spotlight
                     </span>
                     <Star size={14} className={formData.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-300'} />
                  </button>
               </div>
            </div>

            {/* Thumbnail Upload Placeholder */}
            <div className="bg-slate-50 p-8 border border-slate-100 text-center space-y-4">
               <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto shadow-sm text-slate-300">
                  <ImageIcon size={24} />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Thumbnail</p>
               <button type="button" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Upload Collection Art</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Star({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
