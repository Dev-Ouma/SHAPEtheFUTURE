"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight, ChevronLeft, UploadCloud, User, UserCheck,
  Shield, CheckCircle2, Loader2, Globe, GraduationCap, Briefcase,
  Tag, AlertCircle, ThumbsUp
} from "lucide-react";
import { postApi, getApi, getApiCached } from "@/lib/api";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

type ComplaintType = "External" | "Student" | "Staff";

const TYPE_CONFIG = [
  {
    id: "External",
    icon: <Globe size={24} />,
    title: "External / Public",
    desc: "For applicants, partners, vendors, community members, alumni, and general public.",
    examples: ["Admission concerns", "Website issues", "Service quality", "Corruption reports", "Procurement complaints"]
  },
  {
    id: "Student",
    icon: <GraduationCap size={24} />,
    title: "Current Student",
    desc: "For issues regarding academics, exams, fees, LMS, registration, and campus life.",
    examples: ["Examination issues", "LMS/Moodle problems", "Fee disputes", "Registration issues", "Lecturer complaints"]
  },
  {
    id: "Staff",
    icon: <Briefcase size={24} />,
    title: "Staff Member",
    desc: "For HR, payroll, working conditions, ICT support, and internal process grievances.",
    examples: ["HR grievances", "Payroll issues", "Working conditions", "Administrative complaints"]
  }
];

const CustomGoogleLoginButton = ({ onSuccess, onError }: { onSuccess: (user: any) => void, onError: (err: string) => void }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        if (!userInfo.email || !(userInfo.email.endsWith('@ouk.ac.ke') || userInfo.email.endsWith('@students.ouk.ac.ke'))) {
          onError("Only OUK (@ouk.ac.ke or @students.ouk.ac.ke) email addresses are permitted.");
          return;
        }

        onSuccess(userInfo);
      } catch (err) {
        onError("Failed to retrieve Google user profile.");
      }
    },
    onError: () => onError("Google Login was cancelled or failed."),
    hosted_domain: 'ouk.ac.ke'
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm mt-4"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign in with Google
    </button>
  );
};

export default function ComplaintForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "" as ComplaintType | "",
    categoryId: "",
    categoryName: "",
    subcategory: "",
    subject: "",
    description: "",
    incidentDate: "",
    isAnonymous: false,
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    consent: false,
  });

  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [authRequired, setAuthRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getApiCached("/settings/public/google_client_id", { revalidate: 300 })
      .then((res) => setGoogleClientId(res?.value || ""))
      .catch(() => console.error("Failed to load Google Client ID"));
  }, []);

  // Load categories when type is selected
  useEffect(() => {
    if (!formData.type) return;
    setCatLoading(true);
    getApi(`/complaints/categories?type=${formData.type}`)
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, [formData.type]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  const handleNext = () => {
    if (step === 1 && (formData.type === "Student" || formData.type === "Staff")) {
      if (!isAuthenticated) {
        setAuthRequired(true);
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => setStep(prev => prev - 1);

  const handleGoogleSuccess = (userInfo: any) => {
    try {
      setFormData(prev => ({
        ...prev,
        fullName: userInfo.name || "",
        email: userInfo.email || "",
        isAnonymous: false
      }));
      setIsAuthenticated(true);
      setAuthRequired(false);
      setStep(2); // Move to next step automatically
    } catch (err) {
      setError("Failed to verify Google login.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        complaint_type: formData.type,
        category_id: formData.categoryId || undefined,
        category_name: formData.categoryName || undefined,
        subcategory: formData.subcategory || undefined,
        subject: formData.subject,
        description: formData.description,
        incident_date: formData.incidentDate || undefined,
        is_anonymous: formData.isAnonymous,
        consent_given: formData.consent,
        full_name: formData.isAnonymous ? undefined : (formData.fullName || undefined),
        email: formData.isAnonymous ? undefined : (formData.email || undefined),
        phone_number: formData.isAnonymous ? undefined : (formData.phone || undefined),
        identification_number: formData.isAnonymous ? undefined : (formData.idNumber || undefined),
      };

      const result = await postApi('/complaints/submit', payload);
      if (result?.reference_number) {
        setReference(result.reference_number);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = [
    { label: "Who Are You?" },
    { label: "Category" },
    { label: "Details" },
    { label: "Submit" },
  ];

  if (isSubmitted) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-primary-darker mb-3 tracking-tight">Submitted Successfully!</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed text-sm">
          Your grievance has been registered and our AI engine is analysing it. 
          {!formData.isAnonymous && formData.email && " A confirmation email has been sent to your inbox."}
        </p>
        <div className="bg-primary-darker text-white rounded-2xl p-8 max-w-sm mx-auto mb-8 space-y-4">
          <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Your Tracking Reference</p>
          <p className="text-3xl font-black font-mono tracking-wider">{reference}</p>
          <p className="text-[10px] opacity-60 leading-relaxed">Save this reference number to track your case status using the Track Status widget on this page.</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setStep(1);
              setFormData({ type: "", categoryId: "", categoryName: "", subcategory: "", subject: "", description: "", incidentDate: "", isAnonymous: false, fullName: "", email: "", phone: "", idNumber: "", consent: false });
              setIsSubmitted(false);
            }}
            className="btn-primary"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                  {isDone ? <CheckCircle2 size={16} /> : n}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest hidden md:block ${isActive ? 'text-primary' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step > n ? 'bg-green-400' : step > i ? 'bg-primary/30' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ─── STEP 1: Who Are You? ─── */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-black text-primary-darker mb-1">Who is submitting this?</h3>
            <p className="text-sm text-slate-500">Select the category that best describes your relationship with OUK.</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {TYPE_CONFIG.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id as ComplaintType, categoryId: "", categoryName: "", subcategory: "" })}
                className={`p-5 rounded-xl border-2 text-left transition-all ${formData.type === type.id ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 shrink-0 ${formData.type === type.id ? 'text-primary' : 'text-slate-300'}`}>
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 mb-1">{type.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{type.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {type.examples.map((ex, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{ex}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${formData.type === type.id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                    {formData.type === type.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!authRequired && (
            <div className="flex justify-end pt-2">
              <button onClick={handleNext} disabled={!formData.type} className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Authentication Modal Dialog */}
      {authRequired && googleClientId && googleClientId !== "your-google-client-id-here.apps.googleusercontent.com" && step === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-darker/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => {
                setAuthRequired(false);
                setFormData({ ...formData, type: "" });
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              ✕
            </button>
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Shield size={28} className="text-primary" />
            </div>
            
            <div className="text-center mb-6">
              <h4 className="text-xl font-black text-primary-darker mb-2">Authentication Required</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                To proceed as a <strong>{formData.type}</strong>, please sign in securely using your internal OUK Google account.
              </p>
            </div>
            
            <GoogleOAuthProvider clientId={googleClientId}>
              <CustomGoogleLoginButton 
                onSuccess={handleGoogleSuccess} 
                onError={(err) => setError(err)} 
              />
            </GoogleOAuthProvider>
            
            {error && (
              <div className="mt-5 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── STEP 2: Category ─── */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-black text-primary-darker mb-1">What is the nature of your issue?</h3>
            <p className="text-sm text-slate-500">
              Our AI will further classify your issue — just select the closest broad area.
            </p>
          </div>

          {catLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading categories...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, categoryId: cat.id, categoryName: cat.name, subcategory: "" })}
                  className={`p-4 rounded-xl border text-left transition-all ${formData.categoryId === cat.id ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-primary/5'}`}
                >
                  <p className="font-black text-sm">{cat.name}</p>
                  {cat.description && <p className={`text-[10px] mt-0.5 ${formData.categoryId === cat.id ? 'text-white/70' : 'text-slate-400'}`}>{cat.description}</p>}
                </button>
              ))}
            </div>
          )}

          {/* Subcategory */}
          {selectedCategory?.subcategories?.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                Specific Issue <span className="text-slate-400 normal-case font-medium">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.subcategories.map((sub: string) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setFormData({ ...formData, subcategory: formData.subcategory === sub ? "" : sub })}
                    className={`px-3 py-1.5 rounded-full border text-[10px] font-black transition-all flex items-center gap-1 ${formData.subcategory === sub ? 'bg-secondary text-white border-secondary' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-secondary/50'}`}
                  >
                    <Tag size={9} /> {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={handlePrev} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={handleNext} disabled={!formData.categoryId} className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Details ─── */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-black text-primary-darker mb-1">Describe your issue</h3>
            <p className="text-sm text-slate-500">Be as specific as possible. Our AI engine will extract keywords and classify your complaint automatically.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject / Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your complaint or compliment"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Detailed Description <span className="text-red-400">*</span></label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happened in detail. Include dates, names, departments, and any other relevant information. The more detail you provide, the faster we can resolve it."
                rows={6}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1">{formData.description.length} characters — recommended minimum: 50</p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date of Incident <span className="text-slate-400 font-medium normal-case">(optional)</span></label>
              <input
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
              />
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
              <UploadCloud size={28} className="mb-2 text-slate-400 group-hover:text-primary transition-colors" />
              <p className="text-sm font-bold text-slate-600 mb-1">Attach evidence or supporting documents</p>
              <p className="text-[10px] text-slate-400">PDF, JPG, PNG or DOCX (Max 10MB)</p>
              <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png,.docx" />
            </label>
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={handlePrev} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.subject || formData.description.length < 10}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Contact & Submit ─── */}
      {step === 4 && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-black text-primary-darker mb-1">Your Contact Details</h3>
            <p className="text-sm text-slate-500">These are used only to keep you updated and to verify your identity. You may submit anonymously.</p>
          </div>

          {/* Summary card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Review Summary</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 bg-primary/10 text-primary rounded-full">{formData.type}</span>
              <span className="text-[10px] font-black px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full">{formData.categoryName}</span>
              {formData.subcategory && <span className="text-[10px] font-black px-2.5 py-1 bg-secondary/10 text-secondary rounded-full">{formData.subcategory}</span>}
            </div>
            <p className="text-sm font-semibold text-slate-700">{formData.subject}</p>
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-start gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <div>
              <p className="text-sm font-black text-primary-darker mb-0.5">Submit Anonymously</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                We will still process your grievance, but we cannot send you updates or follow up for more details.
              </p>
            </div>
          </label>

          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name <span className="text-red-400">*</span></label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={isAuthenticated}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address <span className="text-red-400">*</span></label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  disabled={isAuthenticated}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm" />
              </div>
              {formData.type === "Student" && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Student / ID Number</label>
                  <input type="text" value={formData.idNumber} onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              I confirm that the information provided is accurate to the best of my knowledge. I consent to OUK processing this information to investigate and resolve my grievance in accordance with the university's Data Protection Policy.
            </p>
          </label>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={handlePrev} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="submit"
              disabled={loading || !formData.consent || (!formData.isAnonymous && (!formData.fullName || !formData.email))}
              className="btn-primary flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed min-w-[160px] justify-center"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 size={16} /> Submit Grievance</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
