"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  BookOpen, 
  FileText, 
  Quote, 
  CheckCircle, 
  Copy, 
  Bookmark,
  Info,
  ArrowLeft,
  Search,
  Download,
  ExternalLink
} from 'lucide-react';

export default function ReferencingPage() {
  const t = useTranslations('Referencing');
  const [showCopied, setShowCopied] = useState(false);

  const citationStyles = [
    { 
      id: 'apa', 
      name: t('apaName'), 
      desc: t('apaDesc'),
      example: 'Author, A. A. (Year). Title of work. Publisher. DOI/URL',
      inText: '(Author, Year)'
    },
    { 
      id: 'harvard', 
      name: t('harvardName'), 
      desc: t('harvardDesc'),
      example: 'Author, A. (Year) Title of work. Edition. Place: Publisher.',
      inText: '(Author, Year)'
    },
    { 
      id: 'mla', 
      name: t('mlaName'), 
      desc: t('mlaDesc'),
      example: 'Author. Title of Source. Title of Container, Other Contributors, Version, Number, Publisher, Publication Date, Location.',
      inText: '(Author Page)'
    }
  ];

  const [activeStyleId, setActiveStyleId] = useState('apa');
  const activeStyle = citationStyles.find(s => s.id === activeStyleId) || citationStyles[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const ethics = [
    { title: t('ackSources'), desc: t('ackSourcesDesc'), icon: <CheckCircle className="text-primary" /> },
    { title: t('enableVerification'), desc: t('enableVerificationDesc'), icon: <Search className="text-primary" /> },
    { title: t('avoidPlagiarism'), desc: t('avoidPlagiarismDesc'), icon: <Bookmark className="text-primary" /> },
    { title: t('showBreadth'), desc: t('showBreadthDesc'), icon: <BookOpen className="text-primary" /> },
  ];

  const tools = [
    { name: "Mendeley", desc: t('mendeleyDesc'), link: "https://www.mendeley.com" },
    { name: "Zotero", desc: t('zoteroDesc'), link: "https://www.zotero.org" },
    { name: "EndNote", desc: t('endnoteDesc'), link: "https://endnote.com" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -ml-20 -mb-20" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <Link 
            href="/library/information-literacy" 
            className="inline-flex items-center space-x-2 text-primary text-[10px] font-black uppercase tracking-widest mb-12 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={14} />
            <span>{t('backLiteracy')}</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-secondary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">{t('eyebrow')}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase font-serif italic mb-8">
                {t('title')} <br /> <span className="text-primary not-italic">{t('titleAccent')}</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                {t('body')}
              </p>
            </div>
            <div className="hidden lg:flex justify-end transform rotate-3 scale-110 opacity-20">
              <Quote size={320} strokeWidth={0.5} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker italic">{t('selectStyle')}</h2>
              <p className="text-slate-500 font-medium mb-12">{t('selectStyleBody')}</p>
              
              <div className="space-y-3">
                {citationStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setActiveStyleId(style.id)}
                    className={`w-full text-left p-6 border transition-all flex justify-between items-center group ${
                      activeStyle.id === style.id 
                      ? 'bg-primary-darker border-slate-900 text-white shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'
                    }`}
                  >
                    <div>
                      <h4 className="font-black uppercase tracking-widest text-xs mb-1">{style.name}</h4>
                      <p className="text-[10px] font-medium leading-tight text-slate-400">
                        {t('standardized')}
                      </p>
                    </div>
                    <ArrowLeft size={16} className={`rotate-180 transition-transform ${activeStyle.id === style.id ? 'translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-slate-50 border border-slate-100 p-12 h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <FileText size={200} />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter font-serif text-primary-darker mb-2">
                  {activeStyle.name} <span className="text-primary italic">{t('blueprint')}</span>
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-12 max-w-xl">{activeStyle.desc}</p>

                <div className="space-y-12 relative z-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Bookmark size={12} /> {t('bibliography')}
                    </p>
                    <div className="bg-primary-darker text-white p-8 font-mono text-sm leading-relaxed relative group/code shadow-2xl">
                      {activeStyle.example}
                      <button 
                         onClick={() => handleCopy(activeStyle.example)}
                         className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 transition-colors rounded"
                         title={t('copyTemplate')}
                      >
                         <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Quote size={12} /> {t('inText')}
                    </p>
                    <div className="bg-white border border-slate-200 p-8 font-mono text-sm text-slate-700 italic shadow-sm">
                      {t('inTextSample', { citation: activeStyle.inText })}
                    </div>
                  </div>
                </div>

                {showCopied && (
                   <div className="absolute bottom-12 right-12 bg-emerald-500 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl animate-bounce">
                     {t('templateCopied')}
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-primary-darker relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-serif italic">
              {t('ethicsTitle')} <span className="text-primary not-italic">{t('ethicsTitleAccent')}</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">{t('ethicsBody')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ethics.map((item, i) => (
              <div key={i} className="p-10 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors space-y-6">
                <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-sm">
                  {item.icon}
                </div>
                <h4 className="text-white font-black uppercase tracking-tighter text-xl">{item.title}</h4>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-6">
           <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2 space-y-10">
                 <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif">{t('mgmtTitle')} <span className="text-primary italic">{t('mgmtTitleAccent')}</span></h2>
                 <p className="text-slate-500 font-medium text-lg leading-relaxed">
                   {t('mgmtBody')}
                 </p>
                 <div className="space-y-6">
                    {tools.map((tool, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-200 group hover:border-primary transition-colors">
                         <div>
                            <h4 className="font-black uppercase tracking-widest text-xs text-primary-darker">{tool.name}</h4>
                            <p className="text-slate-400 text-[10px] font-medium">{tool.desc}</p>
                         </div>
                         <a href={tool.link} target="_blank" rel="noreferrer" className="text-slate-300 group-hover:text-primary transition-colors">
                           <ExternalLink size={20} />
                         </a>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="md:w-1/2">
                 <div className="bg-primary p-16 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10 space-y-6 text-white text-center">
                       <Download size={64} className="mx-auto mb-8 opacity-50 group-hover:scale-110 transition-transform" />
                       <h3 className="text-3xl font-black uppercase tracking-tighter font-serif">{t('guideTitle')}</h3>
                       <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest leading-relaxed max-w-xs mx-auto">
                         {t('guideBody')}
                       </p>
                       <button className="bg-primary-darker text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-all shadow-xl">
                          {t('downloadPdf')}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-24 bg-white text-center border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-3xl">
          <Info size={40} className="mx-auto text-primary/30 mb-8" />
          <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker italic mb-6">{t('confusedTitle')}</h2>
          <p className="text-slate-500 font-medium mb-10">{t('confusedBody')}</p>
          <div className="flex justify-center gap-6">
            <Link 
              href="/library/training"
              className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg shadow-primary/20"
            >
              {t('viewWorkshops')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
