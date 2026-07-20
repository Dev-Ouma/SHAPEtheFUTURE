"use client";

import React from "react";
import { useTranslations } from "next-intl";
import AlumniLayout from "@/components/alumni/AlumniLayout";
import AlumniDirectory from "@/components/alumni/AlumniDirectory";

export default function AlumniDirectoryPage() {
  const t = useTranslations("Alumni");

  return (
    <AlumniLayout>
      <div className="bg-primary-dark pt-32 pb-24 border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">{t("directoryPageEyebrow")}</h2>
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic">{t("directoryPageTitle")} <span className="text-secondary not-italic">{t("directoryPageAccent")}</span></h1>
            </div>
         </div>
      </div>
      <AlumniDirectory />
    </AlumniLayout>
  );
}
