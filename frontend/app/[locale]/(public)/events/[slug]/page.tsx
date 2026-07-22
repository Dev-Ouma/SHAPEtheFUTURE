import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapeEvent, getShapeEvents } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
  const events = await getShapeEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const event = await getShapeEvent(params.slug);
  return withLocaleSeo(`/events/${params.slug}`, params.locale, {
    title: event?.title || "Event",
    description: event?.summary || "SHAPE project event.",
  });
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getShapeEvent(params.slug);
  if (!event) notFound();

  const gallery = event.gallery_urls?.length
    ? event.gallery_urls
    : ["/images/placeholder-event-1.jpg", "/images/placeholder-event-2.jpg"];

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={event.status || "Event"}
        title={event.title}
        subtitle={[event.date, event.venue || event.host, event.country].filter(Boolean).join(" · ")}
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            {event.summary ? (
              <p className="text-lg text-slate-600 leading-relaxed">{event.summary}</p>
            ) : null}

            {event.agenda ? (
              <div>
                <p className="shape-eyebrow mb-3">Agenda</p>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{event.agenda}</p>
              </div>
            ) : null}

            {event.outcomes ? (
              <div>
                <p className="shape-eyebrow mb-3">Outcomes</p>
                <p className="text-slate-600 leading-relaxed">{event.outcomes}</p>
              </div>
            ) : null}

            <div>
              <p className="shape-eyebrow mb-4">Gallery</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {gallery.map((url, i) => {
                  const src = resolveImageUrl(url) || url;
                  const hasImage = Boolean(src && !src.includes("placeholder-event"));
                  return (
                    <div
                      key={`${url}-${i}`}
                      className="aspect-[4/3] bg-gradient-to-br from-primary-dark to-primary border border-slate-200 overflow-hidden relative flex items-center justify-center"
                    >
                      {hasImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={`${event.title} gallery ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                          Gallery placeholder {i + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="border border-slate-200 p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resources</p>
              {event.minutes_url ? (
                <a href={event.minutes_url} className="block text-sm font-semibold text-primary">
                  Minutes
                </a>
              ) : (
                <p className="text-sm text-slate-400">Minutes — pending</p>
              )}
              {event.presentations_url ? (
                <a href={event.presentations_url} className="block text-sm font-semibold text-primary">
                  Presentations
                </a>
              ) : (
                <p className="text-sm text-slate-400">Presentations — pending</p>
              )}
              {event.attendance ? (
                <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">
                  Attendance: {event.attendance}
                </p>
              ) : null}
            </div>
            <Link href="/events" className="text-[11px] font-black uppercase tracking-widest text-primary">
              ← All events
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
