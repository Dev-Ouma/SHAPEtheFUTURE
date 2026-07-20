import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/about", params.locale, {
    title: "About SHAPE",
    description:
      "Objectives, outcomes, and Erasmus+ funding for Strengthening Higher Education for Smart Cities.",
  });
}

const OBJECTIVES = [
  "Strengthen higher-education capacity for smart-city skills across East Africa.",
  "Co-design modular curricula and micro-credentials with European partners.",
  "Build shared digital learning platforms and open educational resources.",
  "Pilot training for educators, students, and city practitioners.",
  "Establish quality assurance and sustainability pathways beyond the grant.",
];

const OUTCOMES = [
  "Accredited and stackable smart-city learning pathways.",
  "Operational digital learning services across partner institutions.",
  "Trained cohorts of educators and learners.",
  "Published evidence, policy briefs, and open resources.",
  "A durable consortium network spanning six countries.",
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="About SHAPE"
        title={
          <>
            Strengthening higher education{" "}
            <span className="text-secondary">for smart cities</span>
          </>
        }
        subtitle="A three-year Erasmus+ initiative coordinated by the Open University of Kenya, connecting nine universities across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="shape-eyebrow mb-3">Background</p>
            <h2 className="text-3xl font-serif font-black text-primary-darker uppercase tracking-tight">
              Why SHAPE
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-5 text-slate-600 leading-relaxed">
            <p>
              Cities across East Africa are growing quickly. Universities must prepare graduates who can
              design, govern, and operate smarter urban systems — from digital public services to climate
              resilience and inclusive mobility.
            </p>
            <p>
              SHAPE brings African and European higher-education partners together to modernise curricula,
              share digital pedagogy, and connect learning with municipal and industry practice.
            </p>
          </div>
        </div>
      </section>

      <section className="shape-section bg-slate-50">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <p className="shape-eyebrow mb-4">Objectives</p>
            <ul className="space-y-4">
              {OBJECTIVES.map((item) => (
                <li key={item} className="border-l-2 border-primary pl-4 text-slate-700 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="shape-eyebrow mb-4">Expected outcomes</p>
            <ul className="space-y-4">
              {OUTCOMES.map((item) => (
                <li key={item} className="border-l-2 border-secondary pl-4 text-slate-700 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-10">
          <div>
            <p className="shape-eyebrow mb-3">Smart cities vision</p>
            <h3 className="font-serif text-2xl font-black text-primary-darker uppercase mb-4">
              People-centred innovation
            </h3>
            <p className="text-slate-600 leading-relaxed">
              SHAPE treats smart cities as civic systems — not only technology stacks. Education must
              combine data, design, governance, and community voice.
            </p>
          </div>
          <div>
            <p className="shape-eyebrow mb-3">Duration</p>
            <h3 className="font-serif text-2xl font-black text-primary-darker uppercase mb-4">
              Three years
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Implementation runs across planning, curriculum co-creation, digital platform development,
              pilots, monitoring, and sustainability.
            </p>
          </div>
          <div>
            <p className="shape-eyebrow mb-3">Funding</p>
            <h3 className="font-serif text-2xl font-black text-primary-darker uppercase mb-4">
              Erasmus+ Programme
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Co-funded by the European Union under Erasmus+. Views expressed are those of the authors and
              do not necessarily reflect those of the EU or EACEA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
