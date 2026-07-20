"use client";

import React from "react";
import StudentLayout from "@/components/students/StudentLayout";
import { Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

export default function StudentDownloadsPage() {
  const t = useTranslations("Students");

  const forms = [
    { title: t("formDeferment"), category: t("formCatAcademic") },
    { title: t("formWithdrawal"), category: t("formCatAcademic") },
    { title: t("formFinancialAid"), category: t("formCatFinance") },
    { title: t("formTransfer"), category: t("formCatAdmin") },
    { title: t("formClearance"), category: t("formCatGraduation") },
  ];

  return (
    <StudentLayout>
      <div className="bg-primary-darker pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6 text-left">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("downloadsEyebrow")}</h2>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{t("downloadsTitle")} <span className="text-secondary not-italic">{t("downloadsTitleAccent")}</span></h1>
            </div>
         </div>
      </div>

      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {forms.map((form, i) => (
                 <div key={i} className="p-8 bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-white shadow-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <FileText size={24} />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-secondary">{form.category}</span>
                          <h4 className="text-xl font-black uppercase tracking-tight text-primary-dark">{form.title}</h4>
                       </div>
                    </div>
                    <button className="p-4 border-2 border-slate-100 text-slate-300 group-hover:text-secondary group-hover:border-secondary transition-all">
                       <Download size={20} />
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </StudentLayout>
  );
}
