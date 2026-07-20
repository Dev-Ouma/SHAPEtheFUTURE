import React from "react";
import { getTranslations } from "next-intl/server";
import { getStaffDirectory } from "@/lib/api";
import ManagementPageClient from "@/components/about/ManagementPageClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Management" });
  return { title: t("pageTitle"), description: t("pageSummary") };
}

export default async function UniversityManagementPage() {
  const members = await getStaffDirectory("University Management Board").catch(() => []);
  return <ManagementPageClient initialMembers={Array.isArray(members) ? members : []} />;
}
