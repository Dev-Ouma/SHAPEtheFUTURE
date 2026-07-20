"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Database, 
  FileText, 
  Link as LinkIcon, 
  Lock, 
  Unlock, 
  ArrowRight,
  Star,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getEResources, getEResourceProviders, getEResourceSubjects } from '@/lib/api';

function LibrarySelect({ label, options, value, onChange, placeholder, allLabel }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o: any) => o.id === value);

  return (
    <div className="relative mb-6">
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-left flex items-center justify-between group hover:border-primary/30 transition-all"
      >
        <span className={`text-[11px] font-bold ${selectedOption ? 'text-primary-darker' : 'text-slate-400 font-medium'}`}>
          {selectedOption ? selectedOption.name || selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-40 w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden py-2"
            >
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="w-full px-4 py-3 text-left text-[11px] font-bold text-slate-400 hover:bg-slate-50 flex items-center justify-between"
              >
                {allLabel}
                {!value && <Check size={14} className="text-primary" />}
              </button>
              {options.map((opt: any) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onChange(opt.id); setIsOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-[11px] font-bold transition-colors flex items-center justify-between ${
                    value === opt.id ? 'text-primary bg-primary/5' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.name || opt.label}
                  {value === opt.id && <Check size={14} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EResourcesClient() {
  const t = useTranslations('EResources');
  const [resources, setResources] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const categories = [
    { id: 'E-Book', icon: BookOpen, label: t('catEbook'), description: t('catEbookDesc') },
    { id: 'E-Journal', icon: FileText, label: t('catEjournal'), description: t('catEjournalDesc') },
    { id: 'Database', icon: Database, label: t('catDatabase'), description: t('catDatabaseDesc') },
    { id: 'Institutional Repository', icon: LinkIcon, label: t('catRepo'), description: t('catRepoDesc') },
    { id: 'Open Access Resource', icon: Unlock, label: t('catOpen'), description: t('catOpenDesc') },
    { id: 'Past Paper', icon: FileText, label: t('catPapers'), description: t('catPapersDesc') },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedSubject, selectedProvider]);

  const fetchInitialData = async () => {
    try {
      const [p, s] = await Promise.all([
        getEResourceProviders(),
        getEResourceSubjects()
      ]);
      setProviders(p);
      setSubjects(s);
    } catch (error) {
      console.error("Failed to fetch taxonomies", error);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await getEResources({
        search: searchTerm,
        type: selectedType,
        subjectId: selectedSubject,
        providerId: selectedProvider,
        status: 'Published'
      });
      setResources(data);
    } catch (error) {
      console.error("Failed to fetch resources", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedSubject('');
    setSelectedProvider('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-40 -mb-40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('eyebrow')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase font-serif mb-8">
              {t('title')} <br /><span className="text-primary italic">{t('titleAccent')}</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              {t('body')}
            </p>
            
            <div className="relative group max-w-2xl mx-auto lg:mx-0">
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 -mt-16 mb-24 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedType(selectedType === cat.id ? '' : cat.id)}
              className={`flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 border-2 ${
                selectedType === cat.id ? 'border-primary' : 'border-transparent'
              }`}
            >
              <div className={`p-5 rounded-2xl mb-5 ${selectedType === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400'}`}>
                <cat.icon size={28} />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest text-center ${selectedType === cat.id ? 'text-primary' : 'text-primary-darker'}`}>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 pb-40">
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 sticky top-32">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary-darker flex items-center gap-3">
                  <Filter size={16} />
                  {t('discovery')}
                </h3>
                {(selectedType || selectedSubject || selectedProvider || searchTerm) && (
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest"
                  >
                    {t('reset')}
                  </button>
                )}
              </div>

              <LibrarySelect 
                label={t('resourceType')}
                placeholder={t('chooseCategory')}
                options={categories}
                value={selectedType}
                onChange={setSelectedType}
                allLabel={t('allLabel', { label: t('resourceType') })}
              />

              <LibrarySelect 
                label={t('subjectArea')}
                placeholder={t('allDisciplines')}
                options={subjects}
                value={selectedSubject}
                onChange={setSelectedSubject}
                allLabel={t('allLabel', { label: t('subjectArea') })}
              />

              <LibrarySelect 
                label={t('provider')}
                placeholder={t('scholarlySources')}
                options={providers}
                value={selectedProvider}
                onChange={setSelectedProvider}
                allLabel={t('allLabel', { label: t('provider') })}
              />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black font-serif italic tracking-tighter text-primary-darker">
                {searchTerm || selectedType || selectedSubject || selectedProvider ? (
                   t('foundResources', { count: resources.length })
                ) : (
                  <>{t('featuredDigital')} <span className="text-primary not-italic">{t('featuredDigitalAccent')}</span> {t('featuredCollection')}</>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                <Loader2 className="animate-spin mb-6" size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('syncing')}</p>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resources.map((res) => (
                  <ResourceCard key={res.id} resource={res} exploreLabel={t('exploreAsset')} spotlightLabel={t('spotlight')} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search size={40} className="text-slate-300" strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black font-serif italic text-primary-darker mb-4">{t('noAssets')}</h3>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                  {t('noAssetsBody')}
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-primary-darker text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10"
                >
                  {t('resetDiscovery')}
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ resource, exploreLabel, spotlightLabel }: { resource: any; exploreLabel: string; spotlightLabel: string }) {
  const Icon = resource.resource_type === 'E-Book' ? BookOpen :
               resource.resource_type === 'E-Journal' ? FileText :
               Database;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-primary/20 transition-all flex flex-col relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
          <Icon size={24} />
        </div>
        <div className="flex gap-2">
          {resource.is_featured && (
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <Star size={10} fill="currentColor" />
              {spotlightLabel}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
            resource.access_type === 'Open Access' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {resource.access_type === 'Open Access' ? <Unlock size={10} /> : <Lock size={10} />}
            {resource.access_type}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-black text-primary-darker mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[56px]">
        {resource.title}
      </h3>
      
      <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-10 flex-1">
        {resource.summary || resource.description}
      </p>

      <div className="space-y-8 relative z-10">
        <div className="flex flex-wrap gap-2">
          {resource.provider && (
            <span className="px-4 py-2 bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {resource.provider.name}
            </span>
          )}
          {resource.subjects?.slice(0, 1).map((s: any) => (
            <span key={s.id} className="px-4 py-2 bg-primary/5 text-primary/40 group-hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              {s.name}
            </span>
          ))}
        </div>

        <Link 
          href={`/library/e-resources/${resource.slug}`}
          className="w-full h-14 bg-primary-darker text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-900/5 hover:shadow-primary/20"
        >
          {exploreLabel}
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
