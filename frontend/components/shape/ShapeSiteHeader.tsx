"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { SHAPE_NAV_LINKS } from "@/lib/shape-api";
import NavLanguageControls from "@/components/NavLanguageControls";
import ShapeSiteSearch from "@/components/shape/ShapeSiteSearch";

type Props = {
  isMaintenanceActive?: boolean;
};

const PRIMARY = SHAPE_NAV_LINKS.slice(0, 7);
const MORE = SHAPE_NAV_LINKS.slice(7);

export default function ShapeSiteHeader({ isMaintenanceActive = false }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  const linkClass = (href: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return `text-[10px] xl:text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${
      solid
        ? active
          ? "text-primary"
          : "text-primary-darker hover:text-primary"
        : active
          ? "text-secondary"
          : "text-white/90 hover:text-white"
    }`;
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        solid ? "bg-white shadow-lg" : "bg-transparent"
      }`}
      style={{ top: isMaintenanceActive ? 42 : 0 }}
      id="main-navbar"
    >
      <div
        className={`transition-all duration-500 overflow-hidden ${
          scrolled ? "h-0 opacity-0" : "h-auto opacity-100"
        } bg-primary`}
      >
        <div className="container mx-auto px-4 lg:px-6 py-2 flex items-center justify-between gap-4 text-white text-[10px] font-black uppercase tracking-[0.2em]">
          <span>Erasmus+ · Co-funded by the European Union</span>
          <span className="hidden sm:inline text-white/80">shape.ouk.ac.ke</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 flex items-center gap-4 py-3.5">
        <Link href="/" className="shrink-0 group">
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

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2 min-w-0">
          {PRIMARY.map((link) => (
            <Link key={link.href} href={link.href} className={`nav-link px-2 py-2 ${linkClass(link.href)}`}>
              {link.title}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`nav-link px-2 py-2 inline-flex items-center gap-1 ${linkClass("/documents")}`}
              aria-expanded={moreOpen}
            >
              More <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 min-w-[200px] bg-white border border-slate-100 shadow-xl py-2 z-50"
                >
                  {MORE.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-primary hover:bg-slate-50"
                    >
                      {link.title}
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
            Progress
          </Link>
        </div>

        <div className="lg:hidden ml-auto flex items-center gap-1">
          <ShapeSiteSearch onDark={!solid} />
          <button
            type="button"
            className={`p-2 ${solid ? "text-primary-darker" : "text-white"}`}
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-primary-darker/95 text-white lg:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="font-serif text-2xl font-black">SHAPE</span>
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-72px)] px-6 py-6 space-y-1">
              <ShapeSiteSearch mobile />
              {SHAPE_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 text-sm font-black uppercase tracking-widest border-b border-white/10 hover:text-secondary"
                >
                  {link.title}
                </Link>
              ))}
              <div className="pt-6">
                <NavLanguageControls onDark stacked />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
