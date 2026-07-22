import React from "react";
import { getNews, getSettings } from "@/lib/api";
import NewsHubClient from "@/components/NewsHubClient";
import { getTranslations } from "next-intl/server";
import { resolveNewsHubSettings } from "@/lib/shape-api";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "News" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function NewsHubPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string; page?: string; category?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "News" });
  const q = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const allLabel = t("allUpdates");
  const category =
    searchParams.category === allLabel || searchParams.category === "All Updates"
      ? ""
      : searchParams.category || "";

  let news: any[] = [];
  let total = 0;
  let totalPages = 0;
  let availableCategories: string[] = [];
  let hubSettings = resolveNewsHubSettings({});

  try {
    const [newsResponse, settings] = await Promise.all([
      getNews({
        limit: 10,
        page,
        search: q,
        category,
        locale,
      }),
      getSettings(locale).catch(() => ({})),
    ]);

    hubSettings = resolveNewsHubSettings(settings || {});
    news = newsResponse?.items || newsResponse?.data || [];
    total = newsResponse?.total || 0;
    totalPages = newsResponse?.totalPages || 0;

    const allRecent = await getNews({ limit: 100, locale });
    const rawNews = allRecent?.items || allRecent?.data || [];
    availableCategories = Array.from(
      new Set(rawNews.map((n: any) => n.category)),
    ).filter(Boolean) as string[];
  } catch (error) {
    console.error("News Hub Fetch Error:", error);
  }

  return (
    <NewsHubClient
      initialNews={news}
      total={total}
      totalPages={totalPages}
      currentPage={page}
      categories={availableCategories}
      cms={hubSettings}
    />
  );
}
