import React from "react";
import { getTranslations } from "next-intl/server";
import { getSchools } from "@/lib/api";
import SchoolsHubClient from "@/components/academics/SchoolsHubClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Academics" });
  return {
    title: `${t("schoolsTitle")} | Open University of Kenya`,
    description: t("schoolsHeroBody"),
  };
}

export default async function SchoolsHubPage({ params }: { params: { locale: string } }) {
  const schools = await getSchools(params.locale).catch(() => []);
  const list = Array.isArray(schools) ? schools : Array.isArray((schools as any)?.data) ? (schools as any).data : [];
  return <SchoolsHubClient initialSchools={list} />;
}
