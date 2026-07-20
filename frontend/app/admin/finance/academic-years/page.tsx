"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle, XCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { getApi, deleteApi } from '@/lib/api';

export default function AcademicYearsAdmin() {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getApi(`/fee-structures/academic-years/list?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}`);
      setYears(data?.data || []);
      setTotalPages(data?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this academic year? Make sure no programme fees are still attached to it.")) {
      try {
        await deleteApi(`/fee-structures/academic-years/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to delete. It might be referenced by existing fee structures.");
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Academic Years</h1>
          <p className="text-slate-500 font-medium mt-1">Manage academic cycles for fee structures.</p>
        </div>
        <Link 
          href="/admin/finance/academic-years/create"
          className="bg-primary hover:bg-primary-dark transition-colors text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center space-x-2 shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          <span>New Year</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search year range..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Year Range</th>
                <th className="px-6 py-4">Current Active</th>
                <th className="px-6 py-4">Published</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">Loading academic years...</td>
                </tr>
              ) : years.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-slate-300" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No academic years found.</p>
                  </td>
                </tr>
              ) : (
                years.map((y) => (
                  <tr key={y.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-primary-darker">{y.year_range}</td>
                    <td className="px-6 py-4">
                      {y.is_current ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Yes</span> : <span className="text-slate-400 font-bold text-xs uppercase">No</span>}
                    </td>
                    <td className="px-6 py-4">
                      {y.is_published ? <CheckCircle className="text-emerald-500" size={18} /> : <XCircle className="text-rose-500" size={18} />}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/finance/academic-years/${y.id}`}
                          className="p-2 text-slate-400 hover:text-primary bg-white hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(y.id)}
                          className="p-2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-30"
            >
              Previous
            </button>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Page <span className="text-primary-darker mx-1">{page}</span> of {totalPages}
            </div>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
