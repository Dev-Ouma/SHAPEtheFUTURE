"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Lock, 
  Globe, 
  Layers,
  FlaskConical,
  Scale,
  Briefcase,
  Monitor,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { getLibraryDatabases } from '@/lib/api';

export default function DatabasesPage() {
  const t = useTranslations('Library');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [databases, setDatabases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: t('catAll'), icon: <Layers size={18} /> },
    { id: 'multidisciplinary', name: t('catMulti'), icon: <Globe size={18} /> },
    { id: 'stem', name: t('catStem'), icon: <FlaskConical size={18} /> },
    { id: 'business', name: t('catBusiness'), icon: <Briefcase size={18} /> },
    { id: 'law', name: t('catLaw'), icon: <Scale size={18} /> },
  ];

  React.useEffect(() => {
    async function fetchDatabases() {
      setLoading(true);
      try {
        const data = await getLibraryDatabases(activeCategory);
        setDatabases(data);
      } catch (error) {
        console.error("Failed to fetch databases:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDatabases();
  }, [activeCategory]);

  const filteredDatabases = databases.filter(db => {
    const matchesSearch = db.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         db.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -ml-64 -mt-64" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-4 mb-10 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{t('dbEyebrow')}</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter uppercase font-serif italic mb-8">
            {t('dbTitle')} <span className="text-primary not-italic">{t('dbTitleAccent')}</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-16">
            {t('dbBody')}
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/40 transition-all rounded-sm" />
            <div className="relative flex overflow-hidden rounded-sm bg-primary-darker/50 backdrop-blur-md border border-white/20 group-focus-within:border-primary transition-all">
              <div className="flex items-center px-6 text-slate-500">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                placeholder={t('dbSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-7 px-2 font-bold text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-20 z-40 bg-white border-b border-slate-100 shadow-sm scrollbar-hide py-4">
        <div className="container mx-auto px-6 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat.id 
                  ? 'bg-primary-darker text-white shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-400 hover:text-primary-darker border border-transparent'
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-24 bg-slate-50 min-h-[400px]">
        <div className="container mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="text-primary animate-spin" size={48} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t('loadingResources')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDatabases.length > 0 ? (
                filteredDatabases.map((db, i) => (
                  <div key={i} className="group bg-white p-10 border border-slate-100 hover:border-primary/30 hover:shadow-[30px_30px_0px_0px_rgba(3,123,144,0.05)] transition-all flex flex-col h-full rounded-sm">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Database size={24} />
                      </div>
                      {db.is_premium ? (
                        <div className="flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20 px-3 py-1 bg-primary/5">
                          <Lock size={10} />
                          <span>{t('premium')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 px-3 py-1">
                          <Globe size={10} />
                          <span>{t('openAccess')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 flex-grow">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{db.provider}</p>
                      <h3 className="text-2xl font-black uppercase tracking-tighter font-serif text-primary-darker leading-tight group-hover:text-primary transition-colors italic">
                        {db.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        {db.description}
                      </p>
                    </div>

                    <div className="pt-10 mt-10 border-t border-slate-50">
                      <a 
                        href={db.access_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 text-primary-darker group-hover:text-primary font-black uppercase tracking-widest text-[10px] transition-colors"
                      >
                        <span>{t('launchDatabase')}</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-48 text-center bg-white border-2 border-dashed border-slate-100">
                  <Search size={64} className="mx-auto text-slate-100 mb-8" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter font-serif text-primary-darker italic mb-2">{t('noDbMatches')}</h3>
                  <p className="text-slate-400 font-medium">{t('noDbMatchesBody')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-32 bg-primary-darker relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
        <div className="container mx-auto max-w-4xl px-6 relative z-10">
           <div className="bg-white/5 border border-white/10 p-16 space-y-10 text-center backdrop-blur-sm">
              <GraduationCap size={64} className="mx-auto text-primary" strokeWidth={1} />
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-serif italic">{t('offCampusTitle')} <span className="text-primary not-italic">{t('offCampusTitleAccent')}</span></h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                {t('offCampusBody')}
              </p>
              <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
                 <Link href="/library/help" className="bg-primary hover:bg-[#ff7f50] text-white py-5 px-12 text-[10px] font-black uppercase tracking-widest transition-all">
                    {t('accessTutorial')}
                 </Link>
                 <Link href="/contact" className="border border-white/20 text-white hover:bg-white/5 py-5 px-12 text-[10px] font-black uppercase tracking-widest transition-all">
                    {t('requestSupport')}
                 </Link>
              </div>
           </div>
        </div>
      </section>

      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <Monitor size={40} className="mx-auto text-primary/30 mb-8" />
          <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker italic mb-6">{t('cantFindTitle')}</h2>
          <p className="text-slate-500 font-medium mb-10">{t('cantFindBody')}</p>
          <button className="bg-primary-darker text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-xl">
             {t('submitIll')}
          </button>
        </div>
      </section>
    </div>
  );
}
