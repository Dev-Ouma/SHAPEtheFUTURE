import React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Legal" });
  return {
    title: t("termsMetaTitle"),
    description: t("termsMetaDesc"),
  };
}

export default async function TermsPage({ params }: { params: { locale: string } }) {
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
            <FileText size={32} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">{t("termsTitle")}</h1>
          <div className="prose prose-slate prose-p:leading-relaxed max-w-none text-slate-600">
            <p className="text-lg font-medium text-slate-500 mb-8">{t("effectiveDate")}</p>

            <h3>{t("termsAcceptH")}</h3>
            <p>{t("termsAcceptP")}</p>

            <h3>{t("termsUseH")}</h3>
            <p>{t("termsUseP")}</p>

            <h3>{t("termsIpH")}</h3>
            <p>{t("termsIpP")}</p>

            <h3>{t("termsLiabilityH")}</h3>
            <p>{t("termsLiabilityP")}</p>

            <h3>{t("termsAmendH")}</h3>
            <p>{t("termsAmendP")}</p>

            <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="m-0 text-sm font-medium">
                {t.rich("termsContact", {
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
