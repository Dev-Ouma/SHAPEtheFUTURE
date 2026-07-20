"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { readGoogTransTarget } from "@/lib/googtrans";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay?: boolean },
          elementId: string,
        ) => void;
      };
    };
  }
}

function isAdminOrPortalPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.includes("/admin/") ||
    pathname.includes("/portal/")
  );
}

/**
 * Opt-in Google Translate for the public site only.
 * Script loads when a googtrans cookie is set (SW leftover-English assist, or other languages).
 * Does not auto-run on SW i18n alone — indexed HTML stays next-intl / CMS.
 */
export default function PublicGoogleTranslate() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isAdminOrPortalPath(pathname)) {
      setEnabled(false);
      return;
    }
    const target = readGoogTransTarget();
    setEnabled(Boolean(target && target !== "en"));
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;

    window.googleTranslateElementInit = () => {
      if (typeof window.google === "undefined" || !window.google.translate) return;
      const el = document.getElementById("google_translate_element");
      if (!el) return;
      if (el.getAttribute("data-gt-ready") === "1") return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element",
      );
      el.setAttribute("data-gt-ready", "1");
    };

    if (window.google?.translate) {
      window.googleTranslateElementInit();
    }
  }, [enabled]);

  if (isAdminOrPortalPath(pathname) || !enabled) return null;

  return (
    <>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
    </>
  );
}
