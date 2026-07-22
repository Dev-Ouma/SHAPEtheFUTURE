import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/** Legacy OUK surfaces kept in the tree but not part of the SHAPE public product. */
const LEGACY_OUK_DISALLOW = [
  "/academics",
  "/academic-affairs",
  "/admissions",
  "/alumni",
  "/careers",
  "/library",
  "/programmes",
  "/research",
  "/students",
  "/tenders",
  "/units",
  "/virtual-tour",
  "/partnerships",
  "/service-charter",
  "/about",
  "/about-us",
  "/faqs",
  "/social",
  "/support",
  "/outputs",
];

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  let host = "shape.ouk.ac.ke";
  try {
    host = new URL(site).host;
  } catch {
    /* keep default */
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/portal",
          "/portal/",
          "/api/",
          "/_next/",
          "/maintenance",
          "/maintenance/",
          ...LEGACY_OUK_DISALLOW,
          ...LEGACY_OUK_DISALLOW.map((p) => `${p}/`),
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host,
  };
}
