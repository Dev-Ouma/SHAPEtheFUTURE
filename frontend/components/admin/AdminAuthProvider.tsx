"use client";

import React from "react";
import { AdminAuthContext, useAdminAuthProviderValue } from "@/hooks/useAdminPermissions";

/**
 * AdminAuthProvider — wrap the admin layout with this so all hooks share one
 * auth/me call instead of each making independent network requests.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAdminAuthProviderValue();
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
