import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  let host = "www.ouk.ac.ke";
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
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host,
  };
}
