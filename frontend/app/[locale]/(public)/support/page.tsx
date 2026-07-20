import React from "react";
import { Link } from "@/i18n/routing";
import { Building2, MonitorSmartphone, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Helpdesk" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function SupportHubPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Helpdesk" });

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <section className="relative bg-primary-darker pt-32 pb-24 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-campus.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-primary-darker opacity-80" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-[10px] uppercase font-black tracking-widest mb-6">
              {t("serviceDesk")}
            </span>
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              {t("chooseSupport")}
            </h1>
            <p className="text-lg lg:text-xl text-white/80 font-medium leading-relaxed max-w-2xl">
              {t("chooseSupportBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 relative z-20 -mt-10 lg:-mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl">
          <Link
            href="/about/campus-feedback"
            className="group bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 hover:border-teal-300 hover:shadow-2xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <Building2 size={24} />
            </div>
            <h2 className="text-xl font-black text-primary-darker mb-2 tracking-tight">
              {t("generalHelpdesk")}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">
              {t("generalHelpdeskBody")}
            </p>
            <p className="text-xs text-slate-400 font-medium mb-6">
              {t("generalHelpdeskNote")}
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 group-hover:gap-3 transition-all">
              {t("openCampusFeedback")} <ArrowRight size={16} />
            </span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5">
              <MonitorSmartphone size={24} />
            </div>
            <h2 className="text-xl font-black text-primary-darker mb-2 tracking-tight">
              {t("ictSupport")}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">
              {t("ictSupportBody")}
            </p>
            <p className="text-xs text-slate-400 font-medium mb-6">
              {t("ictSupportNote")}
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside font-medium mb-2">
              <li>{t("ictBullet1")}</li>
              <li>{t("ictBullet2")}</li>
              <li>{t("ictBullet3")}</li>
              <li>{t("ictBullet4")}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
