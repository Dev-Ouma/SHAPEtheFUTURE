import React from "react";
import { Link } from "@/i18n/routing";
import { Shield, Lock, FileText, Settings, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ManageCookiesButton from "./ManageCookiesButton";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Legal" });
  return {
    title: t("centerMetaTitle"),
    description: t("centerMetaDesc"),
  };
}

export default async function PrivacyCenterPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Legal" });

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="container mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black text-primary-darker uppercase tracking-tighter mb-4">{t("centerTitle")}</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            {t("centerBody")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">{t("centerPolicyTitle")}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {t("centerPolicyBody")}
              </p>
              <Link href="/privacy" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-darker flex items-center gap-2">
                {t("centerReadPolicy")} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">{t("centerCookiesTitle")}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {t("centerCookiesBody")}
              </p>
              <ManageCookiesButton label={t("centerManageCookies")} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">{t("centerRightsTitle")}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {t("centerRightsBody")}
              </p>
              <a href="mailto:dpo@ouk.ac.ke" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-darker flex items-center gap-2">
                {t("centerContactDpo")} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
