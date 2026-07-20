"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Loader2,
  Video,
  Globe
} from 'lucide-react';
import { postApi, patchApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

import CustomSelect from '@/components/admin/CustomSelect';

interface WorkshopFormProps {
  id?: string;
  initialData?: any;
}

const TYPES = [
  { label: 'Webinar', value: 'Webinar' },
  { label: 'Physical Workshop', value: 'Physical Workshop' },
  { label: 'Hybrid Session', value: 'Hybrid Session' }
];

export default function WorkshopForm({ id, initialData }: WorkshopFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 12:00 PM',
    type: 'Webinar',
    description: '',
    registration_url: '',
    available_slots: 50,
    total_slots: 50,
    status: 'Published'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        speaker: initialData.speaker || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        time: initialData.time || '',
        type: initialData.type || 'Webinar',
        description: initialData.description || '',
        registration_url: initialData.registration_url || '',
        available_slots: initialData.available_slots ?? 50,
        total_slots: initialData.total_slots ?? 50,
        status: initialData.status || 'Published'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await patchApi(`/library/training/workshops/${id}`, formData);
        toast.success("Workshop updated successfully");
      } else {
        await postApi('/library/training/workshops', formData);
        toast.success("Workshop published successfully");
      }
      router.push('/admin/library/training');
      router.refresh();
    } catch (error) {
      toast.error("Failed to save workshop");
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
              <CalendarIcon size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter font-serif italic">
                {id ? 'Edit' : 'New'} <span className="text-primary not-italic">Workshop</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Session Orchestration</p>
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
              {id ? 'Update Session' : 'Publish Workshop'}
            </button>
          </div>
        </div>

        <div className="p-12 space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Workshop Title</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Speaker / Facilitator</label>
              <input 
                type="text" 
                required
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-3">
               <CustomSelect 
                 label="Workshop Type"
                 options={TYPES}
                 value={formData.type}
                 onChange={(val) => setFormData({ ...formData, type: val })}
               />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Time Range</label>
              <input 
                type="text" 
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 10:00 AM - 12:00 PM"
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Slots</label>
              <input 
                type="number" 
                required
                value={formData.total_slots}
                onChange={(e) => setFormData({ ...formData, total_slots: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Registration / Access URL</label>
            <input 
              type="url" 
              required
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
              placeholder="Link to Zoom, Teams or Google Form"
              className="w-full bg-slate-50 border-none p-5 text-sm font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abstract / Description</label>
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
