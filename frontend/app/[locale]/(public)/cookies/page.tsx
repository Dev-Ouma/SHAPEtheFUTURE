import React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Cookie } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Legal" });
  return {
    title: t("cookiesMetaTitle"),
    description: t("cookiesMetaDesc"),
  };
}

export default async function CookiesPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Legal" });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/sitemap" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary mb-12 transition-colors">
          <ArrowLeft size={16} />
          <span>{t("backToSitemap")}</span>
        </Link>

        <div className="bg-white rounded-3xl p-10 md:p-16 border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8">
            <Cookie size={32} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">{t("cookiesTitle")}</h1>
          <div className="prose prose-slate prose-p:leading-relaxed max-w-none text-slate-600">
            <p className="text-lg font-medium text-slate-500 mb-8">{t("effectiveDate")}</p>

            <h3>{t("cookiesWhatH")}</h3>
            <p>{t("cookiesWhatP")}</p>

            <h3>{t("cookiesHowH")}</h3>
            <p>{t("cookiesHowP")}</p>

            <h3>{t("cookiesTypesH")}</h3>
            <ul>
              <li><strong>{t("cookiesEssential")}</strong> {t("cookiesEssentialDesc")}</li>
              <li><strong>{t("cookiesPreference")}</strong> {t("cookiesPreferenceDesc")}</li>
              <li><strong>{t("cookiesAnalytics")}</strong> {t("cookiesAnalyticsDesc")}</li>
            </ul>

            <h3>{t("cookiesManageH")}</h3>
            <p>{t("cookiesManageP")}</p>

            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="m-0 text-sm font-medium">
                {t.rich("cookiesContact", {
                  email: (chunks) => <strong className="text-primary">{chunks}</strong>,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
