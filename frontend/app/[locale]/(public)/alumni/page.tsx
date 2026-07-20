import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AlumniLandingClient from "@/components/alumni/AlumniLandingClient";

/**
 * Server page shell — keeps alumni interactive UI in a client island.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "Alumni",
  }).catch(() => null);
  return {
    title: t?.("metaTitle") || "Alumni | Open University of Kenya",
    description:
      t?.("metaDesc") ||
      "Stay connected with the Open University of Kenya alumni community.",
  };
}

export default function AlumniLandingPage() {
  return <AlumniLandingClient />;
}
