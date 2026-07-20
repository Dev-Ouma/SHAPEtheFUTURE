import { Inter, Literata } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/api";
import ToastLayer from "@/components/ui/ToastLayer";
import RouteProgressBar from "@/components/ui/RouteProgressBar";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import Script from "next/script";
import type { Metadata } from "next";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import Ga4ConsentLoader from "@/components/analytics/Ga4ConsentLoader";
import WebVitalsRum from "@/components/analytics/WebVitalsRum";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const literata = Literata({ subsets: ["latin"], variable: "--font-literata", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName =
    settings?.site_name || "SHAPE | Strengthening Higher Education for Smart Cities";
  const description =
    settings?.site_description ||
    "SHAPE is an Erasmus+ project strengthening higher education for smart cities across East Africa and Europe. Coordinated by the Open University of Kenya.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shape.ouk.ac.ke";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | SHAPE Erasmus+`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "en_GB",
      alternateLocale: ["sw_KE"],
      url: siteUrl,
      siteName: "SHAPE Erasmus+",
      title: siteName,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${literata.variable} font-sans antialiased bg-white text-primary-darker transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ToastLayer />
        <RouteProgressBar />

        <AccessibilityProvider>
          <AnalyticsProvider>
            {children}
            <Ga4ConsentLoader />
            <WebVitalsRum />
          </AnalyticsProvider>
        </AccessibilityProvider>

        <Script id="org-schema" type="application/ld+json" strategy="beforeInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "SHAPE — Strengthening Higher Education for Smart Cities",
              "alternateName": "SHAPE Erasmus+",
              "url": "https://shape.ouk.ac.ke",
              "description": "Erasmus+ Capacity Building in Higher Education project for smart cities across East Africa and Europe.",
              "parentOrganization": {
                "@type": "CollegeOrUniversity",
                "name": "Open University of Kenya",
                "url": "https://ouk.ac.ke"
              }
            }
          `}
        </Script>
      </body>
    </html>
  );
}
