"use client";

import React, { useState } from "react";
import { Copy, Check, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

interface CitationProps {
  publication: any;
}

export default function CitationGenerator({ publication }: CitationProps) {
  const t = useTranslations("Research");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const authors =
    (Array.isArray(publication.staff_authors)
      ? publication.staff_authors.map((a: any) => a.full_name).join(", ")
      : "") ||
    publication.external_authors ||
    t("anonymous");
  const year = publication.publication_year || "n.d.";
  const title = publication.title;
  const journal = publication.journal_name || publication.publisher || t("oukResearchArchive");
  const volume = publication.volume;
  const issue = publication.issue;
  const pages = publication.pages;
  const doi = publication.doi;

  const formats = [
    {
      id: "APA",
      text: `${authors} (${year}). ${title}. ${journal}${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`,
    },
    {
      id: "MLA",
      text: `${authors}. "${title}." ${journal}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}, ${year}${pages ? `, pp. ${pages}` : ""}.`,
    },
    {
      id: "Harvard",
      text: `${authors}, ${year}. ${title}. ${journal}${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, pp.${pages}` : ""}.`,
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(id);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="bg-slate-50 border border-slate-100 p-10 mt-12 group">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200">
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary-darker mb-1">
            {t("scholarlyCitations")}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {t("autoMetadata")}
          </p>
        </div>
        <div className="w-12 h-12 bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-[#ff7f50] group-hover:text-white transition-all">
          <Quote size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {formats.map((format) => (
          <div key={format.id} className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-[#037b90] uppercase tracking-[0.2em] px-3 py-1 bg-[#037b90]/5 border border-[#037b90]/10">
                {t("styleLabel", { format: format.id })}
              </span>
              <button
                onClick={() => copyToClipboard(format.text, format.id)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-darker transition-colors"
              >
                {copiedFormat === format.id ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiedFormat === format.id ? t("copied") : t("copy")}</span>
              </button>
            </div>
            <div className="p-6 bg-white border border-slate-100 text-[13px] text-slate-600 font-medium leading-[1.8] shadow-sm select-all">
              {format.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
