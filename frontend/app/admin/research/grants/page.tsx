"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Award, 
  User, 
  Calendar, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  ChevronDown,
  Building2,
  DollarSign
} from 'lucide-react';
import { getApi, deleteApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminGrantsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [grants, setGrants] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || "");

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (searchValue === searchParams.get('search')) return;
    const handler = setTimeout(() => {
       updateQuery({ search: searchValue || null, page: '1' });
    }, 600);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const fetchDependencies = async () => {
    try {
      const schoolsData = await getApi('/schools');
      setSchools(schoolsData);
    } catch (e) {
      console.error("Failed to load dependencies");
    }
  };

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', limit.toString());
      
      const response = await getApi(`/research/grants?${params.toString()}`);
      
      setGrants(response.data || []);
      setTotal(response.total || 0);
      setLastPage(response.lastPage || Math.ceil((response.total || 0) / limit));
    } catch (e) {
      toast.error('Failed to load grants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [searchParams]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete grant "${title}"?`)) return;
    try {
      await deleteApi(`/research/grants/${id}`);
      toast.success('Grant deleted successfully');
      fetchGrants();
    } catch (e) {
      toast.error('Failed to delete grant');
    }
  };

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Awarded', value: 'awarded' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-primary-darker tracking-tighter uppercase italic font-serif">Research Grants</h1>
          <p className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-widest opacity-80">Institutional Funding and Awards Registry</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/research/grants/form" 
            className="px-8 py-5 bg-[#037b90] text-white text-[11px] font-black uppercase tracking-widest rounded-none hover:bg-[#ff7f50] transition-all shadow-2xl shadow-[#037b90]/10 flex items-center gap-3 active:scale-95"
          >
            <Plus size={20} /> Record New Grant
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-100 flex flex-col lg:flex-row lg:items-stretch shadow-md">
        <div className="relative flex-grow lg:max-w-md border-b lg:border-b-0 lg:border-r border-slate-100">
          <Search size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Grants..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-transparent text-xs font-bold uppercase tracking-widest outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="flex-grow p-4 lg:p-0 flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-0">
          <div className="relative flex-1 min-w-[160px] lg:border-r border-slate-100 group">
            <select 
              value={searchParams.get('schoolId') || ""}
              onChange={(e) => updateQuery({ schoolId: e.target.value || null, page: '1' })}
              className="appearance-none w-full bg-transparent px-8 py-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-slate-50 transition-all cursor-pointer"
            >
              <option value="">All Schools</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#037b90] transition-colors" />
          </div>

          <div className="relative flex-1 min-w-[160px] lg:border-r border-slate-100 group">
            <select 
              value={searchParams.get('status') || ""}
              onChange={(e) => updateQuery({ status: e.target.value || null, page: '1' })}
              className="appearance-none w-full bg-transparent px-8 py-6 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-slate-50 transition-all cursor-pointer"
            >
              <option value="">Any Status</option>
              {statusOptions.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-[#037b90] transition-colors" />
          </div>

          {(searchParams.toString() !== "" || searchValue !== "") && (
            <button 
              onClick={() => { setSearchValue(""); router.push(pathname); }}
              className="px-8 py-6 text-slate-400 hover:text-[#ff7f50] border-r border-slate-100 transition-all group lg:min-w-[80px]"
              title="Clear All Filters"
            >
              <X size={18} className="mx-auto group-hover:rotate-90 transition-transform" />
            </button>
          )}

          <div className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#037b90] bg-slate-50 lg:min-w-[200px] text-center whitespace-nowrap">
             {total} awarded grants
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] relative">
        {isPending && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden z-20">
             <div className="h-full bg-[#037b90] animate-progress-indeterminate w-1/3" />
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-darker text-white uppercase tracking-[0.25em] font-black text-[10px]">
                <th className="px-10 py-6">Grant Title / Identity</th>
                <th className="px-10 py-6">Funder / Agency</th>
                <th className="px-10 py-6">Amount / Awarded</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`${loading ? 'opacity-40' : ''} transition-opacity`}>
              {loading && grants.length === 0 ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-10 py-10"><div className="h-4 bg-slate-50 rounded w-64 animate-pulse" /></td>
                    <td className="px-10 py-10"><div className="h-4 bg-slate-50 rounded w-32 animate-pulse" /></td>
                    <td className="px-10 py-10"><div className="h-4 bg-slate-50 rounded w-20 animate-pulse" /></td>
                    <td className="px-10 py-10"></td>
                  </tr>
                ))
              ) : grants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-48 text-center bg-slate-50/50">
                    <Award size={80} className="mx-auto text-slate-100 mb-8 opacity-50" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm italic font-serif">Grants Registry is empty</p>
                  </td>
                </tr>
              ) : grants.map(grant => (
                <tr key={grant.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                     <div className="flex flex-col gap-3">
                        <div className="font-black text-primary-darker group-hover:text-[#037b90] transition-colors text-base uppercase tracking-tight font-serif italic max-w-xl line-clamp-2">
                          {grant.title}
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                               <User size={12} className="text-primary" />
                               Lead: {grant.lead_investigator?.full_name || 'Unassigned'}
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-600">
                        <Building2 size={18} className="text-[#037b90]/20" />
                        {grant.funder_name}
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex flex-col gap-2">
                        <div className="text-[11px] font-black text-primary-darker tracking-tight">
                           {grant.currency || 'KES'} {parseFloat(grant.amount || '0').toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black font-serif italic">
                           <Calendar size={12} />
                           Awarded: {grant.awarded_date ? new Date(grant.awarded_date).getFullYear() : 'N/A'}
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Link 
                          href={`/admin/research/grants/form?id=${grant.id}`} 
                          className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ff7f50] transition-all shadow-sm"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(grant.id, grant.title)} 
                          className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ff7f50] transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && total > 0 && (
          <div className="bg-white border-t border-slate-100 p-8 flex items-center justify-between">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
               Grants <span className="text-primary-darker mx-2">{page}</span> / <span className="text-primary-darker mx-2">{lastPage}</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                 disabled={page === 1}
                 onClick={() => updateQuery({ page: (page - 1).toString() })}
                 className="w-14 h-14 border border-slate-100 bg-slate-50 text-slate-400 disabled:opacity-20 hover:bg-[#037b90] hover:text-white hover:border-[#037b90] transition-all shadow-sm group"
               >
                 <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               </button>
               <button 
                 disabled={page === lastPage}
                 onClick={() => updateQuery({ page: (page + 1).toString() })}
                 className="w-14 h-14 border border-slate-100 bg-slate-50 text-slate-400 disabled:opacity-20 hover:bg-[#037b90] hover:text-white hover:border-[#037b90] transition-all shadow-sm group"
               >
                 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes progress-indeterminate {
          0% { left: -33%; }
          100% { left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
          position: absolute;
          width: 33%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
