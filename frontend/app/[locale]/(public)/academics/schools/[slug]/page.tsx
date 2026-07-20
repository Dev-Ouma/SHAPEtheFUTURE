import React from "react";
import { getSchool, resolveImageUrl } from "@/lib/api";
import { notFound } from "next/navigation";
import SchoolDetailClient from "@/components/SchoolDetailClient";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; locale: string };
}): Promise<Metadata> {
  const school = await getSchool(params.slug);
  const t = await getTranslations({ locale: params.locale, namespace: "Academics" });

  if (!school) {
    return { title: t("schoolNotFound") };
  }

  return {
    title: `${school.meta_title || school.name} | OUK`,
    description:
      school.meta_description ||
      school.description?.substring(0, 160) ||
      t("schoolMetaFallback"),
    openGraph: {
      title: school.meta_title || school.name,
      description:
        school.meta_description || school.description?.substring(0, 160),
      images: school.banner_image_url
        ? [{ url: resolveImageUrl(school.banner_image_url) }]
        : [],
    },
  };
}

export default async function SchoolPage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const school = await getSchool(params.slug);

  if (!school) {
    notFound();
  }

  return <SchoolDetailClient school={school} />;
}
