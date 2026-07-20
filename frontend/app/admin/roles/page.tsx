"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Info,
  Lock,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Users,
  Key,
  Database
} from 'lucide-react';
import { getApi, postApi, patchApi, deleteApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PermissionGate from '@/components/admin/PermissionGate';

export default function RolesManagementPage() {
  return (
    <PermissionGate permission="roles.view">
      <RolesManagementPageInner />
    </PermissionGate>
  );
}

function RolesManagementPageInner() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getApi('/admin/roles'),
        getApi('/admin/roles/permissions')
      ]);
      // getApi returns null on 401 (and triggers sign-out). Avoid treating that as an empty role list.
      if (rolesRes == null && permsRes == null) {
        setLoadError(true);
        setRoles([]);
        setPermissions([]);
        return;
      }
      const nextRoles = Array.isArray(rolesRes) ? rolesRes : [];
      const nextPerms = Array.isArray(permsRes) ? permsRes : [];
      setRoles(nextRoles);
      setPermissions(nextPerms);
      if (!Array.isArray(rolesRes)) {
        setLoadError(true);
        toast.error("Could not load roles. If you were signed out, please sign in again.");
      }
    } catch (err) {
      setLoadError(true);
      toast.error("Could not reach the server for roles data. Retrying after the backend is up.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this role? This cannot be undone.")) return;
    try {
      await deleteApi(`/admin/roles/${id}`);
      toast.success("Role terminated successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Termination failed");
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Header Orchestration */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
        <div className="relative z-10 flex items-center gap-8">
           <div className="w-20 h-20 bg-primary-darker rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              <Shield size={36} />
           </div>
           <div>
              <h1 className="text-4xl font-black text-primary-darker font-serif tracking-tighter lowercase capitalize leading-tight">Governance Hub</h1>
              <div className="flex items-center gap-4 mt-3">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                   {loadError
                     ? "Roles unavailable"
                     : `Total Roles: ${roles.length} · ${permissions.length} Capabilities`}
                 </p>
                 <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Dynamic RBAC Activated</p>
              </div>
           </div>
        </div>
        <Link 
          href="/admin/roles/orchestrate"
          className="relative z-10 bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-5 px-10 rounded-full flex items-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
           <Plus size={16} />
           <span>Orchestrate New Role</span>
        </Link>
      </div>

      {/* Roles Matrix View */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-10 py-16 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 text-slate-300" size={40} />
          <h2 className="text-xl font-black text-primary-darker font-serif">
            {loadError ? "Roles unavailable" : "No roles orchestrated"}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {loadError
              ? "Could not load the RBAC registry. Confirm the backend is running, then retry."
              : "Create a role to begin assigning Service Desk and governance capabilities."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {loadError && (
              <button
                type="button"
                onClick={() => fetchData()}
                className="rounded-full bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white"
              >
                Retry
              </button>
            )}
            <Link
              href="/admin/roles/orchestrate"
              className="rounded-full bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white"
            >
              Orchestrate New Role
            </Link>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 outline-none">
        <AnimatePresence mode="popLayout">
          {roles.map((role, idx) => (
            <motion.div 
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-[#ff7f50]/20 transition-all group relative overflow-hidden flex flex-col"
            >
              {role.is_system_role && (
                 <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                    <Lock size={64} strokeWidth={1} />
                 </div>
              )}
              
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-8">
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <h3 className="text-2xl font-black text-primary-darker tracking-tight font-serif lowercase capitalize">{role.name}</h3>
                         {role.is_system_role && (
                            <span className="px-3 py-1 bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 rounded-full">System Protocol</span>
                         )}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">{role.description || 'No description orchestrated'}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/roles/orchestrate?id=${role.id}`}
                        className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#ff7f50] hover:text-white transition-all shadow-sm"
                      >
                         <Edit2 size={18} />
                      </Link>
                      {!role.is_system_role && (
                        <button 
                          onClick={() => handleDelete(role.id)}
                          className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                           <Trash2 size={18} />
                        </button>
                      )}
                   </div>
                </div>

                <div className="space-y-3 flex-1">
                   <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Capabilities Registry</p>
                      <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{role.permissions?.length || 0} Nodes</span>
                   </div>
                   
                   <div className="max-h-56 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                      {Object.entries(
                        (role.permissions || []).reduce((acc: any, p: any) => {
                          const mod = p.slug.split('.')[0];
                          if (!acc[mod]) acc[mod] = [];
                          acc[mod].push(p);
                          return acc;
                        }, {})
                      ).map(([mod, perms]: [any, any]) => (
                        <div key={mod} className="flex items-start gap-2 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50">
                           <div className="px-2 py-1 bg-primary-darker text-[7px] font-black uppercase tracking-tighter text-white rounded-lg mt-0.5">
                              {mod.slice(0, 3)}
                           </div>
                           <div className="flex flex-wrap gap-1">
                              {perms.map((p: any) => (
                                <div key={p.id} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[8px] font-bold text-slate-500 hover:text-primary transition-colors">
                                   {p.name.replace(` ${mod.charAt(0).toUpperCase() + mod.slice(1)}`, '') || p.name}
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                      {!role.permissions?.length && (
                         <div className="h-16 flex items-center justify-center border border-dashed border-slate-100 rounded-2xl">
                            <p className="text-[10px] italic text-slate-300">No capabilities orchestrated</p>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      </div>
  );
}
