"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Search, GraduationCap, Phone, Mail, Building2, User as UserIcon, LayoutGrid, List } from 'lucide-react';
import { resolveImageUrl, getSchools } from '@/lib/api';
import SafeImage from '@/components/ui/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

interface PeerLearner {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    image_url?: string;
    school?: { name: string };
}

interface PeerLearnersProps {
    initialLearners: PeerLearner[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export default function PeerLearnersClient({ 
    initialLearners, 
    totalCount, 
    totalPages, 
    currentPage 
}: PeerLearnersProps) {
    const t = useTranslations('PeerLearners');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const activeSearch = searchParams.get('search') || "";
    const activeSchoolId = searchParams.get('schoolId') || "all";

    const [searchTerm, setSearchTerm] = useState(activeSearch);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [dynamicSchools, setDynamicSchools] = useState<any[]>([]);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        getSchools(locale).then(data => {
            if (Array.isArray(data)) {
                setDynamicSchools(data);
            }
        });
    }, [locale]);

    // Sync local searchTerm if URL changes externally
    useEffect(() => {
        setSearchTerm(activeSearch);
    }, [activeSearch]);

    const updateFilters = (updates: Record<string, string | undefined>) => {
        setIsPending(true);
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === 'all') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset to page 1 on search or filter change unless explicitly setting page
        if (!updates.page) {
            params.delete('page');
        }

        router.push(`?${params.toString()}`, { scroll: false });
        
        // Brief timeout to hide pending state after navigation
        setTimeout(() => setIsPending(false), 500);
    };

    // Debounce search
    useEffect(() => {
        if (searchTerm === activeSearch) return;
        
        const timer = setTimeout(() => {
            updateFilters({ search: searchTerm });
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handlePageChange = (newPage: number) => {
        updateFilters({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section className="py-24 container mx-auto px-6">
            {/* Value Proposition - Premium Aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                {[
                    { 
                        title: t("valueGuidance"), 
                        desc: t("valueGuidanceDesc"),
                        icon: <GraduationCap size={24} className="text-primary" />
                    },
                    { 
                        title: t("valueResources"), 
                        desc: t("valueResourcesDesc"),
                        icon: <LayoutGrid size={24} className="text-slate-400" />
                    },
                    { 
                        title: t("valueGrowth"), 
                        desc: t("valueGrowthDesc"),
                        icon: <UserIcon size={24} className="text-slate-400" />
                    }
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-white border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                        <div className="w-14 h-14 bg-slate-50 group-hover:bg-[#ff7f50] flex items-center justify-center mb-8 transition-colors">
                            <div className="group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-primary-darker mb-4">{item.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Advanced Filter Sidebar */}
                <aside className="w-full lg:w-80 shrink-0">
                    <div className="sticky top-[100px] space-y-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-darker mb-6 flex items-center">
                                <Search size={14} className="mr-3 text-primary" />
                                {t("findMentors")}
                            </h3>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={t("searchPlaceholder")}
                                    className="w-full bg-slate-50 border-none py-5 px-6 text-sm font-bold focus:bg-white focus:ring-1 focus:ring-primary/10 outline-none transition-all shadow-inner"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isPending && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-darker mb-6 flex items-center">
                                <Building2 size={14} className="mr-3 text-primary" />
                                {t("universitiesSchools")}
                            </h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => updateFilters({ schoolId: 'all' })}
                                    className={`w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all border-2 ${activeSchoolId === "all" ? "bg-primary-darker border-slate-950 text-white shadow-lg" : "bg-white border-transparent text-slate-400 hover:bg-slate-50"}`}
                                >
                                    {t("allSchools")}
                                </button>
                                {Array.isArray(dynamicSchools) && dynamicSchools.map((school: any) => (
                                    <button
                                        key={school.id}
                                        onClick={() => updateFilters({ schoolId: school.id })}
                                        className={`w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all border-2 ${activeSchoolId === school.id ? "bg-primary-darker border-slate-950 text-white shadow-lg" : "bg-white border-transparent text-slate-400 hover:bg-slate-50 group hover:bg-[#ff7f50]"}`}
                                    >
                                        <span className={activeSchoolId === school.id ? "" : "group-hover:text-white"}>{school.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 p-8 bg-primary/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">{t("instantSupport")}</h4>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-6">{t("instantSupportBody")}</p>
                            <div className="w-12 h-1 bg-primary/20" />
                        </div>
                    </div>
                </aside>

                {/* Main Results Area */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-primary-darker uppercase tracking-tight">{t("registryTitle")}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {isPending ? t("queryingDb") : t("showingExperts", { count: totalCount })}
                            </p>
                        </div>

                        <div className="flex bg-slate-100/50 p-1.5 border border-slate-100 shadow-inner">
                            {[
                                { id: "grid", icon: <LayoutGrid size={18} /> },
                                { id: "list", icon: <List size={18} /> }
                            ].map(btn => (
                                 <button
                                    key={btn.id}
                                    onClick={() => setViewMode(btn.id as any)}
                                    className={`p-3.5 transition-all outline-none ${viewMode === btn.id ? "bg-white text-primary-darker shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {btn.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={`transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"} ${viewMode === "grid"
                            ? "grid grid-cols-1 xl:grid-cols-2 gap-8"
                            : "flex flex-col gap-6"
                        }`}
                    >
                        {initialLearners.length === 0 && !isPending ? (
                            <div className="py-40 text-center bg-slate-50/50 border-2 border-dashed border-slate-100">
                                <div className="w-20 h-20 bg-white flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <GraduationCap size={40} className="text-slate-100" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px]">
                                    {activeSearch ? t("noMatches", { query: activeSearch }) : t("registryExpanding")}
                                </p>
                            </div>
                        ) : (
                            Array.isArray(initialLearners) && initialLearners.map((learner: any) => (
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    key={learner.id}
                                    className={`group bg-white transition-all border border-slate-100 shadow-sm ${viewMode === "grid"
                                        ? "p-8 hover:border-[#ff7f50]/10 hover:shadow-2xl hover:shadow-primary/5"
                                        : "flex items-center p-6 hover:border-[#ff7f50]/10 hover:shadow-xl hover:shadow-primary/5"
                                        }`}
                                >
                                    <div className={`relative ${viewMode === "grid"
                                        ? "w-24 h-24 md:w-28 md:h-28 bg-slate-50 mb-8 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 group-hover:scale-105 transition-transform duration-500"
                                        : "w-16 h-16 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 mr-8"
                                    }`}>
                                        {learner.image_url ? (
                                            <SafeImage
                                                src={resolveImageUrl(learner.image_url)}
                                                alt={learner.name}
                                                fill
                                                sizes="112px"
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <UserIcon size={viewMode === "grid" ? 32 : 24} className="text-slate-200" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-black text-primary-darker mb-2 truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {learner.name}
                                        </h3>
                                        {learner.school && (
                                            <div className="flex items-center font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4">
                                                <Building2 size={12} className="mr-3 text-primary/40" />
                                                <span className="truncate">{learner.school.name}</span>
                                            </div>
                                        )}
                                        
                                        <div className={`flex flex-col gap-3 ${viewMode === "grid" ? "mt-8 pt-6 border-t border-slate-50" : "hidden md:flex md:flex-row md:items-center md:ml-auto"}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-3">
                                                    {learner.email && (
                                                        <div className="flex items-center space-x-3 text-slate-400 hover:text-slate-600 transition-colors">
                                                            <Mail size={14} className="opacity-40" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] truncate max-w-[120px]">{learner.email}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                 {learner.phone && (
                                                    <a 
                                                        href={`tel:${learner.phone}`}
                                                        className="flex items-center justify-center w-12 h-12 bg-slate-50 group-hover:bg-[#ff7f50] hover:text-white text-slate-400 group-hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20"
                                                        title={t("callMentor")}
                                                    >
                                                        <Phone size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {viewMode === "list" && (
                                        <div className="ml-auto flex items-center gap-4">
                                            {learner.phone && (
                                                <a 
                                                    href={`tel:${learner.phone}`}
                                                    className="flex items-center justify-center px-6 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all"
                                                >
                                                    <Phone size={14} className="mr-3" />
                                                    {t("callMentor")}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </motion.div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-4 bg-white border border-slate-100 p-6 shadow-sm">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-6 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                            >
                                {t("previous")}
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {t("pageOf", { current: currentPage, total: totalPages })}
                            </span>
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-6 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-all"
                            >
                                {t("next")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
