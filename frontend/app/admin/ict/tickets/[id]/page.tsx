"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, User, Calendar, Clock, Tag, MapPin, Send, Lock,
  ShieldAlert, CheckCircle2, MessageSquare, UserCheck, Loader2, Cpu, Mail,
  Sparkles, BookOpen, CircleDot, Paperclip, ExternalLink, FileText, Image as ImageIcon,
} from "lucide-react";
import { getApi, putApi, postApi, resolveImageUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  ICT_STATUS_COLORS,
  FEEDBACK_TYPE_META,
  SERVICE_GROUP_META,
  SUBMISSION_SOURCE_META,
  requesterDisplayLabel,
} from "../../ict-ui";
import { OVERDUE_TICKET_TITLE, OVERDUE_TICKET_MESSAGE } from "@/lib/service-desk-copy";

const WORKFLOW: { status: string; label: string; terminal?: boolean }[] = [
  { status: "Open", label: "Open" },
  { status: "Acknowledged", label: "Acknowledged" },
  { status: "In Progress", label: "In Progress" },
  { status: "On Hold", label: "On Hold" },
  { status: "Resolved", label: "Resolved", terminal: true },
  { status: "Closed", label: "Closed", terminal: true },
  { status: "Cancelled", label: "Cancelled", terminal: true },
];

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-700",
};

function slaRemaining(due?: string | null, closed?: boolean) {
  if (!due || closed) return null;
  const ms = new Date(due).getTime() - Date.now();
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const label =
    days > 0 ? `${days}d ${hours % 24}h` : hours > 0 ? `${hours}h` : `${Math.max(1, Math.floor(abs / 60000))}m`;
  return { overdue: ms < 0, label };
}

export default function IctTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [assignable, setAssignable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolution, setResolution] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const assignableByRole = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const user of assignable) {
      const roleName = (user.role?.name || "").trim()
        || (user.role_legacy
          ? user.role_legacy.charAt(0).toUpperCase() + user.role_legacy.slice(1).replace(/_/g, " ")
          : "Other Staff");
      const isStaff = roleName.toLowerCase() === "staff";
      const dept =
        user.staff_member?.department?.name?.trim() ||
        user.department?.trim() ||
        "No department";
      const groupKey = isStaff ? `Staff — ${dept}` : roleName;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(user);
    }
    return Array.from(groups.entries()).sort((a, b) => {
      const aStaff = a[0].startsWith("Staff —");
      const bStaff = b[0].startsWith("Staff —");
      if (aStaff !== bStaff) return aStaff ? 1 : -1;
      return a[0].localeCompare(b[0]);
    });
  }, [assignable]);

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [t, users, kb] = await Promise.all([
        getApi(`/ict/admin/tickets/${id}`),
        getApi("/ict/admin/personnel/assignable"),
        getApi(`/ict/admin/tickets/${id}/suggested-articles`),
      ]);
      setTicket(t);
      setResolution(t?.resolution || "");
      setAssignable(Array.isArray(users) ? users : []);
      setArticles(Array.isArray(kb) ? kb : []);
    } catch {
      toast.error("Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const aiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await getApi(`/ict/admin/tickets/${id}/suggest-response`);
      if (res?.suggestion) {
        setReply(res.suggestion);
        toast.success("AI draft inserted");
      } else {
        toast.error("No suggestion available");
      }
    } catch {
      toast.error("AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  const applyStatus = async (status: string) => {
    const needsResolution = ["Resolved", "Closed"].includes(status);
    if (needsResolution && !resolution.trim()) {
      toast.error("Add resolution notes before resolving or closing");
      setConfirmStatus(null);
      return;
    }
    setSavingStatus(true);
    try {
      await putApi(`/ict/admin/tickets/${id}/status`, {
        status,
        resolution: resolution.trim() || undefined,
      });
      toast.success(`Status updated to ${status}`);
      window.dispatchEvent(new Event("ict:assigned-count-changed"));
      setConfirmStatus(null);
      load();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const requestStatusChange = (status: string) => {
    if (status === ticket?.status) return;
    if (["Resolved", "Closed", "Cancelled"].includes(status)) {
      setConfirmStatus(status);
      return;
    }
    applyStatus(status);
  };

  const assign = async (assignee_id: string) => {
    if (!assignee_id) return;
    try {
      await putApi(`/ict/admin/tickets/${id}/assign`, { assignee_id });
      toast.success("Ticket assigned");
      window.dispatchEvent(new Event("ict:assigned-count-changed"));
      load();
    } catch {
      toast.error("Failed to assign");
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await postApi(`/ict/admin/tickets/${id}/responses`, {
        message: reply,
        is_internal: isInternal,
      });
      setReply("");
      setIsInternal(false);
      toast.success(isInternal ? "Internal note added" : "Reply sent");
      load();
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-32 text-slate-400">
        <RefreshCw className="animate-spin" size={28} />
        <span className="text-xs font-medium">Loading ticket…</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm font-semibold text-slate-500">Ticket not found</p>
        <Link href="/admin/helpdesk" className="mt-4 inline-block text-sm font-semibold text-primary">
          ← Back to queue
        </Link>
      </div>
    );
  }

  const closed = ["Resolved", "Closed", "Cancelled"].includes(ticket.status);
  const breached =
    ticket.sla_due_date &&
    new Date(ticket.sla_due_date) < new Date() &&
    !closed;
  const sla = slaRemaining(ticket.sla_due_date, closed);
  const queueHref =
    ticket.service_group === "helpdesk" ? "/admin/helpdesk" : "/admin/ict";
  const laneLabel =
    SERVICE_GROUP_META[ticket.service_group || "it_technical_support"]?.label ||
    "Service Desk";
  const fb = FEEDBACK_TYPE_META[ticket.feedback_type || "service_request"];
  const src = SUBMISSION_SOURCE_META[ticket.submission_source || "unknown"];
  const currentIdx = WORKFLOW.findIndex((s) => s.status === ticket.status);

  return (
    <div className="space-y-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <button
            type="button"
            onClick={() => router.push(queueHref)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> {laneLabel}
          </button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-mono font-semibold text-slate-600">{ticket.reference_number}</span>
            <span aria-hidden>·</span>
            <span>{ticket.status}</span>
            <span aria-hidden>·</span>
            <span>{fb.label}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          aria-label="Refresh ticket"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-primary"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {breached && (
        <div className="flex items-start gap-3 rounded-xl bg-red-900 p-4 text-white shadow-sm">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{OVERDUE_TICKET_TITLE}</p>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-white/80">
              {OVERDUE_TICKET_MESSAGE}
            </p>
          </div>
        </div>
      )}

      {/* Workflow stepper */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Workflow
        </p>
        <div className="flex min-w-[640px] items-center gap-1">
          {WORKFLOW.map((step, idx) => {
            const active = ticket.status === step.status;
            const passed = currentIdx >= 0 && idx < currentIdx && !step.terminal;
            return (
              <React.Fragment key={step.status}>
                {idx > 0 && (
                  <div
                    className={`h-px flex-1 ${passed || active ? "bg-primary/40" : "bg-slate-200"}`}
                  />
                )}
                <button
                  type="button"
                  disabled={savingStatus || active}
                  onClick={() => requestStatusChange(step.status)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-default ${
                    active
                      ? "bg-primary text-white"
                      : passed
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <CircleDot size={12} />
                  {step.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${ICT_STATUS_COLORS[ticket.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
                {ticket.status}
              </span>
              <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${fb.badge}`}>
                {fb.icon} {fb.label}
              </span>
              {ticket.is_escalated && (
                <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                  <ShieldAlert size={11} /> Escalated
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-primary-darker sm:text-2xl">
              {ticket.subject}
            </h1>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {ticket.description}
            </p>
            {Array.isArray(ticket.attachment_urls) && ticket.attachment_urls.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <Paperclip size={12} />
                  Attachments ({ticket.attachment_urls.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ticket.attachment_urls.map((rawUrl: string, i: number) => {
                    const href = rawUrl.startsWith("http")
                      ? rawUrl
                      : rawUrl.startsWith("/uploads")
                        ? rawUrl
                        : resolveImageUrl(rawUrl) || rawUrl;
                    const name = rawUrl.split("/").pop() || `Attachment ${i + 1}`;
                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(name);
                    return (
                      <a
                        key={`${rawUrl}-${i}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-colors hover:border-primary/40 hover:bg-white"
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={href}
                            alt={name}
                            className="h-24 w-28 shrink-0 object-cover bg-slate-200"
                          />
                        ) : (
                          <div className="flex h-24 w-28 shrink-0 items-center justify-center bg-slate-100 text-slate-400">
                            <FileText size={22} />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3">
                          <span className="truncate text-xs font-semibold text-slate-700 group-hover:text-primary">
                            {isImage ? "Screenshot" : "File"} {i + 1}
                          </span>
                          <span className="truncate text-[11px] text-slate-400">{name}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {isImage ? <ImageIcon size={10} /> : <ExternalLink size={10} />}
                            Open
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Tag size={12} className="text-primary" />
                {ticket.category?.name || "Uncategorized"}
                {ticket.subcategory ? ` · ${ticket.subcategory}` : ""}
              </span>
              {ticket.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {ticket.location}
                </span>
              )}
              {ticket.asset_tag && (
                <span className="inline-flex items-center gap-1">
                  <Cpu size={12} /> {ticket.asset_tag}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                Opened {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MessageSquare size={16} className="text-primary" /> Activity
            </h3>
            <div className="space-y-3">
              {(ticket.responses || []).length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  No replies or notes yet. Start the conversation below.
                </p>
              )}
              {(ticket.responses || []).map((r: any) => (
                <div
                  key={r.id}
                  className={`rounded-lg border p-4 ${
                    r.is_internal
                      ? "border-amber-100 bg-amber-50/60"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <User size={12} />
                      {r.responded_by?.full_name || "Agent"}
                      {r.is_internal && (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <Lock size={10} /> Internal
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{r.message}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={
                  isInternal
                    ? "Add an internal note (hidden from requester)…"
                    : "Write a reply to the requester…"
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-primary-darker placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInternal((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${
                      isInternal
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <Lock size={12} /> Internal note
                  </button>
                  <button
                    type="button"
                    onClick={aiSuggest}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI draft
                  </button>
                </div>
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-40"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {isInternal ? "Add note" : "Send reply"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Requester</h3>
            <div className="space-y-2 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {requesterDisplayLabel(ticket.requester_type, ticket.is_anonymous)}
              </p>
              {ticket.is_anonymous ? (
                <p className="font-semibold text-primary-darker">Anonymous — details hidden</p>
              ) : (
                <>
                  <p className="flex items-center gap-2 font-semibold text-primary-darker">
                    <User size={14} className="text-secondary" />
                    {ticket.requester_name || ticket.requester?.full_name || "—"}
                  </p>
                  {(ticket.requester_email || ticket.requester?.email) && (
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={13} />
                      {ticket.requester_email || ticket.requester?.email}
                    </p>
                  )}
                  {ticket.requester_phone && (
                    <p className="text-xs text-slate-500">Phone: {ticket.requester_phone}</p>
                  )}
                  {ticket.identification_number && (
                    <p className="text-xs text-slate-500">
                      {ticket.requester_type === "Student"
                        ? "Registration number"
                        : ticket.requester_type === "Staff" || ticket.requester_type === "Faculty"
                          ? "Staff ID"
                          : "ID"}
                      : {ticket.identification_number}
                    </p>
                  )}
                </>
              )}
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                Consent to contact: {ticket.consent_given ? "Yes" : "No"}
              </div>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${src.badge}`}>
                {src.icon} {src.label}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserCheck size={16} className="text-primary" /> Assignment
            </h3>
            <select
              value={ticket.assigned_to?.id || ""}
              onChange={(e) => assign(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-primary-darker focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— Unassigned —</option>
              {assignableByRole.map(([roleName, users]) => (
                <optgroup key={roleName} label={roleName}>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 size={16} className="text-primary" /> Resolution
            </h3>
            <p className="mb-2 text-xs text-slate-500">
              Required when resolving or closing. Shared with the requester.
            </p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              placeholder="How was this issue resolved?"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-primary-darker placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingStatus || ticket.status === "Resolved"}
                onClick={() => requestStatusChange("Resolved")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                Resolve
              </button>
              <button
                type="button"
                disabled={savingStatus || ticket.status === "Closed"}
                onClick={() => requestStatusChange("Closed")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Close
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock size={16} className="text-primary" /> Due by
            </h3>
            <p className={`text-sm font-semibold ${breached ? "text-red-600" : "text-slate-700"}`}>
              {ticket.sla_due_date
                ? new Date(ticket.sla_due_date).toLocaleString()
                : "No target set"}
            </p>
            {sla && (
              <p className={`mt-1 text-xs font-medium ${sla.overdue ? "text-red-600" : "text-slate-500"}`}>
                {sla.overdue ? `Overdue by ${sla.label}` : `${sla.label} remaining`}
              </p>
            )}
            {ticket.resolved_at && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={12} />
                Resolved {new Date(ticket.resolved_at).toLocaleString()}
              </p>
            )}
          </div>

          {articles.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BookOpen size={16} className="text-primary" /> Suggested articles
              </h3>
              <div className="space-y-2">
                {articles.map((a) => (
                  <a
                    key={a.id}
                    href="/admin/ict/knowledge"
                    className="block rounded-lg border border-transparent bg-slate-50 p-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  >
                    <p className="text-sm font-semibold leading-snug text-slate-700 hover:text-primary">
                      {a.title}
                    </p>
                    {a.summary && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">{a.summary}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-primary-darker">
              Confirm {confirmStatus.toLowerCase()}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirmStatus === "Cancelled"
                ? "Cancel this ticket? This marks it as no longer actionable."
                : "Resolution notes will be recorded and may be visible to the requester."}
            </p>
            {["Resolved", "Closed"].includes(confirmStatus) && !resolution.trim() && (
              <p className="mt-2 text-xs font-medium text-red-600">
                Add resolution notes in the sidebar before continuing.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmStatus(null)}
                className="rounded-lg px-4 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  savingStatus ||
                  (["Resolved", "Closed"].includes(confirmStatus) && !resolution.trim())
                }
                onClick={() => applyStatus(confirmStatus)}
                className="rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold text-white hover:bg-primary-darker disabled:opacity-40"
              >
                {savingStatus ? "Saving…" : `Mark as ${confirmStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
