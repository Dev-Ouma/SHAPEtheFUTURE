"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { htmlLangForLocale } from "@/lib/seo";

/**
 * Syncs <html lang> on client navigations between en/sw.
 * Initial paint is set by the inline script in app/[locale]/layout.tsx.
 */
export default function LocaleHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = htmlLangForLocale(locale);
  }, [locale]);

  return null;
}
