"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Inbox, PlusCircle, Send, RefreshCw, Loader2, Clock, ArrowUpRight,
  CheckCircle2, AlertTriangle, Tag, ThumbsDown, ThumbsUp, Building2, Laptop,
} from "lucide-react";
import { getApi, getApiErrorMessage, postApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ICT_STATUS_COLORS } from "@/app/admin/ict/ict-ui";
import PersonalAnalyticsPanel from "@/components/admin/ict/PersonalAnalyticsPanel";
import { OVERDUE_LABEL } from "@/lib/service-desk-copy";
import { ICT_SUPPORT_CATEGORY_SLUG } from "@/lib/technical-support-categories";
import { isHelpdeskCategory } from "@/lib/helpdesk-category-slugs";
import {
  sanitizeCatalogueSelection,
  useTechnicalSupportCategories,
} from "@/lib/use-technical-support-categories";
import { usePermission } from "@/hooks/useAdminPermissions";

type Tab = "assigned" | "raise" | "submitted";
type Lane = "helpdesk" | "it";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const EMPTY_FORM = {
  feedback_type: "complaint" as "complaint" | "compliment",
  requester_type: "Staff",
  category_id: "",
  category_name: "",
  subcategory: "",
  description: "",
  priority: "Medium",
  location: "",
  incident_date: "",
};

const isBreached = (t: any) =>
  t.sla_due_date && new Date(t.sla_due_date) < new Date() && !["Resolved", "Closed", "Cancelled"].includes(t.status);

const ticketInLane = (t: any, lane?: Lane) => {
  if (!lane) return true;
  const g = t.service_group;
  if (lane === "helpdesk") return g === "helpdesk";
  return g === "it" || g === "it_technical_support";
};

export default function MyTicketsPanel({
  serviceGroup,
  embedded = false,
}: {
  serviceGroup?: Lane;
  embedded?: boolean;
} = {}) {
  const { can: canIctView } = usePermission("ict.view");
  const { can: canHelpdeskView } = usePermission("helpdesk.view");
  const { can: canCampusView } = usePermission("campus_feedback.view");
  const canRaiseHelpdesk = canHelpdeskView || canCampusView;
  const canRaiseIct = canIctView;
  const canRaiseBoth = canRaiseHelpdesk && canRaiseIct;

  const [raiseLane, setRaiseLane] = useState<Lane>(serviceGroup || "helpdesk");
  // While permissions hydrate, stay on the page lane so Helpdesk never flashes ICT.
  const effectiveRaiseLane: Lane = canRaiseBoth
    ? raiseLane
    : canRaiseHelpdesk && !canRaiseIct
      ? "helpdesk"
      : !canRaiseHelpdesk && canRaiseIct
        ? "it"
        : (serviceGroup || raiseLane || "helpdesk");
  const isHelpdesk = effectiveRaiseLane === "helpdesk";

  const [tab, setTab] = useState<Tab>("assigned");

  const [assigned, setAssigned] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState<any[]>([]);
  const [helpdeskCategories, setHelpdeskCategories] = useState<
    { id: string; name: string; slug?: string; is_infrastructure?: boolean; subcategories?: string[] }[]
  >([]);
  const [ictSupportCategoryId, setIctSupportCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const laneQ = serviceGroup ? `?service_group=${serviceGroup}` : "";
      const [a, s, c] = await Promise.all([
        getApi(`/ict/admin/tickets/assigned/mine${laneQ}`),
        getApi("/ict/tickets/mine"),
        getApi("/ict/categories"),
      ]);
      if (a == null) {
        toast.error("Could not load assigned tickets");
        setAssigned([]);
      } else {
        setAssigned(Array.isArray(a) ? a : []);
      }
      const allSubmitted = Array.isArray(s) ? s : [];
      // Dual-role officers may raise either lane from this page — show both in My Submitted.
      setSubmitted(
        allSubmitted.filter((t) =>
          canRaiseBoth
            ? ticketInLane(t, "helpdesk") || ticketInLane(t, "it")
            : ticketInLane(t, serviceGroup),
        ),
      );
      const allCats = Array.isArray(c) ? c : [];
      setHelpdeskCategories(allCats.filter(isHelpdeskCategory));
      const ictSupport = allCats.find((cat) => cat.slug === ICT_SUPPORT_CATEGORY_SLUG);
      setIctSupportCategoryId(ictSupport?.id || "");
    } catch {
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setForm(EMPTY_FORM);
    setRaiseLane(serviceGroup || "helpdesk");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceGroup, canRaiseBoth]);

  useEffect(() => {
    // Reset classification fields when dual-role users switch raise lane.
    setForm(EMPTY_FORM);
  }, [effectiveRaiseLane]);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isHelpdesk) {
      const selected = helpdeskCategories.find((c) => c.id === form.category_id);
      const subs = selected?.subcategories || [];
      if (!form.category_id) {
        toast.error("Category is required");
        return;
      }
      if (subs.length > 0 && !form.subcategory.trim()) {
        toast.error("Subcategory is required");
        return;
      }
      if (!form.description.trim()) {
        toast.error("Description is required");
        return;
      }
      const categoryName = selected?.name || "Campus feedback";
      const subcategory = form.subcategory.trim() || "General inquiry";
      setSubmitting(true);
      try {
        const created = await postApi("/ict/tickets", {
          subject: `${categoryName} — ${subcategory}`,
          description: form.description.trim(),
          category_id: form.category_id,
          subcategory,
          priority: form.priority,
          feedback_type: form.feedback_type,
          location: form.location.trim() || undefined,
          incident_date: form.incident_date || undefined,
          service_group: "helpdesk",
          submission_source: "admin",
          client_platform: "admin",
        });
        toast.success(`Case ${created?.reference_number || ""} submitted`);
        setForm(EMPTY_FORM);
        await load();
        setTab("submitted");
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, "Failed to submit feedback"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ICT Technical Support — OUK APP catalogues by requester type.
    const categoryName = form.category_name.trim();
    const subcategory = form.subcategory.trim();
    if (!categoryName) {
      toast.error("Category is required");
      return;
    }
    if (!subcategory) {
      toast.error("Subcategory is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        subject: `${categoryName} — ${subcategory}`,
        description: form.description.trim(),
        subcategory,
        priority: form.priority,
        feedback_type: "service_request",
        requester_type: form.requester_type,
        location: form.location.trim() || undefined,
        // Always the selected raise lane (not the page's locked lane).
        service_group: effectiveRaiseLane,
        submission_source: "admin",
        client_platform: "admin",
      };
      if (ictSupportCategoryId) payload.category_id = ictSupportCategoryId;
      const created = await postApi("/ict/tickets", payload);
      toast.success(`Ticket ${created?.reference_number || ""} raised`);
      setForm(EMPTY_FORM);
      await load();
      setTab("submitted");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to raise ticket"));
    } finally {
      setSubmitting(false);
    }
  };

  const openAssigned = useMemo(
    () => assigned.filter((t) => !["Resolved", "Closed", "Cancelled"].includes(t.status)).length,
    [assigned]
  );

  const raiseLabel = canRaiseBoth
    ? "Raise Case"
    : serviceGroup === "helpdesk"
      ? "Raise Feedback"
      : "Raise a Ticket";

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "assigned", label: "Assigned to Me", icon: <Inbox size={14} />, count: openAssigned },
    { id: "raise", label: raiseLabel, icon: <PlusCircle size={14} /> },
    { id: "submitted", label: "My Submitted", icon: <Send size={14} />, count: submitted.length },
  ];

  return (
    <div className={embedded ? "space-y-5" : "space-y-5 pb-20"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">
          {embedded
            ? "Assigned to you in this lane — raise requests and track what you submitted."
            : "Tickets assigned to you across Helpdesk and ICT — raise requests and track submissions."}
        </p>
        <button
          type="button"
          onClick={load}
          aria-label="Refresh tickets"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-primary"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <PersonalAnalyticsPanel
        title="Performance"
        scope="personal"
        range="this-year"
        serviceGroup={serviceGroup}
      />

      {/* Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
              tab === t.id
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {t.icon} {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 size={28} className="animate-spin mb-3 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest">Loading your workspace…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "assigned" && <AssignedList tickets={assigned} />}
            {tab === "submitted" && (
              <SubmittedList
                tickets={submitted}
                onRaise={() => setTab("raise")}
                raiseLabel={raiseLabel}
              />
            )}
            {tab === "raise" && (
              <RaiseForm
                lane={effectiveRaiseLane}
                canChooseLane={canRaiseBoth}
                selectedLane={raiseLane}
                onLaneChange={setRaiseLane}
                form={form}
                setForm={setForm}
                helpdeskCategories={helpdeskCategories}
                submitting={submitting}
                onSubmit={submitTicket}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${ICT_STATUS_COLORS[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function AssignedList({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={26} />}
        title="Nothing assigned to you"
        hint="Tickets transferred or assigned to you in this desk will appear here."
      />
    );
  }
  return (
    <div className="grid gap-3">
      {tickets.map((t) => (
        <Link
          key={t.id}
          href={`/admin/ict/tickets/${t.id}`}
          className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-primary transition-all flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-black font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t.reference_number}</span>
              <StatusBadge status={t.status} />
              {isBreached(t) && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center gap-1">
                  <AlertTriangle size={9} /> {OVERDUE_LABEL}
                </span>
              )}
            </div>
            <p className="font-black text-primary-darker truncate">{t.subject}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
              {t.category?.name && (<span className="flex items-center gap-1"><Tag size={11} />{t.category.name}</span>)}
              <span className="flex items-center gap-1"><Clock size={11} />{new Date(t.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}

function SubmittedList({
  tickets,
  onRaise,
  raiseLabel,
}: {
  tickets: any[];
  onRaise: () => void;
  raiseLabel: string;
}) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Send size={26} />}
        title="You haven't submitted any cases yet"
        hint="Submit a request and track its progress here."
        action={(
          <button
            type="button"
            onClick={onRaise}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary-darker"
          >
            {raiseLabel}
          </button>
        )}
      />
    );
  }
  return (
    <div className="grid gap-3">
      {tickets.map((t) => (
        <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[9px] font-black font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t.reference_number}</span>
              <StatusBadge status={t.status} />
            </div>
            <p className="font-black text-primary-darker truncate">{t.subject}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
              {t.assigned_to?.full_name && <span>Handler: {t.assigned_to.full_name}</span>}
              <span className="flex items-center gap-1"><Clock size={11} />{new Date(t.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          {["Resolved", "Closed"].includes(t.status) && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

function RaiseForm({
  lane,
  canChooseLane,
  selectedLane,
  onLaneChange,
  form,
  setForm,
  helpdeskCategories,
  submitting,
  onSubmit,
}: {
  lane: Lane;
  canChooseLane?: boolean;
  selectedLane?: Lane;
  onLaneChange?: (lane: Lane) => void;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  helpdeskCategories: { id: string; name: string; subcategories?: string[] }[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isHelpdesk = lane === "helpdesk";
  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const inputCls =
    "w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-medium text-primary-darker placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20";
  const labelCls = "mb-2 block text-[9px] font-black uppercase tracking-widest text-slate-400";

  const selectedHelpdesk = helpdeskCategories.find((c) => c.id === form.category_id);
  const helpdeskSubs = selectedHelpdesk?.subcategories || [];

  const { groups: roleGroups, loading: catalogueLoading } =
    useTechnicalSupportCategories(form.requester_type);
  const isFreeTextIssues = form.requester_type === "Other";
  const selectedRoleGroup = roleGroups?.find((g) => g.name === form.category_name);
  const ictSubs = selectedRoleGroup?.subcategories || [];

  useEffect(() => {
    if (isHelpdesk || isFreeTextIssues || !roleGroups) return;
    const next = sanitizeCatalogueSelection(
      roleGroups,
      form.category_name,
      form.subcategory,
    );
    if (
      next.category_name !== form.category_name ||
      next.subcategory !== form.subcategory
    ) {
      setForm((p) => ({ ...p, ...next }));
    }
  }, [
    isHelpdesk,
    isFreeTextIssues,
    roleGroups,
    form.category_name,
    form.subcategory,
    setForm,
  ]);

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h3 className="text-base font-semibold text-primary-darker">
          {isHelpdesk ? "Submit campus feedback" : "Raise an ICT support request"}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {isHelpdesk
            ? "Log a complaint or compliment about campus facilities and services."
            : "Report a system or technical issue. Categories match the OUK APP catalogues."}
        </p>
      </div>

      {canChooseLane && selectedLane && onLaneChange && (
        <div>
          <p className={labelCls}>Ticket type *</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onLaneChange("helpdesk")}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selectedLane === "helpdesk"
                  ? "border-primary bg-primary/5 text-primary-darker"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Building2 size={18} className="mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold">General Helpdesk</span>
                <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                  Campus feedback — complaint or compliment
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onLaneChange("it")}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selectedLane === "it"
                  ? "border-primary bg-primary/5 text-primary-darker"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              <Laptop size={18} className="mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold">ICT Technical Support</span>
                <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                  Systems, accounts, portals, and devices
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {isHelpdesk ? (
        <>
          <div>
            <p className={labelCls}>Feedback type *</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set("feedback_type", "complaint")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  form.feedback_type === "complaint"
                    ? "border-red-300 bg-red-50 text-red-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <ThumbsDown size={16} /> Complaint
              </button>
              <button
                type="button"
                onClick={() => set("feedback_type", "compliment")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  form.feedback_type === "compliment"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <ThumbsUp size={16} /> Compliment
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Category *</label>
            <select
              className={inputCls}
              value={form.category_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, category_id: e.target.value, subcategory: "" }))
              }
              required
            >
              <option value="">Select campus category</option>
              {helpdeskCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>
              {helpdeskSubs.length > 0 ? "Subcategory (issue type) *" : "Subcategory (issue type)"}
            </label>
            {helpdeskSubs.length > 0 ? (
              <select
                className={inputCls}
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
                disabled={!form.category_id}
                required
              >
                <option value="">
                  {form.category_id ? "Select issue type" : "Select a category first"}
                </option>
                {helpdeskSubs.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input
                className={inputCls}
                value={form.subcategory}
                onChange={(e) => set("subcategory", e.target.value)}
                disabled={!form.category_id}
                placeholder={form.category_id ? "Optional issue type" : "Select a category first"}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={labelCls}>I am raising as *</label>
            <select
              className={inputCls}
              value={form.requester_type}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  requester_type: e.target.value,
                  category_name: "",
                  subcategory: "",
                }))
              }
            >
              {["Staff", "Student", "Faculty", "Other"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {isFreeTextIssues ? (
            <>
              <div>
                <label className={labelCls}>Category *</label>
                <input
                  className={inputCls}
                  value={form.category_name}
                  onChange={(e) => set("category_name", e.target.value)}
                  placeholder="e.g. External partner system, Vendor issue"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Subcategory (issue type) *</label>
                <input
                  className={inputCls}
                  value={form.subcategory}
                  onChange={(e) => set("subcategory", e.target.value)}
                  placeholder="Describe the specific issue type"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>
                  Category *{catalogueLoading ? " · refreshing…" : ""}
                </label>
                <select
                  className={inputCls}
                  value={form.category_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category_name: e.target.value, subcategory: "" }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {(roleGroups || []).map((g) => (
                    <option key={g.name} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subcategory (issue type) *</label>
                <select
                  className={inputCls}
                  value={form.subcategory}
                  onChange={(e) => set("subcategory", e.target.value)}
                  disabled={!form.category_name}
                  required
                >
                  <option value="">
                    {form.category_name ? "Select issue type" : "Select a category first"}
                  </option>
                  {ictSubs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </>
      )}

      <div>
        <label className={labelCls}>Priority</label>
        <select
          className={inputCls}
          value={form.priority}
          onChange={(e) => set("priority", e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Description *</label>
        <textarea
          className={inputCls}
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={
            isHelpdesk
              ? form.feedback_type === "compliment"
                ? "What went well? Who or which service should be recognised?"
                : "Describe what happened, where, and the impact."
              : "Describe the issue, including any error messages and what you were doing."
          }
          required
        />
      </div>

      {isHelpdesk ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Location</label>
            <input
              className={inputCls}
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Main campus, Library, Gate A"
            />
          </div>
          <div>
            <label className={labelCls}>Incident date (optional)</label>
            <input
              type="date"
              className={inputCls}
              value={form.incident_date}
              onChange={(e) => set("incident_date", e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          <label className={labelCls}>System / platform (optional)</label>
          <input
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. SOMAS, Email, Portal, Moodle"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-primary-darker disabled:opacity-40"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isHelpdesk ? "Submit Feedback" : "Submit Ticket"}
      </button>
    </form>
  );
}

function EmptyState({ icon, title, hint, action }: { icon: React.ReactNode; title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 flex flex-col items-center text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4">{icon}</div>
      <h5 className="text-lg font-black text-primary-darker">{title}</h5>
      <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">{hint}</p>
      {action}
    </div>
  );
}
