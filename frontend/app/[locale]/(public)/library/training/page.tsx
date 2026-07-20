"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { 
  MonitorPlay, 
  Clock, 
  Users, 
  Youtube,
  CloudDownload,
  Loader2,
  Info
} from 'lucide-react';
import { getLibraryWorkshops, getLibraryTutorials } from '@/lib/api';

export default function TrainingPage() {
  const t = useTranslations('Library');
  const locale = useLocale();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [wsData, tutData] = await Promise.all([
          getLibraryWorkshops(),
          getLibraryTutorials()
        ]);
        setWorkshops(wsData);
        setTutorials(tutData);
      } catch (error) {
        console.error("Failed to fetch training data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleRegister = (id: string) => {
    setIsRegistered(id);
    setTimeout(() => setIsRegistered(null), 3000);
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -mr-32 -mt-32" />
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-20" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 text-center lg:text-left">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
                  <div className="w-12 h-1 bg-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">{t('trainEyebrow')}</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase font-serif italic mb-8">
                  {t('trainTitle')} <br /> <span className="text-primary not-italic">{t('trainTitleAccent')}</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t('trainBody')}
                </p>
              </div>
              <div className="hidden lg:flex justify-end pr-12">
                 <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`w-32 h-32 border-2 ${n % 2 === 0 ? 'border-primary' : 'border-white/10'} opacity-20`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </header>

      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
           <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif">{t('workshopTitle')} <span className="text-primary italic">{t('workshopTitleAccent')}</span></h2>
                <p className="text-slate-500 font-medium">{t('workshopBody')}</p>
              </div>
              <div className="flex text-[10px] font-black uppercase tracking-widest text-slate-400 gap-8 border-b border-slate-100 pb-4">
                 <span>{t('semester')}</span>
                 <span>{t('nairobiTime')}</span>
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <Loader2 className="text-primary animate-spin" size={48} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t('syncingCalendar')}</p>
             </div>
           ) : (
             <div className="space-y-6">
                {workshops.map((workshop: any) => {
                  const dateObj = new Date(workshop.date);
                  const month = dateObj.toLocaleString(locale === 'sw' ? 'sw-KE' : 'en-GB', { month: 'short' });
                  const day = dateObj.getDate();
                  
                  return (
                    <div key={workshop.id} className="group bg-slate-50 border border-slate-100 p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 transition-all hover:bg-white hover:shadow-2xl hover:border-primary/10 hover:-translate-y-1">
                       <div className="flex items-center gap-10 lg:w-1/3">
                          <div className="bg-white p-6 shadow-sm text-center border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors">
                             <p className="text-[10px] font-black uppercase tracking-widest mb-1">{month}</p>
                             <p className="text-3xl font-black tracking-tighter tabular-nums">{day}</p>
                          </div>
                          <div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">{workshop.type}</span>
                             <h3 className="text-2xl font-black uppercase tracking-tighter text-primary-darker group-hover:text-primary transition-colors italic">{workshop.title}</h3>
                          </div>
                       </div>

                       <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('timing')}</p>
                             <div className="flex items-center gap-2 text-primary-darker font-black text-[11px] uppercase tracking-tighter">
                                <Clock size={12} />
                                <span>{workshop.time}</span>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('ledBy')}</p>
                             <div className="flex items-center gap-2 text-primary-darker font-black text-[11px] uppercase tracking-tighter">
                                <Users size={12} />
                                <span>{workshop.speaker}</span>
                             </div>
                          </div>
                          <div className="col-span-2 space-y-1">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('description')}</p>
                             <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{workshop.description}</p>
                          </div>
                       </div>

                       <div className="lg:w-1/6 flex justify-end items-center gap-6">
                          <div className="text-right hidden xl:block">
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('availability')}</p>
                             <p className="text-sm font-black text-primary-darker">{workshop.available_slots}/{workshop.total_slots}</p>
                          </div>
                          <button 
                            onClick={() => handleRegister(workshop.id)}
                            className={`px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
                              isRegistered === workshop.id 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-primary-darker text-white hover:bg-primary'
                            }`}
                          >
                             {isRegistered === workshop.id ? t('spotSecured') : t('registerNow')}
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-6">
           <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif italic">{t('onDemandTitle')} <span className="text-primary not-italic">{t('onDemandTitleAccent')}</span></h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">{t('onDemandBody')}</p>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <Loader2 className="text-primary animate-spin" size={48} />
             </div>
           ) : (
             <div className="grid md:grid-cols-3 gap-10">
                {tutorials.map((tut: any, i: number) => (
                  <div key={i} className="bg-white p-12 border border-slate-100 shadow-[10px_10px_0px_0px_rgba(15,23,42,0.03)] hover:shadow-2xl hover:border-primary/20 transition-all group">
                     <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors">
                        <MonitorPlay className="text-primary" />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{tut.category}</span>
                     <h3 className="text-2xl font-black uppercase tracking-tighter font-serif text-primary-darker mb-6">{tut.title}</h3>
                     <div className="flex items-center gap-4 mb-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-6">
                        <Clock size={12} />
                        <span>{t('duration', { duration: tut.duration })}</span>
                     </div>
                     <a 
                       href={tut.video_url} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-center gap-3 text-primary-darker group-hover:text-primary font-black uppercase tracking-widest text-[10px] transition-colors"
                     >
                        <span>{t('watchTutorial')}</span>
                        <MonitorPlay size={16} />
                     </a>
                  </div>
                ))}
             </div>
           )}

           <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 bg-primary-darker p-12 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                 <Youtube className="text-red-500" size={48} />
                 <div className="text-left">
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">{t('youtubeTitle')}</h4>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] mt-1">{t('youtubeSub')}</p>
                 </div>
              </div>
              <div className="md:w-px h-12 bg-white/10 hidden md:block" />
              <a href="#" className="bg-white text-primary-darker px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all relative z-10">
                 {t('subscribeLearn')}
              </a>
           </div>
        </div>
      </section>

      <section className="py-32 container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="md:w-1/2 p-16 bg-primary text-white space-y-10 shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
               <div className="relative z-10">
                  <CloudDownload size={64} className="mb-10 text-white/50" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter font-serif leading-none italic mb-8">{t('survivalTitle')} <br /> <span className="text-white not-italic">{t('survivalTitleAccent')}</span></h3>
                  <p className="text-white/80 font-medium text-lg leading-relaxed mb-10">
                    {t('survivalBody')}
                  </p>
                  <button className="bg-primary-darker text-white px-12 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all shadow-xl">
                     {t('downloadKit')}
                  </button>
               </div>
            </div>
            
            <div className="md:w-1/2 space-y-12">
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-12 h-px bg-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('strategyEyebrow')}</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-primary-darker uppercase tracking-tighter font-serif leading-none italic">
                 {t('competencyTitle')} <br /><span className="text-primary not-italic">{t('competencyTitleAccent')}</span>
               </h2>
               <p className="text-slate-500 text-lg font-medium leading-relaxed">
                 {t('competencyBody')}
               </p>
               <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                     <p className="text-3xl font-black text-primary-darker tracking-tighter italic font-serif">250+</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('workshopsAnnually')}</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-3xl font-black text-primary-darker tracking-tighter italic font-serif">15K+</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('studentsTrained')}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 bg-primary-darker text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <Info size={40} className="mx-auto text-primary/30 mb-8" />
          <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-white italic mb-6">{t('personalizedTitle')}</h2>
          <p className="text-slate-400 font-medium mb-10 max-w-xl mx-auto">{t('personalizedBody')}</p>
          <div className="flex justify-center gap-6">
            <Link 
              href="/library/help"
              className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              {t('requestGroup')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
