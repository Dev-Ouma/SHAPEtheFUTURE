import React from "react";
import { getTranslations } from "next-intl/server";
import { getApiCached } from "@/lib/api";
import TendersClient from "@/components/tenders/TendersClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Tenders" });
  return {
    title: `${t("title")} | Open University of Kenya`,
    description: t("summary"),
  };
}

export default async function TendersLandingPage({ params }: { params: { locale: string } }) {
  const [tendersData, catsData] = await Promise.all([
    getApiCached(`/tenders?locale=${encodeURIComponent(params.locale)}`, { revalidate: 120 }).catch(() => []),
    getApiCached("/tenders/categories", { revalidate: 300 }).catch(() => []),
  ]);
  return (
    <TendersClient
      initialTenders={Array.isArray(tendersData) ? tendersData : []}
      initialCategories={Array.isArray(catsData) ? catsData : []}
    />
  );
}
