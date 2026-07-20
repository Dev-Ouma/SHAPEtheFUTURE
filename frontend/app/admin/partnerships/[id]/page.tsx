"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, Globe, Handshake } from "lucide-react";
import { getApi, patchApi, postApi, resolveImageUrl } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditPartnershipPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === "new";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    slug: "",
    website_url: "",
    logo_url: "",
    description: "",
    partnership_type: "Academic",
    categoryId: null,
    is_featured: false,
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    const init = async () => {
      const cats = await getApi("/partnerships/categories");
      setCategories(cats || []);

      if (!isNew) {
        try {
          const data = await getApi(`/partnerships/${id}`);
          setForm({ ...data, categoryId: data.category?.id || null });
        } catch {
          toast.error("Failed to load partnership record");
          router.push("/admin/partnerships");
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await postApi("/partnerships", form);
        toast.success("Strategic alliance established");
      } else {
        await patchApi(`/partnerships/${id}`, form);
        toast.success("Partnership record synchronised");
      }
      router.push("/admin/partnerships");
    } catch {
      toast.error("Orchestration failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronising Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-10">
        <div className="flex items-center space-x-6">
          <Link
            href="/admin/partnerships"
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Handshake size={18} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Strategic Network Configuration
              </span>
            </div>
            <h1 className="text-4xl font-black text-primary-darker tracking-tighter uppercase font-serif">
              {isNew ? "Establish" : "Modify"}{" "}
              <span className="text-primary">Institutional Partnership</span>
            </h1>
          </div>
        </div>

        <button
          form="partnership-form"
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white px-12 py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all flex items-center space-x-4 disabled:opacity-60"
        >
          <Save size={18} />
          <span>{saving ? "Synchronising..." : "Synchronise Record"}</span>
        </button>
      </div>

      {/* Form */}
      <form id="partnership-form" onSubmit={handleSubmit} className="space-y-10 max-w-5xl">
        {/* Identity */}
        <div className="bg-white border border-slate-100 shadow-sm">
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Identity</h3>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Partner Institutional Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setForm({ ...form, name, slug });
                }}
                className="w-full px-6 py-4 bg-slate-50 border-none text-sm font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
                placeholder="e.g. SAFARICOM PLC"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Resource Locator (Slug)</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-none text-sm font-bold tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
                placeholder="e.g. safaricom-plc"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white border border-slate-100 shadow-sm">
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Alliance Classification</h3>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alliance Category</label>
              <select
                value={form.categoryId || ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value ? +e.target.value : null })}
                className="w-full px-6 py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Institutional Type</label>
              <select
                value={form.partnership_type}
                onChange={(e) => setForm({ ...form, partnership_type: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
              >
                {["Academic", "Government", "Industry", "Research", "Community", "Technology"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Website URL</label>
              <input
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border-none text-[10px] font-bold tracking-widest outline-none focus:ring-4 focus:ring-primary/5"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-slate-100 shadow-sm">
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Strategic Collaboration Description</h3>
          </div>
          <div className="p-10">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border-none text-xs font-medium leading-relaxed outline-none focus:ring-4 focus:ring-primary/5 resize-none"
              placeholder="Describe the scope and impact of this institutional collaboration..."
            />
          </div>
        </div>

        {/* Logo & Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-100 shadow-sm">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/40">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Institutional Identity (Logo)</h3>
            </div>
            <div className="p-10">
              <ImageUploader
                label=""
                value={form.logo_url}
                onChange={(val) => setForm({ ...form, logo_url: val })}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/40">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Visibility Settings</h3>
            </div>
            <div className="p-10 space-y-6">
              {[
                { key: "is_featured", label: "Featured Partner", desc: "Display on homepage showcase" },
                { key: "is_active", label: "Operational Status", desc: "Appear in the public partner registry" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker block">{label}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, [key]: !form[key] })}
                    className={`w-12 h-6 rounded-full transition-all relative ${form[key] ? "bg-primary" : "bg-slate-300"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[key] ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            href="/admin/partnerships"
            className="px-10 py-5 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-primary-darker transition-colors"
          >
            Abort Configuration
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white px-12 py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all flex items-center space-x-4 disabled:opacity-60"
          >
            <Save size={18} />
            <span>{saving ? "Synchronising..." : "Synchronise Record"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
