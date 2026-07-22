"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Calendar, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import ProgressBar from "@/components/shape/ProgressBar";
import { normalizeWorkPackage, type ShapeWorkPackage } from "@/lib/shape-api";

const ease = [0.22, 1, 0.36, 1] as const;

type Filter = "all" | "in_progress" | "not_started" | "completed" | "at_risk";

function statusLabel(status?: string) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "at_risk":
      return "At risk";
    case "not_started":
    default:
      return "Not started";
  }
}

function statusTone(status?: string) {
  switch (status) {
    case "completed":
      return "text-emerald-700 bg-emerald-50";
    case "at_risk":
      return "text-rose-700 bg-rose-50";
    case "in_progress":
      return "text-primary bg-primary/10";
    default:
      return "text-slate-500 bg-slate-100";
  }
}

function AnimatedStat({
  value,
  label,
  suffix = "",
  delay = 0,
}: {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      const steps = 24;
      let step = 0;
      intervalId = window.setInterval(() => {
        if (cancelled) return;
        step += 1;
        const next = Math.round((target * step) / steps);
        setDisplay(next);
        if (step >= steps) {
          setDisplay(target);
          window.clearInterval(intervalId);
        }
      }, 36);
    }, Math.round(delay * 1000));

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [target, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease }}
      className="border-l-2 border-secondary pl-4"
      data-stat-value={target}
    >
      <p className="font-serif text-2xl md:text-3xl font-black text-primary-darker tabular-nums">
        {display}
        {suffix}
      </p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
        {label}
      </p>
    </motion.div>
  );
}

export default function WorkPackagesHubClient({
  packages: packagesRaw,
  eyebrow = "Delivery architecture",
  title = "Eight work packages",
  subtitle = "From consortium governance to curriculum, platforms, pilots, quality, dissemination, and long-term sustainability — each workstream has a lead partner, milestones, and measurable deliverables.",
}: {
  packages: ShapeWorkPackage[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const packages = useMemo(
    () => (packagesRaw || []).map((w) => normalizeWorkPackage(w as any)),
    [packagesRaw],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: packages.length };
    for (const wp of packages) {
      const key = wp.status || "not_started";
      c[key] = (c[key] || 0) + 1;
    }
    return c;
  }, [packages]);

  const filtered = useMemo(() => {
    if (filter === "all") return packages;
    return packages.filter((w) => (w.status || "not_started") === filter);
  }, [packages, filter]);

  const avgProgress = useMemo(() => {
    if (!packages.length) return 0;
    return Math.round(
      packages.reduce((sum, w) => sum + (w.progress || 0), 0) / packages.length,
    );
  }, [packages]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${counts.all || 0})` },
    { id: "in_progress", label: `Active (${counts.in_progress || 0})` },
    { id: "not_started", label: `Upcoming (${counts.not_started || 0})` },
    { id: "completed", label: `Done (${counts.completed || 0})` },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 md:mb-14">
        <div className="max-w-2xl">
          <p className="shape-eyebrow mb-3">{eyebrow}</p>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-primary-darker uppercase tracking-tight leading-[0.95]">
            {title}
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed normal-case tracking-normal">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:gap-6 shrink-0">
          <AnimatedStat value={packages.length} label="Workstreams" delay={0} />
          <AnimatedStat value={avgProgress} label="Avg progress" suffix="%" delay={0.12} />
          <AnimatedStat value={counts.in_progress || 0} label="Active now" delay={0.24} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              filter === tab.id
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-0">
        <AnimatePresence mode="popLayout">
          {filtered.map((wp, index) => {
            const deliverableCount = Array.isArray(wp.deliverables) ? wp.deliverables.length : 0;
            return (
              <motion.article
                key={wp.id || wp.slug}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease }}
                className="group border-t border-slate-200 last:border-b"
              >
                <Link
                  href={`/work-packages/${wp.slug}`}
                  className="grid lg:grid-cols-12 gap-6 lg:gap-8 py-8 md:py-10 items-start"
                >
                  <div className="lg:col-span-2 flex lg:flex-col gap-3 lg:gap-2">
                    <span className="font-serif text-3xl md:text-4xl font-black text-primary/80 tabular-nums leading-none group-hover:text-secondary transition-colors">
                      {wp.code}
                    </span>
                    <span
                      className={`inline-flex self-start text-[9px] font-black uppercase tracking-widest px-2 py-1 ${statusTone(wp.status)}`}
                    >
                      {statusLabel(wp.status)}
                    </span>
                  </div>

                  <div className="lg:col-span-6 relative pl-4 md:pl-5">
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary scale-y-0 origin-top transition-transform duration-500 group-hover:scale-y-100" />
                    <h3 className="font-serif text-2xl md:text-3xl font-black text-primary-darker uppercase tracking-tight leading-[0.95] group-hover:text-primary transition-colors">
                      {wp.title}
                    </h3>
                    <p className="mt-3 text-slate-600 leading-relaxed normal-case tracking-normal line-clamp-3">
                      {wp.summary || wp.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {wp.leader ? (
                        <span className="inline-flex items-center gap-1.5 text-primary">
                          <Users size={12} />
                          {wp.leader}
                        </span>
                      ) : null}
                      {(wp.timeline_start || wp.timeline_end) && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} />
                          {[wp.timeline_start, wp.timeline_end]
                            .filter(Boolean)
                            .map((d) => String(d).slice(0, 7))
                            .join(" → ")}
                        </span>
                      )}
                      {deliverableCount ? <span>{deliverableCount} deliverables</span> : null}
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col justify-between gap-4 min-h-[5rem]">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Progress</span>
                        <span className="text-primary-darker tabular-nums">{wp.progress ?? 0}%</span>
                      </div>
                      <ProgressBar value={wp.progress ?? 0} className="h-2" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                      Open workstream
                      <ArrowUpRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {!filtered.length ? (
          <p className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200">
            No work packages match this filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
