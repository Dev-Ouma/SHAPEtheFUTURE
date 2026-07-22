"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { MapPin, ExternalLink } from "lucide-react";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";
import "leaflet/dist/leaflet.css";

const TEAL = "#037b90";
const CORAL = "#ff7f50";

function pinHtml(active: boolean, label: string) {
  const color = active ? CORAL : TEAL;
  const size = active ? 34 : 28;
  return `<div style="
    width:${size}px;height:${size}px;border-radius:9999px;
    background:${color};border:3px solid #fff;
    box-shadow:0 8px 18px rgba(2,60,70,0.35);
    display:flex;align-items:center;justify-content:center;
    color:#fff;font:800 10px/1 ui-sans-serif,system-ui,sans-serif;
    letter-spacing:0.04em;
  ">${label}</div>`;
}

export default function ProjectMapClient({ partners }: { partners: ShapePartner[] }) {
  const located = useMemo(
    () => partners.filter((p) => p.lat != null && p.lng != null),
    [partners],
  );
  const [active, setActive] = useState<ShapePartner | null>(located[0] || partners[0] || null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const LRef = useRef<any>(null);
  const skipFly = useRef(true);

  useEffect(() => {
    let cancelled = false;
    let map: any;

    async function boot() {
      try {
        const leaflet = await import("leaflet");
        if (cancelled || !mapEl.current) return;
        const L = leaflet.default || leaflet;
        LRef.current = L;

        map = L.map(mapEl.current, {
          scrollWheelZoom: true,
          worldCopyJump: true,
        });
        mapRef.current = map;

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO',
          maxZoom: 18,
        }).addTo(map);

        const pts = located.map((p) => [p.lat!, p.lng!] as [number, number]);
        const bounds = L.latLngBounds(pts);
        if (pts.length === 1) map.setView(pts[0], 6);
        else map.fitBounds(bounds, { padding: [48, 48], maxZoom: 5 });

        const coordinator =
          located.find((p) =>
            /open university of kenya|ouk/i.test(`${p.name} ${p.short_name || ""}`),
          ) || located[0];

        if (coordinator) {
          located
            .filter((p) => p.slug !== coordinator.slug)
            .forEach((p, i) => {
              L.polyline(
                [
                  [coordinator.lat!, coordinator.lng!],
                  [p.lat!, p.lng!],
                ],
                {
                  color: i % 2 === 0 ? CORAL : TEAL,
                  weight: 1.5,
                  opacity: 0.4,
                  dashArray: "6 8",
                },
              ).addTo(map);
            });
        }

        located.forEach((p) => {
          const label = (p.short_name || p.name.slice(0, 3)).slice(0, 4).toUpperCase();
          const marker = L.marker([p.lat!, p.lng!], {
            icon: L.divIcon({
              className: "shape-map-pin",
              iconSize: [28, 28],
              iconAnchor: [14, 28],
              popupAnchor: [0, -24],
              html: pinHtml(false, label),
            }),
          }).addTo(map);

          marker.bindPopup(
            `<div style="min-width:150px">
              <p style="margin:0 0 4px;font:800 10px/1.2 ui-sans-serif,system-ui;letter-spacing:.12em;text-transform:uppercase;color:${CORAL}">${p.country || ""}</p>
              <p style="margin:0;font:700 14px/1.3 ui-sans-serif,system-ui;color:#024955">${p.name}</p>
              ${p.city ? `<p style="margin:6px 0 0;font:500 12px/1.3 ui-sans-serif,system-ui;color:#64748b">${p.city}</p>` : ""}
            </div>`,
          );
          marker.on("click", () => setActive(p));
          markersRef.current[p.slug] = { marker, label };
        });

        setReady(true);
        setTimeout(() => map.invalidateSize(), 80);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Could not load map");
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
    // Intentionally once on mount with initial located set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker styles + fly-to in sync with selection
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !active?.lat || !active?.lng) return;

    Object.entries(markersRef.current).forEach(([slug, entry]: any) => {
      const isActive = slug === active.slug;
      entry.marker.setIcon(
        L.divIcon({
          className: "shape-map-pin",
          iconSize: [isActive ? 34 : 28, isActive ? 34 : 28],
          iconAnchor: [isActive ? 17 : 14, isActive ? 34 : 28],
          popupAnchor: [0, -24],
          html: pinHtml(isActive, entry.label),
        }),
      );
      entry.marker.setZIndexOffset(isActive ? 1000 : 0);
    });

    if (skipFly.current) {
      skipFly.current = false;
      return;
    }
    map.flyTo([active.lat, active.lng], Math.max(map.getZoom(), 5), { duration: 0.85 });
  }, [active]);

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 relative min-h-[420px] md:min-h-[560px] aspect-[4/3] md:aspect-auto border border-slate-200 overflow-hidden bg-slate-100">
        <div ref={mapEl} className="absolute inset-0 z-0" />
        {!ready && !error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-100/80">
            Loading map…
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-red-600 bg-slate-50 p-6 text-center">
            {error}
          </div>
        ) : null}
        <div className="pointer-events-none absolute left-3 bottom-3 z-[500] bg-white/95 border border-slate-200 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
          OpenStreetMap · {located.length} partner pins
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-4">
        {active ? (
          <div className="border border-slate-200 p-6 space-y-4 bg-white">
            <div className="flex items-start gap-4">
              {active.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(active.logo_url) || active.logo_url}
                  alt=""
                  className="h-12 w-12 object-contain border border-slate-100 bg-white p-1"
                />
              ) : (
                <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin size={20} />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
                  {active.country}
                </p>
                <h2 className="font-serif text-xl md:text-2xl font-black text-primary-darker uppercase tracking-tight leading-tight">
                  {active.name}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <MapPin size={14} className="text-primary shrink-0" />
              {[active.city, active.country].filter(Boolean).join(", ")}
              {active.lat != null && active.lng != null ? (
                <span className="text-[10px] font-mono text-slate-400">
                  {Number(active.lat).toFixed(3)}, {Number(active.lng).toFixed(3)}
                </span>
              ) : null}
            </p>

            {active.role || active.consortium_role ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                {active.role || active.consortium_role}
              </p>
            ) : null}

            {active.responsibilities || active.description ? (
              <p className="text-sm text-slate-600 leading-relaxed">
                {active.responsibilities || active.description}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-1">
              <Link
                href={`/partners/${active.slug}`}
                className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary"
              >
                Partner profile →
              </Link>
              {active.website || active.website_url ? (
                <a
                  href={active.website || active.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary"
                >
                  Website <ExternalLink size={12} />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-2 max-h-[28rem] overflow-y-auto custom-scrollbar">
          {partners.map((p) => {
            const hasPin = p.lat != null && p.lng != null;
            return (
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
                <span className="flex items-center justify-between gap-2">
                  <span>{p.name}</span>
                  {hasPin ? <MapPin size={14} className="text-secondary shrink-0" /> : null}
                </span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {[p.city, p.country].filter(Boolean).join(" · ")}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
