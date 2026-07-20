import React from 'react';
import { getTranslations } from 'next-intl/server';
import { getPublications, getSchools, getDepartments } from '@/lib/api';
import PublicationListClient from '@/components/PublicationListClient';
import { Database, Share2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  return {
    title: t('pubMetaTitle'),
    description: t('pubMetaDesc'),
  };
}

export default async function PublicationsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: any;
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'Research' });
  const [publicationsData, schools, departments] = await Promise.all([
    getPublications({ ...searchParams, locale: params.locale }),
    getSchools(params.locale),
    getDepartments(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="bg-primary-darker pt-44 pb-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 -mr-96 -mt-96 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff7f50]/5 -ml-40 -mb-40 rounded-full blur-[100px]" />

          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-1 bg-[#ff7f50]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">{t('eyebrow')}</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] font-serif italic mb-12">
                 {t('pubTitle')} <br /> <span className="text-primary not-italic">{t('pubTitleAccent')}</span>
              </h1>

              <div className="flex flex-col md:flex-row md:items-center gap-12 mt-12">
                <p className="text-xl text-slate-400 font-medium max-w-xl leading-relaxed">
                   {t('pubBody')}
                </p>

                <div className="grid grid-cols-2 gap-10 border-l border-white/10 pl-12">
                  {[
                    { label: t('pubTotalOutput'), value: publicationsData.total.toString(), icon: <Database size={16} /> },
                    { label: t('globalCitations'), value: '1.2k+', icon: <Share2 size={16} /> },
                  ].map((stat, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-center gap-3 text-primary mb-3">
                         {stat.icon}
                         <span className="text-4xl font-black text-white font-serif italic leading-none">{stat.value}</span>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 bg-white">
           <div className="container mx-auto px-6">
              <PublicationListClient 
                initialData={publicationsData} 
                schools={schools} 
                departments={departments} 
              />
           </div>
        </section>
      </main>
    </div>
  );
}
