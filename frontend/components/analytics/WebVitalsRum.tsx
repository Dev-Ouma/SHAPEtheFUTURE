"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { postApi } from "@/lib/api";

type Consent = {
  analytics?: boolean;
};

function readAnalyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie.match(/(?:^|; )ouk_cookie_consent=([^;]*)/);
  if (!match) return false;
  try {
    const prefs = JSON.parse(decodeURIComponent(match[1])) as Consent;
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

/**
 * First-party RUM via Next.js web-vitals.
 * Consent-gated (same cookie as GA4 / AnalyticsProvider). Safe no-op without consent.
 */
export default function WebVitalsRum() {
  const pathname = usePathname();
  const consentRef = useRef(false);
  const pathRef = useRef(pathname);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const sync = () => {
      consentRef.current = readAnalyticsConsent();
    };
    sync();
    window.addEventListener("cookie_consent_updated", sync);
    return () => window.removeEventListener("cookie_consent_updated", sync);
  }, []);

  useReportWebVitals((metric) => {
    if (!consentRef.current) return;
    // Keep payload small; nginx analytics_track zone expects modest volume.
    const name = metric.name;
    if (!["CLS", "FCP", "INP", "LCP", "TTFB"].includes(name)) return;

    void postApi("/analytics/track", {
      type: "WEB_VITAL",
      path: pathRef.current || pathname || "/",
      label: name,
      metadata: {
        id: metric.id,
        value: Math.round(name === "CLS" ? metric.value * 1000 : metric.value),
        rating: metric.rating,
        navigationType: metric.navigationType,
        delta: Math.round(name === "CLS" ? metric.delta * 1000 : metric.delta),
      },
    }).catch(() => {
      /* silent — RUM must never break UX */
    });
  });

  return null;
}
