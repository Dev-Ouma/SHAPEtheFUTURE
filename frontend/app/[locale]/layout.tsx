import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import LocaleHtmlLang from "@/components/LocaleHtmlLang";
import { htmlLangForLocale, localeAlternates, openGraphLocale } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  // Only when middleware ran (request-time). Avoid baking canonical "/" into static builds.
  const path = headers().get("x-ouk-pathname");

  if (!path) {
    return {
      openGraph: {
        locale: openGraphLocale(locale),
        alternateLocale: locale === "sw" ? ["en_GB"] : ["sw_KE"],
      },
    };
  }

  return {
    alternates: localeAlternates(path, locale),
    openGraph: {
      locale: openGraphLocale(locale),
      alternateLocale: locale === "sw" ? ["en_GB"] : ["sw_KE"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as "en" | "sw")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const htmlLang = htmlLangForLocale(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Early lang sync before paint (root <html> is shared with admin/portal). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(htmlLang)};`,
        }}
      />
      <LocaleHtmlLang />
      {children}
    </NextIntlClientProvider>
  );
}
