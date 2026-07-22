"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ShapeSdlcStage } from "@/lib/shape-api";
import ProgressBar from "@/components/shape/ProgressBar";

const TEAL = "#037b90";
const TEAL_DARK = "#025a6b";
const CORAL = "#ff7f50";
const SIZE = 640;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 210;
const STROKE = 78;

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function statusTone(status?: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("complete")) return CORAL;
  if (s.includes("progress") || s.includes("ongoing")) return TEAL;
  return "#94a3b8";
}

function statusLabel(status?: string) {
  const s = (status || "planned").replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pickInitialStage(stages: ShapeSdlcStage[]) {
  return (
    stages.find((s) => /in_progress|ongoing/i.test(s.status || "")) ||
    stages.find((s) => (s.progress ?? 0) > 0 && (s.progress ?? 0) < 100) ||
    stages[0]
  );
}

export default function SdlcDonutClient({
  stages,
  tone = "light",
}: {
  stages: ShapeSdlcStage[];
  tone?: "light" | "hero";
}) {
  const hero = tone === "hero";
  const reduceMotion = useReducedMotion();
  const ordered = useMemo(
    () => [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stages],
  );
  const [activeId, setActiveId] = useState(() => pickInitialStage(ordered)?.id || "");
  const [popupOpen, setPopupOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!ordered.length) return;
    setActiveId((prev) => {
      if (prev && ordered.some((s) => s.id === prev)) return prev;
      return pickInitialStage(ordered)?.id || "";
    });
  }, [ordered]);

  useEffect(() => {
    if (!popupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [popupOpen]);

  const openStage = (id: string) => {
    setActiveId(id);
    setPopupOpen(true);
  };

  const active = ordered.find((s) => s.id === activeId) || ordered[0];
  const activeIndex = ordered.findIndex((s) => s.id === active?.id);
  const n = Math.max(ordered.length, 1);
  const overall = Math.round(
    ordered.reduce((sum, s) => sum + (s.progress ?? 0), 0) / n,
  );

  const nodes = ordered.map((stage, i) => {
    const angle = (360 / n) * i;
    const tip = polar(angle, R);
    const rad = ((angle - 90) * Math.PI) / 180;
    // Flat screen-space placement — keep labels clear of the center HUD
    const labelLeft = 50 + Math.cos(rad) * 48;
    const labelTop = 50 + Math.sin(rad) * 48;
    return { stage, angle, tip, labelLeft, labelTop, color: statusTone(stage.status) };
  });

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="relative mx-auto max-w-6xl">
        {/* Atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div
            className={`absolute left-1/2 top-[42%] h-[55%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-2xl ${
              hero
                ? "bg-[radial-gradient(ellipse_at_center,rgba(255,127,80,0.28),transparent_68%)]"
                : "bg-[radial-gradient(ellipse_at_center,rgba(3,123,144,0.22),transparent_68%)]"
            }`}
          />
          <div className="absolute left-1/2 top-[62%] h-28 w-[70%] -translate-x-1/2 rounded-[100%] bg-black/25 blur-3xl" />
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[920px] overflow-visible">
          {/* Donut graphic — kept nearly flat so labels stay aligned & readable */}
          <div className="absolute inset-[12%] z-0">
            <motion.div
              className="absolute inset-0"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -3, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 9, repeat: Infinity, ease: "easeInOut" }
              }
            >
            {/* Extruded torus body — stacked ellipses for real 3D dough depth */}
            {Array.from({ length: 12 }).map((_, layer) => (
              <div
                key={layer}
                aria-hidden
                className="absolute left-1/2 top-1/2 rounded-full"
                style={{
                  width: R * 2 + STROKE + 8,
                  height: (R * 2 + STROKE) * 0.96,
                  marginLeft: -(R + STROKE / 2 + 4),
                  marginTop: -((R * 2 + STROKE) * 0.96) / 2,
                  background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.12), transparent 42%),
                    linear-gradient(135deg, ${TEAL_DARK}, ${TEAL} 48%, ${CORAL})`,
                  opacity: 0.1 + layer * 0.055,
                  transform: `translateZ(${-8 - layer * 7}px) rotateX(0deg)`,
                  boxShadow: layer === 11 ? `0 30px 50px rgba(2,60,70,0.35)` : undefined,
                  WebkitMaskImage:
                    "radial-gradient(farthest-side, transparent calc(100% - 86px), #000 calc(100% - 84px))",
                  maskImage:
                    "radial-gradient(farthest-side, transparent calc(100% - 86px), #000 calc(100% - 84px))",
                }}
              />
            ))}

            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="relative h-full w-full drop-shadow-[0_28px_40px_rgba(2,60,70,0.35)]"
              role="img"
              aria-label="SHAPE project development cycle doughnut"
            >
              <defs>
                <linearGradient id="sdlcRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={TEAL_DARK} />
                  <stop offset="45%" stopColor={TEAL} />
                  <stop offset="100%" stopColor={CORAL} />
                </linearGradient>
                <linearGradient id="sdlcFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={CORAL} stopOpacity="0" />
                  <stop offset="50%" stopColor={CORAL} />
                  <stop offset="100%" stopColor="#fff7ed" stopOpacity="0.2" />
                </linearGradient>
                <filter id="sdlcGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker
                  id="sdlcArrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={CORAL} />
                </marker>
                <marker
                  id="sdlcArrowTeal"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e0f7fa" />
                </marker>
              </defs>

              {/* Soft floor ellipse */}
              <ellipse
                cx={CX}
                cy={CY + R + 36}
                rx={R + 40}
                ry={28}
                fill="rgba(15,23,42,0.12)"
              />

              {/* Main doughnut body */}
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="url(#sdlcRing)"
                strokeWidth={STROKE}
                strokeLinecap="butt"
                filter="url(#sdlcGlow)"
                opacity={0.95}
              />
              {/* Inner bevel */}
              <circle
                cx={CX}
                cy={CY}
                r={R - STROKE * 0.28}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={6}
              />
              <circle
                cx={CX}
                cy={CY}
                r={R + STROKE * 0.28}
                fill="none"
                stroke="rgba(2,60,70,0.35)"
                strokeWidth={5}
              />

              {/* Segment ticks */}
              {nodes.map((node, i) => {
                const a0 = (360 / n) * i - 360 / n / 2;
                const a1 = (360 / n) * i + 360 / n / 2;
                const len = ((a1 - a0) / 360) * 2 * Math.PI * R;
                const circ = 2 * Math.PI * R;
                return (
                  <circle
                    key={`seg-${node.stage.id}`}
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={10}
                    strokeDasharray={`${len * 0.82} ${circ}`}
                    strokeDashoffset={-((a0 + 90) / 360) * circ}
                    opacity={node.stage.id === activeId ? 1 : 0.55}
                    className="transition-opacity duration-300"
                  />
                );
              })}

              {/* Outer flow lane + racing dashes */}
              <circle
                cx={CX}
                cy={CY}
                r={R + 46}
                fill="none"
                stroke="rgba(3,123,144,0.18)"
                strokeWidth={10}
              />
              <motion.circle
                cx={CX}
                cy={CY}
                r={R + 46}
                fill="none"
                stroke="url(#sdlcFlow)"
                strokeWidth={7}
                strokeDasharray="26 34"
                strokeLinecap="round"
                animate={reduceMotion ? undefined : { strokeDashoffset: [0, -360] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 3.8, repeat: Infinity, ease: "linear" }
                }
              />
              <motion.circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={4}
                strokeDasharray="12 22"
                strokeLinecap="round"
                animate={reduceMotion ? undefined : { strokeDashoffset: [0, 240] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 5.5, repeat: Infinity, ease: "linear" }
                }
              />

              {/* Bold curved stage-to-stage arrows on outer lane */}
              {nodes.map((node, i) => {
                const next = nodes[(i + 1) % n];
                const midAngle = node.angle + 360 / n / 2;
                const start = polar(node.angle + (360 / n) * 0.28, R + 46);
                const end = polar(next.angle - (360 / n) * 0.28, R + 46);
                const mid = polar(midAngle, R + 58);
                const d = `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
                return (
                  <motion.path
                    key={`arrow-${node.stage.id}`}
                    d={d}
                    fill="none"
                    stroke={i % 2 === 0 ? CORAL : TEAL}
                    strokeWidth={5}
                    markerEnd={i % 2 === 0 ? "url(#sdlcArrow)" : "url(#sdlcArrowTeal)"}
                    initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      delay: 0.12 + i * 0.07,
                      duration: 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                );
              })}

              {/* Triple orbiting arrow heads */}
              {!reduceMotion
                ? [0, 120, 240].map((offset) => (
                    <motion.g
                      key={offset}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "linear",
                        delay: offset / 360,
                      }}
                      style={{ transformOrigin: `${CX}px ${CY}px` }}
                    >
                      <g transform={`translate(${CX}, ${CY - (R + 46)}) rotate(90)`}>
                        <polygon
                          points="0,-12 22,0 0,12"
                          fill={offset === 0 ? CORAL : "#e0f7fa"}
                          stroke={TEAL_DARK}
                          strokeWidth={1}
                        />
                      </g>
                    </motion.g>
                  ))
                : null}

              {/* Stage nodes */}
              {nodes.map((node, i) => {
                const isActive = node.stage.id === activeId;
                return (
                  <g key={node.stage.id}>
                    <motion.circle
                      cx={node.tip.x}
                      cy={node.tip.y}
                      r={isActive ? 22 : 16}
                      fill={isActive ? CORAL : "#fff"}
                      stroke={node.color}
                      strokeWidth={4}
                      filter={isActive ? "url(#sdlcGlow)" : undefined}
                      className="cursor-pointer"
                      onClick={() => openStage(node.stage.id)}
                      whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                      animate={
                        reduceMotion || !/progress/i.test(node.stage.status || "")
                          ? undefined
                          : { scale: [1, 1.08, 1] }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                    <text
                      x={node.tip.x}
                      y={node.tip.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      fill={isActive ? "#fff" : TEAL_DARK}
                      fontSize={isActive ? 14 : 12}
                      fontWeight={800}
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            </motion.div>
          </div>

          {/* Flat upright labels */}
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {nodes.map((node, i) => {
              const isActive = node.stage.id === activeId;
              return (
                <button
                  key={`label-${node.stage.id}`}
                  type="button"
                  onClick={() => openStage(node.stage.id)}
                  className={`pointer-events-auto absolute w-[7.25rem] sm:w-[8.25rem] rounded px-2 py-1.5 text-center text-[11px] sm:text-[12px] font-black uppercase leading-snug tracking-wide shadow-md transition-colors ${
                    isActive
                      ? "bg-secondary text-white ring-2 ring-white/70"
                      : "bg-white text-primary-darker hover:bg-secondary hover:text-white"
                  }`}
                  style={{
                    left: `${node.labelLeft}%`,
                    top: `${node.labelTop}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span
                    className={`block text-[9px] font-black tracking-widest mb-0.5 ${
                      isActive ? "text-white/85" : "text-primary"
                    }`}
                  >
                    Stage {i + 1}
                  </span>
                  {node.stage.title}
                </button>
              );
            })}
          </div>

          {/* Donut hole HUD */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="pointer-events-auto w-[36%] max-w-[200px] text-center rounded-md bg-white px-3 py-4 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 text-primary">
                Cycle progress
              </p>
              <motion.p
                key={overall}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-4xl md:text-5xl font-black leading-none text-primary-darker"
              >
                {overall}
                <span className="text-xl text-secondary">%</span>
              </motion.p>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {ordered.length} stages
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage picker cards — click to open info popup */}
      <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {ordered.map((s, i) => {
          const isActive = s.id === activeId && popupOpen;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => openStage(s.id)}
              className={`text-left border px-3 py-3 transition-colors ${
                isActive
                  ? "bg-secondary text-white border-secondary"
                  : "bg-white text-primary-darker border-white/40 hover:border-secondary"
              }`}
            >
              <p
                className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  isActive ? "text-white/80" : "text-secondary"
                }`}
              >
                Stage {i + 1}
              </p>
              <p className="text-[11px] font-black uppercase leading-snug tracking-wide">
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stage detail popup (portaled so overflow parents can't clip it) */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {popupOpen && active ? (
                <motion.div
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    aria-label="Close stage details"
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setPopupOpen(false)}
                  />
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sdlc-stage-title"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200 shadow-2xl p-6 md:p-8"
                  >
                    <button
                      type="button"
                      onClick={() => setPopupOpen(false)}
                      className="absolute right-4 top-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary"
                    >
                      Close
                    </button>

                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2 pr-16">
                      Stage {active.order ?? activeIndex + 1} · {statusLabel(active.status)}
                    </p>
                    <h2
                      id="sdlc-stage-title"
                      className="font-serif text-2xl md:text-3xl font-black text-primary-darker uppercase tracking-tight mb-2"
                    >
                      {active.title}
                    </h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">
                      {active.progress ?? 0}% complete
                    </p>

                    {active.description ? (
                      <p className="text-slate-600 leading-relaxed mb-4">{active.description}</p>
                    ) : null}

                    {active.objectives && active.objectives !== active.description ? (
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                          Objectives
                        </p>
                        <p className="text-slate-600 leading-relaxed">{active.objectives}</p>
                      </div>
                    ) : null}

                    <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Progress</span>
                      <span>{active.progress ?? 0}%</span>
                    </div>
                    <ProgressBar value={active.progress ?? 0} />

                    {active.outputs ? (
                      <p className="text-sm text-slate-600 mt-5">
                        <span className="font-black uppercase tracking-widest text-[10px] text-primary mr-2">
                          Outputs
                        </span>
                        {active.outputs}
                      </p>
                    ) : null}

                    {active.evidence ? (
                      <p className="text-sm text-slate-500 mt-3">
                        <span className="font-black uppercase tracking-widest text-[10px] text-primary mr-2">
                          Evidence
                        </span>
                        {active.evidence}
                      </p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap gap-2">
                      {ordered.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => openStage(s.id)}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                            s.id === active.id
                              ? "bg-primary text-white border-primary"
                              : "border-slate-200 text-slate-500 hover:border-primary"
                          }`}
                        >
                          {i + 1}. {s.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
