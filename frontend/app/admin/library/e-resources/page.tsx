"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Loader2, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2,
  RefreshCw,
  ExternalLink,
  Star,
  Tag
} from 'lucide-react';
import { getAdminEResources, deleteEResource } from '@/lib/api';
import { toast } from 'react-hot-toast';
import PermissionGate from '@/components/admin/PermissionGate';
import { usePermission } from '@/hooks/useAdminPermissions';

export default function EResourcesAdmin() {
  return (
    <PermissionGate permission={['knowledge_hub.view', 'knowledge_hub.manage']}>
      <EResourcesAdminInner />
    </PermissionGate>
  );
}

function EResourcesAdminInner() {
  const { can: canManage } = usePermission('knowledge_hub.manage');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getAdminEResources();
      setResources(data);
    } catch (error) {
      console.error("Failed to fetch E-Resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string) => {
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to remove resources');
      return;
    }
    if (!window.confirm("Are you sure you want to remove this resource from the digital index?")) return;
    try {
      await deleteEResource(id);
      toast.success("Resource removed.");
      fetchResources();
    } catch (error) {
      toast.error("Failed to delete resource.");
    }
  };

  const filtered = resources.filter(res => 
    (res.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    res.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-primary-darker p-12 text-white relative shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 -translate-y-1/2 translate-x-1/2 rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black mb-4 font-serif tracking-tighter italic">Digital <span className="text-primary not-italic">Resources</span></h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Orchestrate the institution's electronic collections, scholarly journals, and digital e-books.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/admin/library/e-resources/taxonomies" className="bg-white/10 border border-white/20 text-white px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3">
               <Tag size={16} />
               Taxonomies
            </Link>
            {canManage && (
              <Link href="/admin/library/e-resources/new" className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3 shadow-xl shadow-primary/20">
                 <Plus size={16} />
                 Index New Resource
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 border border-slate-100 shadow-sm">
        <div className="relative flex-grow max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <input 
             type="text" 
             placeholder="Search by title or provider..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest border border-slate-100 outline-none focus:border-primary transition-colors"
           />
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchResources} className="p-4 bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <div className="h-6 w-px bg-slate-100 mx-2" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory: {filtered.length}</p>
        </div>
      </div>

      {/* Table-style List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-4">
           <Loader2 className="animate-spin text-primary" size={48} />
           <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Syncing Catalogue...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Details</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Access</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((res) => (
                <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-black uppercase tracking-tight text-primary-darker group-hover:text-primary transition-colors">
                            {res.title}
                          </h3>
                          {res.is_featured && <Star size={12} className="fill-amber-500 text-amber-500" />}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{res.provider?.name || 'Local'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                       <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                         {res.resource_type}
                       </span>
                       <div className="flex flex-wrap gap-1">
                          {res.subjects?.slice(0, 2).map((s: any) => (
                            <span key={s.id} className="text-[8px] font-bold text-primary flex items-center gap-1">
                               <Tag size={8} />
                               {s.name}
                            </span>
                          ))}
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                         {res.access_type === 'Open Access' ? <Unlock size={14} className="text-emerald-500" /> : <Lock size={14} className="text-blue-500" />}
                         <span className={`text-[9px] font-black uppercase tracking-widest ${res.access_type === 'Open Access' ? 'text-emerald-600' : 'text-blue-600'}`}>
                           {res.access_type}
                         </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest w-fit ${res.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {res.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {canManage ? (
                         <>
                           <Link 
                             href={`/admin/library/e-resources/edit/${res.id}`}
                             className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:bg-white hover:border-primary transition-all shadow-sm"
                           >
                             <Edit size={14} />
                           </Link>
                           <button 
                             onClick={() => handleDelete(res.id)}
                             className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-500 transition-all shadow-sm"
                           >
                             <Trash2 size={14} />
                           </button>
                         </>
                       ) : (
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">View only</span>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="py-32 text-center bg-white border-t border-slate-100">
               <Search size={64} className="mx-auto text-slate-100 mb-6" />
               <h3 className="text-xl font-black uppercase tracking-tighter font-serif text-primary-darker italic">No resources matched</h3>
               <p className="text-slate-400 font-medium">Try a different search term or add a new resource.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
