import React from "react";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import ShapeHomeHero from "@/components/shape/ShapeHomeHero";
import ShapeStatsStrip from "@/components/shape/ShapeStatsStrip";
import ShapeWpPreview from "@/components/shape/ShapeWpPreview";
import ShapePartnersStrip from "@/components/shape/ShapePartnersStrip";
import {
  getShapeDashboard,
  getShapePartners,
  getShapeWorkPackages,
} from "@/lib/shape-api";
import { getNews } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/", params.locale, {
    title: "SHAPE | Strengthening Higher Education for Smart Cities",
    description:
      "SHAPE is an Erasmus+ project strengthening higher education for smart cities across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania.",
  });
}

function asList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const [dashboard, partners, workPackages, newsRes] = await Promise.all([
    getShapeDashboard(),
    getShapePartners(),
    getShapeWorkPackages(),
    getNews({ limit: 3, type: "All", locale }).catch(() => ({ items: [] })),
  ]);

  const news = asList(newsRes)
    .filter((n: any) => n.type !== "Research")
    .slice(0, 3);

  const stats = [
    { value: dashboard.project_years, label: "Year project" },
    { value: dashboard.countries, label: "Countries" },
    { value: dashboard.universities, label: "Universities" },
    { value: dashboard.work_packages, label: "Work packages" },
    { value: dashboard.events_held, label: "Events" },
    {
      value: `${dashboard.deliverables_done}/${dashboard.deliverables_total}`,
      label: "Deliverables",
    },
  ];

  return (
    <div className="bg-white">
      <ShapeHomeHero />

      <ShapeStatsStrip stats={stats} />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="shape-eyebrow mb-4">Project overview</p>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-primary-darker uppercase tracking-tight leading-[0.95] mb-6">
              Building smart-city capacity through higher education
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-5 text-slate-600 leading-relaxed">
            <p>
              SHAPE connects nine universities across East Africa and Europe to strengthen teaching,
              research, and digital learning for smart cities. Coordinated by the Open University of
              Kenya and co-funded by Erasmus+, the consortium aligns curricula, platforms, and
              practitioner training with real urban challenges.
            </p>
            <p>
              Over three years, partners co-design programmes, pilot digital learning services, and
              share open resources so graduates and city stakeholders can shape more inclusive,
              resilient urban futures.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
            >
              Read the full story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="shape-section bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="shape-eyebrow mb-3">Work packages</p>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
                Eight workstreams
              </h2>
            </div>
            <Link
              href="/work-packages"
              className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
            >
              View all WPs →
            </Link>
          </div>
          <ShapeWpPreview packages={workPackages.slice(0, 8)} />
        </div>
      </section>

      {news.length > 0 ? (
        <section className="shape-section">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="shape-eyebrow mb-3">Latest news</p>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
                  Project updates
                </h2>
              </div>
              <Link
                href="/news"
                className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
              >
                All news →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {news.map((item: any) => (
                <Link
                  key={item.id || item.slug}
                  href={`/news/${item.slug}`}
                  className="group border-t-2 border-primary pt-6"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">
                    {item.category || item.type || "Update"}
                  </p>
                  <h3 className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="shape-section bg-primary-darker text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary mb-3">
                Consortium
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tight">
                Partner institutions
              </h2>
            </div>
            <Link
              href="/partners"
              className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-white"
            >
              Meet the partners →
            </Link>
          </div>
          <ShapePartnersStrip partners={partners} />
        </div>
      </section>

      <section className="shape-section">
        <div className="container mx-auto px-6">
          <p className="shape-eyebrow mb-4">Quick links</p>
          <h2 className="text-3xl font-serif font-black text-primary-darker uppercase tracking-tight mb-10">
            Explore the portal
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/documents", title: "Documents", desc: "Deliverables, reports, templates" },
              { href: "/events", title: "Events", desc: "Meetings, workshops, agendas" },
              { href: "/map", title: "Map", desc: "Partners across six countries" },
              { href: "/contact", title: "Contact", desc: "Coordinator office & enquiry form" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-slate-200 p-6 hover:border-primary hover:bg-slate-50 transition-colors"
              >
                <h3 className="font-serif text-xl font-black text-primary-darker uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
