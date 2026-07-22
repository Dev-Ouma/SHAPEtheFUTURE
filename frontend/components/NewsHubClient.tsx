"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  ChevronRight,
  ArrowLeft,
  ArrowUpRight,
  Newspaper,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import SafeImage from "@/components/ui/SafeImage";
import SocialFeed from "./SocialFeed";
import Highlight from "@/components/Highlight";
import NewsSearchVisuals from "@/components/NewsSearchVisuals";
import { matchSnippet } from "@/lib/searchHighlight";
import { useRelatedTerms } from "@/components/SearchHighlightProvider";
import { NEWS_HUB_DEFAULTS } from "@/lib/shape-api";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: string;
  created_at: string;
  image_url?: string;
}

export type NewsHubCms = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  searchHint: string;
  tickerLabel: string;
  imageTablet: string;
  imageOrb: string;
  imageCards: string;
};

interface NewsHubClientProps {
  initialNews: NewsItem[];
  totalPages: number;
  currentPage: number;
  total: number;
  categories: string[];
  cms?: Partial<NewsHubCms>;
}

const ease = [0.22, 1, 0.36, 1] as const;

function excerpt(
  item: NewsItem,
  query = "",
  len = 180,
  relatedMap?: Parameters<typeof matchSnippet>[3],
) {
  const raw = item.summary || stripHtml(item.content || "");
  if (query.trim()) return matchSnippet(raw, query, Math.floor(len / 2), relatedMap);
  return raw.length > len ? `${raw.slice(0, len).trim()}…` : raw;
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const NewsHubClient: React.FC<NewsHubClientProps> = ({
  initialNews,
  totalPages,
  currentPage,
  total,
  categories: availableCategories,
  cms = {},
}) => {
  const t = useTranslations("News");
  const router = useRouter();
  const searchParams = useSearchParams();
  const relatedMap = useRelatedTerms();
  const allUpdatesLabel = t("allUpdates");

  const hub = {
    eyebrow: cms.eyebrow || NEWS_HUB_DEFAULTS.news_hub_eyebrow,
    title: cms.title || NEWS_HUB_DEFAULTS.news_hub_title,
    titleAccent: cms.titleAccent || NEWS_HUB_DEFAULTS.news_hub_title_accent,
    subtitle: cms.subtitle || NEWS_HUB_DEFAULTS.news_hub_subtitle,
    searchHint: cms.searchHint || NEWS_HUB_DEFAULTS.news_hub_search_hint,
    tickerLabel: cms.tickerLabel || NEWS_HUB_DEFAULTS.news_hub_ticker_label,
    imageTablet: cms.imageTablet || NEWS_HUB_DEFAULTS.news_hub_image_tablet,
    imageOrb: cms.imageOrb || NEWS_HUB_DEFAULTS.news_hub_image_orb,
    imageCards: cms.imageCards || NEWS_HUB_DEFAULTS.news_hub_image_cards,
  };

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const activeCategory = searchParams.get("category") || allUpdatesLabel;
  const categories = [allUpdatesLabel, ...availableCategories];

  const updateFilters = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(newFilters).forEach((key) => {
      if (
        newFilters[key] === null ||
        newFilters[key] === allUpdatesLabel ||
        newFilters[key] === "All Updates" ||
        newFilters[key] === ""
      ) {
        params.delete(key);
      } else {
        params.set(key, newFilters[key]);
      }
    });
    if (!newFilters.page) params.set("page", "1");
    router.push(`/news?${params.toString()}`);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    params.set("page", "1");
    if (params.get("q") !== searchParams.get("q")) {
      router.push(`/news?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const featured = initialNews[0];
  const rest = initialNews.slice(1);
  const activeQuery = (searchParams.get("q") || searchQuery || "").trim();
  const isSearching = activeQuery.length > 0;
  const tickerItems = useMemo(
    () => (initialNews.length ? initialNews : []).slice(0, 8),
    [initialNews],
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#013d48] via-[#025a69] to-[#037b90] pt-40 pb-24 md:pt-48 md:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-secondary/25 blur-3xl"
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <NewsSearchVisuals
            searching={isSearching}
            assets={{
              tablet: hub.imageTablet,
              orb: hub.imageOrb,
              cards: hub.imageCards,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-secondary text-[11px] font-black tracking-[0.45em] uppercase mb-5"
              >
                {hub.eyebrow}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
                className="font-serif text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-[0.9]"
              >
                {hub.title}{" "}
                <span className="text-secondary">{hub.titleAccent}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease }}
                className="mt-5 text-white/70 max-w-xl leading-relaxed"
              >
                {isSearching
                  ? hub.searchHint.replace(/\{query\}/gi, activeQuery)
                  : hub.subtitle}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease }}
              className="w-full lg:w-[24rem] relative z-20"
            >
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
                size={18}
              />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-white/40 pl-14 pr-5 py-4 outline-none focus:bg-white/15 focus:border-secondary/60 transition-all text-sm backdrop-blur-sm"
              />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Noticeboard ticker */}
      {tickerItems.length > 0 ? (
        <div className="border-b border-slate-200 bg-slate-50 overflow-hidden">
          <div className="container mx-auto px-6 py-3 flex items-center gap-4">
            <span className="shrink-0 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {hub.tickerLabel}
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10" />
              <motion.div
                className="flex gap-10 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <Link
                    key={`${item.id}-${i}`}
                    href={`/news/${item.slug}`}
                    className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 hover:text-primary transition-colors"
                  >
                    <span className="text-primary mr-2">{item.category || "News"}</span>
                    {item.title}
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      ) : null}

      <SocialFeed />

      <main className="container mx-auto px-6 py-16 md:py-20">
        {/* Category chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => updateFilters({ category })}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  active
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-primary-darker"
                }`}
              >
                {category}
              </button>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14">
          <div className="lg:col-span-8 space-y-10">
            <AnimatePresence mode="wait">
              {initialNews.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center border border-dashed border-slate-200"
                >
                  <Newspaper className="mx-auto text-slate-300 mb-4" size={40} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                    {t("empty")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateFilters({ category: allUpdatesLabel, q: "" });
                    }}
                    className="mt-4 text-primary font-black uppercase tracking-widest text-xs"
                  >
                    {t("clearSelection")}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${activeCategory}-${currentPage}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  {/* Featured lead */}
                  {featured ? (
                    <motion.article
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, ease }}
                      className="group relative overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <div className="grid md:grid-cols-2">
                        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-primary-darker overflow-hidden">
                          {featured.image_url ? (
                            <SafeImage
                              src={resolveImageUrl(featured.image_url)}
                              alt={featured.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary to-secondary/40">
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center p-8"
                                style={{ perspective: "900px" }}
                                animate={{ rotateY: [-6, 6, -6], y: [0, -8, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    isSearching
                                      ? resolveImageUrl(hub.imageOrb) || hub.imageOrb
                                      : resolveImageUrl(hub.imageTablet) || hub.imageTablet
                                  }
                                  alt=""
                                  className="w-[78%] max-w-sm drop-shadow-2xl object-contain"
                                />
                              </motion.div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <span className="absolute top-5 left-5 bg-secondary text-white text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5">
                            {featured.category || "Featured"}
                          </span>
                        </div>
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                            <Calendar size={12} className="text-secondary" />
                            {formatDate(featured.created_at)}
                          </div>
                          <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
                            <Link href={`/news/${featured.slug}`}>
                              <Highlight text={featured.title} query={activeQuery} />
                            </Link>
                          </h2>
                          <p className="mt-4 text-slate-600 leading-relaxed normal-case tracking-normal">
                            <Highlight text={excerpt(featured, activeQuery, 220, relatedMap)} query={activeQuery} />
                          </p>
                          <Link
                            href={`/news/${featured.slug}`}
                            className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary"
                          >
                            {t("inDepth")}
                            <ArrowUpRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ) : null}

                  {/* Story list */}
                  <div className="space-y-0">
                    {rest.map((item, index) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{
                          duration: 0.5,
                          delay: Math.min(index * 0.07, 0.35),
                          ease,
                        }}
                        className="group grid grid-cols-[3.5rem_1fr] md:grid-cols-[4.5rem_1fr] gap-4 md:gap-6 py-7 border-t border-slate-200 last:border-b"
                      >
                        <div className="pt-1">
                          <span className="font-serif text-2xl md:text-3xl font-black text-primary/70 tabular-nums leading-none group-hover:text-secondary transition-colors">
                            {String(index + 2).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="relative pl-4 md:pl-5">
                          <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary scale-y-0 origin-top transition-transform duration-500 group-hover:scale-y-100" />
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            <span className="text-secondary">{item.category || "News"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar size={11} />
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <h3 className="font-serif text-xl md:text-2xl font-black text-primary-darker uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/news/${item.slug}`}>
                              <Highlight text={item.title} query={activeQuery} />
                            </Link>
                          </h3>
                          <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2 normal-case tracking-normal">
                            <Highlight text={excerpt(item, activeQuery, 180, relatedMap)} query={activeQuery} />
                          </p>
                          <Link
                            href={`/news/${item.slug}`}
                            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary opacity-80 group-hover:opacity-100"
                          >
                            {t("inDepth")}
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {t("showingOf", { shown: initialNews.length, total })}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateFilters({ page: Math.max(1, currentPage - 1) })}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30"
                        >
                          <ArrowLeft size={16} />
                          {t("previous")}
                        </button>
                        <span className="text-xs font-black text-primary-darker">
                          {t("pageOf", { page: currentPage, total: totalPages })}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateFilters({ page: Math.min(totalPages, currentPage + 1) })
                          }
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary disabled:opacity-30"
                        >
                          {t("next")}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease }}
              className="border border-slate-200 p-7 bg-gradient-to-br from-slate-50 to-white"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-6">
                {t("insights")}
              </p>
              <div className="space-y-4">
                {initialNews.slice(0, 4).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease }}
                  >
                    <Link
                      href={`/news/${item.slug}`}
                      className="block group border-l-2 border-transparent hover:border-secondary pl-4 transition-colors"
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                      <h4 className="mt-1 font-serif font-black text-primary-darker uppercase tracking-tight leading-snug group-hover:text-primary transition-colors">
                        <Highlight text={item.title} query={activeQuery} />
                      </h4>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
              className="relative overflow-hidden bg-primary p-8 text-white"
            >
              <motion.div
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-secondary/30"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <h4 className="relative z-10 font-serif text-2xl font-black uppercase tracking-tight mb-4">
                {t("institutionalSubmissions")}
              </h4>
              <p className="relative z-10 text-sm text-white/80 leading-relaxed mb-8">
                {t("submissionsBody")}
              </p>
              <Link
                href="/contact"
                className="relative z-10 inline-flex w-full items-center justify-center bg-white text-primary py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-primary-darker hover:text-white transition-colors"
              >
                {t("submitSpotlight")}
              </Link>
            </motion.div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsHubClient;
