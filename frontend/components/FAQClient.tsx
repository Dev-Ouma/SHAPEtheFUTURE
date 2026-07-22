"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, BookOpen, DollarSign, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sanitizeHtml } from '@/lib/sanitize';
import Highlight from '@/components/Highlight';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  questions: FAQ[];
}

export default function FAQClient({ faqs }: { faqs: FAQCategory[] }) {
  const t = useTranslations('Faqs');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryLabel = (category: string) => {
    const map: Record<string, string> = {
      General: t('catGeneral'),
      Admissions: t('catAdmissions'),
      Academic: t('catAcademic'),
      Students: t('catStudents'),
      Technical: t('catTechnical'),
      Staff: t('catStaff'),
      Financials: t('catFinancials'),
      Financial: t('catFinancials'),
      'Academic Policies': t('catAcademicPolicies'),
    };
    return map[category] || category;
  };

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.question.toLowerCase().includes(search.toLowerCase()) || 
      q.answer.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Admissions': return <Globe size={20} />;
      case 'Financials': return <DollarSign size={20} />;
      case 'Academic Policies': return <ShieldCheck size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  return (
    <div className="py-24 container mx-auto px-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-4 space-y-12">
           <div className="sticky top-32 space-y-12">
              <div className="relative group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                 <input 
                   type="text" 
                   placeholder={t('searchPlaceholder')}
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-100 pl-16 pr-8 py-6 text-xs font-black uppercase outline-none focus:bg-white focus:border-primary/30 transition-all shadow-sm"
                 />
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">{t('ontologyGroups')}</h3>
                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className={`flex items-center justify-between p-6 text-left text-xs font-black uppercase tracking-widest transition-all border ${!activeCategory ? 'bg-primary-darker text-white border-slate-950 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-primary/20 hover:bg-slate-50'}`}
                    >
                       <span>{t('allInquiries')}</span>
                       <HelpCircle size={16} />
                    </button>
                    {faqs.map((cat) => (
                      <button 
                        key={cat.category}
                        onClick={() => setActiveCategory(cat.category)}
                        className={`flex items-center justify-between p-6 text-left text-xs font-black uppercase tracking-widest transition-all border ${activeCategory === cat.category ? 'bg-primary text-white border-primary shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-primary/20 hover:bg-slate-50'}`}
                      >
                         <span>{categoryLabel(cat.category)}</span>
                         {getCategoryIcon(cat.category)}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-16">
           {filteredFaqs.length === 0 ? (
             <div className="py-32 text-center bg-slate-50 border border-slate-100 shadow-sm">
                <Search className="mx-auto text-slate-200 mb-8" size={64} />
                <h4 className="text-2xl font-black text-primary-darker uppercase tracking-tighter font-serif">{t('voidTitle')}</h4>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">{t('voidBody')}</p>
             </div>
           ) : (
             filteredFaqs.filter(cat => !activeCategory || cat.category === activeCategory).map((cat) => (
               <div key={cat.category} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-6 mb-12">
                     <div className="w-12 h-1 bg-primary" />
                     <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-primary-darker">{categoryLabel(cat.category)} {t('registrySuffix')}</h3>
                  </div>

                  <div className="space-y-6">
                     {cat.questions.map((q) => (
                       <div key={q.id} className="group">
                          <button 
                            onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            className={`w-full text-left p-10 flex items-start justify-between gap-8 transition-all border ${expandedId === q.id ? 'bg-white border-primary/20 shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                          >
                             <span className={`text-lg md:text-xl font-black tracking-tight leading-tight uppercase font-serif italic transition-all ${expandedId === q.id ? 'text-primary' : 'text-primary-darker group-hover:text-primary'}`}>
                                <Highlight text={q.question} query={search} />
                             </span>
                             <div className={`shrink-0 w-10 h-10 flex items-center justify-center transition-all ${expandedId === q.id ? 'bg-primary text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                                <ChevronDown size={20} />
                             </div>
                          </button>
                          
                          <AnimatePresence>
                             {expandedId === q.id && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="overflow-hidden"
                               >
                                  <div 
                                    className="p-10 bg-slate-50/50 border-x border-b border-slate-100 text-slate-600 font-medium leading-relaxed text-base md:text-lg prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(q.answer) }}
                                  />
                               </motion.div>
                             )}
                          </AnimatePresence>
                       </div>
                     ))}
                  </div>
               </div>
             ))
           )}
        </div>

      </div>
    </div>
  );
}
