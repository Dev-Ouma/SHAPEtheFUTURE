import type { Metadata, MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

/** Public site origin — no trailing slash. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shape.ouk.ac.ke";
  return raw.replace(/\/$/, "");
}

/**
 * Path for a locale with `localePrefix: "as-needed"`:
 * en → `/about`, sw → `/sw/about`, home → `/` or `/sw`.
 */
export function localizedPath(locale: string, path: string): string {
  const normalized = !path || path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const clean =
    normalized === "/" ? "/" : normalized.replace(/\/+$/, "") || "/";

  if (locale === routing.defaultLocale) {
    return clean;
  }

  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: string, path: string): string {
  const base = getSiteUrl();
  const loc = localizedPath(locale, path);
  return loc === "/" ? base : `${base}${loc}`;
}

/**
 * Canonical + hreflang for a public path (locale-stripped, e.g. `/programmes`).
 * Uses en-GB / sw-KE (+ x-default → English) for Webometrics-friendly signals.
 */
export function localeAlternates(
  path: string,
  canonicalLocale: string = routing.defaultLocale,
): NonNullable<Metadata["alternates"]> {
  const en = absoluteUrl("en", path);
  const sw = absoluteUrl("sw", path);
  const canonical = absoluteUrl(canonicalLocale, path);

  return {
    canonical,
    languages: {
      "en-GB": en,
      en,
      "sw-KE": sw,
      sw,
      "x-default": en,
    },
  };
}

export function openGraphLocale(locale: string): string {
  return locale === "sw" ? "sw_KE" : "en_GB";
}

/** BCP 47 tag for <html lang> (British English / Kenyan Kiswahili). */
export function htmlLangForLocale(locale: string): string {
  return locale === "sw" ? "sw-KE" : "en-GB";
}

/** Sitemap row with bilingual alternates. `path` is locale-stripped. */
export function sitemapEntry(
  path: string,
  options?: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap[number] {
  const en = absoluteUrl("en", path);
  const sw = absoluteUrl("sw", path);
  return {
    url: en,
    ...options,
    alternates: {
      languages: {
        "en-GB": en,
        en,
        "sw-KE": sw,
        sw,
        "x-default": en,
      },
    },
  };
}

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}

/** Merge page metadata with canonical + hreflang for a known public path. */
export function withLocaleSeo(
  path: string,
  locale: string,
  metadata: Metadata = {},
): Metadata {
  const alternates = localeAlternates(path, locale);
  return {
    ...metadata,
    alternates: {
      ...alternates,
      ...metadata.alternates,
      languages: {
        ...alternates.languages,
        ...(metadata.alternates?.languages as Record<string, string> | undefined),
      },
    },
    openGraph: {
      locale: openGraphLocale(locale),
      alternateLocale: locale === "sw" ? ["en_GB"] : ["sw_KE"],
      ...metadata.openGraph,
    },
  };
}
