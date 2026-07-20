"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  X,
  ArrowLeft
} from 'lucide-react';
import { getApi, postApi, patchApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PermissionGate from '@/components/admin/PermissionGate';

function RoleOrchestrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRole, setEditingRole] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const permsRes = await getApi('/admin/roles/permissions');
      setPermissions(Array.isArray(permsRes) ? permsRes : []);

      if (editId) {
        const rolesRes = await getApi('/admin/roles');
        const role = Array.isArray(rolesRes) ? rolesRes.find((r: any) => r.id === editId) : null;
        if (role) {
          setEditingRole(role);
          setFormData({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions?.map((p: any) => p.id) || []
          });
        } else {
          toast.error("Role not found");
          router.push('/admin/roles');
        }
      }
    } catch (err) {
      toast.error("Failed to load governance data");
    } finally {
      setLoading(false);
    }
  }, [editId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await patchApi(`/admin/roles/${editingRole.id}`, formData);
        toast.success("Institutional role amended");
      } else {
        await postApi('/admin/roles', formData);
        toast.success("New governing role orchestrated");
      }
      router.push('/admin/roles');
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
      setSubmitting(false);
    }
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id) 
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const toggleModulePermissions = (modulePerms: any[], isSelected: boolean) => {
    const ids = modulePerms.map(p => p.id);
    setFormData(prev => {
      if (isSelected) {
        return { ...prev, permissionIds: prev.permissionIds.filter(id => !ids.includes(id)) };
      } else {
        return { ...prev, permissionIds: Array.from(new Set([...prev.permissionIds, ...ids])) };
      }
    });
  };

  const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
    const module = perm.slug.split('.')[0];
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-20 pt-6">
      <Link href="/admin/roles" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-4">
        <ArrowLeft size={14} />
        <span>Back to Registry</span>
      </Link>

      <div className="bg-white rounded-[4rem] p-12 lg:p-20 shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-primary-darker text-primary rounded-[2rem] flex items-center justify-center rotate-6 shadow-2xl">
                 <ShieldCheck size={40} />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-primary-darker font-serif tracking-tighter lowercase capitalize">{editingRole ? 'Amend Protocol' : 'Initial Protocol'}</h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Institutional Role Orchestration</p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Protocol Authority Name</label>
                 <input 
                   required
                   disabled={false}
                   value={formData.name}
                   onChange={e => setFormData({ ...formData, name: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                   placeholder="e.g., General Helpdesk"
                 />
                 {editingRole?.is_system_role && (
                   <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-6">
                     System role — display name can be updated; role cannot be deleted
                   </p>
                 )}
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Strategic Description</label>
                 <input 
                   value={formData.description}
                   onChange={e => setFormData({ ...formData, description: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-100 p-6 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm"
                   placeholder="Brief purpose of this role..."
                 />
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 gap-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Granular Permission Matrix</p>
                 <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search modules or permissions..."
                      className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-full text-xs outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
                    />
                    <div className="flex items-center gap-2 text-primary shrink-0">
                       <Database size={12} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{permissions.length} nodes</span>
                    </div>
                 </div>
              </div>
              
              <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-8">
                 {Object.entries(groupedPermissions)
                   .filter(([mod, perms]: [string, any]) => {
                     if (!searchTerm) return true;
                     const term = searchTerm.toLowerCase();
                     if (mod.toLowerCase().includes(term)) return true;
                     return perms.some((p: any) => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));
                   })
                   .map(([mod, perms]: [string, any]) => {
                     const moduleIds = perms.map((p: any) => p.id);
                     const isAllSelected = moduleIds.every((id: string) => formData.permissionIds.includes(id));
                     
                     return (
                       <div key={mod} className="space-y-4">
                         <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                           <h4 className="text-sm font-black uppercase tracking-widest text-primary-darker flex items-center gap-2">
                             <div className="w-2 h-2 bg-primary rounded-full" />
                             {mod}
                           </h4>
                           <button
                             type="button"
                             onClick={() => toggleModulePermissions(perms, isAllSelected)}
                             className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors ${
                               isAllSelected 
                                 ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                 : 'bg-primary/10 text-primary hover:bg-primary/20'
                             }`}
                           >
                             {isAllSelected ? 'Clear Module' : 'Select All'}
                           </button>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                           {perms.map((perm: any) => {
                             const isSelected = formData.permissionIds.includes(perm.id);
                             return (
                               <div 
                                 key={perm.id}
                                 onClick={() => togglePermission(perm.id)}
                                 className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                   isSelected 
                                     ? 'bg-white border-primary border shadow-md shadow-primary/5' 
                                     : 'bg-white border-slate-100 hover:border-slate-300'
                                 }`}
                               >
                                 {isSelected && (
                                    <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                                       <CheckCircle2 size={16} />
                                    </div>
                                 )}
                                 <p className={`text-[11px] font-black uppercase tracking-widest mb-1 pr-6 ${isSelected ? 'text-primary' : 'text-primary-darker'}`}>
                                   {perm.name.replace(` ${mod.charAt(0).toUpperCase() + mod.slice(1)}`, '') || perm.name}
                                 </p>
                                 <p className="text-[10px] text-slate-400 leading-tight pr-4 line-clamp-2" title={perm.description || perm.slug}>
                                   {perm.description || perm.slug}
                                 </p>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     );
                   })}
                 
                 {Object.keys(groupedPermissions).length > 0 && Object.entries(groupedPermissions).filter(([mod, perms]: [string, any]) => {
                     if (!searchTerm) return true;
                     const term = searchTerm.toLowerCase();
                     if (mod.toLowerCase().includes(term)) return true;
                     return perms.some((p: any) => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));
                 }).length === 0 && (
                   <div className="text-center py-10 text-slate-400">
                     <p className="text-xs font-bold uppercase tracking-widest mb-2">No matching modules found</p>
                     <p className="text-[10px]">Try a different search term</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="flex items-center gap-6 pt-6">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-6 px-12 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50"
              >
                 {submitting ? 'Committing...' : (editingRole ? 'Commit Amendments' : 'Complete Orchestration')}
              </button>
              <Link 
                href="/admin/roles"
                className="px-12 py-6 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-center"
              >
                 Abort
              </Link>
           </div>
        </form>
      </div>
    </div>
  );
}

export default function RoleOrchestrationPage() {
  return (
    <PermissionGate permission="roles.manage">
      <React.Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
        <RoleOrchestrationContent />
      </React.Suspense>
    </PermissionGate>
  );
}
