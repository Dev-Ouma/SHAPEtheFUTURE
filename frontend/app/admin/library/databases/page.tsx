"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Plus, 
  Search, 
  Loader2, 
  Globe, 
  Lock, 
  ExternalLink, 
  Edit, 
  Trash2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { getAdminLibraryDatabases, deleteApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import PermissionGate from '@/components/admin/PermissionGate';
import { usePermission } from '@/hooks/useAdminPermissions';

export default function LibraryDatabasesAdmin() {
  return (
    <PermissionGate permission={['knowledge_hub.view', 'knowledge_hub.manage']}>
      <LibraryDatabasesAdminInner />
    </PermissionGate>
  );
}

function LibraryDatabasesAdminInner() {
  const { can: canManage } = usePermission('knowledge_hub.manage');
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const data = await getAdminLibraryDatabases();
      setDatabases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      toast.error("Failed to load library databases");
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleDelete = async (id: string) => {
    if (!canManage) {
      toast.error('You need knowledge_hub.manage permission to remove databases');
      return;
    }
    if (!window.confirm("Are you sure you want to delete this database?")) return;
    try {
      await deleteApi(`/library/databases/${id}`);
      toast.success("Database removed.");
      fetchDatabases();
    } catch (error) {
      toast.error("Failed to delete database.");
    }
  };

  const filtered = databases.filter(db => 
    (db.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (db.provider || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="bg-primary-darker p-12 text-white relative shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black mb-4 font-serif tracking-tighter italic">Library <span className="text-primary not-italic">Databases</span></h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
              Curate the institution's digital collection of scholarly databases and open-access repositories.
            </p>
          </div>
          {canManage && (
            <Link href="/admin/library/databases/new" className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all flex items-center gap-3">
               <Plus size={16} />
               Add New Resource
            </Link>
          )}
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 border border-slate-100 shadow-sm">
        <div className="relative flex-grow max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
           <input 
             type="text" 
             placeholder="Search by name or provider..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest border border-slate-100 outline-none focus:border-primary transition-colors"
           />
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchDatabases} className="p-4 bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100">
              <RefreshCw size={18} />
           </button>
           <div className="h-6 w-px bg-slate-100 mx-2" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {filtered.length}</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-4">
           <Loader2 className="animate-spin text-primary" size={48} />
           <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Syncing Scholarly Index...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
           {filtered.map((db) => (
             <div key={db.id} className="group bg-white border border-slate-100 hover:border-primary/20 transition-all shadow-sm hover:shadow-xl flex flex-col h-full">
                <div className="p-10 flex-grow space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
                         <Database size={24} />
                      </div>
                      {db.is_premium ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-100">Premium</span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">Open Access</span>
                      )}
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{db.provider}</p>
                      <h3 className="text-2xl font-black uppercase tracking-tighter font-serif text-primary-darker leading-tight group-hover:text-primary transition-colors italic truncate">
                        {db.name}
                      </h3>
                   </div>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                     {db.description}
                   </p>
                   <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                     <span className={`w-2 h-2 rounded-full ${db.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{db.status}</span>
                   </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                   <div className="flex items-center gap-2">
                      {canManage ? (
                        <>
                          <Link href={`/admin/library/databases/${db.id}`} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all">
                            <Edit size={14} />
                          </Link>
                          <button onClick={() => handleDelete(db.id)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">View only</span>
                      )}
                   </div>
                   <a href={db.access_url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
                     Source Site <ExternalLink size={12} />
                   </a>
                </div>
             </div>
           ))}
           
           {filtered.length === 0 && (
             <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-slate-100">
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
