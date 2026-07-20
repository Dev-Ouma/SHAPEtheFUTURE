import React from 'react';
import FAQDiscoveryPortal from '@/components/FAQDiscoveryPortal';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Faqs' });
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  };
}

export default async function FAQPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Faqs' });

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 -ml-80 -mt-80 rounded-full blur-[120px]" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl text-left">
            <div className="flex items-center gap-6 mb-10">
               <div className="w-16 h-1 bg-[#ff7f50]" />
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t('eyebrow')}</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] font-serif italic mb-12">
               {t('title')} <br /> <span className="text-primary not-italic">{t('titleAccent')}</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
               {t('subtitle')}
            </p>
          </div>
        </div>
      </header>

      <FAQDiscoveryPortal />
    </div>
  );
}
