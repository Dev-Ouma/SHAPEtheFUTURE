"use client";

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServerPaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange?: (page: number) => void;
}

/**
 * Shared pagination for public research lists and admin tables.
 * Uses next/navigation (not next-intl) so admin routes outside [locale]
 * do not crash with "No intl context found".
 */
export const ServerPagination: React.FC<ServerPaginationProps> = ({
    currentPage,
    totalPages,
    total,
    limit,
    onPageChange
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (total === 0) return null;

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        return params.toString();
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        if (onPageChange) {
            onPageChange(page);
        } else {
            router.push(`${pathname}?${createQueryString('page', page.toString())}`);
        }
    };

    const startIdx = (currentPage - 1) * limit + 1;
    const endIdx = Math.min(currentPage * limit, total);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 px-10 py-12 bg-slate-50 border border-slate-100 mt-16 group">
            <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Metrics Awareness</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Displaying <span className="text-primary-darker border-b-2 border-primary/30">{startIdx} - {endIdx}</span> of <span className="text-primary-darker">{total}</span> institutional records
                </p>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-12 h-12 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-white shadow-sm"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center space-x-2">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Logic to show 1, ..., current-1, current, current+1, ..., last
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-12 h-12 flex items-center justify-center text-[11px] font-black transition-all border ${
                                            currentPage === pageNum
                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="text-slate-300 font-bold px-1">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 flex items-center justify-center border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-white shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};
