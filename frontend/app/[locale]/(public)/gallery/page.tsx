import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapeEvents } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

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
  const events = await getShapeEvents();
  const fromEvents = events.flatMap((e) =>
    (e.gallery_urls || []).map((url, i) => ({
      url,
      title: e.title,
      category: "Meetings",
      key: `${e.slug}-${i}`,
    })),
  );

  const placeholders = CATEGORIES.flatMap((cat, ci) =>
    [1, 2].map((n) => ({
      url: "",
      title: `${cat} · set ${n}`,
      category: cat,
      key: `ph-${ci}-${n}`,
    })),
  );

  const items = fromEvents.length ? fromEvents : placeholders;

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Media"
        title="Gallery"
        subtitle="Photos and media from meetings, workshops, training, and field activities."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6 space-y-12">
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
                        <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : null}
                      <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-sm font-semibold">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
