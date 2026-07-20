"use client";

import React from "react";
import { Share2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

export default function ProgrammeActions({ title }: { title: string }) {
  const t = useTranslations("Programmes");

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} | OUK`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("linkCopied"));
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center space-x-8">
      <button 
        onClick={handleShare}
        className="text-slate-500 hover:text-white transition-colors flex items-center group"
        title={t("shareProgramme")}
      >
        <Share2 size={18} />
      </button>
      <button 
        onClick={handlePrint}
        className="text-slate-500 hover:text-white transition-colors flex items-center group"
        title={t("printProspectus")}
      >
        <Printer size={18} />
      </button>
    </div>
  );
}
