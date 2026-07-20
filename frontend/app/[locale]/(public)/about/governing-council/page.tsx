import React from "react";
import { getTranslations } from "next-intl/server";
import { getStaffDirectory } from "@/lib/api";
import GoverningCouncilPageClient from "@/components/about/GoverningCouncilPageClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "GoverningCouncil" });
  return { title: t("pageTitle"), description: t("pageSummary") };
}

export default async function GoverningCouncilPage() {
  const members = await getStaffDirectory("Governing Council").catch(() => []);
  return <GoverningCouncilPageClient initialMembers={Array.isArray(members) ? members : []} />;
}
