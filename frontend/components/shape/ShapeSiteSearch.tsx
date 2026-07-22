"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { getApi } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

type Suggestion = { type: string; label: string; href: string };

type Props = {
  onDark?: boolean;
  mobile?: boolean;
};

export default function ShapeSiteSearch({ onDark = false, mobile = false }: Props) {
  const t = useTranslations("Shape.search");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const debounced = useDebounce(query, 250);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getApi(
          `/search/suggestions?q=${encodeURIComponent(debounced.trim())}&locale=${locale}`,
        );
        if (!cancelled) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, locale]);

  const goSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (term.length < 2) return;
    setOpen(false);
    setQuery("");
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  if (mobile && !open) {
    return (
      <button
        type="button"
        aria-label={t("button")}
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 py-3 text-sm font-black uppercase tracking-widest border-b border-white/10 hover:text-secondary"
      >
        <Search size={16} /> {t("button")}
      </button>
    );
  }

  return (
    <>
      {!mobile ? (
        <button
          type="button"
          aria-label={t("aria")}
          onClick={() => setOpen(true)}
          className={`p-2 transition-colors ${
            onDark
              ? "text-white/90 hover:text-white"
              : "text-primary-darker hover:text-primary"
          }`}
        >
          <Search size={18} />
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-primary-darker/70 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 pt-24 md:pt-28" ref={panelRef}>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white border border-slate-200 shadow-2xl max-w-2xl mx-auto overflow-hidden"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    goSearch();
                  }}
                  className="flex items-center gap-3 px-4 py-4 border-b border-slate-100"
                >
                  {loading ? (
                    <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                  ) : (
                    <Search size={18} className="text-primary shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("placeholder")}
                    className="flex-1 bg-transparent outline-none text-sm text-primary-darker placeholder:text-slate-400"
                    aria-label={t("query")}
                  />
                  <button
                    type="button"
                    aria-label={t("close")}
                    onClick={() => setOpen(false)}
                    className="p-1 text-slate-400 hover:text-primary-darker"
                  >
                    <X size={18} />
                  </button>
                </form>

                {suggestions.length > 0 ? (
                  <ul className="max-h-[50vh] overflow-y-auto">
                    {suggestions.map((s) => (
                      <li key={`${s.type}-${s.href}-${s.label}`}>
                        <Link
                          href={s.href}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                          className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <span className="text-sm font-semibold text-primary-darker truncate">
                            {s.label}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-secondary shrink-0">
                            {s.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : query.trim().length >= 2 && !loading ? (
                  <p className="px-5 py-8 text-center text-xs text-slate-500">
                    {t("noResults")}
                  </p>
                ) : (
                  <p className="px-5 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                    Tip: ⌘K / Ctrl+K
                  </p>
                )}

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    SHAPE
                  </span>
                  <button
                    type="button"
                    onClick={() => goSearch()}
                    disabled={query.trim().length < 2}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary disabled:opacity-40"
                  >
                    {t("viewAll")} →
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
