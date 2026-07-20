"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { getApi, postApi } from '@/lib/api';

export default function EditScholarship() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    amount: 0,
    eligibility_criteria: '',
    application_deadline: '',
    is_active: true
  });

  useEffect(() => {
    async function fetchScholarship() {
      try {
        const data = await getApi(`/finance/admin/scholarships/${params.id}`);
        setFormData({
          id: data.id,
          title: data.title,
          description: data.description,
          amount: data.amount,
          eligibility_criteria: data.eligibility_criteria || '',
          application_deadline: data.application_deadline ? data.application_deadline.substring(0, 10) : '',
          is_active: data.is_active
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load scholarship");
        router.back();
      } finally {
        setInitialLoading(false);
      }
    }
    fetchScholarship();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postApi('/finance/admin/scholarships', formData);
      router.push('/admin/finance/scholarships');
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading scholarship details...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Edit Scholarship</h1>
          <p className="text-slate-500 font-medium mt-1">Update financial aid configuration.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount (KES)</label>
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Application Deadline</label>
              <input 
                type="date" 
                value={formData.application_deadline}
                onChange={e => setFormData({...formData, application_deadline: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-600"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Eligibility Criteria</label>
            <textarea 
              rows={3}
              value={formData.eligibility_criteria}
              onChange={e => setFormData({...formData, eligibility_criteria: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            ></textarea>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 text-primary rounded border-slate-300"
            />
            <label className="text-sm font-bold text-slate-700">Active (Visible to Public)</label>
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
