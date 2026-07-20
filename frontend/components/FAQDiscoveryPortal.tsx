"use client";

import React, { useState, useEffect } from 'react';
import FAQClient from './FAQClient';
import { getFaqs } from '../lib/api';
import { RefreshCw, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function FAQDiscoveryPortal() {
  const t = useTranslations('Faqs');
  const locale = useLocale();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getFaqs({ is_active: true, limit: 100, locale });
        const data = response?.data || [];
        const categories = Array.from(new Set<string>(data.map((f: any) => f.category)))
          .filter(Boolean)
          .sort();

        const grouped = categories.map(cat => ({
          category: cat,
          questions: data
            .filter((f: any) => f.category === cat)
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
            .map((f: any) => ({
              id: f.id,
              question: f.question,
              answer: f.answer
            }))
        }));
        setFaqs(grouped);
      } catch (err) {
        console.error("Discovery Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [locale]);

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('loading')}</span>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="py-40 text-center">
        <Search className="mx-auto text-slate-200 mb-8" size={64} />
        <h4 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">{t('emptyTitle')}</h4>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">{t('emptyBody')}</p>
      </div>
    );
  }

  return <FAQClient faqs={faqs} />;
}
