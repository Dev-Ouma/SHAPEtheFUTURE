'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Tooltip from '@/components/ui/Tooltip';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Download as DownloadIcon, 
  File as FileIcon, 
  BookOpen, 
  ClipboardList, 
  Scale, 
  FileBarChart, 
  Handshake, 
  Info,
  ChevronRight,
  Layers,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  List,
  LayoutGrid
} from 'lucide-react';
import { getApi } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Download {
  id: string;
  title: string;
  slug: string;
  summary: string;
  document_type: string;
  file_size: number;
  version: string;
  file_url?: string;
  external_url?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

const MOCK_DATA: Download[] = [
  {
    id: '1',
    title: 'University Charter',
    slug: 'university-charter',
    summary: 'The legal instrument establishing the Open University of Kenya as a national specialised university.',
    document_type: 'PDF',
    file_size: 2516582,
    version: 'v1.0',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    external_url: '',
    category: { id: 'c1', name: 'Institutional Documents', slug: 'institutional-documents' }
  },
  {
    id: '2',
    title: 'Strategic Plan (2023–2028)',
    slug: 'strategic-plan',
    summary: 'Roadmap for excellence: Transforming higher education through digital innovation and inclusion.',
    document_type: 'PDF',
    file_size: 3250585,
    version: 'v2.1',
    file_url: 'https://www.africau.edu/images/default/sample.pdf',
    external_url: '',
    category: { id: 'c1', name: 'Institutional Documents', slug: 'institutional-documents' }
  },
  {
    id: '3',
    title: 'Academic Calendar 2025',
    slug: 'academic-calendar-2025',
    summary: 'Official semester dates, registration deadlines, and examination schedules for the current academic year.',
    document_type: 'PDF',
    file_size: 1258291,
    version: 'v1.1',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    external_url: '',
    category: { id: 'c2', name: 'Academic Documents', slug: 'academic-documents' }
  }
];

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [pulse, setPulse] = useState<any>(null);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const stats = await getApi('/analytics/summary?days=30');
        setPulse(stats);
      } catch {
        console.log("Strategic telemetry offline");
      }
    };
    fetchPulse();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [downloadsData, categoriesData] = await Promise.all([
          getApi('/downloads'),
          getApi('/downloads/categories')
        ]);
        
        // Handle paginated response { data: [], total: ... }
        const actualDownloads = Array.isArray(downloadsData) ? downloadsData : (downloadsData?.data || []);
        
        setDownloads(actualDownloads.length > 0 ? actualDownloads : MOCK_DATA);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("API disconnected, falling back to mock data");
        setDownloads(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async (id: string, fileUrl?: string, externalUrl?: string) => {
    // Priority: External URL -> Internal File URL
    let finalUrl = externalUrl || fileUrl;
    
    if (!finalUrl || finalUrl === '#' || finalUrl === '') {
       console.warn("Attempted to download a resource with no valid URL");
       return;
    }

    // Resolve local paths if not absolute
    if (!finalUrl.startsWith('http')) {
      // Use standard fallback string logic ensuring consistent resolution
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      finalUrl = `${API_BASE}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }

    try {
      await getApi(`/downloads/${id}/record`);
      window.open(finalUrl, '_blank');
    } catch (err) {
      window.open(finalUrl, '_blank');
    }
  };

  const filteredItems = downloads.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category.slug === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.summary.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'All' || item.document_type === activeType;
    return matchesCategory && matchesSearch && matchesType;
  });

  return (
    <PageLayout
      title="Institutional Resource & Downloads Hub"
      summary="Explore OUK's official document repository, academic frameworks, and administrative resources."
      isWide={true}
      breadcrumbs={[
        { title: 'About OUK', link: '/about' },
        { title: 'Downloads', link: '/about/downloads' },
      ]}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro Section */}
        <section className="mb-16 border-l-4 border-primary pl-10 py-4 max-w-4xl">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Official Repository</h3>
           <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
              "Welcome to the specialised downloads section. This centralized gateway provides access to key institutional instruments, academic frameworks, and administrative resources designed to support excellence and transparency."
           </p>
        </section>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-40 space-y-12">
               {/* Search */}
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                     type="text" 
                     placeholder="Search Registry..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-slate-50 border-none p-6 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none placeholder:uppercase placeholder:text-[10px] rounded-3xl transition-all"
                  />
               </div>

               {/* Category Sidebar */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-mono">Archive Taxonomy</h4>
                  <button 
                    onClick={() => setActiveCategory("all")}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${
                      activeCategory === "all" ? "bg-primary-darker text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">All Categories</span>
                    <Layers size={16} />
                  </button>
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${
                        activeCategory === cat.slug ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
               </div>
               {/* Strategic Resource Pulse (Entry Points) */}
               <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-[#ff7f50] hover:text-white transition-colors" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8 font-mono">Strategic Resource Pulse</h4>
                  <div className="space-y-6">
                    {[
                      { path: '/about/profile', label: 'University Profile' },
                      { path: '/about/downloads', label: 'Resource Hub' },
                      { path: '/programmes', label: 'Academic Catalogue' },
                    ].map((entry, i) => {
                      const count = parseInt(pulse?.topPages?.find((p: any) => p.path === entry.path)?.count || "0");
                      const maxCount = Math.max(...(pulse?.topPages?.map((p: any) => parseInt(p.count)) || [100]), 1);
                      const percentage = Math.min(Math.max((count / maxCount) * 100, 5), 100);

                      return (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker truncate max-w-[150px]">{entry.label}</span>
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{count} Hits</span>
                           </div>
                           <div className="h-1 bg-slate-50 relative overflow-hidden rounded-full">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                className="h-full bg-primary shadow-[0_0_8px_rgba(0,128,128,0.3)]" 
                              />
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          </aside>

          {/* Document Grid */}
          <main className="flex-1 min-w-0">
             <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-4xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize flex items-center gap-4">
                      Institutional Registry
                      {filteredItems.length > 0 && (
                        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary hover:bg-[#ff7f50] hover:text-white transition-all/5 px-3 py-1 rounded-full">
                           {filteredItems.length} Assets Found
                        </span>
                      )}
                   </h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      {['All', 'PDF', 'XLSX'].map((type) => (
                         <button 
                           key={type}
                           onClick={() => setActiveType(type)}
                           className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${activeType === type ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-white'}`}
                         >
                            {type}
                         </button>
                      ))}
                   </div>
                   <div className="h-6 w-px bg-slate-200 mx-2 hidden lg:block" />
                   <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
                        title="List View"
                      >
                         <List size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
                        title="Grid View"
                      >
                         <LayoutGrid size={18} />
                      </button>
                   </div>
                </div>
             </div>

             {loading ? (
               <div className="py-40 flex flex-col items-center justify-center space-y-4 text-slate-300">
                  <RefreshCw className="animate-spin" size={48} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Synchronising Repository...</span>
               </div>
             ) : (
               <div className={`animate-in fade-in slide-in-from-bottom-6 duration-700 ${
                 viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-4'
               }`}>
                  {filteredItems.map((item, i) => (
                     <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group relative bg-white border border-slate-100 transition-all duration-500 hover:border-[#ff7f50]/30 hover:shadow-2xl hover:shadow-primary/5 ${
                          viewMode === 'grid' ? 'rounded-[2.5rem] p-10 flex flex-col h-full' : 'rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8'
                        }`}
                     >
                        {/* Asset Icon */}
                        <div className={`shrink-0 p-5 rounded-2xl transition-all duration-500 ${
                           item.document_type === 'PDF' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                           <FileText size={viewMode === 'grid' ? 32 : 24} />
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                           <h3 className={`font-black text-primary-darker group-hover:text-primary transition-colors font-serif lowercase tracking-tighter capitalize leading-tight mb-2 ${
                             viewMode === 'grid' ? 'text-2xl line-clamp-2' : 'text-xl'
                           }`}>
                              {item.title}
                           </h3>
                           <p className={`text-sm text-slate-500 font-medium leading-relaxed opacity-70 ${
                             viewMode === 'grid' ? 'line-clamp-3 mb-8' : 'line-clamp-1 mb-0'
                           }`}>
                              {item.summary}
                           </p>
                        </div>

                        {/* Metadata Bundle */}
                        <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'mb-8 justify-between mt-auto pt-6 border-t border-slate-50' : 'shrink-0'}`}>
                           <div className="flex flex-col items-center md:items-end gap-1">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100">
                                 {item.version}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 italic">
                                 {(item.file_size / 1024 / 1024).toFixed(2)} MB
                              </span>
                           </div>
                           <button 
                             onClick={() => handleDownload(item.id, item.file_url, item.external_url)}
                             className={`flex items-center gap-3 bg-primary text-white font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all duration-500 shadow-xl shadow-slate-900/10 hover:shadow-primary/20 scale-100 active:scale-95 px-8 py-4 rounded-full text-xs ${
                               viewMode === 'grid' ? 'w-full md:w-fit justify-center' : ''
                             }`}
                           >
                              <DownloadIcon size={16} />
                              <span className={viewMode === 'list' ? 'hidden sm:inline' : 'inline'}>Download</span>
                           </button>
                        </div>
                     </motion.div>
                  ))}

                  {filteredItems.length === 0 && (
                     <div className="col-span-full py-40 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                           <div className="p-10 bg-slate-50 rounded-full w-fit mx-auto">
                              <Search size={64} className="text-slate-200" />
                           </div>
                           <h5 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">Repository Empty</h5>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed">No matching institutional resources found in the current registry segment.</p>
                           <button onClick={() => {setSearch(""); setActiveCategory("all");}} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Reset Registry Filters</button>
                        </div>
                     </div>
                  )}
               </div>
             )}

            {/* Footer Compliance */}
            <div className="mt-16 p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                  <ShieldCheck className="text-emerald-500" size={32} />
                  <div>
                     <p className="text-xs font-black uppercase text-primary-darker mb-1">Official Resource Compliance</p>
                     <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">
                        All documents provided are current and compliant with the <br/> OUK Data Retention and Open Disclosure Policy.
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="h-10 w-px bg-slate-200 hidden md:block" />
                  <Link href="/compliance" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline border-b-2 border-primary/20 pb-1">
                     View Repository Terms
                  </Link>
               </div>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
