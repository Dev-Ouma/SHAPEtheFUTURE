"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Eye, RefreshCw, Filter, X, Clock, Calendar, User, Tag,
  ShieldAlert, Plus, GraduationCap, Briefcase, Users,
  ChevronLeft, ChevronRight, LayoutList, LayoutGrid,
} from "lucide-react";
import { getApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ICT_STATUS_COLORS,
  FEEDBACK_TYPE_META,
  SUBMISSION_SOURCE_META,
  requesterDisplayLabel,
} from "@/app/admin/ict/ict-ui";
import { usePermission } from "@/hooks/useAdminPermissions";
import PersonalAnalyticsPanel from "@/components/admin/ict/PersonalAnalyticsPanel";
import LogTicketModal from "@/components/admin/ict/LogTicketModal";
import { OVERDUE_LABEL, DUE_BY_LABEL } from "@/lib/service-desk-copy";
import {
  readQueueViewPref, writeQueueViewPref, type QueueListView,
} from "@/lib/analytics-chart-prefs";
import { isHelpdeskCategory } from "@/lib/helpdesk-category-slugs";

const STATUSES = ["all", "Open", "Acknowledged", "In Progress", "On Hold", "Resolved", "Closed", "Cancelled"];
const PRIORITIES = ["all", "Low", "Medium", "High", "Critical"];
const REQUESTER_TABS = [
  { id: "all", label: "All", icon: <Users size={14} /> },
  { id: "Staff", label: "Staff", icon: <Briefcase size={14} /> },
  { id: "Student", label: "Student", icon: <GraduationCap size={14} /> },
  { id: "Faculty", label: "Faculty", icon: <User size={14} /> },
];

/** Helpdesk lane: campus feedback kinds only (no technical-request mix). */
const HELPDESK_FEEDBACK_TABS = [
  { id: "all", label: "All cases" },
  { id: "complaint", label: "Complaints" },
  { id: "compliment", label: "Compliments" },
];

/** Cross-lane / unlocked queue only. */
const ALL_LANES_FEEDBACK_TABS = [
  { id: "all", label: "All" },
  { id: "service_request", label: "Technical Requests" },
  { id: "complaint", label: "Complaints" },
  { id: "compliment", label: "Compliments" },
];

const LANE_TABS = [
  { id: "all", label: "All Lanes" },
  { id: "helpdesk", label: "HelpDesk / Infrastructure" },
  { id: "it", label: "ICT Technical Support" },
];

const PAGE_SIZE = 10;

const PRIORITY_COLORS: Record<string, string> = {
  Low: "text-slate-400", Medium: "text-blue-500", High: "text-amber-500", Critical: "text-red-500",
};

const isBreached = (t: any) =>
  t.sla_due_date && new Date(t.sla_due_date) < new Date() && !["Resolved", "Closed", "Cancelled"].includes(t.status);

/** Ticket belongs to the Helpdesk lane (strict + category fallback for legacy rows). */
const ticketInHelpdeskLane = (t: any) => {
  if (t.service_group === "helpdesk") return true;
  if (t.service_group === "it_technical_support") return false;
  return isHelpdeskCategory(t.category);
};

/** Ticket belongs to the ICT Technical Support lane. */
const ticketInIctLane = (t: any) => {
  if (t.service_group === "it_technical_support") return true;
  if (t.service_group === "helpdesk") return false;
  return !isHelpdeskCategory(t.category);
};

type LockedLane = "helpdesk" | "it";

export default function IctTicketQueue({
  lockedLane,
  embedded = false,
}: {
  lockedLane?: LockedLane;
  embedded?: boolean;
} = {}) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [breachedOnly, setBreachedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [page, setPage] = useState(1);
  const [listView, setListView] = useState<QueueListView>("table");

  const [laneFilter, setLaneFilter] = useState(lockedLane || "all");
  const [laneReady, setLaneReady] = useState(!!lockedLane);

  useEffect(() => {
    setListView(readQueueViewPref("table"));
  }, []);

  const { can: canIct, loading: ictPermLoading } = usePermission("ict.view");
  const { can: canHelpdesk, loading: helpdeskPermLoading } = usePermission("helpdesk.view");
  const { can: canCampusFeedback } = usePermission("campus_feedback.view");
  const { can: canIctManage } = usePermission("ict.manage");
  const { can: canHelpdeskManage } = usePermission("helpdesk.manage");
  const { can: canCampusManage } = usePermission("campus_feedback.manage");
  const permLoading = ictPermLoading || helpdeskPermLoading;
  const canSeeAll = canIct || canHelpdesk || canCampusFeedback;
  const canLogHelpdesk = canHelpdeskManage || canCampusManage;
  const canLogIct = canIctManage;
  /** Dual-role officers can log either lane from either desk. */
  const canLogTicket = canLogHelpdesk || canLogIct;
  const canSeeBothLanes = !lockedLane && canIct && (canHelpdesk || canCampusFeedback);
  const laneLocked = Boolean(lockedLane);

  useEffect(() => {
    if (lockedLane) {
      setLaneFilter(lockedLane);
      setLaneReady(true);
      return;
    }
    if (permLoading) return;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("breached") === "1") setBreachedOnly(true);
      const laneParam = (params.get("lane") || params.get("service_group") || "").toLowerCase();
      if (laneParam === "helpdesk" || laneParam === "it") {
        setLaneFilter(laneParam);
      } else if ((canHelpdesk || canCampusFeedback) && !canIct) {
        setLaneFilter("helpdesk");
      } else if (canIct && !canHelpdesk && !canCampusFeedback) {
        setLaneFilter("it");
      }
      const feedbackParam = (params.get("feedback") || "").toLowerCase();
      if (["complaint", "compliment", "service_request"].includes(feedbackParam)) {
        setFeedbackFilter(feedbackParam);
      }
    }
    setLaneReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permLoading, canIct, canHelpdesk, canCampusFeedback, lockedLane]);

  useEffect(() => {
    if (permLoading || !laneReady) return;
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permLoading, canSeeAll, laneFilter, laneReady]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const laneQuery = laneFilter !== "all" ? `?service_group=${laneFilter}` : "";
      const endpoint = canSeeAll
        ? `/ict/admin/tickets${laneQuery}`
        : `/ict/admin/tickets/assigned/mine${laneQuery}`;
      const data = await getApi(endpoint);
      if (data == null) {
        setTickets([]);
        toast.error("Could not load tickets — check your desk permissions or try again.");
        return;
      }
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const laneTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (lockedLane === "helpdesk") {
        return ticketInHelpdeskLane(t);
      }
      if (lockedLane === "it") {
        if (!ticketInIctLane(t)) return false;
        const fb = t.feedback_type || "service_request";
        return fb !== "complaint" && fb !== "compliment";
      }
      return true;
    });
  }, [tickets, lockedLane]);

  const filtered = useMemo(() => {
    return laneTickets.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        t.reference_number?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.requester_name?.toLowerCase().includes(q) ||
        t.requester_email?.toLowerCase().includes(q) ||
        t.category?.name?.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || t.requester_type === typeFilter;
      const matchesFeedback = feedbackFilter === "all" || (t.feedback_type || "service_request") === feedbackFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesBreach = !breachedOnly || isBreached(t);
      return matchesSearch && matchesType && matchesFeedback && matchesStatus && matchesPriority && matchesBreach;
    });
  }, [laneTickets, search, typeFilter, feedbackFilter, statusFilter, priorityFilter, breachedOnly]);

  const feedbackTabs = lockedLane === "helpdesk"
    ? HELPDESK_FEEDBACK_TABS
    : lockedLane === "it"
      ? null
      : ALL_LANES_FEEDBACK_TABS;

  useEffect(() => {
    if (lockedLane === "it") setFeedbackFilter("all");
    if (lockedLane === "helpdesk" && feedbackFilter === "service_request") {
      setFeedbackFilter("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedLane]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, feedbackFilter, statusFilter, priorityFilter, breachedOnly, laneFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className={embedded ? "space-y-5" : "space-y-5 pb-20"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {!embedded && (
            <h2 className="mb-1 text-lg font-semibold text-primary-darker tracking-tight">
              {canSeeAll ? "Ticket Queue" : "My Assigned Tickets"}
            </h2>
          )}
          {!embedded && (
            <p className="text-sm font-medium text-slate-500">
              {laneLocked
                ? lockedLane === "helpdesk"
                  ? "Triage, assign and resolve General Helpdesk tickets."
                  : "Triage, assign and resolve ICT Technical Support requests."
                : canSeeAll
                  ? "Triage, assign and resolve service desk requests."
                  : "Respond to and transfer tickets assigned to you."}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canLogTicket && (
            <button
              type="button"
              onClick={() => setShowLog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-darker"
            >
              <Plus size={15} />
              {canLogHelpdesk && canLogIct
                ? "Log Case"
                : canLogHelpdesk && !canLogIct
                  ? "Log Feedback"
                  : "Log Ticket"}
            </button>
          )}
          <button
            type="button"
            onClick={fetchTickets}
            aria-label="Refresh queue"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-primary"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {canSeeAll && canSeeBothLanes && !laneLocked && (
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {LANE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLaneFilter(tab.id)}
              className={`rounded-md px-3 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                laneFilter === tab.id
                  ? "bg-primary-darker text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <PersonalAnalyticsPanel
        serviceGroup={laneFilter === "all" ? undefined : (laneFilter as "helpdesk" | "it")}
        title={canSeeAll ? "Queue performance" : "My queue performance"}
        scope={canSeeAll ? "queue" : "personal"}
      />

      {/* Unified filter toolbar */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search reference, subject, requester, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-primary-darker placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBreachedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${
                breachedOnly
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-300"
              }`}
            >
              <ShieldAlert size={13} /> {OVERDUE_LABEL}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-colors ${
                showFilters
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary"
              }`}
            >
              <Filter size={13} /> Filters
              {(statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all" || feedbackFilter !== "all") && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] text-white">
                  !
                </span>
              )}
            </button>
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                title="Table view"
                aria-pressed={listView === "table"}
                onClick={() => {
                  setListView("table");
                  writeQueueViewPref("table");
                }}
                className={`rounded-md p-2 transition-colors ${
                  listView === "table" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <LayoutList size={14} />
              </button>
              <button
                type="button"
                title="Card view"
                aria-pressed={listView === "cards"}
                onClick={() => {
                  setListView("cards");
                  writeQueueViewPref("cards");
                }}
                className={`rounded-md p-2 transition-colors ${
                  listView === "cards" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {feedbackTabs && (
          <div className="flex flex-wrap gap-1.5">
            {feedbackTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFeedbackFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  feedbackFilter === tab.id
                    ? "bg-primary text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.id !== "all" && FEEDBACK_TYPE_META[tab.id]?.icon}
                {tab.label}
                <span className={`tabular-nums ${feedbackFilter === tab.id ? "text-white/80" : "text-slate-400"}`}>
                  {tab.id === "all"
                    ? laneTickets.length
                    : laneTickets.filter((t) => (t.feedback_type || "service_request") === tab.id).length}
                </span>
              </button>
            ))}
          </div>
        )}

        {lockedLane === "it" && (
          <p className="text-[11px] font-medium text-slate-500">
            ICT Technical Support tickets
          </p>
        )}
        {lockedLane === "helpdesk" && (
          <p className="text-[11px] font-medium text-slate-500">
            General Helpdesk cases (complaints, compliments, and campus infrastructure)
          </p>
        )}

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-3 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Requester
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {REQUESTER_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTypeFilter(tab.id)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          typeFilter === tab.id
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          statusFilter === s
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityFilter(p)}
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                          priorityFilter === p
                            ? "border-primary bg-primary text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {p === "all" ? "All" : p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setTypeFilter("all");
                    setFeedbackFilter("all");
                    setSearch("");
                    setBreachedOnly(false);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500"
                >
                  <X size={12} /> Clear filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          {filtered.length > PAGE_SIZE && (
            <span>
              {" "}· Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-24 text-slate-400">
          <RefreshCw className="animate-spin" size={28} />
          <span className="text-xs font-medium">Loading queue…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <Search size={28} className="mx-auto text-slate-300" />
          <h5 className="mt-3 text-base font-semibold text-primary-darker">No tickets found</h5>
          <p className="mt-1 text-sm text-slate-500">Adjust filters or log a new ticket.</p>
        </div>
      ) : listView === "table" ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">{DUE_BY_LABEL}</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item) => {
                  const fb = FEEDBACK_TYPE_META[item.feedback_type || "service_request"];
                  const src = SUBMISSION_SOURCE_META[item.submission_source || "unknown"];
                  const breachedRow = isBreached(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-semibold text-primary-darker">
                            {item.reference_number}
                          </span>
                          {lockedLane !== "it" && (
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${fb.badge}`}>
                                {fb.icon} {fb.label}
                              </span>
                              {item.is_escalated && (
                                <ShieldAlert size={12} className="text-orange-500" />
                              )}
                            </div>
                          )}
                          {lockedLane === "it" && item.is_escalated && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600">
                              <ShieldAlert size={12} /> Escalated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <p className="truncate font-medium text-slate-800">{item.subject}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {item.category?.name || "Uncategorized"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold ${ICT_STATUS_COLORS[item.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs font-semibold ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {item.is_anonymous
                          ? "Anonymous"
                          : item.requester_name || item.requester_email || "—"}
                        <div className="text-[10px] text-slate-400">
                          {requesterDisplayLabel(item.requester_type, item.is_anonymous)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {item.assigned_to?.full_name?.split(" ")[0] || (
                          <span className="text-amber-600">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${src.badge}`}>
                          {src.icon} {src.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${breachedRow ? "text-red-600" : "text-slate-500"}`}>
                        {item.sla_due_date
                          ? new Date(item.sla_due_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/ict/tickets/${item.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Eye size={13} /> Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((item) => {
            const fb = FEEDBACK_TYPE_META[item.feedback_type || "service_request"];
            const src = SUBMISSION_SOURCE_META[item.submission_source || "unknown"];
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-primary-darker px-2 py-0.5 font-mono text-[11px] font-semibold text-white">
                        {item.reference_number}
                      </span>
                      <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold ${ICT_STATUS_COLORS[item.status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
                        {item.status}
                      </span>
                      {lockedLane !== "it" && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${fb.badge}`}>
                          {fb.icon} {fb.label}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold ${src.badge}`}>
                        {src.icon} {src.label}
                      </span>
                      <span className={`text-[11px] font-semibold ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <h4 className="truncate text-base font-semibold text-primary-darker">{item.subject}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <User size={11} />
                        {item.is_anonymous ? "Anonymous" : item.requester_name || item.requester_email || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Tag size={11} /> {item.category?.name || "Uncategorized"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} /> {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center gap-1 ${isBreached(item) ? "text-red-600" : ""}`}>
                        <Clock size={11} /> {DUE_BY_LABEL}{" "}
                        {item.sla_due_date ? new Date(item.sla_due_date).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/ict/tickets/${item.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-white hover:bg-primary-darker sm:self-center"
                  >
                    <Eye size={13} /> Open
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
              .map((n, idx, arr) => (
                <React.Fragment key={n}>
                  {idx > 0 && arr[idx - 1] !== n - 1 && (
                    <span className="text-slate-300 px-1 text-xs">…</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(n)}
                    className={`min-w-[32px] h-8 px-2 text-[11px] font-black rounded-lg transition-colors ${
                      n === currentPage
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {n}
                  </button>
                </React.Fragment>
              ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showLog && (
          <LogTicketModal
            lockedLane={lockedLane}
            canLogHelpdesk={canLogHelpdesk}
            canLogIct={canLogIct}
            onClose={() => setShowLog(false)}
            onCreated={() => { setShowLog(false); fetchTickets(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
