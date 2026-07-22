"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, RefreshCw, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import { deleteApi, getApi, patchApi, postApi, resolveImageUrl } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import Highlight from "@/components/Highlight";
import { textMatchesQuery } from "@/lib/searchHighlight";
import { useRelatedTerms } from "@/components/SearchHighlightProvider";

export type ShapeAdminField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image" | "file" | "partner" | "work_package";
  options?: string[];
  required?: boolean;
  /** Optional authoring hint (shown under the control). */
  hint?: string;
};

type Props = {
  title: string;
  subtitle: string;
  resource: string;
  columns: { key: string; label: string }[];
  fields: ShapeAdminField[];
  emptyItem: Record<string, any>;
  /** Optional: read-only inbox mode (no create). */
  readOnlyCreate?: boolean;
};

const STRIP_ON_SAVE = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
  "leader_partner",
  "host_partner",
  "work_package",
  "partner",
  "partner_ids",
  "document_urls",
  "tags",
  // Virtual CMS slots — folded into gallery_urls in sanitizePayload
  "gallery_image_1",
  "gallery_image_2",
  "gallery_image_3",
  "gallery_image_4",
]);

const GALLERY_SLOT_KEYS = ["gallery_image_1", "gallery_image_2", "gallery_image_3", "gallery_image_4"] as const;

function expandGallerySlots(item: Record<string, any>): Record<string, any> {
  const urls = Array.isArray(item.gallery_urls)
    ? item.gallery_urls.filter((u: unknown) => typeof u === "string" && u.trim())
    : [];
  const next = { ...item };
  GALLERY_SLOT_KEYS.forEach((key, i) => {
    if (next[key] == null || next[key] === "") {
      next[key] = urls[i] || "";
    }
  });
  return next;
}

function collectGalleryUrls(raw: Record<string, any>, fields: ShapeAdminField[]): string[] | undefined {
  const hasSlots = fields.some((f) => GALLERY_SLOT_KEYS.includes(f.key as (typeof GALLERY_SLOT_KEYS)[number]));
  if (!hasSlots) {
    if (Array.isArray(raw.gallery_urls)) return raw.gallery_urls;
    return undefined;
  }
  return GALLERY_SLOT_KEYS.map((k) => raw[k])
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    .map((u) => u.trim());
}

function asList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as any;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function displayCell(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.code) return String(obj.code);
    if (obj.short_name) return String(obj.short_name);
    if (obj.name) return String(obj.name);
    if (obj.title) return String(obj.title);
    return "—";
  }
  return String(value);
}

function sanitizePayload(raw: Record<string, any>, fields: ShapeAdminField[]) {
  const allowed = new Set(fields.map((f) => f.key));
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (STRIP_ON_SAVE.has(key) && key !== "id") continue;
    if (!allowed.has(key) && key !== "gallery_urls") continue;
    if (value === "" || value === undefined) continue;
    if (value === "true") out[key] = true;
    else if (value === "false") out[key] = false;
    else out[key] = value;
  }
  const gallery = collectGalleryUrls(raw, fields);
  if (gallery !== undefined) {
    out.gallery_urls = gallery;
  }
  return out;
}

/** Build a create-ready draft from an existing row (unique slug/code when present). */
function buildDuplicateDraft(item: Record<string, any>, fields: ShapeAdminField[]) {
  const stamp = Date.now().toString(36).slice(-4);
  const draft: Record<string, any> = {};

  for (const f of fields) {
    let value = item[f.key];
    if (value === undefined || value === null) continue;

    if (typeof value === "boolean") {
      draft[f.key] = value ? "true" : "false";
      continue;
    }

    if (f.key === "slug" && typeof value === "string" && value.trim()) {
      draft[f.key] = `${value.replace(/-copy(-[a-z0-9]+)?$/i, "")}-copy-${stamp}`;
      continue;
    }
    if (f.key === "code" && typeof value === "string" && value.trim()) {
      draft[f.key] = `${value}-COPY`;
      continue;
    }
    if ((f.key === "title" || f.key === "name") && typeof value === "string" && value.trim()) {
      draft[f.key] = value.replace(/\s*\(copy( \d+)?\)$/i, "").trim() + " (copy)";
      continue;
    }

    draft[f.key] = value;
  }

  // Never carry identity / relation objects into create
  delete draft.id;
  return draft;
}

export default function ShapeAdminCrud({
  title,
  subtitle,
  resource,
  columns,
  fields,
  emptyItem,
  readOnlyCreate = false,
}: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<Record<string, any>>(emptyItem);
  const [saving, setSaving] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "duplicate">("create");
  const relatedMap = useRelatedTerms();
  const [partnerOptions, setPartnerOptions] = useState<{ id: string; label: string }[]>([]);
  const [wpOptions, setWpOptions] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const needsPartners = fields.some(
      (f) => f.type === "partner" || f.key.includes("partner"),
    );
    const needsWps = fields.some(
      (f) => f.type === "work_package" || f.key === "work_package_id",
    );
    let cancelled = false;
    (async () => {
      try {
        if (needsPartners) {
          const data = await getApi("/shape/partners/admin");
          if (!cancelled) {
            setPartnerOptions(
              asList(data).map((p: any) => ({
                id: String(p.id),
                label: p.short_name ? `${p.short_name} — ${p.name}` : p.name,
              })),
            );
          }
        }
        if (needsWps) {
          const data = await getApi("/shape/work-packages/admin");
          if (!cancelled) {
            setWpOptions(
              asList(data).map((w: any) => ({
                id: String(w.id),
                label: `${w.code || ""} · ${w.title || w.slug}`.trim(),
              })),
            );
          }
        }
      } catch {
        /* pickers optional offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fields]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getApi(`/shape/${resource}/admin`);
      setItems(asList(data));
    } catch {
      try {
        const data = await getApi(`/shape/${resource}`);
        setItems(asList(data));
      } catch {
        setItems([]);
        toast.error(`Could not load ${resource}. Check login permissions.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      columns.some((c) => textMatchesQuery(displayCell(item[c.key]), search, relatedMap)),
    );
  }, [items, search, columns, relatedMap]);

  const openCreate = () => {
    setModalMode("create");
    setCurrent({ ...emptyItem });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    const draft: Record<string, any> = expandGallerySlots({ ...item });
    for (const f of fields) {
      if (typeof draft[f.key] === "boolean") {
        draft[f.key] = draft[f.key] ? "true" : "false";
      }
    }
    setModalMode("edit");
    setCurrent(draft);
    setShowModal(true);
  };

  const openDuplicate = (item: any) => {
    const draft = buildDuplicateDraft(expandGallerySlots({ ...item }), fields);
    setModalMode("duplicate");
    setCurrent(draft);
    setShowModal(true);
    toast.success("Duplicated — review fields, then Save to create the copy");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (resource === "contact") {
        if (!current.id) {
          toast.error("Contact messages are created from the public form");
          return;
        }
        await patchApi(`/shape/contact/${current.id}`, {
          status: current.status || "read",
        });
        toast.success("Status updated");
      } else {
        const payload = sanitizePayload(current, fields);
        // Duplicate / create never send an id
        const isUpdate = Boolean(current.id) && modalMode === "edit";
        if (isUpdate) {
          await patchApi(`/shape/${resource}/${current.id}`, payload);
          toast.success("Updated — public site will refresh on next load");
        } else {
          await postApi(`/shape/${resource}`, payload);
          toast.success(
            modalMode === "duplicate"
              ? "Duplicate created — visible on public site when published"
              : "Created — visible on public site when published",
          );
        }
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteApi(`/shape/${resource}/${id}`);
      toast.success("Deleted");
      fetchItems();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div className="p-8 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
            SHAPE CMS
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 text-sm mt-2">{subtitle}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Changes sync to the public portal via <code className="font-mono">/shape/{resource}</code>
          </p>
          <p className="text-[11px] text-primary mt-2 max-w-xl">
            Accessibility default: write meaningful titles/descriptions, provide alt context for images
            (logos use the partner name), and ensure documents are readable. See{" "}
            <a href="/admin/accessibility" className="underline font-bold">
              Accessibility report
            </a>
            .
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchItems}
            className="border border-slate-200 px-4 py-3 text-slate-500 hover:text-primary"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {!readOnlyCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="bg-primary text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-2 hover:bg-secondary"
            >
              <Plus size={16} /> Add
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        <div className="p-4 border-b border-slate-100 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 outline-none text-sm font-medium"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" role="table">
            <caption className="sr-only">
              {title} records
            </caption>
            <thead>
              <tr className="bg-slate-50/80">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    {c.label}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16 text-center text-slate-400 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No records yet. Backend endpoint: /shape/{resource}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id || JSON.stringify(item)} className="border-t border-slate-50 hover:bg-slate-50/50">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-4 text-sm text-slate-700 max-w-xs truncate">
                        {c.key === "logo_url" && item[c.key] ? (
                          <img
                            src={resolveImageUrl(item[c.key])}
                            alt=""
                            className="h-8 w-auto max-w-[120px] object-contain"
                          />
                        ) : (
                          <Highlight text={displayCell(item[c.key])} query={search} quiet />
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex p-2 text-slate-400 hover:text-primary"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {item.id && !readOnlyCreate ? (
                        <button
                          type="button"
                          onClick={() => openDuplicate(item)}
                          className="inline-flex p-2 text-slate-400 hover:text-primary"
                          aria-label="Duplicate"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                      ) : null}
                      {item.id && !readOnlyCreate ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex p-2 text-slate-400 hover:text-red-600"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shape-crud-dialog-title"
            className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2
                id="shape-crud-dialog-title"
                className="font-serif text-xl font-black uppercase text-primary-darker"
              >
                {modalMode === "edit" ? "Edit" : modalMode === "duplicate" ? "Duplicate" : "Create"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 text-sm"
                aria-label="Close dialog"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              {modalMode === "create" || current.is_published === false || current.is_published === "false" ? (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 px-3 py-2">
                  Draft by default — set <strong>Published</strong> to true when ready for the public site.
                </p>
              ) : null}
              {fields.map((f) => (
                <label key={f.key} className="block space-y-1.5">
                  {f.type === "image" || f.type === "file" ? (
                    <>
                      <ImageUploader
                        label={`${f.label}${f.required ? " *" : ""}`}
                        value={current[f.key] ?? ""}
                        onChange={(val) => setCurrent((p) => ({ ...p, [f.key]: val }))}
                        accept={f.type === "file" ? "*/*" : "image/*"}
                        type={f.type === "file" ? "image" : "image"}
                      />
                      <p className="text-[11px] text-slate-500">
                        {f.hint ||
                          (f.type === "file"
                            ? "Upload a file or paste a URL. Prefer accessible PDFs for documents."
                            : "Public pages use the record name/title as image alternative text.")}
                      </p>
                    </>
                  ) : f.type === "partner" || f.type === "work_package" ? (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {f.label}
                        {f.required ? " *" : ""}
                      </span>
                      <select
                        className="w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                        value={current[f.key] ?? ""}
                        onChange={(e) => setCurrent((p) => ({ ...p, [f.key]: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {(f.type === "partner" ? partnerOptions : wpOptions).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {f.hint ? <p className="text-[11px] text-slate-500">{f.hint}</p> : null}
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {f.label}
                        {f.required ? " *" : ""}
                      </span>
                      {f.type === "textarea" ? (
                        <textarea
                          className="w-full border border-slate-200 px-3 py-2 text-sm min-h-[100px] outline-none focus:border-primary"
                          value={current[f.key] ?? ""}
                          onChange={(e) => setCurrent((p) => ({ ...p, [f.key]: e.target.value }))}
                        />
                      ) : f.type === "select" ? (
                        <select
                          className="w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                          value={current[f.key] ?? ""}
                          onChange={(e) => setCurrent((p) => ({ ...p, [f.key]: e.target.value }))}
                        >
                          <option value="">Select…</option>
                          {(f.options || []).map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          className="w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                          value={current[f.key] ?? ""}
                          onChange={(e) =>
                            setCurrent((p) => ({
                              ...p,
                              [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                            }))
                          }
                        />
                      )}
                      {f.hint ? <p className="text-[11px] text-slate-500">{f.hint}</p> : null}
                    </>
                  )}
                </label>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="bg-primary text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-secondary disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
