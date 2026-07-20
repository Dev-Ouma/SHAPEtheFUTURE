"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { getApi, resolveImageUrl, deleteApi, patchApi, postApi, extractYoutubeId } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdvertsAdmin() {
  const [adverts, setAdverts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const data = await getApi("/adverts/admin");
      setAdverts(data || []);
    } catch (error) {
      console.error("Error fetching adverts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this advert?")) {
      try {
        await deleteApi(`/adverts/${id}`);
        fetchAdverts();
      } catch (error) {
        alert("Failed to delete advert");
      }
    }
  };

  const handleToggleStatus = async (ad: any) => {
    try {
      await patchApi(`/adverts/${ad.id}`, { is_active: !ad.is_active });
      fetchAdverts();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const filteredAdverts = adverts.filter(ad => 
    ad.title.toLowerCase().includes(search.toLowerCase()) ||
    ad.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-darker tracking-tighter uppercase">
            Homepage <span className="text-primary">Adverts</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Manage promotional banners and high-impact calls to action
          </p>
        </div>
        <button 
          onClick={() => {
            setCurrentAd({
              title: "",
              content: "",
              image_url: "",
              media_type: "image",
              button_text: "Apply Now",
              button_link: "#",
              open_in_new_tab: true,
              theme_color: "#1e234a",
              is_active: true,
              order: 0
            });
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1"
        >
          <Plus size={18} />
          <span>Create New Advert</span>
        </button>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search adverts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-4 bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Banner</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Details</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Theme</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Adverts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdverts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">No adverts found</span>
                  </td>
                </tr>
              ) : (
                filteredAdverts.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="relative w-32 h-16 bg-slate-100 overflow-hidden">
                        {ad.media_type === 'youtube' ? (
                          <img 
                            src={`https://img.youtube.com/vi/${extractYoutubeId(ad.image_url)}/0.jpg`}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : ad.image_url ? (
                          <img 
                            src={resolveImageUrl(ad.image_url)} 
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-primary-darker uppercase tracking-tighter line-clamp-1">{ad.title}</span>
                        <span className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">{ad.content}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4" style={{ backgroundColor: ad.theme_color }}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{ad.theme_color}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleStatus(ad)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-none font-black text-[9px] uppercase tracking-widest transition-all ${
                          ad.is_active 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {ad.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{ad.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setCurrentAd(ad);
                            setShowModal(true);
                          }}
                          className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ad.id)}
                          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all"
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

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-primary-darker/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50">
                <h3 className="text-2xl font-black text-primary-darker uppercase tracking-tighter">
                  {currentAd?.id ? "Edit" : "New"} <span className="text-primary">Advert</span>
                </h3>
              </div>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (currentAd.id) {
                      await patchApi(`/adverts/${currentAd.id}`, currentAd);
                    } else {
                      await postApi(`/adverts`, currentAd);
                    }
                    setShowModal(false);
                    fetchAdverts();
                  } catch (error) {
                    alert("Failed to save advert");
                  }
                }}
                className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Title</label>
                    <input 
                      required
                      value={currentAd.title}
                      onChange={(e) => setCurrentAd({...currentAd, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Media Type</label>
                    <select 
                      value={currentAd.media_type || "image"}
                      onChange={(e) => setCurrentAd({...currentAd, media_type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="image">Static Image</option>
                      <option value="video">Direct Video (MP4/WebM)</option>
                      <option value="youtube">YouTube Video</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Theme Color</label>
                    <input 
                      type="color"
                      value={currentAd.theme_color}
                      onChange={(e) => setCurrentAd({...currentAd, theme_color: e.target.value})}
                      className="w-full h-11 p-1 bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Content</label>
                    <textarea 
                      required
                      rows={1}
                      value={currentAd.content}
                      onChange={(e) => setCurrentAd({...currentAd, content: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Button Text</label>
                    <input 
                      value={currentAd.button_text}
                      onChange={(e) => setCurrentAd({...currentAd, button_text: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Button Link</label>
                    <input 
                      value={currentAd.button_link}
                      onChange={(e) => setCurrentAd({...currentAd, button_link: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {currentAd.media_type === 'youtube' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">YouTube Video ID / URL</label>
                      <input 
                        required
                        placeholder="e.g. FK7sTrFnVDQ or full youtube link"
                        value={currentAd.image_url}
                        onChange={(e) => setCurrentAd({...currentAd, image_url: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ) : (
                    <ImageUploader 
                      label={currentAd.media_type === 'video' ? "Advert Video" : "Advert Image"}
                      type={currentAd.media_type === 'video' ? "video" : "image"}
                      accept={currentAd.media_type === 'video' ? "video/*" : "image/*"}
                      value={currentAd.image_url}
                      onChange={(val) => setCurrentAd({...currentAd, image_url: val})}
                      placeholder={currentAd.media_type === 'video' ? "https://.../video.mp4" : "/ad-registration.png"}
                    />
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={currentAd.open_in_new_tab}
                      onChange={(e) => setCurrentAd({...currentAd, open_in_new_tab: e.target.checked})}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Open in New Tab</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={currentAd.is_active}
                      onChange={(e) => setCurrentAd({...currentAd, is_active: e.target.checked})}
                      className="w-5 h-5 accent-primary"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Is Active</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-4 font-black uppercase tracking-widest text-xs text-slate-500 hover:text-primary-darker transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-10 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all"
                  >
                    Save Advert
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
