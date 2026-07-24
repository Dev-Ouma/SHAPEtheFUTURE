import type { MetadataRoute } from "next";

/**
 * PWA web app manifest. Next.js serves this at /manifest.webmanifest and links
 * it automatically. Enables install-to-home-screen and a branded splash.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SHAPE — Strengthening Higher Education for Smart Cities",
    short_name: "SHAPE",
    description:
      "Erasmus+ project strengthening higher education for smart cities across East Africa and Europe. Coordinated by the Open University of Kenya.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#012f38",
    theme_color: "#012f38",
    lang: "en",
    categories: ["education"],
    icons: [
      { src: "/icon.png", sizes: "520x520", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
