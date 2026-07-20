"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Quote, Sparkles, ExternalLink } from "lucide-react";
import { getNews, resolveImageUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale, useTranslations } from "next-intl";

type ResearchSectionProps = { initialResearch?: any[] };

const ResearchSection = ({ initialResearch }: ResearchSectionProps = {}) => {
  const t = useTranslations("Home");
  const locale = useLocale();
  const hasServerData = Array.isArray(initialResearch);
  const [research, setResearch] = useState<any[]>(
    Array.isArray(initialResearch) ? initialResearch : [],
  );
  const [loading, setLoading] = useState(!hasServerData);

  useEffect(() => {
    if (hasServerData) {
      setResearch(Array.isArray(initialResearch) ? initialResearch : []);
      setLoading(false);
      return;
    }
    const fetchResearch = async () => {
      try {
        const response = await getNews({ type: "Research", limit: 4, locale });
        const articles =
          response?.items ||
          response?.data ||
          (Array.isArray(response) ? response : []);
        if (articles && articles.length > 0) {
          setResearch(articles);
        }
      } catch (error) {
        console.error("Error fetching research:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResearch();
  }, [locale, hasServerData, initialResearch]);

  if (loading) return null;
  if (research.length === 0) return null;

  return (
    <section className="bg-primary-darker py-20 relative overflow-hidden" id="research-discovery">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/3" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left items-center lg:items-start flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-3 px-4 py-2 bg-primary/20 border border-primary/30 rounded-none text-primary"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t("researchEyebrow")}</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter"
            >
              {t("researchTitle")} <span className="text-secondary font-serif italic">{t("researchTitleAccent")}</span> <br />
              <span className="text-white">{t("researchTitleEnd")}</span>
            </motion.h2>

            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="text-slate-400 text-sm md:text-base leading-relaxed font-medium max-w-md mx-auto lg:mx-0"
            >
              {t("researchBody")}
            </motion.p>

            <div className="pt-8 flex flex-col space-y-6 w-full max-w-sm mx-auto lg:mx-0">
               <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 space-y-4 md:space-y-0 group cursor-default">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all shrink-0">
                     <BookOpen size={20} />
                  </div>
                  <div className="text-center md:text-left">
                     <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{t("researchOpenAccess")}</h4>
                     <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{t("researchOpenAccessDesc")}</p>
                  </div>
               </div>
               <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 space-y-4 md:space-y-0 group cursor-default">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all shrink-0">
                     <Quote size={20} />
                  </div>
                  <div className="text-center md:text-left">
                     <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{t("researchPublications")}</h4>
                     <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{t("researchPublicationsDesc")}</p>
                  </div>
               </div>
            </div>

            <div className="pt-10 flex justify-center lg:justify-start w-full">
               <Link href="/research/publications" className="group flex items-center space-x-4 text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                  <span className="border-b-2 border-primary pb-1 group-hover:border-white transition-colors">{t("researchPortal")}</span>
                  <ArrowUpRight size={18} />
               </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {research.map((item, index) => (
                   <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white/[0.03] border border-white/5 p-8 h-[280px] flex flex-col justify-between hover:bg-white/[0.05] transition-all duration-500"
                   >
                      <div className="flex justify-between items-start">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.category}</span>
                         <ExternalLink size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                      </div>
                      
                      <div>
                         <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter group-hover:text-primary transition-colors mb-4 line-clamp-3">
                            {item.title}
                         </h3>
                         <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{new Date(item.created_at).getFullYear()}</span>
                            <span>•</span>
                            <span>{t("researchPublication")}</span>
                         </div>
                      </div>

                      {item.image_url && (
                         <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-32 transition-all duration-700 overflow-hidden opacity-0 group-hover:opacity-100">
                            <SafeImage src={resolveImageUrl(item.image_url)} className="object-cover grayscale opacity-20" alt="" fill sizes="400px" />
                         </div>
                      )}
                      
                      <Link href={`/news/${item.slug}`} className="absolute inset-0 z-20" />
                   </motion.div>
                ))}

                {research.length < 4 && (
                   <div className="hidden md:flex bg-white/[0.01] border border-dashed border-white/10 p-8 h-[280px] items-center justify-center text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ">{t("researchInProgress")}</p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ResearchSection;
