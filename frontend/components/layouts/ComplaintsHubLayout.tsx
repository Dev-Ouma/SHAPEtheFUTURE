"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { 
  MessageSquare, 
  Search, 
  Send, 
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  X,
  Upload,
  BookOpen,
  Activity,
  Scale,
  MapPin,
  User,
  Home,
  ShieldAlert,
  Shield,
  Lock,
  Library,
  Trophy,
  Info,
  Clock,
  Award,
  ShieldCheck
} from 'lucide-react';
import { getApi, postApi, uploadFile, getApiErrorMessage } from '@/lib/api';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import { useTranslations } from 'next-intl';

type TabType = 'submit' | 'track';
type StepType = 1 | 2 | 3 | 4;

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'academic-affairs': <BookOpen />,
  'financial-services': <Activity />,
  'staff-conduct': <Scale />,
  'facilities': <MapPin />,
  'admissions': <User />,
  'welfare': <Home />,
  'integrity': <ShieldAlert />,
  'gbv': <Shield />,
  'security': <Lock />,
  'library': <Library />,
  'sports': <Trophy />,
  'general': <Info />
};

interface ComplaintsHubLayoutProps {
  page: any;
  breadcrumbs: { title: string; link: string }[];
}

export default function ComplaintsHubLayout({ page, breadcrumbs }: ComplaintsHubLayoutProps) {
  const t = useTranslations("ComplaintsCms");
  const tHelp = useTranslations("Helpdesk");
  const [activeTab, setActiveTab] = useState<TabType>('submit');
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Tracking State
  const [trackingRef, setTrackingRef] = useState("");
  const [trackingEmail, setTrackingEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const trackingResultRef = useRef<HTMLDivElement>(null);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    identification_number: "",
    category_id: "",
    subject: "",
    description: "",
    incident_date: "",
    attachment_urls: [] as string[],
    preferred_contact_method: "Email",
    consent_given: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getApi('/complaints/categories');
        if (!data) {
          toast.error(t("toastCategoriesFail"));
          setCategories([]);
          return;
        }
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
        toast.error(getApiErrorMessage(error, t("toastCategoriesFail")));
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length < files.length) {
        toast.error(t("toastImagesOnly"));
      }
      
      if (imageFiles.length === 0) return;

      setUploadingFiles(true);
      try {
        const uploadedUrls: string[] = [];
        for (const file of imageFiles) {
          const res = await uploadFile(file);
          uploadedUrls.push(res.url || res.path);
        }
        
        setFormData(prev => ({
          ...prev,
          attachment_urls: [...prev.attachment_urls, ...uploadedUrls]
        }));
        setSelectedFiles(prev => [...prev, ...imageFiles]);
        toast.success(t("toastArtifactsOk", { count: imageFiles.length }));
      } catch (err) {
        toast.error(getApiErrorMessage(err, t("toastUploadFail")));
      } finally {
        setUploadingFiles(false);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachment_urls: prev.attachment_urls.filter((_, i) => i !== index)
    }));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.consent_given) {
      toast.error(t("toastConsentRequired"));
      return;
    }

    if (!isAnonymous && !formData.email) {
      toast.error(t("toastEmailRequired"));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: isAnonymous ? "Anonymous Stakeholder" : (formData.full_name || "Implicit Stakeholder"),
        email: isAnonymous ? null : (formData.email?.trim() || null),
        phone_number: isAnonymous ? null : (formData.phone_number || null),
        identification_number: isAnonymous ? null : (formData.identification_number || null),
        category_id: formData.category_id,
        subject: formData.subject,
        description: formData.description,
        incident_date: formData.incident_date || null,
        attachment_urls: formData.attachment_urls,
        preferred_contact_method: formData.preferred_contact_method,
        consent_given: formData.consent_given,
        is_anonymous: isAnonymous,
        feedback_type: "complaint",
        submission_source: "website",
        client_platform: "web",
      };

      const res = await postApi('/complaints/submit', payload);
      setSubmittedRef(res.reference_number);
      toast.success(t("toastSubmitOk"));
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, t("toastSubmitFail")));
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingLoading(true);
    setTrackingResult(null);
    try {
      const res = await postApi('/complaints/track', {
        reference_number: trackingRef,
        email: trackingEmail || null
      });
      setTrackingResult(res);
      
      setTimeout(() => {
        trackingResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("toastTrackFail")));
    } finally {
      setTrackingLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.category_id) {
      toast.error(t("toastSelectCategory"));
      return;
    }
    if (currentStep === 2 && (!formData.subject || !formData.description)) {
      toast.error(t("toastNarrativeIncomplete"));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4) as StepType);
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1) as StepType);

  const sidebar = (
    <div className="space-y-12 h-fit">
      {/* Institutional Telemetry */}
      <div className="bg-primary-darker rounded-[3rem] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <Activity className="text-primary" size={24} />
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">{t("telemetryTitle")}</h4>
          </div>
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{t("resolutionRate")}</span>
                <span className="text-xl font-black text-primary">94.8%</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{t("avgDelay")}</span>
                <span className="text-xl font-black text-white">{t("avgDelayValue")}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{t("satisfaction")}</span>
                <span className="text-xl font-black text-emerald-400">{t("satisfactionValue")}</span>
             </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex items-center gap-4">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                <Award size={20} />
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
               {t("isoSync")} <br /> {t("isoSyncBody")}
             </p>
          </div>
        </div>
      </div>

      {/* Process Governance */}
      <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-8">
         <div className="flex items-center gap-3">
            <Scale className="text-secondary" size={24} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-darker">{t("governanceEthics")}</h4>
         </div>
         <p className="text-xs text-slate-500 font-medium leading-loose">
            {t("ombudsmanBody")}
         </p>
         <ul className="space-y-4">
            {[
              t("govConfidential"),
              t("govZeroRetaliation"),
              t("govBiometric"),
              t("govSla")
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 {item}
              </li>
            ))}
         </ul>
      </div>
    </div>
  );

  return (
    <PageLayout
      title={page.title || t("titleFallback")}
      summary={page.summary || t("summaryFallback")}
      isWide={true}
      breadcrumbs={breadcrumbs}
      bannerImage={page.banner_image}
      sidebar={sidebar}
    >
      <div className="w-full relative">
        {/* Floating Continue Button for Step 1 - Root Level for true viewport fixed positioning */}
        <AnimatePresence>
           {activeTab === 'submit' && currentStep === 1 && !!formData.category_id && (
             <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]"
             >
                <button
                  onClick={() => {
                     nextStep();
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-primary text-white py-5 px-12 rounded-full flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl border border-white/10 hover:bg-[#ff7f50] hover:text-white transition-all hover:scale-105 active:scale-95 group"
                >
                   <span>{t("continueNarrative")}</span>
                   <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all">
                      <ArrowRight size={16} />
                   </div>
                </button>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex justify-start mb-16">
          <div className="bg-slate-50 p-2 rounded-full flex items-center shadow-inner border border-slate-100">
            {[
              { id: 'submit', label: t("lodgeGrievance"), icon: <MessageSquare size={16} /> },
              { id: 'track', label: t("monitorStatus"), icon: <Search size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); setSubmittedRef(null); }}
                className={`flex items-center gap-3 px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === tab.id 
                  ? "bg-white text-primary shadow-lg shadow-slate-200" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'submit' ? (
            <motion.div
              key="submit-redress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {submittedRef ? (
                <div className="bg-white border border-emerald-100 rounded-[4rem] p-24 text-center shadow-3xl shadow-emerald-50/50 flex flex-col items-center">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-12 border border-emerald-100"
                   >
                      <CheckCircle2 size={64} />
                   </motion.div>
                   <h2 className="text-4xl md:text-5xl font-black text-primary-darker font-serif lowercase tracking-tighter mb-6 capitalize leading-none">{t("processSynchronized")}</h2>
                   <p className="text-slate-500 font-medium mb-16 max-w-xl mx-auto text-lg">
                     {t("successBody")}
                   </p>
                   
                   <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 border-dashed mb-16 w-full max-w-md shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-6 px-12">{t("referenceId")}</span>
                      <span className="text-4xl font-black text-primary font-mono tracking-tighter block">{submittedRef}</span>
                   </div>

                   <button 
                     onClick={() => { setSubmittedRef(null); setCurrentStep(1); }}
                     className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-6 px-16 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                   >
                     {t("submitNew")}
                   </button>
                </div>
              ) : (
                <div className="space-y-16">
                   {/* Progress Indicator */}
                   <div className="flex items-center justify-between px-10 relative">
                      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -z-10" />
                      <div 
                        className="absolute top-1/2 left-10 h-0.5 bg-primary transition-all duration-700 -z-10" 
                        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                      />
                      {[
                        { step: 1, label: t("stepDomain") },
                        { step: 2, label: t("stepNarrative") },
                        { step: 3, label: t("stepOrchestration") },
                        { step: 4, label: t("stepConsent") }
                      ].map((s) => (
                        <div key={s.step} className="flex flex-col items-center gap-4 bg-white p-2">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                              currentStep >= s.step 
                              ? "bg-primary text-white shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-dark" 
                              : "bg-slate-50 text-slate-300"
                           }`}>
                               {s.step}
                           </div>
                           <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                             currentStep >= s.step ? "text-primary-darker" : "text-slate-300"
                           }`}>{s.label}</span>
                        </div>
                      ))}
                   </div>

                   {/* Step Content Area */}
                   <div className="min-h-[500px]">
                      <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                          >
                             <div className="text-center max-w-2xl mx-auto space-y-4">
                                <h3 className="text-3xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize">{t("selectDomain")}</h3>
                                <p className="text-sm text-slate-500 font-medium">{t("selectDomainBody")}</p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {categoriesLoading ? (
                                  Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-48 bg-slate-50 rounded-[2.5rem] animate-pulse" />
                                  ))
                                ) : (
                                  categories.map(cat => (
                                    <button
                                      key={cat.id}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, category_id: cat.id }));
                                        // Subtle scroll nudge to ensure action button is seen
                                        setTimeout(() => {
                                          window.scrollBy({ top: 200, behavior: 'smooth' });
                                        }, 100);
                                      }}
                                      className={`p-10 rounded-[2.5rem] border-2 text-left transition-all group relative overflow-hidden ${
                                        formData.category_id === cat.id 
                                        ? "border-primary bg-primary/5 shadow-22xl shadow-primary/5 scale-[1.02]" 
                                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100"
                                      }`}
                                    >
                                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                                          formData.category_id === cat.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white"
                                       }`}>
                                          {React.cloneElement(CATEGORY_ICONS[cat.slug] || <MessageSquare />, { size: 24 })}
                                       </div>
                                       <h4 className="text-lg font-black text-primary-darker font-serif lowercase tracking-tighter capitalize mb-2">{cat.name}</h4>
                                       <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-500 transition-colors">
                                          {cat.description || t("categoryDescFallback", { name: cat.name })}
                                       </p>
                                    </button>
                                  ))
                                )}
                             </div>
                          </motion.div>
                        )}

                        {currentStep === 2 && (
                           <motion.div
                             key="step2"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-12"
                           >
                              <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-12 shadow-sm">
                                <div className="space-y-4 border-b border-slate-50 pb-8">
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("formalSubject")}</label>
                                   <input 
                                     type="text" 
                                     placeholder={t("subjectPlaceholder")}
                                     value={formData.subject}
                                     onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                     className="w-full bg-slate-50 border-none p-6 rounded-2xl text-xl font-black text-primary-darker tracking-tighter focus:ring-2 focus:ring-primary outline-none transition-all"
                                   />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("processNarrative")}</label>
                                   <RichTextEditor 
                                      content={formData.description}
                                      onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                                      placeholder={t("narrativePlaceholder")}
                                    />
                                </div>
                              </div>
                           </motion.div>
                        )}

                        {currentStep === 3 && (
                           <motion.div
                             key="step3"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-12"
                           >
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                                 <div className="lg:col-span-12 space-y-10">
                                    <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-10 shadow-sm">
                                       <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest flex items-center gap-3">
                                          <Clock size={18} className="text-primary" />
                                          {t("temporalSpatial")}
                                       </h4>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="space-y-3">
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{tHelp("incidentDate")}</label>
                                             <input 
                                               type="date" 
                                               value={formData.incident_date}
                                               onChange={(e) => setFormData(prev => ({...prev, incident_date: e.target.value}))}
                                               className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary"
                                             />
                                          </div>
                                       </div>
                                    </div>

                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center group hover:border-[#ff7f50]/20 hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                       <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                       <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all duration-500">
                                          {uploadingFiles ? <RefreshCw className="animate-spin" size={32} /> : <Upload size={32} />}
                                       </div>
                                       <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest mb-2">{t("evidenceSync")}</h4>
                                       <p className="text-xs text-slate-400 font-medium mb-12">{t("evidenceBody")}</p>
                                       
                                       <div className="flex flex-wrap gap-3 justify-center">
                                          {formData.attachment_urls.map((url, i) => (
                                            <div key={i} className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-xl text-[9px] font-black uppercase tracking-widest">
                                               {url.split('/').pop()?.slice(0, 15)}...
                                               <X size={12} className="cursor-pointer hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeAttachment(i); }} />
                                            </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}

                        {currentStep === 4 && (
                           <motion.div
                             key="step4"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-12"
                           >
                              <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-12 shadow-sm">
                                 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("dataSubjectIdentity")}</h4>
                                    <button 
                                      onClick={() => setIsAnonymous(!isAnonymous)}
                                      className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                        isAnonymous ? "bg-primary-darker text-white" : "bg-slate-50 text-slate-400"
                                      }`}
                                    >
                                      {isAnonymous ? t("anonymityLocked") : t("submitAnonymously")}
                                    </button>
                                 </div>

                                 {!isAnonymous && (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                      <div className="space-y-4">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t("fullLegalName")}</label>
                                         <input 
                                            type="text" 
                                            value={formData.full_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker" 
                                         />
                                      </div>
                                      <div className="space-y-4">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t("primaryEmail")}</label>
                                         <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker" 
                                         />
                                      </div>
                                   </div>
                                 )}
                                 
                                 {isAnonymous && (
                                   <div className="p-10 bg-primary-darker rounded-[2rem] flex gap-8 items-center">
                                      <ShieldCheck className="text-primary" size={32} />
                                      <div className="space-y-1">
                                         <h5 className="text-white text-sm font-black uppercase tracking-widest">{t("anonymityOrchestrated")}</h5>
                                         <p className="text-slate-400 text-xs font-medium">{t("anonymityBody")}</p>
                                      </div>
                                   </div>
                                 )}

                                 <div className="flex gap-4 items-start pt-8 border-t border-slate-50">
                                    <input 
                                      type="checkbox" 
                                      checked={formData.consent_given}
                                      onChange={(e) => setFormData({...formData, consent_given: e.target.checked})}
                                      className="w-6 h-6 rounded text-primary focus:ring-primary cursor-pointer mt-1" 
                                    />
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] leading-loose">
                                       {t("consentBody")}
                                    </p>
                                 </div>

                                 <button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-base font-black uppercase tracking-widest transition-all hover:bg-[#ff7f50] hover:text-white active:scale-[0.98] disabled:opacity-50"
                                 >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                                    {t("finalize")}
                                 </button>
                              </div>
                           </motion.div>
                        )}
                      </AnimatePresence>
                   </div>

                   {/* Step Navigation */}
                   <div className="flex items-center justify-between pt-12 border-t border-slate-100">
                      <button 
                         onClick={prevStep}
                         disabled={currentStep === 1}
                         className="flex items-center gap-4 px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-0"
                      >
                         <ArrowLeft size={16} />
                         {t("previous")}
                      </button>
                      

                      <button 
                          onClick={nextStep}
                          disabled={currentStep === 4 || (currentStep === 1 && !Boolean(formData.category_id))}
                          className="flex items-center gap-4 bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                       >
                          {t("continue")}
                          <ArrowRight size={16} />
                       </button>
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="track-case"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-16"
            >
              <div className="bg-white border border-slate-200 rounded-[4rem] p-16 md:p-24 shadow-3xl shadow-slate-200/50 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center mb-12 shadow-inner">
                    <Search size={40} />
                 </div>
                 <h2 className="text-4xl font-black text-primary-darker font-serif lowercase tracking-tighter mb-6 capitalize text-center">{t("registryLookup")}</h2>
                 
                 <form onSubmit={handleTrack} className="w-full space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">{t("referenceIdLabel")}</label>
                          <input 
                            type="text" 
                            required
                            placeholder="OUK-CMP-XXXX"
                            value={trackingRef}
                            onChange={(e) => setTrackingRef(e.target.value)}
                            className="w-full bg-slate-50 border-none p-8 rounded-3xl font-black text-primary-darker text-center uppercase tracking-[0.2em] focus:ring-2 focus:ring-primary outline-none text-xl transition-all"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">{t("verificationKey")}</label>
                          <input 
                            type="email" 
                            placeholder={t("emailPlaceholder")}
                            value={trackingEmail}
                            onChange={(e) => setTrackingEmail(e.target.value)}
                            className="w-full bg-slate-50 border-none p-8 rounded-3xl font-black text-primary-darker text-center focus:ring-2 focus:ring-primary outline-none transition-all"
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={trackingLoading}
                      className="w-full bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-8 rounded-full flex items-center justify-center gap-6 text-sm font-black uppercase tracking-[0.4em] shadow-3xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {trackingLoading ? <RefreshCw className="animate-spin" size={20} /> : <div className="flex items-center gap-4"><Activity size={20} /> <span>{t("checkStatus")}</span></div>}
                    </button>
                 </form>

                 <AnimatePresence>
                   {trackingResult && (
                     <motion.div 
                       ref={trackingResultRef}
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       className="w-full mt-24 border-t-2 border-slate-50 pt-20 space-y-16"
                     >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-2 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("currentPhase")}</span>
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
                                 <span className="text-lg font-black text-primary-darker uppercase tracking-tighter">{trackingResult.status}</span>
                              </div>
                           </div>
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-2 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t("assignmentDomain")}</span>
                              <span className="text-lg font-black text-primary-darker uppercase tracking-tighter block truncate">{trackingResult.category?.name || t("institutionalAudit")}</span>
                           </div>
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-2 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{tHelp("incidentDate")}</span>
                              <span className="text-lg font-black text-primary tracking-tighter block">{trackingResult.incident_date ? new Date(trackingResult.incident_date).toLocaleDateString() : t("na")}</span>
                           </div>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="space-y-10">
                           <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest flex items-center gap-3">
                              <Clock size={18} className="text-secondary" />
                              {t("resolutionLog")}
                           </h4>
                           <div className="space-y-12 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
                               {trackingResult.responses && trackingResult.responses.length > 0 ? (
                                 trackingResult.responses.map((resp: any, i: number) => (
                                   <div key={i} className="flex gap-10 relative z-10">
                                      <div className="shrink-0 w-16 h-16 bg-white border-4 border-slate-50 rounded-[1.5rem] flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                                         <Scale size={20} />
                                      </div>
                                      <div className="flex-1 bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-xl shadow-slate-100/50">
                                         <div className="flex items-center justify-between mb-6 opacity-40">
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t("adminOfficer")}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{new Date(resp.created_at).toLocaleDateString()}</span>
                                         </div>
                                         <p className="text-slate-600 font-medium leading-relaxed whitespace-normal break-words">{resp.message}</p>
                                      </div>
                                   </div>
                                 ))
                               ) : (
                                 <div className="ml-24 p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed text-center">
                                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest animate-pulse">{t("pendingTriage")}</p>
                                 </div>
                               )}
                           </div>
                        </div>

                        {trackingResult.resolution && (
                          <div className="bg-emerald-50 border-2 border-emerald-100 p-16 rounded-[4rem] space-y-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-10 opacity-5 text-emerald-900">
                                <Award size={120} />
                             </div>
                             <div className="flex items-center gap-4 text-emerald-600 relative z-10">
                                <CheckCircle2 size={32} />
                                <h4 className="text-2xl font-serif font-black lowercase tracking-tighter">{t("formalResolution")}</h4>
                             </div>
                             <p className="text-lg text-emerald-900 font-bold leading-relaxed relative z-10 max-w-3xl whitespace-normal break-words">{trackingResult.resolution}</p>
                             <div className="pt-8 border-t border-emerald-200/50 relative z-10">
                                <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[0.2em]">{t("resolved", { date: new Date(trackingResult.updated_at).toLocaleDateString() })}</p>
                             </div>
                          </div>
                        )}
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
