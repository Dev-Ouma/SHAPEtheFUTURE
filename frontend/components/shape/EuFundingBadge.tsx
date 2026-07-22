import React from "react";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

/** Visual co-funding mark for Erasmus+ public pages (EU emblem + required wording). */
export default function EuFundingBadge({ className = "", variant = "light" }: Props) {
  const text = variant === "dark" ? "text-white" : "text-primary-darker";
  const muted = variant === "dark" ? "text-white/70" : "text-slate-500";
  const border = variant === "dark" ? "border-white/20" : "border-slate-200";

  return (
    <div className={`inline-flex items-center gap-4 border ${border} p-4 ${className}`}>
      <svg
        viewBox="0 0 64 44"
        className="h-11 w-16 shrink-0"
        role="img"
        aria-label="European Union emblem"
      >
        <rect width="64" height="44" fill="#003399" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i * 30 - 90) * Math.PI) / 180;
          const cx = 32 + Math.cos(angle) * 12;
          const cy = 22 + Math.sin(angle) * 12;
          return (
            <polygon
              key={i}
              fill="#FFCC00"
              points="0,-4.2 1.2,-1.3 4.2,-1.3 1.8,0.5 2.7,3.5 0,1.7 -2.7,3.5 -1.8,0.5 -4.2,-1.3 -1.2,-1.3"
              transform={`translate(${cx} ${cy})`}
            />
          );
        })}
      </svg>
      <div className="min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${text}`}>
          Co-funded by the European Union
        </p>
        <p className={`text-[11px] leading-snug mt-1 ${muted}`}>
          Erasmus+ Capacity Building in Higher Education
        </p>
      </div>
    </div>
  );
}
