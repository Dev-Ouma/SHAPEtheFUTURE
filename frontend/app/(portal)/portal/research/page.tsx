"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  Filter,
  Layers,
  GraduationCap
} from "lucide-react";

export default function ResearchPortalPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock data for Phase 3 initialization
    const mockPubs = [
      { 
        id: "1", 
        title: "Adaptive Learning Algorithms for Open Distance Learning in Sub-Saharan Africa", 
        authors: "M. Warabu, J. Doe", 
        type: "Journal Article", 
        date: "2024-03-12",
        abstract: "This paper explores the integration of AI-driven personalised learning paths within the ODL framework to improve student retention rates in Kenya.",
        publisher: "African Journal of Digital Education"
      },
      { 
        id: "2", 
        title: "Blockchain for Transparancy in University Fee Management Systems", 
        authors: "S. Smith, O. Ken", 
        type: "Conference Paper", 
        date: "2023-11-05",
        abstract: "A study on decentralizing payment records for public universities to reduce administrative friction and improve trust.",
        publisher: "IEEE ICT Africa 2023"
      },
      { 
        id: "3", 
        title: "The Role of AI Chatbots in Student Onboarding: A Case Study of OUK", 
        authors: "H. Omondi", 
        type: "Thesis", 
        date: "2024-01-20",
        abstract: "Analysing the impact of prompt-engineered virtual assistants on first-year student satisfaction scores.",
        publisher: "OUK Press"
      }
    ];
    setPublications(mockPubs);
    setLoading(false);
  }, []);

  const filtered = publications.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.authors.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Search Header */}
      <section className="bg-white border border-slate-200 p-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-primary-darker font-serif ">Scholarly Repository</h2>
              <p className="text-slate-500 font-medium">Access OUK's global database of research papers and academic journals.</p>
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Publications: {publications.length}</span>
           </div>
        </div>

        <div className="relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
           <input 
              type="text" 
              placeholder="Search by title, author, or keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-none p-8 pl-18 text-xl font-bold text-primary-darker focus:ring-4 focus:ring-primary shadow-inner outline-none transition-all"
           />
        </div>

        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
           {['All Categories', 'Journals', 'Conference Papers', 'Thesis', 'Tech Reports'].map((cat, i) => (
             <button key={i} className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors'}`}>
                {cat}
             </button>
           ))}
        </div>
      </section>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 gap-8">
         {filtered.length > 0 ? (
           filtered.map((pub) => (
              <div key={pub.id} className="bg-white border border-slate-200 group hover:border-[#ff7f50] transition-all p-10 flex flex-col md:flex-row gap-10">
                 <div className="w-16 h-20 bg-primary-darker shrink-0 flex flex-col items-center justify-center text-white relative">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-primary rotate-45 -mr-2 -mt-2" />
                    <FileText size={28} />
                 </div>

                 <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                       <span className="bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest px-3 py-1">
                          {pub.type}
                       </span>
                       <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">• {pub.date}</span>
                    </div>

                    <h3 className="text-2xl font-black text-primary-darker leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors cursor-pointer">
                       {pub.title}
                    </h3>

                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                       <GraduationCap size={14} className="mr-2 text-primary" />
                       {pub.authors}
                    </p>

                    <p className="text-slate-500 text-sm font-medium line-clamp-2 ">
                       "{pub.abstract}"
                    </p>
                 </div>

                 <div className="md:border-l border-slate-100 md:pl-10 shrink-0 flex flex-col justify-between items-end gap-6">
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Publisher</p>
                       <p className="text-xs font-bold text-primary-darker">{pub.publisher}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                       <button className="p-4 bg-slate-50 text-slate-400 hover:text-primary transition-colors border border-slate-100" title="Download Full Text">
                          <Download size={20} />
                       </button>
                       <button className="p-4 bg-primary text-white hover:bg-[#ff7f50] hover:text-white transition-colors shadow-lg" title="View DOI">
                          <ExternalLink size={20} />
                       </button>
                    </div>
                 </div>
              </div>
           ))
         ) : (
           <div className="py-32 text-center border-4 border-dashed border-slate-100">
              <p className="text-slate-400 uppercase font-black tracking-[0.2em] ">No publications match your search criteria</p>
           </div>
         )}
      </div>

      {/* Suggestion Sidebar Placeholder could go here */}
    </div>
  );
}
