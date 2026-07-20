import React from "react";
import {
  HardDrive, KeyRound, Package, Wrench, ThumbsDown, ThumbsUp,
  Building2, MonitorSmartphone, Globe, Smartphone, UserCog, Mail,
} from "lucide-react";

// Shared presentation maps for the ICT module. Kept out of page.tsx files because
// Next.js App Router pages may only export a default component.

export const ICT_STATUS_COLORS: Record<string, string> = {
  Open: "bg-slate-100 text-slate-600 border-slate-200",
  Acknowledged: "bg-blue-50 text-blue-600 border-blue-200",
  "In Progress": "bg-purple-50 text-purple-600 border-purple-200",
  "On Hold": "bg-amber-50 text-amber-600 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Closed: "bg-slate-50 text-slate-500 border-slate-200",
  Cancelled: "bg-red-50 text-red-500 border-red-200",
};

export const ASSET_STATUS_COLORS: Record<string, string> = {
  "In Stock": "bg-blue-50 text-blue-600 border-blue-200",
  "In Use": "bg-emerald-50 text-emerald-600 border-emerald-200",
  "Under Repair": "bg-amber-50 text-amber-600 border-amber-200",
  Retired: "bg-slate-100 text-slate-500 border-slate-200",
  Lost: "bg-red-50 text-red-500 border-red-200",
};

export const ASSET_TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  Hardware: { icon: <HardDrive size={14} />, label: "Hardware" },
  License: { icon: <KeyRound size={14} />, label: "Licence" },
  Consumable: { icon: <Package size={14} />, label: "Consumable" },
};

// System status board palette. `dot` is a solid bg for indicator dots/bars.
export const SYSTEM_STATUS_META: Record<string, { badge: string; dot: string; label: string }> = {
  Operational: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500", label: "Operational" },
  Degraded: { badge: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500", label: "Degraded Performance" },
  "Partial Outage": { badge: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500", label: "Partial Outage" },
  "Major Outage": { badge: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500", label: "Major Outage" },
  Maintenance: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500", label: "Under Maintenance" },
};

export const INCIDENT_STATUS_COLORS: Record<string, string> = {
  Investigating: "bg-red-50 text-red-600 border-red-200",
  Identified: "bg-orange-50 text-orange-600 border-orange-200",
  Monitoring: "bg-amber-50 text-amber-600 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Scheduled: "bg-blue-50 text-blue-600 border-blue-200",
  "In Progress": "bg-purple-50 text-purple-600 border-purple-200",
  Completed: "bg-slate-50 text-slate-500 border-slate-200",
};

export const IMPACT_COLORS: Record<string, string> = {
  Minor: "text-amber-500",
  Major: "text-orange-500",
  Critical: "text-red-500",
  Maintenance: "text-blue-500",
};

// Complaints & Compliments were merged into the ICT ticket queue as
// `feedback_type` on IctTicket — this labels/colors that field wherever a
// ticket card or detail view is rendered, so the two aren't invisibly mixed
// in with regular service-request tickets.
export const FEEDBACK_TYPE_META: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  service_request: { icon: <Wrench size={9} />, label: "Technical Request", badge: "bg-blue-50 text-blue-600 border-blue-200" },
  complaint: { icon: <ThumbsDown size={9} />, label: "Complaint", badge: "bg-red-50 text-red-600 border-red-200" },
  compliment: { icon: <ThumbsUp size={9} />, label: "Compliment", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

export const SERVICE_GROUP_META: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  helpdesk: {
    icon: <Building2 size={9} />,
    label: "HelpDesk",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
  it_technical_support: {
    icon: <MonitorSmartphone size={9} />,
    label: "ICT Technical Support",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

export const SUBMISSION_SOURCE_META: Record<string, { icon: React.ReactNode; label: string; badge: string }> = {
  website: {
    icon: <Globe size={9} />,
    label: "Website",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  mobile_app: {
    icon: <Smartphone size={9} />,
    label: "OUK APP",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  admin: {
    icon: <UserCog size={9} />,
    label: "Admin",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  email: {
    icon: <Mail size={9} />,
    label: "Email",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  unknown: {
    icon: <Globe size={9} />,
    label: "Unknown",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

/** Map Other/External to Guest for admin display. */
export function requesterDisplayLabel(type?: string | null, isAnonymous?: boolean): string {
  if (isAnonymous) return "Guest (anonymous)";
  if (!type || type === "Other" || type === "External") return "Guest";
  return type;
}

export const KB_STATUS_COLORS: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Draft: "bg-slate-100 text-slate-500 border-slate-200",
};
