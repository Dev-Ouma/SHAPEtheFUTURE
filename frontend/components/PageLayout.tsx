"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ChevronRight, Home, Share2, Printer } from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";

interface PageLayoutProps {
  title: string;
  summary?: string;
  bannerImage?: string;
  breadcrumbs?: { title: string; link: string }[];
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  isWide?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  summary,
  bannerImage,
  breadcrumbs,
  children,
  sidebar,
  isWide = false
}) => {
  const t = useTranslations("CmsChrome");
  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <div className="relative min-h-[500px] bg-primary-darker overflow-hidden flex items-center pt-48 lg:pt-56 pb-24">
         {bannerImage ? (
           <SafeImage 
             src={resolveImageUrl(bannerImage)} 
             alt={title} 
             fill
             priority
             sizes="100vw"
             className="object-cover opacity-30 grayscale"
           />
         ) : (
           <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
             <div className="absolute bottom-1/2 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] -ml-32" />
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
         
         <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
               {/* Breadcrumbs inside Hero */}
               <nav className="flex items-center space-x-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-12">
                  <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1">
                     <Home size={12} />
                     <span>{t("home")}</span>
                  </Link>
                  {breadcrumbs?.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                       <ChevronRight size={10} className="text-slate-600" />
                       <Link href={crumb.link} className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? "text-white" : ""}`}>
                          {crumb.title}
                       </Link>
                    </React.Fragment>
                  ))}
               </nav>

               <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter font-serif leading-[1.05] mb-10 drop-shadow-2xl max-w-4xl break-words">
                  {title}
               </h1>
               {summary && (
                 <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl border-l-4 border-primary pl-10">
                    {summary}
                 </p>
               )}
            </motion.div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Column */}
            {sidebar && (
              <aside className="lg:col-span-4 order-2 lg:order-1">
                 <div className="sticky top-32 space-y-12">
                    {sidebar}
                    
                    {/* Utlities */}
                    <div className="bg-slate-50 p-8 border border-slate-100 space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">{t("tools")}</h4>
                       <button className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-colors w-full border-b border-slate-200 pb-4">
                          <Share2 size={16} />
                          <span>{t("sharePage")}</span>
                       </button>
                       <button onClick={() => window.print()} className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-primary transition-colors w-full">
                          <Printer size={16} />
                          <span>{t("printDocument")}</span>
                       </button>
                    </div>
                 </div>
              </aside>
            )}

            {/* Content Column */}
            <main className={`${sidebar ? "lg:col-span-8" : `lg:col-span-12 ${isWide ? "max-w-7xl" : "max-w-4xl"} mx-auto`} order-1 lg:order-2 w-full`}>
               <article className="prose prose-slate prose-xl max-w-none 
                  prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-serif
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                  prose-a:text-primary prose-a:no-underline hover:prose-a:border-b-2 prose-a:border-primary
                  prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 prose-blockquote:p-10 prose-blockquote:font-black prose-blockquote:uppercase prose-blockquote:tracking-widest prose-blockquote:text-sm prose-blockquote:text-slate-500
               ">
                  {children}
               </article>
            </main>

         </div>
      </div>
    </div>
  );
};

export default PageLayout;
