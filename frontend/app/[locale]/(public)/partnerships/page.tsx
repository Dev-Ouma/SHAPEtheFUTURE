import React from "react";
import { getTranslations } from "next-intl/server";
import { getApiCached } from "@/lib/api";
import PartnershipsClient from "@/components/partnerships/PartnershipsClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Partnerships" });
  return {
    title: `${t("title")} ${t("titleAccent")} | Open University of Kenya`,
    description: t("subtitle"),
  };
}

export default async function PartnershipsPage() {
  const [partnersData, categoriesData, statsData] = await Promise.all([
    getApiCached("/partnerships", { revalidate: 300 }).catch(() => []),
    getApiCached("/partnerships/categories", { revalidate: 300 }).catch(() => []),
    getApiCached("/partnerships/stats", { revalidate: 300 }).catch(() => null),
  ]);
  return (
    <PartnershipsClient
      initialPartners={Array.isArray(partnersData) ? partnersData : []}
      initialCategories={Array.isArray(categoriesData) ? categoriesData : []}
      initialStats={statsData && typeof statsData === "object" ? statsData : null}
    />
  );
}
