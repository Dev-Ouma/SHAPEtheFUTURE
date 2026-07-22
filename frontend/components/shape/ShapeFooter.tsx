"use client";

import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SHAPE_NAV_LINKS } from "@/lib/shape-api";
import EuFundingBadge from "@/components/shape/EuFundingBadge";

type Props = {
  contactEmail?: string;
  blurb?: string;
};

export default function ShapeFooter({
  contactEmail = "shape@ouk.ac.ke",
  blurb,
}: Props) {
  const t = useTranslations("Shape");
  const year = new Date().getFullYear();
  const quick = SHAPE_NAV_LINKS.filter((l) =>
    ["/the-project", "/partners", "/work-packages", "/dashboard", "/documents", "/events", "/contact"].includes(
      l.href,
    ),
  );
  const explore = [
    { titleKey: "map" as const, href: "/map" },
    { titleKey: "media" as const, href: "/media" },
    { titleKey: "gallery" as const, href: "/gallery" },
    { titleKey: "sdlc" as const, href: "/sdlc" },
    { titleKey: "monitoring" as const, href: "/monitoring" },
    { titleKey: "news" as const, href: "/news" },
  ];

  return (
    <footer className="bg-primary-darker text-white border-t border-white/5" id="main-footer">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div className="space-y-5 lg:col-span-1">
            <div>
              <p className="font-serif text-3xl font-black tracking-tight">SHAPE</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mt-2">
                Erasmus+ · OUK
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {blurb || t("chrome.footerBlurb")}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">{t("chrome.euDisclaimer")}</p>
            <EuFundingBadge variant="dark" className="bg-primary-darker/40 border-white/15" />
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              {t("chrome.quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quick.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-300 hover:text-secondary transition-colors"
                  >
                    {t(`nav.${l.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              {t("chrome.coordinator")}
            </h4>
            <p className="text-sm font-bold text-white mb-4">{t("chrome.ouk")}</p>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{t("chrome.oukAddress")}</span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <a href={`mailto:${contactEmail}`} className="hover:text-white">
                  {contactEmail}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <span>+254 20 2311438</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              {t("chrome.explore")}
            </h4>
            <ul className="space-y-3">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-300 hover:text-secondary transition-colors"
                  >
                    {t(`nav.${l.titleKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500">
          <p>{t("chrome.rights", { year })}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-widest font-bold text-[10px]">
            <Link href="/accessibility" className="hover:text-secondary transition-colors">
              {t("chrome.accessibility")}
            </Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">
              {t("chrome.privacy")}
            </Link>
            <Link href="/privacy-center" className="hover:text-secondary transition-colors">
              {t("chrome.cookies")}
            </Link>
            <span>{t("chrome.cofunded")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
