"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/useAdminPermissions";
import { Loader2 } from "lucide-react";

/**
 * Legacy unified queue URL — redirect into the lane-scoped Service Desk workspace.
 */
export default function IctTicketsRedirect() {
  const router = useRouter();
  const { can: canHelpdesk, loading: hdLoading } = usePermission("helpdesk.view");
  const { can: canCampus, loading: cfLoading } = usePermission("campus_feedback.view");
  const { can: canIct, loading: ictLoading } = usePermission("ict.view");
  const loading = hdLoading || cfLoading || ictLoading;

  useEffect(() => {
    if (loading) return;
    if (canIct && !(canHelpdesk || canCampus)) {
      router.replace("/admin/ict");
      return;
    }
    if ((canHelpdesk || canCampus) && !canIct) {
      router.replace("/admin/helpdesk");
      return;
    }
    if (canIct) {
      router.replace("/admin/ict");
      return;
    }
    if (canHelpdesk || canCampus) {
      router.replace("/admin/helpdesk");
      return;
    }
    router.replace("/admin");
  }, [loading, canHelpdesk, canCampus, canIct, router]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-[10px] font-black uppercase tracking-widest">Opening Service Desk…</p>
    </div>
  );
}
