import React from "react";
import CampusFeedbackForm from "@/components/campus-feedback/CampusFeedbackForm";
import TrackCampusFeedback from "@/components/campus-feedback/TrackCampusFeedback";
import { Building2, ShieldCheck, HelpCircle, Wrench } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Helpdesk" });
  return {
    title: t("fbMetaTitle"),
    description: t("fbMetaDesc"),
  };
}

export default async function CampusFeedbackPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Helpdesk" });

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <section className="relative bg-primary-darker pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-campus.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-primary-darker opacity-80" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-[10px] uppercase font-black tracking-widest mb-6">
              {t("universityHelpdesk")}
            </span>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {t("fbHeroTitle")}
            </h1>
            <p className="text-lg lg:text-xl text-white/80 font-medium leading-relaxed max-w-2xl">
              {t("fbHeroBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 relative z-20 -mt-10 lg:-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-10 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-darker" />
              <div className="mb-8">
                <h2 className="text-2xl font-black text-primary-darker tracking-tight mb-2">
                  {t("submitTitle")}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  {t("submitBody")}
                </p>
              </div>
              <CampusFeedbackForm />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 lg:p-8 border border-slate-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary-darker">{t("trackStatus")}</h3>
              </div>
              <TrackCampusFeedback />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3 text-amber-800">
                <Wrench size={18} />
                <h3 className="font-bold text-sm">{t("ictSidebarTitle")}</h3>
              </div>
              <p className="text-sm text-amber-900/80 mb-3">
                {t("ictSidebarBody")}
              </p>
              <ul className="text-sm text-amber-900/90 space-y-1.5 list-disc list-inside font-medium mb-4">
                <li>{t("ictSide1")}</li>
                <li>{t("ictSide2")}</li>
                <li>{t("ictSide3")}</li>
                <li>{t("ictSide4")}</li>
              </ul>
              <Link href="/support" className="text-sm font-bold text-amber-900 underline underline-offset-2">
                {t("viewSupportChannels")}
              </Link>
            </div>

            <div className="bg-primary-darker rounded-2xl shadow-xl p-6 lg:p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Building2 size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-secondary">
                  <HelpCircle size={18} />
                  {t("ourCommitment")}
                </h3>
                <ul className="space-y-3 text-sm text-white/80 font-medium">
                  <li>{t("commit1")}</li>
                  <li>{t("commit2")}</li>
                  <li>{t("commit3")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
