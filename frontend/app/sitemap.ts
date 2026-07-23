import type { MetadataRoute } from "next";
import { getNews } from "@/lib/api";
import {
  getShapeEvents,
  getShapePartners,
  getShapeWorkPackages,
} from "@/lib/shape-api";
import { sitemapEntry } from "@/lib/seo";

const STATIC_PATHS: {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/the-project", changeFrequency: "monthly", priority: 0.9 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/work-packages", changeFrequency: "weekly", priority: 0.8 },
  { path: "/media", changeFrequency: "weekly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/documents", changeFrequency: "weekly", priority: 0.6 },
  { path: "/dashboard", changeFrequency: "weekly", priority: 0.5 },
  { path: "/events", changeFrequency: "weekly", priority: 0.5 },
  { path: "/monitoring", changeFrequency: "weekly", priority: 0.5 },
  { path: "/sdlc", changeFrequency: "monthly", priority: 0.5 },
  { path: "/map", changeFrequency: "monthly", priority: 0.5 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
  { path: "/search", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = STATIC_PATHS.map(({ path, changeFrequency, priority }) =>
    sitemapEntry(path, {
      lastModified: new Date(),
      changeFrequency,
      priority,
    }),
  );

  try {
    const [partners, workPackages, events, newsRes] = await Promise.all([
      getShapePartners().catch(() => []),
      getShapeWorkPackages().catch(() => []),
      getShapeEvents().catch(() => []),
      getNews({ limit: 100 }).catch(() => ({ data: [] })),
    ]);

    const news = Array.isArray(newsRes)
      ? newsRes
      : (newsRes as any)?.data || [];

    const partnerEntries = partners
      .filter((p) => p?.slug)
      .map((p) =>
        sitemapEntry(`/partners/${p.slug}`, {
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }),
      );

    const wpEntries = workPackages
      .filter((wp) => wp?.slug)
      .map((wp) =>
        sitemapEntry(`/work-packages/${wp.slug}`, {
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }),
      );

    const eventEntries = events
      .filter((e) => e?.slug)
      .map((e) =>
        sitemapEntry(`/events/${e.slug}`, {
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        }),
      );

    const newsEntries = news
      .filter((n: any) => n?.slug)
      .map((n: any) =>
        sitemapEntry(`/news/${n.slug}`, {
          lastModified:
            n.updated_at || n.published_at
              ? new Date(n.updated_at || n.published_at)
              : new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        }),
      );

    return [
      ...staticRoutes,
      ...partnerEntries,
      ...wpEntries,
      ...eventEntries,
      ...newsEntries,
    ];
  } catch {
    return staticRoutes;
  }
}
