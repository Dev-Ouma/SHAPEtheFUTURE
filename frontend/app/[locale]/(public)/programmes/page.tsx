import React from "react";
import { getTranslations } from "next-intl/server";
import { getPrograms, getSchools } from "@/lib/api";
import ProgrammesDiscovery from "@/components/ProgrammesDiscovery";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "Programmes" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function ProgrammesPage({ 
  params,
  searchParams 
}: { 
  params: { locale: string };
  searchParams: { school?: string; department?: string; q?: string; level?: string; mode?: string; page?: string } 
}) {
  const { locale } = params;
  const [initialProgramsData, schools] = await Promise.all([
    getPrograms({
      school: searchParams.school,
      department: searchParams.department,
      search: searchParams.q,
      level: searchParams.level,
      mode: searchParams.mode,
      page: searchParams.page ? parseInt(searchParams.page as string) : 1,
      limit: 10
    }),
    getSchools(locale)
  ]);

  const initialPrograms = initialProgramsData?.data || [];
  const total = initialProgramsData?.total || 0;
  const totalPages = initialProgramsData?.totalPages || 1;

  return (
    <div className="bg-white min-h-screen">
      <main>
        <ProgrammesDiscovery 
          initialPrograms={initialPrograms} 
          schools={schools}
          initialTotal={total}
          initialTotalPages={totalPages}
        />
      </main>
    </div>
  );
}
