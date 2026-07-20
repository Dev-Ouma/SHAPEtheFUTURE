"use client";

import { Suspense } from "react";
import Link from "next/link";
import ServiceDeskWorkspace from "@/components/admin/service-desk/ServiceDeskWorkspace";
import PermissionGate from "@/components/admin/PermissionGate";
import { usePermission } from "@/hooks/useAdminPermissions";
import { Activity, BookOpen, KeyRound, BarChart2, Loader2 } from "lucide-react";

function IctDesk() {
  const { can: canIctTools } = usePermission("ict.manage");
  const { can: canStatus } = usePermission("ict_status.view");
  const { can: canKb } = usePermission("ict_knowledge.view");
  const { can: canPassword } = usePermission("ict_password.view");

  const showTools = canIctTools || canStatus || canKb || canPassword;

  const toolLinkClass =
    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-primary";

  return (
    <ServiceDeskWorkspace
      lane="it"
      subtitle="Enterprise queue for systems, portals, academic platforms, and digital services."
      actions={
        showTools ? (
          <>
            {canStatus && (
              <Link href="/admin/ict/status" className={toolLinkClass}>
                <Activity size={14} /> Status
              </Link>
            )}
            {canKb && (
              <Link href="/admin/ict/knowledge" className={toolLinkClass}>
                <BookOpen size={14} /> Knowledge
              </Link>
            )}
            {canPassword && (
              <Link href="/admin/ict/password-reset" className={toolLinkClass}>
                <KeyRound size={14} /> Accounts
              </Link>
            )}
            {canIctTools && (
              <Link href="/admin/ict/management" className={toolLinkClass}>
                <BarChart2 size={14} /> Management
              </Link>
            )}
          </>
        ) : undefined
      }
    />
  );
}

export default function IctOverview() {
  return (
    <PermissionGate permission="ict.view">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-xs font-medium">Loading ICT Technical Support…</p>
          </div>
        }
      >
        <IctDesk />
      </Suspense>
    </PermissionGate>
  );
}
