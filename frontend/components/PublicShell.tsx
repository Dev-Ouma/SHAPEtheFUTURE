"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { I18nProtect } from "@/components/LocalizedCms";
import ShapeSiteHeader from "@/components/shape/ShapeSiteHeader";
import ShapeFooter from "@/components/shape/ShapeFooter";
import CookieConsent from "@/components/CookieConsent";
import PublicGoogleTranslate from "@/components/PublicGoogleTranslate";
import { SearchHighlightProvider } from "@/components/SearchHighlightProvider";

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
          <div className="bg-yellow-500 text-yellow-950 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] fixed top-0 w-full z-[70] flex items-center justify-center space-x-3 shadow-lg">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-900"></span>
            </span>
            <I18nProtect locale={locale} as="span" className="leading-none">
              {t("maintenanceBanner")}
            </I18nProtect>
          </div>
        )}
        <ShapeSiteHeader isMaintenanceActive={!!maintenance} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-primary font-bold"
        >
          {t("skipToContent")}
        </a>
        <main
          id="main-content"
          className={`flex-grow transition-all duration-500 ${maintenance ? "pt-[42px]" : ""}`}
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
        <CookieConsent />
        <PublicGoogleTranslate />
      </div>
    </SearchHighlightProvider>
  );
}
