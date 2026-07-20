import React from "react";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Search, Home, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <section className="bg-primary-darker pt-48 pb-64 px-6 relative overflow-hidden flex-grow flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 -mr-96 -mt-96 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 -ml-64 -mb-64 rounded-full blur-[100px]" />

        <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-12">
          <div className="inline-block px-6 py-2 bg-white/5 border border-white/10 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
            {t("eyebrow")}
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase font-serif">
            {t("title")} <span className="text-secondary">{t("titleAccent")}</span>.
          </h1>

          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {t("body")}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link
              href="/programmes"
              className="w-full md:w-auto bg-primary text-white px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-darker transition-all shadow-2xl shadow-primary/20 flex items-center justify-center space-x-4"
            >
              <Search size={18} />
              <span>{t("exploreCatalog")}</span>
            </Link>
            <Link
              href="/"
              className="w-full md:w-auto border-2 border-white/20 text-white px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-darker transition-all flex items-center justify-center space-x-4"
            >
              <Home size={18} />
              <span>{t("returnHome")}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 border-t border-slate-100">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <BookOpen className="mx-auto text-primary" size={32} />
              <h3 className="font-black uppercase tracking-tight text-primary-darker">{t("programmes")}</h3>
              <p className="text-sm text-slate-500">{t("programmesBody")}</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-0.5 bg-slate-200 mx-auto" />
              <h3 className="font-black uppercase tracking-tight text-primary-darker text-3xl font-serif mt-4">OUK</h3>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{t("brand")}</p>
            </div>
            <div className="space-y-4">
              <ArrowLeft className="mx-auto text-primary" size={32} />
              <h3 className="font-black uppercase tracking-tight text-primary-darker">{t("supportHub")}</h3>
              <p className="text-sm text-slate-500">{t("supportBody")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
