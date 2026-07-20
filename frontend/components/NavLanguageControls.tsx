"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import {
  GT_LANGUAGES,
  clearGoogTransCookies,
  readGoogTransTarget,
  setGoogTransCookie,
} from "@/lib/googtrans";

function hrefForLocale(pathname: string, next: "en" | "sw") {
  const path = !pathname || pathname === "/" ? "" : pathname;
  return next === "en" ? path || "/" : `/sw${path}`;
}

type Props = {
  className?: string;
  /** Styles for transparent/dark header. */
  onDark?: boolean;
  /** Full-width panel alignment for mobile drawer. */
  stacked?: boolean;
};

/**
 * Translate control:
 * 1) Site language EN / SW (next-intl)
 * 2) When SW: opt-in GT Kiswahili for leftover English only (not listed as a GT language)
 * 3) Optional GT for other languages
 */
export default function NavLanguageControls({
  className = "",
  onDark = false,
  stacked = false,
}: Props) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [gtLang, setGtLang] = useState("");
  const [swAssist, setSwAssist] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const code = readGoogTransTarget();
    if (code === "sw") {
      setSwAssist(true);
      setGtLang("");
      return;
    }
    if (code && code !== "en") {
      setGtLang(code);
      setSwAssist(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switchLocale = (next: string) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    const nextLocale = next as "en" | "sw";
    const currentGt = readGoogTransTarget();
    const hadMachineTranslate = Boolean(
      currentGt && currentGt !== "en",
    );

    // Leaving SW (or switching locales) clears machine assist / other GT.
    clearGoogTransCookies();
    setGtLang("");
    setSwAssist(false);
    setOpen(false);

    if (hadMachineTranslate || nextLocale === "sw") {
      // Hard navigate so SW pages load cleanly; GT assist is opt-in after.
      window.location.assign(hrefForLocale(pathname, nextLocale));
      return;
    }
    router.replace(pathname, { locale: nextLocale });
  };

  const toggleSwLeftoverAssist = () => {
    if (locale !== "sw") return;
    const next = !swAssist;
    setOpen(false);
    if (next) {
      setGoogTransCookie("sw");
      setSwAssist(true);
      setGtLang("");
    } else {
      clearGoogTransCookies();
      setSwAssist(false);
    }
    window.location.reload();
  };

  const applyGoogleTranslate = (code: string) => {
    setOpen(false);
    if (!code) {
      clearGoogTransCookies();
      setGtLang("");
      setSwAssist(false);
    } else {
      setGoogTransCookie(code);
      setGtLang(code);
      setSwAssist(false);
    }
    window.location.reload();
  };

  const gtLabel = GT_LANGUAGES.find((l) => l.code === gtLang)?.label;
  const buttonLabel = gtLabel
    ? gtLabel
    : locale === "sw"
      ? t("localeCodeSw")
      : t("translate");

  const translateBtn = onDark
    ? "border-white/25 text-white/90 hover:border-white/50 hover:text-white"
    : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary";
  const panelClass = stacked
    ? "relative mt-2 w-full rounded-lg border border-slate-100 bg-white py-2 shadow-lg"
    : "absolute right-0 top-full mt-2 w-72 rounded-lg border border-slate-100 bg-white py-2 shadow-xl z-[120]";

  return (
    <div
      ref={rootRef}
      className={`notranslate relative ${stacked ? "w-full" : ""} ${className}`.trim()}
      translate="no"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("translateAria")}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] transition-colors ${translateBtn} ${
          stacked ? "w-full justify-between" : ""
        } ${gtLang || locale === "sw" ? (onDark ? "border-white/60 text-white" : "border-primary/40 text-primary") : ""}`}
      >
        <Languages size={13} aria-hidden="true" />
        <span className="max-w-[7.5rem] truncate">{buttonLabel}</span>
        <ChevronDown
          size={12}
          className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={panelClass} role="dialog" aria-label={t("translateAria")}>
          <p className="px-3 pb-1.5 pt-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
            {t("siteLanguage")}
          </p>
          {routing.locales.map((code) => {
            const label =
              code === "en" ? t("siteLanguageEn") : t("siteLanguageSw");
            return (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                aria-pressed={locale === code}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-bold transition-colors hover:bg-slate-50 ${
                  locale === code ? "text-primary" : "text-slate-700"
                }`}
              >
                <span>
                  <span className="font-black tracking-widest">{code.toUpperCase()}</span>
                  <span className="ml-2 font-semibold normal-case tracking-normal text-slate-500">
                    {label}
                  </span>
                </span>
                {locale === code && (
                  <Check size={14} className="shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
            );
          })}

          {/* SW-only: GT Kiswahili for leftover English — not a separate GT language row */}
          {locale === "sw" && (
            <div className="mx-3 mt-1 mb-2 rounded-md border border-slate-100 bg-slate-50/90 px-3 py-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={swAssist}
                  onChange={toggleSwLeftoverAssist}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--primary,#0f766e)]"
                />
                <span>
                  <span className="block text-[11px] font-bold text-slate-700 normal-case tracking-normal leading-snug">
                    {t("swLeftoverAssist")}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium text-slate-500 normal-case tracking-normal leading-snug">
                    {t("swLeftoverAssistHint")}
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="my-2 border-t border-slate-100" />

          <p className="px-3 pb-1.5 pt-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
            {t("translateHint")}
          </p>
          <button
            type="button"
            onClick={() => applyGoogleTranslate("")}
            className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold transition-colors hover:bg-slate-50 ${
              !gtLang ? "text-primary" : "text-slate-600"
            }`}
          >
            <span>{t("translateOff")}</span>
            {!gtLang && <Check size={14} className="text-primary" aria-hidden="true" />}
          </button>
          {GT_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => applyGoogleTranslate(lang.code)}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-bold transition-colors hover:bg-slate-50 ${
                gtLang === lang.code ? "bg-primary/5 text-primary" : "text-slate-700"
              }`}
            >
              <span>{lang.label}</span>
              {gtLang === lang.code && (
                <Check size={14} className="text-primary" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
