"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle, XCircle, Search, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProgrammeFeesAdmin() {
  const router = useRouter();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const feesRes = await getApi(`/fee-structures/programme-fees/list?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);

      if (feesRes && feesRes.data) {
        setFees(feesRes.data);
        setTotalPages(feesRes.totalPages || 1);
      } else {
        setFees(Array.isArray(feesRes) ? feesRes : []);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (fee: any) => {
    router.push(`/admin/finance/programme-fees/${fee.id}`);
  };

  const openNewPage = () => {
    router.push('/admin/finance/programme-fees/create');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-darker uppercase tracking-tighter">Programme Fees</h1>
          <p className="text-slate-500 font-medium mt-1">Manage detailed fee structures for programmes.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search programmes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={openNewPage}
            className="bg-primary hover:bg-primary-dark transition-colors text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center space-x-2 shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus size={16} />
            <span>New Fee Structure</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest font-black text-slate-500">
              <tr>
                <th className="px-6 py-5">Programme</th>
                <th className="px-6 py-5">Academic Year</th>
                <th className="px-6 py-5">Currency</th>
                <th className="px-6 py-5 text-right">Tuition</th>
                <th className="px-6 py-5 text-right">Other Fees</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map((f) => {
                // Calculate total of dynamic fees + any legacy hardcoded ones
                let otherFeesTotal = 0;
                if (f.other_fees && Array.isArray(f.other_fees)) {
                  otherFeesTotal += f.other_fees.reduce((acc: number, cur: any) => acc + Number(cur.amount || 0), 0);
                }
                // Fallback for legacy
                otherFeesTotal += Number(f.registration_fee || 0) + Number(f.student_activity_fee || 0) + Number(f.examination_fee || 0) + Number(f.technology_fee || 0) + Number(f.library_fee || 0) + Number(f.practical_laboratory_fee || 0);
                
                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-primary-darker">{f.program?.title || 'Unknown Programme'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{f.academic_year?.year_range || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">{f.currency}</td>
                    <td className="px-6 py-4 text-right font-black text-primary-darker">{Number(f.tuition_fee).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-500">{otherFeesTotal > 0 ? otherFeesTotal.toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {f.is_active ? 
                          <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={12} /><span>Active</span>
                          </span> : 
                          <span className="flex items-center space-x-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                            <XCircle size={12} /><span>Inactive</span>
                          </span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(f)}
                        className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Fee Structure"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {fees.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    {search ? `No results found for "${search}"` : "No fee structures configured yet."}
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-primary font-bold animate-pulse">
                    Loading fee structures...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
