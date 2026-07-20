"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight, ChevronLeft, UploadCloud, ChevronDown,
  CheckCircle2, Loader2, Globe, GraduationCap, Briefcase,
  AlertCircle, ThumbsUp, ThumbsDown, MapPin, Shield
} from "lucide-react";
import { postApi, getApi, getApiErrorMessage } from "@/lib/api";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { isHelpdeskCategory as isHelpDeskCategory } from "@/lib/helpdesk-category-slugs";

type SubmitterType = "External" | "Student" | "Staff";
type FeedbackType = "complaint" | "compliment";

// Maps the `group` query param (e.g. from an ICT Support deep-link) to the
// internal service-group value the backend expects. The group is no longer
// chosen via UI cards — it is derived from the selected category server-side,
// or pre-set here when arriving from ICT Support.
const QUERY_GROUP_MAP: Record<string, string> = {
  it: "ICT Technical Support",
  ict: "ICT Technical Support",
  "it technical support": "ICT Technical Support",
  "ict technical support": "ICT Technical Support",
  helpdesk: "HelpDesk",
  "help desk": "HelpDesk",
};

// Helpdesk-only taxonomy (mirrors campus-feedback-seed.ts). ICT system issues
// belong on Technical Support / OUK APP — not this form.
const PUBLIC_CATEGORIES = [
  {
    slug: "buildings-maintenance",
    name: "Campus Facilities & Infrastructure",
    is_infrastructure: true,
    subcategories: ["Leaks & water damage", "Doors & locks", "Lifts & elevators", "Lighting", "Structural damage", "Furniture & fittings"],
  },
  {
    slug: "utilities",
    name: "Utilities & Services",
    is_infrastructure: true,
    subcategories: ["Power outage", "Water supply", "Sanitation", "Air conditioning", "Heating", "Building Wi-Fi (facility)"],
  },
  {
    slug: "cleanliness-sanitation",
    name: "Cleanliness & Sanitation",
    is_infrastructure: true,
    subcategories: ["Restrooms", "Waste & bins", "Pest control", "Landscaping", "Cleaning services"],
  },
  {
    slug: "transport-parking",
    name: "Transport & Parking",
    is_infrastructure: true,
    subcategories: ["Parking", "Shuttle/bus", "Road conditions", "Traffic management"],
  },
  {
    slug: "security-access",
    name: "Security & Safety",
    is_infrastructure: true,
    subcategories: ["Gate access", "ID badges", "CCTV", "Parking security", "After-hours access", "Safety incident"],
  },
  {
    slug: "construction-planning",
    name: "Construction & Planning",
    is_infrastructure: true,
    subcategories: ["Construction noise", "Dust & disruption", "Space allocation", "Room booking", "New facility requests"],
  },
  {
    slug: "campus-environment",
    name: "Campus Environment",
    is_infrastructure: true,
    subcategories: ["Accessibility", "Outdoor areas", "Signage", "Noise levels", "General ambiance"],
  },
  {
    slug: "student-services",
    name: "General Student Services",
    is_infrastructure: false,
    subcategories: ["Lost & found", "General student desk"],
  },
  {
    slug: "library-physical-resources",
    name: "Library & Physical Resources",
    is_infrastructure: false,
    subcategories: ["Study spaces", "Physical collections", "Library facilities", "Printing & scanning"],
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness Services",
    is_infrastructure: false,
    subcategories: ["Clinic / first aid", "Wellness programmes", "Accessibility support"],
  },
  {
    slug: "finance-payments-desk",
    name: "Finance & Payments (Desk)",
    is_infrastructure: false,
    subcategories: ["Fee enquiries (desk)", "Receipts & clearance", "Payment advice (non-system)"],
  },
  {
    slug: "general-inquiry",
    name: "General Inquiry",
    is_infrastructure: false,
    subcategories: [] as string[],
  },
];


function GoogleSubmitButton({
  validateForm, executeSubmit, loading, disabled, feedbackType, setError, setLoading, t
}: { 
  validateForm: () => boolean; 
  executeSubmit: (u: {name: string, email: string}) => void; 
  loading: boolean; 
  disabled: boolean;
  feedbackType: string;
  setError: (e: string) => void;
  setLoading: (l: boolean) => void;
  t: (key: string) => string;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        if (!userInfo.email || !(userInfo.email.endsWith('@ouk.ac.ke') || userInfo.email.endsWith('@students.ouk.ac.ke'))) {
          setError(t("errOukEmail"));
          setLoading(false);
          return;
        }
        executeSubmit({ name: userInfo.name, email: userInfo.email });
      } catch {
        setError(t("errGoogleProfile"));
        setLoading(false);
      }
    },
    onError: () => {
      setError(t("errGoogleLogin"));
      setLoading(false);
    },
    hosted_domain: 'ouk.ac.ke',
  });

  return (
    <button type="button" onClick={() => { if(validateForm()) login(); }} disabled={disabled || loading}
      className="w-full py-3.5 bg-primary-darker text-white font-bold rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
      {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
      {feedbackType === "compliment" ? t("signInSubmitCompliment") : t("signInSubmitComplaint")}
    </button>
  );
}

export default function CampusFeedbackForm() {
  const t = useTranslations("Helpdesk");
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  const typeConfig = [
    {
      id: "External" as SubmitterType,
      icon: <Globe size={24} />,
      title: t("typeExternal"),
      desc: t("typeExternalDesc"),
    },
    {
      id: "Student" as SubmitterType,
      icon: <GraduationCap size={24} />,
      title: t("typeStudent"),
      desc: t("typeStudentDesc"),
    },
    {
      id: "Staff" as SubmitterType,
      icon: <Briefcase size={24} />,
      title: t("typeStaff"),
      desc: t("typeStaffDesc"),
    },
  ];
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("complaint");
  const [referredFromIct, setReferredFromIct] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");

  const [formData, setFormData] = useState({
    type: "External" as SubmitterType,
    full_name: "",
    email: "",
    phone_number: "",
    category_slug: "",
    sub_category: "",
    serviceGroup: "HelpDesk",
    subject: "",
    description: "",
    location: "",
    incident_date: "",
    is_anonymous: false,
    consent_given: false,
  });

  useEffect(() => {
    getApi('/settings/public/google_client_id')
      .then((res) => setGoogleClientId(res?.value || ""))
      .catch(() => setGoogleClientId(""));
  }, []);

  // Prefill from deep-link query params (e.g. the ICT Support site sends
  // ?type=complaint&group=it&source=ict).
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "complaint" || typeParam === "compliment") {
      setFeedbackType(typeParam);
    }
    // ICT system issues no longer use this Helpdesk form — keep HelpDesk categories only.
    const groupParam = (searchParams.get("group") || "").toLowerCase();
    const mappedGroup = QUERY_GROUP_MAP[groupParam];
    if (mappedGroup === "HelpDesk") {
      setFormData((p) => ({ ...p, serviceGroup: "HelpDesk" }));
    }
    if (searchParams.get("source") === "ict" || mappedGroup === "ICT Technical Support") {
      setReferredFromIct(true);
    }
  }, [searchParams]);

  const categories = React.useMemo(() => {
    const group = formData.serviceGroup;
    return PUBLIC_CATEGORIES.filter((cat) => {
      if (group === "ICT Technical Support" && isHelpDeskCategory(cat)) return false;
      if (group === "HelpDesk" && !isHelpDeskCategory(cat)) return false;
      return true;
    });
  }, [formData.serviceGroup]);

  const update = (field: string, value: string | boolean) => setFormData((p) => ({ ...p, [field]: value }));

  const selectedCategory = categories.find((c) => c.slug === formData.category_slug);
  const subcategories: string[] = selectedCategory?.subcategories || [];
  const hasValidGoogleClient =
    googleClientId.length > 0 && googleClientId !== "your-google-client-id-here.apps.googleusercontent.com";

  const isGoogleFlow = formData.type !== "External" && hasValidGoogleClient;

  const validateForm = () => {
    if (!formData.consent_given) {
      setError(t("errConsent"));
      return false;
    }
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError(t("errSubjectDesc"));
      return false;
    }
    if (categories.length > 0 && !formData.category_slug) {
      setError(t("errCategory"));
      return false;
    }
    setError("");
    return true;
  };

  const executeSubmit = async (userProfile?: { name: string; email: string }) => {
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        feedback_type: feedbackType,
        submitter_type: formData.type,
        service_group: "helpdesk",
        submission_source: "website",
        client_platform: "web",
        full_name: userProfile?.name || formData.full_name || undefined,
        email: userProfile?.email || formData.email || undefined,
        phone_number: formData.phone_number || undefined,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        location: formData.location || undefined,
        incident_date: formData.incident_date || undefined,
        consent_given: formData.consent_given,
        is_anonymous: formData.is_anonymous,
      };
      if (formData.category_slug) payload.category_slug = formData.category_slug;
      if (formData.sub_category) payload.sub_category = formData.sub_category;

      const result = await postApi('/ict/public/submit', payload);
      setReferenceNumber(result.reference_number);
      setSubmitted(true);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, t("errSubmit")));
    } finally {
      setLoading(false);
    }
  };

  // Fade the confirmation out, then reset the form back to the Complaints &
  // Compliments landing state (step 1) so another submission can be started.
  const backToStart = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setSubmitted(false);
      setLeaving(false);
      setStep(1);
      setReferenceNumber("");
      setError("");
      setFeedbackType("complaint");
      setFormData({
        type: "External",
        full_name: "",
        email: "",
        phone_number: "",
        category_slug: "",
        sub_category: "",
        serviceGroup: "",
        subject: "",
        description: "",
        location: "",
        incident_date: "",
        is_anonymous: false,
        consent_given: false,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  if (submitted) {
    return (
      <div
        className={`text-center py-12 duration-300 ${
          leaving ? "animate-out fade-out slide-out-to-left-4" : "animate-in fade-in zoom-in-95"
        }`}
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-primary-darker mb-3 tracking-tight">{t("thankYou")}</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed text-sm">
          {feedbackType === "compliment" ? t("recordedCompliment") : t("recordedComplaint")}
        </p>
        <div className="bg-primary-darker text-white rounded-2xl p-8 max-w-sm mx-auto mb-8 space-y-4">
          <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{t("trackingReference")}</p>
          <p className="text-3xl font-black font-mono tracking-wider">{referenceNumber}</p>
          <p className="text-[10px] opacity-60 leading-relaxed">{t("saveReference")}</p>
        </div>
        <button
          type="button"
          onClick={backToStart}
          disabled={leaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-black text-primary-darker hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
        >
          <ChevronLeft size={18} /> {t("backToComplaints")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {referredFromIct && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 flex items-center gap-2">
          <Shield size={14} />
          {t("ictRedirectBanner")}{" "}
          <Link href="/support" className="underline underline-offset-2">{t("supportChannels")}</Link>
          {t("ictRedirectTail")}
        </div>
      )}
      {/* Guidance banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-slate-700 shadow-sm">
        <p className="font-black text-primary-darker mb-2 flex items-center gap-2">
          <MapPin size={16} /> {t("guidanceTitle")}
        </p>
        <p className="leading-relaxed">
          {t("guidanceBody")}
        </p>
      </div>

      {/* Complaint vs Compliment */}
      <div className="grid grid-cols-2 gap-4">
        <button type="button" onClick={() => setFeedbackType("complaint")}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
            feedbackType === "complaint" ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 bg-white hover:border-slate-300"
          }`}>
          <ThumbsDown size={28} className={feedbackType === "complaint" ? "text-primary" : "text-slate-300"} />
          <div className="text-center">
            <p className="font-black text-slate-800 text-sm">{t("complaint")}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{t("complaintHint")}</p>
          </div>
        </button>
        <button type="button" onClick={() => setFeedbackType("compliment")}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
            feedbackType === "compliment" ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-slate-100 bg-white hover:border-slate-300"
          }`}>
          <ThumbsUp size={28} className={feedbackType === "compliment" ? "text-emerald-500" : "text-slate-300"} />
          <div className="text-center">
            <p className="font-black text-slate-800 text-sm">{t("compliment")}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{t("complimentHint")}</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        {/* Step 1: Submitter type */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-lg font-black text-primary-darker">{t("whoSubmitting")}</h3>
              <p className="text-sm text-slate-500 mt-1">{t("whoSubmittingBody")}</p>
            </div>

            <div className="grid gap-3">
              {typeConfig.map((item) => (
                <button key={item.id} type="button" onClick={() => { update("type", item.id); setStep(2); }}
                  className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 text-left transition-all group">
                  <div className="text-slate-400 group-hover:text-primary transition-colors mt-0.5">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-300 group-hover:text-primary transition-colors" size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-primary-darker capitalize">{feedbackType === "compliment" ? t("detailsCompliment") : t("detailsComplaint")}</h3>
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50">
                <ChevronLeft size={14} /> {t("back")}
              </button>
            </div>

            {formData.type !== "External" && !hasValidGoogleClient && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("googleNotConfigured")}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {!isGoogleFlow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("fullName")}</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder={t("namePlaceholder")} value={formData.full_name} onChange={(e) => update("full_name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("emailAddress")}</label>
                    <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder={t("emailExample")} value={formData.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                </div>
              )}

              {isGoogleFlow && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <Shield size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {t("googleVerified")}
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("category")}</label>
                <div className="relative">
                  <CustomSelect
                    options={categories.map(c => ({ value: c.slug, label: c.name }))}
                    value={formData.category_slug}
                    onChange={(val) => { update("category_slug", val); update("sub_category", ""); }}
                    placeholder={t("selectCategory")}
                  />
                </div>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("subCategory")}</label>
                  <div className="relative">
                    <CustomSelect
                      options={subcategories.map(s => ({ value: s, label: s }))}
                      value={formData.sub_category}
                      onChange={(val) => update("sub_category", val)}
                      placeholder={t("selectIssue")}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("subject")} <span className="text-red-400">*</span></label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder={t("subjectPlaceholder")} value={formData.subject} onChange={(e) => update("subject", e.target.value)} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("description")} <span className="text-red-400">*</span></label>
                <textarea rows={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                  placeholder={t("descriptionPlaceholder")} value={formData.description} onChange={(e) => update("description", e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                    <MapPin size={10} /> {t("location")}
                  </label>
                  <input placeholder={t("locationPlaceholder")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.location} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">{t("incidentDate")}</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    value={formData.incident_date} max={new Date().toISOString().split("T")[0]} onChange={(e) => update("incident_date", e.target.value)} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.is_anonymous} onChange={(e) => update("is_anonymous", e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary border-slate-300" />
                  <div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{t("submitAnonymous")}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t("submitAnonymousBody")}</p>
                  </div>
                </label>
                
                <div className="h-px bg-slate-200 w-full" />
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.consent_given} onChange={(e) => update("consent_given", e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary border-slate-300" />
                  <div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{t("dataConsent")} <span className="text-red-400">*</span></span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t("dataConsentBody")}</p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {isGoogleFlow ? (
                <GoogleOAuthProvider clientId={googleClientId}>
                  <GoogleSubmitButton 
                    validateForm={validateForm} 
                    executeSubmit={executeSubmit} 
                    loading={loading} 
                    disabled={!formData.consent_given}
                    feedbackType={feedbackType} 
                    setError={setError} 
                    setLoading={setLoading}
                    t={t}
                  />
                </GoogleOAuthProvider>
              ) : (
                <button type="button" onClick={() => { if(validateForm()) executeSubmit(); }} disabled={loading || !formData.consent_given}
                  className="w-full py-3.5 bg-primary-darker text-white font-bold rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                  {feedbackType === "compliment" ? t("submitCompliment") : t("submitComplaint")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
