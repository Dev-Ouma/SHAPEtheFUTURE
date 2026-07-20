"use client";

// Chat Intelligence was merged into the combined Chat & Support Desk.
// This route now redirects to that thread inside the Live Inbox tab.
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ChatThreadRedirect() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    router.replace(`/admin/support?open=${id}`);
  }, [router, id]);
  return null;
}
