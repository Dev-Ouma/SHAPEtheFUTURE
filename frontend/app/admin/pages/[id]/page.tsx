"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Save, 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  Layout,
  Type,
  FileText,
  Settings,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Tag
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import FileUpload from "@/components/admin/FileUpload";
import { getApi, postApi, patchApi, getCategories } from "@/lib/api";
import { validateImageDimensions } from "@/lib/validators";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSelect } from "@/components/ui/CustomSelect";
import PermissionGate from "@/components/admin/PermissionGate";
import { normalizePublishStatus, PUBLISH_STATUS_OPTIONS } from "@/lib/publish-status";

export default function PageEditor() {
  return (
    <PermissionGate permission="pages.manage">
      <PageEditorInner />
    </PermissionGate>
  );
}

function PageEditorInner() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";
  
  const [page, setPage] = useState<any>({
    title: "",
    title_sw: "",
    slug: "",
    content: "",
    content_sw: "",
    summary: "",
    summary_sw: "",
    banner_image: "",
    parent_slug: "",
    meta_title: "",
    meta_title_sw: "",
    meta_description: "",
    meta_description_sw: "",
    layout_template: "default",
    leadership_name: "",
    leadership_position: "",
    status: "DRAFT",
    layout_data: {},
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'narrative' | 'layout' | 'seo'>('identity');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [allPages, cats] = await Promise.all([
        getApi('/pages/admin'),
        getCategories()
      ]);
      
      setCategories(cats || []);

      if (!isNew) {
        const found = allPages.find((p: any) => p.id === id);
        if (found) {
          setPage({
            ...found,
            summary: found.summary || "",
            banner_image: found.banner_image || "",
            parent_slug: found.parent_slug || "",
            meta_title: found.meta_title || "",
            meta_description: found.meta_description || "",
            layout_template: found.layout_template || "default",
            leadership_name: found.leadership_name || "",
            leadership_position: found.leadership_position || "",
            status: normalizePublishStatus(found.status, !!found.is_published),
            layout_data: found.layout_data || {},
          });
        } else {
          toast.error("Institutional document not found");
        }
      }
    } catch (error) {
      toast.error("Failed to retrieve system data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page.title || !page.slug) {
      toast.error("Title and Slug are mandatory");
      return;
    }

    // Dimension Validation for Leadership
    if (page.layout_template === "leadership" && page.banner_image) {
      const isValid = await validateImageDimensions(page.banner_image, 800, 800);
      if (typeof isValid === "string") {
        setValidationError(isValid);
        toast.error("Visual Quality Guardrail Triggered");
        return;
      }
    }
    
    setSaving(true);
    setValidationError(null);
    try {
      if (isNew) {
        await postApi('/pages', page);
        toast.success("New institutional page established");
        router.push("/admin/pages");
      } else {
        await patchApi(`/pages/${id}`, page);
        toast.success("Record updated successfully");
      }
    } catch (error) {
      toast.error("Synchronisation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <RefreshCw className="animate-spin text-primary" size={48} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Accessing Archive...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 h-full relative">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 -mx-8 px-8 py-6 mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Document Editor</p>
            <h2 className="text-2xl font-black text-primary-darker font-serif tracking-tighter uppercase leading-tight">
              {isNew ? "Create New Asset" : page.title || "Untitled Document"}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
           {!isNew && (
             <Link 
               href={page.slug.startsWith('http') ? page.slug : `/${page.slug}`} 
               target="_blank" 
               className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-primary transition-colors flex items-center space-x-3 shadow-sm rounded-xl"
             >
                <Eye size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Live Preview</span>
             </Link>
           )}
           <button 
             onClick={handleSave}
             disabled={saving}
             className="btn-primary py-4 px-10 flex items-center space-x-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl"
           >
             {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
             <span>{saving ? "Synchronising..." : "Commit Changes"}</span>
           </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl w-fit border border-slate-100">
        {[
          { id: 'identity', label: 'Institutional Identity', icon: <FileText size={16} /> },
          { id: 'narrative', label: 'The Narrative', icon: <Type size={16} /> },
          { id: 'layout', label: 'Layout Config', icon: <Settings size={16} /> },
          { id: 'seo', label: 'Search Analytics', icon: <Globe size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? "bg-white text-primary shadow-sm ring-1 ring-slate-200" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Editor Content Area */}
        <div className="space-y-10 min-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                 <div className="lg:col-span-8 space-y-10">
                    <div className="bg-white p-12 border border-slate-200 rounded-[2.5rem] space-y-12 relative overflow-hidden shadow-sm">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Heading</label>
                          <input 
                            type="text" 
                            value={page.title} 
                            onChange={(e) => setPage({ ...page, title: e.target.value })}
                            className="w-full bg-slate-50/50 border-none p-8 text-4xl font-black text-primary-darker focus:ring-4 focus:ring-primary shadow-inner outline-none rounded-3xl"
                            placeholder="The Future of Learning..."
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kiswahili Heading (optional)</label>
                          <input 
                            type="text" 
                            value={page.title_sw || ""} 
                            onChange={(e) => setPage({ ...page, title_sw: e.target.value })}
                            className="w-full bg-slate-50/50 border-none p-6 text-2xl font-black text-primary-darker focus:ring-4 focus:ring-primary shadow-inner outline-none rounded-3xl"
                            placeholder="Kichwa cha Kiswahili..."
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Executive Summary</label>
                          <textarea 
                            value={page.summary} 
                            onChange={(e) => setPage({ ...page, summary: e.target.value })}
                            className="w-full bg-slate-50/50 border-none p-8 text-base font-medium text-slate-600 focus:ring-4 focus:ring-primary shadow-inner outline-none h-48 leading-relaxed rounded-3xl"
                            placeholder="A concise institutional summary..."
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kiswahili Summary (optional)</label>
                          <textarea 
                            value={page.summary_sw || ""} 
                            onChange={(e) => setPage({ ...page, summary_sw: e.target.value })}
                            className="w-full bg-slate-50/50 border-none p-6 text-base font-medium text-slate-600 focus:ring-4 focus:ring-primary shadow-inner outline-none h-36 leading-relaxed rounded-3xl"
                            placeholder="Muhtasari wa Kiswahili..."
                          />
                        </div>
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-10">
                    {/* Media */}
                    <div className="bg-white p-10 border border-slate-200 rounded-[2.5rem] space-y-8 shadow-sm">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-darker pb-4 border-b border-slate-50">Media Asset</h3>
                       <FileUpload 
                          label="Institutional Banner"
                          currentValue={page.banner_image} 
                          onUploadComplete={(url) => setPage({ ...page, banner_image: url })}
                       />
                       <input 
                         type="text" 
                         value={page.banner_image || ""} 
                         onChange={(e) => setPage({ ...page, banner_image: e.target.value })}
                         className="w-full bg-slate-50 border border-slate-100 p-4 text-[10px] font-bold text-slate-400 rounded-xl outline-none"
                         placeholder="Resource URL..."
                       />
                    </div>

                    {/* Registry Path */}
                    <div className="bg-white p-10 border border-slate-200 rounded-[2.5rem] space-y-8 shadow-sm">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-darker pb-4 border-b border-slate-50">Registry Access</h3>
                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource URI</label>
                             <div className="flex">
                                <span className="bg-slate-50 px-4 flex items-center text-[10px] font-black text-slate-300 border border-slate-100 border-r-0 rounded-l-xl">/</span>
                                <input 
                                  type="text" 
                                  value={page.slug} 
                                  onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                  className="flex-1 bg-slate-50 border border-slate-100 p-4 font-black text-xs text-primary-darker rounded-r-xl outline-none focus:ring-2 focus:ring-primary"
                                />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hub Hierarchy</label>
                             <select 
                                value={page.parent_slug || ""}
                                onChange={(e) => setPage({ ...page, parent_slug: e.target.value })}
                                className="w-full bg-slate-50 border-none p-4 font-black uppercase tracking-widest text-[10px] text-primary-darker rounded-xl outline-none"
                             >
                                <option value="">Root Level</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                          </div>
                        </div>
                     </div>

                     {/* Workflow Status */}
                     <div className="bg-primary/5 p-10 border border-primary/20 rounded-[2.5rem] space-y-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pb-4 border-b border-primary/10 flex items-center space-x-2">
                           <Tag size={14} />
                           <span>Workflow Status</span>
                        </h3>
                        <div className="space-y-4">
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Set the publishing status of this page. Only PUBLISHED pages are visible to the public.</p>
                           <CustomSelect 
                               options={PUBLISH_STATUS_OPTIONS}
                               value={page.status || "DRAFT"}
                               onChange={val => setPage((prev: any) => ({...prev, status: val}))}
                               placeholder="Select Status"
                            />
                        </div>
                     </div>

                  </div>
               </motion.div>
            )}

            {activeTab === 'narrative' && (
              <motion.div
                key="narrative"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white p-12 border border-slate-200 rounded-[3rem] shadow-sm relative"
              >
                 <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-slate-50">
                    <Type size={18} className="text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary-darker font-serif">Narrative Architecture</h3>
                 </div>
                 <div className="space-y-10">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">English body</label>
                     <RichTextEditor 
                       content={page.content} 
                       onChange={(content) => setPage({ ...page, content })} 
                     />
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kiswahili body (optional)</label>
                     <RichTextEditor 
                       content={page.content_sw || ""} 
                       onChange={(content_sw) => setPage({ ...page, content_sw })} 
                     />
                   </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'layout' && (
              <motion.div
                key="layout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                 <div className="bg-primary-darker p-12 rounded-[3rem] text-white space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex items-center space-x-4">
                          <Layout size={24} className="text-primary" />
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Blueprint</p>
                             <h3 className="text-2xl font-black uppercase tracking-tighter">Layout Synthesizer</h3>
                          </div>
                       </div>
                       <select 
                          value={page.layout_template}
                          onChange={(e) => setPage({ ...page, layout_template: e.target.value })}
                          className="bg-white/10 border border-white/10 p-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white outline-none focus:ring-2 focus:ring-primary h-auto"
                       >
                          <option value="default" className="text-primary-darker">Standard Narrative</option>
                          <option value="leadership" className="text-primary-darker">Executive Vision Profile</option>
                          <option value="uniqueness" className="text-primary-darker">OUK Uniqueness Layout</option>
                          <option value="governing-council" className="text-primary-darker">Governing Council Layout</option>
                          <option value="management-board" className="text-primary-darker">Management Board Layout</option>
                          <option value="downloads-hub" className="text-primary-darker">Downloads Hub Layout</option>
                          <option value="complaints-hub" className="text-primary-darker">Complaints Hub Layout</option>
                          <option value="how-to-apply-hub" className="text-primary-darker">How to Apply Hub Layout</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-10">
                    {page.layout_template === "leadership" && (
                      <div className="space-y-10">
                        {/* Executive Identity */}
                        <div className="bg-primary-darker p-10 text-white space-y-10 relative overflow-hidden rounded-[3rem]">
                           <div className="absolute top-0 right-0 p-4 opacity-10">
                              <User size={120} />
                           </div>
                           <div className="flex items-center space-x-3 border-b border-white/10 pb-6">
                              <ShieldCheck size={18} className="text-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Executive Profile Configuration</h3>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Full Name</label>
                                 <input 
                                   type="text" 
                                   value={page.leadership_name || ""} 
                                   onChange={(e) => setPage({ ...page, leadership_name: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Position</label>
                                 <input 
                                   type="text" 
                                   value={page.leadership_position || ""} 
                                   onChange={(e) => setPage({ ...page, leadership_position: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Honorific Title (e.g. Prof., Dr.)</label>
                                 <input 
                                   type="text" 
                                   value={page.layout_data?.honorific_title || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, honorific_title: e.target.value } })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                           </div>

                           <div className="pt-8 border-t border-white/10 space-y-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signature Message (Large Quote)</label>
                                 <textarea 
                                   value={page.layout_data?.message || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, message: e.target.value } })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-medium text-slate-300 focus:ring-2 focus:ring-primary outline-none h-24 rounded-xl"
                                   placeholder="In this digital age, education is the most powerful tool..."
                                 />
                              </div>
                           </div>

                           <div className="pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Email</label>
                                 <input 
                                   type="email" 
                                   value={page.layout_data?.email || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, email: e.target.value } })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</label>
                                 <input 
                                   type="text" 
                                   value={page.layout_data?.phone_number || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, phone_number: e.target.value } })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Website</label>
                                 <input 
                                   type="text" 
                                   value={page.layout_data?.website_url || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, website_url: e.target.value } })}
                                   className="w-full bg-white/5 border border-white/10 p-5 font-bold text-white focus:ring-2 focus:ring-primary outline-none rounded-xl"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Publications & Academic Credentials */}
                        <div className="bg-white p-12 border border-slate-200 rounded-[3rem] space-y-12 shadow-sm">
                           <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                              <ShieldCheck size={18} className="text-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Academic & Professional Credentials</h3>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Areas of Specialisation</label>
                                 <input 
                                   type="text" 
                                   value={page.layout_data?.specializations || ""} 
                                   onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, specializations: e.target.value } })}
                                   className="w-full bg-slate-50 border-none p-6 text-sm font-bold text-primary-darker shadow-inner rounded-2xl outline-none"
                                   placeholder="Digital Pedagogy, Cloud Infrastructure..."
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Start</label>
                                    <input 
                                      type="date" 
                                      value={page.layout_data?.service_start_date || ""} 
                                      onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, service_start_date: e.target.value } })}
                                      className="w-full bg-slate-50 border-none p-6 text-xs font-bold text-primary-darker rounded-2xl"
                                    />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service End</label>
                                    <input 
                                      type="date" 
                                      value={page.layout_data?.service_end_date || ""} 
                                      onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, service_end_date: e.target.value } })}
                                      className="w-full bg-slate-50 border-none p-6 text-xs font-bold text-primary-darker rounded-2xl"
                                    />
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scholarly Publications</label>
                              <RichTextEditor 
                                content={page.layout_data?.publications || ""} 
                                onChange={(content) => setPage({ ...page, layout_data: { ...page.layout_data, publications: content } })} 
                              />
                           </div>
                        </div>

                        {/* Social Matrix */}
                        <div className="bg-slate-50 p-12 border border-slate-200 rounded-[3rem] space-y-10">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-4">Scholarly Social Matrix</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {[
                                { label: "LinkedIn", key: "linkedin_url" },
                                { label: "Twitter/X", key: "twitter_url" },
                                { label: "GitHub", key: "github_url" },
                                { label: "Google Scholar", key: "google_scholar_url" },
                                { label: "ResearchGate", key: "researchgate_url" }
                              ].map(social => (
                                <div key={social.key} className="space-y-3">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{social.label}</label>
                                   <input 
                                     type="text" 
                                     value={page.layout_data?.[social.key] || ""} 
                                     onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, [social.key]: e.target.value } })}
                                     className="w-full bg-white border border-slate-200 p-5 rounded-xl text-xs font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                   />
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    )}

                    {page.layout_template === "uniqueness" && (
                      <div className="bg-white p-12 border border-slate-200 space-y-12 rounded-[3.5rem] shadow-sm">
                         <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                            <Zap size={18} className="text-secondary" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Uniqueness Features & Philosophy</h3>
                         </div>
                         
                         <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Philosophy Quote</label>
                            <textarea 
                              value={page.layout_data?.philosophy || ""} 
                              onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, philosophy: e.target.value } })}
                              className="w-full bg-slate-50 border-none p-8 text-lg font-black text-primary-darker shadow-inner h-32 rounded-[2rem] outline-none"
                              placeholder="Education is not a privilege..."
                            />
                         </div>

                         <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Feature Cards (4 Items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               {[0, 1, 2, 3].map((idx) => {
                                  const feature = page.layout_data?.features?.[idx] || { title: "", desc: "" };
                                  return (
                                    <div key={idx} className="p-10 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 relative shadow-sm">
                                       <span className="absolute top-4 right-6 text-[8px] font-black text-slate-200 uppercase tracking-tighter">Feature 0{idx + 1}</span>
                                       <input 
                                         type="text" 
                                         placeholder="Feature Title"
                                         value={feature.title}
                                         onChange={(e) => {
                                            const newFeatures = [...(page.layout_data?.features || Array(4).fill({title: "", desc: ""}))];
                                            newFeatures[idx] = { ...newFeatures[idx], title: e.target.value };
                                            setPage({ ...page, layout_data: { ...page.layout_data, features: newFeatures } });
                                         }}
                                         className="w-full bg-white border border-slate-200 p-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                       />
                                       <textarea 
                                         placeholder="Elaborate on this institutional strength..."
                                         value={feature.desc}
                                         onChange={(e) => {
                                            const newFeatures = [...(page.layout_data?.features || Array(4).fill({title: "", desc: ""}))];
                                            newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                                            setPage({ ...page, layout_data: { ...page.layout_data, features: newFeatures } });
                                         }}
                                         className="w-full bg-white border border-slate-200 p-6 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary h-28 rounded-2xl"
                                       />
                                    </div>
                                  );
                               })}
                            </div>
                         </div>
                      </div>
                    )}

                    {(page.layout_template === "governing-council" || page.layout_template === "management-board") && (
                      <div className="bg-white p-12 border border-slate-200 space-y-12 rounded-[3.5rem] shadow-sm">
                         <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                            <ShieldCheck size={18} className="text-primary" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Governance & Strategy Pillars</h3>
                         </div>
                         
                         <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Accent Text</label>
                            <input 
                              type="text" 
                              value={page.layout_data?.accent_text || ""} 
                              onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, accent_text: e.target.value } })}
                              className="w-full bg-slate-50 border-none p-8 text-sm font-black uppercase tracking-widest text-primary shadow-inner outline-none rounded-3xl"
                              placeholder="Architects of Digital Future..."
                            />
                         </div>

                         <div className="space-y-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Pillars (4 Items)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               {[0, 1, 2, 3].map((idx) => {
                                  const card = page.layout_data?.cards?.[idx] || { title: "", desc: "" };
                                  return (
                                    <div key={idx} className="p-10 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-sm">
                                       <input 
                                         type="text" 
                                         placeholder="Pillar Title"
                                         value={card.title}
                                         onChange={(e) => {
                                            const newCards = [...(page.layout_data?.cards || Array(4).fill({title: "", desc: ""}))];
                                            newCards[idx] = { ...newCards[idx], title: e.target.value };
                                            setPage({ ...page, layout_data: { ...page.layout_data, cards: newCards } });
                                         }}
                                         className="w-full bg-white border border-slate-200 p-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary rounded-2xl shadow-sm"
                                       />
                                       <textarea 
                                         placeholder="Pillar Core Philosophy..."
                                         value={card.desc}
                                         onChange={(e) => {
                                            const newCards = [...(page.layout_data?.cards || Array(4).fill({title: "", desc: ""}))];
                                            newCards[idx] = { ...newCards[idx], desc: e.target.value };
                                            setPage({ ...page, layout_data: { ...page.layout_data, cards: newCards } });
                                         }}
                                         className="w-full bg-white border border-slate-200 p-6 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary h-28 rounded-2xl shadow-sm"
                                       />
                                    </div>
                                  );
                               })}
                            </div>
                         </div>
                      </div>
                    )}

                    {page.layout_template === "how-to-apply-hub" && (
                      <div className="space-y-10">
                         {/* Pathway Orchestrator */}
                         <div className="bg-white p-12 border border-slate-200 rounded-[3.5rem] shadow-sm space-y-12">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                               <div className="flex items-center space-x-3">
                                  <Zap size={18} className="text-primary" />
                                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Application Pathway Steps</h3>
                               </div>
                               <span className="text-[10px] font-black text-slate-400">Total Steps: {(page.layout_data?.steps || []).length}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                               {[0, 1, 2, 3].map((idx) => {
                                  const step = page.layout_data?.steps?.[idx] || { step: `0${idx+1}`, title: "", desc: "", icon_type: "check", link: "", link_text: "" };
                                  return (
                                    <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8 relative overflow-hidden group">
                                       <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                          <span className="text-8xl font-black font-serif italic text-primary-darker tracking-tighter">{step.step}</span>
                                       </div>
                                       
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step Heading</label>
                                             <input 
                                                type="text" 
                                                value={step.title}
                                                onChange={(e) => {
                                                   const newSteps = [...(page.layout_data?.steps || Array(4).fill({}))];
                                                   newSteps[idx] = { ...step, title: e.target.value };
                                                   setPage({ ...page, layout_data: { ...page.layout_data, steps: newSteps } });
                                                }}
                                                className="w-full bg-white border border-slate-200 p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary rounded-xl"
                                                placeholder="Step Title"
                                             />
                                          </div>
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Functional Icon</label>
                                             <select 
                                                value={step.icon_type}
                                                onChange={(e) => {
                                                   const newSteps = [...(page.layout_data?.steps || Array(4).fill({}))];
                                                   newSteps[idx] = { ...step, icon_type: e.target.value };
                                                   setPage({ ...page, layout_data: { ...page.layout_data, steps: newSteps } });
                                                }}
                                                className="w-full bg-white border border-slate-200 p-4 text-xs font-bold text-slate-600 outline-none rounded-xl"
                                             >
                                                <option value="search">Search & Discovery</option>
                                                <option value="user-check">User Registration</option>
                                                <option value="file-plus">Document Submission</option>
                                                <option value="shield-check">Institutional Review</option>
                                             </select>
                                          </div>
                                       </div>

                                       <div className="space-y-4 relative z-10">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Core Description</label>
                                          <textarea 
                                             value={step.desc}
                                             onChange={(e) => {
                                                const newSteps = [...(page.layout_data?.steps || Array(4).fill({}))];
                                                newSteps[idx] = { ...step, desc: e.target.value };
                                                setPage({ ...page, layout_data: { ...page.layout_data, steps: newSteps } });
                                             }}
                                             className="w-full bg-white border border-slate-200 p-4 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary h-24 rounded-xl"
                                             placeholder="Step Description"
                                          />
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Action URI</label>
                                             <input 
                                                type="text" 
                                                value={step.link || ""}
                                                onChange={(e) => {
                                                   const newSteps = [...(page.layout_data?.steps || Array(4).fill({}))];
                                                   newSteps[idx] = { ...step, link: e.target.value };
                                                   setPage({ ...page, layout_data: { ...page.layout_data, steps: newSteps } });
                                                }}
                                                className="w-full bg-white border border-slate-200 p-4 text-xs font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-xl"
                                                placeholder="/admissions/portal or https://..."
                                             />
                                          </div>
                                          <div className="space-y-4">
                                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Action Label</label>
                                             <input 
                                                type="text" 
                                                value={step.link_text || ""}
                                                onChange={(e) => {
                                                   const newSteps = [...(page.layout_data?.steps || Array(4).fill({}))];
                                                   newSteps[idx] = { ...step, link_text: e.target.value };
                                                   setPage({ ...page, layout_data: { ...page.layout_data, steps: newSteps } });
                                                }}
                                                className="w-full bg-white border border-slate-200 p-4 text-[10px] font-black uppercase tracking-widest text-primary outline-none focus:ring-1 focus:ring-primary rounded-xl"
                                                placeholder="EX: CREATE ACCOUNT"
                                             />
                                          </div>
                                       </div>
                                    </div>
                                  );
                               })}
                            </div>
                         </div>

                         {/* Documentary Matrix Section */}
                         <div className="bg-white p-12 border border-slate-200 rounded-[3.5rem] shadow-sm space-y-12">
                            <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                               <ShieldCheck size={18} className="text-primary" />
                               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Registry Matrix (Document Requirements)</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                               {[0, 1, 2].map((idx) => {
                                  const req = page.layout_data?.requirements?.[idx] || { level: idx === 0 ? "Undergraduate" : idx === 1 ? "Postgraduate" : "Professional", docs: [], color_type: "primary" };
                                  return (
                                    <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                       <div className="space-y-4">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category Level</label>
                                          <input 
                                             type="text" 
                                             value={req.level}
                                             onChange={(e) => {
                                                const newReqs = [...(page.layout_data?.requirements || Array(3).fill({}))];
                                                newReqs[idx] = { ...req, level: e.target.value };
                                                setPage({ ...page, layout_data: { ...page.layout_data, requirements: newReqs } });
                                             }}
                                             className="w-full bg-white border border-slate-200 p-4 text-xs font-black uppercase tracking-widest outline-none rounded-xl shadow-sm"
                                          />
                                       </div>
                                       
                                       <div className="space-y-4">
                                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Required Documents (Comma Separated)</label>
                                          <textarea 
                                             value={(req.docs || []).join(', ')}
                                             onChange={(e) => {
                                                const newReqs = [...(page.layout_data?.requirements || Array(3).fill({}))];
                                                newReqs[idx] = { ...req, docs: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') };
                                                setPage({ ...page, layout_data: { ...page.layout_data, requirements: newReqs } });
                                             }}
                                             className="w-full bg-white border border-slate-200 p-4 text-xs font-medium text-slate-600 outline-none h-40 rounded-xl shadow-sm"
                                             placeholder="Document 1, Document 2, ..."
                                          />
                                       </div>
                                    </div>
                                  );
                               })}
                            </div>
                         </div>

                         {/* Strategic Portal Links */}
                         <div className="bg-primary-darker p-12 border border-white/10 rounded-[3.5rem] shadow-2xl space-y-12 text-white">
                            <div className="flex items-center space-x-3 border-b border-white/10 pb-6">
                               <RefreshCw size={18} className="text-secondary" />
                               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Strategic Conversion Hub</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Admission Portal Link</label>
                                  <input 
                                     type="text" 
                                     value={page.layout_data?.portal_link || ""}
                                     onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, portal_link: e.target.value } })}
                                     className="w-full bg-white/5 border border-white/10 p-6 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary rounded-2xl"
                                     placeholder="https://portal.ouk.ac.ke/register"
                                  />
                               </div>
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institutional Support Link</label>
                                  <input 
                                     type="text" 
                                     value={page.layout_data?.support_link || ""}
                                     onChange={(e) => setPage({ ...page, layout_data: { ...page.layout_data, support_link: e.target.value } })}
                                     className="w-full bg-white/5 border border-white/10 p-6 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary rounded-2xl"
                                     placeholder="/portal or /support"
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
              </motion.div>
            )}

            {activeTab === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-primary-darker p-16 rounded-[4rem] space-y-16 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Globe size={300} className="text-white" />
                 </div>

                 <div className="flex items-center space-x-6 relative z-10">
                    <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                       <Globe size={32} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Registry Optimisation</h3>
                       <p className="text-xs font-black uppercase tracking-widest text-slate-500">Configure global visibility and search engine aesthetics</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search Result Title</label>
                         <span className="text-[10px] font-bold text-slate-600">{(page.meta_title || "").length} / 60</span>
                      </div>
                      <input 
                        type="text" 
                        value={page.meta_title || ""} 
                        onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-8 text-xl font-bold text-white focus:ring-4 focus:ring-primary outline-none rounded-3xl"
                        placeholder="Ex: OUK | The Digital Frontier of Learning"
                      />
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Snippet Meta Description</label>
                         <span className="text-[10px] font-bold text-slate-600">{(page.meta_description || "").length} / 160</span>
                      </div>
                      <textarea 
                        value={page.meta_description || ""} 
                        onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-8 text-base font-medium text-slate-400 focus:ring-4 focus:ring-primary outline-none h-40 rounded-3xl"
                        placeholder="Provide a high-impact overview for search results..."
                      />
                   </div>
                 </div>

                 {/* SEO Preview Card */}
                 <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-4 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Result Preview</p>
                    <div className="space-y-2">
                       <p className="text-primary text-xl font-bold hover:underline cursor-pointer truncate">
                          {page.meta_title || page.title || "Untitled Document"}
                       </p>
                       <p className="text-green-500 text-sm truncate">https://ouk.ac.ke/{page.slug}</p>
                       <p className="text-slate-400 text-sm line-clamp-2 max-w-2xl">
                          {page.meta_description || page.summary || "This institutional asset represents OUK's commitment to digital excellence..."}
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
