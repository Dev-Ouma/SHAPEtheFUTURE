"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { SHAPE_NAV_LINKS } from "@/lib/shape-api";
import NavLanguageControls from "@/components/NavLanguageControls";
import ShapeSiteSearch from "@/components/shape/ShapeSiteSearch";

type Props = {
  isMaintenanceActive?: boolean;
};

// Primary bar keeps the six top-level destinations; everything else (starting
// with Documents) lives under the "More" dropdown for a cleaner nav.
const PRIMARY = SHAPE_NAV_LINKS.slice(0, 6);
const MORE = SHAPE_NAV_LINKS.slice(6);

export default function ShapeSiteHeader({ isMaintenanceActive = false }: Props) {
  const t = useTranslations("Shape.nav");
  const tc = useTranslations("Shape.chrome");
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => mobileCloseRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  const navClass = (active: boolean) =>
    `text-[10px] xl:text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${
      solid
        ? active
          ? "text-primary"
          : "text-primary-darker hover:text-primary"
        : active
          ? "text-secondary"
          : "text-white/90 hover:text-white"
    }`;

  const linkClass = (href: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return navClass(active);
  };

  const label = (key: (typeof SHAPE_NAV_LINKS)[number]["titleKey"]) => t(key);

  // Highlight the "More" trigger whenever any of its nested destinations is open.
  const moreActive = MORE.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`),
  );

  return (
    <header
      className={`fixed w-full z-[100] transition-all duration-500 ${
        solid
          ? "bg-white/95 shadow-lg backdrop-blur-md border-b border-slate-200/80"
          : "bg-gradient-to-b from-black/55 via-black/30 to-transparent backdrop-blur-[6px] border-b border-white/10"
      }`}
      style={{ top: isMaintenanceActive ? 42 : 0 }}
      id="main-navbar"
    >
      <div
        className={`transition-all duration-500 overflow-hidden ${
          scrolled ? "h-0 opacity-0" : "h-auto opacity-100"
        } bg-primary`}
        aria-hidden={scrolled}
      >
        <div className="container mx-auto px-4 lg:px-6 py-2 flex items-center justify-between gap-4 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          <span>{tc("erasmusBanner")}</span>
          <span className="hidden sm:inline text-white/80">shape.ouk.ac.ke</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 flex items-center gap-4 py-3.5">
        <Link
          href="/"
          className="shrink-0 group flex items-center gap-2.5 md:gap-3"
          aria-label={t("homeAria")}
        >
          <span
            className={`flex items-center rounded-md px-1.5 py-1 transition-colors ${
              solid ? "" : "bg-white/95 shadow-sm"
            }`}
          >
            <Image
              src="/images/OUK-EnhancedLogo.png"
              alt="Open University of Kenya"
              width={1080}
              height={594}
              priority
              className="h-9 md:h-10 w-auto"
            />
          </span>
          <span
            className={`h-8 w-px ${solid ? "bg-slate-300" : "bg-white/30"}`}
            aria-hidden
          />
          <div className="flex items-baseline gap-2">
            <span
              className={`font-serif text-2xl md:text-3xl font-black tracking-tight leading-none ${
                solid ? "text-primary-darker" : "text-white"
              }`}
            >
              SHAPE
            </span>
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.25em] text-secondary">
              Erasmus+
            </span>
          </div>
        </Link>

        <nav
          className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2 min-w-0"
          aria-label={t("primary")}
        >
          {PRIMARY.map((link) => (
            <Link key={link.href} href={link.href} className={`nav-link px-2 py-2 ${linkClass(link.href)}`}>
              {label(link.titleKey)}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`nav-link px-2 py-2 inline-flex items-center gap-1 ${navClass(moreActive)}`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-controls="nav-more-menu"
              id="nav-more-button"
            >
              {t("more")} <ChevronDown size={12} aria-hidden />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  id="nav-more-menu"
                  role="menu"
                  aria-labelledby="nav-more-button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 min-w-[200px] bg-white border border-slate-100 shadow-xl py-2 z-[110]"
                >
                  {MORE.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="block px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-primary hover:bg-slate-50"
                    >
                      {label(link.titleKey)}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <ShapeSiteSearch onDark={!solid} />
          <NavLanguageControls onDark={!solid} />
          <Link
            href="/dashboard"
            className="bg-secondary text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
          >
            {t("progress")}
          </Link>
        </div>

        <div className="lg:hidden ml-auto flex items-center gap-1">
          <ShapeSiteSearch onDark={!solid} />
          <button
            ref={menuButtonRef}
            type="button"
            className={`p-2 ${solid ? "text-primary-darker" : "text-white"}`}
            aria-label={t("openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-dialog"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t("mobile")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-primary-darker/95 text-white lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="font-serif text-2xl font-black">SHAPE</span>
              <button
                ref={mobileCloseRef}
                type="button"
                aria-label={t("closeMenu")}
                onClick={() => {
                  setMobileOpen(false);
                  menuButtonRef.current?.focus();
                }}
              >
                <X size={24} aria-hidden />
              </button>
            </div>
            <nav className="overflow-y-auto h-[calc(100%-72px)] px-6 py-6 space-y-1" aria-label={t("mobile")}>
              <ShapeSiteSearch mobile />
              {SHAPE_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-sm font-black uppercase tracking-widest border-b border-white/10 hover:text-secondary"
                >
                  {label(link.titleKey)}
                </Link>
              ))}
              <div className="pt-6">
                <NavLanguageControls onDark stacked />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
