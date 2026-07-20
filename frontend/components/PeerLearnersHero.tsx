"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { resolveImageUrl } from '@/lib/api';
import SafeImage from '@/components/ui/SafeImage';
import { useTranslations } from 'next-intl';

export default function PeerLearnersHero({ initialLearners = [], totalCount = 0 }: { initialLearners: any[], totalCount: number }) {
    const t = useTranslations('PeerLearners');
    const previewMentors = initialLearners?.slice(0, 4) || [];

    return (
        <section className="relative pt-48 pb-32 bg-primary-darker overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-60 -mt-20" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -ml-40 -mb-20" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 text-primary px-0 py-1 text-[10px] font-black tracking-[0.3em] uppercase mb-8"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span>{t('eyebrow')}</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black text-white mb-8 font-serif tracking-tight uppercase leading-[0.85]"
                    >
                        {t('title')}<br />
                        <span className="text-primary italic">{t('titleAccent')}</span>
                    </motion.h1>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex mb-12"
                    >
                        <div className="w-1.5 bg-primary/40 mr-8 shrink-0" />
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                            {t('body')}
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="flex items-center space-x-8"
                    >
                        <div className="flex -space-x-4">
                            {Array.isArray(previewMentors) && previewMentors.map((mentor: any, idx: number) => (
                                <div 
                                    key={mentor.id} 
                                    className="w-14 h-14 rounded-full border-[3px] border-slate-950 bg-slate-800 shadow-2xl shadow-black/50 overflow-hidden flex items-center justify-center relative group"
                                    style={{ zIndex: 10 - idx }}
                                >
                                    {mentor.image_url ? (
                                        <SafeImage
                                            src={resolveImageUrl(mentor.image_url)}
                                            alt={mentor.name}
                                            fill
                                            sizes="56px"
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    ) : (
                                        <div className="text-[10px] font-black uppercase text-slate-600">{mentor.name.charAt(0)}</div>
                                    )}
                                </div>
                            ))}
                            {totalCount > 4 && (
                                <div className="w-14 h-14 rounded-full border-[3px] border-slate-950 bg-primary text-white flex items-center justify-center text-xs font-black shadow-2xl z-0 -ml-4">
                                    +{totalCount - 4}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{t('activeNetwork')}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">{t('joinMentors', { count: totalCount })}</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
