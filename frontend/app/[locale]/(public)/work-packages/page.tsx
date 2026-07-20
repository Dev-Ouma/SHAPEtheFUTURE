import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ShapeWpPreview from "@/components/shape/ShapeWpPreview";
import { getShapeWorkPackages } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/work-packages", params.locale, {
    title: "Work Packages",
    description: "SHAPE Erasmus+ work packages with progress and leadership.",
  });
}

export default async function WorkPackagesPage() {
  const packages = await getShapeWorkPackages();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Delivery"
        title="Work packages"
        subtitle="Eight coordinated workstreams spanning management, curriculum, platforms, training, quality, dissemination, and sustainability."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <ShapeWpPreview packages={packages} />
        </div>
      </section>
    </div>
  );
}
