"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Edit, Trash2, RefreshCw, X, Check,
  ChevronDown, ArrowRight, Eye, EyeOff, Tag,
  Users, Award, Bookmark, Globe, ExternalLink, Key
} from "lucide-react";
import { getApi, postApi, patchApi, deleteApi, resolveImageUrl } from "@/lib/api";
import { PROFILE_IMAGE_PLACEHOLDER_DATA_URI } from "@/lib/profile-image-placeholder";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import ProvisioningCredentialsModal, { type ProvisioningDetails } from "@/components/admin/ProvisioningCredentialsModal";
import { getSchools } from "@/lib/api";
import Highlight from "@/components/Highlight";

// ─── Searchable Select Component with "Just-in-Time" Creation ────────────────
function SearchableSelect({
  label, options, value, onChange, placeholder = "Select...", getId, getLabel, onAddNew
}: {
  label: string;
  options: any[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  getId: (o: any) => string;
  getLabel: (o: any) => string;
  onAddNew?: (val: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const filtered = options.filter(o => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => getId(o) === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setIsAdding(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newVal || !onAddNew) return;
    setSavingNew(true);
    try {
      await onAddNew(newVal);
      setIsAdding(false);
      setNewVal("");
      setSearch("");
    } catch {
      toast.error("Failed to create entity");
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center transition-all group hover:bg-slate-100"
        >
          <span className={selected ? "text-primary-darker" : "text-slate-400"}>
            {selected ? getLabel(selected) : placeholder}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-[100] w-full bg-white border border-slate-200 shadow-2xl mt-1 max-h-72 overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                >
                  None / Clear Selection
                </button>
                {filtered.map(o => (
                  <button
                    key={getId(o)}
                    type="button"
                    onClick={() => { onChange(getId(o)); setOpen(false); setSearch(""); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${value === getId(o) ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    {getLabel(o)}
                  </button>
                ))}
                {filtered.length === 0 && !isAdding && (
                  <div className="p-4 text-xs text-slate-400 text-center">No matches</div>
                )}
              </div>
              {onAddNew && (
                <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                   {isAdding ? (
                     <div className="flex items-center space-x-2">
                        <input 
                          autoFocus
                          value={newVal}
                          onChange={e => setNewVal(e.target.value)}
                          placeholder={`New ${label.toLowerCase()}...`}
                          className="flex-1 bg-white border border-slate-200 p-2 text-xs font-bold outline-none"
                        />
                        <button 
                          onClick={handleCreate}
                          disabled={savingNew}
                          className="bg-primary text-white p-2 hover:bg-[#ff7f50] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {savingNew ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                     </div>
                   ) : (
                     <button 
                        onClick={() => { setIsAdding(true); setNewVal(search); }}
                        className="w-full flex items-center justify-center space-x-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-[#ff7f50] hover:text-white transition-colors"
                     >
                       <Plus size={12} />
                       <span>Register New</span>
                     </button>
                   )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Multi-Searchable Select Component ─────────────────────────────────────────
function MultiSearchableSelect({
  label, options, value, onChange, placeholder = "Select...", getId, getLabel, onAddNew
}: {
  label: string;
  options: any[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  getId: (o: any) => string;
  getLabel: (o: any) => string;
  onAddNew?: (val: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newVal, setNewVal] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const filtered = options.filter(o => getLabel(o).toLowerCase().includes(search.toLowerCase()));
  const selectedOptions = options.filter(o => value.includes(getId(o)));

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setIsAdding(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newVal || !onAddNew) return;
    setSavingNew(true);
    try {
      await onAddNew(newVal);
      setIsAdding(false);
      setNewVal("");
      setSearch("");
    } catch {
      toast.error("Failed to create entity");
    } finally {
      setSavingNew(false);
    }
  };

  const toggleOption = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center transition-all group hover:bg-slate-100 min-h-[52px]"
        >
          <span className={selectedOptions.length > 0 ? "text-primary-darker flex flex-wrap gap-1" : "text-slate-400"}>
            {selectedOptions.length > 0 ? selectedOptions.map(o => (
              <span key={getId(o)} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{getLabel(o)}</span>
            )) : placeholder}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-[100] w-full bg-white border border-slate-200 shadow-2xl mt-1 max-h-72 overflow-hidden flex flex-col"
            >
              <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50 p-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { onChange([]); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                >
                  Clear All
                </button>
                {filtered.map(o => (
                  <button
                    key={getId(o)}
                    type="button"
                    onClick={() => toggleOption(getId(o))}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors flex justify-between items-center ${value.includes(getId(o)) ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    <span>{getLabel(o)}</span>
                    {value.includes(getId(o)) && <Check size={14} />}
                  </button>
                ))}
                {filtered.length === 0 && !isAdding && (
                  <div className="p-4 text-xs text-slate-400 text-center">No matches</div>
                )}
              </div>
              {onAddNew && (
                <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                   {isAdding ? (
                     <div className="flex items-center space-x-2">
                        <input 
                          autoFocus
                          value={newVal}
                          onChange={e => setNewVal(e.target.value)}
                          placeholder={`New ${label.toLowerCase()}...`}
                          className="flex-1 bg-white border border-slate-200 p-2 text-xs font-bold outline-none"
                        />
                        <button 
                          onClick={handleCreate}
                          disabled={savingNew}
                          className="bg-primary text-white p-2 hover:bg-[#ff7f50] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {savingNew ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                     </div>
                   ) : (
                     <button 
                        onClick={() => { setIsAdding(true); setNewVal(search); }}
                        className="w-full flex items-center justify-center space-x-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-[#ff7f50] hover:text-white transition-colors"
                     >
                       <Plus size={12} />
                       <span>Register New</span>
                     </button>
                   )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Clean Custom Select Component ──────────────────────────────────────────
function CleanSelect({
  label, options, value, onChange, placeholder = "Select..."
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full bg-slate-50 border-none p-4 font-bold text-sm text-left outline-none focus:ring-2 focus:ring-primary flex justify-between items-center transition-all group hover:bg-slate-100"
        >
          <span className={value ? "text-primary-darker" : "text-slate-400"}>
            {value || placeholder}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute z-[100] w-full bg-white border border-slate-200 shadow-2xl mt-1 overflow-hidden"
            >
              <div className="max-h-56 overflow-y-auto">
                {options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${value === opt ? "text-primary bg-primary/5" : "text-slate-700"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const STATUSES = ["Published", "Review", "Draft", "Archived"];

const STATUS_COLORS: Record<string, string> = {
  Published: "bg-green-50 text-green-700",
  Review: "bg-blue-50 text-blue-700",
  Draft: "bg-orange-50 text-orange-700",
  Archived: "bg-slate-100 text-slate-500",
};

export default function StaffDirectoryAdmin() {
  const [members, setMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [executiveTypes, setExecutiveTypes] = useState<any[]>([]);
  const [staffTypes, setStaffTypes] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [allPerms, setAllPerms] = useState<any[]>([]);

  // Pagination & Server-side filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [search, setSearch] = useState("");
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisionModal, setProvisionModal] = useState<any>(null);
  const [provisionForm, setProvisionForm] = useState({ roleId: "", allowedPermIds: [] as string[], deniedPermIds: [] as string[] });
  const [provisionSaving, setProvisionSaving] = useState(false);
  const [provisionDetails, setProvisionDetails] = useState<ProvisioningDetails | null>(null);

  useEffect(() => { 
    setMounted(true); 
    fetchMetadata();
    getApi('/admin/roles').then(r => r && setAllRoles(r));
    getApi('/admin/roles/permissions').then(r => r && setAllPerms(r));
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [page, search]);

  const emptyForm = {
    full_name: "", honorific_title: "", profile_slug: "",
    bio: "", message: "", academic_qualifications: "",
    specializations: "", publications: "", 
    is_current: "Yes", display_order: "0",
    service_start_date: "", service_end_date: "",
    email: "", phone_number: "", linkedin_url: "", twitter_url: "",
    website_url: "", google_scholar_url: "", github_url: "", researchgate_url: "", profile_image_url: "",
    status: "Published",
    departmentId: "", executiveTypeIds: [] as string[], staffTypeId: "", schoolId: "",
    is_public: true, is_public_contact: false, show_publications: false, 
    show_message: false, show_research_links: false, is_featured: false,
    meta_title: "", meta_description: "", og_image_url: "",
    staffRoleId: "", staffAllowedPermIds: [] as string[], staffDeniedPermIds: [] as string[]
  };
  const [form, setForm] = useState(emptyForm);

  const fetchMetadata = async () => {
    try {
      const [d, eTypes, sTypes, s] = await Promise.all([
        getApi('/short-courses/taxonomies/departments'),
        getApi('/staff/executive-types'),
        getApi('/staff/staff-types'),
        getSchools()
      ]);
      setDepartments(d || []);
      setExecutiveTypes(eTypes || []);
      setStaffTypes(sTypes || []);
      setSchools(s || []);
    } catch { toast.error("Failed to load metadata"); }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search
      }).toString();
      
      const mems = await getApi(`/staff?${params}`);
      setMembers(mems.data || []);
      setTotalMembers(mems.total || 0);
      setTotalPages(mems.totalPages || 1);
    } catch { toast.error("Failed to load staff data"); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelected(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (member: any) => {
    setSelected(member);
    setForm({
      ...emptyForm,
      full_name: member.full_name || "", honorific_title: member.honorific_title || "",
      profile_slug: member.profile_slug || "", bio: member.bio || "", message: member.message || "",
      academic_qualifications: member.academic_qualifications || "", specializations: member.specializations || "",
      publications: member.publications || "", is_current: member.is_current ? "Yes" : "No",
      display_order: String(member.display_order ?? "0"),
      service_start_date: member.service_start_date?.slice(0,10) || "",
      service_end_date: member.service_end_date?.slice(0,10) || "",
      email: member.email || "", phone_number: member.phone_number || "",
      linkedin_url: member.linkedin_url || "", twitter_url: member.twitter_url || "",
      website_url: member.website_url || "", google_scholar_url: member.google_scholar_url || "",
      github_url: member.github_url || "", researchgate_url: member.researchgate_url || "",
      profile_image_url: member.profile_image_url || "", status: member.status || "Published",
      departmentId: member.department?.id || "", executiveTypeIds: member.executive_types?.map((e: any) => e.id) || [],
      staffTypeId: member.staff_type?.id || "", schoolId: member.school?.id || "",
      is_public: member.is_public ?? true, is_public_contact: member.is_public_contact ?? false,
      show_publications: member.show_publications ?? false, show_message: member.show_message ?? false,
      show_research_links: member.show_research_links ?? false, is_featured: member.is_featured ?? false,
      meta_title: member.meta_title || "", meta_description: member.meta_description || "",
      og_image_url: member.og_image_url || "",
      staffRoleId: member.user?.role?.id || "",
      staffAllowedPermIds: (member.user?.allowedPermissions || []).map((p: any) => p.id),
      staffDeniedPermIds:  (member.user?.deniedPermissions  || []).map((p: any) => p.id),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name) { toast.error("Full Name is required"); return; }
    setSaving(true);
    try {
      const payload: any = { ...form };
      payload.is_current = form.is_current === "Yes";
      payload.display_order = parseInt(form.display_order) || 0;

      if (form.departmentId) payload.department = { id: form.departmentId };
      if (form.executiveTypeIds && form.executiveTypeIds.length > 0) {
         payload.executive_types = form.executiveTypeIds.map((id: string) => ({ id }));
      } else {
         payload.executive_types = [];
      }
      if (form.staffTypeId) payload.staff_type = { id: form.staffTypeId };
      if (form.schoolId) payload.school = { id: form.schoolId };
      
      // Ensure booleans are correct
      payload.is_public = !!form.is_public;
      payload.is_public_contact = !!form.is_public_contact;
      payload.show_publications = !!form.show_publications;
      payload.show_message = !!form.show_message;
      payload.show_research_links = !!form.show_research_links;
      payload.is_featured = !!form.is_featured;
      
      if (!payload.profile_slug) payload.profile_slug = form.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Remove IAM fields so TypeORM doesn't try to save them to the Staff table
      delete payload.staffRoleId;
      delete payload.staffAllowedPermIds;
      delete payload.staffDeniedPermIds;

      if (selected) {
        await patchApi(`/staff/${selected.id}`, payload);
        // Sync IAM overrides to the linked system user if one exists
        if (selected.user?.id && (form.staffRoleId || form.staffAllowedPermIds.length || form.staffDeniedPermIds.length)) {
          await patchApi(`/auth/users/${selected.user.id}`, {
            roleId: form.staffRoleId || undefined,
            allowedPermissionIds: form.staffAllowedPermIds,
            deniedPermissionIds:  form.staffDeniedPermIds,
          });
        }
        toast.success("Profile updated");
      } else {
        await postApi('/staff', payload);
        toast.success("Profile created");
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch { toast.error("Database sync failed"); }
    finally { setSaving(false); }
  };

  const { showAlert } = useAlert();

  const handleDelete = async (id: string, name: string) => {
    showAlert({
      title: "Remove Staff Profile?",
      message: `Are you sure you want to completely remove "${name}" from the system?`,
      confirmText: "Delete",
      onConfirm: async () => {
        try { 
          await deleteApi(`/staff/${id}`); 
          toast.success("Profile Removed"); 
          fetchMembers(); 
        } catch { 
          toast.error("Removal failed"); 
        }
      }
    });
  };

  const toggleStaffPerm = (permId: string, type: "allow" | "deny" | "inherit") => {
    setForm(prev => {
      let allowed = [...prev.staffAllowedPermIds];
      let denied  = [...prev.staffDeniedPermIds];
      allowed = allowed.filter(id => id !== permId);
      denied  = denied.filter(id => id !== permId);
      if (type === "allow") allowed.push(permId);
      if (type === "deny")  denied.push(permId);
      return { ...prev, staffAllowedPermIds: allowed, staffDeniedPermIds: denied };
    });
  };

  const toggleProvisionPerm = (permId: string, type: "allow" | "deny" | "inherit") => {
    setProvisionForm(prev => {
      let allowed = [...prev.allowedPermIds];
      let denied  = [...prev.deniedPermIds];
      allowed = allowed.filter(id => id !== permId);
      denied  = denied.filter(id => id !== permId);
      if (type === "allow") allowed.push(permId);
      if (type === "deny")  denied.push(permId);
      return { ...prev, allowedPermIds: allowed, deniedPermIds: denied };
    });
  };

  const handleProvisionAccess = (m: any) => {
    if (!m.email) {
      toast.error("Staff member must have an email address to provision access.");
      return;
    }
    setProvisionModal(m);
    setProvisionForm({ roleId: "", allowedPermIds: [], deniedPermIds: [] });
  };

  const submitProvisionAccess = async () => {
    if (!provisionModal) return;
    setProvisionSaving(true);
    try {
      const res = await postApi("/auth/users", {
        fullName: provisionModal.full_name,
        email: provisionModal.email,
        userType: "staff",
        department: provisionModal.department?.name || "",
        school: provisionModal.school?.name || "",
        roleId: provisionForm.roleId || undefined,
        allowedPermissionIds: provisionForm.allowedPermIds,
        deniedPermissionIds:  provisionForm.deniedPermIds,
      });
      
      if (res?.provisioning) {
        setProvisionDetails(res.provisioning);
        setProvisionModal(null);
        fetchMembers();
        toast.success(
          res.provisioning.emailSent
            ? "Credentials provisioned — welcome email sent."
            : "Credentials provisioned — copy login details below.",
        );
      } else if (res?.user?.id || res?.id) {
        toast.success("Credentials provisioned! Welcome email dispatched.");
        setProvisionModal(null);
        fetchMembers();
      } else {
        toast.error(res?.message || "Failed. They may already have an account or validation failed.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to provision access.");
    } finally {
      setProvisionSaving(false);
    }
  };

  const handleAddDept = async (name: string) => {
    const res = await postApi('/departments', { name });
    await fetchMetadata();
    f("departmentId", res.id);
  };
  const handleAddExecType = async (name: string) => {
    const res = await postApi('/staff/executive-types', { name });
    await fetchMetadata();
    f("executiveTypeIds", [...form.executiveTypeIds, res.id]);
  };
  const handleAddStaffType = async (name: string) => {
    const res = await postApi('/staff/staff-types', { name });
    await fetchMetadata();
    f("staffTypeId", res.id);
  };

  const filtered = members; // Server-side search implemented
  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[1000] flex items-center justify-center bg-primary-darker/60 backdrop-blur-md p-6"
        >
          <motion.div
             initial={{ scale: 0.95, y: 20 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.95, y: 20 }}
             className="bg-white w-full max-w-5xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
             <div className="p-8 bg-primary-darker text-white flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-6">
                   <div className="w-12 h-12 bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                      <Users size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-widest">{selected ? "Edit Personnel Profile" : "Register New Staff/Council"}</h3>
                      <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">{selected ? `Editing Profile ID: ${selected.id.slice(0, 8)}` : "Institution directory initialization"}</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                   <X size={24} />
                </button>
             </div>
             
               <div className="overflow-y-auto p-12 space-y-12 flex-1 scrollbar-hide">
                  <section className="space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Identity Protocol</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Honorific Title</label>
                           <input 
                              value={form.honorific_title} 
                              onChange={e => {
                                 f("honorific_title", e.target.value);
                                 if (!selected) {
                                    const slug = `${e.target.value} ${form.full_name}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    f("profile_slug", slug);
                                 }
                              }} 
                              className="w-full bg-slate-50 p-5 font-black text-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                              placeholder="e.g. Prof., Dr., Mr." 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                           <input 
                              value={form.full_name} 
                              onChange={e => {
                                 f("full_name", e.target.value);
                                 if (!selected) {
                                    const slug = `${form.honorific_title} ${e.target.value}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    f("profile_slug", slug);
                                 }
                              }} 
                              className="w-full bg-slate-100 p-5 font-black text-primary-darker outline-none border-l-4 border-primary focus:ring-0" 
                              placeholder="e.g. John Doe" 
                           />
                        </div>
                        <div className="col-span-2 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO Profile Slug</label>
                           <input 
                              value={form.profile_slug} 
                              onChange={e => f("profile_slug", e.target.value.toLowerCase())} 
                              className="w-full bg-slate-50 p-5 font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                              placeholder="e.g. john-doe" 
                           />
                        </div>
                     </div>
                  </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Taxonomy & Framework</h4>
                   <div className="grid grid-cols-2 gap-8">
                      <SearchableSelect label="Department" options={departments} value={form.departmentId} onChange={v => f("departmentId", v)} placeholder="Select department..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddDept} />
                      <SearchableSelect label="School" options={schools} value={form.schoolId} onChange={v => f("schoolId", v)} placeholder="Select school..." getId={o => o.id} getLabel={o => o.name} />
                      <MultiSearchableSelect label="Executive Types" options={executiveTypes} value={form.executiveTypeIds} onChange={v => f("executiveTypeIds", v)} placeholder="E.g. Governing Council..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddExecType} />
                      <SearchableSelect label="Staff Type" options={staffTypes} value={form.staffTypeId} onChange={v => f("staffTypeId", v)} placeholder="E.g. Academic Staff..." getId={o => o.id} getLabel={o => o.name} onAddNew={handleAddStaffType} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Profile</label>
                        <div className="flex bg-slate-100 p-1 rounded-sm w-fit">
                          <button type="button" onClick={() => f("is_featured", true)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.is_featured ? 'bg-white text-primary shadow-sm rounded-sm' : 'text-slate-400 hover:text-slate-600'}`}>Featured</button>
                          <button type="button" onClick={() => f("is_featured", false)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!form.is_featured ? 'bg-white text-primary-darker shadow-sm rounded-sm' : 'text-slate-400 hover:text-slate-600'}`}>Standard</button>
                        </div>
                      </div>
                      <CleanSelect label="Currently Active" options={["Yes", "No"]} value={form.is_current} onChange={v => f("is_current", v)} />
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Start</label><input type="date" value={form.service_start_date} onChange={e => f("service_start_date", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service End</label><input type="date" value={form.service_end_date} onChange={e => f("service_end_date", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                   </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Professional Narrative</h4>
                   <div className="space-y-10">
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biography</label><RichTextEditor content={form.bio} onChange={html => f("bio", html)} placeholder="Professional biography..." /></div>
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Message / Statement</label><RichTextEditor content={form.message} onChange={html => f("message", html)} placeholder="A direct message to students or peers..." /></div>
                   </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Qualifications & Publications</h4>
                   <div className="space-y-10">
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Qualifications</label><RichTextEditor content={form.academic_qualifications} onChange={html => f("academic_qualifications", html)} placeholder="Degrees, certificates, PhDs..." /></div>
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Areas of Specialisation</label><textarea rows={3} value={form.specializations} onChange={e => f("specializations", e.target.value)} className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none focus:border-primary transition-all" placeholder="E.g. Artificial Intelligence, Cloud Systems Design..." /></div>
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Publications/Research</label><textarea rows={3} value={form.publications} onChange={e => f("publications", e.target.value)} className="w-full bg-slate-50 p-6 font-medium text-slate-700 outline-none focus:border-primary transition-all" placeholder="A list of notable publications..." /></div>
                   </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Digital Footprint</h4>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Email</label><input value={form.email} onChange={e => f("email", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label><input value={form.phone_number} onChange={e => f("phone_number", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" placeholder="+254..." /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LinkedIn URL</label><input value={form.linkedin_url} onChange={e => f("linkedin_url", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Scholar URL</label><input value={form.google_scholar_url} onChange={e => f("google_scholar_url", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ResearchGate URL</label><input value={form.researchgate_url} onChange={e => f("researchgate_url", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GitHub URL</label><input value={form.github_url} onChange={e => f("github_url", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div className="col-span-2 space-y-4">
                        <ImageUploader 
                          label="Profile Image" 
                          value={form.profile_image_url} 
                          onChange={val => f("profile_image_url", val)} 
                          placeholder="Link to external image or upload to server..."
                        />
                      </div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Order</label><input type="number" value={form.display_order} onChange={e => f("display_order", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" /></div>
                    </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Visibility & Privacy Engine</h4>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {[
                        { key: "is_public", label: "Public Profile Page", desc: "Allow profile to be viewed by visitors" },
                        { key: "is_public_contact", label: "Show Contact Details", desc: "Display email and phone publically" },
                        { key: "show_publications", label: "Show Publications", desc: "Display research and publications section" },
                        { key: "show_message", label: "Show Personal Message", desc: "Display message/statement at top" },
                        { key: "show_research_links", label: "Show Digital Footprint", desc: "Display LinkedIn, Scholar, etc links" },
                      ].map(toggle => (
                        <div key={toggle.key} className="p-6 bg-slate-50 border border-slate-100 flex items-start justify-between cursor-pointer group" onClick={() => f(toggle.key, !form[toggle.key as keyof typeof form])}>
                          <div className="space-y-1">
                             <div className="text-[10px] font-black uppercase tracking-widest text-primary-darker">{toggle.label}</div>
                             <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{toggle.desc}</div>
                          </div>
                          {form[toggle.key as keyof typeof form] ? <Eye className="text-primary" size={18} /> : <EyeOff className="text-slate-300 group-hover:text-slate-400" size={18} />}
                        </div>
                      ))}
                   </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-primary/10 pb-4 mb-8">Search Engine Optimisation (SEO)</h4>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Title Override</label>
                        <input value={form.meta_title} onChange={e => f("meta_title", e.target.value)} className="w-full bg-slate-50 p-5 font-bold text-primary-darker outline-none focus:ring-2 focus:ring-primary" placeholder="Default: [Honorific] [Name] | OUK" />
                      </div>
                      <div className="row-span-2 space-y-4">
                        <ImageUploader 
                          label="Social Share Image (OG)" 
                          value={form.og_image_url} 
                          onChange={val => f("og_image_url", val)} 
                          placeholder="Image for social media sharing..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                        <textarea rows={3} value={form.meta_description} onChange={e => f("meta_description", e.target.value)} className="w-full bg-slate-50 p-5 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Brief summary for search results..." />
                      </div>
                   </div>
                </section>



                <section className="bg-primary-darker p-12 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 -mr-32 -mt-32 rounded-full blur-3xl transition-all group-hover:bg-[#ff7f50] hover:text-white" />
                   <div className="relative z-10 space-y-10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white border-b border-white/10 pb-4">Profile Availability State</h4>
                      <div className="grid grid-cols-4 gap-4">
                         {STATUSES.map(s => (
                           <button key={s} type="button" onClick={() => f("status", s)} className={`py-5 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.status === s ? 'bg-primary border-primary text-white shadow-lg' : 'bg-transparent border-white/20 text-white/40 hover:border-white/40'}`}>{s}</button>
                         ))}
                      </div>
                   </div>
                </section>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">State: <span className="text-primary">{form.status}</span></div>
                <div className="flex items-center space-x-4">
                   {selected && (
                      <a 
                        href={`/about/staff/${form.profile_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-slate-50 transition-all border border-slate-200"
                      >
                         <ExternalLink size={14} />
                         <span>Preview Profile</span>
                      </a>
                   )}
                   <button onClick={() => setIsModalOpen(false)} className="py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                   <button onClick={handleSave} disabled={saving} className="btn-primary py-4 px-12 flex items-center space-x-4 text-xs font-black uppercase tracking-widest shadow-2xl disabled:opacity-50">
                      {saving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={18} />}
                      <span>{selected ? "Update Profile" : "Finalise Profile"}</span>
                   </button>
                </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
         <div>
            <h2 className="text-4xl font-black text-primary-darker mb-2 font-serif uppercase tracking-tighter">Staff & Governance Dir.</h2>
            <p className="text-slate-500 font-medium text-sm">Personnel matrices and institutional council registry.</p>
         </div>
         <button onClick={openCreate} className="btn-primary py-5 px-10 flex items-center space-x-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
            <Plus size={20} />
            <span>New Profile</span>
         </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Total Profiles", val: members.length, icon: Users },
           { label: "Governing Execs", val: members.filter(m => m.executive_types?.length > 0).length, icon: Award },
           { label: "Taxonomy Layers", val: executiveTypes.length + staffTypes.length, icon: Tag },
           { label: "Departments", val: departments.length, icon: Bookmark }
         ].map(stat => (
           <div key={stat.label} className="bg-white border border-slate-100 p-6 flex items-center justify-between">
              <div>
                 <div className="text-3xl font-black text-primary-darker">{stat.val}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
              </div>
              <stat.icon size={24} className="text-slate-100" />
           </div>
         ))}
      </div>

      <div className="bg-white border border-slate-200 p-4">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search by name or title..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 p-4 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" />
         </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32"><RefreshCw className="animate-spin text-primary" size={48} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center border-4 border-dashed border-slate-100"><Users size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-slate-400 uppercase font-black tracking-widest text-sm">No profiles found</p></div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-hidden">
           <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-4">Profile Name</div>
              <div className="col-span-3">Exec / Staff Type</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Actions</div>
           </div>
           {filtered.map((m, i) => (
             <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center group cursor-pointer" onClick={() => openEdit(m)}>
                <div className="col-span-4 flex items-center space-x-4">
                   <div className="w-10 h-10 bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={resolveImageUrl(m.profile_image_url) || PROFILE_IMAGE_PLACEHOLDER_DATA_URI} 
                        alt={m.full_name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                   </div>
                   <div>
                      <p className="font-black text-primary-darker text-sm tracking-tight">
                        <Highlight text={`${m.honorific_title || ""} ${m.full_name || ""}`.trim()} query={search} quiet />
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{m.email || m.profile_slug}</p>
                   </div>
                </div>
                <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <p className="text-primary">{m.executive_types?.map((et:any) => et.name).join(", ") || "Standard Staff"}</p>
                   <p className="opacity-60">{m.staff_type?.name}</p>
                </div>
                <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{m.department?.name || "—"}</div>
                <div className="col-span-1"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${STATUS_COLORS[m.status] || "bg-slate-100 text-slate-500"}`}>{m.status}</span></div>
                <div className="col-span-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); handleProvisionAccess(m); }} className="p-2 text-slate-300 hover:text-amber-500 transition-colors" title="Provision Login Credentials"><Key size={16} /></button>
                   <button className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit size={16} /></button>
                   <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id, m.full_name); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
             </motion.div>
           ))}
           
           {/* Pagination Bar */}
           <div className="px-8 py-6 bg-slate-100/50 flex justify-between items-center border-t border-slate-200">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                 Directory Capacity: {totalMembers} Registered Profiles
              </div>
              <div className="flex items-center space-x-2">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   className="p-2 bg-white border border-slate-200 text-primary-darker disabled:opacity-30 hover:bg-slate-50 transition-colors"
                 >
                   <ArrowRight size={16} className="rotate-180" />
                 </button>
                 <div className="px-4 text-xs font-black uppercase tracking-widest text-primary-darker">
                    Page {page} <span className="text-slate-300 mx-2">/</span> {totalPages}
                 </div>
                 <button 
                   disabled={page >= totalPages}
                   onClick={() => setPage(p => p + 1)}
                   className="p-2 bg-white border border-slate-200 text-primary-darker disabled:opacity-30 hover:bg-slate-50 transition-colors"
                 >
                   <ArrowRight size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}
      {mounted && createPortal(modalContent, document.body)}
      {mounted && createPortal(
        <AnimatePresence>
          {provisionModal && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[1100] flex items-center justify-center bg-primary-darker/70 backdrop-blur-sm p-6"
            >
              <motion.div
                 initial={{ scale: 0.95, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.95, y: 20 }}
                 className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
              >
                 <div className="p-8 bg-primary-darker text-white flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-6">
                       <div className="w-12 h-12 bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/20">
                          <Key size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-widest">Provision Access Credentials</h3>
                          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Configuring IAM for {provisionModal.full_name}</p>
                       </div>
                    </div>
                    <button onClick={() => setProvisionModal(null)} className="text-slate-400 hover:text-white transition-colors">
                       <X size={24} />
                    </button>
                 </div>
                 
                 <div className="p-8 overflow-y-auto bg-slate-50 flex-1 scrollbar-hide space-y-8">
                   <div className="bg-white border border-slate-200 p-6 shadow-sm">
                     <p className="text-sm font-semibold text-slate-700">Are you sure you want to create a system account for <span className="text-primary-darker font-black">{provisionModal.full_name}</span>?</p>
                     <p className="text-xs text-slate-500 mt-2">They will receive a welcome email with a one-time password to <span className="font-mono text-slate-700 bg-slate-100 px-1">{provisionModal.email}</span>.</p>
                   </div>

                   {/* IAM Overrides */}
                   <section className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-darker border-b border-slate-200 pb-4">
                       Identity &amp; Access Override
                     </h4>
                     
                     {/* Role Assignment */}
                     {allRoles.length > 0 && (
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Assign System Role</p>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                           <label className={`flex items-center gap-3 p-4 cursor-pointer border transition-colors shadow-sm ${provisionForm.roleId === "" ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                             <input type="radio" name="provRole" value="" checked={provisionForm.roleId === ""} onChange={() => setProvisionForm(prev => ({...prev, roleId: ""}))} className="accent-primary w-4 h-4" />
                             <div><p className="text-xs font-bold text-slate-700 uppercase tracking-wide">No Role</p><p className="text-[10px] text-slate-400">Minimal access</p></div>
                           </label>
                           {allRoles.map((r: any) => (
                             <label key={r.id} className={`flex items-center gap-3 p-4 cursor-pointer border transition-colors shadow-sm ${provisionForm.roleId === r.id ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                               <input type="radio" name="provRole" value={r.id} checked={provisionForm.roleId === r.id} onChange={() => setProvisionForm(prev => ({...prev, roleId: r.id}))} className="accent-primary w-4 h-4" />
                               <div><p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{r.name}</p><p className="text-[10px] text-slate-400">{r.permissions?.length || 0} perms</p></div>
                             </label>
                           ))}
                         </div>
                       </div>
                     )}
                     
                     {/* Permission Overrides */}
                     {allPerms.length > 0 && (
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 mt-8">Per-User Permission Overrides</p>
                         <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                           {allPerms.map((perm: any) => {
                             const isAllowed = provisionForm.allowedPermIds.includes(perm.id);
                             const isDenied  = provisionForm.deniedPermIds.includes(perm.id);
                             const roleHas   = allRoles.find((r: any) => r.id === provisionForm.roleId)?.permissions?.some((p: any) => p.id === perm.id);
                             return (
                               <div key={perm.id} className="flex items-center justify-between bg-white border border-slate-200 p-4 shadow-sm hover:border-primary/30 transition-colors">
                                 <div>
                                   <p className="text-xs font-bold text-slate-700">{perm.name}</p>
                                   <p className="text-[10px] text-slate-400 mt-1">{perm.slug || perm.description}</p>
                                 </div>
                                 <div className="flex gap-1 text-[9px] font-black uppercase tracking-widest shrink-0 bg-slate-50 p-1 border border-slate-100">
                                   <button type="button" onClick={() => toggleProvisionPerm(perm.id, "allow")}
                                     className={`px-3 py-2 transition-all ${isAllowed ? "bg-teal-500 text-white shadow" : "bg-transparent text-slate-400 hover:bg-teal-50 hover:text-teal-700"}`}>Allow</button>
                                   <button type="button" onClick={() => toggleProvisionPerm(perm.id, "inherit")}
                                     className={`px-3 py-2 transition-all ${!isAllowed && !isDenied ? "bg-slate-300 text-slate-800 shadow" : "bg-transparent text-slate-400 hover:bg-slate-200"}`}>{roleHas ? "Role ✓" : "Inherit"}</button>
                                   <button type="button" onClick={() => toggleProvisionPerm(perm.id, "deny")}
                                     className={`px-3 py-2 transition-all ${isDenied ? "bg-rose-500 text-white shadow" : "bg-transparent text-slate-400 hover:bg-rose-50 hover:text-rose-700"}`}>Deny</button>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )}
                   </section>
                 </div>

                 <div className="p-6 border-t border-slate-100 bg-white flex justify-end items-center flex-shrink-0 space-x-4">
                    <button onClick={() => setProvisionModal(null)} className="py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary-darker transition-colors">Cancel</button>
                    <button onClick={submitProvisionAccess} disabled={provisionSaving} className="btn-primary py-4 px-10 flex items-center space-x-4 text-xs font-black uppercase tracking-widest shadow-xl disabled:opacity-50">
                       {provisionSaving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={18} />}
                       <span>Provision System Access</span>
                    </button>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      , document.body)}

      {provisionDetails && (
        <ProvisioningCredentialsModal
          provisioning={provisionDetails}
          onClose={() => setProvisionDetails(null)}
        />
      )}
    </div>
  );
}
