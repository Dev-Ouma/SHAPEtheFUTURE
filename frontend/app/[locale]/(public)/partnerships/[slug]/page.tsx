import React from "react";
import { getTranslations } from "next-intl/server";
import { getApiCached } from "@/lib/api";
import PartnerDetailClient from "@/components/partnerships/PartnerDetailClient";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: "Partnerships" });
  const partner = await getApiCached(`/partnerships/detail/${params.slug}`, { revalidate: 300 }).catch(() => null);
  if (partner?.name) {
    return {
      title: partner.name,
      description: partner.summary || partner.description?.replace(/<[^>]+>/g, "").slice(0, 160) || t("subtitle"),
    };
  }
  return {
    title: `${t("title")} ${t("titleAccent")} | Open University of Kenya`,
    description: t("subtitle"),
  };
}

export default async function PartnerDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const partner = await getApiCached(`/partnerships/detail/${params.slug}`, { revalidate: 300 }).catch(() => null);
  return <PartnerDetailClient initialPartner={partner} slug={params.slug} />;
}
