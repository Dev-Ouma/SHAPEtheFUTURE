"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { I18nProtect } from "@/components/LocalizedCms";
import ShapeSiteHeader from "@/components/shape/ShapeSiteHeader";
import ShapeFooter from "@/components/shape/ShapeFooter";
import CookieConsent from "@/components/CookieConsent";
import PublicGoogleTranslate from "@/components/PublicGoogleTranslate";
import { SearchHighlightProvider } from "@/components/SearchHighlightProvider";
import AccessibilityWidget from "@/components/accessibility/AccessibilityWidget";

type PublicShellProps = {
  children: React.ReactNode;
  headerMenus: any[];
  topMenus: any[];
  footerMenus: any[];
  settings: Record<string, any>;
  backlinks: any[];
  maintenanceInitial?: { mode?: string } | null;
};

export default function PublicShell({
  children,
  settings = {},
  maintenanceInitial = null,
}: PublicShellProps) {
  const t = useTranslations("Common");
  const locale = useLocale();

  const [maintenance, setMaintenance] = React.useState<any>(
    maintenanceInitial?.mode === "PARTIAL" ? maintenanceInitial : null,
  );

  React.useEffect(() => {
    setMaintenance(
      maintenanceInitial?.mode === "PARTIAL" ? maintenanceInitial : null,
    );
  }, [maintenanceInitial]);

  return (
    <SearchHighlightProvider relatedTermsJson={settings?.search_related_terms_json}>
      <div className="flex flex-col min-h-screen">
        {maintenance && (
          <div
            role="status"
            className="bg-yellow-500 text-yellow-950 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] fixed top-0 w-full z-[70] flex items-center justify-center space-x-3 shadow-lg"
          >
            <span className="flex h-2.5 w-2.5 relative" aria-hidden>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-900"></span>
            </span>
            <I18nProtect locale={locale} as="span" className="leading-none">
              {t("maintenanceBanner")}
            </I18nProtect>
          </div>
        )}

        <nav className="a11y-skip-group" aria-label="Skip links">
          <a href="#main-content">{t("skipToContent")}</a>
          <a href="#main-navbar">Skip to navigation</a>
          <a href="#main-footer">Skip to footer</a>
          <a href="#a11y-launcher">Skip to accessibility settings</a>
        </nav>

        <ShapeSiteHeader isMaintenanceActive={!!maintenance} />
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-grow transition-all duration-500 outline-none ${maintenance ? "pt-[42px]" : ""}`}
        >
          {children}
        </main>
        <ShapeFooter
          contactEmail={settings?.contact_email || "shape@ouk.ac.ke"}
          blurb={
            settings?.site_tagline
              ? `${settings.site_tagline} — a three-year Erasmus+ partnership across East Africa and Europe.`
              : undefined
          }
        />
        <div id="a11y-launcher">
          <AccessibilityWidget />
        </div>
        <CookieConsent />
        <PublicGoogleTranslate />
      </div>
    </SearchHighlightProvider>
  );
}
