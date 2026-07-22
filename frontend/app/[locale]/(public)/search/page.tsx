"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Search as SearchIcon,
  Handshake,
  FolderKanban,
  Calendar,
  FileText,
  Newspaper,
  Layers,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { getApi } from "@/lib/api";
import ShapePageHero from "@/components/shape/ShapePageHero";
import Highlight from "@/components/Highlight";
import { SHAPE_NAV_LINKS } from "@/lib/shape-api";

type Filter =
  | "all"
  | "partners"
  | "workPackages"
  | "events"
  | "documents"
  | "news"
  | "activities"
  | "sdlcStages"
  | "pages";

type ResultItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  type: Filter;
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "partners", label: "Partners" },
  { key: "workPackages", label: "Work packages" },
  { key: "events", label: "Events" },
  { key: "documents", label: "Documents" },
  { key: "news", label: "News" },
  { key: "activities", label: "Activities" },
  { key: "sdlcStages", label: "SDLC" },
  { key: "pages", label: "Pages" },
];

function TypeIcon({ type }: { type: Filter }) {
  const cls = "text-primary shrink-0";
  switch (type) {
    case "partners":
      return <Handshake size={16} className={cls} />;
    case "workPackages":
      return <FolderKanban size={16} className={cls} />;
    case "events":
      return <Calendar size={16} className={cls} />;
    case "documents":
      return <FileText size={16} className={cls} />;
    case "news":
      return <Newspaper size={16} className={cls} />;
    case "sdlcStages":
      return <Layers size={16} className={cls} />;
    case "activities":
      return <Clock size={16} className={cls} />;
    default:
      return <SearchIcon size={16} className={cls} />;
  }
}

function ShapeSearchInner() {
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") || "";

  const [input, setInput] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [facets, setFacets] = useState<Record<string, number>>({});

  useEffect(() => {
    setInput(initial);
    setQuery(initial);
  }, [initial]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setData({});
      setFacets({});
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getApi(
          `/search?q=${encodeURIComponent(query.trim())}&locale=${locale}`,
        );
        if (!cancelled) {
          setData(res || {});
          setFacets(res?.facets || {});
        }
      } catch {
        if (!cancelled) {
          setData({});
          setFacets({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, locale]);

  const staticPages: ResultItem[] = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const labels: Record<string, string> = {
      home: "Home",
      theProject: "The Project",
      partners: "Partners",
      workPackages: "Work Packages",
      workplan: "Workplan",
      events: "Events",
      dashboard: "Dashboard",
      documents: "Documents",
      news: "News",
      sdlc: "SDLC",
      monitoring: "Monitoring",
      map: "Map",
      media: "Media",
      contact: "Contact",
    };
    return SHAPE_NAV_LINKS.filter((l) => {
      const title = labels[l.titleKey] || l.titleKey;
      return (
        title.toLowerCase().includes(q) ||
        l.href.replace("/", "").includes(q) ||
        "shape erasmus project".includes(q)
      );
    }).map((l) => ({
      id: `nav-${l.href}`,
      title: labels[l.titleKey] || l.titleKey,
      subtitle: "Site page",
      href: l.href,
      type: "pages" as Filter,
    }));
  }, [query]);

  const results: ResultItem[] = useMemo(() => {
    const items: ResultItem[] = [
      ...(data.partners || []).map((p: any) => ({
        id: p.id,
        title: p.name,
        subtitle: [p.short_name, p.country, p.consortium_role || p.role]
          .filter(Boolean)
          .join(" · "),
        href: `/partners/${p.slug}`,
        type: "partners" as Filter,
      })),
      ...(data.workPackages || []).map((wp: any) => ({
        id: wp.id,
        title: `${wp.code} · ${wp.title}`,
        subtitle: wp.description || wp.status,
        href: `/work-packages/${wp.slug}`,
        type: "workPackages" as Filter,
      })),
      ...(data.events || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        subtitle: [ev.venue, ev.country, ev.event_date].filter(Boolean).join(" · "),
        href: `/events/${ev.slug}`,
        type: "events" as Filter,
      })),
      ...(data.documents || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        subtitle: doc.category || "Document",
        href: `/documents`,
        type: "documents" as Filter,
      })),
      ...(data.news || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        subtitle: n.category || n.type || "News",
        href: `/news/${n.slug}`,
        type: "news" as Filter,
      })),
      ...(data.activities || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        subtitle: a.status || "Activity",
        href: `/workplan`,
        type: "activities" as Filter,
      })),
      ...(data.sdlcStages || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        subtitle: s.description || "SDLC stage",
        href: `/sdlc`,
        type: "sdlcStages" as Filter,
      })),
      ...staticPages,
    ];
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [data, filter, staticPages]);

  const total =
    (typeof data.count === "number" ? data.count : 0) + staticPages.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (q.length < 2) return;
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Search"
        title="Find across SHAPE"
        subtitle="Search partners, work packages, events, documents, news, and project pages."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 max-w-4xl">
          <form onSubmit={submit} className="flex gap-0 border border-slate-200 mb-8">
            <div className="flex-1 flex items-center gap-3 px-4">
              <SearchIcon size={18} className="text-primary shrink-0" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search the project portal…"
                className="w-full py-4 outline-none text-sm text-primary-darker"
                aria-label="Search"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 text-[11px] font-black uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              Search
            </button>
          </form>

          {query.trim().length >= 2 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-8">
                {FILTERS.map((f) => {
                  const count =
                    f.key === "all"
                      ? total
                      : f.key === "pages"
                        ? staticPages.length
                        : Number(facets[f.key] || 0);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                        filter === f.key
                          ? "bg-primary text-white border-primary"
                          : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {f.label}
                      {count > 0 ? ` (${count})` : ""}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 mb-6">
                {loading
                  ? "Searching…"
                  : `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`}
              </p>

              <ul className="divide-y divide-slate-100 border-y border-slate-100">
                {results.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="group flex items-start gap-4 py-5 hover:bg-slate-50 px-1 transition-colors"
                    >
                      <div className="mt-1 w-9 h-9 border border-slate-200 bg-white flex items-center justify-center">
                        <TypeIcon type={item.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">
                          {FILTERS.find((f) => f.key === item.type)?.label || item.type}
                        </p>
                        <h2 className="font-serif text-lg font-black text-primary-darker uppercase tracking-tight group-hover:text-primary">
                          <Highlight text={item.title} query={query} />
                        </h2>
                        {item.subtitle ? (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            <Highlight text={item.subtitle} query={query} />
                          </p>
                        ) : null}
                      </div>
                      <ArrowRight
                        size={16}
                        className="text-slate-300 group-hover:text-primary mt-2 shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              {!loading && results.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl font-black text-primary-darker uppercase mb-2">
                    No matches
                  </p>
                  <p className="text-sm text-slate-500">
                    Try another term, or browse partners and work packages.
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-10">
              Enter at least 2 characters to search across the SHAPE portal and CMS content.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500">
          Loading search…
        </div>
      }
    >
      <ShapeSearchInner />
    </Suspense>
  );
}
