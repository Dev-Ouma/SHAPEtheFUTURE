"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Save, RefreshCw } from "lucide-react";
import { getApi, postApi } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import { DEFAULT_RELATED_TERMS } from "@/lib/searchHighlight";
import { NEWS_HUB_DEFAULTS } from "@/lib/shape-api";

const TEXT_KEYS = [
  { key: "site_name", label: "Site name", type: "text" as const },
  { key: "shape_hero_eyebrow", label: "Homepage — Hero eyebrow", type: "text" as const },
  { key: "shape_hero_title", label: "Homepage — Hero title (brand)", type: "text" as const },
  { key: "shape_hero_text", label: "Homepage — Hero supporting text", type: "textarea" as const },
  { key: "shape_intro", label: "Homepage — Intro paragraph", type: "textarea" as const },
  { key: "shape_acronym", label: "The Project — Acronym (fact sheet)", type: "textarea" as const },
  { key: "shape_erasmus_call", label: "The Project — Erasmus+ Call (fact sheet)", type: "textarea" as const },
  {
    key: "shape_objectives_json",
    label: "The Project — Objectives JSON (array of {title, text})",
    type: "textarea" as const,
  },
  { key: "shape_overview", label: "The Project — Overview text", type: "textarea" as const },
  { key: "contact_email", label: "Contact email", type: "text" as const },
  { key: "news_hub_eyebrow", label: "News hub — Eyebrow", type: "text" as const },
  { key: "news_hub_title", label: "News hub — Title", type: "text" as const },
  { key: "news_hub_title_accent", label: "News hub — Title accent", type: "text" as const },
  { key: "news_hub_subtitle", label: "News hub — Subtitle", type: "textarea" as const },
  {
    key: "news_hub_search_hint",
    label: 'News hub — Search hint (use {query} placeholder)',
    type: "text" as const,
  },
  { key: "news_hub_ticker_label", label: "News hub — Ticker label", type: "text" as const },
  { key: "work_packages_eyebrow", label: "Work packages — Eyebrow", type: "text" as const },
  { key: "work_packages_title", label: "Work packages — Title", type: "text" as const },
  {
    key: "work_packages_subtitle",
    label: "Work packages — Subtitle",
    type: "textarea" as const,
  },
] as const;

const IMAGE_KEYS = [
  { key: "shape_overview_image", label: "The Project / Homepage — Overview image" },
  { key: "news_hub_image_tablet", label: "News hub — 3D tablet visual" },
  { key: "news_hub_image_orb", label: "News hub — 3D search orb" },
  { key: "news_hub_image_cards", label: "News hub — 3D cards stack" },
] as const;

const ALL_KEYS = [
  ...TEXT_KEYS.map((f) => f.key),
  ...IMAGE_KEYS.map((f) => f.key),
  "search_related_terms_json",
];

export default function ShapeHomeAdminPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getApi("/settings");
      const next: Record<string, string> = {};
      for (const key of ALL_KEYS) {
        let val = String((data && data[key]) ?? "");
        if (!val && key in NEWS_HUB_DEFAULTS) {
          val = String((NEWS_HUB_DEFAULTS as Record<string, string>)[key] || "");
        }
        if (!val && key === "search_related_terms_json") {
          val = JSON.stringify(DEFAULT_RELATED_TERMS, null, 2);
        }
        next[key] = val;
      }
      // Pretty-print JSON fields for editors
      if (next.shape_objectives_json) {
        try {
          next.shape_objectives_json = JSON.stringify(
            JSON.parse(next.shape_objectives_json),
            null,
            2,
          );
        } catch {
          /* keep raw */
        }
      }
      if (next.search_related_terms_json) {
        try {
          next.search_related_terms_json = JSON.stringify(
            JSON.parse(next.search_related_terms_json),
            null,
            2,
          );
        } catch {
          /* keep raw */
        }
      }
      setValues(next);
    } catch {
      toast.error("Could not load portal content settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (values.shape_objectives_json?.trim()) {
        const parsed = JSON.parse(values.shape_objectives_json);
        if (!Array.isArray(parsed)) throw new Error("Objectives must be a JSON array");
      }
      if (values.search_related_terms_json?.trim()) {
        const parsed = JSON.parse(values.search_related_terms_json);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Related terms must be a JSON object");
        }
      }
      // Persist compact JSON
      const payload = {
        ...values,
        shape_objectives_json: values.shape_objectives_json?.trim()
          ? JSON.stringify(JSON.parse(values.shape_objectives_json))
          : "",
        search_related_terms_json: values.search_related_terms_json?.trim()
          ? JSON.stringify(JSON.parse(values.search_related_terms_json))
          : "",
      };
      await postApi("/settings/bulk", payload);
      toast.success("Saved — public site refreshes within ~2 minutes (or hard-refresh)");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Save failed — check JSON fields");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
            SHAPE CMS
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-primary-darker tracking-tight uppercase">
            The Project &amp; Home
          </h1>
          <p className="text-slate-500 text-sm mt-2 normal-case tracking-normal">
            The Project fact sheet, homepage, news hub visuals, and search related-terms — stored in the
            database
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={load}
            className="border border-slate-200 px-4 py-3 text-slate-500 hover:text-primary"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            disabled={saving || loading}
            onClick={save}
            className="bg-primary text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-secondary disabled:opacity-60"
          >
            <Save size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 p-6 space-y-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
              Copy &amp; text
            </p>
            {TEXT_KEYS.map((field) => (
              <label key={field.key} className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {field.label}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    className="w-full border border-slate-200 px-3 py-2 text-sm min-h-[110px] outline-none focus:border-primary font-mono"
                    value={values[field.key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    className="w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    value={values[field.key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  />
                )}
              </label>
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
              Images (upload or URL — stored in DB)
            </p>
            {IMAGE_KEYS.map((field) => (
              <ImageUploader
                key={field.key}
                label={field.label}
                value={values[field.key] || ""}
                onChange={(val) => setValues((prev) => ({ ...prev, [field.key]: val }))}
              />
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
              Search related terms (JSON)
            </p>
            <p className="text-xs text-slate-500 normal-case tracking-normal">
              Map each search token to related phrases highlighted across the site and PMIS. Example:
              searching <code className="font-mono text-primary">ouk</code> also marks “Open
              University of Kenya”.
            </p>
            <textarea
              className="w-full border border-slate-200 px-3 py-2 text-sm min-h-[280px] outline-none focus:border-primary font-mono"
              value={values.search_related_terms_json || ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  search_related_terms_json: e.target.value,
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
