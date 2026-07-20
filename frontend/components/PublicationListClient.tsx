"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import PublicationCard from './PublicationCard';
import { LayoutGrid, List, Search, Filter, X, ChevronDown, BookOpen } from 'lucide-react';
import { ServerPagination } from './research/ServerPagination';

interface PublicationListClientProps {
  initialData: any;
  schools: any[];
  departments: any[];
}

export default function PublicationListClient({ initialData, schools, departments }: PublicationListClientProps) {
  const t = useTranslations('Research');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [view, setView] = useState<'grid' | 'list'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || "");

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

  const clearFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const publicationTypes = [
    { label: t('typeJournal'), value: 'journal' },
    { label: t('typeConference'), value: 'conference' },
    { label: t('typeBook'), value: 'book' },
    { label: t('typeChapter'), value: 'book_chapter' },
    { label: t('typeReport'), value: 'technical_report' },
    { label: t('typeThesis'), value: 'thesis' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => (currentYear - i).toString());

  const Dropdown = ({ label, value, options, onSelect, placeholder }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-5 bg-slate-50 border ${isOpen ? 'border-primary ring-1 ring-primary/10' : 'border-slate-100'} hover:border-primary/30 transition-all text-[11px] font-black uppercase tracking-widest text-primary-darker shadow-sm relative overflow-hidden group`}
        >
          <div className={`absolute left-0 top-0 h-full w-1 bg-primary transition-transform duration-300 ${isOpen ? 'scale-y-100' : 'scale-y-0'}`} />
          <span className="truncate pr-4">{options.find((o: any) => o.value === value)?.label || placeholder}</span>
          <ChevronDown size={14} className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 max-h-72 overflow-y-auto rounded-none py-2 animate-in fade-in slide-in-from-top-1">
               <button 
                 onClick={() => { onSelect(null); setIsOpen(false); }}
                 className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 border-b border-slate-50 text-slate-300 hover:text-red-500 transition-colors"
               >
                 {t('clearFilter', { label })}
               </button>
               {options.map((opt: any) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSelect(opt.value); setIsOpen(false); }}
                    className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all border-b border-slate-50 last:border-0 ${value === opt.value ? 'bg-primary/5 text-primary border-l-4 border-l-primary pl-4' : 'text-slate-600'}`}
                  >
                    {opt.label}
                  </button>
               ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-16">
      <aside className={`lg:w-80 space-y-12 h-fit lg:sticky lg:top-36 ${sidebarOpen ? 'fixed inset-0 z-50 bg-white p-8 overflow-y-auto' : 'hidden lg:block'}`}>
        <div className="flex lg:hidden items-center justify-between mb-10">
           <span className="text-2xl font-black uppercase tracking-tighter italic font-serif text-primary-darker underline decoration-primary decoration-4 underline-offset-8">{t('filters')}</span>
           <button onClick={() => setSidebarOpen(false)} className="w-12 h-12 bg-primary-darker text-white flex items-center justify-center transition-transform hover:rotate-90"><X size={20} /></button>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-darker flex items-center gap-4">
              <Search size={14} className="text-primary" />
              {t('repoSearch')}
           </label>
           <div className="relative group">
              <input 
                type="text" 
                placeholder={t('repoSearchPlaceholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full p-6 bg-slate-50 border-2 border-transparent border-l-primary focus:border-slate-100 focus:bg-white text-[11px] font-black uppercase tracking-widest outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
              {searchValue && (
                <button onClick={() => setSearchValue("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors">
                  <X size={16} />
                </button>
              )}
           </div>
        </div>

        <div className="space-y-10">
          <Dropdown 
            label={t('intellectualPortfolio')}
            value={searchParams.get('schoolId')}
            placeholder={t('allSchools')}
            options={schools.map(s => ({ label: s.name, value: s.id }))}
            onSelect={(val: any) => updateQuery({ schoolId: val, page: '1' })}
          />

          <Dropdown 
            label={t('scholarlyClassification')}
            value={searchParams.get('type')}
            placeholder={t('allDocTypes')}
            options={publicationTypes}
            onSelect={(val: any) => updateQuery({ type: val, page: '1' })}
          />

          <Dropdown 
            label={t('temporalHorizon')}
            value={searchParams.get('year')}
            placeholder={t('anyYear')}
            options={years.map(y => ({ label: y, value: y }))}
            onSelect={(val: any) => updateQuery({ year: val, page: '1' })}
          />
        </div>

        {(searchParams.toString() !== "" || searchValue !== "") && (
          <button 
            onClick={clearFilters}
            className="w-full py-5 border-2 border-slate-100 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:bg-[#ff7f50] hover:text-white hover:border-[#ff7f50] transition-all flex items-center justify-center gap-4 group"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
            {t('purgeFilters')}
          </button>
        )}

        <div className="p-10 bg-primary-darker relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">{t('discoveryEngine')}</p>
           <h4 className="text-white text-sm font-bold leading-relaxed font-serif italic">
             {t('repoVersion')} <br />
             <span className="text-slate-500 font-mono text-[9px] not-italic opacity-60">{t('doiOrcid')}</span>
           </h4>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 pb-8 border-b-2 border-slate-50">
           <div className="flex items-center gap-8">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden px-6 py-4 bg-[#037b90] text-white flex items-center gap-4 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#037b90]/10 hover:bg-[#ff7f50] active:scale-95 transition-all"
              >
                <Filter size={16} /> {t('filters')}
              </button>
              <div className="flex items-center gap-4">
                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('layout')}</span>
                 <div className="flex bg-slate-50 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <button 
                      onClick={() => setView('grid')}
                      className={`p-3 transition-all ${view === 'grid' ? 'bg-white shadow-md text-primary' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                       <LayoutGrid size={18} />
                    </button>
                    <button 
                      onClick={() => setView('list')}
                      className={`p-3 transition-all ${view === 'list' ? 'bg-white shadow-md text-primary' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                       <List size={18} />
                    </button>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
              {isPending && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                   <span>{t('indexing')}</span>
                </div>
              )}
              <span className="text-primary-darker text-base">{initialData.total}</span> {t('recordsFound')}
           </div>
        </div>

        {initialData.data.length > 0 ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-12' : 'space-y-10'}>
            {initialData.data.map((pub: any) => (
               <PublicationCard key={pub.id} publication={pub} variant={view} />
            ))}
          </div>
        ) : (
          <div className="py-48 text-center bg-slate-50/30 border-2 border-dashed border-slate-100 shadow-inner">
             <BookOpen size={80} className="mx-auto text-slate-100 mb-10 opacity-50" />
             <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-primary-darker mb-6 italic font-serif">{t('nullResult')}</h3>
             <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-[0.2em] leading-loose px-6">
               {t('nullResultBody')}
             </p>
             <button onClick={clearFilters} className="mt-12 text-[11px] font-black text-primary uppercase tracking-[0.5em] underline underline-offset-[12px] hover:text-[#ff7f50] transition-colors decoration-2">{t('purgeParams')}</button>
          </div>
        )}

        {initialData.lastPage > 1 && (
          <ServerPagination 
            currentPage={parseInt(searchParams.get('page') || '1')}
            totalPages={initialData.lastPage}
            total={initialData.total}
            limit={initialData.limit || 10}
          />
        )}
      </div>
    </div>
  );
}
