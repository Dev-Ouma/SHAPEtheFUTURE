import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ProjectMapClient from "@/components/shape/ProjectMapClient";
import { getShapePartners } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/map", params.locale, {
    title: "Project Map",
    description: "Interactive map of SHAPE partner institutions across six countries.",
  });
}

export default async function MapPage() {
  const partners = await getShapePartners();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Geography"
        title="Project map"
        subtitle="Real OpenStreetMap pins for every SHAPE partner — click a pin or list item to fly across East Africa and Europe."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <ProjectMapClient partners={partners} />
        </div>
      </section>
    </div>
  );
}
