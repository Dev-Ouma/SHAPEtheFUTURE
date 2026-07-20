import React from "react";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapeEvents } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/events", params.locale, {
    title: "Events",
    description: "SHAPE event tracker — meetings, workshops, and consortium gatherings.",
  });
}

export default async function EventsPage() {
  const events = await getShapeEvents();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Event tracker"
        title="Events"
        subtitle="Kick-offs, workshops, trainings, and consortium meetings with agendas, minutes, and galleries."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6 space-y-4">
          {events.map((event) => (
            <Link
              key={event.id || event.slug}
              href={`/events/${event.slug}`}
              className="block border border-slate-200 p-6 md:p-8 hover:border-primary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">
                    {[event.date, event.country].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="font-serif text-2xl font-black text-primary-darker uppercase tracking-tight">
                    {event.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {[event.host || event.venue, event.status].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                  View details →
                </span>
              </div>
            </Link>
          ))}
          {events.length === 0 ? (
            <p className="text-slate-500">Events will appear here as they are scheduled.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
