import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Library" });
  return {
    title: t("infoLitMetaTitle"),
    description: t("infoLitMetaDesc"),
  };
}

export default function InformationLiteracyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
