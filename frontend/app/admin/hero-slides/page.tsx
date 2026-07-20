"use client";

import React, { useState, useEffect } from "react";
import { getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { validateImageDimensions } from "@/lib/validators";
import FileUpload from "@/components/admin/FileUpload";
import { 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function HeroSlidesAdmin() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const emptySlide = {
    title: "",
    title_sw: "",
    tagline: "",
    tagline_sw: "",
    description: "",
    description_sw: "",
    image_url: "",
    cta_text: "Learn More",
    cta_text_sw: "",
    cta_link: "#",
    order: 0,
  };
  const [newSlide, setNewSlide] = useState(emptySlide);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      // Admin endpoint returns raw EN + *_sw fields (not locale-projected)
      const data = await getApi("/hero-slides/admin");
      setSlides(data || []);
    } catch (error) {
      toast.error("Failed to retrieve hero deck");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const target = editingId ? slides.find(s => s.id === editingId) : newSlide;
    
    if (!target.title || !target.image_url) {
      toast.error("Title and Image are mandatory");
      return;
    }

    // Quality Guardrail (1920px for Heros)
    const isValid = await validateImageDimensions(target.image_url, 1920, 1080);
    if (typeof isValid === "string") {
      setValidationError(isValid);
      toast.error("Visual Quality Guardrail Triggered");
      return;
    }
    
    setValidationError(null);
    try {
      if (editingId) {
        await patchApi(`/hero-slides/${editingId}`, target);
        setEditingId(null);
        toast.success("Strategic banner updated");
      } else {
        await postApi("/hero-slides", newSlide);
        setIsAdding(false);
        setNewSlide({ ...emptySlide, order: slides.length });
        toast.success("New hero slide initiated");
      }
      fetchSlides();
    } catch (error) {
      toast.error("Synchronisation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this institutional hero asset?")) return;
    try {
      await deleteApi(`/hero-slides/${id}`);
      toast.success("Asset decommissioned");
      fetchSlides();
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const renderForm = (data: any, isEdit = false) => (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-primary-darker p-10 text-white space-y-10 border-l-8 border-secondary overflow-hidden mb-12 shadow-2xl relative"
    >
       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Layout size={120} />
       </div>

       <div className="flex justify-between items-center border-b border-white/10 pb-6 relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
             {isEdit ? "Refine Institutional Banner" : "Establish Strategic Entry Point"}
          </h3>
          <button 
            onClick={() => { setIsAdding(false); setEditingId(null); setValidationError(null); }} 
            className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Abort 
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          {/* Content Inputs */}
          <div className="lg:col-span-12 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tagline / Category Banner</label>
                   <input 
                     value={data.tagline}
                     onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, tagline: e.target.value} : s)) : setNewSlide({...newSlide, tagline: e.target.value})}
                     className="w-full bg-white/5 border border-white/10 p-5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-secondary text-white"
                     placeholder="EMPOWERING FUTURE LEADERS"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CTA Link Path</label>
                   <input 
                     value={data.cta_link} 
                     onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, cta_link: e.target.value} : s)) : setNewSlide({...newSlide, cta_link: e.target.value})} 
                     className="w-full bg-white/5 border border-white/10 p-5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-secondary"
                     placeholder="/admissions"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strategic Heading (H1)</label>
                <input 
                  value={data.title}
                  onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, title: e.target.value} : s)) : setNewSlide({...newSlide, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 text-2xl font-black text-white outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="The Future of Learning..."
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kiswahili Heading (optional)</label>
                <input 
                  value={data.title_sw || ""}
                  onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, title_sw: e.target.value} : s)) : setNewSlide({...newSlide, title_sw: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 text-lg font-black text-white outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Kichwa cha Kiswahili..."
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Description</label>
                <textarea 
                  value={data.description}
                  rows={3}
                  onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, description: e.target.value} : s)) : setNewSlide({...newSlide, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-6 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder="Join the Open University of Kenya..."
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kiswahili Description (optional)</label>
                <textarea 
                  value={data.description_sw || ""}
                  rows={3}
                  onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, description_sw: e.target.value} : s)) : setNewSlide({...newSlide, description_sw: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-5 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder="Maelezo ya Kiswahili..."
                />
             </div>
          </div>

          {/* Media Column moved to its own section for better layout */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-white/5">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Strategic Asset Upload</label>
                <FileUpload 
                  currentValue={data.image_url}
                  onUploadComplete={(url) => {
                    setValidationError(null);
                    isEdit 
                      ? setSlides(slides.map(s => s.id === editingId ? {...s, image_url: url} : s)) 
                      : setNewSlide({...newSlide, image_url: url});
                  }}
                />
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ">Manual Asset Override (URL)</label>
                   <input 
                     value={data.image_url}
                     onChange={(e) => {
                       setValidationError(null);
                       isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, image_url: e.target.value} : s)) : setNewSlide({...newSlide, image_url: e.target.value});
                     }}
                     className={`w-full bg-white/5 border border-white/10 p-4 text-[10px] font-bold tracking-widest outline-none focus:ring-2 ${validationError ? "ring-2 ring-red-500" : "focus:ring-secondary"} text-white/50`}
                     placeholder="Paste external asset URL..."
                   />
                   <AnimatePresence>
                     {validationError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2">{validationError}</p>}
                   </AnimatePresence>
                </div>
                
                <div className="flex flex-col space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CTA Blueprint (Button Text)</label>
                   <input 
                     value={data.cta_text} 
                     onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, cta_text: e.target.value} : s)) : setNewSlide({...newSlide, cta_text: e.target.value})} 
                     className="w-full bg-white/5 border border-white/10 p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-secondary"
                     placeholder="APPLY NOW"
                   />
                </div>
                <div className="flex flex-col space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CTA Kiswahili (optional)</label>
                   <input 
                     value={data.cta_text_sw || ""} 
                     onChange={(e) => isEdit ? setSlides(slides.map(s => s.id === editingId ? {...s, cta_text_sw: e.target.value} : s)) : setNewSlide({...newSlide, cta_text_sw: e.target.value})} 
                     className="w-full bg-white/5 border border-white/10 p-5 text-xs font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-secondary"
                     placeholder="OMBA SASA"
                   />
                </div>
             </div>
          </div>
       </div>

       <div className="flex justify-end pt-8 border-t border-white/5">
          <button 
            onClick={handleSave}
            className="bg-primary py-5 px-12 text-white text-xs font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all flex items-center space-x-4 shadow-xl shadow-primary/20"
          >
             <Save size={20} />
             <span>{isEdit ? "Publish Stratagem" : "Deploy Slide"}</span>
          </button>
       </div>
    </motion.div>
  );

  return (
    <div className="space-y-12 h-full">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-primary-darker font-serif tracking-tighter uppercase">Strategic Hero Deck</h2>
          <p className="text-slate-500 font-medium text-sm">Manage the institutional global entry point and visual sequences.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          <span>Initiate Slide</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && !editingId && renderForm(newSlide)}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronising Deck...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 pt-4 pb-24">
          {slides.map((slide, index) => (
            <div key={slide.id} className="space-y-4">
               <AnimatePresence>
                  {editingId === slide.id ? (
                    renderForm(slide, true)
                  ) : (
                    <div className="bg-white border border-slate-200 border-l-[16px] border-l-slate-900 group transition-all hover:border-[#ff7f50]/40 relative shadow-sm">
                       <div className="p-10 flex items-center space-x-12">
                          <div className="w-64 h-36 bg-slate-100 relative overflow-hidden shrink-0">
                             <img 
                               src={resolveImageUrl(slide.image_url)} 
                               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                               alt="Hero Preview" 
                             />
                             <div className="absolute inset-0 bg-primary-darker/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest ">Position {index + 1}</span>
                             </div>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                             <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">{slide.tagline}</span>
                                <h4 className="text-3xl font-black text-primary-darker uppercase tracking-tighter leading-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.title) }} />
                             </div>
                             <p className="text-xs text-slate-400 font-medium line-clamp-2 max-w-3xl leading-relaxed">{slide.description}</p>
                          </div>

                          <div className="flex items-center space-x-4">
                             <button 
                                onClick={() => setEditingId(slide.id)}
                                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#ff7f50] hover:text-white transition-all border border-slate-100 bg-slate-50"
                             >
                                <RefreshCw size={20} />
                             </button>
                             <button 
                                onClick={() => handleDelete(slide.id)}
                                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-all border border-slate-100 bg-slate-50"
                             >
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>
                    </div>
                   )}
               </AnimatePresence>
            </div>
          ))}
          {slides.length === 0 && !isAdding && (
            <div className="py-40 text-center border-4 border-dashed border-slate-100 bg-slate-50/50">
               <ImageIcon size={64} className="text-slate-200 mx-auto mb-6" />
               <p className="text-slate-400 uppercase font-black tracking-widest text-xs">Strategic Deck Vacant - System Fallback Active</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
