"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApi } from "@/lib/api";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role_legacy?: string;
  role?: {
    id: string;
    name: string;
    slug: string;
    permissions: Array<{ id: string; slug: string; name: string }>;
  };
  allowedPermissions?: Array<{ id: string; slug: string }>;
  deniedPermissions?: Array<{ id: string; slug: string }>;
}

/**
 * Full-access role slugs / names — bypass all individual permission checks.
 * Matches backend seed: Super Administrator & Administrator.
 */
export const FULL_ACCESS_ROLES = new Set([
  "superadmin",
  "super_admin",
  "super administrator",
  "admin",
  "administrator",
]);

function roleAccessKey(user: AdminUser): string {
  return (
    user.role?.slug ||
    user.role_legacy ||
    user.role?.name ||
    ""
  ).toLowerCase().trim();
}

// ─── Shared Context ───────────────────────────────────────────────────────────

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Wipe in-memory user without calling /auth/me (use after logout). */
  clearLocalUser: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  clearLocalUser: () => {},
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * useAdminUser — returns the current admin user from shared context.
 */
export function useAdminUser() {
  return useContext(AdminAuthContext);
}

/**
 * usePermission — returns true if the current user has the given permission slug.
 */
export function usePermission(permissionSlug: string): { can: boolean; loading: boolean } {
  const { user, loading } = useAdminUser();

  if (loading) return { can: false, loading: true };
  if (!user) return { can: false, loading: false };

  if (FULL_ACCESS_ROLES.has(roleAccessKey(user))) return { can: true, loading: false };

  if (user.deniedPermissions?.some((p) => p.slug === permissionSlug)) return { can: false, loading: false };
  if (user.role?.permissions?.some((p) => p.slug === permissionSlug)) return { can: true, loading: false };
  if (user.allowedPermissions?.some((p) => p.slug === permissionSlug)) return { can: true, loading: false };

  return { can: false, loading: false };
}

/**
 * usePermissions — check multiple permissions at once.
 */
export function usePermissions(slugs: string[]): { permissions: Record<string, boolean>; loading: boolean } {
  const { user, loading } = useAdminUser();

  if (loading || !user) {
    return { permissions: Object.fromEntries(slugs.map((s) => [s, false])), loading };
  }

  const roleSlug = roleAccessKey(user);
  const isSuperAdmin = FULL_ACCESS_ROLES.has(roleSlug);

  const permissions: Record<string, boolean> = {};
  for (const slug of slugs) {
    if (isSuperAdmin) { permissions[slug] = true; continue; }
    if (user.deniedPermissions?.some((p) => p.slug === slug)) { permissions[slug] = false; continue; }
    if (user.role?.permissions?.some((p) => p.slug === slug)) { permissions[slug] = true; continue; }
    permissions[slug] = !!user.allowedPermissions?.some((p) => p.slug === slug);
  }

  return { permissions, loading: false };
}

/**
 * Internal hook to build the provider value — used by AdminAuthProvider.tsx
 */
export function useAdminAuthProviderValue() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("ouk_admin_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // On auth entry pages skip /auth/me (avoids expected 401 noise).
      // If a profile was just cached (post-login), hydrate from it.
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (
          path.startsWith("/admin/login") ||
          path.startsWith("/admin/forgot-password") ||
          path.startsWith("/admin/reset-password")
        ) {
          try {
            const stored = localStorage.getItem("ouk_admin_user");
            setUser(stored ? JSON.parse(stored) : null);
          } catch {
            setUser(null);
          }
          setLoading(false);
          return;
        }
      }

      // Soft probe elsewhere: optionalAuth avoids false ?session=expired redirects.
      const fresh = await getApi("/auth/me", { optionalAuth: true });
      if (fresh && fresh.id) {
        localStorage.setItem("ouk_admin_user", JSON.stringify(fresh));
        setUser(fresh);
      } else {
        setUser(null);
      }
    } catch {
      // Keep previous user on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearLocalUser = useCallback(() => {
    setUser(null);
    setLoading(false);
  }, []);

  return { user, loading, refresh, clearLocalUser };
}
