"use client";

import React from "react";
import { usePermissions } from "@/hooks/useAdminPermissions";
import { ShieldAlert } from "lucide-react";

interface PermissionGateProps {
  /** One slug, or any of several (OR), e.g. "reports.view" or ["helpdesk.view", "campus_feedback.view"] */
  permission: string | string[];
  /** What to show when access is denied. Defaults to a 403 block. Pass null to hide silently. */
  fallback?: React.ReactNode | null;
  children: React.ReactNode;
}

/**
 * PermissionGate — wraps any UI element or page section.
 * If the current user does not have the required permission, shows the fallback.
 *
 * Usage:
 *   <PermissionGate permission="reports.view">
 *     <ReportsDashboard />
 *   </PermissionGate>
 *   <PermissionGate permission={["helpdesk.view", "campus_feedback.view"]}>
 *     <Helpdesk />
 *   </PermissionGate>
 */
export default function PermissionGate({
  permission,
  fallback,
  children,
}: PermissionGateProps) {
  const required = Array.isArray(permission) ? permission : [permission];
  const { permissions, loading } = usePermissions(required);
  const can = required.some((slug) => permissions[slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!can) {
    if (fallback === null) return null;
    if (fallback) return <>{fallback}</>;

    const label = required.join(" / ");
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="text-red-400" size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-md">
          You don&apos;t have the{" "}
          <code className="bg-slate-100 px-1 rounded text-xs font-mono">{label}</code>{" "}
          permission required to view this section.
        </p>
        <p className="text-slate-400 text-xs mt-3">
          Contact your system administrator to request access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
