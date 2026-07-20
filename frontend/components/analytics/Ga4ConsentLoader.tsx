"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type Consent = {
  essential?: boolean;
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

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads GA4 only when analytics consent is granted.
 * Measurement ID from NEXT_PUBLIC_GA_MEASUREMENT_ID — no-op when unset.
 */
export default function Ga4ConsentLoader() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(Boolean(measurementId) && readAnalyticsConsent());
    sync();
    window.addEventListener("cookie_consent_updated", sync);
    return () => window.removeEventListener("cookie_consent_updated", sync);
  }, [measurementId]);

  useEffect(() => {
    if (!enabled || !measurementId) {
      // Stop sending when consent revoked or ID missing.
      if (typeof window !== "undefined" && window.gtag) {
        try {
          window.gtag("consent", "update", { analytics_storage: "denied" });
        } catch {
          /* ignore */
        }
      }
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("consent", "default", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { anonymize_ip: true });
  }, [enabled, measurementId]);

  if (!enabled || !measurementId) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
