"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Calendar, RefreshCw, Trash2, Edit, Eye, Plus, Search } from "lucide-react";
import { deleteApi, getApi, patchApi } from "@/lib/api";
import { useAlert } from "@/context/AlertContext";
import { toast } from "react-hot-toast";
import PermissionGate from "@/components/admin/PermissionGate";
import { usePermission } from "@/hooks/useAdminPermissions";
import {
  normalizePublishStatus,
  publishStatusClass,
  publishStatusLabel,
  PUBLISH_STATUS_OPTIONS,
} from "@/lib/publish-status";

export default function PagesListing() {
  return (
    <PermissionGate permission={["pages.view", "pages.manage"]}>
      <PagesListingInner />
    </PermissionGate>
  );
}

function PagesListingInner() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { showAlert } = useAlert();
  const { can: canManage } = usePermission("pages.manage");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await getApi("/pages/admin");
      setPages(Array.isArray(data) ? data : []);
      if (data == null) {
        toast.error("Could not load CMS pages");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Could not load CMS pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canManage) {
      toast.error("You need pages.manage permission to remove pages");
      return;
    }
    showAlert({
      title: "Remove CMS page?",
      message: `Move “${title}” to the recycle bin? It can be restored later based on retention settings.`,
      onConfirm: async () => {
        try {
          await deleteApi(`/pages/${id}`);
          toast.success("Page moved to recycle bin");
          fetchPages();
        } catch (error) {
          toast.error("Failed to remove page");
        }
      },
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!canManage) {
      toast.error("You need pages.manage permission to change status");
      return;
    }
    try {
      await patchApi(`/pages/${id}/status`, { status: normalizePublishStatus(newStatus) });
      toast.success(`Status updated to ${publishStatusLabel(newStatus)}`);
      fetchPages();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.slug || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif ">Institutional pages</h2>
          <p className="text-slate-500 font-medium">
            Manage long-form content such as policies, about pages, and vision statements.
          </p>
        </div>
        {canManage && (
          <Link
            href="/admin/pages/new"
            className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest"
          >
            <Plus size={18} />
            <span>Create new page</span>
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between bg-white p-6 border border-slate-200">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none p-4 pl-12 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="text-right">
            <p>Total pages</p>
            <p className="text-lg text-primary-darker">{pages.length}</p>
          </div>
          <button onClick={fetchPages} className="p-4 bg-slate-50 text-slate-400 hover:text-primary transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Title & metadata</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Updated</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => {
                  const status = normalizePublishStatus(page.status, !!page.is_published);
                  return (
                    <tr key={page.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-black text-primary-darker uppercase tracking-widest text-sm mb-1">{page.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                              <span className="text-secondary mr-2">/</span>
                              {page.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border ${publishStatusClass(status)}`}>
                            {publishStatusLabel(status)}
                          </span>
                          {canManage && (
                            <select
                              value={status}
                              onChange={(e) => handleStatusUpdate(page.id, e.target.value)}
                              className="text-[9px] font-bold text-slate-500 bg-transparent border-b border-slate-200 outline-none uppercase tracking-widest"
                            >
                              {PUBLISH_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center space-x-3 text-slate-500">
                          <Calendar size={14} />
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {new Date(page.updated_at || page.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {status === "PUBLISHED" && (
                            <Link
                              href={`/${page.slug}`}
                              target="_blank"
                              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors"
                              title="View live"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          {canManage && (
                            <Link
                              href={`/admin/pages/${page.id}`}
                              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Link>
                          )}
                          {canManage && (
                            <button
                              onClick={() => handleDelete(page.id, page.title)}
                              className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 text-sm font-medium">
                    No pages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
