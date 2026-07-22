"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  Handshake,
  BarChart3,
  Calendar,
  ExternalLink,
  Filter,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react";
import { getApi, deleteApi, patchApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Highlight from "@/components/Highlight";

export default function PartnershipsAdmin() {
  const router = useRouter();
  const [partners, setPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partnersData, categoriesData, statsData] = await Promise.all([
        getApi("/partnerships/admin"),
        getApi("/partnerships/categories"),
        getApi("/partnerships/stats"),
      ]);
      setPartners(partnersData || []);
      setCategories(categoriesData || []);
      setStats(statsData);
    } catch {
      toast.error("Institutional data retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this partnership record?")) {
      try {
        await deleteApi(`/partnerships/${id}`);
        toast.success("Partnership record removed");
        fetchData();
      } catch {
        toast.error("Removal failed");
      }
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await patchApi(`/partnerships/${item.id}`, { is_active: !item.is_active });
      toast.success("Status updated");
      fetchData();
    } catch {
      toast.error("Status update failed");
    }
  };

  const filtered = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partnership_type.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    {
      label: "Total Partners",
      value: partners.length,
      icon: Handshake,
      color: "text-primary",
      bg: "bg-primary/8",
      border: "border-primary/20",
    },
    {
      label: "Active Alliances",
      value: stats?.activePartners ?? partners.filter((p) => p.is_active).length,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Featured Partners",
      value: partners.filter((p) => p.is_featured).length,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Categories",
      value: categories.length,
      icon: Filter,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100 px-10 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-1">
              OUK Admin · Global Ecosystem
            </p>
            <h1 className="text-3xl font-black text-primary-darker tracking-tighter uppercase font-serif">
              Strategic <span className="text-primary">Partnerships</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Manage the university's institutional collaboration network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => router.push("/admin/partnerships/new")}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>New Partner</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 space-y-8">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className={`bg-white border ${kpi.border} rounded-sm p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`w-12 h-12 ${kpi.bg} rounded-sm flex items-center justify-center shrink-0`}>
                <kpi.icon size={20} className={kpi.color} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                  {kpi.label}
                </p>
                <p className={`text-3xl font-black ${kpi.color} leading-none`}>
                  {loading ? (
                    <span className="inline-block w-8 h-7 bg-slate-100 animate-pulse rounded" />
                  ) : (
                    kpi.value ?? 0
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Registry Table ── */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header / Search */}
          <div className="px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name or partnership type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Partner
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Category & Type
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Website
                  </th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-5">
                        <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <Handshake size={48} className="mx-auto mb-4 text-slate-200" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        No partnerships found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 group transition-colors">
                      {/* Partner Identity */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:shadow-sm transition-shadow">
                            {p.logo_url ? (
                              <img
                                src={resolveImageUrl(p.logo_url)}
                                alt={p.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Globe size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-primary-darker uppercase tracking-tight">
                                <Highlight text={p.name || ""} query={search} quiet />
                              </p>
                              {p.is_featured && (
                                <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 font-black tracking-widest uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Type */}
                      <td className="px-8 py-5">
                        <p className="text-xs font-bold text-slate-700">{p.category?.name || "—"}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                          {p.partnership_type}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 font-black text-[9px] uppercase tracking-widest transition-all border ${
                            p.is_active
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {p.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Website */}
                      <td className="px-8 py-5">
                        {p.website_url ? (
                          <a
                            href={p.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
                          >
                            <ExternalLink size={11} />
                            <span className="truncate max-w-[140px]">{p.website_url.replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/partnerships/${p.id}`)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
