"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { 
  FileText, 
  Search, 
  Download as DownloadIcon, 
  ChevronRight,
  Layers,
  RefreshCw,
  List,
  LayoutGrid,
} from 'lucide-react';
import { getApi, postApi, getApiErrorMessage } from '@/lib/api';
import { sanitizeHtml } from '@/lib/sanitize';
import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Download {
  id: string;
  title: string;
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

interface DownloadsHubLayoutProps {
  page: any;
  breadcrumbs: { title: string; link: string }[];
}

export default function DownloadsHubLayout({ page, breadcrumbs }: DownloadsHubLayoutProps) {
  const t = useTranslations("CmsLayouts");
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pulse, setPulse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [downloadsData, categoriesData, stats] = await Promise.all([
          getApi('/downloads'),
          getApi('/downloads/categories'),
          getApi('/analytics/summary?days=30').catch(() => null)
        ]);

        if (downloadsData == null && categoriesData == null) {
          toast.error(t("toastLoadRegistry"));
          return;
        }
        
        const actualDownloads = Array.isArray(downloadsData) ? downloadsData : (downloadsData?.data || []);
        setDownloads(actualDownloads);
        setCategories(categoriesData || []);
        setPulse(stats);
      } catch (err) {
        console.error("Failed to fetch downloads hub data", err);
        toast.error(getApiErrorMessage(err, t("toastLoadRegistry")));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (id: string, fileUrl?: string, externalUrl?: string) => {
    let finalUrl = externalUrl || fileUrl;
    if (!finalUrl || finalUrl === '#' || finalUrl === '') {
      toast.error(t("toastNoFile"));
      return;
    }

    // Prefer same-origin relative paths when possible (Next rewrites /uploads & /documents).
    if (!finalUrl.startsWith('http')) {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Keep absolute API URL for HEAD probe; open via absolute URL as well.
      finalUrl = `${API_BASE}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }

    try {
      await postApi(`/downloads/${id}/record`, {}).catch(() => null);

      const probe = await fetch(finalUrl, { method: 'HEAD' }).catch(() => null);
      // Some servers disallow HEAD — fall back to GET probe without downloading body fully via range.
      let ok = probe?.ok === true;
      if (!ok && (!probe || probe.status === 405 || probe.status === 501)) {
        const getProbe = await fetch(finalUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
        }).catch(() => null);
        ok = !!getProbe && (getProbe.ok || getProbe.status === 206);
        // If response is Nest JSON 404, treat as missing
        const contentType = getProbe?.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          ok = false;
        }
      } else if (probe) {
        const contentType = probe.headers.get('content-type') || '';
        if (contentType.includes('application/json') && !probe.ok) {
          ok = false;
        }
      }

      if (!ok) {
        toast.error(t("toastFileUnavailable"));
        return;
      }

      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("toastUnableDownload")));
    }
  };
  const filteredItems = downloads.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category.slug === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.summary.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'All' || item.document_type === activeType;
    return matchesCategory && matchesSearch && matchesType;
  });

  const accentText = page.layout_data?.accent_text || t("officialRepository");

  return (
    <PageLayout
      title={page.title}
      summary={page.summary}
      isWide={true}
      breadcrumbs={breadcrumbs}
      bannerImage={page.banner_image}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro Section */}
        <section className="mb-16 border-l-4 border-primary pl-10 py-4 max-w-4xl">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">{accentText}</h3>
           <div 
             className="text-xl text-slate-600 font-medium leading-relaxed italic prose prose-slate"
             dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
           />
        </section>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-40 space-y-12">
               {/* Search */}
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                     type="text" 
                     placeholder={t("searchRegistry")} 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-slate-50 border-none p-6 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none placeholder:uppercase placeholder:text-[10px] rounded-3xl transition-all"
                  />
               </div>

               {/* Category Sidebar */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 font-mono">{t("archiveTaxonomy")}</h4>
                  <button 
                    onClick={() => setActiveCategory("all")}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${
                      activeCategory === "all" ? "bg-primary-darker text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{t("allCategories")}</span>
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
            </div>
          </aside>

          {/* Document Grid */}
          <main className="flex-1 min-w-0">
             <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h2 className="text-4xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize flex items-center gap-4">
                      {t("institutionalRegistry")}
                      <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary hover:bg-[#ff7f50] hover:text-white transition-all/5 px-3 py-1 rounded-full">
                         {t("assetsFound", { count: filteredItems.length })}
                      </span>
                   </h2>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
                      >
                         <List size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}`}
                      >
                         <LayoutGrid size={18} />
                      </button>
                   </div>
                </div>
             </div>

             {loading ? (
               <div className="py-40 flex flex-col items-center justify-center space-y-4 text-slate-300">
                  <RefreshCw className="animate-spin" size={48} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("synchronizingRepo")}</span>
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
                        <div className={`shrink-0 p-5 rounded-2xl transition-all duration-500 ${
                           item.document_type === 'PDF' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                           <FileText size={viewMode === 'grid' ? 32 : 24} />
                        </div>

                        <div className="flex-1 min-w-0 text-center md:text-left">
                           <h3 className={`font-black text-primary-darker group-hover:text-primary transition-colors font-serif lowercase tracking-tighter capitalize leading-tight mb-2 ${
                             viewMode === 'grid' ? 'text-2xl line-clamp-2' : 'text-xl'
                           }`}>
                              {item.title}
                           </h3>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed opacity-70 line-clamp-2">
                              {item.summary}
                           </p>
                        </div>

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
                             className="flex items-center gap-3 bg-primary text-white font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all duration-500 shadow-xl shadow-slate-900/10 hover:shadow-primary/20 scale-100 active:scale-95 px-8 py-4 rounded-full text-xs"
                           >
                              <DownloadIcon size={16} />
                              <span className={viewMode === 'list' ? 'hidden sm:inline' : 'inline'}>{t("download")}</span>
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </div>
             )}
          </main>
        </div>
      </div>
    </PageLayout>
  );
}
