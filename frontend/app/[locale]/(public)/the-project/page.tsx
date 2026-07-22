import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import AboutGoalsSection from "@/components/shape/AboutGoalsSection";
import ProjectInfoCard from "@/components/shape/ProjectInfoCard";
import EuFundingBadge from "@/components/shape/EuFundingBadge";
import { getSettings } from "@/lib/api";
import { resolveShapeHomeSettings } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/the-project", params.locale, {
    title: "The Project",
    description:
      "Objectives, outcomes, target groups, and Erasmus+ funding for Strengthening Higher Education for Smart Cities.",
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

const TARGET_GROUPS = [
  {
    title: "Higher education staff",
    text: "Teaching staff, digital learning teams, technology services, and internationalisation offices across partner universities.",
  },
  {
    title: "University leadership",
    text: "Strategic representatives who shape institutional policy, quality assurance, and sustainability of SHAPE outcomes.",
  },
  {
    title: "Students and learners",
    text: "Undergraduate and postgraduate students, alumni, and professionals seeking smart-city skills for urban labour markets.",
  },
  {
    title: "Cities and civil society",
    text: "Municipal partners, industry practitioners, regional networks, and community stakeholders connected to urban innovation.",
  },
];

export default async function TheProjectPage({ params }: { params: { locale: string } }) {
  const settings = await getSettings(params.locale).catch(() => ({}));
  const home = resolveShapeHomeSettings(settings || {});

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="The Project"
        title={
          <>
            Strengthening higher education{" "}
            <span className="text-secondary">for smart cities</span>
          </>
        }
        subtitle="A three-year Erasmus+ initiative coordinated by the Open University of Kenya, connecting nine universities across Kenya, Uganda, Somalia, Germany, Estonia, and Lithuania."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="shape-eyebrow mb-3">Background</p>
              <h2 className="text-3xl font-serif font-black text-primary-darker uppercase tracking-tight">
                Why SHAPE
              </h2>
            </div>
            <div className="space-y-5 text-slate-600 leading-relaxed">
              <p>
                Cities across East Africa are growing quickly. Universities must prepare graduates who can
                design, govern, and operate smarter urban systems — from digital public services to climate
                resilience and inclusive mobility.
              </p>
              <p>
                SHAPE brings African and European higher-education partners together to modernise curricula,
                share digital pedagogy, and connect learning with municipal and industry practice. Grounded in
                a participative capacity-building approach, it empowers staff, strengthens institutional
                strategies, and fosters partnerships aligned with national development visions and Erasmus+
                CBHE priorities.
              </p>
            </div>
            <EuFundingBadge />
          </div>
          <div className="lg:col-span-5">
            <ProjectInfoCard acronym={home.acronym} erasmusCall={home.erasmusCall} />
          </div>
        </div>
      </section>

      <AboutGoalsSection objectives={OBJECTIVES} outcomes={OUTCOMES} />

      <section className="shape-section bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="shape-eyebrow mb-3">Target groups</p>
            <h2 className="font-serif text-3xl md:text-4xl font-black text-primary-darker uppercase tracking-tight leading-[0.95]">
              Who SHAPE reaches
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              The project is tailored to partner contexts and aims to create a ripple effect across East
              African higher education and city ecosystems.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TARGET_GROUPS.map((group, i) => (
              <article key={group.title} className="border border-slate-200 bg-white p-7">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight mt-3 mb-3">
                  {group.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{group.text}</p>
              </article>
            ))}
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
            <p className="text-slate-600 leading-relaxed mb-5">
              Co-funded by the European Union under Erasmus+. Views expressed are those of the authors and
              do not necessarily reflect those of the EU or EACEA.
            </p>
            <EuFundingBadge />
          </div>
        </div>
      </section>
    </div>
  );
}
