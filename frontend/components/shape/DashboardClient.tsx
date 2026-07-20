"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { ProgressRing } from "@/components/shape/ProgressBar";
import type { ShapeDashboard, ShapeKpi } from "@/lib/shape-api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardClient({
  dashboard,
  kpis,
}: {
  dashboard: ShapeDashboard;
  kpis: ShapeKpi[];
}) {
  const barLabels = ["Meetings", "Students", "Training", "Research"];
  const barValues = [
    dashboard.meetings,
    dashboard.students_reached,
    dashboard.training_sessions,
    dashboard.research_outputs,
  ];

  return (
    <div className="space-y-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
        <div className="flex flex-col items-center gap-3">
          <ProgressRing value={dashboard.overall_completion} label="Overall" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <ProgressRing value={dashboard.budget_utilization} label="Budget" />
        </div>
        <div className="border border-slate-200 p-6 text-center">
          <p className="font-serif text-4xl font-black text-primary-darker">
            {dashboard.deliverables_done}
            <span className="text-slate-300 text-2xl">/{dashboard.deliverables_total}</span>
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
            Deliverables
          </p>
        </div>
        <div className="border border-slate-200 p-6 text-center">
          <p className="font-serif text-4xl font-black text-primary-darker">{dashboard.countries}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
            Countries engaged
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="border border-slate-200 p-6">
          <p className="shape-eyebrow mb-6">Completion mix</p>
          <div className="max-w-xs mx-auto">
            <Doughnut
              data={{
                labels: ["Complete", "Remaining"],
                datasets: [
                  {
                    data: [dashboard.overall_completion, 100 - dashboard.overall_completion],
                    backgroundColor: ["#037b90", "#e2e8f0"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </div>
        <div className="border border-slate-200 p-6">
          <p className="shape-eyebrow mb-6">Reach indicators</p>
          <Bar
            data={{
              labels: barLabels,
              datasets: [
                {
                  label: "Count",
                  data: barValues,
                  backgroundColor: "#ff7f50",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      <div>
        <p className="shape-eyebrow mb-6">KPI register</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id || kpi.key} className="shape-stat border border-slate-100 p-5">
              <span className="shape-stat-value text-2xl">
                {kpi.value}
                {kpi.unit && typeof kpi.value === "number" ? kpi.unit : ""}
              </span>
              <span className="shape-stat-label">{kpi.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
