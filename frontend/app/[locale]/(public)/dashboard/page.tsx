import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import DashboardClient from "@/components/shape/DashboardClient";
import { getShapeDashboard, getShapeKpis } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/dashboard", params.locale, {
    title: "Grant Progress Dashboard",
    description: "SHAPE Erasmus+ KPIs, completion, and budget utilisation.",
  });
}

export default async function DashboardPage() {
  const [dashboard, kpis] = await Promise.all([getShapeDashboard(), getShapeKpis()]);

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Monitoring"
        title="Grant progress dashboard"
        subtitle="Live view of completion, budget utilisation, deliverables, and reach indicators for the SHAPE consortium."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <DashboardClient dashboard={dashboard} kpis={kpis} />
        </div>
      </section>
    </div>
  );
}
