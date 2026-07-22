"use client";

import React from "react";
import { motion } from "framer-motion";
import { resolveImageUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import { Link } from "@/i18n/routing";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import Highlight from "@/components/Highlight";

interface PartnershipCardProps {
  partner: any;
  highlightQuery?: string;
}

export default function PartnershipCard({ partner, highlightQuery }: PartnershipCardProps) {
  const t = useTranslations("Partnerships");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-100 group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      <div className="p-8 flex-1">
        <div className="h-16 mb-8 flex items-center justify-between">
          <div className="relative h-full w-40">
            <SafeImage
              src={resolveImageUrl(partner.logo_url) || "https://placehold.co/200x80?text=" + partner.name}
              alt={partner.name}
              fill
              sizes="160px"
              className="object-contain object-left grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-500 uppercase tracking-widest rounded-full">
            {partner.partnership_type}
          </span>
        </div>

        <h3 className="text-xl font-black text-primary-darker mb-4 group-hover:text-primary transition-colors">
          <Highlight text={partner.name || ""} query={highlightQuery || ""} quiet />
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {partner.description || t("fallbackDescription")}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {partner.category && (
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1">
              {partner.category.name}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
        <Link href={`/partnerships/${partner.slug}`} className="text-[12px] font-black uppercase tracking-widest text-primary hover:text-secondary flex items-center space-x-2 transition-colors">
          <span>{t("collaborationDetails")}</span>
          <ArrowRight size={14} />
        </Link>
        
        <a 
          href={partner.website_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-slate-300 hover:text-primary transition-colors"
          title={t("visitWebsite")}
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
}
