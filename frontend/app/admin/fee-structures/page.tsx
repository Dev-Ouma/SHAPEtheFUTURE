"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, GripVertical, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { getAdminFeeStructures } from "@/lib/api";
import { deleteApi, patchApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function FeeStructuresAdmin() {
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    try {
      const data = await getAdminFeeStructures();
      setStructures(data || []);
    } catch (err) {
      toast.error("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this fee structure?")) return;
    try {
      await deleteApi(`/fee-structures/${id}`);
      toast.success("Deleted successfully");
      fetchStructures();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await patchApi(`/fee-structures/${id}`, { is_active: !currentStatus });
      toast.success("Status updated");
      fetchStructures();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading fee structures...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">Fee Structures</h1>
          <p className="text-slate-500 font-medium">Manage tabular fee data for different categories.</p>
        </div>
        <Link 
          href="/admin/fee-structures/new"
          className="bg-primary text-white px-6 py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-primary-darker transition-colors flex items-center gap-2 shadow-xl shadow-primary/20"
        >
          <Plus size={16} /> New Structure
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">Sort</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category Name</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {structures.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <GripVertical size={16} className="cursor-move opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="font-mono text-xs">{s.order_index}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-primary-darker">{s.category}</td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(s.id, s.is_active)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-colors ${
                      s.is_active 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {s.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {s.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/fee-structures/${s.id}`}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-sm transition-colors"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {structures.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No fee structures created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
