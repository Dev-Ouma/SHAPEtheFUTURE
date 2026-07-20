"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { getApi, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { ExternalLink, Calendar, Briefcase, ChevronLeft, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function PartnerDetailClient({
  initialPartner = null,
  slug: slugProp,
}: {
  initialPartner?: any;
  slug: string;
}) {
  const t = useTranslations("Partnerships");
  const params = useParams();
  const slug = slugProp || (params?.slug as string);
  const [partner, setPartner] = useState<any>(initialPartner);
  const [loading, setLoading] = useState(!initialPartner);

  useEffect(() => {
    if (initialPartner) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getApi(`/partnerships/detail/${slug}`);
        if (!cancelled) setPartner(data);
      } catch (err) {
        console.error("Failed to fetch partner details", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, initialPartner]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!partner) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
      <h2 className="text-4xl font-black text-primary-darker mb-4 uppercase tracking-tighter">{t("partnerNotFound")}</h2>
      <Link href="/partnerships" className="text-primary font-bold uppercase tracking-widest text-[10px] hover:text-secondary transition-colors">
        {t("backToPartnerships")}
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="container mx-auto px-6">
        <Link href="/partnerships" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-12">
          <ChevronLeft size={16} />
          <span>{t("backToDirectory")}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Side */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header Card */}
            <div className="bg-white p-10 md:p-16 border border-slate-100 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               
               <div className="relative z-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                   <div className="h-20 w-auto">
                     <img 
                       src={resolveImageUrl(partner.logo_url) || "https://placehold.co/300x120?text=" + partner.name} 
                       alt={partner.name}
                       className="h-full w-auto object-contain"
                     />
                   </div>
                   <a 
                    href={partner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 bg-primary text-white px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-secondary transition-all transform hover:-translate-y-1 shadow-lg"
                   >
                     <span>{t("visitPartnerWebsite")}</span>
                     <ExternalLink size={14} />
                   </a>
                 </div>

                 <h1 className="text-4xl md:text-6xl font-black text-primary-darker mb-8 uppercase tracking-tighter leading-none">
                   {partner.name}
                 </h1>

                 <div className="flex flex-wrap gap-6 mb-12 border-y border-slate-50 py-6">
                   <div className="flex items-center space-x-3">
                     <Briefcase size={18} className="text-primary" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{partner.partnership_type}</span>
                   </div>
                   {partner.start_date && (
                     <div className="flex items-center space-x-3">
                       <Calendar size={18} className="text-primary" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("partnerSince", { year: new Date(partner.start_date).getFullYear() })}</span>
                     </div>
                   )}
                   <div className="flex items-center space-x-3">
                     <MapPin size={18} className="text-primary" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("globalAffiliate")}</span>
                   </div>
                 </div>

                 <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium">
                   {partner.description ? (
                     <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(partner.description) }} />
                   ) : (
                     <p>{t("fallbackDetailBody")}</p>
                   )}
                 </div>
               </div>
            </div>

            {/* Collaboration Projects */}
            {partner.projects && partner.projects.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black text-primary-darker uppercase tracking-tighter flex items-center space-x-4">
                   <div className="w-8 h-1 bg-secondary" />
                   <span>{t("jointInitiatives")}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {partner.projects.map((project: any) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 border border-slate-100 hover:border-secondary/20 transition-all group"
                    >
                      <h3 className="text-lg font-black text-primary-darker mb-4 group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6">{project.description}</p>
                      {project.project_link && (
                        <a href={project.project_link} className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center space-x-2">
                          <span>{t("viewCaseStudy")}</span>
                          <ArrowRight size={12} />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-primary-darker text-white p-8 border-b-4 border-secondary">
              <h3 className="text-lg font-black uppercase tracking-widest mb-6">{t("partnershipValue")}</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed font-medium">
                {t("partnershipValueBody")}
              </p>
              
              <ul className="space-y-4">
                {[
                  t("valueKnowledge"),
                  t("valueIndustry"),
                  t("valueNetworking"),
                  t("valueResearch"),
                ].map((point, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-2 h-2 bg-secondary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 border border-slate-100">
               <h3 className="text-sm font-black text-primary-darker uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{t("internalLinks")}</h3>
               <div className="flex flex-col space-y-4">
                 {[
                   { label: t("relatedResearch"), href: "/research" },
                   { label: t("alumniStories"), href: "/alumni" },
                   { label: t("globalProgrammes"), href: "/programmes" }
                 ].map((link, idx) => (
                   <Link key={idx} href={link.href} className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest flex items-center justify-between group">
                     <span>{link.label}</span>
                     <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                   </Link>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
