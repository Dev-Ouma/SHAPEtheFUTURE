import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { getShapeActivities } from "@/lib/shape-api";
import { withLocaleSeo } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/workplan", params.locale, {
    title: "Workplan",
    description: "SHAPE Gantt-style activity timeline and status tracker.",
  });
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-primary text-white",
  in_progress: "bg-secondary text-white",
  planned: "bg-slate-200 text-slate-700",
  delayed: "bg-red-600 text-white",
};

export default async function WorkplanPage() {
  const activities = await getShapeActivities();

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Delivery calendar"
        title="Workplan"
        subtitle="Activity timeline with status for consortium planning and funder review."
      />
      <section className="shape-section">
        <div className="container mx-auto px-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b-2 border-primary-darker text-left">
                <th className="py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</th>
                <th className="py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400">WP</th>
                <th className="py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Start</th>
                <th className="py-4 pr-4 text-[10px] font-black uppercase tracking-widest text-slate-400">End</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => {
                const key = String(a.status || "planned").toLowerCase();
                return (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-5 pr-4 font-semibold text-primary-darker">{a.title}</td>
                    <td className="py-5 pr-4 text-sm text-slate-500">{a.work_package || "—"}</td>
                    <td className="py-5 pr-4 text-sm text-slate-500">{a.start}</td>
                    <td className="py-5 pr-4 text-sm text-slate-500">{a.end}</td>
                    <td className="py-5">
                      <span
                        className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                          STATUS_STYLE[key] || STATUS_STYLE.planned
                        }`}
                      >
                        {String(a.status).replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-10 space-y-4">
            {activities.map((a) => {
              const start = a.start || "";
              const end = a.end || "";
              return (
                <div key={`gantt-${a.id}`}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>{a.title}</span>
                    <span>
                      {start} – {end}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 relative overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-[8%] w-[40%] ${
                        a.status === "completed"
                          ? "bg-primary"
                          : a.status === "in_progress"
                            ? "bg-secondary"
                            : "bg-slate-300"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
