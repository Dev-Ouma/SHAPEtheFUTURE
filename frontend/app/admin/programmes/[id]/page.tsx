"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   ArrowLeft,
   Save,
   Trash2,
   Plus,
   Layers,
   GraduationCap,
   BookOpen,
   DollarSign,
   Info,
   Clock,
   ExternalLink,
   ChevronRight,
   ChevronDown,
   X,
   Search,
   School as SchoolIcon,
   Edit,
   Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProgram, getSchools, getDepartments, getCourseUnits, patchApi, postApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";
import { CustomSelect } from "@/components/ui/CustomSelect";

type TabType = 'general' | 'admissions' | 'details' | 'curriculum' | 'enrollment' | 'outcomes';

export default function EditProgram() {
   const { id } = useParams();
   const router = useRouter();
   const isNew = id === 'new';

   const [loading, setLoading] = useState(!isNew);
   const [saving, setSaving] = useState(false);
   const [schools, setSchools] = useState<any[]>([]);
   const [activeTab, setActiveTab] = useState<TabType>('general');

   const [formData, setFormData] = useState<any>({
      title: "",
      title_sw: "",
      slug: "",
      programme_code: "",
      level: "Undergraduate",
      departmentId: "",
      schoolId: "",
      status: "DRAFT",
      is_featured: false,
      application_status: "Open",
      mode_of_delivery: [],
      duration: "",
      cost: "",
      atar: "",
      enroll_link: "",
      overview: "",
      overview_sw: "",
      assessment: "",
      rpl: "",
      entry_requirements: "",
      learning_outcomes: "",
      careers: "",
      credit_entry: "",
      fees_scholarships: "",
      programme_structure: "",
      brochure_url: "",
      units: []
   });

    const [departments, setDepartments] = useState<any[]>([]);
    const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
    const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);
    const [unitSearch, setUnitSearch] = useState("");

   const [allGlobalUnits, setAllGlobalUnits] = useState<any[]>([]);
   const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
   const [unitSearchQuery, setUnitSearchQuery] = useState("");
   const [activeYearFilter, setActiveYearFilter] = useState("All");
   const [isQuickAddMode, setIsQuickAddMode] = useState(false);
   const [newUnitData, setNewUnitData] = useState({ unit_code: '', title: '', year_level: 'YEAR 1', credits: 3 });

   const [durationValue, setDurationValue] = useState("");
   const [durationUnit, setDurationUnit] = useState("Years");

   useEffect(() => {
      fetchData();
   }, []);

   const fetchGlobalUnits = async () => {
      const data = await getCourseUnits();
      setAllGlobalUnits(Array.isArray(data) ? data : []);
   };

    const fetchData = async () => {
        const [schoolsData, departmentsData] = await Promise.all([
            getSchools(),
            getDepartments()
        ]);
        setSchools(schoolsData || []);
        setDepartments(departmentsData || []);

        if (!isNew) {
            const data = await getProgram(id as string);
            if (data) {
                setFormData({
                    ...data,
                    schoolId: data.school?.id || "",
                    departmentId: data.department?.id || "",
                    status: data.status || "DRAFT",
                    mode_of_delivery: data.mode_of_delivery || []
                });
                
                // Parse duration back into value and unit
                const durMatch = (data.duration || "").match(/^(\d+)\s*(.*)$/);
                if (durMatch) {
                   setDurationValue(durMatch[1]);
                   setDurationUnit(durMatch[2] || "Years");
                } else {
                   setDurationValue(data.duration || "");
                }
            }
            setLoading(false);
        }
    };

   const handleSave = async () => {
      if (!formData.title?.trim()) {
         toast.error("Programme Title is required");
         return;
      }
      if (!formData.slug?.trim()) {
         toast.error("Programme Slug is required");
         return;
      }
      if (!formData.schoolId) {
         toast.error("Hosting School must be selected");
         return;
      }

      setSaving(true);
      try {
         const payload = { 
            ...formData,
            duration: durationValue ? `${durationValue} ${durationUnit}` : ""
         };
         delete payload.school;

         if (isNew) {
            await postApi('/programmes', payload);
            toast.success("Programme created successfully");
            router.push('/admin/programmes');
         } else {
            await patchApi(`/programmes/${id}`, payload);
            toast.success("Programme updated successfully");
         }
      } catch (err) {
         toast.error("Failed to save programme");
      } finally {
         setSaving(false);
      }
   };

   const handleSaveUnit = (unit: any) => {
      if (editingUnit) {
         setFormData({
            ...formData,
            units: formData.units.map((u: any) => u.id === unit.id ? unit : u)
         });
      } else {
         setFormData({
            ...formData,
            units: [...formData.units, { ...unit, id: Date.now().toString() }]
         });
      }
      setIsUnitModalOpen(false);
      setEditingUnit(null);
   };

   const handleDeleteUnit = (unitId: string) => {
      setFormData({
         ...formData,
         units: formData.units.filter((u: any) => u.id !== unitId)
      });
   };

   const selectedSchool = schools.find(s => s.id === formData.schoolId);

   if (loading) return <div className="flex h-96 items-center justify-center font-black uppercase text-slate-400">Loading Academic Data...</div>;

   return (
      <div className="space-y-8 pb-20">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center space-x-6">
               <button onClick={() => router.back()} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowLeft size={20} />
               </button>
               <div>
                  <div className="flex items-center space-x-3 mb-1">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">{formData.level}</span>
                     <ChevronRight size={12} className="text-slate-300" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{formData.programme_code || "NEW PROGRAMME"}</span>
                  </div>
                  <h2 className="text-3xl font-black text-primary-darker font-serif leading-none">
                     {isNew ? "Create Academic Programme" : formData.title}
                  </h2>
               </div>
            </div>
            <div className="flex items-center space-x-4">
               {!isNew && (
                  <button className="p-4 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200">
                     <Trash2 size={20} />
                  </button>
               )}
               <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-4 px-10 flex items-center space-x-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
               >
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" /> : <Save size={18} />}
                  <span>{isNew ? "Launch Programme" : "Save Changes"}</span>
               </button>
            </div>
         </div>

         {/* Main Form Tabs */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-1">
               {[
                  { id: 'general', label: 'General Identity', icon: GraduationCap },
                  { id: 'admissions', label: 'Admissions & Entry', icon: Layers },
                  { id: 'details', label: 'Academic & Careers', icon: Info },
                  { id: 'curriculum', label: 'Course Structure', icon: BookOpen },
                  { id: 'enrollment', label: 'Tuition & Enrolment', icon: DollarSign },
                  { id: 'outcomes', label: 'Graduate Outcomes', icon: GraduationCap },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as TabType)}
                     className={`w-full flex items-center space-x-4 px-6 py-5 font-black text-[10px] uppercase tracking-widest transition-all text-left ${activeTab === tab.id
                        ? "bg-primary-darker text-white shadow-lg"
                        : "text-slate-500 hover:bg-slate-50"
                        }`}
                  >
                     <tab.icon size={18} className={activeTab === tab.id ? "text-primary" : ""} />
                     <span>{tab.label}</span>
                  </button>
               ))}
            </div>

            {/* Form Content */}
            <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm p-10 min-h-[600px]">
               {activeTab === 'general' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programme Title</label>
                           <input
                              type="text"
                              className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              value={formData.title || ""}
                              onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug / Permanent URL</label>
                           <input
                              type="text"
                              className="w-full bg-white border border-slate-200 p-4 font-medium text-slate-500 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              value={formData.slug || ""}
                              onChange={e => setFormData({ ...formData, slug: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title (Swahili) — optional</label>
                        <input
                           type="text"
                           className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                           value={formData.title_sw || ""}
                           onChange={e => setFormData({ ...formData, title_sw: e.target.value })}
                           placeholder="Kichwa cha Kiswahili..."
                        />
                     </div>

                     <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hosting School</label>
                           <button
                              type="button"
                              onClick={() => setIsSchoolModalOpen(true)}
                              className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm"
                           >
                              <div className="flex items-center space-x-3">
                                 <SchoolIcon size={18} className="text-primary" />
                                 <span>{selectedSchool ? selectedSchool.name : "Select a Hosting School"}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                 {selectedSchool && (
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1">
                                       {selectedSchool.programmes?.length || 0} Programmes
                                    </span>
                                 )}
                                 <ChevronDown size={16} className="text-slate-400" />
                              </div>
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programme Hero Image (Min. 1920px Wide)</label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                           <div className="space-y-4">
                              <input
                                 type="text"
                                 placeholder="Image URL or upload below..."
                                 className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                 value={formData.programme_image || ""}
                                 onChange={e => setFormData({ ...formData, programme_image: e.target.value })}
                              />
                              <div className="p-8 border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center space-y-4 rounded-sm hover:border-[#ff7f50] transition-colors cursor-pointer relative overflow-hidden">
                                 <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (!file) return;

                                       const img = new Image();
                                       img.src = URL.createObjectURL(file);
                                       await img.decode();

                                       if (img.width < 1920) {
                                          toast.error(`Institutional Standard Error: Image width is ${img.width}px. Minimum required is 1920px for high-fidelity hero sections.`);
                                          return;
                                       }

                                       toast.success("Image standards verified. Proceeding with upload...");
                                       setFormData({ ...formData, programme_image: img.src });
                                    }}
                                 />
                                 <Layers className="text-slate-300" size={32} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drag & Drop Institutional Media</span>
                              </div>
                           </div>
                           <div className="aspect-video bg-slate-100 border border-slate-200 overflow-hidden relative group">
                              {formData.programme_image ? (
                                 <img
                                    src={resolveImageUrl(formData.programme_image)}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                    alt="Hero Preview"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-300 font-serif ">
                                    Banner Preview Placeholder
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Department</label>
                           <button
                              type="button"
                              disabled={!formData.schoolId}
                              onClick={() => setIsDepartmentModalOpen(true)}
                              className={`w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker flex items-center justify-between transition-colors shadow-sm ${!formData.schoolId ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50'}`}
                           >
                              <div className="flex items-center space-x-3">
                                 <Layers size={18} className="text-primary" />
                                 <span>{formData.departmentId ? departments.find(d => d.id === formData.departmentId)?.name : "Select Department"}</span>
                              </div>
                              <ChevronDown size={16} className="text-slate-400" />
                           </button>
                           {!formData.schoolId && <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Select a school first</p>}
                        </div>
                        <div className="flex items-center space-x-4 pt-6">
                           <button
                              onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${formData.is_featured ? "bg-primary" : "bg-slate-200"}`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_featured ? "translate-x-6" : "translate-x-0"}`} />
                           </button>
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary-darker">Feature this Programme</span>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Overview / Summary</label>
                        <RichTextEditor
                           content={formData.overview || ""}
                           onChange={html => setFormData({ ...formData, overview: html })}
                           placeholder="Establish the institutional narrative for this programme..."
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overview (Swahili) — optional</label>
                        <RichTextEditor
                           content={formData.overview_sw || ""}
                           onChange={html => setFormData({ ...formData, overview_sw: html })}
                           placeholder="Muhtasari wa Kiswahili..."
                        />
                     </div>

                     {/* Workflow Status */}
                     <div className="bg-primary/5 p-10 border border-primary/20 rounded-[2.5rem] space-y-8 shadow-sm mt-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pb-4 border-b border-primary/10 flex items-center space-x-2">
                           <Tag size={14} />
                           <span>Workflow Status</span>
                        </h3>
                        <div className="space-y-4">
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Set the publishing status of this programme. Only PUBLISHED programmes are visible to the public.</p>
                           <CustomSelect 
                               options={[
                                 { value: "DRAFT", label: "Draft" },
                                 { value: "REVIEW", label: "Pending Review" },
                                 { value: "PUBLISHED", label: "Published" },
                                 { value: "ARCHIVED", label: "Archived" }
                               ]}
                               value={formData.status || "DRAFT"}
                               onChange={val => setFormData((prev: any) => ({...prev, status: val}))}
                               placeholder="Select Status"
                            />
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'admissions' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Status</label>
                           <select
                              className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary appearance-none shadow-sm"
                              value={formData.application_status || ""}
                              onChange={e => setFormData({ ...formData, application_status: e.target.value })}
                           >
                              {['Open', 'Waitlist', 'Closed', 'Coming Soon'].map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required ATAR Score (If Applicable)</label>
                           <input
                              type="text"
                              className="w-full bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                              value={formData.atar || ""}
                              onChange={e => setFormData({ ...formData, atar: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Requirements</label>
                        <RichTextEditor
                           content={formData.entry_requirements || ""}
                           onChange={html => setFormData({ ...formData, entry_requirements: html })}
                           placeholder="Detail the academic and professional prerequisites..."
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">RPL (Recognition of Prior Learning)</label>
                           <RichTextEditor
                              content={formData.rpl || ""}
                              onChange={html => setFormData({ ...formData, rpl: html })}
                              placeholder="Provisions for Recognition of Prior Learning..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credit & Entry Path</label>
                           <RichTextEditor
                              content={formData.credit_entry || ""}
                              onChange={html => setFormData({ ...formData, credit_entry: html })}
                              placeholder="Outline credit transfer and entry pathways..."
                           />
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'details' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                           <div className="flex items-center space-x-4">
                              <input 
                                 type="number" 
                                 min="1"
                                 className="w-1/2 bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                 placeholder="e.g. 4"
                                 value={durationValue}
                                 onChange={(e) => setDurationValue(e.target.value)}
                              />
                              <select 
                                 className="w-1/2 bg-white border border-slate-200 p-4 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
                                 value={durationUnit}
                                 onChange={(e) => setDurationUnit(e.target.value)}
                              >
                                 {["Years", "Months", "Weeks", "Semesters"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment methodology</label>
                           <RichTextEditor
                              content={formData.assessment || ""}
                              onChange={html => setFormData({ ...formData, assessment: html })}
                              placeholder="Describe the assessment methodology..."
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
                           <Edit size={12} className="mr-2" />
                           <span>Rich Text Learning Outcomes</span>
                        </label>
                        <RichTextEditor
                           content={formData.learning_outcomes || ""}
                           onChange={(html) => setFormData({ ...formData, learning_outcomes: html })}
                           placeholder="Define the pedagogical milestones for this programme..."
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Career Prospects</label>
                        <RichTextEditor
                           content={formData.careers || ""}
                           onChange={html => setFormData({ ...formData, careers: html })}
                           placeholder="Outline the global career outcomes for graduates..."
                        />
                     </div>
                  </div>
               )}

               {activeTab === 'curriculum' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="bg-primary-darker p-8 text-white font-serif flex items-center justify-between">
                        <span className="text-xl">Course Structure & Modules</span>
                        <button
                           onClick={async () => {
                              await fetchGlobalUnits();
                              setEditingUnit(null);
                              setIsUnitModalOpen(true);
                           }}
                           className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                        >
                           <Plus size={14} />
                           <span>Configure Units</span>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {formData.units.length > 0 ? (
                           formData.units.map((unit: any) => (
                              <div key={unit.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 hover:border-[#ff7f50]/30 group">
                                 <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-white flex items-center justify-center font-black text-[10px] text-primary border border-slate-100 uppercase tracking-widest">
                                       {unit.unit_code?.split(' ')[0] || "UNIT"}
                                    </div>
                                    <div>
                                       <h4 className="text-xs font-black uppercase text-primary-darker tracking-wider font-sans">{unit.unit_code}: {unit.title}</h4>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{unit.year_level || "Year 1"} • {unit.credits || 3} Credits</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                       onClick={() => {
                                          setEditingUnit(unit);
                                          setIsUnitModalOpen(true);
                                       }}
                                       className="p-2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                       <Edit size={14} />
                                    </button>
                                    <button
                                       onClick={() => handleDeleteUnit(unit.id)}
                                       className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="py-12 text-center border-4 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                              No course units configured for this programme yet.
                           </div>
                        )}
                     </div>

                     <div className="space-y-4 pt-8 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curriculum Text Summary</label>
                        <RichTextEditor
                           content={formData.programme_structure || ""}
                           onChange={html => setFormData({ ...formData, programme_structure: html })}
                           placeholder="Describe the curriculum philosophy and study blocks..."
                        />
                     </div>
                  </div>
               )}

               {activeTab === 'enrollment' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tuition Cost (Est.)</label>
                           <div className="relative">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input
                                 type="text"
                                 placeholder="e.g. KES 150,000 / Semester"
                                 className="w-full bg-white border border-slate-200 p-4 pl-12 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                 value={formData.cost || ""}
                                 onChange={e => setFormData({ ...formData, cost: e.target.value })}
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enrolment Portal Link</label>
                           <div className="relative">
                              <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                              <input
                                 type="text"
                                 className="w-full bg-white border border-slate-200 p-4 pl-12 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-sm"
                                 value={formData.enroll_link || ""}
                                 onChange={e => setFormData({ ...formData, enroll_link: e.target.value })}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fees & Scholarships Details</label>
                        <RichTextEditor
                           content={formData.fees_scholarships || ""}
                           onChange={html => setFormData({ ...formData, fees_scholarships: html })}
                           placeholder="Investment details and institutional scholarships..."
                        />
                     </div>
                  </div>
               )}

               {activeTab === 'outcomes' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="bg-primary-darker p-10 text-white font-serif border-b-8 border-secondary">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Graduate Academic Outcomes</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Define the competency milestones for this programme</p>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center">
                              <Edit size={12} className="mr-2" />
                              <span>Rich Text Outcome Editor (HTML Enabled)</span>
                           </label>
                           <textarea
                              className="w-full bg-white border border-slate-200 p-10 font-normal font-serif text-xl text-primary-darker outline-none focus:ring-2 focus:ring-primary h-[600px] leading-relaxed shadow-sm"
                              placeholder="Enter outcomes using HTML tags..."
                              value={formData.learning_outcomes || ""}
                              onChange={e => setFormData({ ...formData, learning_outcomes: e.target.value })}
                           />
                        </div>

                        <div className="space-y-6">
                           <div className="bg-slate-50 p-8 border border-slate-100">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-darker mb-6 flex items-center">
                                 <Info size={14} className="mr-2 text-primary" />
                                 Formatting Guide
                              </h4>
                              <div className="space-y-4">
                                 <div className="p-4 bg-white border border-slate-200">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Bullet Points</p>
                                    <code className="text-[10px] text-primary font-mono block mb-2">&lt;ul&gt;</code>
                                    <code className="text-[10px] text-primary font-mono block pl-4">&lt;li&gt;Outcome 1&lt;/li&gt;</code>
                                    <code className="text-[10px] text-primary font-mono block pl-4">&lt;li&gt;Outcome 2&lt;/li&gt;</code>
                                    <code className="text-[10px] text-primary font-mono block">&lt;/ul&gt;</code>
                                 </div>
                                 <div className="p-4 bg-white border border-slate-200">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Emphasis Styles</p>
                                    <p className="text-[10px] text-slate-600 mb-1 font-mono">&lt;b&gt;Bold Text&lt;/b&gt;</p>
                                    <p className="text-[10px] text-slate-600 font-mono">&lt;i&gt;Italic Text&lt;/i&gt;</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* School Selection Modal */}
         <AnimatePresence>
            {isSchoolModalOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-darker/60 backdrop-blur-sm p-6 overflow-y-auto">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white w-full max-w-xl shadow-2xl p-0 overflow-hidden"
                  >
                     <div className="p-8 bg-primary-darker text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-xl font-black uppercase tracking-widest font-serif">University Schools</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select the hosting faculty for this programme</p>
                        </div>
                        <button onClick={() => setIsSchoolModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                     </div>
                     <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input
                              type="text"
                              placeholder="Search schools..."
                              className="w-full bg-white border-none p-4 pl-12 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
                           />
                        </div>
                     </div>
                     <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                        {schools.map(s => (
                           <button
                              key={s.id}
                              onClick={() => {
                                 setFormData({ ...formData, schoolId: s.id });
                                 setIsSchoolModalOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-6 transition-all ${formData.schoolId === s.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white hover:bg-slate-50 text-primary-darker border border-slate-100'}`}
                           >
                              <div className="flex items-center space-x-4">
                                 <SchoolIcon size={20} className={formData.schoolId === s.id ? 'text-white' : 'text-primary'} />
                                 <span className="font-black uppercase tracking-widest text-xs font-sans">{s.name}</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${formData.schoolId === s.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                                 {s.programmes?.length || 0} Programmes
                              </span>
                           </button>
                        ))}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Department Selection Modal */}
         <AnimatePresence>
            {isDepartmentModalOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-darker/60 backdrop-blur-sm p-6 overflow-y-auto">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white w-full max-w-xl shadow-2xl p-0 overflow-hidden"
                  >
                     <div className="p-8 bg-primary text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-xl font-black uppercase tracking-widest font-serif">Academic Departments</h3>
                           <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Select the specialised unit for this programme</p>
                        </div>
                        <button onClick={() => setIsDepartmentModalOpen(false)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                     </div>
                     <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest px-8">
                        Departments within {selectedSchool?.name || "Selected School"}
                     </div>
                     <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                        {departments
                           .filter(d => d.schoolId === formData.schoolId || d.school?.id === formData.schoolId)
                           .map(d => (
                           <button
                              key={d.id}
                              onClick={() => {
                                 setFormData({ ...formData, departmentId: d.id });
                                 setIsDepartmentModalOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-6 transition-all ${formData.departmentId === d.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white hover:bg-slate-50 text-primary-darker border border-slate-100'}`}
                           >
                              <div className="flex items-center space-x-4">
                                 <Layers size={20} className={formData.departmentId === d.id ? 'text-white' : 'text-primary'} />
                                 <span className="font-black uppercase tracking-widest text-xs font-sans">{d.name}</span>
                              </div>
                              {formData.departmentId === d.id && <Save size={16} />}
                           </button>
                        ))}
                        {departments.filter(d => d.schoolId === formData.schoolId || d.school?.id === formData.schoolId).length === 0 && (
                           <div className="py-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">
                              No departments found for this school.
                           </div>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Multi-Select Global Unit Picker Modal */}
         <AnimatePresence>
            {isUnitModalOpen && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center bg-primary-darker/60 backdrop-blur-sm p-6 overflow-y-auto">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white w-full max-w-2xl shadow-2xl p-0 overflow-hidden"
                  >
                     <div className="p-8 bg-primary text-white flex justify-between items-center">
                        <div>
                           <h3 className="text-xl font-black uppercase tracking-widest font-serif">Academic Unit Library</h3>
                           <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Batch selection from university unit registry</p>
                        </div>
                        <button onClick={() => { setIsUnitModalOpen(false); setIsQuickAddMode(false); }} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                     </div>

                     {!isQuickAddMode ? (
                        <>
                           <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
                              <div className="relative">
                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                 <input
                                    type="text"
                                    placeholder="Search by code or title (e.g. COMP 101)..."
                                    className="w-full bg-white border border-slate-200 p-4 pl-12 font-medium text-primary-darker outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
                                    value={unitSearchQuery}
                                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                                 />
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2">
                                 {["All", "YEAR 1", "YEAR 2", "YEAR 3", "YEAR 4"].map(year => (
                                    <button
                                       key={year}
                                       onClick={() => setActiveYearFilter(year)}
                                       className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeYearFilter === year ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                                    >
                                       {year}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                              {(Array.isArray(allGlobalUnits) ? allGlobalUnits : [])
                                 .filter(u => {
                                    const matchesSearch = u.title.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
                                       u.unit_code.toLowerCase().includes(unitSearchQuery.toLowerCase());
                                    const matchesYear = activeYearFilter === "All" || u.year_level.toUpperCase().includes(activeYearFilter);
                                    return matchesSearch && matchesYear;
                                 })
                                 .map(unit => {
                                    const isSelected = selectedUnitIds.includes(unit.id);
                                    const isAlreadyInProgram = formData.units.some((u: any) => u.id === unit.id);

                                    return (
                                       <button
                                          key={unit.id}
                                          disabled={isAlreadyInProgram}
                                          onClick={() => {
                                             if (isSelected) {
                                                setSelectedUnitIds(prev => prev.filter(id => id !== unit.id));
                                             } else {
                                                setSelectedUnitIds(prev => [...prev, unit.id]);
                                             }
                                          }}
                                          className={`w-full flex items-center justify-between p-6 transition-all border outline-none
                                ${isAlreadyInProgram ? 'bg-slate-50 opacity-50 cursor-not-allowed border-slate-100' :
                                                isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-100'}`}
                                       >
                                          <div className="flex items-center space-x-6">
                                             <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-slate-200 bg-white'}`}>
                                                {isSelected && <Plus size={14} className="text-white" />}
                                             </div>
                                             <div className="text-left">
                                                <div className="flex items-center space-x-2">
                                                   <span className="font-black text-xs text-primary-darker uppercase tracking-tighter">{unit.unit_code}</span>
                                                   {isAlreadyInProgram && <span className="text-[8px] font-black uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 tracking-widest">Added</span>}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">{unit.title}</p>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{unit.credits} Credits</p>
                                             <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1">{unit.year_level}</p>
                                          </div>
                                       </button>
                                    );
                                 })}

                              <button
                                 onClick={() => setIsQuickAddMode(true)}
                                 className="w-full p-8 border-4 border-dashed border-slate-100 text-slate-400 hover:border-[#ff7f50]/20 hover:text-primary transition-all flex flex-col items-center justify-center space-y-2 group"
                              >
                                 <Plus size={32} className="group-hover:scale-110 transition-transform" />
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Can't find it? Create New Institutional Unit</span>
                              </button>
                           </div>

                           <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                 {selectedUnitIds.length} Targets Selected
                              </div>
                              <button
                                 disabled={selectedUnitIds.length === 0}
                                 onClick={() => {
                                    const unitsToAdd = allGlobalUnits.filter(u => selectedUnitIds.includes(u.id));
                                    setFormData({
                                       ...formData,
                                       units: [...formData.units, ...unitsToAdd]
                                    });
                                    setIsUnitModalOpen(false);
                                    setSelectedUnitIds([]);
                                    setUnitSearchQuery("");
                                    toast.success(`Successfully batch-added ${unitsToAdd.length} units to curriculum`);
                                 }}
                                 className="bg-primary text-white py-4 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-[#ff7f50] hover:text-white transition-all disabled:opacity-50 disabled:shadow-none"
                              >
                                 Deploy to Curriculum
                              </button>
                           </div>
                        </>
                     ) : (
                        <div className="p-10 space-y-8">
                           <div className="flex items-center space-x-3 text-primary font-black uppercase tracking-widest text-xs border-b border-primary/10 pb-4 mb-6">
                              <Plus size={16} />
                              <span>Instant Unit Creation</span>
                           </div>

                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Code</label>
                                 <input
                                    type="text"
                                    placeholder="e.g. BSDS 101"
                                    className="w-full bg-slate-50 p-4 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-inner"
                                    value={newUnitData.unit_code}
                                    onChange={e => setNewUnitData({ ...newUnitData, unit_code: e.target.value })}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Study Year Filter</label>
                                 <select
                                    className="w-full bg-slate-50 p-4 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary appearance-none"
                                    value={newUnitData.year_level}
                                    onChange={e => setNewUnitData({ ...newUnitData, year_level: e.target.value })}
                                 >
                                    {["YEAR 1", "YEAR 2", "YEAR 3", "YEAR 4"].map(y => <option key={y} value={y}>{y}</option>)}
                                 </select>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Course Title</label>
                              <input
                                 type="text"
                                 placeholder="e.g. Introduction to Data Science"
                                 className="w-full bg-slate-50 p-4 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-inner"
                                 value={newUnitData.title}
                                 onChange={e => setNewUnitData({ ...newUnitData, title: e.target.value })}
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credit Volume</label>
                                 <input
                                    type="number"
                                    className="w-full bg-slate-50 p-4 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary shadow-inner"
                                    value={newUnitData.credits}
                                    onChange={e => setNewUnitData({ ...newUnitData, credits: parseInt(e.target.value) })}
                                 />
                              </div>
                           </div>

                           <div className="flex space-x-4 pt-6">
                              <button
                                 onClick={() => setIsQuickAddMode(false)}
                                 className="flex-1 bg-slate-100 text-slate-500 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                              >
                                 Back to Library
                              </button>
                              <button
                                 onClick={async () => {
                                    if (!newUnitData.unit_code || !newUnitData.title) return toast.error("Required fields missing");
                                    const created = await postApi('/course-units', newUnitData);
                                    if (created) {
                                       toast.success("New institutional unit registered successfully");
                                       await fetchGlobalUnits();
                                       setSelectedUnitIds(prev => [...prev, created.id]);
                                       setIsQuickAddMode(false);
                                    }
                                 }}
                                 className="flex-[2] bg-primary text-white py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-[#ff7f50] hover:text-white transition-all"
                              >
                                 Register & Ready for Selection
                              </button>
                           </div>
                        </div>
                     )}
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
