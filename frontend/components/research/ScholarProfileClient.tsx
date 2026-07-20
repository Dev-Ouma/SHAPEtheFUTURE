"use client";

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  FileText, 
  Quote, 
  TrendingUp, 
  Award, 
  Link as LinkIcon, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  ArrowRight, 
  BarChart3, 
  Calendar, 
  Search,
  ChevronDown,
  ExternalLink,
  Layers,
  Briefcase,
  History,
  X,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { resolveImageUrl } from '@/lib/api';
import SafeImage from '@/components/ui/SafeImage';
import { generateAPA, generateBibTeX, generateRIS, PublicationData } from '@/lib/citations';
import { toast } from 'react-hot-toast';

interface ScholarProfileClientProps {
  scholar: any;
  publications: any[];
  projects: any[];
  grants: any[];
  metrics: {
    totalPublications: number;
    totalCitations: number;
    hIndex: number;
    i10Index: number;
  };
}

const ScholarProfileClient = ({ scholar, publications, projects, grants, metrics }: ScholarProfileClientProps) => {
  const t = useTranslations('Research');
  const [activeTab, setActiveTab] = useState<'publications' | 'projects' | 'grants' | 'about'>('publications');
  const [pubSort, setPubSort] = useState<'year' | 'citations'>('year');
  const [searchQuery, setSearchQuery] = useState('');
  const [citingPub, setCitingPub] = useState<any | null>(null);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('citationCopied', { format }));
  };

  const getPubDataForCitation = (pub: any): PublicationData => ({
    title: pub.title,
    authors: [scholar.full_name], // Simplified for now, could be expanded
    year: pub.publication_year || new Date().getFullYear(),
    journal: pub.journal_name,
    doi: pub.doi,
    url: pub.url
  });

  const sortedPublications = [...publications]
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (pubSort === 'year') return (b.publication_year || 0) - (a.publication_year || 0);
      return (b.citation_count || 0) - (a.citation_count || 0);
    });

  const stats = [
    { label: t('citationsLabel'), value: metrics.totalCitations, icon: Quote, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t('hIndex'), value: metrics.hIndex, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
    { label: t('i10Index'), value: metrics.i10Index, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const citationHistory = [
    { year: 2019, citations: 12 },
    { year: 2020, citations: 25 },
    { year: 2021, citations: 45 },
    { year: 2022, citations: 68 },
    { year: 2023, citations: 94 },
    { year: 2024, citations: 120 },
  ];

  const maxCitations = Math.max(...citationHistory.map(h => h.citations));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Scholar Info & Metrics */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Header Card */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                <div className="w-32 h-32 bg-slate-100 border-2 border-white shadow-xl relative overflow-hidden mb-6">
                  {scholar.profile_image_url ? (
                    <SafeImage
                      src={resolveImageUrl(scholar.profile_image_url)}
                      alt={scholar.full_name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-6 text-slate-300" />
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tight">
                {scholar.full_name}
              </h1>
              <p className="text-sm font-bold text-primary mb-4 uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full inline-block">
                {scholar.job_title}
              </p>
              
              <div className="w-full h-px bg-slate-100 my-6"></div>
              
              <div className="space-y-4 w-full text-left">
                <div className="flex items-center gap-4 text-slate-600 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <GraduationCap size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('department')}</span>
                    <span className="text-xs font-bold leading-tight">{scholar.department?.name || t('academicFaculty')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-600 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('institutionalSchool')}</span>
                    <span className="text-xs font-bold leading-tight">{scholar.school?.name || 'Open University of Kenya'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('verifiedEmail')}</span>
                    <span className="text-xs font-bold leading-tight truncate max-w-[200px]">{scholar.email || 'research@ouk.ac.ke'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 w-full mt-8">
                {[
                  { icon: Globe, href: scholar.website_url, color: "hover:bg-blue-500" },
                  { icon: Linkedin, href: scholar.linkedin_url, color: "hover:bg-blue-600" },
                  { icon: Github, href: scholar.github_url, color: "hover:bg-slate-800" },
                  { icon: Twitter, href: scholar.twitter_url, color: "hover:bg-sky-500" },
                ].map((social, idx) => (
                  <Link 
                    key={idx} 
                    href={social.href || '#'} 
                    target="_blank"
                    className={`h-10 border border-slate-100 flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:text-white ${social.color}`}
                  >
                    <social.icon size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-l-2 border-primary pl-4">
              {t('academicImpact')}
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-10">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${stat.bg} p-4 text-center rounded-xl border border-white shadow-sm`}>
                  <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Citation Chart Mockup */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">{t('citationHistory')}</h4>
                <p className="text-[9px] font-bold text-primary">{t('growthLabel')}</p>
              </div>
              <div className="flex items-end justify-between h-32 gap-1.5 px-2">
                {citationHistory.map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(h.citations / maxCitations) * 100}%` }}
                      className="w-full bg-slate-200 group-hover:bg-primary transition-colors relative"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-darker text-white text-[8px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {h.citations}
                      </div>
                    </motion.div>
                    <span className="text-[8px] font-bold text-slate-400 mt-2">{h.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interests Card */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 border-l-2 border-primary pl-4">
              {t('researchSpecializations')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(scholar.specializations || "Academic Research, Institutional Development, Pedagogical Innovation").split(',').map((tag: string, idx: number) => (
                <span key={idx} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 border border-slate-200">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 shadow-sm sticky top-6 z-10 overflow-x-auto no-scrollbar">
            {[
              { id: 'publications', label: t('tabPublications'), count: publications.length, icon: FileText },
              { id: 'projects', label: t('tabProjects'), count: projects.length, icon: Briefcase },
              { id: 'grants', label: t('tabGrants'), count: grants.length, icon: Award },
              { id: 'about', label: t('tabCredentials'), icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-3.5 transition-all relative shrink-0 ${
                  activeTab === tab.id 
                    ? 'text-primary font-black' 
                    : 'text-slate-400 hover:text-slate-600 font-bold'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-xs uppercase tracking-widest">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white border border-slate-200 min-h-[600px] shadow-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'publications' && (
                <motion.div
                  key="publications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
                    <div className="relative group flex-1 max-w-sm">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                      <input 
                        type="text" 
                        placeholder={t('filterScholarlyWorks')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary/50 focus:bg-white text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">{t('sortBy')}</span>
                       <button 
                        onClick={() => setPubSort('year')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                          pubSort === 'year' ? 'bg-primary-darker text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                       >
                         {t('sortYear')}
                       </button>
                       <button 
                        onClick={() => setPubSort('citations')}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                          pubSort === 'citations' ? 'bg-primary-darker text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                       >
                         {t('sortCitations')}
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {sortedPublications.length > 0 ? sortedPublications.map((pub) => (
                      <div key={pub.id} className="group p-6 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex gap-6">
                          <div className="flex-1">
                            <Link href={`/about/research/publications/${pub.slug}`} className="block">
                              <h3 className="text-base font-bold text-primary-darker group-hover:text-primary transition-colors mb-2 leading-snug">
                                {pub.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-slate-500 mb-4 font-medium italic">
                              {pub.journal_name || pub.publisher} {pub.publication_year && `(${pub.publication_year})`}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {pub.keywords && pub.keywords.slice(0, 3).map((k: string, i: number) => (
                                <span key={i} className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-2 py-0.5">
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="flex flex-col items-center bg-slate-50 border border-slate-100 px-4 py-2 min-w-[80px]">
                              <span className="text-sm font-black text-primary-darker">{pub.citation_count || 0}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('citationsLabel')}</span>
                            </div>
                            <button 
                              onClick={() => setCitingPub(pub)}
                              className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Quote size={10} /> {t('citePublication')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('noPubsMatch')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-10">{t('projectRoadmap')}</h3>
                  <div className="space-y-4">
                    {projects.length > 0 ? projects.map((project) => (
                      <div key={project.id} className="p-8 border border-slate-100 bg-slate-50/30 group hover:bg-white hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${
                             project.status === 'ongoing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                          }`}>
                            {project.status}
                          </span>
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            {project.start_date ? new Date(project.start_date).getFullYear() : '2024'} — {project.end_date ? new Date(project.end_date).getFullYear() : t('present')}
                          </p>
                        </div>
                        <h4 className="text-lg font-black text-primary-darker mb-3 uppercase tracking-tight leading-tight">
                          {project.title}
                        </h4>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">
                          {project.description || "Experimental research initiative exploring emerging technologies and their impact on digital transformation within institutional frameworks."}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <Layers size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{project.funder || t('institutionalFund')}</span>
                          </div>
                          <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                            {t('fullRoadmap')} <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200">
                         <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('noActiveProjects')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'grants' && (
                <motion.div
                  key="grants"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8"
                >
                   <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-10">{t('financialAwards')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grants.length > 0 ? grants.map((grant) => (
                      <div key={grant.id} className="p-8 bg-white border border-slate-100 relative overflow-hidden group hover:border-primary/30 transition-all h-full flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                          <Award size={64} className="text-primary-darker" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">
                          {grant.funder_name}
                        </p>
                        <h4 className="text-base font-black text-primary-darker mb-6 uppercase tracking-tight flex-1">
                          {grant.title}
                        </h4>
                        <div className="mt-auto pt-6 border-t border-slate-50">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('awardAmount')}</span>
                             <span className="text-sm font-black text-primary-darker">{grant.currency} {parseFloat(grant.amount).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('referenceNo')}</span>
                             <span className="text-[9px] font-bold text-slate-500">{grant.grant_reference_number || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center bg-slate-50 border border-dashed border-slate-200">
                         <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('noGrantsRecorded')}</p>
                      </div>
                    )}
                   </div>
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-12 space-y-12"
                >
                   <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-3">
                      <div className="h-px bg-slate-100 flex-1"></div>
                      {t('professionalBio')}
                      <div className="h-px bg-slate-100 flex-1"></div>
                    </h3>
                    <p className="text-base text-slate-700 leading-loose font-medium first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                      {scholar.bio || t('bioFallback')}
                    </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                    <div>
                      <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary-darker mb-6">
                        <GraduationCap className="text-primary" size={16} /> {t('academicCredentials')}
                      </h4>
                      <div className="space-y-4">
                        {(scholar.academic_qualifications || "PhD in Academic Architecture, MSc in Global Education Standards, BSc in Technical Integration").split(',').map((qual: string, idx: number) => (
                          <div key={idx} className="flex gap-4 group">
                            <div className="w-1 h-auto bg-slate-100 group-hover:bg-primary transition-colors"></div>
                            <p className="text-xs font-bold text-slate-600 py-1">{qual.trim()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                       <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary-darker mb-6">
                        <History className="text-primary" size={16} /> {t('researchHistory')}
                      </h4>
                      <div className="space-y-6">
                        <div className="relative pl-6 border-l border-slate-100">
                          <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">{t('affiliationPresent')}</p>
                          <p className="text-xs font-black text-primary-darker">{t('leadFacultyResearcher')}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Open University of Kenya</p>
                        </div>
                        <div className="relative pl-6 border-l border-slate-100">
                          <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-slate-200"></div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">2012 — 2018</p>
                          <p className="text-xs font-black text-slate-600">Postdoctoral Research Associate</p>
                          <p className="text-[10px] text-slate-400 font-bold">International Research Alliance</p>
                        </div>
                      </div>
                    </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Citation Modal */}
      <AnimatePresence>
        {citingPub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-primary-darker">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCitingPub(null)}
              className="absolute inset-0 bg-primary-darker/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-darker text-white flex items-center justify-center">
                    <Quote size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary-darker">{t('bibliographicCitation')}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('selectFormatting')}</p>
                  </div>
                </div>
                <button onClick={() => setCitingPub(null)} className="text-slate-400 hover:text-primary-darker transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-10 max-h-[60vh] overflow-y-auto">
                 {[
                   { label: t('apaStyle'), format: 'APA', content: generateAPA(getPubDataForCitation(citingPub)) },
                   { label: t('bibtexLatex'), format: 'BibTeX', content: generateBibTeX(getPubDataForCitation(citingPub)) },
                   { label: t('risFormat'), format: 'RIS', content: generateRIS(getPubDataForCitation(citingPub)) },
                 ].map((cit, idx) => (
                   <div key={idx} className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{cit.label}</span>
                         <button 
                           onClick={() => copyToClipboard(cit.content, cit.format)}
                           className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:underline"
                         >
                           {t('copyFormat', { format: cit.format })} <Copy size={12} />
                         </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-6 text-xs font-medium text-slate-600 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                         {cit.content}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic">{t('oukRepoFooter')}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ScholarProfileClient;
