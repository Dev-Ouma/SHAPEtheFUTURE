"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import type { ShapePartner } from "@/lib/shape-api";

/** Stylized Europe–Africa map with clickable partner pins (no Leaflet dependency). */
export default function ProjectMapClient({ partners }: { partners: ShapePartner[] }) {
  const [active, setActive] = useState<ShapePartner | null>(partners[0] || null);

  // Rough projection: lon -20..55 → x 5..95%, lat -5..60 → y 90..10%
  const pin = (lat?: number, lng?: number) => {
    if (lat == null || lng == null) return null;
    const x = ((lng + 20) / 75) * 90 + 5;
    const y = ((60 - lat) / 65) * 80 + 8;
    return { left: `${Math.min(95, Math.max(3, x))}%`, top: `${Math.min(92, Math.max(5, y))}%` };
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 relative aspect-[4/3] md:aspect-[16/10] bg-gradient-to-br from-[#013d48] via-[#025a69] to-[#037b90] overflow-hidden border border-slate-200">
        <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            d="M120,80 C180,40 260,50 300,90 C340,40 420,30 480,70 C520,20 600,40 640,90 C700,60 760,100 740,160 C780,220 720,280 680,300 C700,360 640,420 560,400 C480,460 380,440 320,390 C240,430 160,400 120,340 C60,300 40,220 80,160 Z"
          />
          <path
            fill="none"
            stroke="#ff7f50"
            strokeWidth="1"
            d="M280,280 C320,300 360,340 380,400 C340,440 280,450 240,420 C200,380 220,320 280,280 Z"
          />
        </svg>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {partners.map((p) => {
          const pos = pin(p.lat, p.lng);
          if (!pos) return null;
          const isActive = active?.slug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p)}
              style={pos}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 transition-transform ${
                isActive
                  ? "bg-secondary border-white scale-150 z-10"
                  : "bg-white border-primary hover:scale-125"
              }`}
              title={p.name}
              aria-label={p.name}
            />
          );
        })}

        <div className="absolute bottom-4 left-4 text-[9px] font-black uppercase tracking-widest text-white/70">
          Europe · East Africa
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-4">
        {active ? (
          <div className="border border-slate-200 p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
              {active.country}
            </p>
            <h2 className="font-serif text-2xl font-black text-primary-darker uppercase tracking-tight">
              {active.name}
            </h2>
            <p className="text-sm text-slate-500">{active.role || "Partner"} · {active.city}</p>
            {active.responsibilities ? (
              <p className="text-sm text-slate-600 leading-relaxed">{active.responsibilities}</p>
            ) : null}
            <Link
              href={`/partners/${active.slug}`}
              className="inline-block text-[11px] font-black uppercase tracking-widest text-primary"
            >
              Partner profile →
            </Link>
          </div>
        ) : null}

        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {partners.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p)}
              className={`w-full text-left px-4 py-3 border text-sm font-semibold transition-colors ${
                active?.slug === p.slug
                  ? "border-primary bg-primary/5 text-primary-darker"
                  : "border-slate-100 text-slate-600 hover:border-primary/40"
              }`}
            >
              {p.name}
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                {p.country}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
