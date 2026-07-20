"use client";

import React, { useState, useEffect } from "react";
import { 
  Beaker, 
  BookOpen, 
  Briefcase, 
  Globe, 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Users,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import CustomConfirmModal from "./CustomConfirmModal";

interface SchoolResearchManagerProps {
  schoolId: string;
  schoolSlug: string;
}

export default function SchoolResearchManager({ schoolId, schoolSlug }: SchoolResearchManagerProps) {
  const [activeTab, setActiveTab] = useState<"areas" | "projects" | "publications" | "partners">("areas");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab, schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "areas") endpoint = `/research/programmes?schoolId=${schoolId}`;
      else if (activeTab === "projects") endpoint = `/research/projects?schoolId=${schoolId}`;
      else if (activeTab === "publications") endpoint = `/research/publications?schoolId=${schoolId}`;
      else if (activeTab === "partners") endpoint = `/research/partners?schoolId=${schoolId}`;

      const res = await getApi(endpoint);
      setData(res.data || res || []);
    } catch (e) {
      toast.error("Failed to load research data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      let endpoint = "";
      if (activeTab === "areas") endpoint = "/research/programmes";
      else if (activeTab === "projects") endpoint = "/research/projects";
      else if (activeTab === "publications") endpoint = "/research/publications";
      else if (activeTab === "partners") endpoint = "/research/partners";

      if (editingId) {
        await patchApi(`${endpoint}/${editingId}`, formData);
        toast.success("Updated successfully");
      } else {
        await postApi(endpoint, { ...formData, schoolId, school_id: schoolId });
        toast.success("Added to repository");
      }
      setIsAdding(false);
      setEditingId(null);
      fetchData();
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to remove this item from the research repository?",
      variant: "danger",
      onConfirm: async () => {
        try {
          let endpoint = "";
          if (activeTab === "areas") endpoint = "/research/programmes";
          else if (activeTab === "projects") endpoint = "/research/projects";
          else if (activeTab === "publications") endpoint = "/research/publications";
          else if (activeTab === "partners") endpoint = "/research/partners";

          await deleteApi(`${endpoint}/${id}`);
          toast.success("Deleted successfully");
          fetchData();
        } catch (e) {
          toast.error("Deletion failed");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const tabs = [
    { id: "areas", label: "Research Areas", icon: Beaker },
    { id: "projects", label: "Active Projects", icon: Briefcase },
    { id: "publications", label: "Publications", icon: BookOpen },
    { id: "partners", label: "Collaboration", icon: Users },
  ];

  return (
    <div className="space-y-10">
      <CustomConfirmModal {...confirmConfig} onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-primary-darker font-serif italic uppercase tracking-tight">Research Command Centre</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manage knowledge output and industry partnerships</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
               title: "",
               name: "",
               overview: "",
               description: "",
               type: activeTab === "partners" ? "Industry" : "Ongoing",
               status: "active"
            });
          }}
          className="bg-primary hover:bg-[#ff7f50] text-white py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all"
        >
          <Plus size={16} />
          <span>Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-[2.5rem] w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center space-x-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'}
            `}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-10 rounded-[3rem] border-2 border-primary/20 shadow-2xl space-y-8"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Title / Name</label>
                   <input 
                     type="text" 
                     value={formData.title || formData.name || ""}
                     onChange={(e) => setFormData({ ...formData, [activeTab === 'partners' ? 'name' : 'title']: e.target.value })}
                     className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Type / Status</label>
                   <input 
                     type="text" 
                     value={formData.type || ""}
                     onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                     className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                   />
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Summary / Overview</label>
                   <textarea 
                     value={formData.overview || formData.description || ""}
                     onChange={(e) => setFormData({ ...formData, [activeTab === 'areas' ? 'overview' : 'description']: e.target.value })}
                     className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 rounded-[2rem] outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                   />
                </div>
             </div>
             <div className="flex justify-end space-x-4">
                <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleSave} className="bg-primary-darker text-white py-4 px-12 rounded-full text-[10px] font-black uppercase tracking-widest">Save Changes</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="animate-spin text-primary" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Research Data...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Research Details</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Classification</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-24 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No {activeTab} registered yet</p>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <h5 className="text-sm font-black text-primary-darker uppercase tracking-tight">{item.title || item.name}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-xs">{item.overview || item.description}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border bg-primary/5 text-primary border-primary/20">
                        {item.type || item.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => {
                               setFormData(item);
                               setEditingId(item.id);
                               setIsAdding(true);
                            }}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                          >
                             <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
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
        )}
      </div>
    </div>
  );
}

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
);
