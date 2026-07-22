import React from "react";
import type { Metadata } from "next";
import SdlcDonutClient from "@/components/shape/SdlcDonutClient";
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
      <section className="relative overflow-x-hidden bg-gradient-to-b from-[#024955] via-[#037b90] to-white pt-16 pb-10 md:pt-20 md:pb-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 10%, rgba(255,127,80,0.35), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(255,255,255,0.18), transparent 40%)",
          }}
        />
        <div className="container mx-auto px-6 relative z-10 text-center mb-2 md:mb-4">
          <p className="text-secondary text-[11px] font-black tracking-[0.4em] uppercase mb-4">
            Implementation
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.05] mb-4">
            Project development cycle
          </h1>
          <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-2xl mx-auto">
            A living 3D cycle — follow the arrows from planning through pilots to sustainability.
          </p>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <SdlcDonutClient stages={stages} tone="hero" />
        </div>
      </section>
    </div>
  );
}
