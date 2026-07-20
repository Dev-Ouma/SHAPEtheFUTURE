"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Download, Building2, Clock } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { getApiCached } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import SectionHubLayout from "@/components/layouts/SectionHubLayout";
import { useLocale, useTranslations } from "next-intl";

export default function TenderDetailClient({
  initialTender = null,
  slug: slugProp,
}: {
  initialTender?: any;
  slug: string;
}) {
  const t = useTranslations("Tenders");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = slugProp || (params.slug as string);

  const [tender, setTender] = useState<any>(initialTender);
  const [loading, setLoading] = useState(!initialTender);

  useEffect(() => {
    if (initialTender || !slug) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getApiCached(
          `/tenders/${slug}?locale=${encodeURIComponent(locale)}`,
          { revalidate: 120 },
        );
        if (!cancelled) setTender(data);
      } catch (err) {
        console.error("Failed to load tender details:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, locale, initialTender]);

  const statusLabel = (status: string) => {
    if (status === "Open") return t("statusOpen");
    if (status === "Closed") return t("statusClosed");
    if (status === "Awarded") return t("statusAwarded");
    return status;
  };

  const dateLocale = locale === "sw" ? "sw-KE" : "en-GB";

  if (loading) {
    return (
      <SectionHubLayout page={{ title: t("loadingTender"), summary: "", content: "" }} parentSlug="about">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SectionHubLayout>
    );
  }

  if (!tender) {
    return (
      <SectionHubLayout page={{ title: t("notFoundTitle"), summary: "", content: "" }} parentSlug="about">
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
          <FileText size={64} className="text-slate-200 mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter text-primary-darker mb-4">{t("notFoundTitle")}</h2>
          <p className="text-slate-500 mb-8 max-w-md">{t("notFoundBody")}</p>
          <button 
            onClick={() => router.push('/tenders')}
            className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-darker transition-colors flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>{t("backToTenders")}</span>
          </button>
        </div>
      </SectionHubLayout>
    );
  }

  const pageHeader = {
    title: tender.title,
    summary: t("detailSummary"),
    content: ""
  };

  return (
    <SectionHubLayout page={pageHeader} parentSlug="about">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <Link 
          href="/tenders"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          <span>{t("portal")}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest">
                  {tender.referenceNumber}
                </span>
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                  tender.status === 'Open' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {statusLabel(tender.status)}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-primary-darker leading-[1.1]">
                {tender.title}
              </h1>
            </div>

            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-primary">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(tender.description) }} />
            </div>

            {tender.documents && tender.documents.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-darker mb-6 flex items-center gap-2">
                  <Download size={16} className="text-primary" />
                  {t("officialDocuments")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tender.documents.map((doc: any) => (
                    <a 
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 p-4 bg-white border border-slate-200 hover:border-primary transition-colors group"
                    >
                      <div className="p-3 bg-slate-50 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{doc.title}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">{doc.documentType}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="bg-white border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-darker mb-8 border-b border-slate-100 pb-4">
                {t("timelineDetails")}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Calendar size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("publishedDate")}</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {new Date(tender.publishedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock size={18} className="text-red-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("closingDate")}</p>
                    <p className="text-sm font-bold text-red-600 mt-1">
                      {new Date(tender.closingAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {new Date(tender.closingAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })} {t("eat")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Building2 size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("issuingEntity")}</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {tender.department?.name || t("centralProcurement")}
                    </p>
                  </div>
                </div>

                {tender.category && (
                  <div className="flex items-start space-x-4">
                    <FileText size={18} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("category")}</p>
                      <p className="text-sm font-medium text-slate-800 mt-1">
                        {tender.category.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary-darker text-white p-8">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic">{t("submissionGuide")}</h3>
              <p className="text-xs font-medium leading-relaxed text-slate-300 mb-6">
                {t("submissionBody")}
              </p>
              <button type="button" className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-colors">
                {t("viewInstructions")}
              </button>
            </div>
          </aside>
        </div>

      </div>
    </SectionHubLayout>
  );
}
