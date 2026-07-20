import React from "react";
import { Wallet } from "lucide-react";
import AdmissionsCTA from "@/components/AdmissionsCTA";
import FeeStructuresDashboard from "@/components/FeeStructuresDashboard";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600; // 1 hr ISR

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Admissions" });
  return {
    title: t("feesHeroTitle") + " | Open University of Kenya",
    description: t("feesHeroBody"),
  };
}

export default async function FeeStructurePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Admissions" });

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-primary-darker pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] -mr-80 -mt-80" />
        </div>
        <div className="container mx-auto max-w-7xl relative z-10 text-left">
          <div className="inline-flex items-center space-x-3 mb-8 bg-white/5 px-6 py-2 border border-white/10">
            <Wallet size={16} className="text-secondary" />
            <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">{t("feesAdmissionsFinance")}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8">
            {t("feesHeroTitle")}
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
            {t("feesHeroBody")}
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-16 -mt-16 relative z-20 space-y-16">
        <FeeStructuresDashboard />
      </main>

      <AdmissionsCTA />
    </div>
  );
}
