"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Type, 
  Layers, 
  Check, 
  X,
  RefreshCw,
  Globe,
  Tag
} from "lucide-react";
import { getApi, postApi, patchApi, getMenus, resolveImageUrl, uploadFile } from "@/lib/api";
import { toast } from "react-hot-toast";
import TiptapEditor from "@/components/admin/TiptapEditor";
import { CustomSelect } from "@/components/ui/CustomSelect";
import PermissionGate from "@/components/admin/PermissionGate";
import { normalizePublishStatus, PUBLISH_STATUS_OPTIONS } from "@/lib/publish-status";

export default function EditArticle() {
  return (
    <PermissionGate permission="news.manage">
      <EditArticleInner />
    </PermissionGate>
  );
}

function EditArticleInner() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [uploadMode, setUploadMode] = useState<'URL' | 'UPLOAD'>('URL');
  
  const [formData, setFormData] = useState({
    title: "",
    title_sw: "",
    slug: "",
    content: "",
    content_sw: "",
    summary: "",
    summary_sw: "",
    image_url: "",
    featured_image_caption: "",
    type: "News",
    category: "Announcement",
    status: "DRAFT",
    featuredMenuId: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch all header menus for "featured" selection
      const menuData = await getMenus("header");
      
      // Flatten the tree for the dropdown but keep track of depth for indentation
      const flattened: any[] = [];
      const flatten = (items: any[], level: number = 0) => {
        items.forEach(item => {
          flattened.push({
            id: item.id,
            title: level > 0 ? `${"— ".repeat(level)}${item.title}` : item.title
          });
          if (item.children && item.children.length > 0) {
            flatten(item.children, level + 1);
          }
        });
      };
      
      flatten(menuData || []);
      setMenus(flattened);

      if (!isNew) {
        const article = await getApi(`/news/${id}`); // We'll need a generic get by ID
        if (article) {
          setFormData({
            title: article.title || "",
            title_sw: article.title_sw || "",
            slug: article.slug || "",
            content: article.content || "",
            content_sw: article.content_sw || "",
            summary: article.summary || "",
            summary_sw: article.summary_sw || "",
            image_url: article.image_url || "",
            featured_image_caption: article.featured_image_caption || "",
            type: article.type || "News",
            category: article.category || "Announcement",
            status: normalizePublishStatus(article.status, !!article.is_published),
            featuredMenuId: article.featured_menu?.id || ""
          });
        }
      }
    } catch (err) {
      toast.error("Failed to load article data");
    } finally {
      if (!isNew) setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and Content are required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await postApi('/news', formData);
        toast.success("Article published successfully");
        router.push('/admin/news');
      } else {
        await patchApi(`/news/${id}`, formData);
        toast.success("Article updated successfully");
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse">Retrieving Content...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-8">
         <div className="flex items-center space-x-6">
            <button onClick={() => router.back()} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft size={20} />
            </button>
            <div>
               <h2 className="text-3xl font-black text-primary-darker font-serif ">{isNew ? "New Article" : "Edit Publication"}</h2>
               <p className="text-slate-500 text-sm font-medium">Draft and publish institutional content across the campus ecosystem.</p>
            </div>
         </div>
         <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
         >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{isNew ? "Launch Article" : "Update Content"}</span>
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Article Heading</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title || ""}
                    onChange={e => setFormData(prev => ({...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')}))}
                    className="w-full bg-slate-50 border-none p-5 text-xl font-black text-primary-darker outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter a compelling title..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title (Swahili) — optional</label>
                  <input 
                    type="text" 
                    name="title_sw"
                    value={formData.title_sw || ""}
                    onChange={e => setFormData(prev => ({...prev, title_sw: e.target.value}))}
                    className="w-full bg-slate-50 border-none p-4 text-base font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Kichwa cha Kiswahili..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summary (English) — optional</label>
                  <textarea 
                    name="summary"
                    value={formData.summary || ""}
                    onChange={e => setFormData(prev => ({...prev, summary: e.target.value}))}
                    rows={3}
                    className="w-full bg-slate-50 border-none p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary resize-y"
                    placeholder="Short public summary shown on article pages..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summary (Swahili) — optional</label>
                  <textarea 
                    name="summary_sw"
                    value={formData.summary_sw || ""}
                    onChange={e => setFormData(prev => ({...prev, summary_sw: e.target.value}))}
                    rows={3}
                    className="w-full bg-slate-50 border-none p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary resize-y"
                    placeholder="Muhtasari wa Kiswahili..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Body</label>
                  <TiptapEditor 
                    content={formData.content || ""} 
                    onChange={val => setFormData(prev => ({...prev, content: val}))} 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Body (Swahili) — optional</label>
                  <TiptapEditor 
                    content={formData.content_sw || ""} 
                    onChange={val => setFormData(prev => ({...prev, content_sw: val}))} 
                  />
               </div>
            </div>
         </div>

         {/* Sidebar Settings */}
         <div className="space-y-8">
            {/* Classification */}
            <div className="bg-primary-darker p-8 text-white space-y-6 shadow-2xl">
               <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-white/10 pb-4">Classification</h3>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Content Type</label>
                     <div className="grid grid-cols-2 gap-2">
                        {['News', 'Research', 'Event'].map(t => (
                           <button 
                             key={t}
                             onClick={() => setFormData(prev => ({...prev, type: t}))}
                             className={`p-3 text-[9px] font-black uppercase border transition-all ${
                               formData.type === t ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:border-white/30"
                             }`}
                           >
                             {t}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category Tag</label>
                     <input 
                        type="text" 
                        name="category"
                        value={formData.category || ""}
                        onChange={e => setFormData(prev => ({...prev, category: e.target.value}))}
                        className="w-full bg-white/5 border-none p-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary text-white"
                        placeholder="e.g. Announcement"
                     />
                  </div>
               </div>
            </div>

            {/* Visuals */}
            <div className="bg-white border border-slate-200 p-8 space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                  <ImageIcon size={14} />
                  <span>Featured Media</span>
               </h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ">Image Asset</label>
                      <div className="flex bg-slate-100 p-1 rounded-sm">
                         {['URL', 'UPLOAD'].map(m => (
                            <button 
                               key={m}
                               onClick={(e) => { e.preventDefault(); setUploadMode(m as any); }}
                               className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter ${uploadMode === m ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                            >
                               {m}
                            </button>
                         ))}
                      </div>
                   </div>

                   {uploadMode === 'URL' ? (
                      <div className="space-y-1">
                         <input 
                            type="text" 
                            name="image_url" value={formData.image_url || ""}
                            onChange={e => setFormData(prev => ({...prev, image_url: e.target.value}))}
                            className="w-full bg-slate-50 border-none p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                            placeholder="https://..."
                         />
                         <p className="text-[8px] text-slate-400 font-medium px-1">Tip: Use direct image URLs (ending in .jpg, .png, etc.)</p>
                      </div>
                   ) : (
                      <div className="relative">
                         <input 
                            type="file" 
                            onChange={async (e) => {
                               const file = e.target.files?.[0];
                               if (!file) return;
                               
                               try {
                                  setSaving(true);
                                  const res = await uploadFile(file);
                                  if (res?.url) {
                                     setFormData(prev => ({...prev, image_url: res.url}));
                                     toast.success("Asset uploaded successfully");
                                  }
                               } catch (err) {
                                  toast.error("Upload failed");
                               } finally {
                                  setSaving(false);
                               }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                         />
                         <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 text-center">
                            <ImageIcon className="mx-auto text-slate-300 mb-2" size={24} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to Select File</p>
                         </div>
                      </div>
                   )}

                   {formData.image_url && (
                      <div className="relative group aspect-video overflow-hidden border border-slate-100 p-1 bg-slate-50">
                         <img 
                            src={resolveImageUrl(formData.image_url)} 
                            alt="Article Preview" 
                            onError={(e) => {
                               (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/001f26/white?text=Invalid+Image+URL';
                            }}
                            className="w-full h-full object-cover transition-all duration-700"
                         />
                         <div className="absolute inset-0 bg-primary-darker/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-[8px] font-black uppercase text-white tracking-widest">Asset Resolved</span>
                         </div>
                      </div>
                   )}

                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ">Image Caption</label>
                      <input 
                         type="text" 
                         name="featured_image_caption"
                         value={formData.featured_image_caption || ""}
                         onChange={e => setFormData(prev => ({...prev, featured_image_caption: e.target.value}))}
                         className="w-full bg-slate-50 border-none p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                      />
                   </div>
                </div>
             </div>

             {/* Navigation Synergy */}
             <div className="bg-primary/5 border border-primary/20 p-8 space-y-6 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-2">
                  <Globe size={14} />
                  <span>Menu Integration</span>
               </h3>
               <div className="space-y-4">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Designate this article to appear as "Featured Content" in a specific sub-menu.</p>
                  <CustomSelect 
                      options={[
                        { value: "", label: "Do Not Feature" },
                        ...menus.map(m => ({ value: m.id, label: m.title }))
                      ]}
                      value={formData.featuredMenuId || ""}
                      onChange={val => setFormData(prev => ({...prev, featuredMenuId: val}))}
                      placeholder="Select Menu Location"
                   />
               </div>
            </div>

            {/* Workflow Status */}
            <div className="bg-primary/5 border border-primary/20 p-8 space-y-6 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-2">
                  <Tag size={14} />
                  <span>Workflow Status</span>
               </h3>
               <div className="space-y-4">
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Set the publishing status of this content. Only PUBLISHED content is visible to the public.</p>
                  <CustomSelect 
                      options={PUBLISH_STATUS_OPTIONS}
                      value={formData.status || "DRAFT"}
                      onChange={val => setFormData(prev => ({...prev, status: val}))}
                      placeholder="Select Status"
                   />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
