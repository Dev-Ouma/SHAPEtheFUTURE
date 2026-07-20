"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Edit, Trash2, RefreshCw, X, Check,
  HelpCircle, Save, Filter
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import RichTextEditor from "@/components/RichTextEditor";

const CATEGORIES = ["General", "Admissions", "Academic", "Students", "Technical", "Staff"];

export default function FAQManagerAdmin() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFaqs();
  }, [page, categoryFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchFaqs();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const emptyForm = {
    question: "",
    question_sw: "",
    answer: "",
    answer_sw: "",
    category: "General",
    display_order: 0,
    is_active: true
  };
  const [form, setForm] = useState(emptyForm);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search
      };
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.is_active = statusFilter === "active";

      const queryString = new URLSearchParams(params).toString();
      const response = await getApi(`/faqs?${queryString}`);
      setFaqs(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (faq: any) => {
    setSelected(faq);
    setForm({
      question: faq.question || "",
      question_sw: faq.question_sw || "",
      answer: faq.answer || "",
      answer_sw: faq.answer_sw || "",
      category: faq.category || "General",
      display_order: faq.display_order || 0,
      is_active: faq.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error("Question and Answer are required");
      return;
    }
    setSaving(true);
    try {
      if (selected) {
        await patchApi(`/faqs/${selected.id}`, form);
        toast.success("FAQ updated");
      } else {
        await postApi('/faqs', form);
        toast.success("FAQ created");
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const { showAlert } = useAlert();

  const handleDelete = async (id: string, question: string) => {
    showAlert({
      title: "Remove FAQ?",
      message: `Are you sure you want to delete: "${question.slice(0, 50)}..."?`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteApi(`/faqs/${id}`);
          toast.success("FAQ deleted");
          fetchFaqs();
        } catch {
          toast.error("Deletion failed");
        }
      }
    });
  };

  const filtered = faqs;

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[1000] flex items-center justify-center bg-primary-darker/60 backdrop-blur-md p-6"
        >
          <motion.div
             initial={{ scale: 0.95, y: 20 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.95, y: 20 }}
             className="bg-white w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col rounded-[2rem] max-h-[90vh]"
          >
             <div className="p-8 bg-primary-darker text-white flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                      <HelpCircle size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black uppercase tracking-widest">{selected ? "Edit FAQ" : "Create FAQ Entry"}</h3>
                      <p className="text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em] mt-1">Institutional Knowledge Management</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                   <X size={20} />
                </button>
             </div>
             
             <div className="overflow-y-auto p-10 space-y-8 flex-1 scrollbar-hide">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Question</label>
                   <input 
                      value={form.question} 
                      onChange={e => f("question", e.target.value)} 
                      className="w-full bg-slate-50 p-5 font-black text-primary-darker outline-none border-l-4 border-primary focus:ring-0 text-lg" 
                      placeholder="Enter the question here..." 
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question (Swahili) — optional</label>
                   <input 
                      value={form.question_sw || ""} 
                      onChange={e => f("question_sw", e.target.value)} 
                      className="w-full bg-slate-50 p-5 font-medium text-primary-darker outline-none border-l-4 border-slate-200 focus:ring-0 text-lg" 
                      placeholder="Swali la Kiswahili..." 
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                      <select 
                        value={form.category} 
                        onChange={e => f("category", e.target.value)}
                        className="w-full bg-slate-50 p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      >
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label>
                      <input 
                        type="number"
                        value={form.display_order} 
                        onChange={e => f("display_order", parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-50 p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scholarly Answer</label>
                   <RichTextEditor 
                      content={form.answer} 
                      onChange={html => f("answer", html)} 
                      placeholder="Provide a detailed, helpful answer..." 
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer (Swahili) — optional</label>
                   <RichTextEditor 
                      content={form.answer_sw || ""} 
                      onChange={html => f("answer_sw", html)} 
                      placeholder="Jibu la Kiswahili..." 
                   />
                </div>

                <div className="p-6 bg-slate-50 flex items-center justify-between group cursor-pointer" onClick={() => f("is_active", !form.is_active)}>
                   <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Visibility Status</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Toggle FAQ accessibility on the public portal</div>
                   </div>
                   <div className={`w-12 h-6 rounded-full p-1 transition-colors ${form.is_active ? 'bg-primary' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                   </div>
                </div>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white flex justify-end items-center space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary-darker transition-colors">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="bg-primary text-white py-4 px-12 flex items-center space-x-3 text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-[#ff7f50] disabled:opacity-50 transition-all"
                >
                   {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                   <span>{selected ? "Update Entry" : "Finalise Entry"}</span>
                </button>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
         <div>
            <h2 className="text-4xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tighter">FAQ Orchestration</h2>
            <p className="text-slate-500 font-medium text-sm">Managing the institutional knowledge base and discovery patterns.</p>
         </div>
         <button onClick={openCreate} className="bg-primary text-white py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-[#ff7f50] transition-all">
            <Plus size={20} />
            <span>New FAQ Entry</span>
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <div className="text-3xl font-black text-primary-darker">{total}</div>
            <div className="text-[10px] font-black uppercase tracking_widest text-slate-400 mt-1">Global Entries</div>
         </div>
         <div className="bg-white border border-slate-200 p-8 shadow-sm text-center">
            <div className="text-3xl font-black text-primary-darker">{faqs.length}</div>
            <div className="text-[10px] font-black uppercase tracking_widest text-slate-400 mt-1">Page Volume</div>
         </div>
         <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <div className="text-3xl font-black text-primary">{page} / {totalPages || 1}</div>
            <div className="text-[10px] font-black uppercase tracking_widest text-slate-400 mt-1">Discovery Phase</div>
         </div>
         <div className="bg-white border border-slate-200 p-8 shadow-sm">
            <div className="text-3xl font-black text-primary-darker">{new Set(faqs.map(f => f.category)).size}</div>
            <div className="text-[10px] font-black uppercase tracking_widest text-slate-400 mt-1">Active Categories</div>
         </div>
      </div>

      <div className="bg-white border border-slate-200 p-4 flex items-center space-x-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter by question or category..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-slate-50 p-4 pl-12 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
         </div>
         <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
            <div className="flex items-center space-x-2 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Filter size={14} />
               <span>Category</span>
            </div>
            <select 
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
               className="bg-transparent py-4 pr-10 pl-2 text-[10px] font-black uppercase tracking-widest text-primary-darker outline-none appearance-none cursor-pointer"
            >
               <option value="all">All Categories</option>
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
         <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
            <div className="flex items-center space-x-2 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Filter size={14} />
               <span>Status</span>
            </div>
            <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-transparent py-4 pr-10 pl-2 text-[10px] font-black uppercase tracking-widest text-primary-darker outline-none appearance-none cursor-pointer"
            >
               <option value="all">All Status</option>
               <option value="active">Active (Portal)</option>
               <option value="inactive">Inactive (Draft)</option>
            </select>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <RefreshCw className="animate-spin text-primary" size={48} />
           <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400">Synchronising Knowledge Base...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center border-4 border-dashed border-slate-100">
           <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-slate-400 uppercase font-black tracking-widest text-sm">No knowledge entries found</p>
        </div>
      ) : (
        <div className="space-y-4">
           {filtered.map((faq, i) => (
             <motion.div 
               key={faq.id} 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: i * 0.05 }}
               className="bg-white border border-slate-200 p-8 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
             >
                <div className="flex-1 pr-10">
                   <div className="flex items-center space-x-3 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-primary/5 text-primary border border-primary/10">
                         {faq.category}
                      </span>
                      {!faq.is_active && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-400">
                           Inactive
                        </span>
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                         Order: {faq.display_order}
                      </span>
                   </div>
                   <h3 className="text-xl font-black text-primary-darker uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                      {faq.question}
                   </h3>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                     onClick={() => openEdit(faq)}
                     className="p-4 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-all rounded-xl"
                   >
                      <Edit size={18} />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDelete(faq.id, faq.question); }}
                     className="p-4 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all rounded-xl"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
             </motion.div>
           ))}

           {/* Pagination Controls */}
           {totalPages > 1 && (
             <div className="flex items-center justify-between py-10 border-t border-slate-100 mt-10">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary-darker hover:text-white disabled:opacity-30 transition-all rounded-lg"
                >
                   <span>Previous Phase</span>
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   Page {page} of {totalPages}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary-darker hover:text-white disabled:opacity-30 transition-all rounded-lg"
                >
                   <span>Next Phase</span>
                </button>
             </div>
           )}
        </div>
      )}
      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </div>
  );
}
