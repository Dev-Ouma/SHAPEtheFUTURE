"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Contact, 
  Globe,
  Plus,
  Minus
} from 'lucide-react';

export default function HelpPage() {
  const t = useTranslations('Library');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { question: t('faq1q'), answer: t('faq1a') },
    { question: t('faq2q'), answer: t('faq2a') },
    { question: t('faq3q'), answer: t('faq3a') },
    { question: t('faq4q'), answer: t('faq4a') },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactItems = [
    { 
      title: t('chatLibrarian'), 
      desc: t('chatLibrarianDesc'), 
      icon: <MessageCircle className="text-primary" />,
      action: t('startLiveChat'),
      link: "#"
    },
    { 
      title: t('emailSupport'), 
      desc: t('emailSupportDesc'), 
      icon: <Mail className="text-secondary" />,
      action: "library-support@ouk.ac.ke",
      link: "mailto:library-support@ouk.ac.ke"
    },
    { 
      title: t('callDesk'), 
      desc: t('callDeskDesc'), 
      icon: <Phone className="text-emerald-500" />,
      action: "+254 (0) 20 123 4567",
      link: "tel:+254201234567"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary/20">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -mr-32 -mt-32" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <div className="inline-flex items-center gap-4 mb-10 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
            <HelpCircle size={16} className="text-secondary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">{t('helpEyebrow')}</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter uppercase font-serif italic mb-8">
            {t('helpTitle')} <br /><span className="text-primary not-italic">{t('helpTitleAccent')}</span>
          </h1>
          
          <div className="max-w-3xl mx-auto relative group mt-16">
            <div className="absolute inset-0 bg-primary/20 blur-2xl group-focus-within:bg-primary/40 transition-all rounded-sm" />
            <div className="relative flex overflow-hidden rounded-sm bg-primary-darker/50 backdrop-blur-md border border-white/20 group-focus-within:border-primary transition-all shadow-2xl">
              <div className="flex items-center px-6 text-slate-500">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                placeholder={t('helpSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-7 px-2 font-bold text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
           <div className="grid md:grid-cols-3 gap-8">
              {contactItems.map((item, i) => (
                <div key={i} className="group p-10 border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all flex flex-col items-center text-center space-y-6">
                   <div className="w-16 h-16 bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tighter font-serif text-primary-darker italic">{item.title}</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                   <a href={item.link} className="text-primary font-black uppercase tracking-widest text-[10px] pt-4 block border-b border-primary/20 pb-1 hover:border-primary transition-all">
                      {item.action}
                   </a>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto max-w-4xl px-6">
           <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif italic">{t('faqTitle')} <span className="text-primary not-italic">{t('faqTitleAccent')}</span></h2>
              <p className="text-slate-500 font-medium">{t('faqBody')}</p>
           </div>

           <div className="space-y-4">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                   <button 
                     onClick={() => setOpenFaq(openFaq === i ? null : i)}
                     className="w-full flex items-center justify-between p-8 text-left group"
                   >
                      <h4 className="text-primary-darker font-black uppercase tracking-tighter text-lg leading-tight group-hover:text-primary transition-colors">
                        {faq.question}
                      </h4>
                      <div className="text-slate-300">
                         {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                      </div>
                   </button>
                   {openFaq === i && (
                     <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="h-px bg-slate-50 mb-6" />
                        <p className="text-slate-600 font-medium leading-relaxed text-lg">
                           {faq.answer}
                        </p>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="py-32 bg-white">
         <div className="container mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-12">
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-primary-darker uppercase tracking-tighter font-serif">{t('physicalTitle')} <span className="text-primary italic">{t('physicalTitleAccent')}</span></h2>
                     <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        {t('physicalBody')}
                     </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                           <Clock size={24} />
                           <h4 className="font-black uppercase tracking-widest text-xs text-primary-darker">{t('operatingHours')}</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-500 font-medium">
                           <li className="flex justify-between"><span>{t('monFri')}</span> <span className="text-primary-darker font-black uppercase">08 AM - 09 PM</span></li>
                           <li className="flex justify-between"><span>{t('saturday')}</span> <span className="text-primary-darker font-black uppercase">09 AM - 04 PM</span></li>
                           <li className="flex justify-between"><span>{t('sunday')}</span> <span className="text-slate-400 font-medium uppercase italic">{t('closed')}</span></li>
                        </ul>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 text-secondary">
                           <MapPin size={24} />
                           <h4 className="font-black uppercase tracking-widest text-xs text-primary-darker">{t('nairobiCampus')}</h4>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed whitespace-pre-line">
                           {t('campusAddress')}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-primary-darker p-16 rounded-sm shadow-3xl text-white space-y-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                  <div className="relative z-10">
                     <Contact size={64} className="mb-10 text-primary" strokeWidth={1} />
                     <h3 className="text-4xl font-black uppercase tracking-tighter font-serif leading-none italic mb-8">{t('lostIdTitle')} <br /> <span className="text-primary not-italic">{t('lostIdTitleAccent')}</span></h3>
                     <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                        {t('lostIdBody')}
                     </p>
                     <Link href="/students/id-replacement" className="bg-white text-primary-darker px-12 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl block text-center">
                        {t('requestReplacement')}
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 bg-slate-50 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <Globe size={40} className="mx-auto text-primary/30 mb-8" />
          <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker italic mb-6">{t('exploreKb')}</h2>
          <p className="text-slate-500 font-medium mb-10">{t('exploreKbBody')}</p>
          <div className="flex justify-center gap-6">
            <Link 
              href="/library/guides/referencing"
              className="bg-primary-darker text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
            >
              {t('browseArticles')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
