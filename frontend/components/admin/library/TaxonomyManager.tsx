"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Tag, 
  Plus, 
  X, 
  Save, 
  Loader2, 
  Trash2, 
  Globe,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  getEResourceProviders, 
  getEResourceSubjects, 
  createEResourceProvider, 
  createEResourceSubject,
  deleteApi
} from '@/lib/api';
import { toast } from 'react-hot-toast';
import { usePermission } from '@/hooks/useAdminPermissions';

export default function TaxonomyManager() {
  const { can: canManage } = usePermission('knowledge_hub.manage');
  const [providers, setProviders] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProvider, setNewProvider] = useState({ name: '', website: '', logo_url: '' });
  const [newSubject, setNewSubject] = useState({ name: '', slug: '' });
  const [savingP, setSavingP] = useState(false);
  const [savingS, setSavingS] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        getEResourceProviders(),
        getEResourceSubjects()
      ]);
      setProviders(p);
      setSubjects(s);
    } catch (error) {
      toast.error("Failed to load taxonomies");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to add providers');
      return;
    }
    setSavingP(true);
    try {
      await createEResourceProvider(newProvider);
      toast.success("Provider added");
      setNewProvider({ name: '', website: '', logo_url: '' });
      fetchData();
    } catch (error) {
      toast.error("Failed to add provider");
    } finally {
      setSavingP(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to add subjects');
      return;
    }
    setSavingS(true);
    try {
      await createEResourceSubject(newSubject);
      toast.success("Subject added");
      setNewSubject({ name: '', slug: '' });
      fetchData();
    } catch (error) {
      toast.error("Failed to add subject");
    } finally {
      setSavingS(false);
    }
  };

  const handleDelete = async (type: 'providers' | 'subjects', id: string) => {
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to remove taxonomies');
      return;
    }
    if (!window.confirm(`Are you sure? This might affect resources linked to this ${type.slice(0, -1)}.`)) return;
    try {
      await deleteApi(`/library/e-resources/${type}/${id}`);
      toast.success("Reference removed");
      fetchData();
    } catch (error) {
      toast.error("Protected reference cannot be removed");
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-primary-darker p-12 text-white relative shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 -translate-y-1/2 translate-x-1/2 rotate-12" />
        <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 font-serif tracking-tighter italic text-primary">Taxonomy <span className="text-white not-italic">Governance</span></h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Manage the structural metadata for the E-Resource ecosystem including scholarly providers and subject classifications.
            </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Providers Management */}
        <div className="space-y-8">
           <div className="bg-white p-10 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-8 flex items-center gap-3">
                 <Building2 size={16} />
                 Scholarly Providers
              </h3>
              
              {canManage && (
              <form onSubmit={handleAddProvider} className="space-y-4 mb-10 pb-10 border-b border-slate-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      type="text" 
                      placeholder="Provider Name (e.g. JSTOR)"
                      className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary outline-none"
                      value={newProvider.name}
                      onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    />
                    <input 
                      type="url" 
                      placeholder="Website URL"
                      className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary outline-none"
                      value={newProvider.website}
                      onChange={(e) => setNewProvider({ ...newProvider, website: e.target.value })}
                    />
                 </div>
                 <button 
                   disabled={savingP}
                   className="w-full py-4 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                 >
                   {savingP ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                   Enrol Provider
                 </button>
              </form>
              )}

              <div className="space-y-2">
                 {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                 ) : providers.map(p => (
                   <div key={p.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-300">
                            <Building2 size={14} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary-darker">{p.name}</p>
                            {p.website && <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">{p.website}</p>}
                         </div>
                      </div>
                      {canManage && (
                      <button 
                        onClick={() => handleDelete('providers', p.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Subjects Management */}
        <div className="space-y-8">
           <div className="bg-white p-10 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-8 flex items-center gap-3">
                 <Tag size={16} />
                 Subject Classifications
              </h3>

              {canManage && (
              <form onSubmit={handleAddSubject} className="space-y-4 mb-10 pb-10 border-b border-slate-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      required
                      type="text" 
                      placeholder="Subject Name"
                      className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary outline-none"
                      value={newSubject.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewSubject({ 
                          name, 
                          slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
                        });
                      }}
                    />
                    <input 
                      required
                      type="text" 
                      placeholder="Automated Slug"
                      className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary outline-none font-mono"
                      value={newSubject.slug}
                      readOnly
                    />
                 </div>
                 <button 
                   disabled={savingS}
                   className="w-full py-4 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                 >
                   {savingS ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                   Define Subject
                 </button>
              </form>
              )}

              <div className="grid grid-cols-2 gap-2">
                 {loading ? (
                    <div className="col-span-2 py-20 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
                 ) : subjects.map(s => (
                   <div key={s.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3">
                         <Tag size={12} className="text-slate-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{s.name}</span>
                      </div>
                      {canManage && (
                      <button 
                        onClick={() => handleDelete('subjects', s.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <X size={14} />
                      </button>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
