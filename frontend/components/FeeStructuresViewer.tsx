"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

export default function FeeStructuresViewer({ structures }: { structures: any[] }) {
  const [activeTab, setActiveTab] = useState(structures.length > 0 ? structures[0].id : null);

  if (structures.length === 0) {
    return (
      <div className="bg-white border border-slate-200 shadow-xl overflow-hidden p-12 text-center">
        <FileText className="mx-auto text-slate-300 mb-4" size={48} />
        <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Fee Structures Being Updated</h3>
        <p className="text-slate-500 mt-2">Please check back later for detailed fee information.</p>
      </div>
    );
  }

  const activeStructure = structures.find(s => s.id === activeTab);

  return (
    <div className="bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden rounded-xl">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-100 bg-white px-4 pt-4 gap-2">
        {structures.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`px-6 py-4 text-center text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 rounded-t-lg ${
              activeTab === s.id 
                ? "border-secondary text-primary-darker bg-slate-50" 
                : "border-transparent text-slate-400 hover:text-primary-darker hover:bg-slate-50/50"
            }`}
          >
            {s.category}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 md:p-12">
        <div className="mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-2 h-8 bg-secondary"></div>
          <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
            {activeStructure?.category} Fee Structure (2025/2026)
          </h2>
        </div>
        
        {/* Render HTML content (Tables) */}
        <div 
          className="prose prose-slate max-w-none prose-table:w-full prose-table:text-left prose-table:border-collapse prose-th:bg-slate-50 prose-th:text-primary-darker prose-th:p-5 prose-th:text-[11px] prose-th:uppercase prose-th:tracking-widest prose-th:font-black prose-th:border-b-2 prose-th:border-slate-200 prose-td:p-5 prose-td:border-b prose-td:border-slate-100 prose-tr:hover:bg-slate-50/50 prose-td:text-sm prose-td:font-medium prose-td:text-slate-600 transition-all"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeStructure?.content || "<p>No content provided.</p>") }}
        />
      </div>
    </div>
  );
}
