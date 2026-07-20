"use client";

import React from "react";
import PermissionGate from "@/components/admin/PermissionGate";
import MyTicketsPanel from "@/components/admin/service-desk/MyTicketsPanel";

/**
 * Cross-lane personal workspace. Title is provided by AdminLayout;
 * panel content starts with context + tools (no second page heading).
 */
export default function MyTicketsPage() {
  return (
    <PermissionGate permission="my_tickets.view">
      <MyTicketsPanel />
    </PermissionGate>
  );
}
