import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import WorkPackagesHubClient from "@/components/shape/WorkPackagesHubClient";
import { getShapeWorkPackages } from "@/lib/shape-api";
import { getSettings } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/work-packages", params.locale, {
    title: "Work Packages",
    description:
      "SHAPE Erasmus+ work packages — management, curriculum, platforms, training, quality, dissemination, and sustainability.",
  });
}

export default async function WorkPackagesPage() {
  const [packages, settings] = await Promise.all([
    getShapeWorkPackages(),
    getSettings().catch(() => ({})),
  ]);

  const eyebrow =
    settings?.work_packages_eyebrow || "Delivery architecture";
  const title = settings?.work_packages_title || "Work packages";
  const subtitle =
    settings?.work_packages_subtitle ||
    "Eight coordinated workstreams spanning management, curriculum, platforms, training, quality, dissemination, and sustainability — each led by a consortium partner with clear milestones and deliverables.";

  return (
    <div className="bg-white">
      <ShapePageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="shape-section relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(3,123,144,0.06),transparent_55%)]" />
        <div className="container mx-auto px-6 relative">
          <WorkPackagesHubClient
            packages={packages}
            eyebrow="Consortium delivery"
            title="Eight work packages · one roadmap"
            subtitle="Explore each workstream’s mandate, lead institution, timeline, and progress — all managed in the SHAPE CMS and live from the database."
          />
        </div>
      </section>
    </div>
  );
}
