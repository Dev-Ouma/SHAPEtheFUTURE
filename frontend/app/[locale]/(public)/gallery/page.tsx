import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapeEvents } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";
import { AccessibleMedia } from "@/components/accessibility/AccessibleMedia";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/gallery", params.locale, {
    title: "Gallery",
    description: "SHAPE photo and media gallery by category.",
  });
}

const CATEGORIES = [
  "Meetings",
  "Workshops",
  "Training",
  "Conferences",
  "Field Visits",
  "Student Activities",
];

export default async function GalleryPage() {
  const t = await getTranslations("Shape.pages");
  const events = await getShapeEvents();

  const fromEvents = events.flatMap((e) =>
    (e.gallery_urls || []).map((url, i) => ({
      url,
      title: e.title,
      category: e.gallery_category || "Meetings",
      key: `${e.slug}-${i}`,
    })),
  );

  const videos = events.filter((e) => e.video_url);

  const items = fromEvents;

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={t("galleryEyebrow")}
        title={t("galleryTitle")}
        subtitle={t("gallerySubtitle")}
      />
      <section className="shape-section">
        <div className="container mx-auto px-6 space-y-12">
          {!items.length ? (
            <p className="text-slate-500 text-sm max-w-xl">
              Gallery images appear here when events publish photos in the CMS. Check back after
              consortium meetings and workshops.
            </p>
          ) : null}

          {CATEGORIES.map((cat) => {
            const group = items.filter((i) => i.category === cat);
            if (!group.length) return null;
            return (
              <div key={cat}>
                <p className="shape-eyebrow mb-5">{cat}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((item) => (
                    <div
                      key={item.key}
                      className="aspect-[4/3] bg-gradient-to-br from-primary-darker via-primary to-primary/70 relative overflow-hidden flex items-end"
                    >
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveImageUrl(item.url) || item.url}
                          alt={`${item.title} — ${item.category}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : null}
                      <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-sm font-bold">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {videos.length ? (
            <div>
              <p className="shape-eyebrow mb-5">Video</p>
              <div className="grid lg:grid-cols-2 gap-8">
                {videos.map((e) => (
                  <AccessibleMedia
                    key={e.id}
                    title={e.title}
                    src={e.video_url!}
                    captionsSrc={e.captions_url}
                    transcript={e.transcript}
                    signLanguageSrc={e.sign_language_url}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
