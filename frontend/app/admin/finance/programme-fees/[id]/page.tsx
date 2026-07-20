"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { getApi, postApi } from '@/lib/api';

export default function EditProgrammeFee() {
  const router = useRouter();
  const params = useParams();
  const feeId = params.id as string;

  const [programs, setPrograms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: feeId,
    program_id: '',
    academic_year_id: '',
    tuition_fee: 0,
    currency: 'KES',
    is_active: true,
    other_fees: [] as { name: string, amount: number }[]
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [progsRes, yearsRes, feeRes] = await Promise.all([
          getApi('/programmes/admin?limit=1000'),
          getApi('/fee-structures/academic-years/list'),
          getApi(`/fee-structures/programme-fees/single/${feeId}`)
        ]);
        
        setPrograms(progsRes?.data || []);
        setAcademicYears(yearsRes || []);

        if (feeRes) {
          // If legacy data exists, we can optionally migrate it into the array here or just load it
          const otherFeesArray = feeRes.other_fees || [];
          // Optional: Add legacy hardcoded fields into dynamic ones if they exist and array is empty
          if (otherFeesArray.length === 0) {
            const legacyFields = [
              { name: 'Registration Fee', val: feeRes.registration_fee },
              { name: 'Student Activity Fee', val: feeRes.student_activity_fee },
              { name: 'Examination Fee', val: feeRes.examination_fee },
              { name: 'Technology Fee', val: feeRes.technology_fee },
              { name: 'Library Fee', val: feeRes.library_fee },
              { name: 'Practical Fee', val: feeRes.practical_laboratory_fee },
              { name: 'Attachment Fee', val: feeRes.attachment_internship_fee },
              { name: 'Graduation Fee', val: feeRes.graduation_fee }
            ];
            legacyFields.forEach(lf => {
              if (Number(lf.val) > 0) {
                otherFeesArray.push({ name: lf.name, amount: Number(lf.val) });
              }
            });
          }

          setFormData({
            id: feeRes.id,
            program_id: feeRes.program?.id || '',
            academic_year_id: feeRes.academic_year?.id || '',
            tuition_fee: Number(feeRes.tuition_fee) || 0,
            currency: feeRes.currency || 'KES',
            is_active: feeRes.is_active,
            other_fees: otherFeesArray
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (feeId) loadData();
  }, [feeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postApi('/fee-structures/programme-fees/save', {
        ...formData,
        program: { id: formData.program_id },
        academic_year: { id: formData.academic_year_id }
      });
      router.push('/admin/finance/programme-fees');
    } catch (error) {
      alert("Failed to save.");
    }
  };

  const addOtherFee = () => {
    setFormData(prev => ({
      ...prev,
      other_fees: [...prev.other_fees, { name: '', amount: 0 }]
    }));
  };

  const removeOtherFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      other_fees: prev.other_fees.filter((_, i) => i !== index)
    }));
  };

  const updateOtherFee = (index: number, key: 'name' | 'amount', value: any) => {
    const updated = [...formData.other_fees];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, other_fees: updated });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading fee structure...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <button 
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-slate-400 hover:text-primary transition-colors mb-6 font-bold text-sm uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        <span>Back to Programme Fees</span>
      </button>

      <div>
        <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Edit Fee Structure</h1>
        <p className="text-slate-500 font-medium mt-1 mb-8">Update the existing programme fee.</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-10">
          
          {/* Core Configuration */}
          <section>
            <h4 className="font-black text-primary-darker uppercase tracking-widest text-xs mb-6 border-b border-slate-100 pb-2">Core Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Programme</label>
                <select 
                  required
                  value={formData.program_id}
                  onChange={e => setFormData({...formData, program_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                >
                  <option value="">Select a Programme</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Academic Year</label>
                <select 
                  required
                  value={formData.academic_year_id}
                  onChange={e => setFormData({...formData, academic_year_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.year_range}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Tuition Fee */}
          <section>
            <h4 className="font-black text-primary-darker uppercase tracking-widest text-xs mb-6 border-b border-slate-100 pb-2">Primary Fee</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Currency</label>
                <select 
                  required
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Tuition Fee</label>
                <input 
                  type="number" 
                  required
                  min={0}
                  value={formData.tuition_fee}
                  onChange={e => setFormData({...formData, tuition_fee: Number(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-black text-primary-darker"
                />
              </div>
            </div>
          </section>

          {/* Dynamic Other Fees */}
          <section>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-6">
              <h4 className="font-black text-primary-darker uppercase tracking-widest text-xs">Other Fees (Dynamic)</h4>
              <button 
                type="button"
                onClick={addOtherFee}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-dark flex items-center space-x-1"
              >
                <Plus size={14} /> <span>Add Fee</span>
              </button>
            </div>
            
            {formData.other_fees.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-medium text-sm border-2 border-dashed border-slate-100 rounded-xl">
                No extra fees configured.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.other_fees.map((fee, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fee Name / Type</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., Library Fee, Graduation Fee..."
                        value={fee.name}
                        onChange={e => updateOtherFee(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={fee.amount}
                        onChange={e => updateOtherFee(idx, 'amount', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeOtherFee(idx)}
                      className="mt-6 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Fee"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Status */}
          <section>
            <div className="flex items-center space-x-3 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <input 
                type="checkbox" 
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-6 h-6 text-primary rounded border-slate-300 focus:ring-primary/20 transition-all cursor-pointer"
              />
              <div>
                <label htmlFor="is_active" className="text-sm font-black uppercase tracking-widest text-primary-darker cursor-pointer block">
                  Activate Structure
                </label>
                <p className="text-xs text-slate-500 font-medium mt-1">If active, it will be visible to students on the public dashboard.</p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.99] flex justify-center items-center space-x-2 disabled:opacity-50"
            >
              <Save size={18} />
              <span>Update Fee Structure</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
