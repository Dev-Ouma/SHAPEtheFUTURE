"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  BookOpen, 
  Settings, 
  Globe, 
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X
} from 'lucide-react';
import { getLibraryInfoLiteracy, updateLibraryInfoLiteracy } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { usePermission } from '@/hooks/useAdminPermissions';

export default function InfoLiteracyConfigForm() {
  const { can: canManage } = usePermission('knowledge_hub.manage');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'basics' | 'competencies' | 'framework' | 'integrity'>('basics');
  
  const [formData, setFormData] = useState<any>({
    title: '',
    intro_content: '',
    core_competencies: [],
    research_steps: [],
    evaluation_framework: [],
    plagiarism_content: '',
    citation_styles: [],
    meta_title: '',
    meta_description: '',
    primary_cta_label: '',
    primary_cta_link: '',
    secondary_cta_label: '',
    secondary_cta_link: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getLibraryInfoLiteracy();
      if (data) setFormData(data);
    } catch (error) {
      toast.error("Failed to fetch configuration");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to update literacy config');
      return;
    }
    setLoading(true);
    try {
      await updateLibraryInfoLiteracy(formData);
      toast.success("Institutional Literacy Standards Updated");
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field: string, defaultValue: any) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultValue] });
  };

  const removeItem = (field: string, index: number) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData({ ...formData, [field]: updated });
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 italic">Accessing Academic Governance...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-24">
      {/* Header Section */}
      <section className="bg-primary-darker p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 -translate-y-1/2 translate-x-1/2 rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-widest">Library Orchestration</span>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Institutional Standards</span>
            </div>
            <h2 className="text-4xl font-black font-serif italic tracking-tighter">
              Information <span className="text-primary not-italic">Literacy Config</span>
            </h2>
          </div>
          {canManage ? (
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3 min-w-[200px] justify-center shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Deploy Framework
          </button>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">View only</span>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'basics', label: 'Basics & Hero' },
          { id: 'competencies', label: 'Competencies' },
          { id: 'framework', label: 'Evaluation' },
          { id: 'integrity', label: 'Integrity & Style' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Tab Content: Basics */}
        {activeTab === 'basics' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Identity & Hero</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Page Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Meta Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary outline-none transition-all"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Introductory Philosophy</label>
                <textarea 
                  rows={4}
                  className="w-full bg-slate-50 p-5 text-[11px] font-bold border border-transparent focus:border-primary outline-none transition-all resize-none"
                  value={formData.intro_content}
                  onChange={(e) => setFormData({ ...formData, intro_content: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Global Call to Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-primary tracking-widest">Primary CTA</p>
                    <div className="space-y-4">
                       <input 
                         placeholder="Label"
                         className="w-full bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary transition-all outline-none"
                         value={formData.primary_cta_label}
                         onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                       />
                       <input 
                         placeholder="Link (/path or #anchor)"
                         className="w-full bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary transition-all outline-none font-mono"
                         value={formData.primary_cta_link}
                         onChange={(e) => setFormData({ ...formData, primary_cta_link: e.target.value })}
                       />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Secondary CTA</p>
                    <div className="space-y-4">
                       <input 
                         placeholder="Label"
                         className="w-full bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary transition-all outline-none"
                         value={formData.secondary_cta_label}
                         onChange={(e) => setFormData({ ...formData, secondary_cta_label: e.target.value })}
                       />
                       <input 
                         placeholder="Link"
                         className="w-full bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary transition-all outline-none font-mono"
                         value={formData.secondary_cta_link}
                         onChange={(e) => setFormData({ ...formData, secondary_cta_link: e.target.value })}
                       />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Competencies */}
        {activeTab === 'competencies' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Information Competencies</h3>
                  <button 
                    type="button"
                    onClick={() => addItem('core_competencies', { title: '', desc: '', icon: 'BookOpen' })}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-darker transition-colors"
                  >
                    <Plus size={14} /> Add Pillar
                  </button>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {formData.core_competencies.map((pill: any, i: number) => (
                    <div key={i} className="flex gap-4 p-6 bg-slate-50 border border-slate-100 group">
                       <div className="w-12 h-12 bg-white flex items-center justify-center shrink-0 border border-slate-100 text-slate-300">
                          <BookOpen size={20} />
                       </div>
                       <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input 
                            placeholder="Skill Title"
                            className="bg-transparent border-b border-slate-200 focus:border-primary text-[11px] font-black uppercase tracking-widest outline-none py-2"
                            value={pill.title}
                            onChange={(e) => {
                              const updated = [...formData.core_competencies];
                              updated[i].title = e.target.value;
                              setFormData({ ...formData, core_competencies: updated });
                            }}
                          />
                          <input 
                            placeholder="Description"
                            className="bg-transparent border-b border-slate-200 focus:border-primary text-[11px] font-medium text-slate-500 outline-none py-2"
                            value={pill.desc}
                            onChange={(e) => {
                              const updated = [...formData.core_competencies];
                              updated[i].desc = e.target.value;
                              setFormData({ ...formData, core_competencies: updated });
                            }}
                          />
                       </div>
                       <button onClick={() => removeItem('core_competencies', i)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Research Process Timeline</h3>
                  <button 
                    type="button"
                    onClick={() => addItem('research_steps', '')}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-darker transition-colors"
                  >
                    <Plus size={14} /> Add Step
                  </button>
               </div>
               <div className="space-y-2">
                  {formData.research_steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <span className="w-8 h-8 flex items-center justify-center bg-primary-darker text-white text-[10px] font-black rounded-full shrink-0 shadow-sm">{i + 1}</span>
                       <input 
                         className="flex-grow bg-slate-50 p-4 text-[11px] font-medium border border-transparent focus:border-primary outline-none transition-all"
                         value={step}
                         onChange={(e) => updateArrayItem('research_steps', i, e.target.value)}
                       />
                       <button onClick={() => removeItem('research_steps', i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Framework */}
        {activeTab === 'framework' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-primary-darker p-12 shadow-xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Sparkles size={80} className="text-white" />
                </div>
                <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-8">
                   <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">Academic Standard</h3>
                      <h4 className="text-2xl font-black font-serif italic text-white tracking-tighter">Evaluation Framework <span className="text-slate-500 not-italic">(CRAAP)</span></h4>
                   </div>
                   <button 
                    type="button"
                    onClick={() => addItem('evaluation_framework', { l: 'Factor', d: '' })}
                    className="px-6 py-3 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-primary-darker transition-all"
                  >
                    <Plus size={14} className="inline mr-2" /> Append Metric
                  </button>
                </div>

                <div className="space-y-4">
                   {formData.evaluation_framework.map((metric: any, i: number) => (
                     <div key={i} className="flex gap-6 items-center p-6 bg-white/5 border border-white/10 group">
                        <div className="w-12 h-12 bg-primary/20 text-primary text-2xl font-black flex items-center justify-center shrink-0">
                           {metric.l[0] || '?'}
                        </div>
                        <div className="flex-grow flex flex-col md:flex-row gap-4">
                           <input 
                             placeholder="Label (e.g. Currency)"
                             className="bg-transparent border-b border-white/20 text-white text-[11px] font-black uppercase tracking-widest outline-none py-2 md:w-1/3"
                             value={metric.l}
                             onChange={(e) => {
                               const updated = [...formData.evaluation_framework];
                               updated[i].l = e.target.value;
                               setFormData({ ...formData, evaluation_framework: updated });
                             }}
                           />
                           <input 
                             placeholder="Guideline Description"
                             className="bg-transparent border-b border-white/20 text-slate-400 text-[11px] font-medium outline-none py-2 md:w-2/3"
                             value={metric.d}
                             onChange={(e) => {
                               const updated = [...formData.evaluation_framework];
                               updated[i].d = e.target.value;
                               setFormData({ ...formData, evaluation_framework: updated });
                             }}
                           />
                        </div>
                        <button onClick={() => removeItem('evaluation_framework', i)} className="text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Tab Content: Integrity */}
        {activeTab === 'integrity' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Academic Integrity Clause</h3>
                <textarea 
                  rows={6}
                  className="w-full bg-slate-50 p-6 text-sm font-medium border border-transparent focus:border-primary outline-none transition-all leading-relaxed"
                  value={formData.plagiarism_content}
                  onChange={(e) => setFormData({ ...formData, plagiarism_content: e.target.value })}
                />
             </div>

             <div className="bg-white p-12 border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Official Citation Styles</h3>
                   <div className="flex gap-2">
                       <input 
                         id="new-style"
                         type="text" 
                         placeholder="e.g. Chicago"
                         className="bg-slate-50 px-4 py-2 text-[10px] font-black uppercase outline-none border border-transparent focus:border-primary"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             const input = e.currentTarget;
                             if (input.value) {
                               setFormData({ ...formData, citation_styles: [...formData.citation_styles, input.value] });
                               input.value = '';
                             }
                           }
                         }}
                       />
                       <button 
                         type="button"
                         onClick={() => {
                           const input = document.getElementById('new-style') as HTMLInputElement;
                           if (input.value) {
                             setFormData({ ...formData, citation_styles: [...formData.citation_styles, input.value] });
                             input.value = '';
                           }
                         }}
                         className="bg-primary-darker text-white px-4 py-2 text-[10px] font-black uppercase"
                       >
                         Add
                       </button>
                   </div>
                </div>
                <div className="flex flex-wrap gap-3">
                   {formData.citation_styles.map((style: string, i: number) => (
                     <div key={i} className="flex items-center gap-3 bg-slate-50 px-6 py-4 border border-slate-100 group transition-all hover:border-primary/20">
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary-darker">{style}</span>
                        <button onClick={() => removeItem('citation_styles', i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                           <X size={14} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </form>
  );
}
