"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Plus, Edit, Trash2, RefreshCw, MessageSquare, Heart, Users, Calendar, X, Save, Zap, FileText, ChevronDown } from "lucide-react";
import { getApi, postApi, patchApi, deleteApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAlert } from "@/context/AlertContext";

const TABS = [
  { id: 'announcements', label: 'Announcements', icon: MessageSquare, api: '/students/announcements', adminApi: '/students/admin/announcements' },
  { id: 'services', label: 'Support Services', icon: Heart, api: '/students/support-services', adminApi: '/students/admin/support-services' },
  { id: 'clubs', label: 'Clubs & Societies', icon: Users, api: '/students/clubs', adminApi: '/students/admin/clubs' },
  { id: 'events', label: 'Student Events', icon: Calendar, api: '/students/events', adminApi: '/students/admin/events' },
  { id: 'quickActions', label: 'Quick Actions', icon: Zap, api: '/students/quick-actions', adminApi: '/students/admin/quick-actions' },
  { id: 'resources', label: 'Resources', icon: FileText, api: '/students/resources', adminApi: '/students/admin/resources' },
];

export default function StudentsAdmin() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [leaderSearch, setLeaderSearch] = useState("");
  const [leaderDropdownOpen, setLeaderDropdownOpen] = useState(false);
  const [leaderDropdownRect, setLeaderDropdownRect] = useState<DOMRect | null>(null);
  const leaderTriggerRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  const openLeaderDropdown = useCallback(() => {
    if (leaderTriggerRef.current) {
      setLeaderDropdownRect(leaderTriggerRef.current.getBoundingClientRect());
    }
    setLeaderDropdownOpen(prev => !prev);
  }, []);

  useEffect(() => {
    fetchData();
    if (activeTab.id === 'clubs' && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await getApi('/auth/users');
      setUsers(Array.isArray(res) ? res : (res?.data || []));
    } catch {
      toast.error('Failed to load users for leader selection');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getApi(activeTab.api);
      setData(Array.isArray(res) ? res : []);
    } catch {
      toast.error(`Failed to load ${activeTab.label}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    showAlert({
      title: `Delete ${activeTab.label}?`,
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteApi(`${activeTab.adminApi}/${id}`);
          toast.success("Deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setIsEdit(true);
      // Format date for datetime-local input if it's an event
      let editData = { ...item };
      if (activeTab.id === 'events' && editData.date) {
        editData.date = new Date(editData.date).toISOString().slice(0, 16);
      }
      setFormData(editData);
    } else {
      setIsEdit(false);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Clean up payload based on tab
      const payload = { ...formData };
      if (activeTab.id === 'events' && payload.date) {
        payload.date = new Date(payload.date).toISOString();
      }

      if (isEdit) {
        await patchApi(`${activeTab.adminApi}/${formData.id}`, payload);
        toast.success("Updated successfully");
      } else {
        await postApi(activeTab.adminApi, payload);
        toast.success("Created successfully");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(isEdit ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    if (activeTab.id === 'announcements') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Title</label>
            <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Content</label>
            <textarea required value={formData.content || ''} onChange={e => handleChange('content', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category</label>
              <select value={formData.category || 'General'} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option>General</option>
                <option>Registration</option>
                <option>Exams</option>
                <option>Orientation</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Priority</label>
              <select value={formData.priority || 'Medium'} onChange={e => handleChange('priority', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Media URL (Optional)</label>
              <input type="url" value={formData.media_url || ''} onChange={e => handleChange('media_url', e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Schedule Publish (Optional)</label>
              <input type="datetime-local" value={formData.published_at ? String(formData.published_at).slice(0, 16) : ''} onChange={e => handleChange('published_at', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </>
      );
    }

    if (activeTab.id === 'services') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Service Name</label>
            <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
            <textarea required value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category</label>
              <select value={formData.category || 'Counseling'} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option>Counseling</option>
                <option>ICT</option>
                <option>Financial Aid</option>
                <option>Accessibility</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
              <input value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Contact Info</label>
            <input value={formData.contact_info || ''} onChange={e => handleChange('contact_info', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </>
      );
    }

    if (activeTab.id === 'clubs') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Club Name</label>
            <input required value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
            <textarea required value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category</label>
              <select value={formData.category || 'Sports'} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option>Sports</option>
                <option>Academic</option>
                <option>Arts</option>
                <option>Leadership</option>
              </select>
            </div>
            <div className="relative">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Leader Name</label>
              <div 
                ref={leaderTriggerRef}
                onClick={openLeaderDropdown}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer flex justify-between items-center"
              >
                <span className={formData.leader_name ? "text-slate-800 font-medium text-sm" : "text-slate-400 text-sm"}>
                  {formData.leader_name ? `${formData.leader_name}` : "-- Select a System User --"}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${leaderDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Portal Dropdown — escapes overflow-y-auto */}
              {leaderDropdownOpen && leaderDropdownRect && typeof window !== 'undefined' && ReactDOM.createPortal(
                <>
                  {/* Backdrop to close on outside click */}
                  <div className="fixed inset-0 z-[9998]" onClick={() => setLeaderDropdownOpen(false)} />
                  <div
                    className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    style={{
                      top: leaderDropdownRect.bottom + 4,
                      left: leaderDropdownRect.left,
                      width: leaderDropdownRect.width,
                      maxHeight: 260,
                    }}
                  >
                    <div className="p-2 bg-slate-50 border-b border-slate-100 shrink-0">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={leaderSearch}
                        onChange={(e) => setLeaderSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="overflow-y-auto p-1">
                      {users.filter(u => 
                        u.full_name.toLowerCase().includes(leaderSearch.toLowerCase()) || 
                        u.email.toLowerCase().includes(leaderSearch.toLowerCase())
                      ).map(u => (
                        <div 
                          key={u.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              leader_id: u.id,
                              leader_name: u.full_name,
                              leader_email: u.email
                            });
                            setLeaderDropdownOpen(false);
                            setLeaderSearch("");
                          }}
                          className="p-3 hover:bg-primary hover:text-white rounded-lg cursor-pointer text-sm font-medium text-slate-700 transition-colors group"
                        >
                          {u.full_name} <span className="text-slate-400 text-xs group-hover:text-white ml-1">({u.email})</span>
                        </div>
                      ))}
                      {users.filter(u => 
                        u.full_name.toLowerCase().includes(leaderSearch.toLowerCase()) || 
                        u.email.toLowerCase().includes(leaderSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-center text-sm text-slate-400 font-medium">No users found</div>
                      )}
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
        </>
      );
    }

    if (activeTab.id === 'events') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Event Title</label>
            <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Title (Swahili) — optional</label>
            <input value={formData.title_sw || ''} onChange={e => handleChange('title_sw', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="Kichwa cha Kiswahili..." />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
            <textarea required value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Description (Swahili) — optional</label>
            <textarea value={formData.description_sw || ''} onChange={e => handleChange('description_sw', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[80px] focus:ring-2 focus:ring-primary outline-none" placeholder="Maelezo ya Kiswahili..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Date & Time</label>
              <input required type="datetime-local" value={formData.date || ''} onChange={e => handleChange('date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Event Type</label>
              <select value={formData.type || 'Workshop'} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option>Orientation</option>
                <option>Workshop</option>
                <option>Webinar</option>
                <option>Activity</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Location</label>
            <input value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </>
      );
    }

    if (activeTab.id === 'quickActions') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Action Title</label>
            <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g., Timetables" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Link / URL</label>
            <input required value={formData.href || ''} onChange={e => handleChange('href', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="/academics/timetables" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Icon (Lucide Name)</label>
              <select value={formData.icon || 'Clock'} onChange={e => handleChange('icon', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
                <option value="Clock">Clock</option>
                <option value="FileText">FileText</option>
                <option value="BookOpen">BookOpen</option>
                <option value="Cpu">Cpu</option>
                <option value="MessageSquare">MessageSquare</option>
                <option value="Calendar">Calendar</option>
                <option value="Heart">Heart</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Color Theme (Hex)</label>
              <input value={formData.color || '#1e234a'} onChange={e => handleChange('color', e.target.value)} type="color" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1 h-12 focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </>
      );
    }

    if (activeTab.id === 'resources') {
      return (
        <>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Resource Title</label>
            <input required value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g., Student Handbook" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">File URL / Link</label>
            <input required value={formData.file_url || ''} onChange={e => handleChange('file_url', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category</label>
            <select value={formData.category || 'Handbook'} onChange={e => handleChange('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none">
              <option value="Handbook">Handbook</option>
              <option value="Policy">Policy</option>
              <option value="Form">Form</option>
              <option value="Guide">Guide</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-4xl font-black text-primary-darker mb-2 uppercase tracking-tighter">Student Portal Hub</h2>
          <p className="text-slate-500 font-medium text-sm">Manage student announcements, support services, and campus life.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-sm w-fit overflow-x-auto max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab.id === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-6">Content / Title</div>
            <div className="col-span-4">Details</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {data.length === 0 ? (
            <div className="py-20 text-center text-slate-400 uppercase font-black tracking-widest text-xs">
              No {activeTab.label.toLowerCase()} found.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group">
                <div className="col-span-6">
                  <p className="font-black text-primary-darker text-sm tracking-tight">{item.title || item.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate max-w-md">
                    {item.content || item.description || item.href || item.file_url}
                  </p>
                </div>
                <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {activeTab.id === 'announcements' && <span>Priority: {item.priority} | {item.category}</span>}
                  {activeTab.id === 'services' && <span>Category: {item.category} | {item.location}</span>}
                  {activeTab.id === 'clubs' && <span>Leader: {item.leader_name}</span>}
                  {activeTab.id === 'events' && <span>Date: {new Date(item.date).toLocaleDateString()}</span>}
                  {activeTab.id === 'quickActions' && <span>Icon: {item.icon} | Color: {item.color}</span>}
                  {activeTab.id === 'resources' && <span>Category: {item.category}</span>}
                </div>
                <div className="col-span-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit size={16} /></button>
                  <button 
                    onClick={() => handleDelete(item.id, item.title || item.name)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dynamic Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                {isEdit ? 'Edit' : 'Create'} {activeTab.label}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {renderFormFields()}
            </form>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{isEdit ? 'Save Changes' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
