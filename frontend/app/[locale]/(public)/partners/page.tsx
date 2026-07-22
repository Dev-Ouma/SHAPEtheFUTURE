import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import PartnersGrid from "@/components/shape/PartnersGrid";
import { getShapePartners } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/partners", params.locale, {
    title: "Partner Institutions",
    description: "Nine universities across six countries in the SHAPE Erasmus+ consortium.",
  });
}

export default async function PartnersPage() {
  const partners = await getShapePartners();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Partners"
        title="Full Partners"
        subtitle="Nine universities across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania — each with a distinct role in the Erasmus+ consortium."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <PartnersGrid partners={partners} />
        </div>
      </section>
    </div>
  );
}
