/**
 * Student portal access policy.
 *
 * - Local / non-production: in-app demo login (localStorage) stays available.
 * - Production: unauthenticated /portal* sends users to official SOMAS unless
 *   NEXT_PUBLIC_PORTAL_DEMO is explicitly enabled for a controlled preview.
 *
 * This keeps local HTTP + integrity smokes intact while stopping localStorage
 * theatre from shipping as “real” auth.
 */

export function getOfficialPortalUrl(): string {
  return (
    process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL?.trim() || "https://my.ouk.ac.ke"
  );
}

/** True when the in-app demo portal session is allowed. */
export function isPortalDemoEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_PORTAL_DEMO?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  if (flag === "0" || flag === "false" || flag === "no") return false;
  return process.env.NODE_ENV !== "production";
}
