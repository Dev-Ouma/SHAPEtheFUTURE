import React from "react";
import type { Metadata } from "next";
import { ExternalLink, Images } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { Link } from "@/i18n/routing";
import { getShapePress } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/media", params.locale, {
    title: "Media & Press",
    description: "Press coverage, partner features, and the SHAPE photo gallery.",
  });
}

export default async function MediaPage() {
  const t = await getTranslations("Shape.pages");
  const locale = await getLocale();
  const press = await getShapePress();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={t("mediaEyebrow")}
        title={t("mediaTitle")}
        subtitle={t("mediaSubtitle")}
      />

      <section className="shape-section">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="shape-eyebrow mb-3">{t("mediaEyebrow")}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight">
              {t("pressHeading")}
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">{t("pressIntro")}</p>
          </div>

          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {press.map((item) => {
              const title =
                locale === "sw" && item.title_sw ? item.title_sw : item.title;
              const source =
                locale === "sw" && item.source_sw ? item.source_sw : item.source;
              return (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row sm:items-center gap-3 py-6 hover:bg-slate-50 transition-colors px-1"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary mb-2">
                        {source}
                        {item.date ? ` · ${item.date}` : ""}
                      </p>
                      <p className="font-serif text-lg md:text-xl font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors">
                        {title}
                      </p>
                    </div>
                    <ExternalLink
                      size={18}
                      className="text-slate-400 group-hover:text-primary shrink-0"
                      aria-hidden
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="shape-section bg-primary-darker text-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary mb-3">
              {t("photoGallery")}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
              {t("galleryTitle")}
            </h2>
            <p className="text-white/70 leading-relaxed">{t("gallerySubtitle")}</p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-primary"
          >
            <Images size={16} aria-hidden />
            {t("photoGalleryCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
