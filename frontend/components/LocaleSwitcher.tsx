"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { clearGoogTransCookies, readGoogTransTarget } from "@/lib/googtrans";

function hrefForLocale(pathname: string, next: "en" | "sw") {
  const path = !pathname || pathname === "/" ? "" : pathname;
  return next === "en" ? path || "/" : `/sw${path}`;
}

export default function LocaleSwitcher({
  className = "",
  compact = false,
  /** When true, styles for use on a dark/transparent header (white text). */
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    if (next === locale) return;
    const nextLocale = next as "en" | "sw";
    const hadMachineTranslate = Boolean(
      readGoogTransTarget() && readGoogTransTarget() !== "en",
    );

    // Keep EN/SW on real i18n HTML — clear any opt-in machine translation.
    clearGoogTransCookies();

    // Match nav Translate control: hard-load SW (and any GT exit) for a clean DOM.
    if (hadMachineTranslate || nextLocale === "sw") {
      window.location.assign(hrefForLocale(pathname, nextLocale));
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div
      className={`notranslate ${className}`.trim()}
      role="group"
      aria-label={t("language")}
      translate="no"
    >
      {!compact && (
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-2">
          {t("language")}
        </span>
      )}
      <div className="inline-flex items-center gap-1">
        {routing.locales.map((code) => {
          const active = locale === code;
          let btnClass =
            "px-2 py-1 text-[9px] font-black uppercase tracking-widest transition-colors border ";
          if (compact && onDark) {
            btnClass += active
              ? "bg-white text-primary border-white"
              : "text-white/80 border-white/20 hover:border-white/50 hover:text-white";
          } else if (compact) {
            btnClass += active
              ? "bg-primary text-white border-primary"
              : "text-slate-500 border-slate-200 hover:text-primary hover:border-primary/40";
          } else {
            btnClass += active
              ? "bg-primary text-white border-primary"
              : "text-slate-500 border-slate-200 hover:text-primary hover:border-primary/40";
          }
          return (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className={btnClass}
              aria-pressed={active}
            >
              {code === "en"
                ? compact
                  ? t("localeEn")
                  : t("english")
                : compact
                  ? t("localeSw")
                  : t("swahili")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
