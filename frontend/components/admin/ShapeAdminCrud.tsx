"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";

export type ShapeAdminField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select";
  options?: string[];
  required?: boolean;
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
  "gallery_urls",
  "partner_ids",
  "document_urls",
  "tags",
]);

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
    if (!allowed.has(key)) continue;
    if (value === "" || value === undefined) continue;
    if (value === "true") out[key] = true;
    else if (value === "false") out[key] = false;
    else out[key] = value;
  }
  return out;
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
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      columns.some((c) => displayCell(item[c.key]).toLowerCase().includes(q)),
    );
  }, [items, search, columns]);

  const openCreate = () => {
    setCurrent({ ...emptyItem });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    const draft: Record<string, any> = { ...item };
    for (const f of fields) {
      if (typeof draft[f.key] === "boolean") {
        draft[f.key] = draft[f.key] ? "true" : "false";
      }
    }
    setCurrent(draft);
    setShowModal(true);
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
        if (current.id) {
          await patchApi(`/shape/${resource}/${current.id}`, payload);
          toast.success("Updated — public site will refresh on next load");
        } else {
          await postApi(`/shape/${resource}`, payload);
          toast.success("Created — visible on public site when published");
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
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
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
                        {displayCell(item[c.key])}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex p-2 text-slate-400 hover:text-primary"
                        aria-label="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {item.id && !readOnlyCreate ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex p-2 text-slate-400 hover:text-red-600"
                          aria-label="Delete"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-serif text-xl font-black uppercase text-primary-darker">
                {current.id ? "Edit" : "Create"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 text-sm">
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map((f) => (
                <label key={f.key} className="block space-y-1.5">
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
