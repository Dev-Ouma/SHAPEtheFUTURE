"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Save, RefreshCw } from "lucide-react";
import { getApi, postApi } from "@/lib/api";

const HOME_KEYS = [
  { key: "site_name", label: "Site name", type: "text" },
  { key: "shape_hero_eyebrow", label: "Hero eyebrow", type: "text" },
  { key: "shape_hero_title", label: "Hero title (brand)", type: "text" },
  { key: "shape_hero_text", label: "Hero supporting text", type: "textarea" },
  { key: "shape_intro", label: "Intro paragraph (below hero)", type: "textarea" },
  { key: "shape_acronym", label: "Project Information — Acronym", type: "textarea" },
  { key: "shape_erasmus_call", label: "Project Information — Erasmus+ Call", type: "textarea" },
  {
    key: "shape_objectives_json",
    label: "Objectives JSON (array of {title, text})",
    type: "textarea",
  },
  { key: "shape_overview", label: "Project Overview text", type: "textarea" },
  { key: "shape_overview_image", label: "Overview image URL", type: "text" },
  { key: "contact_email", label: "Contact email", type: "text" },
] as const;

export default function ShapeHomeAdminPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getApi("/settings");
      const next: Record<string, string> = {};
      for (const row of HOME_KEYS) {
        next[row.key] = String((data && data[row.key]) ?? "");
      }
      setValues(next);
    } catch {
      toast.error("Could not load homepage settings");
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
      // Validate objectives JSON if present
      if (values.shape_objectives_json?.trim()) {
        const parsed = JSON.parse(values.shape_objectives_json);
        if (!Array.isArray(parsed)) throw new Error("Objectives must be a JSON array");
      }
      await postApi("/settings/bulk", values);
      toast.success("Homepage saved — public site will refresh within ~2 minutes");
    } catch (err: any) {
      toast.error(err?.message || "Save failed — check objectives JSON");
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
            Homepage Content
          </h1>
          <p className="text-slate-500 text-sm mt-2 normal-case tracking-normal">
            Edits here drive the public SHAPE Grant Portal homepage
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
        <div className="bg-white border border-slate-200 p-6 space-y-5">
          {HOME_KEYS.map((field) => (
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
      )}
    </div>
  );
}
