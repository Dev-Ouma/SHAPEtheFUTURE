"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Lock, 
  FileText, 
  Upload, 
  Settings, 
  ShieldCheck,
  Layout,
  Info,
  Calendar,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getApi, postApi } from "@/lib/api";
import PermissionGate from "@/components/admin/PermissionGate";

export default function NewDownload() {
  return (
    <PermissionGate permission="downloads.manage">
      <NewDownloadInner />
    </PermissionGate>
  );
}

function NewDownloadInner() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    category_id: "",
    document_type: "PDF",
    status: "Draft",
    access_level: "Public",
    file_url: "",
    external_url: "",
    file_name: "",
    file_size: 0,
    version: "v1.0",
    language: "English",
    requires_login: false,
    meta_title: "",
    meta_description: "",
    is_featured: false,
    display_order: 0,
    show_on_homepage: true,
    allow_preview: true
  });

  useEffect(() => {
    getApi('/downloads/categories')
      .then(data => setCategories(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await postApi(`/downloads`, {
         ...formData,
         category: { id: formData.category_id }
      });

      toast.success("Document added to repository");
      router.push("/admin/downloads");
    } catch (err) {
      toast.error("Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      meta_title: `${val} | Downloads | OUK`
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/downloads" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-3xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize">New Institutional Resource</h2>
              <p className="text-slate-500 text-sm font-medium">Define metadata and access governance for the document.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? "Archiving..." : "Save Document"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Main Form Fields */}
           <div className="lg:col-span-2 space-y-12">
              
              {/* Section 1: Basic Information */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                 <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                       <FileText size={18} />
                    </div>
                    <h3 className="text-lg font-black text-primary-darker uppercase tracking-tight">Institutional Identity</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Title</label>
                       <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={handleTitleChange}
                          placeholder="e.g. University Charter 2024"
                          className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                          <select 
                             required
                             value={formData.category_id}
                             onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          >
                             <option value="">Select Category</option>
                             {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Language</label>
                          <input 
                             type="text" 
                             value={formData.language}
                             onChange={(e) => setFormData({...formData, language: e.target.value})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Summary (Used in cards)</label>
                       <textarea 
                          rows={3}
                          value={formData.summary}
                          onChange={(e) => setFormData({...formData, summary: e.target.value})}
                          placeholder="Briefly describe the significance of this document..."
                          className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none resize-none"
                       />
                    </div>
                 </div>
              </div>

              {/* Section 2: File Management */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
                 <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Upload size={18} />
                    </div>
                    <h3 className="text-lg font-black text-primary-darker uppercase tracking-tight">Technical Metadata</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">External File URL (Hosting Source)</label>
                       <div className="relative group">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                             type="url" 
                             value={formData.file_url}
                             onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                             placeholder="https://storage.ouk.ac.ke/docs/..."
                             className="w-full bg-slate-50 border-none p-5 pl-14 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">File Type</label>
                          <select 
                             value={formData.document_type}
                             onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          >
                             <option>PDF</option>
                             <option>DOCX</option>
                             <option>XLSX</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">File Size (Bytes)</label>
                          <input 
                             type="number" 
                             value={formData.file_size}
                             onChange={(e) => setFormData({...formData, file_size: parseInt(e.target.value)})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Version</label>
                          <input 
                             type="text" 
                             value={formData.version}
                             onChange={(e) => setFormData({...formData, version: e.target.value})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Section 4: SEO Metadata */}
              <div className="bg-primary-darker border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
                    <div className="p-2 bg-primary text-white rounded-lg">
                       <Layout size={18} />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">SEO & Indexing</h3>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meta Title</label>
                       <input 
                          type="text" 
                          value={formData.meta_title}
                          onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                          className="w-full bg-slate-800 border-none p-5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Meta Description</label>
                       <textarea 
                          rows={3}
                          value={formData.meta_description}
                          onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                          className="w-full bg-slate-800 border-none p-5 rounded-2xl font-bold text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar Controls */}
           <div className="space-y-8">
              {/* Publishing Status */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Workflow</h4>
                 </div>
                 <div className="space-y-4">
                    {['Draft', 'Review', 'Published', 'Archived'].map(status => (
                       <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({...formData, status})}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                             formData.status === status ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-500 hover:border-[#ff7f50]/30"
                          }`}
                       >
                          <span className="text-xs font-black uppercase tracking-widest">{status}</span>
                          {formData.status === status && <CheckCircle2 size={16} />}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Access Governance */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Governance</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-slate-400 block ml-1">Access Level</label>
                       <select 
                          value={formData.access_level}
                          onChange={(e) => setFormData({...formData, access_level: e.target.value})}
                          className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-primary-darker text-xs focus:ring-2 focus:ring-primary outline-none"
                       >
                          <option>Public</option>
                          <option>Registered</option>
                          <option>Staff</option>
                          <option>Restricted</option>
                       </select>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Lock size={16} className="text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Secure Access</span>
                       </div>
                       <input 
                          type="checkbox" 
                          checked={formData.requires_login}
                          onChange={(e) => setFormData({...formData, requires_login: e.target.checked})}
                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                       />
                    </div>
                 </div>
              </div>

              {/* Informational Note */}
              <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex items-start gap-4">
                 <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                    <strong>Note:</strong> Institutional documents are mirrored across mirrors automatically once published. Ensure the versioning matches the official university gazette.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
