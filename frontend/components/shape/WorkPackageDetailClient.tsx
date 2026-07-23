"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, CircleDashed, Flag, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import ProgressBar from "@/components/shape/ProgressBar";
import {
  normalizeWorkPackage,
  type ShapeActivity,
  type ShapeDocument,
  type ShapeWorkPackage,
} from "@/lib/shape-api";

const ease = [0.22, 1, 0.36, 1] as const;

function statusLabel(status?: string) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "completed":
    case "done":
      return "Completed";
    case "at_risk":
      return "At risk";
    case "planned":
      return "Planned";
    default:
      return status ? status.replace(/_/g, " ") : "Not started";
  }
}

function asItemList<T extends { title: string; status?: string; due?: string }>(
  value: unknown,
): T[] {
  if (Array.isArray(value)) {
    return value.filter(
      (v) => v && typeof v === "object" && "title" in (v as object) && (v as T).title,
    ) as T[];
  }
  return [];
}

export default function WorkPackageDetailClient({
  wp: wpRaw,
  activities = [],
  documents = [],
}: {
  wp: ShapeWorkPackage;
  activities?: ShapeActivity[];
  documents?: ShapeDocument[];
}) {
  const wp = useMemo(() => normalizeWorkPackage(wpRaw as any), [wpRaw]);
  const milestones = asItemList<{ title: string; due?: string; status?: string }>(wp.milestones);
  const deliverables = asItemList<{ title: string; status?: string }>(wp.deliverables);

  const objectiveLines = (wp.objectives || "")
    .split(/\n|•|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="bg-white">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#013d48] via-[#025a69] to-[#037b90] pt-40 pb-20 md:pt-48 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-secondary/25 blur-3xl"
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="max-w-4xl"
          >
            <Link
              href="/work-packages"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-secondary mb-8"
            >
              <ArrowLeft size={14} /> All work packages
            </Link>
            <p className="text-secondary text-[11px] font-black tracking-[0.4em] uppercase mb-4">
              {wp.code} · {statusLabel(wp.status)}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] mb-5">
              {wp.title}
            </h1>
            <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl normal-case tracking-normal">
              {wp.summary || wp.description}
            </p>
            <div className="mt-10 max-w-md">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">
                <span>Progress</span>
                <span>{wp.progress ?? 0}%</span>
              </div>
              <ProgressBar value={wp.progress ?? 0} tone="secondary" className="h-2.5 bg-white/20" />
            </div>
          </motion.div>
        </div>
      </header>

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              <p className="shape-eyebrow mb-4">Overview</p>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg normal-case tracking-normal">
                {(wp.description || wp.summary || "")
                  .split(/\n\n+/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
              </div>
            </motion.div>

            {objectiveLines.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="shape-eyebrow mb-6">Objectives</p>
                <ol className="space-y-0">
                  {objectiveLines.map((line, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[3.5rem_1fr] gap-4 py-5 border-t border-slate-200 last:border-b"
                    >
                      <span className="font-serif text-2xl font-black text-primary/70 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-primary-darker font-medium leading-relaxed normal-case tracking-normal pt-1">
                        {line}
                      </p>
                    </li>
                  ))}
                </ol>
              </motion.div>
            ) : null}

            {milestones.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="shape-eyebrow mb-6">Milestones</p>
                <ul className="space-y-0">
                  {milestones.map((m, i) => {
                    const done =
                      m.status === "completed" ||
                      m.status === "done" ||
                      m.status === "complete";
                    return (
                      <li
                        key={`${m.title}-${i}`}
                        className="flex gap-4 py-5 border-t border-slate-200 last:border-b group"
                      >
                        <span className="mt-0.5 text-secondary">
                          {done ? <CheckCircle2 size={18} /> : <CircleDashed size={18} />}
                        </span>
                        <div className="flex-1 flex flex-wrap justify-between gap-3">
                          <span className="font-semibold text-primary-darker normal-case tracking-normal">
                            {m.title}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {[m.due, statusLabel(m.status)].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ) : null}

            {deliverables.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="shape-eyebrow mb-6">Deliverables</p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {deliverables.map((d, i) => (
                    <li
                      key={`${d.title}-${i}`}
                      className="border-l-2 border-primary pl-4 py-1"
                    >
                      <p className="font-medium text-primary-darker normal-case tracking-normal">
                        {d.title}
                      </p>
                      {d.status ? (
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-secondary">
                          {statusLabel(d.status)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            {activities.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="shape-eyebrow mb-6">Linked activities</p>
                <ul className="divide-y divide-slate-100 border border-slate-200">
                  {activities.map((a) => (
                    <li key={a.id} className="flex flex-wrap justify-between gap-3 px-5 py-4">
                      <span className="font-semibold text-primary-darker normal-case tracking-normal">
                        {a.title}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {[a.start, a.end].filter(Boolean).join(" → ")} · {statusLabel(a.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            {documents.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="shape-eyebrow mb-4">Documents</p>
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id || doc.title}>
                      {doc.file_url ? (
                        <a
                          href={doc.file_url}
                          className="text-primary font-semibold hover:text-secondary normal-case tracking-normal"
                        >
                          {doc.title}
                        </a>
                      ) : (
                        <span className="text-slate-600 normal-case tracking-normal">{doc.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 self-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-slate-200 p-7 space-y-6 bg-gradient-to-br from-slate-50 to-white"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <Users size={12} className="text-secondary" /> Lead partner
                </p>
                <p className="font-serif text-xl font-black text-primary-darker uppercase tracking-tight">
                  {wp.leader || "TBC"}
                </p>
              </div>
              {(wp.timeline_start || wp.timeline_end) && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <Calendar size={12} className="text-secondary" /> Timeline
                  </p>
                  <p className="text-sm text-slate-600 normal-case tracking-normal">
                    {[wp.timeline_start, wp.timeline_end].filter(Boolean).join(" → ")}
                  </p>
                </div>
              )}
              {wp.partners?.length ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <Flag size={12} className="text-secondary" /> Contributing partners
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {wp.partners.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>

            <Link
              href="/work-packages#workplan"
              className="block w-full text-center bg-primary text-white py-4 text-[11px] font-black uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              View full workplan
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
