import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ProgressBar from "@/components/shape/ProgressBar";
import { getShapeWorkPackage, getShapeWorkPackages } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateStaticParams() {
  const packages = await getShapeWorkPackages();
  return packages.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const wp = await getShapeWorkPackage(params.slug);
  return withLocaleSeo(`/work-packages/${params.slug}`, params.locale, {
    title: wp ? `${wp.code} · ${wp.title}` : "Work Package",
    description: wp?.summary || "SHAPE work package detail.",
  });
}

export default async function WorkPackageDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const wp = await getShapeWorkPackage(params.slug);
  if (!wp) notFound();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={wp.code}
        title={wp.title}
        subtitle={wp.summary}
      >
        <div className="mt-8 max-w-md">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">
            <span>Progress</span>
            <span>{wp.progress ?? 0}%</span>
          </div>
          <ProgressBar value={wp.progress ?? 0} tone="secondary" className="h-2.5 bg-white/20" />
        </div>
      </ShapePageHero>

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            <div>
              <p className="shape-eyebrow mb-3">Objectives</p>
              <p className="text-slate-600 leading-relaxed text-lg">
                {wp.objectives || wp.summary || "Objectives will be published as the work package advances."}
              </p>
            </div>

            {wp.milestones?.length ? (
              <div>
                <p className="shape-eyebrow mb-4">Milestones</p>
                <ul className="divide-y divide-slate-100 border border-slate-200">
                  {wp.milestones.map((m) => (
                    <li key={m.title} className="flex flex-wrap justify-between gap-3 px-5 py-4">
                      <span className="font-semibold text-primary-darker">{m.title}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {[m.due, m.status].filter(Boolean).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {wp.deliverables?.length ? (
              <div>
                <p className="shape-eyebrow mb-4">Deliverables</p>
                <ul className="space-y-3">
                  {wp.deliverables.map((d) => (
                    <li key={d.title} className="border-l-2 border-primary pl-4 text-slate-700">
                      {d.title}
                      {d.status ? (
                        <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                          {d.status}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {wp.documents?.length ? (
              <div>
                <p className="shape-eyebrow mb-4">Documents</p>
                <ul className="space-y-2">
                  {wp.documents.map((doc) => (
                    <li key={doc.title}>
                      <a href={doc.url} className="text-primary font-semibold hover:text-secondary">
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-slate-200 p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Leader</p>
                <p className="font-bold text-primary-darker">{wp.leader || "TBC"}</p>
              </div>
              {(wp.timeline_start || wp.timeline_end) && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Timeline</p>
                  <p className="text-sm text-slate-600">
                    {[wp.timeline_start, wp.timeline_end].filter(Boolean).join(" → ")}
                  </p>
                </div>
              )}
              {wp.partners?.length ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Partners</p>
                  <p className="text-sm text-slate-600">{wp.partners.join(", ")}</p>
                </div>
              ) : null}
            </div>
            <Link href="/work-packages" className="text-[11px] font-black uppercase tracking-widest text-primary">
              ← All work packages
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
