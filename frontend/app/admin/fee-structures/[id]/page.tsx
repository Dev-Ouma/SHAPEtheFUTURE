"use client";

import React, { useEffect, useState } from "react";
import { Save, ArrowLeft, Loader2, Table } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFeeStructure, postApi, patchApi } from "@/lib/api";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";

export default function FeeStructureEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  
  const [form, setForm] = useState({
    category: "",
    order_index: 0,
    content: "",
    is_active: true
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadStructure();
    }
  }, [params.id]);

  const loadStructure = async () => {
    try {
      const data = await getFeeStructure(params.id);
      if (data) setForm(data);
    } catch (err) {
      toast.error("Failed to load fee structure");
      router.push("/admin/fee-structures");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.category.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    setSaving(true);
    try {
      if (isNew) {
        await postApi("/fee-structures", form);
        toast.success("Created successfully");
        router.push("/admin/fee-structures");
      } else {
        await patchApi(`/fee-structures/${params.id}`, form);
        toast.success("Updated successfully");
      }
    } catch (err) {
      toast.error("Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading editor...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/fee-structures" className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:border-primary text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
              {isNew ? "Create Fee Structure" : "Edit Fee Structure"}
            </h1>
            <p className="text-slate-500 font-medium">Configure table layout and categories</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 font-black uppercase tracking-widest text-[10px] hover:bg-primary-darker transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-primary/20"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
               <Table className="text-primary" size={20} />
               <h2 className="text-sm font-black uppercase tracking-widest text-primary-darker">Table Content Editor</h2>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                HTML Table Content <span className="text-rose-500">*</span>
              </label>
              <div className="p-4 bg-blue-50 text-blue-800 text-xs font-medium border border-blue-100 rounded-sm mb-4 leading-relaxed">
                Tip: You can copy and paste tables directly from Excel, Word, or the old OUK website into this editor. It will automatically convert them into responsive HTML tables. You can also use the table icon in the toolbar below to construct one manually.
              </div>
              <RichTextEditor 
                content={form.content} 
                onChange={(html) => setForm({ ...form, content: html })} 
                placeholder="Paste or build your fee structure table here..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category / Tab Name <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                placeholder="e.g. Bachelors Programmes"
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Order (Lower appears first)</label>
              <input 
                type="number" 
                value={form.order_index}
                onChange={e => setForm({...form, order_index: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
              />
            </div>

            <label className="flex items-center gap-3 p-4 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={form.is_active}
                onChange={e => setForm({...form, is_active: e.target.checked})}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold text-slate-700">Published to Public</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
