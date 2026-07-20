"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A thin top-of-page progress bar shown during route transitions — the App
 * Router has no built-in "navigation started" event (unlike the old Pages
 * Router), so the start is detected by intercepting clicks on same-origin
 * links site-wide, and the end by watching for the pathname to actually
 * change. Without this, a slow route (e.g. a dev-mode first-visit compile)
 * looks identical to a broken click: the old page just sits there.
 */
export default function RouteProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const currentPath = useRef(pathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Note: next/link always calls preventDefault() itself to do client-side
      // routing, so e.defaultPrevented is already true for exactly the clicks
      // we need to detect here — it must not be used as an exclusion guard.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === currentPath.current) return;
      setLoading(true);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    currentPath.current = pathname;
    setLoading(false);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="route-progress-bar"
          className="fixed top-0 left-0 right-0 z-[10000] h-[3px] bg-gradient-to-r from-primary via-secondary to-primary pointer-events-none"
          style={{ transformOrigin: "left" }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.8, transition: { duration: 4, ease: "easeOut" } }}
          exit={{ scaleX: 1, opacity: 0, transition: { scaleX: { duration: 0.15 }, opacity: { duration: 0.3, delay: 0.15 } } }}
        />
      )}
    </AnimatePresence>
  );
}
