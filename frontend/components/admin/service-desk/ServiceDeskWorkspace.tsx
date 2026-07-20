"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ListChecks, Ticket } from "lucide-react";
import IctTicketQueue from "@/components/admin/ict/IctTicketQueue";
import MyTicketsPanel from "@/components/admin/service-desk/MyTicketsPanel";

export type ServiceDeskLane = "helpdesk" | "it";

type DeskTab = "all" | "mine";

interface ServiceDeskWorkspaceProps {
  lane: ServiceDeskLane;
  /** Short context line under the layout title (not a second page heading). */
  subtitle: string;
  /** Optional trailing actions (e.g. ICT Status / Knowledge links). */
  actions?: React.ReactNode;
}

/**
 * Lane-scoped Service Desk shell.
 * Page title comes from AdminLayout; this shell only provides tabs + content.
 */
export default function ServiceDeskWorkspace({
  lane,
  subtitle,
  actions,
}: ServiceDeskWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = (searchParams.get("tab") || "all").toLowerCase() === "mine" ? "mine" : "all";
  const [tab, setTab] = useState<DeskTab>(initial);

  useEffect(() => {
    const next = (searchParams.get("tab") || "all").toLowerCase() === "mine" ? "mine" : "all";
    setTab(next);
  }, [searchParams]);

  const selectTab = (next: DeskTab) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "mine") params.set("tab", "mine");
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{subtitle}</p>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => selectTab("all")}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                tab === "all"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ListChecks size={14} />
              All Tickets
            </button>
            <button
              type="button"
              onClick={() => selectTab("mine")}
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                tab === "mine"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Ticket size={14} />
              My Tickets
            </button>
          </div>
        </div>
      </div>

      {tab === "all" ? (
        <IctTicketQueue lockedLane={lane} embedded />
      ) : (
        <MyTicketsPanel serviceGroup={lane} embedded />
      )}
    </div>
  );
}
