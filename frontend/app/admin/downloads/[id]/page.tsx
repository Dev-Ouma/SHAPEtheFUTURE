"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
  CheckCircle2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getApi, putApi, uploadFile } from "@/lib/api";
import { CustomSelect } from "@/components/ui/CustomSelect";
import PermissionGate from "@/components/admin/PermissionGate";

export default function EditDownload() {
  return (
    <PermissionGate permission="downloads.manage">
      <EditDownloadInner />
    </PermissionGate>
  );
}

function EditDownloadInner() {
  const router = useRouter();
  const { id } = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceType, setSourceType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
    const loadData = async () => {
      try {
        const [cats, doc] = await Promise.all([
          getApi('/downloads/categories'),
          getApi(`/downloads/id/${id}`)
        ]);
        
        setCategories(cats);
        // Sanitize incoming data to prevent null values for controlled inputs
        const sanitizedDoc = { ...doc };
        Object.keys(sanitizedDoc).forEach(key => {
          if (sanitizedDoc[key] === null) sanitizedDoc[key] = "";
        });
        
        setFormData({
          ...sanitizedDoc,
          category_id: doc.category?.id || "",
          requires_login: !!doc.requires_authentication, // Ensure strict boolean
          file_url: doc.file_url || "",
          external_url: doc.external_url || ""
        });
        // Auto-detect source type
        if (doc.external_url) setSourceType('url');
        else if (doc.file_url) setSourceType('file');
      } catch (err) {
        toast.error("Failed to load document data");
      } finally {
        setFetching(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFileUrl = formData.file_url;
      
      // Stage 1: Absolute Binary Orchestration
      if (sourceType === 'file' && selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        finalFileUrl = uploadRes.url || uploadRes.path; // Adapt based on API response structure
      }

      // Stage 2: Metadata Registry Synchronisation
      const payload = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary,
        description: formData.description,
        document_type: formData.document_type,
        status: formData.status,
        access_level: formData.access_level,
        file_url: sourceType === 'file' ? finalFileUrl : null,
        external_url: sourceType === 'url' ? formData.external_url : null,
        file_name: formData.file_name,
        file_size: formData.file_size,
        version: formData.version,
        language: formData.language,
        requires_authentication: formData.requires_login,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
        show_on_homepage: formData.show_on_homepage,
        allow_preview: formData.allow_preview,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        category: { id: formData.category_id }
      };

      await putApi(`/downloads/${id}`, payload);

      toast.success("Document updated successfully");
      router.push("/admin/downloads");
    } catch (err) {
      toast.error("Failed to update document");
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
      meta_title: prev.meta_title === "" || prev.meta_title === `${prev.title} | OUK` 
        ? `${val} | Downloads | OUK` 
        : prev.meta_title
    }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      summary: val,
      meta_description: prev.meta_description === "" || prev.meta_description === prev.summary.slice(0, 157) + '...'
        ? val.slice(0, 157) + (val.length > 157 ? '...' : '')
        : prev.meta_description
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    }

    if (file) {
      const extension = file.name.split('.').pop()?.toUpperCase() || "";
      if (extension !== 'PDF') {
        toast.error("Only PDF documents are allowed");
        return;
      }
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file_name: file?.name || "",
        file_size: file?.size || 0,
        document_type: 'PDF'
      }));
      setSourceType('file');
      toast.success(`Orchestrated: ${extension} metadata staged for synchronisation`);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e);
  };

  if (fetching) return (
     <div className="flex items-center justify-center py-40">
        <div className="animate-spin text-primary rounded-full h-12 w-12 border-b-2 border-primary"></div>
     </div>
  );

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
              <h2 className="text-3xl font-black text-primary-darker font-serif lowercase tracking-tighter capitalize">Orchestrate Resource</h2>
              <p className="text-slate-500 text-sm font-medium">Modifying: <span className="text-primary">{formData.title}</span></p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{loading ? "Updating..." : "Update Document"}</span>
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
                          className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <CustomSelect 
                         label="Category"
                         options={categories.map(c => ({ value: c.id, label: c.name }))}
                         value={formData.category_id}
                         onChange={(val) => setFormData({...formData, category_id: val})}
                       />
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Language</label>
                          <input 
                             type="text" 
                             value={formData.language}
                             onChange={(e) => setFormData({...formData, language: e.target.value})}
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none text-xs"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Short Summary</label>
                       <textarea 
                          rows={3}
                          value={formData.summary}
                          onChange={handleSummaryChange}
                          className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none resize-none"
                       />
                    </div>
                 </div>
              </div>

               {/* Section 2: File Management */}
              <div 
                className={`bg-white border-2 rounded-[2.5rem] p-10 space-y-8 shadow-sm transition-all relative overflow-hidden ${
                  isDragging ? 'border-primary border-dashed bg-primary/5' : 'border-slate-200'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                 {isDragging && (
                   <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center text-primary animate-in fade-in zoom-in duration-300">
                      <div className="bg-white p-6 rounded-full shadow-2xl mb-4">
                        <Upload size={48} className="animate-bounce" />
                      </div>
                      <p className="text-xl font-black uppercase tracking-tighter">Drop to Synchronise Metadata</p>
                      <p className="text-sm font-bold opacity-60 uppercase tracking-widest mt-1">Automatic Size & Type Detection</p>
                   </div>
                 )}

                  <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Upload size={18} />
                      </div>
                      <h3 className="text-lg font-black text-primary-darker uppercase tracking-tight">Technical Metadata</h3>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                          { id: 'url', label: 'External URL', icon: <Globe size={12} /> },
                          { id: 'file', label: 'Local File', icon: <Plus size={12} /> }
                        ].map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSourceType(type.id as 'url' | 'file')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              sourceType === type.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {type.icon}
                            {type.label}
                          </button>
                        ))}
                      </div>
                  </div>
 
                 <div className="space-y-6">
                    <div className={`space-y-2 transition-all duration-500 ${sourceType === 'url' ? 'opacity-100 scale-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">External File URL</label>
                       <div className="relative group">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                             type="url" 
                             value={formData.external_url}
                             onChange={(e) => setFormData({...formData, external_url: e.target.value})}
                             placeholder="https://institutional-repository.ouk.ac.ke/..."
                             className="w-full bg-slate-50 border-none p-5 pl-14 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                    </div>
 
                    <div className="grid grid-cols-3 gap-6">
                       <input 
                         type="file" 
                         className="hidden" 
                         accept=".pdf"
                         ref={fileInputRef} 
                         onChange={handleFileChange}
                       />
                       <CustomSelect 
                          label="File Type"
                          options={[
                            { value: 'PDF', label: 'PDF Document' },
                            { value: 'DOCX', label: 'Word (DOCX)' },
                            { value: 'XLSX', label: 'Excel (XLSX)' },
                            { value: 'ZIP', label: 'Archive (ZIP)' },
                            { value: 'CSV', label: 'Dataset (CSV)' },
                            { value: 'DMG', label: 'MacOS (DMG)' },
                            { value: 'PKG', label: 'Package (PKG)' }
                          ]}
                          value={formData.document_type}
                          onChange={(val) => setFormData({...formData, document_type: val})}
                       />
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                            <span>File Size (Bytes)</span>
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`text-primary hover:underline lowercase font-black transition-all ${sourceType === 'file' ? 'scale-110' : 'opacity-40'}`}
                            >
                              Pick File
                            </button>
                          </label>
                          <input 
                             type="number" 
                             value={formData.file_size}
                             onChange={(e) => setFormData({...formData, file_size: parseInt(e.target.value)})}
                             disabled={sourceType === 'url'}
                             className={`w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all ${sourceType === 'url' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Version</label>
                          <input 
                             type="text" 
                             value={formData.version}
                             onChange={(e) => setFormData({...formData, version: e.target.value})}
                             placeholder="e.g. v1.0"
                             className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                          />
                       </div>
                    </div>
                 </div>

                 {formData.file_name && (
                    <div className="mt-4 pt-6 border-t border-slate-50 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                             <CheckCircle2 size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronised Asset</p>
                             <p className="text-xs font-bold text-slate-700">{formData.file_name}</p>
                          </div>
                       </div>
                       <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                          Orchestrated
                       </div>
                    </div>
                 )}
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
                    <CustomSelect 
                        label="Access Level"
                        options={[
                          { value: 'Public', label: 'Public Access', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
                          { value: 'Registered', label: 'Registered Only', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
                          { value: 'Staff', label: 'Staff Internal', icon: <div className="w-2 h-2 rounded-full bg-purple-500" /> },
                          { value: 'Restricted', label: 'Restricted Hub', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
                        ]}
                        value={formData.access_level}
                        onChange={(val) => setFormData({...formData, access_level: val})}
                     />
                    
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
           </div>
        </div>
      </div>
    </div>
  );
}
