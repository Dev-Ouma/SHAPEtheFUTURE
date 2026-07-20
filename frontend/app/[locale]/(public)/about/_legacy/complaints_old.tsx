'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { 
  MessageSquare, 
  Search, 
  Send, 
  FileText, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mail,
  Smartphone,
  MapPin,
  X,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Activity,
  Award,
  BookOpen,
  Scale,
  Home,
  ShieldAlert,
  Shield,
  Lock,
  Library,
  Trophy
} from 'lucide-react';
import { getApi, postApi, uploadFile } from '@/lib/api';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';

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

export default function PublicComplaintsPage() {
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
    location: "",
    attachment_urls: [] as string[],
    preferred_contact_method: "Email",
    consent_given: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getApi('/complaints/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Filter for images only
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length < files.length) {
        toast.error("Only image artefacts are synchronised in this registry phase");
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
        toast.success(`${imageFiles.length} image artifact(s) orchestrated`);
      } catch (err) {
        toast.error("File sync failed");
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
      toast.error("Legal consent is required");
      return;
    }

    if (!isAnonymous && !formData.email) {
      toast.error("Primary Email is required for non-anonymous orchestration");
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
        location: formData.location || "Presumed Institutional Premises",
        attachment_urls: formData.attachment_urls,
        preferred_contact_method: formData.preferred_contact_method,
        consent_given: formData.consent_given,
        is_anonymous: isAnonymous
      };

      const res = await postApi('/complaints/submit', payload);
      setSubmittedRef(res.reference_number);
      toast.success("Complaint synchronised with Institutional Registry");
    } catch (err: any) {
      console.error("Grievance submission error:", err);
      
      const backendError = err.response?.data?.message;
      let errorDetail = "";
      
      if (Array.isArray(backendError)) {
        errorDetail = backendError.join(", ");
      } else if (typeof backendError === 'string') {
        errorDetail = backendError;
      }
      
      const errorMsg = err.status === 400 
        ? `Registry rejected packet: ${errorDetail || "Validation failure"}` 
        : "Submission orchestration failed";
      
      toast.error(errorMsg);
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
      
      // Smooth scroll to results after a short delay to allow DOM to update
      setTimeout(() => {
        trackingResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      toast.error("Tracking lookup failed. Verify credentials.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.category_id) {
      toast.error("Please select a grievance category");
      return;
    }
    if (currentStep === 2 && (!formData.subject || !formData.description)) {
      toast.error("Process narrative is incomplete");
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
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Telemetry</h4>
          </div>
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">90-Day Resolution Rate</span>
                <span className="text-xl font-black text-primary">94.8%</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Avg. Orchestration Delay</span>
                <span className="text-xl font-black text-white">4.2 Days</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Stakeholder Satisfaction</span>
                <span className="text-xl font-black text-emerald-400">Optimal</span>
             </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex items-center gap-4">
             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                < Award size={20} />
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
               ISO 9001:2015 <br /> Quality Management Sync
             </p>
          </div>
        </div>
      </div>

      {/* University Core Activities */}
      <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] space-y-8">
         <div className="flex items-center gap-3">
            <BookOpen className="text-primary" size={24} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-darker">University Activities</h4>
         </div>
         <div className="grid grid-cols-1 gap-4">
            <Link href="/programmes" className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl group hover:border-[#ff7f50] transition-all">
               <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">Academic Catalogue</span>
               <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
            </Link>
            <Link href="/short-courses" className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl group hover:border-[#ff7f50] transition-all">
               <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">Digital Learning</span>
               <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
            </Link>
            <Link href="/research" className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl group hover:border-[#ff7f50] transition-all">
               <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-primary">Research Hub</span>
               <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
            </Link>
         </div>
      </div>

      {/* Process Governance */}
      <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-8">
         <div className="flex items-center gap-3">
            <Scale className="text-secondary" size={24} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-darker">Governance & Ethics</h4>
         </div>
         <p className="text-xs text-slate-500 font-medium leading-loose">
            The Office of the University Ombudsman ensures that every grievance is processed with absolute neutrality and legal orchestration.
         </p>
         <ul className="space-y-4">
            {[
              "Confidential Handling",
              "Zero Retaliation Policy",
              "Biometric Reference Logic",
              "Standardized SLA Sync"
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
      title="Stakeholder Redress Hub"
      summary="A secure, multi-dimensional gateway for grievances, suggestions, and formal reports, ensuring institutional accountability and digital transparency."
      isWide={true}
      breadcrumbs={[{ title: 'Complaints Hub', link: '/about/complaints' }]}
      sidebar={sidebar}
    >
      <div className="w-full">
        
        {/* Navigation Tabs */}
        <div className="flex justify-start mb-16">
          <div className="bg-slate-50 p-2 rounded-full flex items-center shadow-inner border border-slate-100">
            {[
              { id: 'submit', label: 'Lodge Grievance', icon: <MessageSquare size={16} /> },
              { id: 'track', label: 'Monitor Status', icon: <Search size={16} /> }
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
                   <h2 className="text-4xl md:text-5xl font-black text-primary-darker font-serif lowercase tracking-tighter mb-6 capitalize leading-none">Process Synchronised</h2>
                   <p className="text-slate-500 font-medium mb-16 max-w-xl mx-auto text-lg">
                     Your redress request has been recorded in the OUK Distributed Registry. <span className="text-primary font-bold">Please copy and keep your Reference ID below;</span> you will need it to monitor the status of this grievance.
                   </p>
                   
                   <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 border-dashed mb-16 w-full max-w-md shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-6 px-12">Institutional Reference ID</span>
                      <span className="text-4xl font-black text-primary font-mono tracking-tighter block">{submittedRef}</span>
                   </div>

                   <button 
                     onClick={() => { setSubmittedRef(null); setCurrentStep(1); }}
                     className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-6 px-16 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                   >
                     Submit New Grievance
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
                        { step: 1, label: 'Domain' },
                        { step: 2, label: 'Narrative' },
                        { step: 3, label: 'Orchestration' },
                        { step: 4, label: 'Consent' }
                      ].map((s) => (
                        <div key={s.step} className="flex flex-col items-center gap-4 bg-white p-2">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                              currentStep >= s.step 
                              ? "bg-primary text-white shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-primary-dark" 
                              : "bg-slate-50 text-slate-300"
                           }`}>
                              {currentStep > s.step ? <CheckCircle2 size={18} /> : s.step}
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
                                <h3 className="text-3xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize">Select Dispute Domain</h3>
                                <p className="text-sm text-slate-500 font-medium">Categorise your grievance to ensure it is routed to the appropriate subject-matter experts.</p>
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
                                      onClick={() => setFormData(prev => ({ ...prev, category_id: cat.id }))}
                                      className={`p-10 rounded-[2.5rem] border-2 text-left transition-all group relative overflow-hidden ${
                                        formData.category_id === cat.id 
                                        ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" 
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
                                          {cat.description || `Submit academic or administrative redress related to ${cat.name}.`}
                                       </p>
                                       {formData.category_id === cat.id && (
                                          <div className="absolute top-6 right-6 text-primary">
                                             <CheckCircle2 size={24} />
                                          </div>
                                       )}
                                    </button>
                                  ))
                                )}
                             </div>

                             {/* Floating Continue Button for Step 1 */}
                             <AnimatePresence>
                                {formData.category_id && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100 }}
                                    className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
                                  >
                                     <button
                                       onClick={nextStep}
                                       className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-5 px-10 rounded-full flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                     >
                                        Continue to Narrative
                                        <ArrowRight size={16} />
                                     </button>
                                  </motion.div>
                                )}
                             </AnimatePresence>
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
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Formal Subject Header</label>
                                   <input 
                                     type="text" 
                                     placeholder="Concise summary of the grievance..."
                                     value={formData.subject}
                                     onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                     className="w-full bg-slate-50 border-none p-6 rounded-2xl text-xl font-black text-primary-darker tracking-tighter focus:ring-2 focus:ring-primary outline-none transition-all"
                                   />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Process Narrative & Facts</label>
                                   <RichTextEditor 
                                      content={formData.description}
                                      onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                                      placeholder="Provide a detailed, chronological account of the incident..."
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
                                 <div className="lg:col-span-7 space-y-10">
                                    <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-10 shadow-sm min-h-full flex flex-col justify-center">
                                       <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest flex items-center gap-3">
                                          <Clock size={18} className="text-primary" />
                                          Temporal Chronology
                                       </h4>
                                       <div className="space-y-8">
                                          <div className="space-y-3">
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Incident Date</label>
                                             <input 
                                               type="date" 
                                               value={formData.incident_date}
                                               onChange={(e) => setFormData(prev => ({...prev, incident_date: e.target.value}))}
                                               className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary"
                                             />
                                          </div>
                                       </div>
                                    </div>

                                    <div className="bg-slate-50 p-10 rounded-[3rem] space-y-6">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                          <Search size={16} className="text-secondary" />
                                          Preferred Feedback Loop
                                       </h4>
                                       <div className="flex flex-wrap gap-4">
                                          {['Email', 'Internal Portal', 'Secure SMS'].map(method => (
                                            <button
                                              key={method}
                                              onClick={() => setFormData(prev => ({...prev, preferred_contact_method: method}))}
                                              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                formData.preferred_contact_method === method 
                                                ? "bg-secondary text-white shadow-lg" 
                                                : "bg-white text-slate-400 hover:text-slate-600"
                                              }`}
                                            >
                                              {method}
                                            </button>
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="lg:col-span-5 space-y-8">
                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center min-h-full group hover:border-[#ff7f50]/20 hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                       <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                       <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all duration-500">
                                          {uploadingFiles ? <RefreshCw className="animate-spin" size={32} /> : <Upload size={32} />}
                                       </div>
                                       <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest mb-2">Evidence Synchronisation</h4>
                                       <p className="text-xs text-slate-400 font-medium mb-12">Admit digital artifacts, documents, or high-fidelity screenshots to support your case.</p>
                                       
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
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                 <div className="lg:col-span-2 space-y-12">
                                    <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-12 shadow-sm">
                                       <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Data Subject Identity</h4>
                                          <button 
                                            onClick={() => setIsAnonymous(!isAnonymous)}
                                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                              isAnonymous ? "bg-primary-darker text-white" : "bg-slate-50 text-slate-400"
                                            }`}
                                          >
                                            {isAnonymous ? "Anonymity Locked" : "Submit Anonymously"}
                                          </button>
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                          <div className={`space-y-4 transition-all duration-500 ${isAnonymous ? "opacity-20 pointer-events-none grayscale" : "opacity-100"}`}>
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Legal Name</label>
                                             <input 
                                                type="text" 
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker" 
                                             />
                                          </div>
                                          <div className={`space-y-4 transition-all duration-500 ${isAnonymous ? "opacity-20 pointer-events-none grayscale" : "opacity-100"}`}>
                                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Email</label>
                                             <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-slate-50 border-none p-6 rounded-2xl font-bold text-primary-darker" 
                                             />
                                          </div>
                                       </div>
                                       
                                       {isAnonymous && (
                                          <div className="p-10 bg-primary-darker rounded-[2rem] flex gap-8 items-center border border-primary/20 shadow-2xl animate-in zoom-in-95">
                                             <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                                <ShieldCheck size={32} />
                                             </div>
                                             <div className="space-y-2">
                                                <h5 className="text-white text-lg font-serif font-black lowercase tracking-tighter">Zero-Knowledge Protocol</h5>
                                                <p className="text-slate-400 text-xs font-medium leading-relaxed">Your submission will be processed under a cryptographic hash. Administrative officers will only see the grievance data, not the underlying PII.</p>
                                             </div>
                                          </div>
                                       )}
                                    </div>

                                    <div className="bg-slate-50 p-12 rounded-[3.5rem] space-y-10">
                                       <div className="flex gap-8 items-start">
                                          <input 
                                            type="checkbox" 
                                            checked={formData.consent_given}
                                            onChange={(e) => setFormData({...formData, consent_given: e.target.checked})}
                                            className="w-8 h-8 rounded-xl text-primary focus:ring-primary cursor-pointer mt-1" 
                                          />
                                          <div className="space-y-4">
                                             <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest">Privacy & Compliance Affirmation</h4>
                                             <p className="text-[10px] text-slate-500 font-medium leading-loose uppercase tracking-[0.1em]">
                                                I here-by certify that the information provided is factual and synchronised with my best knowledge. I consent to the processing of this redress request under the <strong>Data Protection Orchestration Act</strong> and university grievance policies. I understand that malicious reporting may lead to institutional disciplinary protocols.
                                             </p>
                                          </div>
                                       </div>

                                       <button 
                                          onClick={handleSubmit}
                                          disabled={loading}
                                          className="w-full bg-primary text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-base font-bold transition-all hover:bg-[#ff7f50] hover:text-white active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
                                       >
                                          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                                          Submit Complaint
                                       </button>
                                    </div>
                                 </div>

                                 <div className="bg-primary-darker rounded-[3rem] p-12 text-white shadow-2xl h-fit space-y-12">
                                    <div className="space-y-6">
                                       <Scale size={32} className="text-primary" />
                                       <h4 className="text-xl font-serif font-black lowercase tracking-tighter capitalize border-b border-white/10 pb-6">Final Review</h4>
                                    </div>
                                    <div className="space-y-8">
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Domain</span>
                                          <p className="font-bold text-sm tracking-wide capitalize">{categories.find(c => c.id === formData.category_id)?.name || "Not Selected"}</p>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</span>
                                          <p className="font-bold text-sm tracking-wide lowercase">{formData.subject}</p>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Narrative (Formatted)</span>
                                          <div 
                                             className="text-[11px] text-slate-300 max-h-32 overflow-hidden mask-fade-bottom prose prose-invert prose-sm leading-relaxed"
                                             dangerouslySetInnerHTML={{ __html: formData.description }}
                                          />
                                        </div>
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Evidence Count</span>
                                          <p className="font-bold text-sm tracking-wide">{formData.attachment_urls.length} Digital Assets</p>
                                       </div>
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reporting ID</span>
                                          <p className="font-bold text-sm tracking-wide">{isAnonymous ? "Zero-Knowledge Link" : "Standard Profile Identity"}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                      </AnimatePresence>
                   </div>

                   {/* Step Navigation Controls */}
                   <div className="flex items-center justify-between pt-12 border-t border-slate-100">
                      <button 
                         onClick={prevStep}
                         disabled={currentStep === 1}
                         className="flex items-center gap-4 px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-0"
                      >
                         <ArrowLeft size={16} />
                         Orchestrate Previous
                      </button>
                      <button 
                          onClick={nextStep}
                          disabled={currentStep === 4}
                          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary-darker text-white text-[11px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                       >
                          Continue
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
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white border border-slate-200 rounded-[4rem] p-16 md:p-24 shadow-3xl shadow-slate-200/50 flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center mb-12 shadow-inner">
                    <Search size={40} />
                 </div>
                 <h2 className="text-4xl font-black text-primary-darker font-serif lowercase tracking-tighter mb-6 capitalize text-center">Registry Lookup Hub</h2>
                 <p className="text-slate-500 text-center font-medium mb-16 max-w-xl text-lg">
                    Access the OUK Institutional Registry to monitor the analysis and resolution protocols for your specific grievance.
                 </p>

                 <form onSubmit={handleTrack} className="w-full space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Reference ID</label>
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
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-6">Verification Key</label>
                          <input 
                            type="email" 
                            placeholder="Associated Email Address"
                            value={trackingEmail}
                            onChange={(e) => setTrackingEmail(e.target.value)}
                            className="w-full bg-slate-50 border-none p-8 rounded-3xl font-black text-primary-darker text-center focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-[10px] placeholder:tracking-[0.2em] placeholder:uppercase"
                          />
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={trackingLoading}
                      className="w-full bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-8 rounded-full flex items-center justify-center gap-6 text-sm font-black uppercase tracking-[0.4em] shadow-3xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {trackingLoading ? <RefreshCw className="animate-spin" size={20} /> : <div className="flex items-center gap-4"><Activity size={20} /> <span>Check Status</span></div>}
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
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Phase</span>
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
                                 <span className="text-lg font-black text-primary-darker uppercase tracking-tighter">{trackingResult.status}</span>
                              </div>
                           </div>
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-2 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assignment Domain</span>
                              <span className="text-lg font-black text-primary-darker uppercase tracking-tighter block truncate">{trackingResult.category?.name || "Institutional Audit"}</span>
                           </div>
                           <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-2 border border-slate-100">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resolution SLA</span>
                              <span className="text-lg font-black text-primary tracking-tighter block">{new Date(trackingResult.sla_due_date).toLocaleDateString()}</span>
                           </div>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="space-y-10">
                           <h4 className="text-sm font-black text-primary-darker uppercase tracking-widest flex items-center gap-3">
                              <Clock size={18} className="text-secondary" />
                              Resolution Master Log
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
                                           <span className="text-[9px] font-black uppercase tracking-widest">OUK Administrative Officer</span>
                                           <span className="text-[9px] font-black uppercase tracking-widest">{new Date(resp.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-normal break-words">{resp.message}</p>
                                     </div>
                                  </div>
                                ))
                              ) : (
                                <div className="ml-24 p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed text-center">
                                   <p className="text-xs text-slate-400 font-black uppercase tracking-widest animate-pulse">Case is currently pending triage by the Institutional Redress Office</p>
                                </div>
                              )}
                              
                              <div className="flex gap-10 opacity-30">
                                 <div className="shrink-0 w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400">
                                    <Send size={20} />
                                 </div>
                                 <div className="flex-1 bg-slate-50 p-10 rounded-[2.5rem]">
                                    <p className="text-xs font-black uppercase tracking-widest">Initial Grievance Submission Synchronised</p>
                                    <span className="text-[9px] uppercase font-bold">{new Date(trackingResult.created_at).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {trackingResult.resolution && (
                          <div className="bg-emerald-50 border-2 border-emerald-100 p-16 rounded-[4rem] space-y-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-10 opacity-5 text-emerald-900">
                                <Award size={120} />
                             </div>
                             <div className="flex items-center gap-4 text-emerald-600 relative z-10">
                                <CheckCircle2 size={32} />
                                <h4 className="text-2xl font-serif font-black lowercase tracking-tighter">Formal Institutional Resolution</h4>
                             </div>
                             <p className="text-lg text-emerald-900 font-bold leading-relaxed relative z-10 max-w-3xl whitespace-normal break-words">{trackingResult.resolution}</p>
                             <div className="pt-8 border-t border-emerald-200/50 relative z-10">
                                <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-[0.2em]">Closed at: {new Date(trackingResult.resolved_at).toLocaleString()}</p>
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
