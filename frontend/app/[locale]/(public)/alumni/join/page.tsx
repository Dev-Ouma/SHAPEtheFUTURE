"use client";

import React, { useState, useEffect } from "react";
import AlumniLayout from "@/components/alumni/AlumniLayout";
import { UserPlus, Briefcase, GraduationCap, Link as LinkIcon, CheckCircle, Shield, Building2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getApiCached, postApi } from "@/lib/api";
import { toast } from "react-hot-toast";

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "South Sudan", "Ethiopia", "Somalia", 
  "Nigeria", "Ghana", "South Africa", "Egypt", "Morocco", "United States", "United Kingdom", 
  "Canada", "Australia", "Germany", "France", "United Arab Emirates", "India", "China", "Japan"
].sort();

const INDUSTRIES = [
  "Technology & Software", "Finance & Banking", "Healthcare & Medicine", "Education & Research",
  "Engineering & Manufacturing", "Government & Public Sector", "Media & Entertainment", 
  "Legal Services", "Consulting & Management", "Non-Profit & NGO", "Real Estate & Construction",
  "Agriculture & Environmental", "Telecommunications", "Retail & E-commerce"
].sort();

export default function JoinNetworkPage() {
  const t = useTranslations("Alumni");
  const [formData, setFormData] = useState<any>({});
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await getApiCached("/programmes?limit=100", { revalidate: 300 });
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setProgrammes(
          rows
            .map((p: any) => p.title || p.name)
            .filter((name: string) => typeof name === "string" && name.trim()),
        );
      } catch (err) {
        console.error("Failed to fetch programmes", err);
      }
    };
    fetchProgrammes();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await postApi('/alumni/join', formData);
      setIsSuccess(true);
      toast.success(t("joinToastSuccess"));
    } catch (error) {
      toast.error(t("joinToastFail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AlumniLayout>
        <div className="max-w-3xl mx-auto py-24 px-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-4xl font-black text-primary-dark tracking-tight mb-4">{t("joinSuccessTitle")}</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              {t("joinSuccessBody")}
            </p>
            <Link 
              href="/alumni"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-secondary transition-colors"
            >
              {t("returnAlumniPortal")}
            </Link>
          </div>
        </div>
      </AlumniLayout>
    );
  }

  return (
    <AlumniLayout>
      <div className="bg-primary-dark pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} className="text-primary-light" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            {t("joinPageTitle")}
          </h1>
          <p className="text-slate-300 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("joinPageBody")}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 pb-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-hidden">
          
          <div className="bg-amber-50 border-b border-amber-100 p-6 flex gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Shield size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-amber-900">{t("verificationNotice")}</h3>
              <p className="text-sm font-medium text-amber-700 mt-1">
                {t("verificationBody")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <GraduationCap className="text-primary" />
                <h3 className="text-lg font-black tracking-tight text-primary-dark">{t("academicInfo")}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("fullName")}</label>
                  <input required placeholder={t("nameOnCert")} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("studentNumber")}</label>
                  <input required placeholder={t("studentNumberPlaceholder")} value={formData.studentNumber || ''} onChange={e => handleChange('studentNumber', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("graduationYear")}</label>
                  <input required type="number" placeholder={t("yearPlaceholder")} value={formData.graduationYear || ''} onChange={e => handleChange('graduationYear', parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("programmeOfStudy")}</label>
                  <input 
                    list="join-programmes"
                    required 
                    value={formData.programme || ''} 
                    onChange={e => handleChange('programme', e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" 
                    placeholder={t("searchProgramme")}
                  />
                  <datalist id="join-programmes">
                    {programmes.map((p, i) => <option key={i} value={p} />)}
                  </datalist>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Briefcase className="text-primary" />
                <h3 className="text-lg font-black tracking-tight text-primary-dark">{t("professionalInfo")}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("industryLabel")}</label>
                  <input 
                    list="join-industries"
                    required 
                    value={formData.industry || ''} 
                    onChange={e => handleChange('industry', e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" 
                    placeholder={t("searchIndustry")}
                  />
                  <datalist id="join-industries">
                    {INDUSTRIES.map(i => <option key={i} value={i} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("employerLabel")}</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={formData.employer || ''} onChange={e => handleChange('employer', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 focus:ring-primary outline-none font-medium" placeholder={t("companyName")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("currentCountry")}</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      list="join-countries"
                      required 
                      value={formData.country || ''} 
                      onChange={e => handleChange('country', e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 focus:ring-2 focus:ring-primary outline-none font-medium" 
                      placeholder={t("searchCountry")}
                    />
                    <datalist id="join-countries">
                      {COUNTRIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <LinkIcon className="text-primary" />
                <h3 className="text-lg font-black tracking-tight text-primary-dark">{t("socialLinks")}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("linkedinUrl")}</label>
                  <input type="url" value={formData.linkedIn || ''} onChange={e => handleChange('linkedIn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("twitterHandle")}</label>
                  <input value={formData.twitter || ''} onChange={e => handleChange('twitter', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium" placeholder="@handle" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("briefBio")}</label>
                  <textarea value={formData.bio || ''} onChange={e => handleChange('bio', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none font-medium min-h-[100px]" placeholder={t("bioPlaceholder")} />
                </div>
              </div>
            </section>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgb(0,0,0,0.18)]"
              >
                {isSubmitting ? t("submittingRegistration") : t("submitRegistration")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AlumniLayout>
  );
}
