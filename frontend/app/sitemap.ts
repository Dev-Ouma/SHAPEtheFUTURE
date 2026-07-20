import type { MetadataRoute } from "next";
import { getNews, getPrograms, getSchools } from "@/lib/api";
import { sitemapEntry } from "@/lib/seo";

const STATIC_PATHS: {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/partners", changeFrequency: "weekly", priority: 0.8 },
  { path: "/work-packages", changeFrequency: "weekly", priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/documents", changeFrequency: "weekly", priority: 0.6 },
  { path: "/dashboard", changeFrequency: "weekly", priority: 0.5 },
  { path: "/events", changeFrequency: "weekly", priority: 0.5 },
  { path: "/map", changeFrequency: "monthly", priority: 0.5 },
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
    const [schoolsRes, programmesRes, newsRes] = await Promise.all([
      getSchools().catch(() => []),
      getPrograms({ limit: 200 }).catch(() => ({ data: [] })),
      getNews({ limit: 100 }).catch(() => ({ data: [] })),
    ]);

    const schools = Array.isArray(schoolsRes)
      ? schoolsRes
      : (schoolsRes as any)?.data || [];
    const programmes = Array.isArray(programmesRes)
      ? programmesRes
      : (programmesRes as any)?.data || [];
    const news = Array.isArray(newsRes)
      ? newsRes
      : (newsRes as any)?.data || [];

    const schoolEntries = schools
      .filter((s: any) => s?.slug)
      .map((s: any) =>
        sitemapEntry(`/academics/schools/${s.slug}`, {
          lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }),
      );

    const programmeEntries = programmes
      .filter((p: any) => p?.slug)
      .map((p: any) =>
        sitemapEntry(`/programmes/${p.slug}`, {
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
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
      ...schoolEntries,
      ...programmeEntries,
      ...newsEntries,
    ];
  } catch {
    return staticRoutes;
  }
}
