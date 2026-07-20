"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Trash, 
  RefreshCw, 
  Search, 
  Clock, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getApi, postApi, deleteApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAlert } from '@/context/AlertContext';
import { useDebounce } from '@/hooks/useDebounce';

interface DeletedItem {
  id: string;
  title: string;
  type: string;
  entityName: string;
  deletedAt: string;
}

export default function RecycleBinPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { showAlert } = useAlert();
  const debouncedSearch = useDebounce(search, 500);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: debouncedSearch
      });
      
      const data = await getApi(`/admin/recycle-bin?${params.toString()}`);
      if (data) {
        setItems(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      }
    } catch (error) {
      toast.error("Failed to load Recycle Bin");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleRestore = (item: DeletedItem) => {
    showAlert({
      title: "Restore Item?",
      message: `Are you sure you want to restore "${item.title}" to the active registry?`,
      type: 'info',
      confirmText: "Restore Now",
      onConfirm: async () => {
        try {
          await postApi(`/admin/recycle-bin/${item.entityName}/${item.id}/restore`, {});
          toast.success("Item restored successfully");
          fetchItems();
        } catch (error) {
          toast.error("Restoration failed");
        }
      }
    });
  };

  const handleDestroy = (item: DeletedItem) => {
    showAlert({
      title: "Destroy Permanently?",
      message: `This action cannot be undone. "${item.title}" will be permanently removed from the institutional database immediately.`,
      type: 'danger',
      confirmText: "Delete Permanently",
      onConfirm: async () => {
        try {
          await deleteApi(`/admin/recycle-bin/${item.entityName}/${item.id}`);
          toast.success("Item permanently removed");
          fetchItems();
        } catch (error) {
          toast.error("Permanent deletion failed");
        }
      }
    });
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate);
    expiryDate.setDate(expiryDate.getDate() + 60); // Policy is 60 days
    const today = new Date();
    const diff = expiryDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
        <div className="space-y-8 pb-20">
            {/* Header - Refined */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-50 pb-8 gap-6">
                <div>
                   <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif tracking-tight uppercase leading-none">Recycle Bin</h2>
                   <p className="text-slate-400 font-medium text-xs">Recover or definitively purge institutional records.</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                        onClick={fetchItems}
                        className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-white transition-all rounded-xl"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                    <a 
                        href="/admin"
                        className="bg-primary text-white py-4 px-8 rounded-xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-[#ff7f50] hover:text-white transition-all"
                    >
                        <span>Dashboard</span>
                    </a>
                </div>
            </div>

            {/* Retention Info - Clean */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex items-center space-x-8">
                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Clock size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Institutional Retention Policy</h4>
                    <p className="text-slate-500 text-[11px] font-medium mt-1 leading-relaxed">
                        Soft-deleted records are preserved for 60 days before definitive institutional erasure.
                    </p>
                </div>
            </div>

            {/* Filters - Minimal */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search for deleted items..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-6 text-xs font-bold outline-none ring-primary/10 focus:ring-2 transition-all"
                    />
                </div>
            </div>

            {/* Content List - Clean Minimal */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white border border-slate-100 rounded-2xl space-y-4">
                    <RefreshCw className="animate-spin text-primary" size={32} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Synchronising Archive...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="py-40 text-center bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center">
                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} className="text-slate-100" />
                    </div>
                    <h3 className="text-slate-400 uppercase font-black tracking-widest text-[10px]">Registry Archive Clean</h3>
                    <p className="text-slate-300 text-[9px] font-bold mt-2 uppercase tracking-widest">No pending recoveries.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 overflow-hidden shadow-sm rounded-2xl">
                        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-300">
                            <div className="col-span-5">Institutional Record</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Erasure Date</div>
                            <div className="col-span-3 text-right">Administrative Action</div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {items.map((item, i) => {
                                const daysLeft = getDaysRemaining(item.deletedAt);
                                return (
                                    <div key={`${item.entityName}-${item.id}`} className="grid grid-cols-12 gap-4 px-8 py-6 items-center group transition-colors hover:bg-slate-50">
                                        <div className="col-span-5 flex items-center space-x-6">
                                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                                <Trash2 size={16} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary-darker text-xs uppercase tracking-tight truncate max-w-xs">{item.title}</p>
                                                <p className="text-[9px] text-slate-300 uppercase tracking-widest font-black mt-1">UID: {item.id.toString().split('-')[0]}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-lg">
                                                {item.type}
                                            </span>
                                        </div>

                                        <div className="col-span-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">
                                            {new Date(item.deletedAt).toLocaleDateString()}
                                        </div>

                                        <div className="col-span-3 flex items-center justify-end space-x-2">
                                            <div className="mr-6 flex items-center space-x-4">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${daysLeft < 15 ? 'text-red-500' : 'text-slate-300'}`}>
                                                    {daysLeft}d
                                                </span>
                                                <div className="w-12 bg-slate-100 h-1 overflow-hidden rounded-full">
                                                    <div 
                                                        className={`h-full ${daysLeft < 15 ? 'bg-red-500' : 'bg-primary'}`}
                                                        style={{ width: `${(daysLeft / 60) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRestore(item)}
                                                className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-emerald-500 hover:border-emerald-200 border border-transparent transition-all rounded-lg flex items-center justify-center group/btn"
                                                title="Restore"
                                            >
                                                <RotateCcw size={14} className="group-hover/btn:-rotate-45 transition-transform" />
                                            </button>
                                            <button 
                                                onClick={() => handleDestroy(item)}
                                                className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-red-500 hover:border-red-200 border border-transparent transition-all rounded-lg flex items-center justify-center"
                                                title="Purge"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Server-Side Pagination Controls */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           Showing Page <span className="text-primary-darker">{page}</span> of <span className="text-primary-darker">{totalPages}</span> — {totalItems} Archived Items
                        </div>

                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum = page;
                              if (totalPages > 5) {
                                if (page <= 3) pageNum = i + 1;
                                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = page - 2 + i;
                              } else {
                                pageNum = i + 1;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`w-12 h-12 text-[10px] font-black rounded-xl border transition-all ${
                                    page === pageNum ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button 
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
  );
}
