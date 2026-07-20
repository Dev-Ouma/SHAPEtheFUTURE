import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    total: number;
    limit: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    total,
    limit
}) => {
    if (total === 0) return null;

    const startIdx = (currentPage - 1) * limit + 1;
    const endIdx = Math.min(currentPage * limit, total);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 px-6 py-8 bg-white border border-slate-50 mt-6 rounded-xl">
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Showing <span className="text-primary-darker">{startIdx}</span> to <span className="text-primary-darker">{endIdx}</span> of <span className="text-primary-darker">{total}</span>
                </p>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 border border-slate-50 rounded-lg text-slate-300 hover:text-white hover:border-slate-200 transition-all disabled:opacity-20"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center px-2 space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                                        currentPage === pageNum
                                            ? 'bg-primary-darker text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                        ) {
                            return <span key={pageNum} className="text-slate-200 px-1">...</span>;
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-3 border border-slate-50 rounded-lg text-slate-300 hover:text-white hover:border-slate-200 transition-all disabled:opacity-20"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            )}
        </div>
    );
};
