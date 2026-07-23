import React from "react";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import ShapeHomeHero from "@/components/shape/ShapeHomeHero";
import ShapeStatsStrip from "@/components/shape/ShapeStatsStrip";
import ShapeWpPreview from "@/components/shape/ShapeWpPreview";
import ShapePartnersStrip from "@/components/shape/ShapePartnersStrip";
import ProjectInfoCard from "@/components/shape/ProjectInfoCard";
import HomeObjectives from "@/components/shape/HomeObjectives";
import EuFundingBadge from "@/components/shape/EuFundingBadge";
import ShapeReveal from "@/components/shape/ShapeReveal";
import RevealHeading from "@/components/shape/RevealHeading";
import {
  getShapeDashboard,
  getShapePartners,
  getShapeWorkPackages,
  resolveShapeHomeSettings,
} from "@/lib/shape-api";
import { getNews, getSettings, resolveImageUrl } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";
import SafeImage from "@/components/ui/SafeImage";


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

  const [dashboard, partners, workPackages, newsRes, settings] = await Promise.all([
    getShapeDashboard(),
    getShapePartners(),
    getShapeWorkPackages(),
    getNews({ limit: 3, type: "All", locale }).catch(() => ({ items: [] })),
    getSettings(locale).catch(() => ({})),
  ]);

  const home = resolveShapeHomeSettings(settings || {});

  const news = asList(newsRes)
    .filter((n: any) => n.type !== "Research")
    .slice(0, 3);

  const stats = [
    { value: dashboard.project_years, label: "Years" },
    { value: dashboard.countries, label: "Countries" },
    { value: dashboard.universities, label: "Universities" },
    { value: dashboard.work_packages, label: "Work packages" },
    { value: dashboard.events_held, label: "Events held" },
    {
      value: `${dashboard.deliverables_done}/${dashboard.deliverables_total}`,
      label: "Deliverables",
    },
  ];

  return (
    <div className="bg-white">
      <ShapeHomeHero
        eyebrow={home.heroEyebrow}
        title={home.heroTitle}
        text={home.heroText}
        tagline={home.siteName.includes("|") ? home.siteName.split("|")[1]?.trim() : home.siteName}
      />

      <ShapeStatsStrip stats={stats} />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <ShapeReveal className="lg:col-span-7 space-y-6">
            <div>
              <p className="shape-eyebrow mb-4">The project</p>
              <RevealHeading className="text-3xl md:text-5xl font-serif font-black text-primary-darker uppercase tracking-tight leading-[0.95] mb-6">
                Building smart-city capacity through higher education
              </RevealHeading>
            </div>
            {home.overviewImage ? (
              <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                <SafeImage
                  src={resolveImageUrl(home.overviewImage)}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-5 text-slate-600 leading-relaxed">
              <p>{home.overview}</p>
              <p>{home.intro}</p>
            </div>
            <EuFundingBadge />
            <Link
              href="/the-project"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
            >
              Learn more <ArrowRight size={14} />
            </Link>
          </ShapeReveal>
          <ShapeReveal className="lg:col-span-5" delay={0.12}>
            <ProjectInfoCard acronym={home.acronym} erasmusCall={home.erasmusCall} />
          </ShapeReveal>
        </div>
      </section>

      <HomeObjectives objectives={home.objectives} />

      <section className="shape-section">
        <div className="container mx-auto px-6">
          <ShapeReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="shape-eyebrow mb-3">Work packages</p>
              <RevealHeading className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
                Eight workstreams
              </RevealHeading>
            </div>
            <Link
              href="/work-packages"
              className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
            >
              View all WPs →
            </Link>
          </ShapeReveal>
          <ShapeWpPreview packages={workPackages.slice(0, 8)} />
        </div>
      </section>

      {news.length > 0 ? (
        <section className="shape-section">
          <div className="container mx-auto px-6">
            <ShapeReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="shape-eyebrow mb-3">Latest news</p>
                <RevealHeading className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
                  Project updates
                </RevealHeading>
              </div>
              <Link
                href="/news"
                className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
              >
                All news →
              </Link>
            </ShapeReveal>
            <div className="grid md:grid-cols-3 gap-8">
              {news.map((item: any, i: number) => (
                <ShapeReveal key={item.id || item.slug} delay={i * 0.08}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="group block border-t-2 border-primary pt-6 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">
                      {item.category || item.type || "Update"}
                    </p>
                    <h3 className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </Link>
                </ShapeReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="shape-section bg-primary-darker text-white">
        <div className="container mx-auto px-6">
          <ShapeReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-secondary mb-3">
                Consortium
              </p>
              <RevealHeading className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tight">
                Partner institutions
              </RevealHeading>
            </div>
            <Link
              href="/partners"
              className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-white"
            >
              Meet the partners →
            </Link>
          </ShapeReveal>
          <ShapePartnersStrip partners={partners} />
        </div>
      </section>

      <section className="shape-section">
        <div className="container mx-auto px-6">
          <ShapeReveal>
            <p className="shape-eyebrow mb-4">Quick links</p>
            <RevealHeading className="text-3xl font-serif font-black text-primary-darker uppercase tracking-tight mb-10">
              Explore the portal
            </RevealHeading>
          </ShapeReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/documents", title: "Documents", desc: "Deliverables, reports, templates" },
              { href: "/events", title: "Events", desc: "Meetings, workshops, agendas" },
              { href: "/media", title: "Media", desc: "Press coverage and photo gallery" },
              { href: "/contact", title: "Contact", desc: "Coordinator office & enquiry form" },
            ].map((item, i) => (
              <ShapeReveal key={item.href} delay={i * 0.06}>
                <Link
                  href={item.href}
                  className="block border border-slate-200 p-6 transition-all duration-300 hover:border-primary hover:bg-slate-50 hover:-translate-y-1"
                >
                  <h3 className="font-serif text-xl font-black text-primary-darker uppercase mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </Link>
              </ShapeReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
