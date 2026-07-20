import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import DocumentsClient from "@/components/shape/DocumentsClient";
import { getShapeDocuments } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/documents", params.locale, {
    title: "Document Repository",
    description: "SHAPE deliverables, reports, minutes, and templates.",
  });
}

export default async function DocumentsPage() {
  const documents = await getShapeDocuments();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Knowledge hub"
        title="Documents"
        subtitle="Search and filter project deliverables, reports, minutes, presentations, and templates."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <DocumentsClient documents={documents} />
        </div>
      </section>
    </div>
  );
}
