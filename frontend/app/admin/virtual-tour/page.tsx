"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getIntroVideos, API_URL, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { 
  Plus, Trash2, Edit2, Play, Save, X, RefreshCw, 
  Search, LayoutGrid, List, Filter, ChevronLeft, ChevronRight,
  Video, Youtube, MoreVertical, Eye
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { motion, AnimatePresence } from "framer-motion";

export default function VirtualTourAdmin() {
  const [videos, setVideos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6,
    search: "",
    type: "all",
    admin: true
  });
  
  const emptyVideo = {
    title: "", description: "", video_url: "", video_type: "upload", thumbnail_url: "", order_index: 0, is_active: true
  };
  const [form, setForm] = useState(emptyVideo);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const response = await getIntroVideos(filters);
    if (response) {
      setVideos(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVideos();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVideos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-thumbnail logic
    if (form.video_type === 'youtube' && form.video_url) {
      const vidId = getYoutubeId(form.video_url);
      if (vidId && !form.thumbnail_url) {
        form.thumbnail_url = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      }
    }

    setSaving(true);
    try {
      if (editingId) {
        await patchApi(`/intro-videos/${editingId}`, form);
      } else {
        await postApi("/intro-videos", form);
      }
      setShowModal(false);
      setForm(emptyVideo);
      setEditingId(null);
      fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
    } finally {
      setSaving(false);
    }
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleEdit = (video: any) => {
    setForm(video);
    setEditingId(video.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteApi(`/intro-videos/${id}`);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="space-y-10 w-full animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 text-serif tracking-tight">Virtual Tour Gallery</h2>
          <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Orchestrate the institutional cinematic narrative.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-primary"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-primary"}`}
              >
                <List size={18} />
              </button>
           </div>
           <button 
            onClick={() => { setForm(emptyVideo); setEditingId(null); setShowModal(true); }}
            className="bg-primary hover:bg-secondary text-white py-4 px-10 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
          >
            <Plus size={16} />
            <span>New Cinematic</span>
          </button>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 border border-slate-100 shadow-sm">
         <div className="md:col-span-6 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search cinematic assets..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
         </div>
         <div className="md:col-span-4">
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value, page: 1})}
              className="w-full px-4 py-4 bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
            >
               <option value="all">All Sources</option>
               <option value="upload">Internal Uploads</option>
               <option value="youtube">YouTube Embeds</option>
            </select>
         </div>
         <div className="md:col-span-2 flex justify-end">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {total} Results Found
            </div>
         </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <RefreshCw className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronising Library...</p>
        </div>
      ) : (
        <div className="space-y-8">
           {viewMode === "grid" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                {videos.map((video, idx) => (
                  <motion.div 
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 group relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm"
                  >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                       {video.thumbnail_url ? (
                          <img 
                            src={resolveImageUrl(video.thumbnail_url)} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                             <Video size={48} />
                          </div>
                       )}
                       {/* Clean Gradient Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-t from-primary-darker/90 via-primary-darker/40 to-transparent opacity-60" />
                       
                       <div className="absolute top-4 right-4 flex gap-2">
                          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${video.video_type === 'youtube' ? 'bg-red-600 text-white' : 'bg-primary text-white'}`}>
                             {video.video_type === 'youtube' ? <Youtube size={10} /> : <Video size={10} />}
                             {video.video_type}
                          </div>
                       </div>

                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                          <button 
                            onClick={() => handleEdit(video)}
                            className="bg-white text-primary p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
                          >
                             <Edit2 size={20} />
                          </button>
                       </div>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black text-primary-darker uppercase tracking-tighter truncate leading-none">{video.title}</h3>
                        <span className="text-[10px] font-bold text-slate-300">#{video.order_index}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium leading-relaxed line-clamp-2 mb-6">
                        {video.description || "No description provided for this cinematic asset."}
                      </p>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="flex-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 py-3 flex items-center justify-center space-x-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-md"
                        >
                          <Trash2 size={14} />
                          <span>Purge Asset</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
             </div>
           ) : (
             <div className="bg-white border border-slate-100 shadow-sm overflow-hidden rounded-sm">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 text-center">Order</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Information</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {videos.map((video) => (
                        <tr key={video.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-6 text-sm font-black text-slate-300 text-center">#{video.order_index}</td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-6">
                                 <div className="w-20 aspect-video bg-slate-100 rounded overflow-hidden relative shrink-0">
                                    <img src={resolveImageUrl(video.thumbnail_url)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/10" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-primary-darker uppercase tracking-tight">{video.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{video.description || "N/A"}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${video.video_type === 'youtube' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                 {video.video_type}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => handleEdit(video)} className="p-3 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm"><Edit2 size={16} /></button>
                                 <button onClick={() => handleDelete(video.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"><Trash2 size={16} /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {/* PAGINATION */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                 Showing Page {filters.page} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-3">
                 <button 
                   disabled={filters.page <= 1}
                   onClick={() => setFilters({...filters, page: filters.page - 1})}
                   className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-30 transition-all rounded-sm shadow-sm"
                 >
                    <ChevronLeft size={20} />
                 </button>
                 <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setFilters({...filters, page: i + 1})}
                        className={`w-12 h-12 flex items-center justify-center text-[10px] font-black transition-all rounded-sm shadow-sm ${filters.page === i + 1 ? 'bg-primary text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                      >
                         {i + 1}
                      </button>
                    ))}
                 </div>
                 <button 
                   disabled={filters.page >= totalPages}
                   onClick={() => setFilters({...filters, page: filters.page + 1})}
                   className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-30 transition-all rounded-sm shadow-sm"
                 >
                    <ChevronRight size={20} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL OVERLAY */}
      <AnimatePresence>
      {showModal && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-darker/90 backdrop-blur-md p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="bg-white w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh] rounded-sm"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
               <div>
                  <h3 className="text-xl font-black text-primary-darker uppercase tracking-tighter">{editingId ? "Refine Narrative" : "New Narrative"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Cinematic Parameters</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-600 rounded-full transition-all shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Narrative Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Virtual Campus Tour"
                      value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      className="w-full bg-slate-50 border-none p-5 font-bold text-primary-darker text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Index</label>
                    <input 
                      type="number" 
                      value={form.order_index} 
                      onChange={(e) => setForm({...form, order_index: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border-none p-5 font-bold text-primary-darker text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-primary">Narrative Description</label>
                 <textarea 
                    placeholder="Brief overview of the cinematic content..."
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full bg-slate-50 border-none p-5 font-bold text-primary-darker text-sm focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none transition-all"
                 />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Video Source</label>
                    <div className="flex bg-white p-1 rounded-md border border-slate-200">
                       <button 
                         type="button"
                         onClick={() => setForm({...form, video_type: 'upload'})}
                         className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${form.video_type === 'upload' ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}
                       >Internal</button>
                       <button 
                         type="button"
                         onClick={() => setForm({...form, video_type: 'youtube'})}
                         className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${form.video_type === 'youtube' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}
                       >YouTube</button>
                    </div>
                 </div>
                 <ImageUploader 
                    value={form.video_url}
                    onChange={(val) => setForm({...form, video_url: val})}
                    placeholder={form.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : '/videos/intro.mp4'}
                    accept={form.video_type === 'youtube' ? 'text' : 'video/*'}
                    type="video"
                    label="Media Asset"
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-primary">Cinematic Thumbnail (Optional)</label>
                 <ImageUploader 
                    value={form.thumbnail_url}
                    onChange={(val) => setForm({...form, thumbnail_url: val})}
                    label="Visual Poster"
                 />
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-50">
                 <button 
                   type="submit"
                   disabled={saving}
                   className="bg-primary hover:bg-secondary text-white py-5 px-16 text-[10px] font-black uppercase tracking-widest flex items-center space-x-4 transition-all shadow-xl shadow-primary/20"
                 >
                   {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                   <span>{saving ? "Orchestrating..." : "Save Narrative"}</span>
                 </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
