import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ProgressBar from "@/components/shape/ProgressBar";
import { getShapeKpis, getShapeRisks } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/monitoring", params.locale, {
    title: "Monitoring & Evaluation",
    description: "SHAPE M&E KPIs and risk register.",
  });
}

export default async function MonitoringPage() {
  const [kpis, risks] = await Promise.all([getShapeKpis(), getShapeRisks()]);

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="M&E"
        title="Monitoring & evaluation"
        subtitle="Indicator progress, risk register, and mitigation actions for transparent consortium oversight."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 space-y-16">
          <div>
            <p className="shape-eyebrow mb-6">Key performance indicators</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {kpis.map((kpi) => (
                <div key={kpi.id || kpi.key} className="border border-slate-200 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {kpi.label}
                  </p>
                  <p className="font-serif text-3xl font-black text-primary-darker mb-3">
                    {kpi.value}
                    {kpi.unit && typeof kpi.value === "number" ? kpi.unit : ""}
                  </p>
                  {typeof kpi.progress === "number" ? (
                    <ProgressBar value={kpi.progress} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="shape-eyebrow mb-6">Risk register</p>
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {["Risk", "Likelihood", "Impact", "Status", "Mitigation", "Owner"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold text-primary-darker">{r.title}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{r.likelihood}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{r.impact}</td>
                      <td className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">
                        {r.status}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs">{r.mitigation}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{r.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
