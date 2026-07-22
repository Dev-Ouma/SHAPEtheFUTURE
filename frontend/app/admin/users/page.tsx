"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getApi, postApi, patchApi, deleteApi, getSchools, getDepartments } from "@/lib/api";
import { toast } from "react-hot-toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import PermissionGate from "@/components/admin/PermissionGate";
import ProvisioningCredentialsModal, { type ProvisioningDetails } from "@/components/admin/ProvisioningCredentialsModal";
import { usePermission } from "@/hooks/useAdminPermissions";
import Highlight from "@/components/Highlight";

// ── Icons ──────────────────────────────────────────────────────────────────
const IEdit = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const IAdd = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const ISearch = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IKey = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const IShield = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IChev = ({ dir = "right" }: { dir?: string }) => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} /></svg>;
const IClose = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ITrash = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IMore = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>;

// ── Types ──────────────────────────────────────────────────────────────────
const USER_TYPES = ["staff", "executive", "student", "alumni", "external"];
const STATUSES   = ["active", "pending", "suspended"];

// Dynamic options will be mapped from states


const statusStyle: Record<string, string> = {
  active:    "bg-teal-50 text-teal-700 border-teal-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusDot: Record<string, string> = {
  active: "bg-teal-500", pending: "bg-amber-500", suspended: "bg-rose-500",
};

const BLANK_FORM = { fullName: "", email: "", username: "", userType: "staff", department: "", school: "", phone_number: "", roleId: "", partnerInstitutionId: "", allowedPermissionIds: [] as string[], deniedPermissionIds: [] as string[] };

export default function UsersPage() {
  return (
    <PermissionGate permission="users.view">
      <UsersPageInner />
    </PermissionGate>
  );
}

function UsersPageInner() {
  const { can: canManage } = usePermission("users.manage");
  const [users,    setUsers]    = useState<any[]>([]);
  const [roles,    setRoles]    = useState<any[]>([]);
  const [allPerms, setAllPerms] = useState<any[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, lastPage: 1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [filter,   setFilter]   = useState({ userType: "", status: "" });

  // Modal
  const [modal,    setModal]    = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form,     setForm]     = useState({ ...BLANK_FORM });
  const [saving,   setSaving]   = useState(false);
  const [provisioning, setProvisioning] = useState<ProvisioningDetails | null>(null);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  
  // Dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Dynamic Options
  const [schoolOptions, setSchoolOptions] = useState<{label: string, value: string}[]>([]);
  const [deptOptions, setDeptOptions] = useState<{label: string, value: string}[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<{label: string, value: string}[]>([]);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15", search });
    if (filter.userType) params.set("userType", filter.userType);
    const res = await getApi(`/auth/users?${params}`);
    if (res?.data) { setUsers(res.data); setMeta(res.meta || meta); }
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { 
    fetchUsers(); 
    fetchMetadata();
  }, [fetchUsers]);
  
  useEffect(() => {
    getApi("/admin/roles").then(r => r && setRoles(r));
    getApi("/admin/roles/permissions").then(r => r && setAllPerms(r));
    getApi("/shape/partners/admin")
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setPartnerOptions(
          list.map((p: any) => ({
            label: p.short_name || p.name,
            value: p.id,
          })),
        );
      })
      .catch(() => setPartnerOptions([]));
  }, []);

  const fetchMetadata = async () => {
    try {
      const [schoolsData, deptsData] = await Promise.all([getSchools(), getDepartments()]);
      if (schoolsData) {
        setSchoolOptions(schoolsData.map((s: any) => ({ label: s.name, value: s.name })));
      }
      if (deptsData) {
        setDeptOptions(deptsData.map((d: any) => ({ label: d.name, value: d.name })));
      }
    } catch (e) {
      console.error("Failed to load metadata for options", e);
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const openEdit = (user: any) => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    setSelected(user);
    setForm({
      fullName: user.full_name || "",
      email: user.email || "",
      username: user.username || "",
      userType: user.user_type || "staff",
      department: user.department || "",
      school: user.school || "",
      phone_number: user.phone_number || "",
      roleId: user.role?.id || "",
      partnerInstitutionId: user.partner_institution_id || "",
      allowedPermissionIds: (user.allowedPermissions || []).map((p: any) => p.id),
      deniedPermissionIds:  (user.deniedPermissions  || []).map((p: any) => p.id),
    });
    setModal("edit");
  };

  const togglePerm = (permId: string, type: "allow" | "deny" | "inherit") => {
    setForm(f => {
      let allowed = [...f.allowedPermissionIds];
      let denied  = [...f.deniedPermissionIds];
      allowed = allowed.filter(id => id !== permId);
      denied  = denied.filter(id => id !== permId);
      if (type === "allow") allowed.push(permId);
      if (type === "deny")  denied.push(permId);
      return { ...f, allowedPermissionIds: allowed, deniedPermissionIds: denied };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    setSaving(true);
    const payload: any = {
      full_name: form.fullName,
      email: form.email.trim().toLowerCase(),
      username: form.username.trim().toLowerCase() || undefined,
      user_type: form.userType,
      department: form.department,
      school: form.school,
      phone_number: form.phone_number,
      roleId: form.roleId || undefined,
      partner_institution_id: form.partnerInstitutionId || null,
      allowedPermissionIds: form.allowedPermissionIds,
      deniedPermissionIds:  form.deniedPermissionIds,
    };
    try {
      let res;
      if (modal === "edit" && selected) {
        res = await patchApi(`/auth/users/${selected.id}`, payload);
      } else {
        res = await postApi("/auth/users", { ...payload, fullName: form.fullName });
      }
      
      if (res?.provisioning) {
        setProvisioning(res.provisioning);
        setModal(null);
        fetchUsers();
        toast.success(
          res.provisioning.emailSent
            ? "User created — welcome email sent."
            : "User created — copy credentials below (email not configured).",
        );
      } else if (res?.id || res?.user?.id || res?.email || res?.message) {
        toast.success(modal === "edit" ? "User updated." : "User saved.");
        setModal(null); fetchUsers();
      } else {
        toast.error("Operation failed. Check the details.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    if (!confirm(`Send password reset email to ${email}?`)) return;
    const res = await postApi("/auth/forgot-password", { email: email.trim().toLowerCase() });
    if (res?.resetUrl) {
      setProvisioning({
        username: email,
        email,
        temporaryPassword: "",
        loginUrl: `${window.location.origin}/admin/login`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        emailSent: false,
        deliveryNote: "SMTP not configured — share this reset link manually.",
        resetUrl: res.resetUrl,
      });
      toast.success("Reset link generated — share manually (email not sent).");
    } else if (res?.emailSent === false) {
      toast.error("Reset email could not be sent. Check SMTP settings.");
    } else {
      toast.success("Reset email dispatched.");
    }
  };

  const handleReprovision = async (user: any) => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    if (!confirm(`Generate a new temporary password for ${user.email}?`)) return;
    try {
      const res = await postApi(`/auth/users/${user.id}/reprovision`, {});
      if (res?.provisioning) {
        setProvisioning(res.provisioning);
        toast.success(
          res.provisioning.emailSent
            ? "New login details emailed to the user."
            : "New login details generated — copy below.",
        );
      } else {
        toast.error("Failed to reprovision user access.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to reprovision user access.");
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    const next = user.account_status === "suspended" ? "active" : "suspended";
    const res = await patchApi(`/auth/users/${user.id}`, { account_status: next });
    if (res) { toast.success(`Account ${next}`); fetchUsers(); }
  };

  const handleDelete = async (id: string) => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    setDeleting(true);
    const res = await deleteApi(`/auth/users/${id}`);
    setDeleting(false);
    if (res) {
      toast.success("User deleted successfully.");
      setSelectedIds(prev => prev.filter(sId => sId !== id));
      fetchUsers();
    } else {
      toast.error("Failed to delete user.");
    }
  };

  const handleBulkDelete = async () => {
    if (!canManage) {
      toast.error("You do not have permission to manage users.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected users?`)) return;
    setDeleting(true);
    let successCount = 0;
    // Execute sequentially to avoid rate-limits or db locks for simple admin operation
    for (const id of selectedIds) {
      const res = await deleteApi(`/auth/users/${id}`);
      if (res) successCount++;
    }
    setDeleting(false);
    toast.success(`Deleted ${successCount} out of ${selectedIds.length} users.`);
    setSelectedIds([]);
    fetchUsers();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length && users.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-primary-darker flex items-center gap-3">
            <span className="p-2 bg-primary/10 text-primary"><IShield /></span>
            Identity & Access Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage user credentials, roles, and security policies across all portals.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <input type="text" placeholder="Search name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-56 bg-slate-50 border-none pl-9 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none" />
            <span className="absolute left-3 top-3 text-slate-400"><ISearch /></span>
          </div>
          {/* Filters */}
          <select value={filter.userType} onChange={e => { setFilter(f => ({ ...f, userType: e.target.value })); setPage(1); }}
            className="bg-slate-50 border-none py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary outline-none">
            <option value="">All Types</option>
            {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {canManage && (
            <button onClick={() => { setForm({ ...BLANK_FORM }); setSelected(null); setModal("add"); }}
              className="bg-primary hover:bg-primary-darker text-white px-5 py-2.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors">
              <IAdd /> Add User
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: meta.total, color: "text-primary-darker" },
          { label: "Page", value: `${meta.page} / ${meta.lastPage}`, color: "text-slate-600" },
          { label: "Roles Available", value: roles.length, color: "text-purple-600" },
          { label: "Showing", value: users.length, color: "text-slate-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Bulk Actions Banner ── */}
      {canManage && selectedIds.length > 0 && (
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between border border-slate-700 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-sm font-bold tracking-wide">users selected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
              Cancel Selection
            </button>
            <button disabled={deleting} onClick={handleBulkDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50">
              <ITrash /> {deleting ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200">
        <div className="overflow-x-auto min-h-[300px] pb-24">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4 w-12">
                  {canManage ? (
                    <input type="checkbox" className="accent-primary w-4 h-4" 
                      checked={users.length > 0 && selectedIds.length === users.length} 
                      onChange={toggleSelectAll} 
                    />
                  ) : null}
                </th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role & Type</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">Loading user directory…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No users found matching your criteria.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors group ${selectedIds.includes(u.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-6 py-4 w-12">
                    {canManage ? (
                      <input type="checkbox" className="accent-primary w-4 h-4" 
                        checked={selectedIds.includes(u.id)} 
                        onChange={() => toggleSelectRow(u.id)} 
                      />
                    ) : null}
                  </td>
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          <Highlight text={u.full_name || ""} query={search} quiet />
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        {u.username && <p className="text-[10px] text-primary font-bold">@{u.username}</p>}
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{u.role?.name || u.role_legacy || "—"}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {u.user_type || "—"}
                    </span>
                  </td>
                  {/* Dept */}
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.department || "—"}</td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide border px-2.5 py-1 rounded-full ${statusStyle[u.account_status] || statusStyle.pending}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[u.account_status] || statusDot.pending}`} />
                      {u.account_status || "pending"}
                    </span>
                    {u.login_attempts > 0 && (
                      <p className="text-[10px] text-amber-500 font-bold mt-1">{u.login_attempts} failed logins</p>
                    )}
                  </td>
                  {/* Last login */}
                  <td className="px-6 py-4 text-sm text-slate-500">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "Never"}</td>
                  {/* Actions */}
                  <td className="px-6 py-4">
                    {canManage ? (
                    <div className="relative flex justify-end">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdownId(openDropdownId === u.id ? null : u.id); }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors relative z-10">
                        <IMore />
                      </button>
                      
                      {openDropdownId === u.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }}></div>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); openEdit(u); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2 transition-colors">
                            <span className="text-slate-400"><IEdit /></span> Edit Profile
                          </button>
                          
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleReprovision(u); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2 transition-colors">
                            <span className="text-slate-400"><IKey /></span> Resend Login Details
                          </button>

                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleResetPassword(u.email); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 transition-colors">
                            <span className="text-slate-400"><IKey /></span> Reset Password
                          </button>
                          
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleToggleStatus(u); }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${u.account_status === "suspended" ? "text-teal-600 hover:bg-teal-50" : "text-rose-600 hover:bg-rose-50"}`}>
                            <span className="text-slate-400"><IShield /></span> {u.account_status === "suspended" ? "Activate Account" : "Suspend Account"}
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1"></div>
                          
                          <button disabled={deleting} onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(u.id); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors disabled:opacity-50">
                            <span className="text-rose-400"><ITrash /></span> Delete User
                          </button>
                        </div>
                        </>
                      )}
                    </div>
                    ) : (
                      <span className="block text-right text-[10px] font-bold uppercase tracking-wider text-slate-300">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Showing {users.length} of {meta.total} users
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <IChev dir="left" />
            </button>
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
              .filter(n => n === 1 || n === meta.lastPage || Math.abs(n - page) <= 2)
              .map((n, idx, arr) => (
                <React.Fragment key={n}>
                  {idx > 0 && arr[idx - 1] !== n - 1 && <span className="text-slate-300 px-1">…</span>}
                  <button onClick={() => setPage(n)}
                    className={`w-8 h-8 text-[11px] font-black rounded transition-colors ${n === page ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                    {n}
                  </button>
                </React.Fragment>
              ))}
            <button disabled={page >= meta.lastPage} onClick={() => setPage(p => p + 1)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <IChev />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-black text-sm uppercase tracking-widest text-slate-800">
                  {modal === "edit" ? "Edit User Profile" : "Onboard New User"}
                </h2>
                {modal === "edit" && selected && (
                  <p className="text-xs text-slate-400 mt-0.5">{selected.email}</p>
                )}
              </div>
              <button onClick={() => setModal(null)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
                <IClose />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              {/* Name & Email & Username */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input required type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-slate-50 border-none p-3 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-slate-50 border-none p-3 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Auto-generated if blank"
                    className="w-full bg-slate-50 border-none p-3 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>

              {/* School & User Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 flex flex-col">
                  <CustomSelect
                    label="School / Faculty"
                    options={schoolOptions}
                    value={form.school}
                    onChange={(val) => setForm(f => ({ ...f, school: val }))}
                    placeholder="Select School"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <CustomSelect
                    label="User Type"
                    options={USER_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                    value={form.userType}
                    onChange={(val) => setForm(f => ({ ...f, userType: val }))}
                    placeholder="Select Type"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                  <input type="tel" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                    className="w-full bg-slate-50 border-none p-3 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                {form.userType === "staff" && (
                  <div className="space-y-1.5 flex flex-col">
                    <CustomSelect
                      label="Department"
                      options={deptOptions}
                      value={form.department}
                      onChange={(val) => setForm(f => ({ ...f, department: val }))}
                      placeholder="Select Department"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Role Assignment */}
              <div className="space-y-3 border border-slate-100 p-5 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <IShield />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">System Role Assignment</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {/* No role option */}
                  <label className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors rounded ${form.roleId === "" ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <input type="radio" name="role" value="" checked={form.roleId === ""} onChange={() => setForm(f => ({ ...f, roleId: "" }))} className="accent-primary" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">No Role</p>
                      <p className="text-[10px] text-slate-400">Minimal portal access</p>
                    </div>
                  </label>
                  {roles.map(r => (
                    <label key={r.id} className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors rounded ${form.roleId === r.id ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <input type="radio" name="role" value={r.id} checked={form.roleId === r.id} onChange={() => setForm(f => ({ ...f, roleId: r.id }))} className="accent-primary" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{r.name}</p>
                        <p className="text-[10px] text-slate-400">{r.permissions?.length || 0} permissions</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* SHAPE partner link (for Partner Institution role) */}
              <div className="space-y-1.5 flex flex-col">
                <CustomSelect
                  label="SHAPE Partner Institution"
                  options={[{ label: "None", value: "" }, ...partnerOptions]}
                  value={form.partnerInstitutionId}
                  onChange={(val) => setForm(f => ({ ...f, partnerInstitutionId: val }))}
                  placeholder="Link to consortium partner (optional)"
                  className="w-full"
                />
                <p className="text-[10px] text-slate-400">
                  Required for Partner Institution users — scopes CMS edits to that organisation only.
                </p>
              </div>

              {/* Permission Overrides */}
              {modal === "edit" && allPerms.length > 0 && (
                <div className="space-y-3 border border-amber-100 p-5 bg-amber-50/30">
                  <div className="flex items-center gap-2 mb-1">
                    <IShield />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Permission Overrides</p>
                    <span className="ml-auto text-[10px] text-slate-400 italic">Per-user overrides — supersede role defaults</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
                    {allPerms.map((perm: any) => {
                      const isAllowed = form.allowedPermissionIds.includes(perm.id);
                      const isDenied  = form.deniedPermissionIds.includes(perm.id);
                      const roleHas   = roles.find((r: any) => r.id === form.roleId)?.permissions?.some((p: any) => p.id === perm.id);
                      return (
                        <div key={perm.id} className="flex items-center justify-between bg-white border border-slate-100 px-3 py-2 rounded">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{perm.name}</p>
                            <p className="text-[10px] text-slate-400">{perm.slug || perm.description}</p>
                          </div>
                          <div className="flex gap-1 text-[9px] font-black uppercase tracking-wide shrink-0">
                            <button type="button" onClick={() => togglePerm(perm.id, "allow")}
                              className={`px-2 py-1 rounded transition-colors ${isAllowed ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-700"}`}>Allow</button>
                            <button type="button" onClick={() => togglePerm(perm.id, "inherit")}
                              className={`px-2 py-1 rounded transition-colors ${!isAllowed && !isDenied ? "bg-slate-300 text-slate-800" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>{roleHas ? "Role ✓" : "Inherit"}</button>
                            <button type="button" onClick={() => togglePerm(perm.id, "deny")}
                              className={`px-2 py-1 rounded transition-colors ${isDenied ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700"}`}>Deny</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {modal === "add" && (
                <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  A temporary one-time password is generated automatically and emailed to the user. If email delivery fails, credentials are shown to you immediately after creation.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary-darker text-white p-4 font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : modal === "edit" ? "Save Changes" : "Create User & Send OTP"}
                </button>
                <button type="button" onClick={() => setModal(null)}
                  className="px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {provisioning && (
        <ProvisioningCredentialsModal provisioning={provisioning} onClose={() => setProvisioning(null)} />
      )}
    </div>
  );
}
