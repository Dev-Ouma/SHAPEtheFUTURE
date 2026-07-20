"use client";

import React from 'react';
import { Link } from '@/i18n/routing';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface Publication {
  id: string;
  title: string;
  slug: string;
  abstract: string;
  publication_year: number;
  type: string;
  journal_name?: string;
  publisher?: string;
  doi?: string;
  url?: string;
  staff_authors: { id: string, full_name: string, profile_slug: string }[];
  external_authors?: string;
  is_open_access: boolean;
  keywords?: string[];
}

interface PublicationCardProps {
  publication: Publication;
  variant?: 'grid' | 'list';
}

export default function PublicationCard({ publication, variant = 'list' }: PublicationCardProps) {
  const t = useTranslations('Research');
  const isList = variant === 'list';
  
  const allAuthors = [
    ...publication.staff_authors.map(a => ({ name: a.full_name, slug: a.profile_slug })),
    ...(publication.external_authors ? publication.external_authors.split(',').map(name => ({ name: name.trim(), slug: null })) : [])
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-white border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-7 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden ${isList ? 'flex flex-col md:flex-row gap-8' : 'flex flex-col h-full'}`}
    >
      {publication.is_open_access && (
        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
          {t('openAccess')}
        </div>
      )}

      {/* Visual Indicator */}
      <div className={`absolute left-0 top-0 h-full w-1.5 bg-primary/20 group-hover:bg-primary transition-colors duration-500 ${isList ? 'md:block hidden' : 'block'}`} />

      <div className={`${isList ? 'flex-1' : ''} flex flex-col h-full`}>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-5">
          <span className="text-primary bg-primary/5 px-2.5 py-1 border border-primary/10">{publication.type.replace('_', ' ')}</span>
          <span className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
          <span className="font-serif italic text-xs">{publication.publication_year}</span>
        </div>

        <Link href={`/research/publications/${publication.slug}`} className="group-hover:text-primary transition-all">
          <h3 className={`font-serif font-black text-primary-darker uppercase tracking-tighter leading-[1.05] mb-5 italic transition-colors group-hover:scale-[1.01] origin-left ${isList ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
            {publication.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-6">
          {allAuthors.map((author, idx) => (
            <React.Fragment key={idx}>
              {author.slug ? (
                <Link 
                  href={`/about/staff/${author.slug}`}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-all border-b border-transparent hover:border-primary/40 pb-0.5"
                >
                  {author.name}
                </Link>
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{author.name}</span>
              )}
              {idx < allAuthors.length - 1 && <span className="text-slate-200 font-light translate-y-[1px]">|</span>}
            </React.Fragment>
          ))}
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 mb-7 leading-relaxed font-medium italic opacity-80">
          "{publication.abstract}"
        </p>

        <div className="mt-auto pt-7 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            {publication.journal_name && (
               <div className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-[#ff7f50]/40" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 font-serif italic">
                   {publication.journal_name}
                 </span>
               </div>
            )}
            {publication.publisher && (
               <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.25em]">
                 {publication.publisher}
               </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {publication.doi && (
              <a 
                href={`https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-primary transition-all bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 shadow-sm"
                title={t('doiTitle')}
              >
                <ExternalLink size={16} />
              </a>
            )}
            <Link 
              href={`/research/publications/${publication.slug}`}
              className="px-6 py-3 bg-[#037b90] text-white text-[9px] font-black uppercase tracking-[0.4em] hover:bg-[#ff7f50] transition-all shadow-xl shadow-[#037b90]/10 flex items-center gap-2 group/btn"
            >
              <span>{t('exploreData')}</span>
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-[#ff7f50] group-hover:text-white" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
