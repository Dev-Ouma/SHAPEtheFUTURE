"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Target, 
  Users, 
  Globe, 
  Search as SearchIcon, 
  Check, 
  RefreshCw,
  Zap,
  Shield,
  FileText,
  Mail,
  Phone,
  Layout,
  ExternalLink,
  Info,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  Layers,
  Plus,
  Trash2,
  MessageSquare,
  Quote,
  Calendar as CalendarIcon,
  Beaker
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "@/components/RichTextEditor";
import QuickAddStaffModal from "@/components/admin/QuickAddStaffModal";
import SchoolCalendarManager from "@/components/admin/SchoolCalendarManager";
import SchoolResourceManager from "@/components/admin/SchoolResourceManager";
import SchoolResearchManager from "@/components/admin/SchoolResearchManager";

type TabType = 'identity' | 'strategy' | 'leadership' | 'departments' | 'calendar' | 'resources' | 'research' | 'media' | 'seo';

export default function SchoolEditor() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";

  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  
  // School Data
  const [school, setSchool] = useState<any>({
    name: "",
    slug: "",
    name_sw: "",
    description: "",
    description_sw: "",
    mission: "",
    vision: "",
    core_values: "",
    email: "",
    phone: "",
    website_url: "",
    social_links: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: ""
    },
    logo_url: "",
    banner_image_url: "",
    hero_images: [],
    display_order: 0,
    is_featured: false,
    status: "Published",
    meta_title: "",
    meta_description: "",
    dean: null,
    dean_message: "",
    dean_bio: ""
  });

  // Leadership Search State
  const [staffSearch, setStaffSearch] = useState("");
  const [staffResults, setStaffResults] = useState<any[]>([]);
  const [searchingStaff, setSearchingStaff] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchSchool();
    }
  }, [id]);

  const fetchSchool = async () => {
    try {
      const data = await getApi(`/schools/${id}`);
      // Ensure social_links exists
      if (!data.social_links) {
        data.social_links = { linkedin: "", twitter: "", facebook: "", instagram: "" };
      }
      setSchool(data);
    } catch (err) {
      toast.error("Failed to load school data");
      router.push("/admin/schools");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!school.name || !school.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { 
        ...school,
        dean_id: school.dean?.id || null
      };
      
      if (isNew) {
        const res = await postApi('/schools', payload);
        toast.success("School created successfully");
        router.push(`/admin/schools/${res.id}`);
      } else {
        await patchApi(`/schools/${id}`, payload);
        toast.success("School updated successfully");
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleStaffSearch = async (val: string) => {
    setStaffSearch(val);
    if (val.length < 2) {
      setStaffResults([]);
      return;
    }
    setSearchingStaff(true);
    try {
      const data = await getApi(`/staff?search=${val}&limit=5`);
      setStaffResults(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingStaff(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-64 space-y-6">
        <RefreshCw className="animate-spin text-primary" size={64} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Academic Pillar...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'identity', label: 'Identity', icon: Building2 },
    { id: 'strategy', label: 'Institutional Strategy', icon: Target },
    { id: 'leadership', label: 'Leadership', icon: Users },
    { id: 'departments', label: 'Departments', icon: Layers },
    { id: 'calendar', label: 'Academic Calendar', icon: CalendarIcon },
    { id: 'resources', label: 'Institutional Resources', icon: FileText },
    { id: 'research', label: 'Research & Collaboration', icon: Beaker },
    { id: 'media', label: 'Media & Contact', icon: Layout },
    { id: 'seo', label: 'Search Optimisation', icon: Globe },
  ];

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-primary-darker p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Building2 size={200} />
         </div>
         <div className="flex flex-col space-y-6 relative z-10">
            <button 
              onClick={() => router.push("/admin/schools")}
              className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Schools</span>
            </button>
            <div className="space-y-2">
               <h2 className="text-4xl font-black font-serif italic tracking-tighter">
                  {isNew ? 'New Academic School' : school.name}
               </h2>
               <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                     /{school.slug || 'slug-pending'}
                  </span>
                  <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${school.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${school.status === 'Published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                     <span>{school.status}</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center space-x-4 relative z-10">
            <button 
               onClick={handleSave}
               disabled={saving}
               className="bg-primary hover:bg-[#ff7f50] hover:text-white-dark p-6 rounded-3xl flex items-center space-x-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
            >
               {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
               <span className="text-xs font-black uppercase tracking-[0.2em]">{isNew ? 'Initialize School' : 'Commit Changes'}</span>
            </button>
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 bg-white/50 backdrop-blur-md p-2 rounded-[2.5rem] border border-slate-200 sticky top-4 z-40 shadow-sm overflow-x-auto no-scrollbar">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as TabType)}
               className={`flex items-center space-x-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-darker text-white shadow-xl shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-100'}`}
            >
               <tab.icon size={16} />
               <span>{tab.label}</span>
            </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
               {activeTab === 'identity' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
                        <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                           <Zap size={18} className="text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Primary Core Data</h3>
                        </div>
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">School Name (Official)</label>
                              <input 
                                 type="text" 
                                 value={school.name}
                                 onChange={(e) => setSchool({ ...school, name: e.target.value, slug: isNew ? e.target.value.toLowerCase().replace(/\s+/g, '-') : school.slug })}
                                 className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 placeholder="e.g., School of Science and Technology"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Swahili Variation</label>
                              <input 
                                 type="text" 
                                 value={school.name_sw}
                                 onChange={(e) => setSchool({ ...school, name_sw: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 placeholder="e.g., Shule ya Sayansi na Teknolojia"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">URL Slug</label>
                                 <div className="relative">
                                 <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                 <input 
                                    type="text" 
                                    value={school.slug}
                                    onChange={(e) => setSchool({ ...school, slug: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 text-sm font-bold text-primary outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
                        <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                           <Shield size={18} className="text-secondary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Governance & Visibility</h3>
                        </div>
                        <div className="space-y-8">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Display Logic (Order)</label>
                                 <input 
                                    type="number" 
                                    value={school.display_order}
                                    onChange={(e) => setSchool({ ...school, display_order: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lifecycle Status</label>
                                 <select 
                                    value={school.status}
                                    onChange={(e) => setSchool({ ...school, status: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 >
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Archived">Archived</option>
                                 </select>
                              </div>
                           </div>
                           <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                              <div className="space-y-1">
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-darker">Featured Placement</span>
                                 <p className="text-[9px] text-slate-500 font-medium italic">Highlight this school in search and hub grids.</p>
                              </div>
                              <button 
                                 onClick={() => setSchool({ ...school, is_featured: !school.is_featured })}
                                 className={`w-14 h-8 rounded-full transition-colors relative ${school.is_featured ? 'bg-primary' : 'bg-slate-300'}`}
                              >
                                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${school.is_featured ? 'left-7 shadow-lg shadow-black/20' : 'left-1'}`} />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'strategy' && (
                  <div className="space-y-10">
                     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
                        <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                           <Zap size={18} className="text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Institutional Mandate (Narrative)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Brief Overview</label>
                              <textarea 
                                 value={school.description}
                                 onChange={(e) => setSchool({ ...school, description: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary h-48 rounded-[2rem]"
                                 placeholder="A brief 200-character overview for search results."
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Overview Variation (Swahili)</label>
                              <textarea 
                                 value={school.description_sw}
                                 onChange={(e) => setSchool({ ...school, description_sw: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-6 text-sm font-medium text-slate-600 outline-none focus:ring-1 focus:ring-primary h-48 rounded-[2rem]"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['mission', 'vision', 'core_values'].map((field) => (
                           <div key={field} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-6">
                              <label className="text-[9px] font-black uppercase tracking-widest text-primary italic border-b border-primary/10 pb-4 block">
                                 Academic {field.replace('_', ' ')}
                              </label>
                              <RichTextEditor 
                                 content={school[field] || ""}
                                 onChange={(html) => setSchool({ ...school, [field]: html })}
                                 placeholder={`Articulate the school ${field}...`}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               )}

                {activeTab === 'departments' && (
                  <div className="space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-black text-primary-darker font-serif italic uppercase tracking-tight">Academic Departments</h3>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional components of {school.name}</p>
                        </div>
                        <button 
                           onClick={() => {
                              const name = prompt("Enter Department Name:");
                              if (!name) return;
                              postApi('/departments', { name, schoolId: id }).then(() => {
                                 toast.success("Department Added");
                                 fetchSchool();
                              }).catch(() => toast.error("Failed to add department"));
                           }}
                           className="bg-primary hover:bg-[#ff7f50] hover:text-white transition-all text-white py-4 px-8 rounded-full flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                           <Plus size={16} />
                           <span>Quick Add Department</span>
                        </button>
                     </div>

                     {(!school.departments || school.departments.length === 0) ? (
                        <div className="py-32 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center space-y-4">
                           <Layers size={48} className="text-slate-100" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No departments mapped to this school</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {school.departments.map((dept: any) => (
                              <div key={dept.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-[#ff7f50]/20 transition-all flex items-center justify-between">
                                 <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-[#ff7f50] hover:text-white group-hover:text-white transition-all">
                                       <Layers size={16} />
                                    </div>
                                    <div>
                                       <h4 className="text-xs font-black uppercase tracking-tight text-primary-darker">{dept.name}</h4>
                                       <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">/{dept.slug}</p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       if (confirm(`Remove ${dept.name} from this school?`)) {
                                          deleteApi(`/departments/${dept.id}`).then(() => {
                                             toast.success("Department Removed");
                                             fetchSchool();
                                          });
                                       }
                                    }}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-full transition-all"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="bg-primary-darker p-12 rounded-[3.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                           <Shield size={150} className="text-white" />
                        </div>
                        <div className="relative z-10 space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-b border-white/10 pb-4">Structural Integrity Note</h4>
                           <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                              "Departments are the primary containers for academic programmes. Each department added here will be available when creating new programmes for this school. Quick add currently initializes departments with default settings; use the Departments Hub for full configuration."
                           </p>
                           <button 
                              onClick={() => router.push("/admin/departments")}
                              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center space-x-3"
                           >
                              <ExternalLink size={14} />
                              <span>Go to Centralized Departments Hub</span>
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'calendar' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     {!isNew ? (
                        <SchoolCalendarManager schoolId={school.id} schoolSlug={school.slug} />
                     ) : (
                        <div className="py-32 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                           <CalendarIcon size={64} className="text-slate-100" />
                           <div className="text-center space-y-2">
                              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Roadmap Unavailable</h4>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Please initialize the school identity before managing the calendar.</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'resources' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     {!isNew ? (
                        <SchoolResourceManager schoolId={school.id} schoolSlug={school.slug} />
                     ) : (
                        <div className="py-32 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                           <FileText size={64} className="text-slate-100" />
                           <div className="text-center space-y-2">
                              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Repository Unavailable</h4>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Please initialize the school identity before managing the resource library.</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'research' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                     {!isNew ? (
                        <SchoolResearchManager schoolId={school.id} schoolSlug={school.slug} />
                     ) : (
                        <div className="py-32 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
                           <Beaker size={64} className="text-slate-100" />
                           <div className="text-center space-y-2">
                              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Command Centre Unavailable</h4>
                              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Please initialize the school identity before managing the research hub.</p>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'leadership' && (
                  <div className="space-y-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Assignment Section */}
                        <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-12 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                              <Shield size={100} className="text-secondary" />
                           </div>
                           
                           <div className="space-y-2 relative z-10">
                              <div className="flex items-center space-x-3 text-secondary">
                                 <Users size={20} />
                                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Pillar</h3>
                              </div>
                              <h4 className="text-3xl font-black font-serif italic text-primary-darker tracking-tighter uppercase">Dean / Director</h4>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Assign the academic leader for this school</p>
                           </div>

                           <div className="space-y-8 relative z-10">
                              <div className="relative group">
                                 <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                 <input 
                                    type="text" 
                                    placeholder="Search Staff Registry..."
                                    value={staffSearch}
                                    onChange={(e) => handleStaffSearch(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 p-6 pl-16 text-xs font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary rounded-full transition-all"
                                 />
                                 
                                 <AnimatePresence>
                                    {(staffResults.length > 0 || searchingStaff || (staffSearch.length >= 2 && !searchingStaff && staffResults.length === 0)) && (
                                       <motion.div 
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          className="absolute top-full left-0 right-0 mt-6 bg-white border border-slate-100 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] z-[100] overflow-hidden"
                                       >
                                          {searchingStaff ? (
                                             <div className="p-16 flex flex-col items-center justify-center space-y-4">
                                                <RefreshCw className="animate-spin text-primary" size={32} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Querying Academic Hub...</span>
                                             </div>
                                          ) : staffResults.length > 0 ? (
                                             <div className="p-3">
                                                {staffResults.map((staff) => (
                                                   <button 
                                                      key={staff.id}
                                                      onClick={() => {
                                                         setSchool({ ...school, dean: staff });
                                                         setStaffResults([]);
                                                         setStaffSearch("");
                                                      }}
                                                      className="w-full flex items-center space-x-6 p-6 hover:bg-slate-50 transition-all rounded-[2rem] text-left group border border-transparent hover:border-slate-100"
                                                   >
                                                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                                         {staff.profile_image_url ? (
                                                            <img src={resolveImageUrl(staff.profile_image_url)} className="w-full h-full object-cover" alt="" />
                                                         ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-200 italic uppercase bg-slate-50">Photo</div>
                                                         )}
                                                      </div>
                                                      <div className="space-y-1">
                                                         <h5 className="text-xs font-black uppercase tracking-tight text-primary-darker group-hover:text-primary transition-colors">{staff.full_name}</h5>
                                                         <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{staff.job_title || staff.academic_qualifications || 'Academic Member'}</p>
                                                      </div>
                                                   </button>
                                                ))}
                                             </div>
                                          ) : (
                                             <div className="p-12 text-center space-y-6">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No matching profiles found</p>
                                                <button 
                                                   onClick={() => setIsQuickAddOpen(true)}
                                                   className="bg-primary/5 text-primary py-4 px-10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all border border-primary/20"
                                                >
                                                   Enrol New Staff Member
                                                </button>
                                             </div>
                                          )}
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>

                                 <button 
                                    onClick={() => setIsQuickAddOpen(true)}
                                    className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors bg-primary/5 p-4 pr-8 rounded-full border border-primary/10"
                                 >
                                    <Plus size={16} />
                                    <span>Quick Enrol New Member</span>
                                 </button>
                           </div>
                        </div>

                        {/* Current Dean Display */}
                        <div className="bg-primary-darker p-12 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden shadow-2xl group min-h-[450px]">
                           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                              <Shield size={200} className="text-white" />
                           </div>
                           
                           <div className="relative z-10 space-y-8 flex flex-col items-center">
                              <div className="w-48 h-48 rounded-[3rem] border-8 border-white/5 bg-white/5 shadow-2xl overflow-hidden group-hover:rotate-6 transition-transform duration-700">
                                 {school.dean?.profile_image_url ? (
                                    <img src={resolveImageUrl(school.dean.profile_image_url)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black text-2xl tracking-tighter -rotate-12">
                                       Leadership
                                    </div>
                                 )}
                              </div>

                              <div className="space-y-3">
                                 <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                                    <Users size={14} />
                                    <span>Assigned Lead</span>
                                 </div>
                                 <h4 className="text-3xl font-black font-serif italic text-white leading-tight tracking-tight">
                                    {school.dean ? school.dean.full_name : 'Status: Unassigned'}
                                 </h4>
                                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic line-clamp-1 max-w-[300px]">
                                    {school.dean?.job_title || school.dean?.academic_qualifications || 'Awaiting Academic Assignment'}
                                 </p>
                              </div>

                              {school.dean && (
                                 <button 
                                    onClick={() => setSchool({ ...school, dean: null })}
                                    className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 transition-colors border border-white/10 px-8 py-3 rounded-full hover:border-red-500/50"
                                 >
                                    Vacate Position
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>

                     {school.dean && (
                        <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                           <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                              <div className="space-y-1">
                                 <div className="flex items-center space-x-3 text-primary">
                                    <MessageSquare size={18} />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Narrative</h3>
                                 </div>
                                 <h4 className="text-2xl font-black font-serif italic text-primary-darker tracking-tighter uppercase">Dean's Leadership Statement</h4>
                              </div>
                              <div className="hidden md:block">
                                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                                       <Quote size={20} />
                                    </div>
                                    <div>
                                       <p className="text-[9px] font-black text-primary-darker uppercase tracking-widest leading-none">Context Specific</p>
                                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overrides global staff bio</p>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-12">
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Short Quote / Opening Remark</label>
                                 <div className="relative">
                                    <Quote className="absolute left-6 top-8 text-primary opacity-20" size={24} />
                                    <textarea 
                                       value={school.dean_message || ""}
                                       onChange={(e) => setSchool({ ...school, dean_message: e.target.value })}
                                       className="w-full bg-slate-50 border border-slate-100 p-8 pl-16 rounded-[2.5rem] font-serif italic font-bold text-lg text-primary-darker outline-none focus:ring-2 focus:ring-primary min-h-[120px] transition-all"
                                       placeholder="e.g. Bridging the gap between theory and digital practice."
                                    />
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Full Academic Statement (Biography)</label>
                                 <div className="bg-slate-50 rounded-[3rem] p-4 border border-slate-100">
                                    <RichTextEditor 
                                       content={school.dean_bio || ""}
                                       onChange={(content) => setSchool({ ...school, dean_bio: content })}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Strategic Insight Box */}
                     <div className="bg-slate-50 border border-slate-200 p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 group">
                        <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-slate-200 group-hover:-rotate-12 transition-transform">
                           <Layout size={40} />
                        </div>
                        <div className="space-y-4 flex-1">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Governance</h5>
                           <p className="text-lg font-bold text-primary-darker leading-snug tracking-tight">
                              The Dean serves as the strategic orchestrator of the school's academic mission. Their profile is featured on the school's landing page as a symbol of institutional authority.
                           </p>
                           <button 
                              onClick={() => router.push("/admin/staff")}
                              className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-2 hover:translate-x-2 transition-transform"
                           >
                              <span>Explore Full Academic Registry</span>
                              <ExternalLink size={14} />
                           </button>
                        </div>
                     </div>

                     <QuickAddStaffModal 
                        isOpen={isQuickAddOpen}
                        onClose={() => setIsQuickAddOpen(false)}
                        onSuccess={(staff) => {
                           setSchool({ ...school, dean: staff });
                           toast.success("Assigned new member as Dean");
                        }}
                     />
                  </div>
               )}

               {activeTab === 'media' && (
                  <div className="space-y-10">
                     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
                        <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                           <Mail size={18} className="text-primary" />
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Institutional Contact Map</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                                 <Mail size={12} />
                                 <span>Official Email</span>
                              </label>
                              <input 
                                 type="text" 
                                 value={school.email}
                                 onChange={(e) => setSchool({ ...school, email: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 placeholder="school@ouk.ac.ke"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                                 <Phone size={12} />
                                 <span>Official Telephone</span>
                              </label>
                              <input 
                                 type="text" 
                                 value={school.phone}
                                 onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 placeholder="+254..."
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                                 <Globe size={12} />
                                 <span>Academic Microsite</span>
                              </label>
                              <input 
                                 type="text" 
                                 value={school.website_url}
                                 onChange={(e) => setSchool({ ...school, website_url: e.target.value })}
                                 className="w-full bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                 placeholder="https://..."
                              />
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
                        <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                           <Info size={18} className="text-secondary" />
                           <h3 className="text-[10px) font-black uppercase tracking-widest text-primary-darker">Social Portfolio</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-black">
                           {[
                              { key: 'linkedin', icon: Linkedin, color: '#0077b5' },
                              { key: 'twitter', icon: Twitter, color: '#1da1f2' },
                              { key: 'facebook', icon: Facebook, color: '#1877f2' },
                              { key: 'instagram', icon: Instagram, color: '#e4405f' }
                           ].map((social) => (
                              <div key={social.key} className="space-y-3">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                                    <social.icon size={12} style={{ color: social.color }} />
                                    <span>{social.key}</span>
                                 </label>
                                 <input 
                                    type="text" 
                                    value={school.social_links?.[social.key] || ""}
                                    onChange={(e) => setSchool({ ...school, social_links: { ...school.social_links, [social.key]: e.target.value } })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 text-xs font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                    placeholder="Username or URL"
                                 />
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
                           <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                              <Layout size={18} className="text-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Pillar Identity (Logo)</h3>
                           </div>
                           <div className="space-y-6">
                              <div className="w-40 h-40 bg-slate-50 border border-slate-100 rounded-[2.5rem] mx-auto overflow-hidden flex items-center justify-center p-8 group relative transition-all hover:bg-white hover:border-[#ff7f50]/20">
                                 {school.logo_url ? <img src={resolveImageUrl(school.logo_url)} className="w-full h-full object-contain" alt="" /> : <Building2 size={64} className="text-slate-200" />}
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center block">Institutional Logo URL</label>
                                 <input 
                                    type="text" 
                                    value={school.logo_url}
                                    onChange={(e) => setSchool({ ...school, logo_url: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 text-xs font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                    placeholder="https://..."
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
                           <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                              <Target size={18} className="text-secondary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Atmospheric Banner</h3>
                           </div>
                           <div className="space-y-6">
                              <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden flex items-center justify-center group relative transition-all hover:bg-white hover:border-[#ff7f50]/20">
                                 {school.banner_image_url ? <img src={resolveImageUrl(school.banner_image_url)} className="w-full h-full object-cover" alt="" /> : <Layout size={64} className="text-slate-200" />}
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center block">Full Width Banner URL</label>
                                 <input 
                                    type="text" 
                                    value={school.banner_image_url}
                                    onChange={(e) => setSchool({ ...school, banner_image_url: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 p-5 text-xs font-bold text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-2xl"
                                    placeholder="https://..."
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Hero Slider Images */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10 col-span-1 md:col-span-2">
                           <div className="flex items-center space-x-3 border-b border-slate-50 pb-6">
                              <Layers size={18} className="text-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Hero Background Slider Portfolio</h3>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              {(school.hero_images || []).map((img: string, idx: number) => (
                                 <div key={idx} className="space-y-4">
                                    <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative group shadow-sm">
                                       {img ? (
                                          <img src={resolveImageUrl(img)} className="w-full h-full object-cover" alt="" />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center text-slate-100 uppercase font-black text-[8px] italic">No Media</div>
                                       )}
                                       <button 
                                          onClick={() => {
                                             const newImages = [...school.hero_images];
                                             newImages.splice(idx, 1);
                                             setSchool({ ...school, hero_images: newImages });
                                          }}
                                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                       >
                                          <Trash2 size={12} />
                                       </button>
                                    </div>
                                    <input 
                                       type="text" 
                                       value={img}
                                       onChange={(e) => {
                                          const newImages = [...school.hero_images];
                                          newImages[idx] = e.target.value;
                                          setSchool({ ...school, hero_images: newImages });
                                       }}
                                       className="w-full bg-slate-50 border border-slate-100 p-3 text-[9px] font-black text-primary-darker outline-none focus:ring-1 focus:ring-primary rounded-xl transition-all"
                                       placeholder="Image URL"
                                    />
                                 </div>
                              ))}
                              <button 
                                 onClick={() => setSchool({ ...school, hero_images: [...(school.hero_images || []), ""] })}
                                 className="h-32 border-4 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center space-y-3 text-slate-300 hover:text-primary hover:border-primary/30 transition-all bg-slate-50/30 group"
                              >
                                 <Plus size={32} className="group-hover:scale-110 transition-transform" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Append Slide</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'seo' && (
                  <div className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-sm space-y-16 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                        <Globe size={300} className="text-primary" />
                     </div>
                     <div className="space-y-10 relative z-10 w-full max-w-4xl">
                        <div className="space-y-4 border-b border-slate-50 pb-10">
                           <div className="flex items-center space-x-3 mb-2">
                              <Globe size={18} className="text-primary" />
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Search Engine Optimisation</h3>
                           </div>
                           <p className="text-sm font-medium text-slate-500 italic">Configure how this academic school appears in Google and other search results across the digital landscape.</p>
                        </div>

                        <div className="space-y-10">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Meta Optimised Title</label>
                              <div className="relative">
                                 <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                 <input 
                                    type="text" 
                                    value={school.meta_title}
                                    onChange={(e) => setSchool({ ...school, meta_title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 p-6 pl-16 text-lg font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary rounded-3xl"
                                    placeholder="e.g., School of Science and Technology | OUK"
                                 />
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recommended: 50-60 characters</p>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Meta Optimised Description</label>
                              <div className="relative">
                                 <Eye className="absolute left-6 top-10 text-slate-300" size={20} />
                                 <textarea 
                                    value={school.meta_description}
                                    onChange={(e) => setSchool({ ...school, meta_description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 p-8 pl-16 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary h-48 rounded-[3rem]"
                                    placeholder="Enter a compelling summary for search engine results..."
                                 />
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recommended: 150-160 characters</p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
