"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Phone, User as UserIcon, Loader2, Mail, Building2, Upload, Pencil, X, Check, Search, Filter, RefreshCw, Power } from "lucide-react";
import { postApi, patchApi, deleteApi, getSchools, uploadFile, resolveImageUrl, getPeerLearners } from "@/lib/api";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Pagination } from "@/components/ui/Pagination";

interface PeerLearner {
    id: string;
    name: string;
    phone: string;
    email: string;
    image_url: string;
    is_active: boolean;
    school?: {
        id: string;
        name: string;
    };
}

interface LearnersResponse {
    data: PeerLearner[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminPeerLearners() {
    const [learnersData, setLearnersData] = useState<LearnersResponse | null>(null);
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Filter & Pagination State
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [schoolIdFilter, setSchoolIdFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        schoolId: "",
        image_url: "",
        is_active: true
    });

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchSchools();
    }, []);

    useEffect(() => {
        fetchLearners();
    }, [debouncedSearch, schoolIdFilter, page]);

    const fetchSchools = async () => {
        try {
            const data = await getSchools();
            setSchools(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch schools", error);
        }
    };

    // Diagnostics for schoolId selection
    useEffect(() => {
        // formData.schoolId changed
    }, [formData.schoolId]);

    const fetchLearners = async () => {
        setLoading(true);
        try {
            const response = await getPeerLearners({
                page,
                limit,
                search: debouncedSearch,
                schoolId: schoolIdFilter !== 'all' ? schoolIdFilter : undefined
            });

            // STRICT: Expect paginated object from DB-oriented backend
            if (response && response.data) {
                setLearnersData(response);
            } else {
                console.warn("Backend did not return paginated data. Ensure server is updated and running.");
                setLearnersData({ data: [], total: 0, page: 1, totalPages: 0 });
            }
        } catch (error) {
            console.error("Failed to fetch learners", error);
            setLearnersData({ data: [], total: 0, page: 1, totalPages: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadFile(file);
            setFormData(prev => ({ ...prev, image_url: res.url }));
        } catch (error) {
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (learner: PeerLearner) => {
        setEditingId(learner.id);
        setFormData({
            name: learner.name,
            phone: learner.phone || "",
            email: learner.email || "",
            schoolId: learner.school?.id || "",
            image_url: learner.image_url || "",
            is_active: learner.is_active
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: "", phone: "", email: "", schoolId: "", image_url: "", is_active: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Payload Normalization for DB relationships
            // Ensure we don't send "" or "all" to a UUID column
            const cleanSchoolId = (formData.schoolId === "" || formData.schoolId === "all") ? null : formData.schoolId;
            
            const payload = {
                ...formData,
                schoolId: cleanSchoolId
            };

            if (editingId) {
                await patchApi(`/peer-learners/${editingId}`, payload);
            } else {
                await postApi("/peer-learners", payload);
            }
            handleCancel();
            fetchLearners();
        } catch (error: any) {
            console.error("Update/Add failed:", error);
            alert(`Failed to ${editingId ? "update" : "add"} learner: ${error.message || "Unknown Error"}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Move this record to Recycle Bin?")) return;
        try {
            await deleteApi(`/peer-learners/${id}`);
            fetchLearners();
        } catch (error) {
            alert("Failed to delete learner");
        }
    };

    const toggleStatus = async (id: string) => {
        try {
            // Specialized management endpoint
            await patchApi(`/peer-learners/${id}/toggle-status`, {});
            fetchLearners();
        } catch (error: any) {
            console.error("Failed to toggle status", error);
            alert("Failed to change status. Ensure backend is modernized and running.");
        }
    };

    const resetFilters = () => {
        setSearch("");
        setSchoolIdFilter("all");
        setPage(1);
    };

    const schoolOptions = React.useMemo(() => [
        { value: 'all', label: 'All Global Schools', icon: <Building2 size={14} /> },
        ...schools.map(s => ({ value: s.id, label: s.name, icon: <Building2 size={14} /> }))
    ], [schools]);

    const formSchoolOptions = React.useMemo(() => 
        schools.map(s => ({ value: s.id, label: s.name, icon: <Building2 size={14} /> }))
    , [schools]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section - Refined */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-50 pb-8 gap-6">
                <div>
                   <h1 className="text-3xl font-black text-primary-darker tracking-tight uppercase leading-none">Mentorship Registry</h1>
                   <p className="text-sm font-medium text-slate-500 mt-2">Manage official student mentors and verified peer learning experts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a 
                        href="/admin/recycle-bin"
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={14} />
                        <span>Recycle Bin</span>
                    </a>
                    <button 
                        onClick={() => { handleCancel(); }}
                        className="bg-primary text-white py-3.5 px-8 rounded-xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 hover:bg-[#ff7f50] hover:text-white transition-all"
                    >
                        <Plus size={16} />
                        <span>Add Mentor</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview - Premium Density */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Mentors", val: learnersData?.total || 0, color: "text-primary" },
                    { label: "Global Schools", val: schools.length, color: "text-primary-darker" },
                    { label: "System Health", val: "100%", color: "text-emerald-500" },
                    { label: "Verified Ratio", val: "94%", color: "text-primary-darker" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-slate-100 p-6 shadow-sm transition-all hover:shadow-md">
                        <div className={`text-2xl font-black ${stat.color} mb-1 tracking-tight`}>{stat.val}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Form Column - Cleaned */}
                <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <section className="bg-white border border-slate-100 p-8 shadow-sm">
                        <div className="mb-10 pl-5 border-l-4 border-primary">
                            <h3 className="text-sm font-black uppercase tracking-tight text-primary-darker">
                                {editingId ? "Update Mentor Profile" : "New Entry Verification"}
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                {editingId ? `Editing ID: ${editingId.split('-')[0]}...` : "Onboard a new peer learning expert"}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-1">Full Identity</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-1">Official Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                        placeholder="email@ouk.ac.ke"
                                    />
                                </div>
                                <div className="space-y-1.5 text-left">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                        placeholder="+254..."
                                    />
                                </div>
                                
                                <CustomSelect 
                                    label="Assigned School"
                                    options={formSchoolOptions}
                                    value={formData.schoolId}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, schoolId: val }));
                                    }}
                                    placeholder="Select School"
                                    className="text-left"
                                />
                                
                                <div className="pt-4 text-left border-t border-slate-50">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-4 block ml-1">Profile Media</label>
                                    <div className="flex items-center space-x-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-50">
                                            {formData.image_url ? (
                                                <img src={resolveImageUrl(formData.image_url)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={24} className="text-slate-200" />
                                            )}
                                        </div>
                                        <label className="flex-1 cursor-pointer">
                                            <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center space-y-1 hover:border-[#ff7f50] transition-all">
                                                <Upload size={16} className={uploading ? "animate-bounce text-primary" : "text-slate-300"} />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                                                    {uploading ? "Uploading" : "Upload Image"}
                                                </span>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                             <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving || uploading}
                                className={`w-full py-5 rounded-none font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-3 shadow-lg hover:translate-y-[-1px] active:translate-y-[0] disabled:bg-slate-100 disabled:text-slate-300 ${editingId ? "bg-primary-darker" : "bg-primary"} text-white`}
                            >
                                {saving ? <Loader2 className="animate-spin" size={14} /> : (editingId ? <Pencil size={14} /> : <Check size={14} />)}
                                <span>{editingId ? "COMMIT CHANGES" : "PUBLISH TO REGISTRY"}</span>
                            </button>
                            
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    Cancel Operations
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                {/* List Column - Cleaned Header */}
                <div className="xl:col-span-8 space-y-6">
                     {/* Minimal Search & Filtering */}
                    <div className="bg-white border border-slate-100 p-6 shadow-sm transition-all focus-within:border-primary/30">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search registry by name, email or phone..."
                                    className="w-full bg-slate-50 border-none py-4 pl-12 pr-6 text-primary-darker font-bold text-sm outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                            <CustomSelect 
                                options={schoolOptions}
                                value={schoolIdFilter}
                                onChange={setSchoolIdFilter}
                                placeholder="Filter Schools"
                            />
                            {(search || schoolIdFilter !== 'all') && (
                                <button 
                                    onClick={resetFilters}
                                    className="px-4 py-2 text-slate-400 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest"
                                    title="Reset Filters"
                                >
                                    CLEAR
                                </button>
                            )}
                        </div>
                    </div>

                    <section className="bg-white border border-slate-100 overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Global Mentor Pool <span className="text-slate-200 mx-2">/</span> Page {page} of {learnersData?.totalPages || 1}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sync Active</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="py-32 text-center text-slate-200">
                                    <Loader2 className="mx-auto animate-spin mb-4" size={32} />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Synchronising...</p>
                                </div>
                            ) : !learnersData || !learnersData.data || learnersData.data.length === 0 ? (
                                <div className="py-32 text-center space-y-4">
                                    <Search size={32} className="mx-auto text-slate-100" />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No entries found</p>
                                </div>
                            ) : (
                                 learnersData.data.map((learner) => (
                                    <div key={learner.id} className={`group px-8 py-6 flex items-center justify-between hover:bg-slate-50 border-l-4 border-transparent hover:border-[#ff7f50] transition-all ${!learner.is_active ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex items-center space-x-6">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 group-hover:border-[#ff7f50]/20 transition-colors">
                                                    {learner.image_url ? (
                                                        <img src={resolveImageUrl(learner.image_url)} alt={learner.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                    ) : (
                                                        <UserIcon size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => toggleStatus(learner.id)}
                                                    className={`absolute -bottom-1 -right-1 w-6 h-6 border-2 border-white flex items-center justify-center transition-all ${learner.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                                    title={learner.is_active ? "Active" : "Inactive"}
                                                >
                                                    <Power size={8} />
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <h4 className="text-sm font-black text-primary-darker tracking-tight uppercase group-hover:text-primary transition-colors">{learner.name}</h4>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <Building2 size={12} className="mr-2 text-primary/40" />
                                                        {learner.school ? (
                                                           <span className="text-slate-600 font-bold">{learner.school.name}</span>
                                                        ) : (
                                                           <span className="text-slate-300 italic">No School Assigned</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        <Mail size={12} className="mr-2 text-primary/40" />
                                                        <span className="text-slate-600 font-bold lowercase tracking-normal">{learner.email || "system@ouk.ac.ke"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(learner)}
                                                className="px-4 py-2 bg-primary-darker text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all shadow-md active:scale-95"
                                                title="Edit Profile"
                                            >
                                                EDIT
                                            </button>
                                            <button
                                                onClick={() => handleDelete(learner.id)}
                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                                                title="Archive Entry"
                                            >
                                                REMOVE
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Pagination - Simplified */}
                    {learnersData && (
                        <Pagination 
                            currentPage={page}
                            totalPages={learnersData.totalPages}
                            onPageChange={setPage}
                            total={learnersData.total}
                            limit={limit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
