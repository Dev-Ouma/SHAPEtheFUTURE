/** Supported public CMS locales (Layer B). */
export type AppLocale = 'en' | 'sw';

export function normalizeLocale(raw?: string | null): AppLocale {
  const v = (raw || 'en').toLowerCase().trim();
  return v === 'sw' ? 'sw' : 'en';
}

/**
 * Prefer Swahili field when locale=sw and value is non-empty; else English.
 */
export function pickLocalized(
  locale: AppLocale,
  en: string | null | undefined,
  sw: string | null | undefined,
): string {
  if (locale === 'sw' && sw && String(sw).trim()) return String(sw);
  return en == null ? '' : String(en);
}
