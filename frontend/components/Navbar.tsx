"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X, LogIn, ChevronDown, ChevronUp, Clock, Search, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getMenus, getSettings, resolveImageUrl, getApiCached } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";
import NavLanguageControls from "@/components/NavLanguageControls";
import { LocalizedText, I18nProtect } from "@/components/LocalizedCms";
import Highlight from "@/components/Highlight";
import { Link, usePathname, useRouter } from "@/i18n/routing";

// --- Recursive Desktop Dropdown Component ---
const NavDropdown = ({ items, parent, level = 0, isDark = true }: { items: any[], parent?: any, level?: number, isDark?: boolean }) => {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const featuredArticle = level === 0 && parent?.featuredNews?.length > 0 ? parent.featuredNews[0] : null;

  return (
    <div className={`
      ${level === 0 ? "absolute left-0 mt-4" : "absolute left-full top-0 ml-[1px]"}
      bg-white border border-primary/10 shadow-2xl rounded-md z-[100]
      ${featuredArticle ? "min-w-[480px] flex" : "min-w-[280px]"} py-4
    `}>
      {/* Left: Nav links */}
      <div className={`${featuredArticle ? "flex-1 border-r border-slate-100" : "w-full"}`}>
        {/* Overview Link for Level 0 */}
        {level === 0 && parent && (
          <div className="px-6 py-4 mb-2 bg-slate-50/50 border-b border-slate-100 group/overview">
            <Link
              href={parent.link || `/${parent.slug}`}
              target={parent.target || '_self'}
              className="flex flex-col space-y-1"
            >
              <I18nProtect locale={locale} as="span" className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">{t("institutionalOverview")}</I18nProtect>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-primary-darker group-hover/overview:text-primary transition-colors">
                  <LocalizedText locale={locale} swSource={parent.title_sw}>{parent.title}</LocalizedText>{" "}
                  <I18nProtect locale={locale} as="span" className="lowercase font-serif italic ml-1">{t("landing")}</I18nProtect>
                </span>
                <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center group-hover/overview:bg-primary group-hover/overview:text-white transition-all">
                  <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {items.map((child: any) => (
          <div key={child.id} className="relative group/nested">
            <Link
              href={child.link || `/${child.slug}`}
              target={child.target || '_self'}
              className="flex items-center justify-between px-6 py-3 text-[12px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-slate-50 transition-all"
            >
              <LocalizedText locale={locale} swSource={child.title_sw}>{child.title}</LocalizedText>
              {child.children && child.children.length > 0 && <ChevronRight size={12} className="text-slate-300" />}
            </Link>
            
            {child.children && child.children.length > 0 && (
              <div className="hidden group-hover/nested:block">
                <NavDropdown items={child.children} parent={child} level={level + 1} isDark={isDark} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right: Featured Article Card */}
      {featuredArticle && (
        <div className="w-60 flex-shrink-0 p-5 flex flex-col">
          <I18nProtect locale={locale} as="span" className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-3 block">{t("featured")}</I18nProtect>
          <Link href={`/news/${featuredArticle.slug}`} className="group/card flex flex-col flex-1 space-y-3">
            {featuredArticle.image_url && (
              <div className="aspect-video overflow-hidden bg-slate-100 relative">
                <SafeImage
                  src={resolveImageUrl(featuredArticle.image_url)}
                  alt={featuredArticle.title}
                  fill
                  sizes="240px"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="space-y-2 flex-1">
              <LocalizedText
                locale={locale}
                swSource={featuredArticle.title_sw}
                as="h4"
                className="text-[10px] font-black text-primary-darker leading-tight group-hover/card:text-primary transition-colors line-clamp-3 uppercase tracking-tight"
              >
                {featuredArticle.title}
              </LocalizedText>
              {featuredArticle.content && (
                <LocalizedText
                  locale={locale}
                  swSource={featuredArticle.content_sw}
                  as="p"
                  className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2"
                >
                  {stripHtml(featuredArticle.content).substring(0, 80)}...
                </LocalizedText>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center space-x-1">
              <I18nProtect locale={locale} as="span">{t("readMore")}</I18nProtect>
              <ChevronRight size={10} />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

// --- Recursive Mobile Menu Component ---
const MobileNavItem = ({ item, level = 0, onNavLinkClick }: { item: any, level?: number, onNavLinkClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const hasChildren = item.children && item.children.length > 0;

  // Visual differentiation based on hierarchy level
  const isTopLevel = level === 0;
  
  return (
    <div className={`${isTopLevel ? 'border-b border-slate-100' : ''} last:border-none`}>
      <div className="flex items-center justify-between">
        <Link
          href={item.link || `/${item.slug}`}
          onClick={onNavLinkClick}
          className={`flex-1 py-4 uppercase tracking-tight transition-colors ${
            isTopLevel 
              ? 'text-[clamp(1.1rem,3vw+0.2rem,1.4rem)] font-black text-primary-darker' 
              : 'text-[clamp(0.8rem,2vw+0.1rem,1rem)] font-bold text-slate-500 pl-6'
          } hover:text-primary`}
        >
          <LocalizedText locale={locale} swSource={item.title_sw}>{item.title}</LocalizedText>
        </Link>
        {hasChildren && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`}
          >
            <ChevronDown size={isTopLevel ? 20 : 16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 mb-2"
          >
            {item.children.map((child: any) => (
              <MobileNavItem 
                key={child.id} 
                item={child} 
                level={level + 1} 
                onNavLinkClick={onNavLinkClick} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type NavbarProps = {
  isMaintenanceActive?: boolean;
  initialMenus?: any[];
  initialTopMenus?: any[];
  initialSettings?: Record<string, any>;
};

const Navbar = ({
  isMaintenanceActive = false,
  initialMenus,
  initialTopMenus,
  initialSettings,
}: NavbarProps) => {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState<any[]>(
    Array.isArray(initialMenus) ? initialMenus : [],
  );
  const [topNavLinks, setTopNavLinks] = useState<any[]>(
    Array.isArray(initialTopMenus) ? initialTopMenus : [],
  );
  const [settings, setSettings] = useState<any>({
    cta_apply_url: "/admissions",
    cta_portal_url: "https://my.ouk.ac.ke",
    cta_apply_label: "",
    cta_portal_label: "",
    ...(initialSettings || {}),
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname();
  // Treat empty arrays as a failed/empty hydrate so we can still client-refetch.
  const hasServerMenus =
    Array.isArray(initialMenus) && initialMenus.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const fetchData = async () => {
      if (hasServerMenus) return;
      const [menus, topMenus, siteSettings] = await Promise.all([
        getMenus("header", locale),
        getMenus("top_header", locale),
        getSettings(locale),
      ]);

      if (menus) {
        setNavLinks(Array.isArray(menus) ? menus : menus?.data || []);
      }
      if (topMenus) {
        setTopNavLinks(Array.isArray(topMenus) ? topMenus : topMenus?.data || []);
      }
      if (siteSettings && Object.keys(siteSettings).length > 0) {
        setSettings((prev: any) => ({ ...prev, ...siteSettings }));
      }
    };

    window.addEventListener("scroll", handleScroll);
    fetchData();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [locale, hasServerMenus]);

  // When locale changes under RSC, parent remounts with new props — sync local state.
  useEffect(() => {
    if (!hasServerMenus) return;
    setNavLinks(Array.isArray(initialMenus) ? initialMenus : []);
    setTopNavLinks(Array.isArray(initialTopMenus) ? initialTopMenus : []);
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings((prev: any) => ({ ...prev, ...initialSettings }));
    }
  }, [initialMenus, initialTopMenus, initialSettings, hasServerMenus]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delayFn = setTimeout(() => {
        getApiCached(
          `/search/suggestions?q=${encodeURIComponent(searchQuery)}&locale=${encodeURIComponent(locale)}`,
          { revalidate: 45 },
        ).then(res => {
          setSuggestions(Array.isArray(res) ? res : (res?.data || []));
          setShowSuggestions(true);
        }).catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, locale]);

  const isTransparentPage = pathname === "/" || pathname === "/virtual-tour" || pathname.startsWith("/programmes/") || pathname.startsWith("/news");
  const useDarkTheme = scrolled || !isTransparentPage;

  // Pre-calculate theme-dependent classes
  const navBackgroundClass = useDarkTheme ? "bg-white shadow-xl py-0" : "bg-transparent py-0";
  const mobileToggleClass = (scrolled || pathname.startsWith('/search')) ? "text-primary-darker" : "text-white";
  const portalLinkClass = `inline-flex items-center gap-2 text-[10px] xl:text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${useDarkTheme ? "text-slate-600 hover:text-primary" : "text-white/85 hover:text-white"}`;
  const utilityDivider = useDarkTheme ? "border-slate-200/80" : "border-white/20";

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 font-sans ${navBackgroundClass}`}
      style={{ top: isMaintenanceActive ? '42px' : '0' }}
      id="main-navbar"
    >
      {/* Top utility strip */}
      <div className={`transition-all duration-500 overflow-hidden ${scrolled ? 'h-0 opacity-0' : 'h-auto py-2 lg:py-2 bg-primary opacity-100'}`}>
        <div className="container mx-auto px-4 lg:px-6 flex overflow-x-auto justify-start lg:justify-between items-center gap-6 lg:gap-4 pb-1 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="flex space-x-4 lg:space-x-6 flex-shrink-0 items-center">
            <Link href="/students" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("students")}</Link>
            <Link href="/about/staff" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("facultyStaff")}</Link>
            <Link href="/alumni" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("alumni")}</Link>
            <Link href="/contact" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("contact")}</Link>
            <Link href="/faqs" className="text-primary-darker font-black bg-white px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-[0.1em] hover:bg-secondary hover:text-white transition-all">{t("faqs")}</Link>
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0 pr-2 lg:pr-0">
            <Link href="/tenders" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("tenders")}</Link>
            <Link href="/careers" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("jobs")}</Link>
            <Link href="https://somas.ouk.ac.ke" target="_blank" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">SOMAS</Link>
            <Link href="/news" className="text-white text-[10px] uppercase font-bold tracking-[0.1em] hover:text-white transition-colors">{t("news")}</Link>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 lg:px-6 flex items-center gap-4 xl:gap-8 transition-all duration-500 ${scrolled ? 'py-2.5' : 'py-4'}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group" id="nav-logo">
          {settings.site_logo ? (
            <SafeImage
              src={resolveImageUrl(settings.site_logo)}
              alt={tCommon("logoAlt")}
              width={180}
              height={48}
              className="h-11 xl:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          ) : (
            <SafeImage
              src="/logo.png"
              alt={tCommon("institutionName")}
              width={180}
              height={48}
              className="h-11 xl:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          )}
        </Link>

        {/* Desktop: primary nav + utilities */}
        <div className="hidden lg:flex flex-1 items-center min-w-0">
          <div className="flex flex-1 items-center justify-center xl:justify-start xl:pl-2 min-w-0">
            <div className="flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.id || link.title}
                  className="relative group py-3"
                  onMouseEnter={() => setActiveDropdown(link.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.link || `/${link.slug}`}
                    aria-expanded={link.children?.length > 0 ? activeDropdown === link.id : undefined}
                    aria-haspopup={link.children?.length > 0 ? "menu" : undefined}
                    onKeyDown={(e) => {
                      if (!link.children?.length) return;
                      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveDropdown(activeDropdown === link.id ? null : link.id);
                      }
                      if (e.key === "Escape") setActiveDropdown(null);
                    }}
                    className={`nav-link text-[10px] xl:text-[12px] font-extrabold uppercase tracking-[0.08em] xl:tracking-[0.12em] flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-sm transition-colors ${
                      useDarkTheme ? "text-primary-darker hover:text-primary" : "text-white/90 hover:text-white"
                    } ${(pathname === (link.link || `/${link.slug}`) || (link.link !== '/' && pathname.startsWith(link.link || `/${link.slug}`))) ? (useDarkTheme ? "text-primary" : "text-white") : ""}`}
                  >
                    <LocalizedText locale={locale} swSource={link.title_sw} className="relative z-10">
                      {link.title}
                    </LocalizedText>
                    {link.children && link.children.length > 0 && (
                      <ChevronDown size={13} className="opacity-40 group-hover:rotate-180 transition-transform duration-300" aria-hidden="true" />
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.children && link.children.length > 0 && activeDropdown === link.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      >
                        <NavDropdown items={link.children} parent={link} isDark={useDarkTheme} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex items-center gap-3 xl:gap-4 shrink-0 pl-4 xl:pl-6 ml-2 border-l ${utilityDivider}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative group hidden xl:block"
              role="search"
            >
              <Search
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${
                  useDarkTheme ? "text-slate-400 group-focus-within:text-primary" : "text-white/60 group-focus-within:text-white"
                }`}
                size={12}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder={tCommon("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                aria-label={tCommon("searchAria")}
                className={`border text-[10px] font-bold pl-7 pr-3 py-1.5 w-32 focus:w-44 outline-none transition-all rounded-md ${
                  useDarkTheme
                    ? "bg-slate-50 border-slate-200 text-primary-darker placeholder:text-slate-400 focus:border-primary/40"
                    : "bg-white/15 border-white/20 text-white placeholder-white/50 focus:bg-white/25 focus:border-white/40"
                }`}
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl border border-slate-100 overflow-hidden z-[110]"
                  >
                    {suggestions.map((s, idx) => (
                      <Link
                        key={idx}
                        href={s.href}
                        className="flex flex-col px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-none"
                      >
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                          <Highlight text={s.label} query={searchQuery} quiet />
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">
                          {({
                            programme: t("typeProgramme"),
                            short_course: t("typeShortCourse"),
                            news: t("typeNews"),
                            page: t("typePage"),
                            staff: t("typeStaff"),
                            Programme: t("typeProgramme"),
                            "Short Course": t("typeShortCourse"),
                            News: t("typeNews"),
                            Page: t("typePage"),
                            Staff: t("typeStaff"),
                          } as Record<string, string>)[s.type] || s.type}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="block w-full text-center py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
                    >
                      {t("viewAllResults")}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <Link
              href={settings.cta_portal_url || "https://my.ouk.ac.ke"}
              target="_blank"
              rel="noopener noreferrer"
              className={portalLinkClass}
            >
              <LogIn size={15} />
              <span>{settings.cta_portal_label || t("portal")}</span>
            </Link>
            <Link
              href={settings.cta_apply_url || "/admissions"}
              className="btn-primary text-[10px] xl:text-xs tracking-[0.14em] uppercase py-2.5 xl:py-3 px-4 xl:px-5 shadow-lg shadow-primary/15"
            >
              {settings.cta_apply_label || t("applyNow")}
            </Link>

            {/* Last utility: site language + optional GT */}
            <NavLanguageControls onDark={!useDarkTheme} />
          </div>
        </div>

        {/* Mobile: menu toggle; full Translate lives last in the drawer */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <button
            id="mobile-menu-toggle"
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-dialog"
            className={`p-2 transition-colors ${mobileToggleClass}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={t("siteNav")}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[1000] lg:hidden flex flex-col p-8 overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-black text-2xl text-primary-darker">{t("menu")}</span>
              <button
                aria-label={t("closeMenu")}
                onClick={() => setIsOpen(false)}
                className="text-primary-darker"
              >
                <X size={32} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setIsOpen(false);
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative mb-6"
              role="search"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder={tCommon("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={tCommon("searchAria")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-primary-darker placeholder:text-slate-400 py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:border-primary/40"
              />
            </form>

            <div className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <MobileNavItem 
                  key={link.id} 
                  item={link} 
                  onNavLinkClick={() => setIsOpen(false)} 
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-8">
              <Link
                href={settings.cta_portal_url || "https://my.ouk.ac.ke"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600"
              >
                <LogIn size={16} />
                <span>{settings.cta_portal_label || t("portal")}</span>
              </Link>
              <Link
                href={settings.cta_apply_url || "/admissions"}
                onClick={() => setIsOpen(false)}
                className="btn-primary text-center text-xs tracking-widest uppercase py-4"
              >
                {settings.cta_apply_label || t("applyNow")}
              </Link>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <NavLanguageControls stacked />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
