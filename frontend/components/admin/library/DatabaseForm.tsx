"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Database, 
  Globe, 
  Lock, 
  ExternalLink,
  Loader2,
  Trash2
} from 'lucide-react';
import { postApi, patchApi, getApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

import CustomSelect from '@/components/admin/CustomSelect';

interface DatabaseFormProps {
  id?: string;
  initialData?: any;
}

const CATEGORIES = [
  { label: 'Multidisciplinary', value: 'Multidisciplinary' },
  { label: 'Science & Technology', value: 'Science & Technology' },
  { label: 'Humanities & Social Sciences', value: 'Humanities & Social Sciences' },
  { label: 'Health & Medicine', value: 'Health & Medicine' },
  { label: 'Law & Policy', value: 'Law & Policy' },
  { label: 'Business & Economics', value: 'Business & Economics' },
  { label: 'Open Access', value: 'Open Access' }
];

export default function DatabaseForm({ id, initialData }: DatabaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    description: '',
    access_url: '',
    category: 'Multidisciplinary',
    is_premium: true,
    status: 'Published',
    metadata: {}
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        provider: initialData.provider || '',
        description: initialData.description || '',
        access_url: initialData.access_url || '',
        category: initialData.category || 'Multidisciplinary',
        is_premium: initialData.is_premium ?? true,
        status: initialData.status || 'Published',
        metadata: initialData.metadata || {}
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await patchApi(`/library/databases/${id}`, formData);
        toast.success("Database updated successfully");
      } else {
        await postApi('/library/databases', formData);
        toast.success("Database created successfully");
      }
      router.push('/admin/library/databases');
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-5xl mx-auto pb-24">
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-primary-darker p-10 text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary flex items-center justify-center rotate-3">
              <Database size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter font-serif italic">
                {id ? 'Edit' : 'New'} <span className="text-primary not-italic">Database</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Resource Configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-white hover:text-primary-darker text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {id ? 'Update Changes' : 'Publish Resource'}
            </button>
          </div>
        </div>

        <div className="p-12 space-y-10">
          {/* Main Info */}
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Database Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. ScienceDirect"
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Provider / Publisher</label>
              <input 
                type="text" 
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g. Elsevier"
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief summary of what this database offers to researchers..."
              className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Access URL</label>
              <div className="relative group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="url" 
                  required
                  value={formData.access_url}
                  onChange={(e) => setFormData({ ...formData, access_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border-none p-5 pl-14 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="space-y-3">
               <CustomSelect 
                 label="Resource Category"
                 options={CATEGORIES}
                 value={formData.category}
                 onChange={(val) => setFormData({ ...formData, category: val })}
               />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 pt-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => setFormData({ ...formData, is_premium: !formData.is_premium })}>
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center transition-colors ${formData.is_premium ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Premium Access</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Requires Student/Faculty Login</p>
                  </div>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_premium ? 'bg-primary' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_premium ? 'right-1' : 'left-1'}`} />
               </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => setFormData({ ...formData, status: formData.status === 'Published' ? 'Draft' : 'Published' })}>
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center transition-colors ${formData.status === 'Published' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Visibility Status</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{formData.status}</p>
                  </div>
               </div>
               <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.status === 'Published' ? 'right-1' : 'left-1'}`} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
