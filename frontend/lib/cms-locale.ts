/**
 * CMS locale helpers for Google Translate opt-in.
 * Real Kiswahili (non-empty *_sw) is protected with notranslate;
 * English fallbacks stay open for machine translation.
 */

export function hasRealSw(sw?: string | null): boolean {
  return Boolean(String(sw ?? "").trim());
}

/** True when locale is sw and the matching *_sw field was provided. */
export function isRealSwContent(
  locale: string | undefined | null,
  sw?: string | null,
): boolean {
  return locale === "sw" && hasRealSw(sw);
}

type NoTranslateAttrs = {
  className?: string;
  translate?: "no";
  lang?: string;
};

/** HTML attrs that block Google Translate on a node. */
export function noTranslateAttrs(
  protect: boolean,
  lang?: string,
): NoTranslateAttrs {
  if (!protect) return {};
  return {
    className: "notranslate",
    translate: "no",
    ...(lang ? { lang } : {}),
  };
}

/** Protect editorial SW CMS fields; leave EN fallbacks unmarked. */
export function cmsProtectAttrs(
  locale: string | undefined | null,
  sw?: string | null,
): NoTranslateAttrs {
  const protect = isRealSwContent(locale, sw);
  return noTranslateAttrs(protect, protect ? "sw" : undefined);
}

/** Protect next-intl / known site chrome when locale is Swahili. */
export function i18nProtectAttrs(
  locale: string | undefined | null,
): NoTranslateAttrs {
  return noTranslateAttrs(locale === "sw", locale === "sw" ? "sw" : undefined);
}

/** Merge optional className with notranslate when protected. */
export function mergeProtectClass(
  className: string | undefined,
  attrs: NoTranslateAttrs,
): string | undefined {
  if (!attrs.className) return className;
  return [className, attrs.className].filter(Boolean).join(" ");
}
