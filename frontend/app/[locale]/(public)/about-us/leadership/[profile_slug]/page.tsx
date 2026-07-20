"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { getStaffProfile, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { 
  ArrowLeft, Mail, Phone, Globe, Linkedin, Github, 
  Twitter, BookOpen, Quote, RefreshCw, Calendar, MapPin, Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function StaffProfilePage() {
  const t = useTranslations("Staff");
  const locale = useLocale();
  const dateLocale = locale === "sw" ? "sw-KE" : "en-GB";
  const { profile_slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStaffProfile(profile_slug as string);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load staff profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (profile_slug) fetchProfile();
  }, [profile_slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><RefreshCw className="animate-spin text-primary" size={48} /></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
         <BookOpen size={64} className="text-slate-200" />
         <h1 className="text-2xl font-black uppercase tracking-tighter text-primary-darker">{t("profileNotFound")}</h1>
         <Link href="/about" className="btn-primary py-3 px-8 text-xs font-black uppercase tracking-widest">{t("returnToLeadership")}</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* High-Fidelity Header */}
      <header className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all pt-32 pb-20 px-6 relative overflow-hidden border-b-8 border-secondary">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900" />
         </div>
         <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <Link href={profile.executive_type?.name === "Governing Council" ? "/about/governing-council" : profile.executive_type?.name === "University Management Board" ? "/about/management-board" : "/about"} className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-12">
               <ArrowLeft size={14} />
               <span>{t("backToDirectory")}</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end md:space-x-12">
               <div className="w-48 h-48 md:w-64 md:h-64 bg-slate-800 shrink-0 border-4 border-slate-800 shadow-2xl relative -mb-32 z-20">
                  {profile.profile_image_url ? (
                    <img src={resolveImageUrl(profile.profile_image_url)} alt={profile.full_name} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-700">
                       <span className="text-6xl font-black uppercase">{profile.full_name.charAt(0)}</span>
                    </div>
                  )}
               </div>
               
               <div className="mt-12 md:mt-0 flex-1">
                  <div className="mb-4">
                     {profile.honorific_title && (
                       <span className="text-sm font-black uppercase tracking-widest text-secondary block mb-2">{profile.honorific_title}</span>
                     )}
                     <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-serif leading-none">
                       {profile.full_name}
                     </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                     {profile.executive_type && (
                        <div className="flex items-center space-x-2 bg-primary hover:bg-[#ff7f50] hover:text-white transition-all/20 text-primary px-3 py-1">
                          <Award size={14} />
                          <span>{profile.executive_type.name}</span>
                        </div>
                     )}
                     {profile.department && (
                        <div className="flex items-center space-x-2 bg-white/10 text-slate-300 px-3 py-1">
                          <MapPin size={14} />
                          <span>{profile.department.name}</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </header>

      <main className="container mx-auto px-6 max-w-6xl mt-40">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left Content Track */}
            <div className="lg:col-span-2 space-y-16">
               {profile.message && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50 p-8 md:p-12 border-l-4 border-secondary relative">
                    <Quote className="absolute top-6 right-8 text-slate-200 opacity-50" size={64} />
                    <div className="prose prose-lg text-slate-600 font-medium leading-relaxed relative z-10" dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.message) }} />
                 </motion.div>
               )}

               {profile.bio && (
                 <section>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-primary-darker mb-8 font-serif border-b border-slate-100 pb-4">{t("biography")}</h2>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.bio) }} />
                 </section>
               )}

               {profile.academic_qualifications && (
                 <section>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-primary-darker mb-6 font-serif border-b border-primary/20 pb-4 inline-block">{t("academicRecord")}</h2>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.academic_qualifications) }} />
                 </section>
               )}
            </div>

            {/* Right Sidebar Metadata */}
            <div className="space-y-12">
               {/* Contact & Social */}
               <div className="bg-slate-50 p-8 border border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">{t("contactSocial")}</h3>
                  <div className="space-y-4">
                     {profile.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center space-x-4 text-sm font-bold text-slate-600 hover:text-primary transition-colors group">
                           <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><Mail size={14} /></div>
                           <span>{t("emailProtocol")}</span>
                        </a>
                     )}
                     {profile.phone_number && (
                        <div className="flex items-center space-x-4 text-sm font-bold text-slate-600 group">
                           <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-400"><Phone size={14} /></div>
                           <span>{profile.phone_number}</span>
                        </div>
                     )}
                     {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center space-x-4 text-sm font-bold text-slate-600 hover:text-primary transition-colors group">
                           <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><Linkedin size={14} /></div>
                           <span>{t("linkedInProfile")}</span>
                        </a>
                     )}
                     {profile.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="flex items-center space-x-4 text-sm font-bold text-slate-600 hover:text-primary transition-colors group">
                           <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><Twitter size={14} /></div>
                           <span>{t("twitterX")}</span>
                        </a>
                     )}
                     {profile.website_url && (
                        <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center space-x-4 text-sm font-bold text-slate-600 hover:text-primary transition-colors group">
                           <div className="w-8 h-8 bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors"><Globe size={14} /></div>
                           <span>{t("personalWebsite")}</span>
                        </a>
                     )}
                  </div>
               </div>

               {/* Institutional Record */}
               <div className="bg-primary-darker p-8 text-white">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-6">{t("institutionalService")}</h3>
                  <div className="space-y-6">
                     {profile.service_start_date && (
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t("serviceCommenced")}</p>
                           <p className="text-sm font-bold text-slate-300">{new Date(profile.service_start_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long' })}</p>
                        </div>
                     )}
                     {profile.is_current ? (
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t("currentStatus")}</p>
                           <p className="text-sm font-bold text-green-400 flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span>{t("activeServingMember")}</span></p>
                        </div>
                     ) : profile.service_end_date && (
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t("serviceConcluded")}</p>
                           <p className="text-sm font-bold text-slate-300">{new Date(profile.service_end_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long' })}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Research Tracking */}
               {(profile.google_scholar_url || profile.specializations || profile.researchgate_url) && (
                  <div className="bg-slate-50 p-8 border border-slate-100">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">{t("researchOutputs")}</h3>
                     {profile.specializations && (
                        <div className="mb-6">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{t("specializations")}</p>
                           <p className="text-sm font-medium text-slate-600">{profile.specializations}</p>
                        </div>
                     )}
                     <div className="space-y-3">
                        {profile.google_scholar_url && (
                           <a href={profile.google_scholar_url} target="_blank" rel="noreferrer" className="block w-full py-3 px-4 bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-center hover:border-[#ff7f50] hover:text-primary transition-all">
                              Google Scholar
                           </a>
                        )}
                        {profile.researchgate_url && (
                           <a href={profile.researchgate_url} target="_blank" rel="noreferrer" className="block w-full py-3 px-4 bg-white border border-slate-200 text-xs font-black uppercase tracking-widest text-center hover:border-[#ff7f50] hover:text-primary transition-all">
                              ResearchGate
                           </a>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </main>
    </div>
  );
}
