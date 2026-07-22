import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkPackageDetailClient from "@/components/shape/WorkPackageDetailClient";
import {
  getShapeActivities,
  getShapeDocuments,
  getShapeWorkPackage,
  getShapeWorkPackages,
} from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const packages = await getShapeWorkPackages();
  return packages.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const wp = await getShapeWorkPackage(params.slug);
  return withLocaleSeo(`/work-packages/${params.slug}`, params.locale, {
    title: wp ? `${wp.code} · ${wp.title}` : "Work Package",
    description: wp?.summary || "SHAPE work package detail.",
  });
}

export default async function WorkPackageDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const wp = await getShapeWorkPackage(params.slug);
  if (!wp) notFound();

  const [activities, documents] = await Promise.all([
    getShapeActivities().catch(() => []),
    getShapeDocuments().catch(() => []),
  ]);

  const linkedActivities = activities.filter(
    (a) =>
      a.work_package === wp.code ||
      a.work_package === wp.slug ||
      a.work_package === wp.title,
  );
  const linkedDocs = documents.filter(
    (d) =>
      d.work_package === wp.code ||
      d.work_package === wp.slug ||
      d.work_package === wp.title,
  );

  return (
    <WorkPackageDetailClient
      wp={wp}
      activities={linkedActivities}
      documents={linkedDocs}
    />
  );
}
