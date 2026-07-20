"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit3, Trash2, Eye, Building, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApi, deleteApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCareersList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch
      });
      const response = await getApi(`/careers/admin?${queryParams.toString()}`);
      
      setJobs(response.data || []);
      setTotal(response.total || 0);
      setLastPage(response.lastPage || 1);
    } catch (e) {
      toast.error('Failed to load careers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, debouncedSearch]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteApi(`/careers/${id}`);
      toast.success('Job deleted successfully');
      fetchJobs(); // Re-fetch to correctly calculate pagination and next items
    } catch (e) {
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-primary-darker tracking-tight">Careers Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage job postings, taxonomy, and applications.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/careers/taxonomies" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center">
             Manage Taxonomies
          </Link>
          <Link href="/admin/careers/form" className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-[#ff7f50] hover:text-white transition-colors shadow-sm shadow-primary/20 flex items-center gap-2">
            <Plus size={18} /> New Job
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search jobs by title or reference..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm outline-none transition-all"
          />
        </div>
        <div className="flex items-center text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
           Total Server Records: {total}
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Position</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Classification</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Deadline</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-48 animate-pulse" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-32 animate-pulse" /></td>
                    <td className="px-6 py-6"></td>
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Briefcase size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">No jobs found matching your query.</p>
                  </td>
                </tr>
              ) : jobs.map(job => {
                const isClosed = job.application_deadline && new Date(job.application_deadline) < new Date();
                const dStatus = isClosed ? 'Closed' : job.status;

                return (
                  <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${job.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                         <div>
                            <div className="font-bold text-primary-darker group-hover:text-primary transition-colors">
                              {job.title}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-1">
                               Ref: {job.reference_code} 
                               {job.job_grade ? <><span className="mx-2 opacity-30">•</span>[Grade: {job.job_grade}]</> : ''}
                            </div>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-xs font-bold text-slate-600 mb-1 flex items-center">
                         <Building size={12} className="mr-2 opacity-50" />
                         {job.division?.name || 'No Division'}
                       </div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-widest">{job.job_category?.name || 'General'}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                         dStatus === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                         dStatus === 'Closed' ? 'bg-red-50 text-red-600 border border-red-100' :
                         'bg-amber-50 text-amber-600 border border-amber-100'
                       }`}>
                         {dStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                       {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admissions/careers/${job.job_category?.slug || 'general'}/${job.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-primary hover:bg-[#ff7f50] hover:text-white rounded-lg transition-colors">
                            <Eye size={16} />
                          </Link>
                          <Link href={`/admin/careers/form?id=${job.id}`} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit3 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(job.id, job.title)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Block */}
        {!loading && total > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
               Showing Page {page} of {lastPage}
            </div>
            <div className="flex items-center gap-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
               >
                 <ChevronLeft size={16} />
               </button>
               <button 
                 disabled={page === lastPage}
                 onClick={() => setPage(p => p + 1)}
                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
               >
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
