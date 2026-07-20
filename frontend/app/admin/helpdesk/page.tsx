"use client";

import { Suspense } from "react";
import ServiceDeskWorkspace from "@/components/admin/service-desk/ServiceDeskWorkspace";
import PermissionGate from "@/components/admin/PermissionGate";
import { Loader2 } from "lucide-react";

function HelpdeskDesk() {
  return (
    <ServiceDeskWorkspace
      lane="helpdesk"
      subtitle="Triage campus feedback and infrastructure tickets — assign, reply, and resolve."
    />
  );
}

export default function UniversityHelpdeskPage() {
  return (
    <PermissionGate permission={["helpdesk.view", "campus_feedback.view", "complaints.view"]}>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-xs font-medium">Loading General Helpdesk…</p>
          </div>
        }
      >
        <HelpdeskDesk />
      </Suspense>
    </PermissionGate>
  );
}
