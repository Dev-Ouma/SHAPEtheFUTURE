"use client";

import React, { useState, useEffect } from "react";
import { getSettings, API_URL, getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { Save, RefreshCw, AlertCircle, Plus, Trash2, Edit, Check, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useAlert } from "@/context/AlertContext";
import ImageUploader from "@/components/admin/ImageUploader";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function HomeManagerPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [slides, setSlides] = useState<any[]>([]);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<any>(null);
  const [heroSaving, setHeroSaving] = useState(false);
  
  const emptyHero = {
    title: "", tagline: "", description: "", image_url: "", video_url: "", video_type: "upload", cta_text: "Learn More", cta_link: "#", order: 0
  };
  const [heroForm, setHeroForm] = useState(emptyHero);

  const [pillars, setPillars] = useState<any[]>([
    { title: "", description: "", value: "", icon: "" },
    { title: "", description: "", value: "", icon: "" },
    { title: "", description: "", value: "", icon: "" },
    { title: "", description: "", value: "", icon: "" },
  ]);

  const { showAlert } = useAlert();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsData, slidesData] = await Promise.all([
        getSettings(),
        getApi("/hero-slides/admin")
      ]);
      setSettings(settingsData);
      setSlides(slidesData || []);
      
      if (settingsData.home_pillars_data) {
        try {
          setPillars(JSON.parse(settingsData.home_pillars_data));
        } catch (e) {}
      }
    } catch (error) {
      console.error("Failed to load home data", error);
    }
    setLoading(false);
  };

  const handleUpdate = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handlePillarUpdate = (index: number, key: string, value: string) => {
    const newPillars = [...pillars];
    newPillars[index] = { ...newPillars[index], [key]: value };
    setPillars(newPillars);
  };

  const openHeroCreate = () => {
    setSelectedSlide(null);
    setHeroForm({ ...emptyHero, order: slides.length });
    setIsHeroModalOpen(true);
  };

  const openHeroEdit = (slide: any) => {
    setSelectedSlide(slide);
    setHeroForm({ ...slide });
    setIsHeroModalOpen(true);
  };

  const handleSaveHero = async () => {
    if (!heroForm.title || !heroForm.image_url) {
      toast.error("Title and image are required.");
      return;
    }
    setHeroSaving(true);
    try {
      if (selectedSlide) {
        await patchApi(`/hero-slides/${selectedSlide.id}`, heroForm);
        toast.success("Hero slide updated");
      } else {
        await postApi("/hero-slides", heroForm);
        toast.success("New hero slide added");
      }
      setIsHeroModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save hero slide");
    } finally {
      setHeroSaving(false);
    }
  };

  const handleDeleteHero = async (id: string) => {
    showAlert({
      title: "Remove Hero Slide?",
      message: "Are you sure you want to move this slide to the Recycle Bin? It will be archived for 30 days.",
      onConfirm: async () => {
        try {
          await deleteApi(`/hero-slides/${id}`);
          toast.success("Hero slide removed");
          fetchData();
        } catch (error) {
          toast.error("Failed to remove hero slide");
        }
      }
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    const payload = {
      ...settings,
      home_pillars_data: JSON.stringify(pillars)
    };

    try {
      const updatePromises = Object.entries(payload).map(([key, value]) =>
        fetch(`${API_URL}/settings/${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        })
      );

      await Promise.all(updatePromises);
      setMessage({ type: "success", text: "Home Page updated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update home page" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="space-y-12 w-full">
      <div className="flex justify-between items-end border-b-4 border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif ">Home Page Manager</h2>
          <p className="text-slate-500 font-medium tracking-wide">Manage dynamic content for the public landing page hero and four pillars sections.</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest disabled:bg-slate-300 shadow-xl shadow-primary/20"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-6 border-l-8 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'} flex items-center space-x-4`}>
          <AlertCircle size={24} />
          <span className="font-bold uppercase tracking-widest text-xs">{message.text}</span>
        </div>
      )}

      {/* Hero Section settings */}
      <div className="bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Hero Slide Sequence</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage multiple rotating banners</p>
          </div>
          <button 
            onClick={openHeroCreate}
            className="btn-primary py-3 px-6 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            <span>Add New Slide</span>
          </button>
        </div>
        
        <div className="p-10">
          {slides.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-slate-100 bg-slate-50/50">
               <ImageIcon size={48} className="text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 uppercase font-black tracking-widest text-[10px]">No active hero slides. Using default branding.</p>
               <button onClick={openHeroCreate} className="mt-4 text-primary font-black uppercase tracking-widest text-[10px] border-b-2 border-primary pb-1">Create First Slide</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {slides.map((slide, idx) => (
                <div key={slide.id} className="group flex items-center space-x-8 p-6 bg-slate-50 border border-slate-100 hover:border-[#ff7f50]/30 transition-all">
                  <div className="w-40 h-24 bg-slate-200 shrink-0 relative overflow-hidden">
                    <img 
                      src={resolveImageUrl(slide.image_url)} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                    />
                    <div className="absolute top-2 left-2 bg-primary-darker/80 text-white text-[8px] px-2 py-0.5 font-bold">0{idx + 1}</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mb-1 block">{slide.tagline}</span>
                    <h4 className="text-lg font-black text-primary-darker truncate uppercase tracking-tight" dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.title) }} />
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{slide.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => openHeroEdit(slide)} className="p-3 bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteHero(slide.id)} className="p-3 bg-white text-slate-400 hover:text-red-500 border border-slate-100 shadow-sm transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Hero fallbacks hidden or moved if necessary for backwards compatibility */}
        <div className="bg-slate-50 p-6 border-t border-slate-100">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
             System prioritized dynamic slides. Fallback settings managed via database migrations.
           </p>
        </div>
      </div>

      {/* Hero Modal */}
      <AnimatePresence>
        {isHeroModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-darker/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 bg-primary-darker text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{selectedSlide ? "Edit Hero Slide" : "Initiate Hero Slide"}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configure strategic entry point banner</p>
                </div>
                <button onClick={() => setIsHeroModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto space-y-10 flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-primary">Tagline / Pre-title</label>
                    <input 
                      type="text" 
                      value={heroForm.tagline} 
                      onChange={(e) => setHeroForm({...heroForm, tagline: e.target.value})}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Empowering Future Leaders"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-secondary">CTA Link Path</label>
                    <input 
                      type="text" 
                      value={heroForm.cta_link} 
                      onChange={(e) => setHeroForm({...heroForm, cta_link: e.target.value})}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                      placeholder="/admissions"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Main Title (Use &lt;span&gt; for highlighted text)</label>
                    <textarea 
                      value={heroForm.title} 
                      onChange={(e) => setHeroForm({...heroForm, title: e.target.value})}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-24"
                      placeholder="The Future of <span class='text-primary'>Learning</span> is Here."
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Description</label>
                    <textarea 
                      value={heroForm.description} 
                      onChange={(e) => setHeroForm({...heroForm, description: e.target.value})}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary">Hero Background Asset</label>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recommended: 1920 x 1080px</span>
                      </div>
                       <ImageUploader 
                        value={heroForm.image_url}
                        onChange={(val) => setHeroForm({...heroForm, image_url: val})}
                        placeholder="/hero-campus.png"
                        label="Hero Background Image"
                      />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary">Cinematic Video Asset (Optional)</label>
                         <select 
                            value={heroForm.video_type || "upload"} 
                            onChange={(e) => setHeroForm({...heroForm, video_type: e.target.value})}
                            className="bg-slate-100 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary"
                         >
                            <option value="upload">Upload / URL</option>
                            <option value="youtube">YouTube URL</option>
                         </select>
                      </div>
                      <ImageUploader 
                        value={heroForm.video_url}
                        onChange={(val) => setHeroForm({...heroForm, video_url: val})}
                        placeholder={heroForm.video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : '/videos/hero-bg.mp4'}
                        label="Upload Background Video"
                        accept={heroForm.video_type === 'youtube' ? 'text' : 'video/*'}
                        type="video"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CTA Blueprint (Button Text)</label>
                     <input 
                       type="text" 
                       value={heroForm.cta_text} 
                       onChange={(e) => setHeroForm({...heroForm, cta_text: e.target.value})}
                       className="w-full bg-slate-50 border-none p-5 text-xs font-black uppercase tracking-widest text-primary-darker outline-none focus:ring-2 focus:ring-primary"
                       placeholder="EXPLORE NOW"
                     />
                   </div>
                   <div className="p-6 bg-slate-50 border-l-4 border-primary self-end">
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed ">
                        "Strategic images/videos should maintain high-contrast motifs to ensure overlay text readability across multiple viewports."
                      </p>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4 shrink-0">
                <button onClick={() => setIsHeroModalOpen(false)} className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  Discard
                </button>
                <button 
                  onClick={handleSaveHero} 
                  disabled={heroSaving}
                  className="btn-primary py-4 px-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center space-x-3"
                >
                  {heroSaving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>{heroSaving ? "Synchronising..." : (selectedSlide ? "Publish Stratagem" : "Deploy Slide")}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pillars settings */}
      <div className="bg-white p-10 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-8">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">Four Strategic Pillars</h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-100">Replaces Stats</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="bg-slate-50 p-6 border-l-4 border-slate-300 focus-within:border-primary transition-colors">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400">Pillar 0{idx + 1}</span>
              </div>
              <div className="space-y-4">
                 <div className="flex gap-4">
                     <div className="flex-1 space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Icon Name (Lucide)</label>
                       <input 
                         type="text" 
                         value={pillar.icon || ""} 
                         onChange={(e) => handlePillarUpdate(idx, "icon", e.target.value)}
                         className="w-full bg-white border border-slate-200 p-3 text-xs font-bold text-primary-darker outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                         placeholder="e.g. Shield, Award, Users..."
                       />
                     </div>
                     <div className="flex-1 space-y-2">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Main Metric / Value</label>
                       <input 
                         type="text" 
                         value={pillar.value || ""} 
                         onChange={(e) => handlePillarUpdate(idx, "value", e.target.value)}
                         className="w-full bg-white border border-slate-200 p-3 font-black text-primary-darker outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                         placeholder="150+"
                       />
                     </div>
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Title</label>
                   <input 
                     type="text" 
                     value={pillar.title || ""} 
                     onChange={(e) => handlePillarUpdate(idx, "title", e.target.value)}
                     className="w-full bg-white border border-slate-200 p-3 font-bold text-xs uppercase tracking-widest text-primary-darker outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                     placeholder="Programmes Offered"
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Short Description</label>
                   <textarea 
                     value={pillar.description || ""} 
                     onChange={(e) => handlePillarUpdate(idx, "description", e.target.value)}
                     className="w-full bg-white border border-slate-200 p-3 font-medium text-xs text-slate-600 outline-none resize-none h-20 focus:border-primary focus:ring-1 focus:ring-primary"
                     placeholder="Brief description of the pillar..."
                   />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
