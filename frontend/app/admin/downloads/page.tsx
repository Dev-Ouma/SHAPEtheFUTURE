"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  FileText,
  Download as DownloadIcon,
  Info,
  CheckCircle2,
  Clock,
  ShieldAlert,
  BarChart3,
  Archive
} from "lucide-react";
import { useAlert } from "@/context/AlertContext";
import { toast } from "react-hot-toast";
import { getApi, deleteApi } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import PermissionGate from "@/components/admin/PermissionGate";
import { usePermission } from "@/hooks/useAdminPermissions";

interface Download {
  id: string;
  title: string;
  slug: string;
  summary: string;
  document_type: string;
  file_size: number;
  status: string;
  access_level: string;
  download_count: number;
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}

export default function AdminDownloadsListing() {
  return (
    <PermissionGate permission={['downloads.view', 'downloads.manage']}>
      <AdminDownloadsListingInner />
    </PermissionGate>
  );
}

function AdminDownloadsListingInner() {
  const { can: canManage } = usePermission('downloads.manage');
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const { showAlert } = useAlert();

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusQuery = activeStatus !== "All" ? `&status=${activeStatus}` : "";
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await getApi(`/downloads/admin?page=${page}&limit=10${statusQuery}${searchQuery}`);
      setDownloads(Array.isArray(res?.data) ? res.data : []);
      setTotalPages(res?.totalPages || 1);
      setTotalDownloads(res?.total || 0);
      if (res == null) {
        toast.error("Failed to fetch repository data");
      }
    } catch (err) {
      toast.error("Failed to fetch repository data");
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, activeStatus]);

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string, title: string) => {
    if (!canManage) {
      toast.error('You need downloads.manage permission to archive documents');
      return;
    }
    showAlert({
      title: "Archive Institutional Resource?",
      message: `Are you sure you want to move "${title}" to the Recycle Bin? This action is compliant with OUK data retention policies.`,
      onConfirm: async () => {
        try {
          await deleteApi(`/downloads/${id}`);
          toast.success("Document archived successfully");
          fetchData();
        } catch (error) {
          toast.error("Failed to archive publication");
        }
      }
    });
  };

  // Filtering is now handled on server except for UI list display
  const filtered = downloads;

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
           <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
              <FileText size={12} />
              <span>Institutional Repository</span>
           </div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif ">Document Registry</h2>
          <p className="text-slate-500 font-medium">Manage policies, reports, and academic resources with full audit control.</p>
        </div>
        {canManage && (
        <Link href="/admin/downloads/new" className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-sm">
          <Plus size={18} />
          <span>Add New Document</span>
        </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-4">
           <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DownloadIcon size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Registry Pulse</p>
              <p className="text-xl font-black text-primary-darker">{totalDownloads.toLocaleString()}</p>
           </div>
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-4">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Current View</p>
              <p className="text-xl font-black text-primary-darker">{downloads.length}</p>
           </div>
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-4">
           <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Page Position</p>
              <p className="text-xl font-black text-primary-darker">{page} / {totalPages}</p>
           </div>
        </div>
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center gap-4">
           <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Domain Status</p>
              <p className="text-xl font-black text-primary-darker group-hover:text-primary transition-colors">Institutional</p>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
         <div className="flex flex-col md:flex-row items-stretch">
            <div className="relative flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by title or category..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none p-6 pl-14 font-bold text-primary-darker focus:ring-0 outline-none placeholder:uppercase placeholder:text-[10px] md:border-r border-slate-100"
               />
            </div>
            <div className="flex items-center p-2 bg-slate-50/50">
               {['All', 'Published', 'Review', 'Draft', 'Archived'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${
                      activeStatus === status ? "bg-primary-darker text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {status}
                  </button>
               ))}
            </div>
            <button onClick={fetchData} className="p-6 text-slate-400 hover:text-primary transition-colors md:border-l border-slate-100">
               <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
            </button>
         </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <RefreshCw className="animate-spin text-primary mb-4" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronising OUK Repository...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filtered.length > 0 ? (
             downloads.map((doc: Download) => (
                <div key={doc.id} className="bg-white group flex flex-col h-full rounded-[2.5rem] border border-slate-200 overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1">
                   {/* Featured Badge */}
                   <div className="absolute top-6 right-6 z-10 flex gap-2">
                       <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          doc.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          doc.status === 'Review' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-slate-100 text-slate-500 border-slate-200"
                       }`}>
                          {doc.status}
                       </div>
                   </div>

                   <div className="p-8 flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-slate-100 rounded-3xl group-hover:bg-[#ff7f50] hover:text-white transition-colors">
                            <FileText size={24} className="text-slate-400 group-hover:text-primary" />
                         </div>
                         <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{doc.category.name}</span>
                            <h4 className="text-xl font-black text-primary-darker leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors font-serif line-clamp-1">
                               {doc.title}
                            </h4>
                         </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                         <div className="flex items-center space-x-2">
                            <BarChart3 size={14} className="text-primary" />
                            <span>{doc.download_count} Downloads</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <ShieldAlert size={14} className={doc.access_level === 'Public' ? "text-emerald-500" : "text-amber-500"} />
                            <span>{doc.access_level}</span>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <Info size={12} className="text-slate-400" />
                         <span className="text-[10px] font-black uppercase text-slate-400">{doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'URL'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                         <Link 
                            href={`/about/downloads`} 
                            target="_blank"
                            className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-primary hover:border-[#ff7f50] transition-all shadow-sm"
                         >
                            <Eye size={18} />
                         </Link>
                         {canManage ? (
                           <>
                             <Link 
                                href={`/admin/downloads/${doc.id}`} 
                                className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm"
                             >
                                <Edit size={18} />
                             </Link>
                             <button 
                               onClick={() => handleDelete(doc.id, doc.title)}
                               className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all shadow-sm"
                             >
                                <Trash2 size={18} />
                             </button>
                           </>
                         ) : (
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">View only</span>
                         )}
                      </div>
                   </div>
                </div>
             ))
           ) : (
             <div className="lg:col-span-3 py-40 text-center bg-slate-50 rounded-[3rem] border border-slate-200 border-dashed">
                <Archive size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 uppercase font-black tracking-[0.2em] ">No documents found matching filters</p>
                <button onClick={() => {setSearch(""); setActiveStatus("All");}} className="mt-6 text-xs font-black uppercase text-primary hover:underline">Clear all filters</button>
             </div>
           )}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
         <div className="bg-white border border-slate-200 p-8 flex justify-between items-center rounded-[2rem] shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               Global Academic Repository: {totalDownloads} Entries
            </div>
            <div className="flex items-center space-x-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                 className="p-3 bg-slate-50 border border-slate-100 text-primary-darker disabled:opacity-30 hover:bg-slate-100 transition-colors"
               >
                 <ArrowRight size={18} className="rotate-180" />
               </button>
               <div className="px-6 text-xs font-black uppercase tracking-widest text-primary-darker">
                  Page {page} <span className="text-slate-300 mx-3">/</span> {totalPages}
               </div>
               <button 
                 disabled={page >= totalPages}
                 onClick={() => setPage((p: number) => p + 1)}
                 className="p-3 bg-slate-50 border border-slate-100 text-primary-darker disabled:opacity-30 hover:bg-slate-100 transition-colors"
               >
                 <ArrowRight size={18} />
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
