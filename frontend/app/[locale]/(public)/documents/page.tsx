import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ShapePageHero from "@/components/shape/ShapePageHero";
import DocumentsClient from "@/components/shape/DocumentsClient";
import { getShapeDocuments } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

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
  const t = await getTranslations("Shape.pages");
  const documents = await getShapeDocuments();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Knowledge hub"
        title={t("documentsTitle")}
        subtitle={t("documentsSubtitle")}
      />
      <section className="shape-section">
        <div className="container mx-auto px-6">
          <DocumentsClient documents={documents} />
        </div>
      </section>
    </div>
  );
}
