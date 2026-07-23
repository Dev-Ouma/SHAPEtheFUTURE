/**
 * SHAPE motion system — easings, animation types, and premium presets.
 * Use these tokens across hero, reveals, and section choreography.
 */

export type CubicBezier = readonly [number, number, number, number];

/** Named animation styles available to SHAPE surfaces */
export type ShapeMotionType =
  | "page" // page sheet: top → bottom → right (hero default)
  | "slice" // vertical strips, same direction
  | "shutter" // counter-directional blinds
  | "fade" // soft crossfade
  | "reveal"; // scroll section lift

export type ShapeEaseName =
  | "editorial"
  | "page"
  | "snappy"
  | "soft"
  | "linear";

export const SHAPE_EASE: Record<ShapeEaseName, CubicBezier | "linear"> = {
  /** Calm UI / text entrance */
  editorial: [0.22, 1, 0.36, 1],
  /** Page unfold — decisive then soft land */
  page: [0.22, 0.61, 0.18, 1],
  /** Controls / dots */
  snappy: [0.32, 0.72, 0, 1],
  /** Overlays / washes */
  soft: [0.45, 0, 0.55, 1],
  linear: "linear",
};

export type ShapeMotionTiming = {
  duration: number;
  ease: CubicBezier | "linear";
  delay?: number;
};

export const SHAPE_DURATION = {
  instant: 0.2,
  fast: 0.45,
  base: 0.7,
  page: 1.55,
  hold: 5.4,
  bloom: 18,
} as const;

/** Hero slideshow config keyed by motion type */
export type HeroMotionConfig = {
  type: ShapeMotionType;
  intervalMs: number;
  revealMs: number;
  stripCount?: number;
};

export const HERO_MOTION: Record<
  Extract<ShapeMotionType, "page" | "slice" | "shutter" | "fade">,
  HeroMotionConfig
> = {
  page: {
    type: "page",
    intervalMs: 5600,
    revealMs: 1400,
  },
  slice: {
    type: "slice",
    intervalMs: 5000,
    revealMs: 1200,
    stripCount: 8,
  },
  shutter: {
    type: "shutter",
    intervalMs: 5000,
    revealMs: 1300,
    stripCount: 9,
  },
  fade: {
    type: "fade",
    intervalMs: 6000,
    revealMs: 1100,
  },
};

/**
 * Page-sheet clip — continuous diagonal (top leads, bottom follows).
 * Both edges must hit 100% at progress=1 so the handoff never snaps.
 */
export function pageClipPath(progress: number): string {
  const p = Math.min(1, Math.max(0, progress));
  // Fully open — avoid floating-point leftover edges at the handoff
  if (p >= 0.999) return "inset(0%)";
  // Ease the lag so the bottom catches up cleanly by the end
  const lag = 0.18;
  const topX = p * 100;
  const botT = p <= lag ? 0 : (p - lag) / (1 - lag);
  // Smoothstep the bottom catch-up for a soft landing
  const botSmooth = botT * botT * (3 - 2 * botT);
  const botX = botSmooth * 100;
  return `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;
}

/** @deprecated Use progress-driven pageClipPath — kept for reference */
export const PAGE_CLIP_KEYFRAMES = [
  "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
  "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
] as const;

export const PAGE_CLIP_TIMES = [0, 1] as const;


/** Incoming photo settle while the page opens */
export const PAGE_IMAGE_SETTLE = {
  initial: { y: "-10%", x: "-5%", scale: 1.08, rotate: -0.6 },
  animate: { y: "0%", x: "0%", scale: 1, rotate: 0 },
} as const;

/** Outgoing plate reaction under the page */
export const PAGE_BASE_REACTION = {
  idle: { scale: 1, x: "0%", filter: "brightness(1) saturate(1)" },
  covered: {
    scale: 1.045,
    x: "-2.5%",
    filter: "brightness(0.82) saturate(0.9)",
  },
} as const;

/** Leading paper edge light travel */
export const PAGE_EDGE_TRAVEL = {
  initial: { opacity: 0, x: "-35%", y: "-25%", rotate: -8 },
  animate: {
    opacity: [0, 0.95, 1, 0.85, 0],
    x: ["-35%", "-5%", "25%", "55%", "75%"],
    y: ["-25%", "-5%", "15%", "40%", "55%"],
    rotate: [-8, -4, 0, 3, 6],
  },
  times: [0, 0.18, 0.45, 0.72, 1] as const,
} as const;

/** Section scroll reveal (shared with ShapeReveal) */
export const SECTION_REVEAL = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: SHAPE_EASE.editorial,
    },
  },
} as const;

/** Hero copy stagger */
export const HERO_COPY = {
  container: {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.11, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: SHAPE_EASE.editorial },
    },
  },
} as const;

export function motionTransition(
  easeName: ShapeEaseName,
  duration: number,
  delay = 0,
): ShapeMotionTiming {
  return {
    duration,
    delay,
    ease: SHAPE_EASE[easeName],
  };
}
