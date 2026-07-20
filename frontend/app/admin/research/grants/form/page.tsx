"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, ArrowLeft, Upload, FileText, Globe, Lock, Plus, Trash2, Loader2, Search, Award, Calendar, DollarSign, Building2, User } from 'lucide-react';
import { getApi, postApi, patchApi, getStaffDirectory } from '@/lib/api';
import toast from 'react-hot-toast';

export default function GrantForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [staff, setStaff] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: '',
    funder_name: '',
    amount: '',
    currency: 'KES',
    awarded_date: '',
    start_date: '',
    end_date: '',
    lead_investigator_id: '',
    external_id: '',
    description: '',
    url: '',
    status: 'Active',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffResponse = await getStaffDirectory(undefined, undefined, undefined, 1000) as any;
        setStaff(Array.isArray(staffResponse) ? staffResponse : (staffResponse.data || []));

        if (isEdit) {
          const grant = await getApi(`/research/grants/${id}`);
          setFormData({
            ...grant,
            lead_investigator_id: grant.lead_investigator?.id || '',
            awarded_date: grant.awarded_date ? new Date(grant.awarded_date).toISOString().split('T')[0] : '',
            start_date: grant.start_date ? new Date(grant.start_date).toISOString().split('T')[0] : '',
            end_date: grant.end_date ? new Date(grant.end_date).toISOString().split('T')[0] : '',
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
        await patchApi(`/research/grants/${id}`, formData);
        toast.success('Grant updated');
      } else {
        await postApi('/research/grants', formData);
        toast.success('Grant recorded');
      }
      router.push('/admin/research/grants');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save grant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading grant data...</div>;

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
              {isEdit ? 'Refine Funding' : 'Grant Registry'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Financial Awards v1.1</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/admin/research/grants')}
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
            {isEdit ? 'Commit Changes' : 'Record Award'}
          </button>
        </div>
      </div>

      <form className="space-y-12 pb-32">
        {/* Grant Identity */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 flex items-center justify-center opacity-10 rotate-12">
              <Award size={80} />
           </div>
           
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Award Identity
           </h2>

           <div className="grid grid-cols-1 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grant Title</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Official award designation..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Funding Agency / Funder</label>
                   <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="text"
                        required
                        value={formData.funder_name}
                        onChange={(e) => setFormData({...formData, funder_name: e.target.value})}
                        className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                        placeholder="e.g. Bill & Melinda Gates Foundation..."
                      />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">External reference ID</label>
                  <input 
                    type="text"
                    value={formData.external_id}
                    onChange={(e) => setFormData({...formData, external_id: e.target.value})}
                    className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="Agency reference code..."
                  />
                </div>
              </div>
           </div>
        </section>

        {/* Financials & Personnel */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Financial Oversight
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="grid grid-cols-3 gap-6">
                 <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</label>
                    <select 
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner appearance-none"
                    >
                       <option value="KES">KES</option>
                       <option value="USD">USD</option>
                       <option value="EUR">EUR</option>
                    </select>
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awarded Amount</label>
                    <div className="relative">
                       <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                         type="number"
                         value={formData.amount}
                         onChange={(e) => setFormData({...formData, amount: e.target.value})}
                         className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                         placeholder="Total amount..."
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Investigator</label>
                 <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select 
                      value={formData.lead_investigator_id}
                      onChange={(e) => setFormData({...formData, lead_investigator_id: e.target.value})}
                      className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner appearance-none"
                    >
                       <option value="">Select Investigator</option>
                       {staff.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </section>

        {/* Timeline & Context */}
        <section className="bg-white p-12 border border-slate-100 shadow-sm relative overflow-hidden">
           <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker mb-10 pb-4 border-b border-primary/20 inline-block">
             Chronology & Purpose
           </h2>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Awarded</label>
                    <input 
                      type="date"
                      value={formData.awarded_date}
                      onChange={(e) => setFormData({...formData, awarded_date: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-[11px] font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Star Date</label>
                    <input 
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-[11px] font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                    <input 
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      className="w-full bg-slate-50 p-6 text-[11px] font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grant URL / Documentation Link</label>
                <div className="relative">
                   <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                     type="url"
                     value={formData.url}
                     onChange={(e) => setFormData({...formData, url: e.target.value})}
                     className="w-full bg-slate-50 p-6 pl-14 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none shadow-inner"
                     placeholder="https://..."
                   />
                </div>
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grant Abstract / Purpose</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 p-6 text-sm font-bold border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Describe the scope and expected impact of the funding..."
                />
              </div>
           </div>
        </section>
      </form>
    </div>
  );
}
