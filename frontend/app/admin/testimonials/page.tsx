"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  EyeOff,
  User,
  Quote
} from "lucide-react";
import { getApi, resolveImageUrl, deleteApi, patchApi, postApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/admin/ImageUploader";

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<any>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await getApi("/testimonials/admin");
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await deleteApi(`/testimonials/${id}`);
        fetchTestimonials();
      } catch (error) {
        alert("Failed to delete testimonial");
      }
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await patchApi(`/testimonials/${item.id}`, { is_active: !item.is_active });
      fetchTestimonials();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const filtered = testimonials.filter(t => 
    t.author.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-darker tracking-tighter uppercase">
            Student <span className="text-primary">Testimonials</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Manage success stories and community feedback
          </p>
        </div>
        <button 
          onClick={() => {
            setCurrentTestimonial({
              author: "",
              author_role: "",
              content: "",
              image_url: "",
              is_active: true,
              order: 0
            });
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
        >
          <Plus size={18} />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Author</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Content</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">No testimonials found</span>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 overflow-hidden relative">
                          {t.image_url ? (
                            <img src={resolveImageUrl(t.image_url)} alt={t.author} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User size={16} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary-darker uppercase tracking-tighter">{t.author}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.author_role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col max-w-md">
                        <span className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">"{t.content}"</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(t)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-none font-black text-[9px] uppercase tracking-widest transition-all ${
                          t.is_active 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{t.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setCurrentTestimonial(t);
                            setShowModal(true);
                          }}
                          className="p-3 text-slate-400 hover:text-primary transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-3 text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 size={16} />
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-primary-darker/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50">
                <h3 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
                  {currentTestimonial?.id ? "Edit" : "New"} <span className="text-primary">Testimonial</span>
                </h3>
              </div>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (currentTestimonial.id) {
                      await patchApi(`/testimonials/${currentTestimonial.id}`, currentTestimonial);
                    } else {
                      await postApi(`/testimonials`, currentTestimonial);
                    }
                    setShowModal(false);
                    fetchTestimonials();
                  } catch (error) {
                    alert("Failed to save");
                  }
                }}
                className="p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Author Name</label>
                    <input required value={currentTestimonial.author} onChange={(e) => setCurrentTestimonial({...currentTestimonial, author: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Author Role/Programme</label>
                    <input required value={currentTestimonial.author_role} onChange={(e) => setCurrentTestimonial({...currentTestimonial, author_role: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Testimonial Content</label>
                  <textarea required rows={4} value={currentTestimonial.content} onChange={(e) => setCurrentTestimonial({...currentTestimonial, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>

                <div className="space-y-2">
                  <ImageUploader 
                    label="Author Image"
                    value={currentTestimonial.image_url}
                    onChange={(val) => setCurrentTestimonial({...currentTestimonial, image_url: val})}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 font-black uppercase tracking-widest text-xs text-slate-500 hover:text-primary-darker transition-colors">Cancel</button>
                  <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-10 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all">Save Testimonial</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
