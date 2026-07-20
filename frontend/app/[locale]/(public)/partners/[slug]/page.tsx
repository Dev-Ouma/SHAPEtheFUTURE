import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapePartner, getShapePartners } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
  const partners = await getShapePartners();
  return partners.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const partner = await getShapePartner(params.slug);
  return withLocaleSeo(`/partners/${params.slug}`, params.locale, {
    title: partner?.name || "Partner",
    description: partner?.responsibilities || partner?.description || "SHAPE partner institution.",
  });
}

export default async function PartnerDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const partner = await getShapePartner(params.slug);
  if (!partner) notFound();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={partner.role || "Partner"}
        title={partner.name}
        subtitle={[partner.city, partner.country].filter(Boolean).join(" · ")}
      >
        {partner.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(partner.logo_url)}
            alt=""
            className="mt-8 h-14 w-auto object-contain bg-white/10 p-2"
          />
        ) : null}
      </ShapePageHero>

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {partner.description || partner.responsibilities ? (
              <div>
                <p className="shape-eyebrow mb-3">About</p>
                <p className="text-slate-600 leading-relaxed text-lg normal-case tracking-normal">
                  {partner.description || partner.responsibilities}
                </p>
              </div>
            ) : null}
            {partner.responsibilities ? (
              <div>
                <p className="shape-eyebrow mb-3">Responsibilities</p>
                <p className="text-slate-600 leading-relaxed normal-case tracking-normal">{partner.responsibilities}</p>
              </div>
            ) : null}
            {partner.deliverables ? (
              <div>
                <p className="shape-eyebrow mb-3">Deliverables</p>
                <p className="text-slate-600 leading-relaxed normal-case tracking-normal">{partner.deliverables}</p>
              </div>
            ) : null}
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 border-l-4 border-primary p-6 md:p-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Contact</p>
              <p className="font-semibold text-primary-darker normal-case tracking-normal">{partner.contact_name || "SHAPE liaison"}</p>
              {partner.contact_email ? (
                <a href={`mailto:${partner.contact_email}`} className="text-primary text-sm font-semibold block">
                  {partner.contact_email}
                </a>
              ) : null}
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-500 hover:text-primary"
                >
                  Institution website →
                </a>
              ) : null}
            </div>
            <Link href="/partners" className="text-sm font-semibold text-primary hover:text-secondary">
              ← All partners
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
