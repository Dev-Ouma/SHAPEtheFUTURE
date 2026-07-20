import React from "react";
import { getTranslations } from "next-intl/server";
import { getApiCached } from "@/lib/api";
import TenderDetailClient from "@/components/tenders/TenderDetailClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "Tenders" });
  const tender = await getApiCached(
    `/tenders/${params.slug}?locale=${encodeURIComponent(params.locale)}`,
    { revalidate: 120 },
  ).catch(() => null);
  if (tender?.title) {
    return {
      title: tender.title,
      description: t("detailSummary"),
    };
  }
  return {
    title: `${t("title")} | Open University of Kenya`,
    description: t("summary"),
  };
}

export default async function TenderDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const tender = await getApiCached(
    `/tenders/${params.slug}?locale=${encodeURIComponent(params.locale)}`,
    { revalidate: 120 },
  ).catch(() => null);
  return <TenderDetailClient initialTender={tender} slug={params.slug} />;
}
