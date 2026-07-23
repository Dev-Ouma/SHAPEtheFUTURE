"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import {
  HERO_MOTION,
  type ShapeMotionType,
  pageClipPath,
} from "@/lib/shape-motion";

export type HeroSlide = {
  src: string;
  alt: string;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    src: "/images/shape/smart-city-nairobi.jpg",
    alt: "Nairobi skyline — East African smart-city growth",
  },
  {
    src: "/images/shape/african-students.jpg",
    alt: "African university students in class",
  },
  {
    src: "/images/shape/smart-city-night.jpg",
    alt: "Smart city lights and digital urban infrastructure",
  },
  {
    src: "/images/shape/african-professionals.jpg",
    alt: "African professionals collaborating in higher education",
  },
  {
    src: "/images/shape/african-city-street.jpg",
    alt: "Vibrant African city street life",
  },
  {
    src: "/images/shape/african-graduates.jpg",
    alt: "African graduates celebrating academic achievement",
  },
  {
    src: "/images/shape/hero-skyline.jpg",
    alt: "Modern skyline at dusk — connected urban futures",
  },
  {
    src: "/images/shape/chapter-digital.jpg",
    alt: "Digital learning tools for smart cities",
  },
];

/** Soft landing ease — decisive open, calm finish */
function pageEase(t: number): number {
  const p = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - p, 2.6);
}

function edgeOpacityAt(progress: number): number {
  if (progress <= 0) return 0;
  if (progress < 0.1) return (progress / 0.1) * 0.85;
  if (progress < 0.75) return 0.85 - ((progress - 0.1) / 0.65) * 0.45;
  if (progress < 0.92) return 0.4 - ((progress - 0.75) / 0.17) * 0.32;
  return Math.max(0, 0.08 * (1 - (progress - 0.92) / 0.08));
}

/**
 * Premium page-sheet hero.
 *
 * Progress is written straight to the DOM on a setTimeout clock so:
 * - React re-renders cannot reset the clip mid-flight
 * - Framer/WAAPI frame clocks (which can stall in some embeds) are not required
 * - Finish commits current + clears overlay in one update (no end shake)
 */
export default function ShapeHeroSlideshow({
  slides = DEFAULT_SLIDES,
  motionType = "page" as Extract<
    ShapeMotionType,
    "page" | "slice" | "shutter" | "fade"
  >,
  intervalMs,
  revealMs,
}: {
  slides?: HeroSlide[];
  motionType?: Extract<ShapeMotionType, "page" | "slice" | "shutter" | "fade">;
  intervalMs?: number;
  revealMs?: number;
  stripCount?: number;
}) {
  const reduce = useReducedMotion();
  const preset = HERO_MOTION[motionType] ?? HERO_MOTION.page;
  const holdMs = intervalMs ?? preset.intervalMs;
  const pageMs = revealMs ?? preset.revealMs;
  const pageMsRef = useRef(pageMs);
  pageMsRef.current = pageMs;

  const list = slides.length ? slides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [incoming, setIncoming] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const revealing = incoming !== null;

  const paintProgress = (p: number) => {
    const sheet = sheetRef.current;
    const edge = edgeRef.current;
    if (sheet) {
      sheet.style.clipPath = p >= 0.999 ? "inset(0%)" : pageClipPath(p);
    }
    if (edge) {
      edge.style.left = `${p * 100}%`;
      edge.style.opacity = String(edgeOpacityAt(p));
    }
  };

  const goTo = useCallback(
    (i: number) => {
      if (revealing || i === current) return;
      setIncoming(i);
    },
    [revealing, current],
  );

  const goNext = useCallback(() => {
    if (revealing) return;
    setIncoming((current + 1) % list.length);
  }, [revealing, current, list.length]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const warm = list[(current + 1) % list.length];
    if (!warm) return;
    const img = new window.Image();
    img.src = warm.src;
  }, [current, list]);

  useEffect(() => {
    if (reduce || list.length < 2 || !active || revealing || paused) return;
    const id = window.setTimeout(goNext, holdMs);
    return () => window.clearTimeout(id);
  }, [reduce, list.length, holdMs, active, revealing, paused, goNext]);

  useLayoutEffect(() => {
    if (incoming === null) return;
    paintProgress(0);
  }, [incoming]);

  useEffect(() => {
    if (incoming === null) return;
    const target = incoming;
    const runId = ++runIdRef.current;
    const duration = pageMsRef.current;
    const started = performance.now();
    let timer = 0;
    let settled = false;

    const settle = () => {
      if (settled || runIdRef.current !== runId) return;
      settled = true;
      paintProgress(1);
      // Single commit: promote plate and drop overlay together — no style
      // reset frame, no rAF handoff that can stall.
      setCurrent(target);
      setIncoming(null);
    };

    // Drive the reveal on the compositor's own vsync clock (rAF) so the wipe
    // is frame-accurate and smooth on 120Hz displays. The failsafe below still
    // guarantees a settle if rAF is ever throttled (e.g. backgrounded embeds).
    let raf = 0;
    const tick = () => {
      if (runIdRef.current !== runId) return;
      const linear = Math.min(1, (performance.now() - started) / duration);
      const eased = pageEase(linear);
      paintProgress(eased);
      // Land as soon as the sheet is visually fully open (not only at linear=1)
      if (linear >= 1 || eased >= 0.999) {
        settle();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    const failsafe = window.setTimeout(settle, duration + 120);

    return () => {
      if (runIdRef.current === runId) runIdRef.current++;
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [incoming]);

  if (reduce) {
    return (
      <div ref={rootRef} className="absolute inset-0">
        <SafeImage
          src={list[0].src}
          alt={list[0].alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
    );
  }

  const base = list[current];
  const next = incoming !== null ? list[incoming] : null;

  // Slow cinematic drift (Ken Burns). Start pose is deterministic per slide so
  // that when an incoming plate is promoted to base the transform is continuous
  // — no scale/pan jump at the wipe handoff. Direction alternates per index.
  const kbFor = (i: number) => {
    const dir = i % 2 === 0 ? 1 : -1;
    return {
      start: { scale: 1.06, x: `${3 * dir}%`, y: `${-2 * dir}%` },
      end: { scale: 1.14, x: `${-2 * dir}%`, y: `${1.5 * dir}%` },
    };
  };
  const kbDurationSec = (holdMs + pageMs) / 1000 + 0.4;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0 overflow-hidden isolate"
      aria-hidden
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        key={`kb-${current}`}
        className="absolute inset-0 pointer-events-none will-change-transform"
        initial={kbFor(current).start}
        animate={kbFor(current).end}
        transition={{ duration: kbDurationSec, ease: "linear" }}
      >
        <SafeImage
          src={base.src}
          alt={base.alt}
          fill
          sizes="100vw"
          priority
          className="object-cover object-center"
        />
      </motion.div>

      {next ? (
        <div
          ref={sheetRef}
          key={`page-${incoming}`}
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ willChange: "clip-path" }}
        >
          {/* Incoming plate holds the target's Ken Burns start pose so the
              handoff into `base` is seamless. */}
          <motion.div
            className="absolute inset-0"
            initial={kbFor(incoming as number).start}
            animate={kbFor(incoming as number).start}
          >
            <SafeImage
              src={next.src}
              alt={next.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
          </motion.div>

          <div
            ref={edgeRef}
            className="absolute top-0 bottom-0 w-12 md:w-20 pointer-events-none -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
            }}
          />
        </div>
      ) : null}

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-3 pointer-events-auto">
        <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.32em] text-white/55 tabular-nums">
          {String(current + 1).padStart(2, "0")}
          <span className="text-white/30"> / </span>
          {String(list.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {list.map((s, i) => {
            const isOn = i === current;
            return (
              <button
                key={s.src}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                disabled={revealing}
                onClick={() => goTo(i)}
                className={`relative overflow-hidden rounded-full transition-all duration-500 disabled:pointer-events-none ${isOn
                  ? "h-1.5 w-8 bg-white/20"
                  : "h-1.5 w-1.5 bg-white/35 hover:bg-white/70"
                  }`}
              >
                {isOn && !revealing ? (
                  <motion.span
                    key={`prog-${current}`}
                    className="absolute inset-y-0 left-0 bg-secondary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: holdMs / 1000,
                      ease: "linear",
                    }}
                  />
                ) : null}
                {isOn && revealing ? (
                  <span className="absolute inset-0 bg-secondary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
