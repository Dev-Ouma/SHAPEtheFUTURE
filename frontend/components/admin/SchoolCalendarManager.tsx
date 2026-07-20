"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Check, 
  RefreshCw,
  Edit2,
  X,
  Copy
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import CustomConfirmModal from "./CustomConfirmModal";

interface SchoolCalendarManagerProps {
  schoolId: string;
  schoolSlug: string;
}

export default function SchoolCalendarManager({ schoolId, schoolSlug }: SchoolCalendarManagerProps) {
  const [events, setEvents] = useState<any[]>([]);
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
  const [shouldClearBeforeImport, setShouldClearBeforeImport] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    title_sw: "",
    description: "",
    description_sw: "",
    date_start: "",
    date_end: "",
    category: "Academic"
  });

  useEffect(() => {
    fetchEvents();
  }, [schoolSlug, page]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getApi('/schools');
        setAllSchools(data.filter((s: any) => s.slug !== schoolSlug));
      } catch (e) {}
    };
    fetchSchools();
  }, [schoolSlug]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getApi(`/calendar?school=${schoolSlug}&page=${page}&limit=${limit}`);
      if (response && response.data) {
        setEvents(response.data);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total || 0);
      } else {
        setEvents(response || []);
        setTotal(response?.length || 0);
      }
    } catch (err) {
      toast.error("Failed to load academic events");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setConfirmConfig({
      isOpen: true,
      title: "Nuclear Reset",
      message: "Are you sure you want to PERMANENTLY delete ALL events for this school? This action cannot be reversed.",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteApi(`/calendar/clear/${schoolId}`);
          toast.success("Calendar purged successfully");
          fetchEvents();
        } catch (e) {
          toast.error("Failed to clear roadmap");
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
        await deleteApi(`/calendar/clear/${schoolId}`);
      }

      const res = await postApi('/calendar/import', {
        fromSchoolSlug: selectedSourceSchool,
        toSchoolId: schoolId
      });
      if (res.success) {
        toast.success(`Successfully imported ${res.count} events`);
        setIsImporting(false);
        fetchEvents();
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
    if (!formData.title || !formData.date_start) {
      toast.error("Title and Start Date are required");
      return;
    }

    try {
      if (editingId) {
        await patchApi(`/calendar/${editingId}`, formData);
        toast.success("Event updated");
      } else {
        await postApi('/calendar', { ...formData, schoolId });
        toast.success("Event added to roadmap");
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ title: "", title_sw: "", description: "", description_sw: "", date_start: "", date_end: "", category: "Academic" });
      fetchEvents();
    } catch (err) {
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Remove Event",
      message: "Are you sure you want to remove this event from the academic roadmap?",
      variant: "warning",
      onConfirm: async () => {
        try {
          await deleteApi(`/calendar/${id}`);
          toast.success("Event removed");
          fetchEvents();
        } catch (err) {
          toast.error("Failed to remove event");
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const categories = ["Academic", "Holiday", "Examination", "Event"];

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Academic Roadmap...</p>
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
          <h3 className="text-2xl font-black text-primary-darker font-serif italic uppercase tracking-tight">Academic Calendar</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manage semesters, exams, and holidays ({total} Total Records)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleClear}
            className="bg-red-50 hover:bg-red-100 text-red-500 py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 size={16} />
            <span>Clear Roadmap</span>
          </button>
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-400 py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Copy size={16} />
            <span>Import Roadmap</span>
          </button>
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setFormData({ title: "", title_sw: "", description: "", description_sw: "", date_start: "", date_end: "", category: "Academic" });
            }}
            className="bg-primary hover:bg-[#ff7f50] text-white py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Event</span>
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
                    <h4 className="text-xl font-black uppercase tracking-tight italic">Institutional Synchronisation</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clone a roadmap from another academic school</p>
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
                        {processingImport ? 'Processing...' : 'Run Clone Operation'}
                    </button>
                 </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
                 <input 
                    type="checkbox" 
                    id="clearBefore"
                    checked={shouldClearBeforeImport}
                    onChange={(e) => setShouldClearBeforeImport(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0"
                 />
                 <label htmlFor="clearBefore" className="text-[9px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">
                    Clear existing events before importing (Prevents Duplication)
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
                  {editingId ? 'Edit Event Details' : 'Initialize New Roadmap Event'}
               </h4>
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-red-500">
                  <X size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Event Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Semester I Commencement"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Title (Swahili) — optional</label>
                <input 
                  type="text" 
                  value={formData.title_sw || ""}
                  onChange={(e) => setFormData({ ...formData, title_sw: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Kichwa cha Kiswahili..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                <input 
                  type="date" 
                  value={formData.date_start}
                  onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">End Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.date_end}
                  onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 rounded-[2rem] outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Provide context for students..."
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description (Swahili) — optional</label>
                <textarea 
                  value={formData.description_sw || ""}
                  onChange={(e) => setFormData({ ...formData, description_sw: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 rounded-[2rem] outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  placeholder="Maelezo ya Kiswahili..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                className="bg-primary-darker text-white py-4 px-12 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
              >
                {editingId ? 'Update Record' : 'Add to Calendar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Event Detail</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Category</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Timeline</th>
              <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {events?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Calendar size={40} className="text-slate-100" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No events found in roadmap</p>
                  </div>
                </td>
              </tr>
            ) : (
              events?.map((event) => (
                <tr key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-primary-darker uppercase tracking-tight">{event.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 italic max-w-xs">{event.description || 'No description provided'}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                      event.category === 'Examination' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      event.category === 'Holiday' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      event.category === 'Event' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    }`}>
                      {event.category}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col space-y-1">
                       <div className="flex items-center space-x-2 text-[10px] font-black text-primary-darker uppercase">
                          <Clock size={12} className="text-slate-300" />
                          <span>{new Date(event.date_start).toLocaleDateString()}</span>
                       </div>
                       {event.date_end && (
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                             to {new Date(event.date_end).toLocaleDateString()}
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <button 
                        onClick={() => {
                          setEditingId(event.id);
                          setFormData({
                            title: event.title,
                            title_sw: event.title_sw || "",
                            description: event.description || "",
                            description_sw: event.description_sw || "",
                            // Normalize date for input type="date"
                            date_start: event.date_start ? event.date_start.split('T')[0] : "",
                            date_end: event.date_end ? event.date_end.split('T')[0] : "",
                            category: event.category
                          });
                          setIsAdding(false);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                       >
                         <Edit2 size={16} />
                       </button>
                       <button 
                        onClick={() => handleDelete(event.id)}
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
