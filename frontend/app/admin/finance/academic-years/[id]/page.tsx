"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { getApi, postApi } from '@/lib/api';

export default function EditAcademicYear() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    year_range: '',
    is_current: false,
    is_published: true
  });

  useEffect(() => {
    async function fetchYear() {
      try {
        const data = await getApi(`/fee-structures/academic-years/${params.id}`);
        setFormData({
          id: data.id,
          year_range: data.year_range,
          is_current: data.is_current,
          is_published: data.is_published
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load academic year");
        router.back();
      } finally {
        setInitialLoading(false);
      }
    }
    fetchYear();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postApi('/fee-structures/academic-years/create', formData);
      router.push('/admin/finance/academic-years');
    } catch (error) {
      alert("Failed to save. Ensure year range is unique.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading academic year...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Edit Academic Year</h1>
          <p className="text-slate-500 font-medium mt-1">Update academic cycle configuration.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Year Range</label>
            <input 
              type="text" 
              required
              value={formData.year_range}
              onChange={e => setFormData({...formData, year_range: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="e.g. 2025/2026"
            />
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              checked={formData.is_current}
              onChange={e => setFormData({...formData, is_current: e.target.checked})}
              className="w-5 h-5 text-primary rounded border-slate-300"
            />
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-700">Set as Current Active Year</label>
              <span className="text-xs text-slate-500 font-medium mt-1">This will automatically unset any existing current year.</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              checked={formData.is_published}
              onChange={e => setFormData({...formData, is_published: e.target.checked})}
              className="w-5 h-5 text-primary rounded border-slate-300"
            />
            <label className="text-sm font-bold text-slate-700">Published (Visible to Public)</label>
          </div>
        </div>
        
        <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary-dark transition-colors text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center space-x-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
