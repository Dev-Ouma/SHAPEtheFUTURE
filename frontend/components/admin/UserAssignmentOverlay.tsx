"use client";

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  User, 
  Shield, 
  ChevronRight, 
  Command,
  HelpCircle,
  FileText,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { getApi } from '@/lib/api';

interface UserAssignmentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
  currentAssigneeId?: string;
}

export default function UserAssignmentOverlay({ 
  isOpen, 
  onClose, 
  onAssign,
  currentAssigneeId 
}: UserAssignmentOverlayProps) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchUsers();
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Final Production Route: Using a sub-path to absolutely avoid UUID parameter collisions
      const data = await getApi('/complaints/admin/personnel/assignable');
      console.log("Personnel Registry Log:", data);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch assignable personnel");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || []).filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role_legacy?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedUsers = filteredUsers.reduce((acc: Record<string, any[]>, user) => {
    const roleName = (user.role?.name || '').trim()
      || (user.role_legacy
        ? user.role_legacy.charAt(0).toUpperCase() + user.role_legacy.slice(1).replace(/_/g, ' ')
        : 'Other Staff');
    const isStaff = roleName.toLowerCase() === 'staff';
    const dept =
      user.staff_member?.department?.name?.trim() ||
      user.department?.trim() ||
      'No department';
    const groupKey = isStaff ? `Staff — ${dept}` : roleName;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(user);
    return acc;
  }, {});

  const roleGroups = Object.entries(groupedUsers).sort(([a], [b]) => {
    const aStaff = a.startsWith('Staff —');
    const bStaff = b.startsWith('Staff —');
    if (aStaff !== bStaff) return aStaff ? 1 : -1;
    return a.localeCompare(b);
  });

  const flatForKeyboard = roleGroups.flatMap(([, list]) => list);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, flatForKeyboard.length - 1));
    }
    if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter' && flatForKeyboard[selectedIndex]) {
      onAssign(flatForKeyboard[selectedIndex].id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-darker/80 backdrop-blur-xl"
          />

          {/* Main Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Header */}
            <div className="p-8 border-b border-slate-100 flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Command size={24} />
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Seach institutional personnel by name, email or role..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full pl-10 pr-4 py-4 bg-transparent outline-none text-primary-darker font-serif lowercase tracking-tighter capitalize text-xl placeholder:text-slate-200"
                />
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2">
              {loading ? (
                <div className="py-20 text-center">
                   <div className="animate-spin text-primary inline-block mb-4">
                      <RefreshCw size={32} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
                </div>
              ) : roleGroups.length > 0 ? (
                roleGroups.map(([roleName, roleUsers]) => (
                  <div key={roleName} className="space-y-2">
                    <p className="px-4 pt-4 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {roleName}
                    </p>
                    {roleUsers.map((user) => {
                      const index = flatForKeyboard.findIndex((u) => u.id === user.id);
                      return (
                    <button
                    key={user.id}
                    onClick={() => onAssign(user.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-6 p-6 rounded-[2rem] transition-all text-left group ${
                      index === selectedIndex ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative ${
                      index === selectedIndex ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                    }`}>
                       {(user.role?.name?.toLowerCase().includes('helpdesk') || user.role_legacy === 'helpdesk') ? <HelpCircle size={24} /> : 
                        (user.role?.name?.toLowerCase().includes('manager') || user.role_legacy === 'admin') ? <FileText size={24} /> : 
                        <User size={24} />}
                       
                       {currentAssigneeId === user.id && (
                         <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <UserCheck size={10} className="text-white" />
                         </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                         <h4 className={`text-sm font-black uppercase tracking-widest truncate ${
                           index === selectedIndex ? 'text-white' : 'text-primary-darker'
                         }`}>{user.full_name}</h4>
                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase truncate ${
                           index === selectedIndex ? 'bg-white/30 text-white' : 'bg-primary/10 text-primary'
                         }`}>{user.role?.name || user.role_legacy || "Officer"}</span>
                      </div>
                      <p className={`text-[10px] font-medium truncate ${
                        index === selectedIndex ? 'text-white/60' : 'text-slate-400'
                      }`}>{user.email}</p>
                    </div>
                    <ChevronRight size={16} className={`opacity-40 transition-transform ${
                      index === selectedIndex ? 'translate-x-1 opacity-100' : ''
                    }`} />
                  </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4 opacity-50">
                  <User className="inline-block" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest">No alignable personnel found</p>
                </div>
              )}
            </div>

            {/* Footer / Shortcuts */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm text-primary-darker">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm text-primary-darker">Enter</kbd>
                    <span>Assign</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm text-primary-darker">Esc</kbd>
                    <span>Close</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                  <Shield size={10} />
                  <span>Administrative Governance Active</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
