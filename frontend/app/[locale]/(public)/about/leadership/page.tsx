import React from "react";
import { getTranslations } from "next-intl/server";
import { getStaffDirectory } from "@/lib/api";
import LeadershipPageClient from "@/components/about/LeadershipPageClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Leadership" });
  return { title: t("pageTitle"), description: t("pageSummary") };
}

export default async function UniversityLeadershipPage() {
  const members = await getStaffDirectory("University Management Board").catch(() => []);
  return <LeadershipPageClient initialMembers={Array.isArray(members) ? members : []} />;
}
