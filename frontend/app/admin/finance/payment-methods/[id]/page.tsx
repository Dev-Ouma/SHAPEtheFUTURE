"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { getApi, postApi } from '@/lib/api';

export default function EditPaymentMethod() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    provider_name: '',
    account_number: '',
    account_name: '',
    instructions: '',
    is_active: true
  });

  useEffect(() => {
    async function fetchMethod() {
      try {
        const data = await getApi(`/finance/admin/payment-methods/${params.id}`);
        setFormData({
          id: data.id,
          provider_name: data.provider_name,
          account_number: data.account_number,
          account_name: data.account_name,
          instructions: data.instructions || '',
          is_active: data.is_active
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load payment method");
        router.back();
      } finally {
        setInitialLoading(false);
      }
    }
    fetchMethod();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postApi('/finance/admin/payment-methods', formData);
      router.push('/admin/finance/payment-methods');
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading payment method...</div>;
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
          <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Edit Payment Method</h1>
          <p className="text-slate-500 font-medium mt-1">Update payment instructions and account details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Provider Name</label>
            <input 
              type="text" 
              required
              value={formData.provider_name}
              onChange={e => setFormData({...formData, provider_name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Account/Paybill Number</label>
              <input 
                type="text" 
                required
                value={formData.account_number}
                onChange={e => setFormData({...formData, account_number: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Account Name</label>
              <input 
                type="text" 
                required
                value={formData.account_name}
                onChange={e => setFormData({...formData, account_name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instructions</label>
            <textarea 
              rows={3}
              value={formData.instructions}
              onChange={e => setFormData({...formData, instructions: e.target.value})}
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
