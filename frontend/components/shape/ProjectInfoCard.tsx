import React from "react";
import EuFundingBadge from "@/components/shape/EuFundingBadge";

type Props = {
  acronym: string;
  erasmusCall: string;
  duration?: string;
  coordinator?: string;
  countries?: string;
  showBadge?: boolean;
};

export default function ProjectInfoCard({
  acronym,
  erasmusCall,
  duration = "36 months · 2025 – 2028",
  coordinator = "Open University of Kenya",
  countries = "Kenya, Uganda, Somalia, Germany, Estonia, Lithuania",
  showBadge = true,
}: Props) {
  const rows = [
    { label: "Acronym", value: acronym },
    { label: "Erasmus+ Call", value: erasmusCall },
    { label: "Duration", value: duration },
    { label: "Coordinator", value: coordinator },
    { label: "Countries", value: countries },
  ];

  return (
    <aside className="border border-slate-200 bg-white overflow-hidden h-fit">
      <div className="bg-primary-darker px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-secondary">
          Project information
        </p>
        <h3 className="font-serif text-2xl font-black text-white uppercase tracking-tight mt-2">
          Fact sheet
        </h3>
      </div>
      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="px-6 py-4">
            <dt className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1.5">
              {row.label}
            </dt>
            <dd className="text-sm text-slate-700 leading-relaxed">{row.value}</dd>
          </div>
        ))}
      </dl>
      {showBadge ? (
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
          <EuFundingBadge className="w-full bg-white" />
        </div>
      ) : null}
    </aside>
  );
}
