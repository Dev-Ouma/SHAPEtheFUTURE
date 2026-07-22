import React from "react";
import type { Metadata } from "next";
import { ExternalLink, Images } from "lucide-react";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { Link } from "@/i18n/routing";
import { SHAPE_PRESS_COVERAGE } from "@/lib/shape-api";
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

export default function MediaPage() {
  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Media"
        title="Press & coverage"
        subtitle="External features, partner announcements, and project photography from the SHAPE consortium."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="shape-eyebrow mb-3">Press</p>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight">
              In the media
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Coverage from partner institutions and project channels. More features will be added as
              dissemination activities roll out.
            </p>
          </div>

          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {SHAPE_PRESS_COVERAGE.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 py-6 hover:bg-slate-50 transition-colors px-1"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary mb-2">
                      {item.source}
                      {item.date ? ` · ${item.date}` : ""}
                    </p>
                    <p className="font-serif text-lg md:text-xl font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <ExternalLink
                    size={18}
                    className="text-slate-400 group-hover:text-primary shrink-0"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shape-section bg-primary-darker text-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary mb-3">
              Photo gallery
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
              Meetings, workshops & field visits
            </h2>
            <p className="text-white/70 leading-relaxed">
              Browse images from consortium events, training sessions, and partner activities.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-secondary text-white px-7 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-primary-darker transition-colors shrink-0"
          >
            <Images size={16} /> Open gallery
          </Link>
        </div>
      </section>
    </div>
  );
}
