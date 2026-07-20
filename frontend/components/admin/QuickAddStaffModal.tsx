"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, User, Mail, Briefcase, GraduationCap, Shield, Award, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postApi, getApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface QuickAddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staff: any) => void;
}

export default function QuickAddStaffModal({ isOpen, onClose, onSuccess }: QuickAddStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [executiveTypes, setExecutiveTypes] = useState<any[]>([]);
  const [roleCategory, setRoleCategory] = useState<'none' | 'management' | 'executive'>('none');
  const [form, setForm] = useState({
    full_name: '',
    job_title: '',
    designation: '',
    email: '',
    academic_qualifications: '',
    status: 'Published'
  });

  useEffect(() => {
    if (isOpen) {
      fetchExecutiveTypes();
    }
  }, [isOpen]);

  const fetchExecutiveTypes = async () => {
    try {
      const res = await getApi('/staff/executive-types');
      setExecutiveTypes(res || []);
    } catch (err) {
      console.error("Failed to load executive types", err);
    }
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) {
      toast.error("Full Name and Email are mandatory");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { ...form };
      
      // Map roleCategory to actual ExecutiveType
      if (roleCategory === 'executive') {
        const execType = executiveTypes.find(t => t.name === 'Governing Council');
        if (execType) payload.executive_type = { id: execType.id };
      } else if (roleCategory === 'management') {
        const mgmtType = executiveTypes.find(t => t.name === 'University Management Board');
        if (mgmtType) payload.executive_type = { id: mgmtType.id };
      }

      // Generate initial slug from name
      payload.profile_slug = form.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const res = await postApi('/staff', payload);
      toast.success("Staff Member Enrolled");
      onSuccess(res);
      onClose();
    } catch (err) {
      toast.error("Enrolment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-darker/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-10 bg-primary-darker text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <User size={120} />
               </div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black font-serif italic tracking-tight uppercase">Quick Enrolment</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Add Staff to Registry</p>
                  </div>
                  <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Form */}
            <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
               <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                     <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                           type="text" 
                           value={form.full_name}
                           onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                           placeholder="e.g. Prof. Jane Doe"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Main Title</label>
                        <div className="relative">
                           <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input 
                              type="text" 
                              value={form.job_title}
                              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                              placeholder="Dean / Director"
                           />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address *</label>
                        <div className="relative">
                           <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                           <input 
                              type="email" 
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                              placeholder="jane@ouk.ac.ke"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Leadership Categorization</label>
                     <div className="grid grid-cols-3 gap-3">
                        {[
                           { id: 'none', label: 'None', icon: UsersIcon, desc: 'Regular Staff' },
                           { id: 'executive', label: 'Executive', icon: Shield, desc: 'Governing Council' },
                           { id: 'management', label: 'Management', icon: Award, desc: 'Management Board' }
                        ].map((cat) => (
                           <button
                              key={cat.id}
                              type="button"
                              onClick={() => setRoleCategory(cat.id as any)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 ${
                                 roleCategory === cat.id 
                                 ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                                 : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                           >
                              <div className="flex items-center justify-between">
                                 <cat.icon size={16} className={roleCategory === cat.id ? 'text-primary' : 'text-slate-300'} />
                                 {roleCategory === cat.id && <Check size={12} className="text-primary" />}
                              </div>
                              <div>
                                 <div className="text-[10px] font-black uppercase tracking-tight">{cat.label}</div>
                                 <div className={`text-[8px] font-bold uppercase tracking-widest opacity-60 ${roleCategory === cat.id ? 'text-primary' : 'text-slate-400'}`}>
                                    {cat.desc}
                                 </div>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Academic Qualifications</label>
                     <div className="relative">
                        <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                           type="text" 
                           value={form.academic_qualifications}
                           onChange={(e) => setForm({ ...form, academic_qualifications: e.target.value })}
                           className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                           placeholder="PhD in Computer Science, MSc..."
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
               <button 
                  onClick={onClose}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
               >
                  Discard
               </button>
               <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-5 px-10 rounded-full flex items-center space-x-4 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Enrol & Assign</span>
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
