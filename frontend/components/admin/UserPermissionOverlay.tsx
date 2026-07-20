"use client";

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldOff, 
  Search,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Database,
  Lock,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Permission {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface UserPermissionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  permissions: Permission[];
  onSave: (allowedIds: string[], deniedIds: string[]) => Promise<void>;
}

export default function UserPermissionOverlay({ 
  isOpen, 
  onClose, 
  user, 
  permissions, 
  onSave 
}: UserPermissionOverlayProps) {
  const [allowedIds, setAllowedIds] = useState<string[]>([]);
  const [deniedIds, setDeniedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setAllowedIds(user.allowedPermissions?.map((p: any) => p.id) || []);
      setDeniedIds(user.deniedPermissions?.map((p: any) => p.id) || []);
    }
  }, [user, isOpen]);

  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.reduce((acc: any, p: any) => {
      const module = p.slug.split('.')[0];
      if (!acc[module]) acc[module] = [];
      acc[module].push(p);
      return acc;
    }, {});
  }, [permissions, search]);

  const handleStateChange = (permId: string, state: 'neutral' | 'allow' | 'deny') => {
    if (state === 'allow') {
      setAllowedIds(prev => [...prev.filter(id => id !== permId), permId]);
      setDeniedIds(prev => prev.filter(id => id !== permId));
    } else if (state === 'deny') {
      setDeniedIds(prev => [...prev.filter(id => id !== permId), permId]);
      setAllowedIds(prev => prev.filter(id => id !== permId));
    } else {
      setAllowedIds(prev => prev.filter(id => id !== permId));
      setDeniedIds(prev => prev.filter(id => id !== permId));
    }
  };

  const rolePermissionIds = useMemo(() => {
    return user?.role?.permissions?.map((p: any) => p.id) || [];
  }, [user]);

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      await onSave(allowedIds, deniedIds);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary-darker/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 50 }}
            className="bg-white rounded-[4rem] p-10 lg:p-16 max-w-5xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 shrink-0">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary-darker text-primary rounded-[1.5rem] flex items-center justify-center rotate-3 shadow-xl">
                     <Shield size={32} />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-primary-darker tracking-tight font-serif lowercase capitalize leading-none">Security Override</h2>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
                        Governing identity: <span className="text-primary-darker">{user?.full_name}</span>
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input 
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                       placeholder="Filter protocols..."
                       className="bg-slate-50 border border-slate-100 pl-12 pr-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/10 transition-all w-64"
                     />
                  </div>
                  <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-white transition-all">
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-10 min-h-0">
               <div className="grid grid-cols-1 gap-12">
                  {Object.entries(groupedPermissions).map(([module, perms]: [any, any]) => (
                    <div key={module} className="space-y-6">
                       <div className="flex items-center gap-4 px-4">
                          <div className="h-px bg-slate-100 flex-1" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{module}</p>
                          <div className="h-px bg-slate-100 flex-1" />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {perms.map((perm: any) => {
                            const isAllowed = allowedIds.includes(perm.id);
                            const isDenied = deniedIds.includes(perm.id);
                            const isInherited = rolePermissionIds.includes(perm.id);
                            
                            let currentState: 'neutral' | 'allow' | 'deny' = 'neutral';
                            if (isAllowed) currentState = 'allow';
                            if (isDenied) currentState = 'deny';

                            return (
                              <div key={perm.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group flex items-center justify-between gap-6">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <p className="text-xs font-black uppercase tracking-widest text-primary-darker">{perm.name}</p>
                                       {isInherited && !isAllowed && !isDenied && (
                                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" title="Inherited from Role" />
                                       )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight">{perm.description || perm.slug}</p>
                                 </div>

                                 <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                    <button 
                                      onClick={() => handleStateChange(perm.id, 'deny')}
                                      className={`p-2.5 rounded-xl transition-all ${currentState === 'deny' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-300 hover:text-rose-500'}`}
                                      title="Always Deny"
                                    >
                                       <XCircle size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleStateChange(perm.id, 'neutral')}
                                      className={`p-2.5 rounded-xl transition-all ${currentState === 'neutral' ? 'bg-primary-darker text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
                                      title="Standard (Inherit)"
                                    >
                                       <MinusCircle size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleStateChange(perm.id, 'allow')}
                                      className={`p-2.5 rounded-xl transition-all ${currentState === 'allow' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-300 hover:text-emerald-500'}`}
                                      title="Always Allow"
                                    >
                                       <CheckCircle2 size={18} />
                                    </button>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Footer */}
            <div className="pt-10 border-t border-slate-50 mt-10 shrink-0 flex items-center justify-between gap-10">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allowed: {allowedIds.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-rose-500 rounded-full" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Denied: {deniedIds.length}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-100" />
                  <div className="flex items-center gap-2 text-primary">
                     <Database size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Protocol Registry Synchronised</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button 
                    disabled={isSaving}
                    onClick={handleConfirmSave}
                    className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-5 px-10 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                     {isSaving ? 'Synchronising...' : (
                        <>
                           <Lock size={14} className="text-primary" />
                           Commit Governance Overrides
                        </>
                     )}
                  </button>
                  <button 
                    onClick={onClose}
                    className="py-5 px-10 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                     Abort
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
