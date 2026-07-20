import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ProgressBar from "@/components/shape/ProgressBar";
import { getShapeSdlc } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/sdlc", params.locale, {
    title: "Project Development Cycle",
    description: "SHAPE implementation stages from planning to sustainability.",
  });
}

export default async function SdlcPage() {
  const stages = await getShapeSdlc();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Implementation"
        title="Project development cycle"
        subtitle="A vertical view of how SHAPE moves from planning through pilots to sustainability."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6 max-w-3xl">
          <ol className="relative border-l-2 border-primary/30 ml-3 space-y-10">
            {stages.map((stage, i) => (
              <li key={stage.id} className="pl-10 relative">
                <span className="absolute -left-[9px] top-1 w-4 h-4 bg-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">
                  Stage {i + 1} · {stage.status || "planned"}
                </p>
                <h2 className="font-serif text-2xl font-black text-primary-darker uppercase tracking-tight mb-3">
                  {stage.title}
                </h2>
                {stage.objectives ? (
                  <p className="text-slate-600 mb-4 leading-relaxed">{stage.objectives}</p>
                ) : null}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{stage.progress ?? 0}%</span>
                </div>
                <ProgressBar value={stage.progress ?? 0} />
                {stage.outputs ? (
                  <p className="text-sm text-slate-500 mt-3">Outputs: {stage.outputs}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
