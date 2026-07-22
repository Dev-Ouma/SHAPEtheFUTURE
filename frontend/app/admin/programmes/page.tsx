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
  GraduationCap,
  Clock,
  Layers,
  Award,
  ArrowRight,
  BookOpen,
  Filter,
  Check
} from "lucide-react";
import { getApi, deleteApi, getSchools } from "@/lib/api";
import { getAdminPrograms } from "@/lib/api";
import { useAlert } from "@/context/AlertContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Highlight from "@/components/Highlight";

const STUDY_LEVELS = ["Certificate", "Diploma", "Undergraduate", "Postgraduate", "Short Course"];

export default function ProgramsListing() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  
  // Pagination & Server-side filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const [limit] = useState(10);
  const [filterSchool, setFilterSchool] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { showAlert } = useAlert();

  useEffect(() => {
    fetchMetadata();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, filterSchool, filterLevel, filterStatus]);

  const fetchMetadata = async () => {
    try {
      const schoolData = await getSchools() as any;
      const data = Array.isArray(schoolData) ? schoolData : (schoolData?.data || []);
      setSchools(data || []);
    } catch { 
      toast.error("Failed to load schools metadata"); 
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminPrograms({
        page,
        limit,
        search: debouncedSearch,
        school: filterSchool,
        level: filterLevel,
        status: filterStatus || undefined
      });
      
      // Handle both paginated and raw array responses (backward compatibility check)
      if (res && res.data) {
        setPrograms(res.data);
        setTotalPrograms(res.total);
        setTotalPages(res.totalPages || 1);
      } else {
        setPrograms(Array.isArray(res) ? res : []);
        setTotalPrograms(Array.isArray(res) ? res.length : 0);
        setTotalPages(1);
      }
    } catch {
      toast.error("Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    showAlert({
      title: "Remove Programme?",
      message: `Are you sure you want to move "${title}" to the Recycle Bin? All associated academic units will be retained for 30 days.`,
      confirmText: "Move to Bin",
      onConfirm: async () => {
        try {
          await deleteApi(`/programmes/${id}`);
          toast.success("Moved to Recycle Bin");
          fetchData();
        } catch {
          toast.error("Removal failed");
        }
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tighter">Academic Catalogue</h2>
          <p className="text-slate-500 font-medium text-sm text-slate-500">Manage schools, departments, and individual degree programmes.</p>
        </div>
        <Link href="/admin/programmes/new" className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
          <Plus size={20} />
          <span>Add New Programme</span>
        </Link>
      </div>

      {/* Stats Cards - Matching Course Units Pattern */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Programmes", val: totalPrograms },
          { label: "Active Schools", val: schools.length },
          { label: "Catalogue Page", val: `${page}/${totalPages}` },
          { label: "Current Results", val: programs.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-100 p-6 shadow-sm">
            <div className="text-3xl font-black text-primary-darker">{stat.val}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar - DB Optimized */}
      <div className="bg-white border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Search by title, code or level..." 
               value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
               className="w-full bg-slate-50 border-none p-4 pl-12 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none placeholder:uppercase placeholder:text-[10px]"
            />
         </div>
         <select
            value={filterSchool} 
            onChange={(e) => { setFilterSchool(e.target.value); setPage(1); }}
            className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary text-slate-600 border-none"
          >
            <option value="">All Schools</option>
            {(schools || []).map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
          </select>
          <select
            value={filterLevel} 
            onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
            className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary text-slate-600 border-none"
          >
            <option value="">All Levels</option>
            {STUDY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary text-slate-600 border-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Drafts</option>
            <option value="REVIEW">Pending Review</option>
            <option value="PUBLISHED">Published</option>
          </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
          {/* Table-like headers for Programmes */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">Programme Details</div>
            <div className="col-span-3">Duration & Metrics</div>
            <div className="col-span-2">Study Level</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-50">
             {(programs || []).length > 0 ? (
               (programs || []).map((item, i) => (
                 <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="col-span-5 flex items-center space-x-6">
                       <div className="w-12 h-12 bg-primary-darker flex items-center justify-center text-white shrink-0 group-hover:bg-[#ff7f50] hover:text-white transition-colors duration-500">
                          <GraduationCap size={20} />
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors">
                             <Highlight text={item.title || ""} query={search} quiet />
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.school?.name || "No School Assigned"}</p>
                       </div>
                    </div>

                    <div className="col-span-3 flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <div className="flex items-center space-x-2">
                          <Clock size={14} className="text-primary" />
                          <span>{item.duration || "N/A"}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                          <Layers size={14} className="text-secondary" />
                          <span>{item.unitsCount ?? item.units?.length ?? 0} Units</span>
                       </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-start space-y-1">
                       <span className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {item.level || "Degree"}
                       </span>
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                         item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                         item.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-500'
                       }`}>
                         {item.status || 'DRAFT'}
                       </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end space-x-2">
                       {item.status === 'REVIEW' && (
                          <Link 
                            href={`/admin/programmes/${item.id}/preview`} 
                            className="p-3 bg-yellow-100 border border-yellow-200 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors shadow-sm"
                            title="Review & Approve"
                          >
                            <Check size={16} />
                          </Link>
                       )}
                       <Link 
                          href={`/programmes/${item.slug}`} 
                          target="_blank"
                          className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors shadow-sm"
                          title="View Live"
                       >
                          <Eye size={16} />
                       </Link>
                       <Link 
                          href={`/admin/programmes/${item.id}`} 
                          className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-secondary transition-colors shadow-sm"
                          title="Edit"
                       >
                          <Edit size={16} />
                       </Link>
                       <button 
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-colors shadow-sm" 
                          title="Delete"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </motion.div>
               ))
             ) : (
               <div className="py-32 text-center">
                  <BookOpen size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 uppercase font-black tracking-widest text-xs">No programmes matched your criteria</p>
                  <button 
                    onClick={() => { setSearch(""); setFilterSchool(""); setFilterLevel(""); }} 
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
               </div>
             )}
          </div>

          {/* Pagination Bar - Custom Standard */}
          <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-t border-slate-100">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Found {totalPrograms} Programmes in Catalogueue
             </div>
             <div className="flex items-center space-x-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-white border border-slate-200 text-primary-darker disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <div className="px-4 text-xs font-black uppercase tracking-widest text-primary-darker">
                   Page {page} <span className="text-slate-300 mx-2">/</span> {totalPages}
                </div>
                <button 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 bg-white border border-slate-200 text-primary-darker disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ArrowRight size={16} />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
