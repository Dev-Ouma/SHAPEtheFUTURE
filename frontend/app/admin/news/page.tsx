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
  Newspaper,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Globe,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Archive,
  FileText,
  Tag
} from "lucide-react";
import { getAdminNews, deleteApi, patchApi, resolveImageUrl } from "@/lib/api";
import { useAlert } from "@/context/AlertContext";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import PermissionGate from "@/components/admin/PermissionGate";
import Highlight from "@/components/Highlight";
import {
  normalizePublishStatus,
  publishStatusClass,
  publishStatusLabel,
  PUBLISH_STATUS_OPTIONS,
} from "@/lib/publish-status";
import { usePermission } from "@/hooks/useAdminPermissions";

export default function NewsListing() {
  return (
    <PermissionGate permission={["news.view", "news.manage"]}>
      <NewsListingInner />
    </PermissionGate>
  );
}

function NewsListingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can: canManage } = usePermission("news.manage");
  
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // URL parameters
  const activeType = searchParams.get("type") || "All";
  const activeStatus = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 9;
  
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { showAlert } = useAlert();
  const debouncedSearch = useDebounce(search, 500);

  // Sync debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset page on search
    
    // Only push if changed to avoid loops
    if (params.get("q") !== searchParams.get("q")) {
      router.push(`/admin/news?${params.toString()}`);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [searchParams]); // Refetch when URL changes

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === null || newFilters[key] === "All" || newFilters[key] === "") {
        params.delete(key);
      } else {
        params.set(key, newFilters[key]);
      }
    });
    router.push(`/admin/news?${params.toString()}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAdminNews({ 
        page, 
        limit, 
        search: searchParams.get("q") || "", 
        type: activeType === "Pending" ? "All" : activeType,
        status: activeStatus || (activeType === "Pending" ? "REVIEW" : ""),
      });
      
      if (response) {
        setNews(response.items || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      toast.error("Failed to load campus publications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canManage) {
      toast.error("You need news.manage permission to archive publications");
      return;
    }
    showAlert({
      title: "Archive publication?",
      message: `Move “${title}” to the archive? It will no longer appear in public listings.`,
      onConfirm: async () => {
        try {
          await deleteApi(`/news/${id}`);
          toast.success("Publication archived");
          fetchData();
        } catch (error) {
          toast.error("Could not archive this publication");
        }
      }
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!canManage) {
      toast.error("You need news.manage permission to change status");
      return;
    }
    try {
      await patchApi(`/news/${id}/status`, { status: normalizePublishStatus(newStatus) });
      toast.success(`Status updated to ${publishStatusLabel(newStatus)}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
           <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Newspaper size={14} />
              <span>Campus Publications</span>
           </div>
          <h2 className="text-4xl font-black text-primary-darker tracking-tighter font-serif ">Manage Campus News</h2>
          <p className="text-slate-500 font-medium text-sm max-w-xl">Create, review, and publish university news, research, and announcements.</p>
        </div>
        {canManage && (
          <Link href="/admin/news/new" className="bg-primary-darker text-white py-5 px-10 flex items-center space-x-3 text-xs font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all group">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>New Publication</span>
          </Link>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
         <div className="flex flex-col md:flex-row items-stretch">
            <div className="relative flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Search repository by title, category or content..." 
                  value={search}
                   onChange={(e) => { 
                      setSearch(e.target.value);
                   }}
                  className="w-full bg-transparent border-none p-6 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-inset focus:ring-primary outline-none placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest"
               />
            </div>
            
            <div className="flex flex-wrap items-center bg-slate-50/50 md:border-l border-slate-100">
                {['All', 'News', 'Research', 'Event', 'Pending'].map(type => (
                  <button 
                    key={type}
                    onClick={() => { updateFilters({ type: type === 'Pending' ? null : type, status: type === 'Pending' ? 'REVIEW' : null, page: 1 }); }}
                    className={`px-8 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-r border-slate-100 last:border-0 ${
                      activeType === type ? "bg-white text-primary shadow-[inset_0_-2px_0_0_#037b90]" : "text-slate-400 hover:text-primary hover:bg-white"
                    }`}
                  >
                    {type}
                  </button>
               ))}
            </div>

            <div className="flex items-center px-4 border-l border-slate-100 bg-white">
               <div className="flex bg-slate-100 p-1 rounded-sm gap-1">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ListIcon size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
               </div>
            </div>

            <button onClick={fetchData} className="p-6 text-slate-400 hover:text-primary transition-colors border-l border-slate-100 bg-white">
               <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
         </div>
      </div>

      {/* Content Area */}
      {loading && news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Synchronising Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
           {news.length > 0 ? (
             viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                  {news.map((item) => (
                    <GridCard key={item.id} item={item} canManage={canManage} onDelete={handleDelete} onStatusChange={handleStatusUpdate} query={search} />
                  ))}
                </div>
             ) : (
                <div className="bg-white border border-slate-200 divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
                   {news.map((item) => (
                    <ListRow key={item.id} item={item} canManage={canManage} onDelete={handleDelete} onStatusChange={handleStatusUpdate} query={search} />
                  ))}
                </div>
             )
           ) : (
             <div className="py-40 text-center bg-white border border-slate-200 shadow-sm">
                <Archive className="mx-auto text-slate-200 mb-6" size={64} />
                <p className="text-slate-400 uppercase font-black tracking-[0.4em] text-xs ">Institutional vault is empty</p>
                <p className="text-slate-300 text-[10px] mt-2 font-bold uppercase tracking-widest">Try adjusting your filtration parameters</p>
             </div>
           )}

           {/* Pagination Controls */}
           {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Showing <span className="text-primary-darker">{news.length}</span> of <span className="text-primary-darker">{total}</span> Publications
                 </p>
                 <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
                      disabled={page === 1}
                      className="p-3 bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:text-primary transition-all shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center px-4">
                       <span className="text-xs font-black text-primary-darker uppercase tracking-widest">Page {page} of {totalPages}</span>
                    </div>
                    <button 
                      onClick={() => updateFilters({ page: Math.min(totalPages, page + 1) })}
                      disabled={page === totalPages}
                      className="p-3 bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:text-primary transition-all shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </button>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
}

// Sub-components for cleaner code
const GridCard = ({ item, canManage, onDelete, onStatusChange, query }: { item: any, canManage: boolean, onDelete: any, onStatusChange: any, query?: string }) => (
  <div className="bg-white group flex flex-col h-full overflow-hidden relative border border-slate-100 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl">
    {/* Featured Badge */}
    {item.featured_menu && (
      <div className="absolute top-4 right-4 z-10">
          <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 flex items-center space-x-2 shadow-lg">
            <CheckCircle2 size={10} />
            <span>Featured: {item.featured_menu.title}</span>
          </div>
      </div>
    )}

    <div className="p-8 flex-1 space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <span className="bg-primary-darker text-white text-[9px] font-black uppercase tracking-widest px-3 py-1">
                {item.type || 'News'}
            </span>
            <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-3 py-1">
                {item.category}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <Calendar size={12} />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
      </div>
      
      <h4 className="text-2xl font-black text-primary-darker leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors font-serif ">
          <Highlight text={item.title} query={query || ""} />
      </h4>

      <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
          <div className="flex items-center space-x-2">
            <User size={14} className="text-primary" />
            <span>OUK Commms</span>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className={`text-[10px] px-2 py-1 uppercase tracking-widest font-black border ${publishStatusClass(item.status)}`}>
              {publishStatusLabel(item.status || (item.is_published ? "PUBLISHED" : "DRAFT"))}
            </span>
            {canManage && (
              <select 
                value={normalizePublishStatus(item.status, !!item.is_published)}
                onChange={(e) => onStatusChange(item.id, e.target.value)}
                className="text-[9px] font-bold text-slate-500 bg-transparent border-b border-slate-200 outline-none uppercase tracking-widest"
              >
                {PUBLISH_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
      </div>
    </div>

    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center space-x-2">
          <Clock size={12} className="text-slate-400" />
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Actions Required</span>
      </div>
      <div className="flex items-center space-x-2">
          {item.status === 'REVIEW' && (
            <Link 
              href={`/admin/news/${item.id}/preview`} 
              className="p-3 bg-yellow-100 border border-yellow-200 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
            >
              <CheckCircle2 size={14} /> Review
            </Link>
          )}
          <Link 
            href={`/news/${item.slug}`} 
            target="_blank"
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
          >
            <Eye size={16} />
          </Link>
          {canManage && (
            <>
              <Link 
                href={`/admin/news/${item.id}`} 
                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
              >
                <Edit size={16} />
              </Link>
              <button 
                onClick={() => onDelete(item.id, item.title)}
                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
      </div>
    </div>
  </div>
);

const ListRow = ({ item, canManage, onDelete, onStatusChange, query }: { item: any, canManage: boolean, onDelete: any, onStatusChange: any, query?: string }) => (
  <div className="group hover:bg-slate-50 transition-colors p-6 flex items-center gap-8">
     {/* Status Icon */}
     <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-none border ${item.is_published ? 'bg-green-50 border-green-100 text-green-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
        <FileText size={20} />
     </div>

     {/* Primary Info */}
     <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
           <h4 className="text-lg font-black text-primary-darker uppercase tracking-tight truncate group-hover:text-primary transition-colors">
             <Highlight text={item.title} query={query || ""} />
           </h4>
           <div className="flex flex-col items-start">
             <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${publishStatusClass(item.status)}`}>
                {publishStatusLabel(item.status || (item.is_published ? 'PUBLISHED' : 'DRAFT'))}
             </span>
             {canManage && (
               <select 
                 value={normalizePublishStatus(item.status, !!item.is_published)}
                 onChange={(e) => onStatusChange(item.id, e.target.value)}
                 className="text-[9px] mt-1 font-bold text-slate-500 bg-transparent border-b border-slate-200 outline-none uppercase tracking-widest"
               >
                 {PUBLISH_STATUS_OPTIONS.map((opt) => (
                   <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
               </select>
             )}
           </div>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} className="text-primary" /> {new Date(item.created_at).toLocaleDateString()}
           </span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-l border-slate-200 pl-6">
              <Tag className="text-primary" size={12} /> {item.category}
           </span>
           {item.featured_menu && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 border-l border-slate-200 pl-6">
                 <CheckCircle2 size={12} /> Featured in {item.featured_menu.title}
              </span>
           )}
        </div>
     </div>

     {/* Meta info for desktop */}
     <div className="hidden lg:flex flex-col items-end shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker">{item.type || 'News'}</span>
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Institutional Publication</span>
     </div>

     {/* Actions */}
     <div className="flex items-center gap-2 shrink-0">
        {item.status === 'REVIEW' && (
          <Link 
            href={`/admin/news/${item.id}/preview`} 
            className="h-10 px-4 flex items-center justify-center bg-yellow-100 border border-yellow-200 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all shadow-sm text-[10px] font-black uppercase tracking-widest gap-2"
          >
            <CheckCircle2 size={14} /> Review
          </Link>
        )}
        <Link 
          href={`/news/${item.slug}`} 
          target="_blank"
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
        >
          <ExternalLink size={14} />
        </Link>
        {canManage && (
          <>
            <Link 
              href={`/admin/news/${item.id}`} 
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
            >
              <Edit size={14} />
            </Link>
            <button 
              onClick={() => onDelete(item.id, item.title)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
     </div>
  </div>
);
