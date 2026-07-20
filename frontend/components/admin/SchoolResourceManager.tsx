"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw,
  Edit2,
  X,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  File
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CustomConfirmModal from "./CustomConfirmModal";

interface SchoolResourceManagerProps {
  schoolId: string;
  schoolSlug: string;
}

export default function SchoolResourceManager({ schoolId, schoolSlug }: SchoolResourceManagerProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger"
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Import State
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSourceSchool, setSelectedSourceSchool] = useState("");
  const [processingImport, setProcessingImport] = useState(false);
  const [shouldClearBeforeImport, setShouldClearBeforeImport] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "PDF",
    category: "Learning Guides",
    file_url: "",
    external_link: "",
    file_size: ""
  });

  useEffect(() => {
    if (schoolId) {
      fetchResources();
    }
  }, [schoolId, page]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getApi('/schools');
        setAllSchools(data.filter((s: any) => s.id !== schoolId));
      } catch (e) {}
    };
    fetchSchools();
  }, [schoolId]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await getApi(`/school-resources?schoolId=${schoolId}&page=${page}&limit=${limit}`);
      if (response && response.data) {
        setResources(response.data);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } else {
        setResources(response || []);
        setTotal(response?.length || 0);
      }
    } catch (err) {
      toast.error("Failed to load school resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await postApi(`/school-resources/seed/${schoolId}`, {});
      if (res.success) {
        toast.success(`Successfully initialized repository with ${res.count} institutional resources`);
        fetchResources();
      }
    } catch (e) {
      toast.error("Failed to initialize baseline");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setConfirmConfig({
      isOpen: true,
      title: "Clear All Resources",
      message: "Are you sure you want to PERMANENTLY delete ALL resources for this school? This action cannot be reversed.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteApi(`/school-resources/clear/${schoolId}`);
          toast.success("Resources purged successfully");
          fetchResources();
        } catch (e) {
          toast.error("Failed to clear resources");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleImport = async () => {
    if (!selectedSourceSchool) {
      toast.error("Please select a source school");
      return;
    }
    
    setProcessingImport(true);
    try {
      if (shouldClearBeforeImport) {
        await deleteApi(`/school-resources/clear/${schoolId}`);
      }

      const res = await postApi('/school-resources/import', {
        fromSchoolSlug: selectedSourceSchool,
        toSchoolId: schoolId
      });
      if (res.success) {
        toast.success(`Successfully imported ${res.count} resources`);
        setIsImporting(false);
        fetchResources();
      } else {
        toast.error(res.message || "Import failed");
      }
    } catch (e) {
      toast.error("Failed to process institutional import");
    } finally {
      setProcessingImport(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      if (editingId) {
        await patchApi(`/school-resources/${editingId}`, formData);
        toast.success("Resource updated");
      } else {
        await postApi('/school-resources', { ...formData, schoolId });
        toast.success("Resource added to repository");
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ 
        title: "", 
        description: "", 
        type: "PDF", 
        category: "Learning Guides",
        file_url: "",
        external_link: "",
        file_size: ""
      });
      fetchResources();
    } catch (err) {
      toast.error("Failed to save resource");
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remove Resource",
      message: "Are you sure you want to remove this resource from the repository?",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteApi(`/school-resources/${id}`);
          toast.success("Resource removed");
          fetchResources();
        } catch (err) {
          toast.error("Failed to remove resource");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const categories = ["Learning Guides", "Faculty Policies", "Exam Past Papers", "Research Templates", "General Resources"];
  const resourceTypes = ["PDF", "DOCX", "Excel", "External Link", "Other"];

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Knowledge Repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <CustomConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-primary-darker font-serif italic uppercase tracking-tight">Institutional Resources</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manage learning materials, policies, and research templates ({total} Total)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleClear}
            className="bg-red-50 hover:bg-red-100 text-red-500 py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 size={16} />
            <span>Clear Repository</span>
          </button>
          <button 
            onClick={handleSeed}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw size={16} />
            <span>Sync Baseline</span>
          </button>
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Copy size={16} />
            <span>Import Resources</span>
          </button>
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ 
                title: "", 
                description: "", 
                type: "PDF", 
                category: "Learning Guides",
                file_url: "",
                external_link: "",
                file_size: ""
              });
            }}
            className="bg-primary hover:bg-[#ff7f50] text-white py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isImporting && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-slate-900 text-white p-12 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8"
           >
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <h4 className="text-xl font-black uppercase tracking-tight italic">Knowledge Sync</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clone a resource repository from another faculty</p>
                 </div>
                 <button onClick={() => setIsImporting(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                 <div className="md:col-span-2 space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Source School</label>
                    <select 
                      value={selectedSourceSchool}
                      onChange={(e) => setSelectedSourceSchool(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-5 text-sm font-bold text-white rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                    >
                       <option value="">Select a school to copy from...</option>
                       {allSchools.map(s => <option key={s.id} value={s.slug} className="text-primary-darker">{s.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <button 
                      onClick={handleImport}
                      disabled={processingImport || !selectedSourceSchool}
                      className="w-full bg-white text-primary-darker py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                        {processingImport ? 'Processing...' : 'Sync Repository'}
                    </button>
                 </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
                 <input 
                    type="checkbox" 
                    id="clearBeforeResources"
                    checked={shouldClearBeforeImport}
                    onChange={(e) => setShouldClearBeforeImport(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0"
                 />
                 <label htmlFor="clearBeforeResources" className="text-[9px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                    Clear existing resources before syncing (Prevents Duplication)
                 </label>
              </div>
           </motion.div>
        )}

        {(isAdding || editingId) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-10 rounded-[3rem] border-2 border-primary/20 shadow-2xl space-y-8"
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
               <h4 className="text-sm font-black uppercase tracking-widest text-primary-darker">
                  {editingId ? 'Edit Resource Details' : 'Register New Academic Resource'}
               </h4>
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-red-500">
                  <X size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Research Proposal Framework"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Academic Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                >
                  {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">File Size (e.g., 1.2 MB)</label>
                <input 
                  type="text" 
                  value={formData.file_size}
                  onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional size indicator"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">File URL (S3/Public Link)</label>
                <input 
                  type="text" 
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="URL to the downloadable file"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">External Reference (Optional)</label>
                <input 
                  type="text" 
                  value={formData.external_link}
                  onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="URL for 'Read More' or external site"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource Context</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 rounded-[2rem] outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Provide details about what this resource contains..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                className="bg-primary-darker text-white py-4 px-12 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
              >
                {editingId ? 'Update Resource' : 'Save to Repository'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Resource Details</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Categorization</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Type & Size</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {resources?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <File size={40} className="text-slate-100" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No resources found in repository</p>
                  </div>
                </td>
              </tr>
            ) : (
              resources?.map((res) => (
                <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-primary-darker uppercase tracking-tight">{res.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-xs">{res.description || 'No context provided'}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border bg-primary/5 text-primary border-primary/20">
                      {res.category}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col space-y-1">
                       <div className="flex items-center space-x-2 text-[10px] font-black text-primary-darker uppercase">
                          {res.type === 'External Link' ? <LinkIcon size={12} className="text-slate-300" /> : <FileText size={12} className="text-slate-300" />}
                          <span>{res.type}</span>
                       </div>
                       {res.file_size && (
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                             {res.file_size}
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       {res.file_url && (
                          <a 
                            href={res.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                            title="Download/View File"
                          >
                            <Download size={16} />
                          </a>
                       )}
                       {res.external_link && (
                          <a 
                            href={res.external_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                            title="Open Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                       )}
                       <button 
                        onClick={() => {
                          setEditingId(res.id);
                          setFormData({
                            title: res.title,
                            description: res.description || "",
                            type: res.type,
                            category: res.category,
                            file_url: res.file_url || "",
                            external_link: res.external_link || "",
                            file_size: res.file_size || ""
                          });
                          setIsAdding(false);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                        onClick={() => handleDelete(res.id)}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
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

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Showing Page <span className="text-primary-darker">{page}</span> of {totalPages}
             </p>
             <div className="flex items-center space-x-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Next
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
