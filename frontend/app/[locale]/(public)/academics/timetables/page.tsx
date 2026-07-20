import TimetablesClient from "@/components/TimetablesClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Timetables" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function TimetablesPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Timetables" });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <section className="relative pt-48 pb-32 overflow-hidden bg-primary-darker">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[60%] bg-secondary/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-block border border-orange-500 text-orange-500 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-6">
              {t("eyebrow")}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white mb-8 font-serif tracking-tighter uppercase">
              {t("title")}
            </h1>

            <div className="flex mb-12">
              <div className="w-1.5 bg-[#00a3a1] mr-5 shrink-0" />
              <p className="text-base md:text-lg text-slate-200 font-medium leading-relaxed max-w-2xl py-1">
                {t("body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TimetablesClient />
    </div>
  );
}
