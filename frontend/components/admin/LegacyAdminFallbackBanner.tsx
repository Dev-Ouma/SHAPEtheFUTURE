"use client";

import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

/** Shown on legacy admin routes kept as fallbacks after the Service Desk merge. */
export default function LegacyAdminFallbackBanner({
  primaryHref = "/admin/helpdesk",
  primaryLabel = "General Helpdesk",
  message = "This is a legacy console. New campus feedback and technical requests are managed under University Service Desk → General Helpdesk.",
}: {
  primaryHref?: string;
  primaryLabel?: string;
  message?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm font-medium text-amber-900">{message}</p>
      </div>
      <Link
        href={primaryHref}
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-primary-darker md:self-auto"
      >
        Open {primaryLabel} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
