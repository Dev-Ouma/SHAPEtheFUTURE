"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ShapeDocument } from "@/lib/shape-api";
import { SHAPE_DOCUMENT_CATEGORY_META } from "@/lib/shape-api";
import Highlight from "@/components/Highlight";
import { textMatchesQuery } from "@/lib/searchHighlight";
import { useRelatedTerms } from "@/components/SearchHighlightProvider";
import { AccessibleMedia } from "@/components/accessibility/AccessibleMedia";

function isMediaFile(url?: string, fileType?: string) {
  const t = `${fileType || ""} ${url || ""}`.toLowerCase();
  return /\.(mp4|webm|ogg|mp3|wav|m4a)(\?|$)/i.test(t) || /video|audio/.test(t);
}

export default function DocumentsClient({ documents }: { documents: ShapeDocument[] }) {
  const t = useTranslations("Shape.pages");
  const locale = useLocale();
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const relatedMap = useRelatedTerms();

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const title = locale === "sw" && d.title_sw ? d.title_sw : d.title;
      const description =
        locale === "sw" && d.description_sw ? d.description_sw : d.description;
      const catOk = category === "all" || d.category === category;
      const qOk =
        !q.trim() ||
        textMatchesQuery(title || "", q, relatedMap) ||
        textMatchesQuery(description || "", q, relatedMap) ||
        textMatchesQuery(d.category_label || d.category || "", q, relatedMap);
      return catOk && qOk;
    });
  }, [documents, category, q, relatedMap, locale]);

  const menus = [
    { key: "all", label: t("allCategories") },
    ...SHAPE_DOCUMENT_CATEGORY_META,
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchDocuments")}
            className="w-full border border-slate-200 pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {menus.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                category === c.key
                  ? "bg-primary text-white border-primary"
                  : "border-slate-200 text-slate-500 hover:border-primary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200">
        {filtered.map((doc) => {
          const title = locale === "sw" && doc.title_sw ? doc.title_sw : doc.title;
          const description =
            locale === "sw" && doc.description_sw ? doc.description_sw : doc.description;
          const media = isMediaFile(doc.file_url, doc.file_type);

          return (
            <div key={doc.id} className="p-5 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                    {[doc.category_label || doc.category, doc.work_package]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h3 className="font-serif text-lg font-black text-primary-darker uppercase tracking-tight">
                    <Highlight text={title} query={q} />
                  </h3>
                  {description ? (
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                      <Highlight text={description} query={q} />
                    </p>
                  ) : null}
                </div>
                {doc.file_url && !media ? (
                  <a
                    href={doc.file_url}
                    className="shrink-0 text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
                  >
                    {t("download")} →
                  </a>
                ) : !doc.file_url ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {t("comingSoon")}
                  </span>
                ) : null}
              </div>

              {media && doc.file_url ? (
                <AccessibleMedia
                  title={title}
                  src={doc.file_url}
                  captionsSrc={doc.captions_url}
                  transcript={doc.transcript}
                  signLanguageSrc={doc.sign_language_url}
                />
              ) : null}

              {!media && (doc.transcript || doc.sign_language_url) ? (
                <div className="text-sm text-slate-600 space-y-2">
                  {doc.transcript ? (
                    <details className="border border-slate-100 p-3">
                      <summary className="font-bold cursor-pointer">{t("transcript")}</summary>
                      <div className="mt-2 whitespace-pre-wrap">{doc.transcript}</div>
                    </details>
                  ) : null}
                  {doc.sign_language_url ? (
                    <a
                      href={doc.sign_language_url}
                      className="font-bold text-primary underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("signLanguage")}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm">No documents match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
