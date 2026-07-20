"use client";

// Chat Intelligence was merged into the combined Chat & Support Desk.
// This route now redirects to the "All Conversations" tab there.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/support?view=all");
  }, [router]);
  return null;
}
