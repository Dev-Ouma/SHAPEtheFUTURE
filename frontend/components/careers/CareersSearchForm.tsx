"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CareersSearchForm() {
  const t = useTranslations('Careers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/careers?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('keywordSearch')}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-primary/50 transition-all rounded-lg"
        />
      </div>
      <button type="submit" className="mt-3 w-full py-2.5 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg hover:bg-[#ff7f50] transition-colors">
        {t('search')}
      </button>
    </form>
  );
}
