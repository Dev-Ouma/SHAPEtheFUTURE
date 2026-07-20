"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  Layers, 
  Check, 
  RefreshCw,
  X,
  ChevronDown,
  Building
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";

const STATUS_COLORS: any = {
  "Published": "bg-emerald-100 text-emerald-600 border-emerald-200",
  "Draft": "bg-amber-100 text-amber-600 border-amber-200"
};

export default function DepartmentsAdmin() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: "",
    name_sw: "",
    slug: "",
    description: "",
    description_sw: "",
    schoolId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsData, schoolsData] = await Promise.all([
        getApi("/departments"),
        getApi("/schools")
      ]);
      setDepartments(Array.isArray(deptsData) ? deptsData : deptsData?.data || []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : schoolsData?.data || []);
    } catch (err) {
      toast.error("Failed to load ecosystem data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return (departments || []).filter(d => 
      d.name?.toLowerCase().includes(search.toLowerCase()) || 
      d.school?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const openCreate = () => {
    setSelected(null);
    setForm({ name: "", name_sw: "", slug: "", description: "", description_sw: "", schoolId: "" });
    setIsModalOpen(true);
  };

  const openEdit = (dept: any) => {
    setSelected(dept);
    setForm({
      name: dept.name,
      name_sw: dept.name_sw || "",
      slug: dept.slug,
      description: dept.description || "",
      description_sw: dept.description_sw || "",
      schoolId: dept.school?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.schoolId) {
      toast.error("Name and School are mandatory");
      return;
    }

    setSaving(true);
    try {
      if (selected) {
        await patchApi(`/departments/${selected.id}`, form);
        toast.success("Department updated");
      } else {
        await postApi("/departments", form);
        toast.success("Department created");
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Process failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    showAlert({
      title: "Decommission Department?",
      message: `Are you sure you want to remove the ${name}? This will orphaned associated programmes.`,
      type: "danger",
      confirmText: "Decommission",
      onConfirm: async () => {
        try {
          await deleteApi(`/departments/${id}`);
          toast.success("Department removed");
          fetchData();
        } catch (err) {
          toast.error("Removal failed");
        }
      }
    });
  };

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-end bg-primary-darker/40 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden rounded-[2rem]"
          >
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-primary-darker text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary flex items-center justify-center rotate-3">
                  <Layers size={24} className="-rotate-3" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-serif italic uppercase tracking-tight">{selected ? "Edit Department" : "New Department"}</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Academic Structure Definition</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Identity & Taxonomy</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name *</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value, slug: selected ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                      className="w-full bg-slate-50 p-5 font-black text-primary-darker outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                      placeholder="e.g. Computing and Information Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Swahili Variation</label>
                    <input 
                      value={form.name_sw} 
                      onChange={e => setForm({ ...form, name_sw: e.target.value })}
                      className="w-full bg-slate-50 p-5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Slug</label>
                    <input 
                      value={form.slug} 
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      className="w-full bg-slate-100 p-5 font-bold text-primary outline-none focus:ring-2 focus:ring-primary italic"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Institutional Mapping</h4>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parent School *</label>
                  <div className="relative group">
                    <select 
                      value={form.schoolId} 
                      onChange={e => setForm({ ...form, schoolId: e.target.value })}
                      className="w-full bg-slate-50 p-5 font-black text-primary-darker outline-none focus:ring-2 focus:ring-primary appearance-none rounded-none"
                    >
                      <option value="">Select a School...</option>
                      {(schools || []).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4">Academic Narrative</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (EN)</label>
                    <textarea 
                      rows={4} 
                      value={form.description} 
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (SW)</label>
                    <textarea 
                      rows={4} 
                      value={form.description_sw} 
                      onChange={e => setForm({ ...form, description_sw: e.target.value })}
                      className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white flex justify-end items-center space-x-6">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-[#037b90] hover:bg-[#ff7f50] hover:text-white transition-all text-white py-5 px-12 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#037b90]/20 flex items-center space-x-4 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={18} />}
                <span>{selected ? "Update Department" : "Initialize Department"}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-primary">
            <Layers size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Academic Architecture</span>
          </div>
          <h2 className="text-5xl font-black text-primary-darker font-serif italic tracking-tighter uppercase">Departments Hub</h2>
          <p className="text-slate-500 font-medium text-sm max-w-xl">Governance and classification of institutional academic departments across faculties.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-[#037b90] hover:bg-[#ff7f50] hover:text-white transition-all text-white py-6 px-10 rounded-full flex items-center space-x-4 shadow-2xl shadow-[#037b90]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Department</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search departments or schools..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 p-5 pl-16 text-xs font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary rounded-full transition-all"
          />
        </div>
        <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Active Registry: <span className="text-primary">{filtered.length}</span></span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 space-y-6">
          <RefreshCw className="animate-spin text-primary" size={64} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with Department Registry...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-48 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
          <Layers size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-slate-400 uppercase font-black tracking-widest text-sm">No departments registered in the ecosystem</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-10 py-6 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">Department Info</div>
            <div className="col-span-3">Parent School</div>
            <div className="col-span-2">Academic Code</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {filtered.map((dept, i) => (
            <motion.div 
              key={dept.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-12 gap-4 px-10 py-8 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group cursor-pointer"
              onClick={() => openEdit(dept)}
            >
              <div className="col-span-5 flex items-center space-x-6">
                <div className="w-12 h-12 bg-slate-100 flex items-center justify-center rounded-2xl group-hover:bg-[#ff7f50] hover:text-white group-hover:text-primary transition-all">
                  <Building size={20} />
                </div>
                <div>
                  <p className="font-black text-primary-darker text-sm uppercase tracking-tight">{dept.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{dept.name_sw || "No SW variation"}</p>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <Building2 size={12} className="text-slate-300" />
                  <span>{dept.school?.name || "Unmapped"}</span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-[#037b90] hover:bg-[#ff7f50] transition-all px-3 py-1.5 rounded-full border border-[#037b90]/10">/{dept.slug}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end space-x-2">
                <button className="p-3 text-slate-300 hover:text-primary hover:bg-white rounded-full transition-all"><Edit size={16} /></button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(dept.id, dept.name); }} 
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-full transition-all"
                ><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {modalContent}
    </div>
  );
}
