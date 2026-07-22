import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnerDetailClient from "@/components/shape/PartnerDetailClient";
import { getShapePartner, getShapePartners } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
  const partners = await getShapePartners();
  return partners.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const partner = await getShapePartner(params.slug);
  return withLocaleSeo(`/partners/${params.slug}`, params.locale, {
    title: partner?.name || "Partner",
    description:
      partner?.description ||
      partner?.responsibilities ||
      "SHAPE partner institution.",
  });
}

export default async function PartnerDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const partner = await getShapePartner(params.slug);
  if (!partner) notFound();

  return <PartnerDetailClient partner={partner} />;
}
