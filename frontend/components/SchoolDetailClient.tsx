"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  Building2, 
  Target, 
  Users, 
  Globe, 
  Search, 
  GraduationCap, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Layout, 
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Award,
  BookOpen,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";
import { getApi, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useRouter } from "@/i18n/routing";
import SafeImage from "@/components/ui/SafeImage";
import { useTranslations } from "next-intl";

type SubTab = 'overview' | 'programmes' | 'departments' | 'leadership' | 'research';

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => <Zap className={className} size={size} />;

export default function SchoolDetailClient({ school: initialSchool }: { school: any }) {
  const t = useTranslations("Academics");
  const { slug } = useParams();
  const router = useRouter();
  
  const [school, setSchool] = useState<any>(initialSchool);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [progSearch, setProgSearch] = useState("");

  useEffect(() => {
    setSchool(initialSchool);
  }, [initialSchool]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
        <RefreshCw className="animate-spin text-primary" size={64} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("loadingDestination")}</span>
      </div>
    );
  }

  const filteredProgrammes = school.programmes?.filter((p: any) => 
    p.title.toLowerCase().includes(progSearch.toLowerCase()) || 
    p.level?.toLowerCase().includes(progSearch.toLowerCase())
  ) || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Header / Hero */}
      <section className="relative h-[70vh] min-h-[600px] flex items-end overflow-hidden bg-primary-darker">
         <div className="absolute inset-0">
            <SafeImage
              src={resolveImageUrl(school.banner_image_url) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"}
              className="object-cover opacity-50 grayscale"
              alt={school.name}
              fill
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
         </div>

          <div className="container mx-auto px-6 pb-20 relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="max-w-5xl space-y-12 w-full">
               <motion.button 
                 onClick={() => router.push("/academics/schools")}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors mx-auto md:mx-0"
               >
                  <ArrowLeft size={16} />
                  <span>{t("returnToHub")}</span>
               </motion.button>
               
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 w-full">
                  <div className="space-y-6 flex flex-col items-center md:items-start w-full">
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4 border-4 border-white/10"
                     >
                        {school.logo_url ? (
                          <SafeImage src={resolveImageUrl(school.logo_url)} className="object-contain" alt="" fill sizes="96px" />
                        ) : (
                          <Building2 size={40} className="text-primary" />
                        )}
                     </motion.div>
                     <motion.h1 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 }}
                       className="text-3xl md:text-7xl font-black font-serif italic text-white tracking-tighter leading-tight"
                     >
                        {school.name}
                     </motion.h1>
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                       className="flex flex-wrap items-center justify-center md:justify-start gap-6"
                     >
                        {school.email && (
                           <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                              <Mail size={14} className="text-primary" />
                              <span>{school.email}</span>
                           </div>
                        )}
                        {school.phone && (
                           <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/60">
                              <Phone size={14} className="text-primary" />
                              <span>{school.phone}</span>
                           </div>
                        )}
                        {school.website_url && (
                           <a href={school.website_url} target="_blank" className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors">
                              <Globe size={14} />
                              <span>{t("officialPortal")}</span>
                           </a>
                        )}
                     </motion.div>
                  </div>

                  {/* Dean Teaser */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] items-center space-x-6 hidden lg:flex min-w-[320px]"
                  >
                     <div className="relative w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
                        {school.dean?.profile_image_url ? (
                           <SafeImage src={resolveImageUrl(school.dean.profile_image_url)} className="object-cover" alt="" fill sizes="80px" />
                        ) : (
                           <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/20"><Users size={32} /></div>
                        )}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1">{t("officeOfDean")}</span>
                        <h4 className="text-xl font-black text-white italic font-serif leading-tight">{school.dean?.full_name || t("academicLead")}</h4>
                        <span className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{t("leadershipProfile")}</span>
                     </div>
                  </motion.div>
               </div>
            </div>
          </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <nav className="bg-slate-50 border-b border-slate-100 sticky top-0 z-50">
         <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-12 h-20">
               {[
                  { id: 'overview', label: t("tabOverview"), icon: Layout },
                  { id: 'programmes', label: t("tabProgrammes"), icon: GraduationCap },
                  { id: 'departments', label: t("tabDepartments"), icon: Building2 },
                  { id: 'research', label: t("tabResearch"), icon: Target },
                  { id: 'leadership', label: t("tabLeadership"), icon: Shield },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as SubTab)}
                     className={`flex items-center space-x-3 h-full border-b-2 transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
                  >
                     <tab.icon size={14} />
                     <span>{tab.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </nav>

      {/* Content Sections */}
      <main className="container mx-auto px-6 py-24">
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
            >
               {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                     <div className="lg:col-span-8 space-y-16">
                        <div className="space-y-8">
                           <h2 className="text-3xl md:text-5xl font-black font-serif italic text-primary-darker tracking-tighter">{t("aboutThe")} <span className="text-primary italic">{t("aboutSchool")}</span></h2>
                           <div 
                             className="prose prose-lg max-w-none text-slate-600 font-medium leading-relaxed"
                             dangerouslySetInnerHTML={{ __html: sanitizeHtml(school.description || t("schoolDescFallback")) }}
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {school.mission && (
                              <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 space-y-6">
                                 <div className="flex items-center space-x-3 text-primary">
                                    <Target size={24} />
                                    <h3 className="text-xl font-black font-serif italic tracking-tight">{t("ourMission")}</h3>
                                 </div>
                                 <div className="text-sm font-medium text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(school.mission) }} />
                              </div>
                           )}
                           {school.vision && (
                              <div className="bg-primary-darker p-12 rounded-[3.5rem] text-white space-y-6 shadow-2xl">
                                 <div className="flex items-center space-x-3 text-secondary">
                                    <Zap size={24} className="fill-secondary" />
                                    <h3 className="text-xl font-black font-serif italic tracking-tight">{t("ourVision")}</h3>
                                 </div>
                                 <div className="text-sm font-medium text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(school.vision) }} />
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="lg:col-span-4 space-y-12">
                        {/* Quick Stats Sidebar */}
                        <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-xl shadow-slate-100 space-y-10">
                           <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                              <Zap size={18} className="text-primary" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">{t("academicIndicators")}</h4>
                           </div>
                           <div className="space-y-8">
                              <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                 <div className="flex items-center space-x-4">
                                    <GraduationCap className="text-primary" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 focus:text-primary-darker">{t("fullProgrammes")}</span>
                                 </div>
                                 <span className="text-3xl font-black font-serif italic text-primary-darker">{school.programmes?.length || 0}</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                 <div className="flex items-center space-x-4">
                                    <Building2 className="text-secondary" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 focus:text-primary-darker">{t("departmentsStat")}</span>
                                 </div>
                                 <span className="text-3xl font-black font-serif italic text-primary-darker">{school.departments?.length || 0}</span>
                              </div>
                           </div>
                           
                           <Link 
                             href="/admissions/how-to-apply"
                             className="w-full bg-primary hover:bg-[#ff7f50] hover:text-white text-white p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all"
                           >
                              <span>{t("startApplication")}</span>
                              <ArrowRight size={14} />
                           </Link>

                           <Link 
                             href={`http://${
                               school.slug === 'school-of-computing-information-technology' ? 'ict' :
                               school.slug === 'school-of-business-economics' ? 'business' :
                               school.slug === 'school-of-science-technology' ? 'science' :
                               school.slug === 'school-of-education-open-learning' ? 'education' :
                               school.slug === 'school-of-agriculture-food-systems' ? 'agriculture' :
                               school.slug === 'school-of-social-sciences-humanities' ? 'social' : 
                               'www'
                             }.localhost:3005`}
                             target="_blank"
                             className="w-full bg-primary-darker border-2 border-slate-900 hover:bg-white hover:text-primary-darker text-white p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 transition-all mt-4 group"
                           >
                              <Globe size={14} className="group-hover:text-primary transition-colors" />
                              <span>{t("visitSchoolWebsite")}</span>
                              <ExternalLink size={14} />
                           </Link>
                        </div>

                        {/* Social Sidebar */}
                        <div className="p-10 space-y-8">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("institutionalLinks")}</h4>
                           <div className="flex flex-wrap gap-4">
                              {[
                                 { key: 'linkedin', icon: Linkedin },
                                 { key: 'twitter', icon: Twitter },
                                 { key: 'facebook', icon: Facebook },
                                 { key: 'instagram', icon: Instagram }
                              ].map((social) => school.social_links?.[social.key] && (
                                 <a key={social.key} href={school.social_links[social.key]} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 hover:text-primary transition-all">
                                    <social.icon size={20} />
                                 </a>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'programmes' && (
                  <div className="space-y-12">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                           <h2 className="text-4xl font-black font-serif italic text-primary-darker tracking-tighter">{t("academicPortfolios")} <span className="text-primary italic">{t("academicPortfoliosAccent")}</span></h2>
                           <p className="text-slate-500 font-medium">{t("browseQualifications", { name: school.name })}</p>
                        </div>
                        <div className="relative w-full md:w-96 group">
                           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                           <input 
                              type="text" 
                              placeholder={t("searchProgrammes")} 
                              value={progSearch}
                              onChange={(e) => setProgSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 p-6 pl-16 rounded-full font-bold outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-300"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProgrammes.map((prog: any) => (
                           <Link key={prog.id} href={`/programmes/${prog.slug}`} className="group">
                              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:border-[#ff7f50]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 relative overflow-hidden flex flex-col h-full">
                                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <GraduationCap size={100} />
                                 </div>
                                 <div className="space-y-6 flex-1">
                                    <div className="flex items-center space-x-3 text-primary text-[9px] font-black uppercase tracking-widest">
                                       <Zap size={14} />
                                       <span>{prog.level || t("degreeLevel")}</span>
                                    </div>
                                    <h4 className="text-xl font-black text-primary-darker leading-tight group-hover:text-primary transition-colors italic font-serif tracking-tight">{prog.title}</h4>
                                 </div>
                                 <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("viewStructure")}</span>
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all transform group-hover:rotate-45">
                                       <ArrowRight size={18} />
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>

                     {filteredProgrammes.length === 0 && (
                        <div className="py-24 text-center space-y-4">
                           <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
                              <GraduationCap size={32} />
                           </div>
                           <p className="text-slate-400 font-medium">{t("noProgrammesMatch")}</p>
                        </div>
                     )}
                  </div>
               )}

                {activeTab === 'departments' && (
                  <div className="space-y-12">
                     <div>
                        <h2 className="text-4xl font-black font-serif italic text-primary-darker tracking-tighter">{t("academicUnits")} <span className="text-secondary italic">{t("academicUnitsAccent")}</span></h2>
                        <p className="text-slate-500 font-medium tracking-tight">{t("unitsBody", { name: school.name })}</p>
                     </div>
                     
                     {school.departments && school.departments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {school.departments.map((dept: any) => (
                              <div key={dept.id} className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 group flex items-start space-x-8 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-colors duration-500">
                                    <Building2 size={32} />
                                 </div>
                                 <div className="space-y-4 flex-1">
                                    <h4 className="text-2xl font-black text-primary-darker tracking-tight leading-tight">{dept.name}</h4>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3">
                                       {dept.description || t("deptDescFallback")}
                                    </p>
                                    <div className="pt-4">
                                       <Link href={`/programmes?school=${school.slug}&department=${dept.slug}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                                          <span>{t("explorePortfolio")}</span>
                                          <ChevronRight size={14} />
                                       </Link>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
                           <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("unitsSyncing")}</p>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'leadership' && (
                  <div className="max-w-6xl mx-auto">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        {/* Portrait & Sticky Sidebar */}
                        <div className="lg:col-span-5 space-y-8 sticky top-32">
                           <div className="relative group">
                              <div className="absolute -inset-4 bg-primary-darker rounded-[3rem] transform -rotate-2 transition-transform group-hover:rotate-0" />
                              <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                                 {school.dean?.profile_image_url ? (
                                    <SafeImage src={resolveImageUrl(school.dean.profile_image_url)} className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" />
                                 ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/5"><Users size={120} /></div>
                                 )}
                                 <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                                    <div className="space-y-1">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("officeOfDean")}</span>
                                       <h3 className="text-2xl font-black text-white italic font-serif leading-none">{school.dean?.full_name || t("academicLead")}</h3>
                                       <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{school.dean?.academic_qualifications || t("leadAcademician")}</p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Supplemental Relatable Content to fill space */}
                           <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 pb-4">{t("connectWithOffice")}</h4>
                              <div className="space-y-4">
                                 <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
                                    <Building2 size={16} className="text-primary" />
                                    <span>{t("mainCampusComplex", { name: school.name })}</span>
                                 </div>
                                 <div className="flex items-center space-x-3 text-sm font-medium text-slate-600">
                                    <Shield size={16} className="text-primary" />
                                    <span>dean.{school.slug.replace('school-of-', '')}@ouk.ac.ke</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Biography & Statement */}
                        <div className="lg:col-span-7 space-y-10 py-6">
                           <div className="space-y-4">
                              <h2 className="text-4xl md:text-5xl font-black font-serif italic text-primary-darker tracking-tighter leading-tight">{t("deanStatement")} <span className="text-primary italic">{t("deanStatementAccent")}</span></h2>
                              <div className="w-16 h-1.5 bg-primary/20 rounded-full" />
                           </div>
                           
                           <blockquote 
                             className="text-xl font-black font-serif italic text-slate-500 leading-relaxed border-l-4 border-primary/30 pl-6"
                             dangerouslySetInnerHTML={{ 
                               __html: sanitizeHtml(school.dean_message || school.dean?.message || t("deanWelcomeFallback", { name: school.name })) 
                             }}
                           />
                           
                           <div 
                             className="prose prose-slate max-w-none text-slate-600 font-medium prose-p:leading-relaxed prose-p:mb-4 text-sm" 
                             dangerouslySetInnerHTML={{ __html: sanitizeHtml(school.dean_bio || school.dean?.bio || "") }}
                           />
                           
                           <div className="pt-4 flex items-center space-x-6">
                              <Link 
                                href={`/about/staff/${school.dean?.profile_slug}`}
                                className="bg-primary text-white py-4 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border border-transparent hover:bg-[#ff7f50] transition-all shadow-lg shadow-primary/20"
                              >
                                 <Users size={14} />
                                 <span>{t("fullAcademicProfile")}</span>
                              </Link>
                              
                              <div className="flex items-center space-x-2">
                                 {[
                                    { key: 'linkedin_url', icon: Linkedin },
                                    { key: 'twitter_url', icon: Twitter }
                                 ].map((social) => school.dean?.[social.key] && (
                                    <a key={social.key} href={school.dean[social.key]} className="p-3 bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-all">
                                       <social.icon size={16} />
                                    </a>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'research' && (
                  <div className="space-y-16">
                     <div className="max-w-3xl">
                        <h2 className="text-4xl font-black font-serif italic text-primary-darker tracking-tighter">{t("researchEnterprise")} <span className="text-primary italic">{t("researchEnterpriseAccent")}</span></h2>
                        <p className="text-lg text-slate-500 font-medium mt-4">{t("researchBody", { name: school.name })}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[t("topicStrategic"), t("topicPortfolio"), t("topicImpact")].map((topic, idx) => (
                           <div key={idx} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8 group transition-all hover:-translate-y-2">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all transform group-hover:rotate-12">
                                 {idx === 0 ? <Target size={32} /> : idx === 1 ? <BookOpen size={32} /> : <Award size={32} />}
                              </div>
                              <div className="space-y-4">
                                 <h4 className="text-2xl font-black font-serif italic text-primary-darker">{topic}</h4>
                                 <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    {t("researchTopicDesc", { topic: topic.toLowerCase() })}
                                 </p>
                              </div>
                              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{t("learnMore")}</span>
                                 <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
      </main>

      {/* Footer Branding Overlay */}
      <section className="bg-slate-50 py-16">
         <div className="container mx-auto px-6 flex flex-col items-center justify-center space-y-8 text-center">
            <div className="w-24 h-24 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-slate-200">
               <Building2 size={48} />
            </div>
            <div className="space-y-2">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">{t("institutionalPillar")}</span>
               <h3 className="text-2xl font-black font-serif italic text-primary-darker">{t("oukName")}</h3>
            </div>
         </div>
      </section>
    </div>
  );
}
