"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Quote, 
  Award, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github, 
  GraduationCap, 
  BookOpen,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { PROFILE_IMAGE_PLACEHOLDER_CSS } from "@/lib/profile-image-placeholder";
import SafeImage from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";

interface LeadershipLayoutProps {
  page: {
    title: string;
    content: string;
    summary?: string;
    banner_image?: string;
    leadership_name?: string;
    leadership_position?: string;
    honorific_title?: string;
    bio?: string;
    message?: string;
    academic_qualifications?: string;
    specializations?: string;
    publications?: string;
    is_current?: boolean;
    service_start_date?: string;
    service_end_date?: string;
    email?: string;
    phone_number?: string;
    website_url?: string;
    linkedin_url?: string;
    github_url?: string;
    google_scholar_url?: string;
    researchgate_url?: string;
    twitter_url?: string;
    layout_data?: any;
  };
}

export default function LeadershipLayout({ page }: LeadershipLayoutProps) {
  const t = useTranslations("CmsLayouts");

  // Extract extended data from layout_data with fallbacks to top-level for legacy support
  const data = page.layout_data || {};
  
  const honorific = data.honorific_title || page.honorific_title || "";
  const name = page.leadership_name || "";
  const position = page.leadership_position || "";
  const summary = page.summary || "";
  const message = data.message || page.message || "";
  const bio = page.content || ""; // Primary narrative is in content
  
  const email = data.email || page.email || "";
  const phone = data.phone_number || page.phone_number || "";
  const website = data.website_url || page.website_url || "";
  
  const linkedin = data.linkedin_url || page.linkedin_url || "";
  const github = data.github_url || page.github_url || "";
  const twitter = data.twitter_url || page.twitter_url || "";
  const scholar = data.google_scholar_url || page.google_scholar_url || "";
  const researchgate = data.researchgate_url || page.researchgate_url || "";
  
  const specializations = data.specializations || page.specializations || "";
  const publications = data.publications || page.publications || "";

  // Parsing dates if they exist
  const startDate = data.service_start_date || page.service_start_date;
  const endDate = data.service_end_date || page.service_end_date;
  
  const tenure = startDate 
    ? `${new Date(startDate).getFullYear()} — ${endDate ? new Date(endDate).getFullYear() : t("present")}`
    : t("activeTenure");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden bg-primary-darker">
        <div className="absolute inset-0 z-0">
          {page.banner_image ? (
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <SafeImage
                src={resolveImageUrl(page.banner_image)}
                alt={name || t("leaderAlt")}
                fill
                priority
                sizes="100vw"
                className="object-cover object-top filter grayscale"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-800 opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="container relative z-10 px-6 lg:px-12 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center lg:items-start"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 rounded-full border border-primary/20">
               {t("leadershipBadge")}
            </span>
            <h1 className="text-4xl lg:text-7xl font-black text-white font-serif mb-4 leading-tight uppercase tracking-tighter">
              {honorific} <br/> {name}
            </h1>
            <p className="text-base lg:text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              {summary}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Ribbon */}
      <div className="bg-slate-50 border-y border-slate-100 py-6">
         <div className="container px-6 lg:px-12 mx-auto flex flex-wrap gap-8 justify-center lg:justify-start">
            {email && (
              <div className="flex items-center space-x-3 text-slate-600">
                 <Mail size={16} className="text-primary" />
                 <span className="text-xs font-bold uppercase tracking-widest">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center space-x-3 text-slate-600">
                 <Phone size={16} className="text-primary" />
                 <span className="text-xs font-bold uppercase tracking-widest">{phone}</span>
              </div>
            )}
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-slate-600 hover:text-primary transition-colors">
                 <Globe size={16} className="text-primary" />
                 <span className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">{t("institutionalWebsite")}</span>
              </a>
            )}
         </div>
      </div>

      {/* Profile & Message Section */}
      <section className="py-24 lg:py-32 relative">
        <div className="container px-6 lg:px-12 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            {/* Portrait & Meta Column */}
            <div className="lg:col-span-4 relative">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="relative aspect-[3/4] overflow-hidden border-2 border-slate-900 p-2 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                  {(() => {
                    const bannerSrc = resolveImageUrl(page.banner_image);
                    if (bannerSrc) {
                      return (
                        <SafeImage
                          src={bannerSrc}
                          alt={page.leadership_name || t("leaderAlt")}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover grayscale brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
                        />
                      );
                    }
                    return (
                      <div
                        className="absolute inset-2"
                        style={{ backgroundImage: PROFILE_IMAGE_PLACEHOLDER_CSS }}
                        role="img"
                        aria-label={page.leadership_name || t("leaderAlt")}
                      />
                    );
                  })()}
                </div>
              </motion.div>

              <div className="mt-20 space-y-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{t("institutionalPortfolio")}</p>
                   <p className="text-lg font-black text-primary-darker uppercase tracking-tighter leading-tight">
                     {position}
                   </p>
                </div>

                {/* Social & Academic Matrix */}
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t("connectScholarly")}</p>
                   <div className="flex flex-wrap gap-3">
                      {linkedin && (
                        <a href={linkedin} className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#ff7f50] hover:text-white transition-all">
                           <Linkedin size={18} />
                        </a>
                      )}
                      {twitter && (
                        <a href={twitter} className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#ff7f50] hover:text-white transition-all">
                           <Twitter size={18} />
                        </a>
                      )}
                      {github && (
                        <a href={github} className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#ff7f50] hover:text-white transition-all">
                           <Github size={18} />
                        </a>
                      )}
                      {(scholar || researchgate) && (
                        <div className="h-10 w-px bg-slate-100 mx-2" />
                      )}
                      {scholar && (
                        <a href={scholar} className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-primary/60 hover:text-primary transition-all">
                           <GraduationCap size={20} />
                        </a>
                      )}
                      {researchgate && (
                        <a href={researchgate} className="w-10 h-10 bg-slate-50 border border-slate-100 flex items-center justify-center text-secondary/60 hover:text-secondary transition-all">
                           <BookOpen size={20} />
                        </a>
                      )}
                   </div>
                </div>

                {/* Tenure Info */}
                <div className="bg-primary-darker p-8 text-white space-y-4">
                   <Calendar className="text-primary" size={24} />
                   <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t("durationOfService")}</p>
                      <p className="text-2xl font-black">{tenure}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Profile Content Column */}
            <div className="lg:col-span-8 space-y-16">
              {/* Biography Block */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="prose prose-xl prose-slate max-w-none"
              >
                <div className="flex justify-start mb-8">
                  <Quote size={48} className="text-primary opacity-20" />
                </div>
                
                <div 
                  className="leading-[1.8] text-slate-700 font-serif text-xl first-letter:text-8xl first-letter:font-black first-letter:text-primary-darker first-letter:mr-4 first-letter:float-left first-letter:leading-[0.8] first-line:tracking-[0.1em]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(bio) }}
                />

                {/* Message Overlay if exists */}
                {message && (
                  <div className="mt-16 p-12 bg-primary/5 border-l-8 border-primary italic font-serif text-2xl text-primary-darker leading-relaxed shadow-sm">
                    "{message}"
                  </div>
                )}
              </motion.div>

              {/* Specializations & Publications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-100">
                 {specializations && (
                   <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-1 bg-secondary" />
                         <h4 className="text-lg font-black uppercase tracking-tighter text-primary-darker">{t("areasOfSpecialization")}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {specializations.split(',').map((spec: string, i: number) => (
                           <span key={i} className="px-4 py-2 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-sm">
                             {spec.trim()}
                           </span>
                         ))}
                      </div>
                   </div>
                 )}

                 {publications && (
                   <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-1 bg-primary" />
                         <h4 className="text-lg font-black uppercase tracking-tighter text-primary-darker">{t("selectedPublications")}</h4>
                      </div>
                      <div 
                         className="text-sm text-slate-500 font-medium leading-relaxed prose prose-sm prose-slate"
                         dangerouslySetInnerHTML={{ __html: sanitizeHtml(publications) }}
                      />
                   </div>
                 )}
              </div>

              {/* Signature Section */}
              <div className="pt-20 border-t border-slate-100 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("officialSignature")}</p>
                    <p className="text-3xl font-serif text-primary-darker uppercase tracking-tighter">{name}</p>
                 </div>
                 <div className="w-24 h-24 bg-slate-50 flex items-center justify-center rounded-full opacity-30 border-2 border-dashed border-slate-200">
                    <Award size={48} className="text-slate-400" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Callout */}
      <section className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all py-32 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 flex items-center justify-center overflow-hidden">
            <span className="text-[20rem] font-black text-white/5 whitespace-nowrap">{t("excellence")}</span>
         </div>
         <div className="container px-6 mx-auto relative z-10 space-y-8">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter font-serif">{t("centerOfExcellence")}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium">{t("leadershipCtaBody")}</p>
         </div>
      </section>
    </div>
  );
}
