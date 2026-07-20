"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderTree, Plus, Edit2, Trash2, Search, 
  Tag, RefreshCw, Layers
} from "lucide-react";
import { getApi, postApi, deleteApi, putApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import LegacyAdminFallbackBanner from "@/components/admin/LegacyAdminFallbackBanner";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getApi('/complaints/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subcategories?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-24">
      <LegacyAdminFallbackBanner message="Legacy grievance category manager." />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-1 font-serif lowercase tracking-tighter capitalize">
            Category Manager
          </h2>
          <p className="text-slate-500 font-medium text-sm">Manage complaint categories and dynamic sub-issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary shadow-sm w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker transition-all shadow-sm">
            <Plus size={14} /> New Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <RefreshCw className="animate-spin mb-4" size={32} />
          <span className="text-[10px] font-black uppercase tracking-widest">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                    <FolderTree size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{cat.name}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"><Edit2 size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-2 min-h-[40px]">
                {cat.description || "No description provided."}
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Layers size={10} /> Applicable Forms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(cat.applicable_types || ["External", "Student", "Staff"]).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><Tag size={10} /> Sub-issues</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories?.length > 0 ? cat.subcategories.map((sub: string) => (
                      <span key={sub} className="px-2 py-1 border border-slate-200 text-slate-600 rounded-full text-[9px] font-bold">
                        {sub}
                      </span>
                    )) : <span className="text-[10px] text-slate-400 italic">No specific sub-issues</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
