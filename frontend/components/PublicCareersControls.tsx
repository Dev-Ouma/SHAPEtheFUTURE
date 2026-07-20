'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PublicCareersControls({ total, currentPage, lastPage }: { total: number, currentPage: number, lastPage: number }) {
  const t = useTranslations('Careers');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Use a simple naive debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleQueryChange('search', searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleQueryChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key === 'search') {
      params.delete('page'); // Reset pagination on new search
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 justify-between items-center bg-white px-6 py-4 border border-slate-100 mb-6 relative z-30 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPositions')}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={() => handleQueryChange('show_past', searchParams.get('show_past') === 'true' ? '' : 'true')}
          className={`flex items-center gap-2 px-6 py-3 border transition-all text-[10px] font-black uppercase tracking-widest ${searchParams.get('show_past') === 'true' ? 'bg-primary-darker border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
        >
          {searchParams.get('show_past') === 'true' ? t('viewActive') : t('viewArchives')}
        </button>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
            {t('pageShort', { current: currentPage, total: lastPage })}
          </span>
          <button
            onClick={() => handleQueryChange('page', (currentPage - 1).toString())}
            disabled={currentPage <= 1}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleQueryChange('page', (currentPage + 1).toString())}
            disabled={currentPage >= lastPage}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
