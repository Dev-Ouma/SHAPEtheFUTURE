"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2, Laptop, Loader2, Plus, ThumbsDown, ThumbsUp, X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getApi, getApiErrorMessage, postApi } from "@/lib/api";
import { ICT_SUPPORT_CATEGORY_SLUG } from "@/lib/technical-support-categories";
import { isHelpdeskCategory } from "@/lib/helpdesk-category-slugs";
import {
  sanitizeCatalogueSelection,
  useTechnicalSupportCategories,
} from "@/lib/use-technical-support-categories";

type LockedLane = "helpdesk" | "it";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium text-primary-darker placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

function LanePicker({
  value,
  onChange,
}: {
  value: LockedLane;
  onChange: (lane: LockedLane) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Ticket type *
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange("helpdesk")}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            value === "helpdesk"
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
          onClick={() => onChange("it")}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            value === "it"
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
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5">
          <div>
            <h3 className="text-lg font-semibold text-primary-darker">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 p-5">{children}</div>
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-5">
          {footer}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RequesterFields({
  form,
  update,
  onRequesterTypeChange,
  idFieldMeta,
  showPhone,
}: {
  form: {
    requester_type: string;
    requester_name: string;
    requester_email: string;
    identification_number: string;
    requester_phone?: string;
  };
  update: (k: string, v: string) => void;
  onRequesterTypeChange: (v: string) => void;
  idFieldMeta: { label: string; placeholder: string } | null;
  showPhone?: boolean;
}) {
  return (
    <section className="space-y-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Requester
      </p>
      <Field label="Requester type">
        <select
          value={form.requester_type}
          onChange={(e) => onRequesterTypeChange(e.target.value)}
          className={inputCls}
        >
          {["Staff", "Student", "Faculty", "Other"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Requester name">
          <input
            value={form.requester_name}
            onChange={(e) => update("requester_name", e.target.value)}
            className={inputCls}
            placeholder="Full name"
            autoComplete="name"
          />
        </Field>
        <Field label="Requester email">
          <input
            type="email"
            value={form.requester_email}
            onChange={(e) => update("requester_email", e.target.value)}
            className={inputCls}
            placeholder="name@ouk.ac.ke"
            autoComplete="email"
          />
        </Field>
      </div>
      {idFieldMeta && (
        <Field label={idFieldMeta.label}>
          <input
            value={form.identification_number}
            onChange={(e) => update("identification_number", e.target.value)}
            className={inputCls}
            placeholder={idFieldMeta.placeholder}
          />
        </Field>
      )}
      {showPhone && (
        <Field label="Phone (optional)">
          <input
            value={form.requester_phone || ""}
            onChange={(e) => update("requester_phone", e.target.value)}
            className={inputCls}
            placeholder="e.g. 07XX XXX XXX"
            autoComplete="tel"
          />
        </Field>
      )}
    </section>
  );
}

function idMetaForType(requesterType: string) {
  if (requesterType === "Student") {
    return { label: "Registration number", placeholder: "e.g. OUK/…/…" };
  }
  if (requesterType === "Staff" || requesterType === "Faculty") {
    return { label: "Staff ID", placeholder: "Staff / payroll ID" };
  }
  return null;
}

/** General Helpdesk — campus feedback (complaint / compliment). */
function HelpdeskLogTicketModal({
  onClose,
  onCreated,
  lanePicker,
}: {
  onClose: () => void;
  onCreated: () => void;
  lanePicker?: React.ReactNode;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    feedback_type: "complaint" as "complaint" | "compliment",
    requester_type: "Student",
    requester_name: "",
    requester_email: "",
    identification_number: "",
    requester_phone: "",
    category_id: "",
    subcategory: "",
    description: "",
    priority: "Medium",
    location: "",
    incident_date: "",
  });

  useEffect(() => {
    getApi("/ict/categories").then((d) => {
      const all = Array.isArray(d) ? d : [];
      setCategories(all.filter(isHelpdeskCategory));
    });
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.category_id) || null,
    [categories, form.category_id],
  );
  const subcategories: string[] = Array.isArray(selectedCategory?.subcategories)
    ? selectedCategory.subcategories
    : [];

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onRequesterTypeChange = (requesterType: string) => {
    setForm((f) => ({
      ...f,
      requester_type: requesterType,
      identification_number:
        requesterType === "Other" ? "" : f.identification_number,
    }));
  };

  const submit = async () => {
    if (!form.feedback_type) {
      toast.error("Select complaint or compliment");
      return;
    }
    if (!form.category_id) {
      toast.error("Category is required");
      return;
    }
    const needsSub = subcategories.length > 0;
    if (needsSub && !form.subcategory.trim()) {
      toast.error("Subcategory is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const categoryName = selectedCategory?.name || "Campus feedback";
    const subcategory = form.subcategory.trim() || "General inquiry";

    setSubmitting(true);
    try {
      await postApi("/ict/admin/tickets", {
        subject: `${categoryName} — ${subcategory}`,
        description: form.description.trim(),
        category_id: form.category_id,
        subcategory,
        priority: form.priority,
        feedback_type: form.feedback_type,
        requester_type: form.requester_type,
        requester_name: form.requester_name.trim() || undefined,
        requester_email: form.requester_email.trim() || undefined,
        requester_phone: form.requester_phone.trim() || undefined,
        identification_number: form.identification_number.trim() || undefined,
        location: form.location.trim() || undefined,
        incident_date: form.incident_date || undefined,
        service_group: "helpdesk",
        submission_source: "admin",
        client_platform: "admin",
      });
      toast.success("Campus feedback logged");
      onCreated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to log feedback"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Log campus feedback"
      subtitle="Create a General Helpdesk case on behalf of a requester (campus facilities & services)."
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create case
          </button>
        </>
      )}
    >
      {lanePicker}

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Feedback type *
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update("feedback_type", "complaint")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
              form.feedback_type === "complaint"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            <ThumbsDown size={16} />
            Complaint
          </button>
          <button
            type="button"
            onClick={() => update("feedback_type", "compliment")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
              form.feedback_type === "compliment"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            <ThumbsUp size={16} />
            Compliment
          </button>
        </div>
      </div>

      <RequesterFields
        form={form}
        update={update}
        onRequesterTypeChange={onRequesterTypeChange}
        idFieldMeta={idMetaForType(form.requester_type)}
        showPhone
      />

      <section className="space-y-4 border-t border-slate-100 pt-5">
        <Field label="Category *">
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory: "" }))}
            className={inputCls}
            required
          >
            <option value="">Select campus category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field
          label={subcategories.length > 0 ? "Subcategory (issue type) *" : "Subcategory (issue type)"}
          hint={subcategories.length === 0 ? "Optional for General Inquiry — describe the matter in the description." : undefined}
        >
          {subcategories.length > 0 ? (
            <select
              value={form.subcategory}
              onChange={(e) => update("subcategory", e.target.value)}
              className={inputCls}
              disabled={!form.category_id}
              required
            >
              <option value="">
                {form.category_id ? "Select issue type" : "Select a category first"}
              </option>
              {subcategories.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input
              value={form.subcategory}
              onChange={(e) => update("subcategory", e.target.value)}
              className={inputCls}
              disabled={!form.category_id}
              placeholder={form.category_id ? "Optional issue type" : "Select a category first"}
            />
          )}
        </Field>
        <Field label="Priority">
          <select
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
            className={inputCls}
          >
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Description *">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className={inputCls}
            placeholder={
              form.feedback_type === "compliment"
                ? "What went well? Who or which service should be recognised?"
                : "Describe what happened, where, and the impact on the requester."
            }
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Location" hint="Where on campus the issue was observed.">
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputCls}
              placeholder="e.g. Main campus, Library, Gate A"
            />
          </Field>
          <Field label="Incident date (optional)">
            <input
              type="date"
              value={form.incident_date}
              onChange={(e) => update("incident_date", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </section>
    </ModalShell>
  );
}

/** ICT Technical Support — OUK APP role catalogues. */
function IctLogTicketModal({
  onClose,
  onCreated,
  lockedLane,
  lanePicker,
}: {
  onClose: () => void;
  onCreated: () => void;
  lockedLane?: LockedLane;
  lanePicker?: React.ReactNode;
}) {
  const [ictSupportCategoryId, setIctSupportCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    requester_type: "Staff",
    requester_name: "",
    requester_email: "",
    identification_number: "",
    category_name: "",
    subcategory: "",
    description: "",
    priority: "Medium",
    location: "",
  });

  useEffect(() => {
    getApi("/ict/categories").then((d) => {
      const all = Array.isArray(d) ? d : [];
      const ictSupport = all.find((c) => c.slug === ICT_SUPPORT_CATEGORY_SLUG);
      setIctSupportCategoryId(ictSupport?.id || "");
    });
  }, []);

  const { groups: roleGroups, loading: catalogueLoading } =
    useTechnicalSupportCategories(form.requester_type);
  const isFreeTextIssues = form.requester_type === "Other";
  const selectedRoleGroup = useMemo(
    () => roleGroups?.find((g) => g.name === form.category_name) || null,
    [roleGroups, form.category_name],
  );
  const subcategories = selectedRoleGroup?.subcategories || [];

  useEffect(() => {
    if (isFreeTextIssues || !roleGroups) return;
    const next = sanitizeCatalogueSelection(
      roleGroups,
      form.category_name,
      form.subcategory,
    );
    if (
      next.category_name !== form.category_name ||
      next.subcategory !== form.subcategory
    ) {
      setForm((f) => ({ ...f, ...next }));
    }
  }, [roleGroups, isFreeTextIssues, form.category_name, form.subcategory]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onRequesterTypeChange = (requesterType: string) => {
    setForm((f) => ({
      ...f,
      requester_type: requesterType,
      identification_number:
        requesterType === "Other" ? "" : f.identification_number,
      category_name: "",
      subcategory: "",
    }));
  };

  const submit = async () => {
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
        requester_name: form.requester_name.trim() || undefined,
        requester_email: form.requester_email.trim() || undefined,
        identification_number: form.identification_number.trim() || undefined,
        location: form.location.trim() || undefined,
        service_group: "it",
        submission_source: "admin",
        client_platform: "admin",
      };
      if (ictSupportCategoryId) payload.category_id = ictSupportCategoryId;
      await postApi("/ict/admin/tickets", payload);
      toast.success("Ticket logged");
      onCreated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to log ticket"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Log ticket"
      subtitle="Create an ICT Technical Support case on behalf of a requester."
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create ticket
          </button>
        </>
      )}
    >
      {lanePicker}

      <RequesterFields
        form={form}
        update={update}
        onRequesterTypeChange={onRequesterTypeChange}
        idFieldMeta={idMetaForType(form.requester_type)}
      />

      <section className="space-y-4 border-t border-slate-100 pt-5">
        {isFreeTextIssues ? (
          <>
            <Field label="Category *">
              <input
                value={form.category_name}
                onChange={(e) => update("category_name", e.target.value)}
                className={inputCls}
                placeholder="e.g. External partner system, Vendor issue"
                required
              />
            </Field>
            <Field label="Subcategory (issue type) *">
              <input
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                className={inputCls}
                placeholder="Describe the specific issue type"
                required
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label="Category *"
              hint={catalogueLoading ? "Refreshing catalogue…" : undefined}
            >
              <select
                value={form.category_name}
                onChange={(e) => setForm((f) => ({ ...f, category_name: e.target.value, subcategory: "" }))}
                className={inputCls}
                required
              >
                <option value="">Select category</option>
                {(roleGroups || []).map((g) => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory (issue type) *">
              <select
                value={form.subcategory}
                onChange={(e) => update("subcategory", e.target.value)}
                className={inputCls}
                disabled={!form.category_name}
                required
              >
                <option value="">
                  {form.category_name ? "Select issue type" : "Select a category first"}
                </option>
                {subcategories.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </>
        )}
        <Field label="Priority">
          <select
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
            className={inputCls}
          >
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Description *">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className={inputCls}
            placeholder="Describe the issue, steps to reproduce, and impact"
            required
          />
        </Field>
        <Field label="System / platform" hint="ICT system or service affected.">
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            className={inputCls}
            placeholder="e.g. SOMAS, Email, Portal, Moodle"
          />
        </Field>
      </section>
    </ModalShell>
  );
}

export default function LogTicketModal({
  onClose,
  onCreated,
  lockedLane,
  canLogHelpdesk = false,
  canLogIct = false,
}: {
  onClose: () => void;
  onCreated: () => void;
  lockedLane?: LockedLane;
  canLogHelpdesk?: boolean;
  canLogIct?: boolean;
}) {
  const canBoth = canLogHelpdesk && canLogIct;
  const initialLane: LockedLane =
    lockedLane ||
    (canLogHelpdesk ? "helpdesk" : canLogIct ? "it" : "helpdesk");
  const [selectedLane, setSelectedLane] = useState<LockedLane>(initialLane);

  useEffect(() => {
    // Single-lane officers stay pinned; dual-role choice is owned by selectedLane.
    if (canBoth) return;
    if (canLogHelpdesk) setSelectedLane("helpdesk");
    else if (canLogIct) setSelectedLane("it");
  }, [canBoth, canLogHelpdesk, canLogIct]);

  const lane: LockedLane = canBoth
    ? selectedLane
    : canLogHelpdesk
      ? "helpdesk"
      : canLogIct
        ? "it"
        : initialLane;

  const lanePicker = canBoth ? (
    <LanePicker value={selectedLane} onChange={setSelectedLane} />
  ) : null;

  // Keep one modal shell; only remount the lane-specific form body.
  if (lane === "helpdesk") {
    return (
      <HelpdeskLogTicketModal
        key="helpdesk-form"
        onClose={onClose}
        onCreated={onCreated}
        lanePicker={lanePicker}
      />
    );
  }

  return (
    <IctLogTicketModal
      key="it-form"
      onClose={onClose}
      onCreated={onCreated}
      lockedLane="it"
      lanePicker={lanePicker}
    />
  );
}
