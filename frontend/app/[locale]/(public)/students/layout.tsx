import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Students" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    openGraph: {
      title: `${t("metaTitle")} | Open University of Kenya`,
      description: t("metaDesc"),
    },
  };
}

export default function StudentsSectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
