"use client";

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { 
  BookOpen, 
  Search, 
  CheckCircle, 
  ShieldCheck, 
  FolderOpen, 
  Laptop, 
  AlertTriangle,
  FileText,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Database,
  Library,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Search,
  CheckCircle,
  ShieldCheck,
  FolderOpen,
  Laptop
};

interface Props {
  config: any;
}

export default function InformationLiteracyClient({ config }: Props) {
  const t = useTranslations('Library');
  const coreCompetencies = config?.core_competencies || [];
  const researchSteps = config?.research_steps || [];
  const evaluationFramework = config?.evaluation_framework || [];
  const citationStyles = config?.citation_styles || [];

  const plagTips = [t('plagTip1'), t('plagTip2'), t('plagTip3'), t('plagTip4')];

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-primary/20">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden text-center lg:text-left">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-40 -mb-40" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="w-12 h-[2px] bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('infoLitEyebrow')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase font-serif mb-8">
              {t('infoLitTitle')} <br /><span className="text-primary italic">{t('infoLitTitleAccent')}</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
               {config?.meta_description || t('infoLitMetaFallback')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <Link 
                href={config?.primary_cta_link || "#core-competencies"}
                className="bg-primary text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] transition-colors w-full sm:w-auto text-center"
              >
                {config?.primary_cta_label || t('startLearning')}
              </Link>
              <Link 
                href={config?.secondary_cta_link || "/library/e-resources"}
                className="bg-white/10 text-white px-10 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors w-full sm:w-auto text-center backdrop-blur-md"
              >
                {config?.secondary_cta_label || t('accessLibraryResources')}
              </Link>
            </div>
          </motion.div>
          
          <div className="hidden lg:flex justify-end opacity-20 hover:opacity-40 transition-opacity duration-1000">
            <BookOpen size={400} strokeWidth={0.5} className="text-white" />
          </div>
        </div>
      </header>

      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <Library className="mx-auto text-slate-300 mb-8" size={48} strokeWidth={1} />
          <p className="text-2xl text-slate-700 font-medium leading-relaxed mb-8">
            {config?.intro_content || t('infoLitIntroFallback')}
          </p>
        </div>
      </section>

      <section id="core-competencies" className="py-32 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter font-serif text-primary-darker mb-6">
              {t('coreCompetencies')} <span className="text-primary italic">{t('coreCompetenciesAccent')}</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              {t('coreCompetenciesBody')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreCompetencies.map((skill: any, i: number) => {
              const Icon = ICON_MAP[skill.icon] || BookOpen;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-10 border border-slate-100 hover:border-primary/30 hover:shadow-xl transition-all group"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-primary-darker mb-4">
                    {skill.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {skill.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6 grid xl:grid-cols-2 gap-24 items-start">
          
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker mb-10">
              {t('conductingResearch')} <span className="text-primary italic">{t('conductingResearchAccent')}</span>
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {researchSteps.map((step: string, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-darker text-white font-black text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    {idx + 1}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 bg-slate-50 border border-slate-100">
                    <p className="text-slate-700 font-medium text-sm">{step}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-primary-darker p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <CheckCircle size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter font-serif mb-4">
                {t('evaluationFramework')} <span className="text-primary italic">{t('evaluationFrameworkAccent')}</span>
              </h2>
              <p className="text-slate-400 mb-12">
                {t('evaluationFrameworkBody')}
              </p>
              
              <div className="space-y-6">
                {evaluationFramework.map((item: any, i: number) => (
                  <div key={i} className="flex gap-6 items-start border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <div className="bg-primary/20 text-primary font-black text-xl w-12 h-12 flex items-center justify-center shrink-0">
                      {item.l[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold tracking-wide uppercase text-white mb-2">{item.l}</h4>
                      <p className="text-slate-400 text-sm">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="text-[#ff7f50]" size={32} />
              <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker">
                {t('avoidingPlagiarism')}
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              {config?.plagiarism_content || t('plagiarismFallback')}
            </p>
            <ul className="space-y-4 mb-8">
              {plagTips.map((list, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary-darker shrink-0" />
                  <span className="text-slate-700 text-sm leading-relaxed">{list}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-6">
              <FileText className="text-primary" size={32} />
              <h2 className="text-3xl font-black uppercase tracking-tighter font-serif text-primary-darker">
                {t('citationStyles')}
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-8">
              {t('citationStylesBody')}
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {citationStyles.map((style: string) => (
                <div key={style} className="bg-slate-50 py-4 px-6 text-center border border-slate-100 font-black uppercase tracking-widest text-[#ff7f50] text-sm">
                  {style}
                </div>
              ))}
            </div>
            <Link 
              href="/library/guides/referencing"
              className="inline-flex items-center gap-4 border-b-2 border-slate-900 pb-1 text-[11px] font-black uppercase tracking-widest text-primary-darker hover:text-primary hover:border-primary transition-colors"
            >
              {t('viewReferencingGuide')} <ArrowRight size={14} />
            </Link>
          </motion.div>

        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter font-serif text-primary-darker mb-16">
            {t('exploreEngage')} <span className="text-primary italic">{t('exploreEngageAccent')}</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-primary-darker p-12 text-left group">
              <Database className="text-primary mb-8" size={48} />
              <h3 className="text-2xl font-black tracking-tight text-white mb-4">{t('libraryDatabases')}</h3>
              <p className="text-slate-400 mb-10 leading-relaxed">
                {t('libraryDatabasesBody')}
              </p>
              <Link 
                href="/library/databases"
                className="inline-flex items-center gap-4 bg-white text-primary-darker px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
              >
                {t('accessDatabases')} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-12 text-left group">
              <BookOpen className="text-[#ff7f50] mb-8" size={48} />
              <h3 className="text-2xl font-black tracking-tight text-primary-darker mb-4">{t('libraryWorkshops')}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed">
                {t('libraryWorkshopsBody')}
              </p>
              <Link 
                href="/library/training"
                className="inline-flex items-center gap-4 bg-primary-darker text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
              >
                {t('registerTraining')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-center">
        <div className="container mx-auto max-w-4xl px-6">
          <HelpCircle size={48} className="mx-auto text-white/30 mb-8" strokeWidth={1} />
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter font-serif text-white mb-6">
            {t('needResearchHelp')}
          </h2>
          <p className="text-white/90 text-lg font-medium mb-10 max-w-2xl mx-auto">
            {t('needResearchHelpBody')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a 
              href="mailto:library@ouk.ac.ke"
              className="bg-primary-darker flex items-center justify-center gap-3 text-white px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-colors"
            >
              <MessageSquare size={16} /> {t('emailLibrary')}
            </a>
            <Link 
              href="/library/helpdesk"
              className="border border-white/30 flex items-center justify-center gap-3 text-white px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
               {t('openHelpdesk')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
