/** Helpers for the Google Translate cookie (`googtrans=/source/target`). */

/**
 * Opt-in machine languages only (other than site EN/SW).
 * Kiswahili is not listed here — SW site language covers editorial Kiswahili;
 * listing GT Kiswahili next to SW is a confusing duplicate.
 */
export const GT_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "de", label: "Deutsch" },
] as const;

export function clearGoogTransCookies() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  document.cookie = "googtrans=; path=/; max-age=0";
  document.cookie = `googtrans=; domain=${host}; path=/; max-age=0`;
  if (host.includes(".")) {
    document.cookie = `googtrans=; domain=.${host}; path=/; max-age=0`;
  }
}

export function setGoogTransCookie(target: string) {
  if (typeof document === "undefined") return;
  const value = target ? `/en/${target}` : "/en/en";
  const host = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/`;
  document.cookie = `googtrans=${value}; domain=${host}; path=/`;
}

export function readGoogTransTarget(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
  if (!match?.[1]) return null;
  const parts = decodeURIComponent(match[1]).split("/");
  return parts[parts.length - 1] || null;
}
