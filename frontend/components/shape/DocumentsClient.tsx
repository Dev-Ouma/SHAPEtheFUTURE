"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ShapeDocument } from "@/lib/shape-api";
import { SHAPE_DOCUMENT_CATEGORIES } from "@/lib/shape-api";

export default function DocumentsClient({ documents }: { documents: ShapeDocument[] }) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const catOk = category === "All" || d.category === category;
      const query = q.trim().toLowerCase();
      const qOk =
        !query ||
        d.title?.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query) ||
        d.category?.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [documents, category, q]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents..."
            className="w-full border border-slate-200 pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...SHAPE_DOCUMENT_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                category === c
                  ? "bg-primary text-white border-primary"
                  : "border-slate-200 text-slate-500 hover:border-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200">
        {filtered.map((doc) => (
          <div key={doc.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                {[doc.category, doc.work_package].filter(Boolean).join(" · ")}
              </p>
              <h3 className="font-serif text-lg font-black text-primary-darker uppercase tracking-tight">
                {doc.title}
              </h3>
              {doc.description ? (
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">{doc.description}</p>
              ) : null}
            </div>
            {doc.file_url ? (
              <a
                href={doc.file_url}
                className="shrink-0 text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
              >
                Download →
              </a>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Coming soon
              </span>
            )}
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-slate-400 text-sm">No documents match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
