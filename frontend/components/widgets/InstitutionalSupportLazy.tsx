"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const InstitutionalSupport = dynamic(
  () => import("@/components/widgets/InstitutionalSupport"),
  { ssr: false },
);

function isAdminOrPortalPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/admin") || pathname.startsWith("/portal");
}

/**
 * Public-site support hub only — skip on admin/portal.
 * Parent PublicShell already defers mount until idle / first interaction.
 */
export default function InstitutionalSupportLazy() {
  const pathname = usePathname();
  if (isAdminOrPortalPath(pathname)) return null;
  return <InstitutionalSupport />;
}
