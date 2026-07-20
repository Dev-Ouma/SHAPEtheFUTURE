"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  MonitorPlay, 
  Clock, 
  Loader2,
  Video,
  ExternalLink
} from 'lucide-react';
import { postApi, patchApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

import CustomSelect from '@/components/admin/CustomSelect';

interface TutorialFormProps {
  id?: string;
  initialData?: any;
}

const CATEGORIES = [
  { label: 'Research Basics', value: 'Research Basics' },
  { label: 'Advanced Searching', value: 'Advanced Searching' },
  { label: 'Citation Management', value: 'Citation Management' },
  { label: 'Software Tools', value: 'Software Tools' },
  { label: 'Academic Writing', value: 'Academic Writing' },
  { label: 'Digital Literacy', value: 'Digital Literacy' }
];

export default function TutorialForm({ id, initialData }: TutorialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Research Basics',
    duration: '10 Minutes',
    video_url: '',
    thumbnail_url: '',
    description: '',
    status: 'Published'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Research Basics',
        duration: initialData.duration || '',
        video_url: initialData.video_url || '',
        thumbnail_url: initialData.thumbnail_url || '',
        description: initialData.description || '',
        status: initialData.status || 'Published'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await patchApi(`/library/training/tutorials/${id}`, formData);
        toast.success("Tutorial updated successfully");
      } else {
        await postApi('/library/training/tutorials', formData);
        toast.success("Tutorial published successfully");
      }
      router.push('/admin/library/training');
      router.refresh();
    } catch (error) {
      toast.error("Failed to save tutorial");
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
              <MonitorPlay size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter font-serif italic">
                {id ? 'Edit' : 'New'} <span className="text-primary not-italic">Tutorial</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Self-Paced Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-white hover:text-primary-darker text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {id ? 'Update Content' : 'Publish Tutorial'}
            </button>
          </div>
        </div>

        <div className="p-12 space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tutorial Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <CustomSelect 
                 label="Category"
                 options={CATEGORIES}
                 value={formData.category}
                 onChange={(val) => setFormData({ ...formData, category: val })}
               />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (approx.)</label>
              <input 
                type="text" 
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 15 Minutes"
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Video Content URL</label>
            <div className="relative group">
              <Video className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="url" 
                required
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                className="w-full bg-slate-50 border-none p-5 pl-14 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detailed Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
