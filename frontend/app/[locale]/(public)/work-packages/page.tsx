import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import WorkPackagesHubClient from "@/components/shape/WorkPackagesHubClient";
import WorkplanSection from "@/components/shape/WorkplanSection";
import {
  getShapeActivities,
  getShapeWorkPackages,
} from "@/lib/shape-api";
import { getSettings } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/work-packages", params.locale, {
    title: "Outputs",
    description:
      "SHAPE Erasmus+ outputs — work packages and activity workplan spanning management, curriculum, platforms, training, quality, dissemination, and sustainability.",
  });
}

export default async function WorkPackagesPage() {
  const [packages, activities, settings] = await Promise.all([
    getShapeWorkPackages(),
    getShapeActivities(),
    getSettings().catch(() => ({})),
  ]);

  const eyebrow =
    settings?.work_packages_eyebrow || "Consortium outputs";
  const title = settings?.work_packages_title || "Outputs";
  const subtitle =
    settings?.work_packages_subtitle ||
    "Eight coordinated work packages with the consortium activity workplan — mandates, leads, milestones, and live status from the SHAPE CMS.";

  return (
    <div className="bg-white">
      <ShapePageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="shape-section relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(3,123,144,0.06),transparent_55%)]" />
        <div className="container mx-auto px-6 relative">
          <WorkPackagesHubClient
            packages={packages}
            eyebrow="Consortium outputs"
            title="Eight work packages · one roadmap"
            subtitle="Explore each workstream’s mandate, lead institution, timeline, and progress — all managed in the SHAPE CMS and live from the database."
          />
        </div>
      </section>
      <WorkplanSection activities={activities} />
    </div>
  );
}
