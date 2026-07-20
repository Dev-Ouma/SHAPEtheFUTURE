"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/** Redirect retired complaints/campus-feedback admin routes into the ICT Service Desk. */
export function LegacyIctRedirect({ ticketDetail = false }: { ticketDetail?: boolean }) {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (ticketDetail && params?.id) {
      router.replace(`/admin/ict/tickets/${params.id}`);
    } else {
      router.replace("/admin/ict");
    }
  }, [router, params, ticketDetail]);

  return null;
}
