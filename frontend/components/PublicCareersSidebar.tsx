'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { ChevronRight, Briefcase, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function PublicCareersSidebar({ categories }: { categories: Category[] }) {
  const t = useTranslations('Careers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    // Smooth transition without full page refresh and without jumping to top
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white p-8 shadow-sm border border-slate-100 lg:sticky lg:top-32">
      <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center">
        {t('careerTracks')}
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => handleCategoryChange('')}
          className={`w-full group flex items-center justify-between px-5 py-4 text-sm font-bold transition-all duration-300 ${!activeCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 bg-slate-50 hover:bg-[#ff7f50] hover:text-white border border-transparent hover:border-slate-100'}`}
        >
          <span>{t('allOpportunities')}</span>
          {!activeCategory && <ChevronRight size={16} className="text-white" />}
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full group flex items-center justify-between px-5 py-4 text-sm font-bold transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 bg-slate-50 hover:bg-[#ff7f50] hover:text-white border border-transparent hover:border-slate-100'}`}
            >
              <span>{cat.name}</span>
              {isActive && <ChevronRight size={16} className="text-white" />}
            </button>
          );
        })}
      </div>

      {/* Sidebar Promo */}
      <div className="mt-10 p-6 bg-slate-50 border border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03]" />
        <Briefcase size={24} className="text-primary mb-4 relative z-10" />
        <h4 className="text-primary-darker font-bold mb-2 tracking-tight relative z-10">{t('needHelp')}</h4>
        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 relative z-10">{t('needHelpBody')}</p>
        <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center hover:opacity-70 transition-opacity relative z-10">
          {t('submitResume')} <ArrowRight size={14} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
