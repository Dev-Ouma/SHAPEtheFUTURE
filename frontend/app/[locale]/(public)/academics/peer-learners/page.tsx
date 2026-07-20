import React from "react";
import { getPeerLearners } from "@/lib/api";
import PeerLearnersClient from "@/components/PeerLearnersClient";
import PeerLearnersHero from "@/components/PeerLearnersHero";
import { CheckCircle, Zap, Award, MessageSquare, PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "PeerLearners" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function PeerLearnersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string; search?: string; schoolId?: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "PeerLearners" });
  const learnersData = await getPeerLearners(searchParams);

  const initialLearners = learnersData?.data || [];
  const totalCount = learnersData?.total || 0;
  const totalPages = learnersData?.totalPages || 1;
  const currentPage = parseInt(searchParams.page || "1");

  const steps = [
    { step: "01", title: t("step1Title"), icon: <CheckCircle className="text-primary" />, desc: t("step1Desc") },
    { step: "02", title: t("step2Title"), icon: <MessageSquare className="text-primary" />, desc: t("step2Desc") },
    { step: "03", title: t("step3Title"), icon: <Award className="text-primary" />, desc: t("step3Desc") },
  ];

  const stats = [
    { label: t("statMentors"), value: "150+" },
    { label: t("statGpa"), value: "3.8" },
    { label: t("statHours"), value: "2.4k" },
    { label: t("statSuccess"), value: "98%" },
  ];

  const policies = [
    { title: t("honestyTitle"), desc: t("honestyDesc") },
    { title: t("inclusivityTitle"), desc: t("inclusivityDesc") },
    { title: t("privacyTitle"), desc: t("privacyDesc") },
  ];

  const tiers = [
    { label: t("tierStaff"), desc: t("tierStaffDesc"), color: "bg-blue-500" },
    { label: t("tierPeer"), desc: t("tierPeerDesc"), color: "bg-primary" },
    { label: t("tierAlumni"), desc: t("tierAlumniDesc"), color: "bg-primary-darker" },
    { label: t("tierResearch"), desc: t("tierResearchDesc"), color: "bg-slate-400" },
  ];

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main>
        <PeerLearnersHero initialLearners={initialLearners} totalCount={totalCount} />

        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">
                {t("journeyEyebrow")}
              </h2>
              <h3 className="text-3xl md:text-5xl font-black text-primary-darker uppercase tracking-tight font-serif mb-6 leading-none">
                {t("howTo")} <span className="text-primary italic">{t("connect")}</span>
              </h3>
              <p className="text-slate-500 font-medium">{t("journeyBody")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {steps.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -top-6 -left-6 text-7xl font-black text-slate-200/50 group-hover:text-primary/10 transition-colors z-0 font-serif">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-xl transition-all">
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-black text-primary-darker uppercase tracking-tight mb-4">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PeerLearnersClient
          initialLearners={initialLearners}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
        />

        <section className="py-24 bg-primary-darker overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -mr-40 -mb-40" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-5xl font-black text-white font-serif tracking-tighter italic">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-1/2">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">
                  {t("integrityEyebrow")}
                </h2>
                <h3 className="text-4xl md:text-6xl font-black text-primary-darker uppercase tracking-tighter font-serif mb-10 leading-[0.9]">
                  {t("masteryThrough")} <br />{" "}
                  <span className="text-primary italic">{t("collaborativeEthics")}</span>
                </h3>
                <div className="space-y-8">
                  {policies.map((policy, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                        <Zap className="text-primary" size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.1em] text-primary-darker mb-2">
                          {policy.title}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {policy.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-8 rounded-[32px] hover:shadow-xl transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className={`w-3 h-3 rounded-full ${tier.color} mb-6`} />
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker mb-4">
                      {tier.label}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">
                {t("faqEyebrow")}
              </h2>
              <h3 className="text-3xl md:text-5xl font-black text-primary-darker uppercase tracking-tight font-serif">
                {t("faqTitle")} <span className="text-primary italic">{t("faqTitleAccent")}</span>
              </h3>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black uppercase tracking-tight text-primary-darker mb-3 flex items-start">
                    <span className="text-primary mr-4 shrink-0">Q.</span>
                    {faq.q}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed ml-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white container mx-auto px-6">
          <div className="bg-primary rounded-[48px] p-12 md:p-24 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/60 mb-8">
                {t("ctaEyebrow")}
              </h2>
              <h3 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-10 leading-none">
                {t("ctaTitle")} <br />{" "}
                <span className="italic opacity-80 underline underline-offset-8">
                  {t("ctaTitleAccent")}
                </span>
              </h3>
              <button className="bg-white text-primary px-12 py-6 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center mx-auto">
                <PlusCircle className="mr-4" size={20} />
                {t("applyRegistry")}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
