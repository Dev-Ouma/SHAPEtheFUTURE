"use client";

import React, { useEffect, useId, useRef } from "react";
import {
  Accessibility,
  Contrast,
  Type,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  X,
  Eye,
  MousePointer2,
  AlignLeft,
  Underline,
  Pause,
  BookOpen,
  Filter,
  Keyboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import {
  useAccessibility,
  type ColorFilter,
  type ColorTheme,
  type CursorSize,
  type FontSize,
  type LetterSpacing,
  type LineHeightPref,
} from "./AccessibilityProvider";

function Toggle({
  pressed,
  onClick,
  label,
  description,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-bold text-slate-800 block">
          {label}
        </label>
        {description ? <p className="text-xs text-slate-500 mt-0.5">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={pressed}
        onClick={onClick}
        className={`relative w-12 h-7 shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          pressed ? "bg-primary" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white transition-transform ${
            pressed ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <fieldset className="py-3 border-b border-slate-100 last:border-0">
      <legend className="text-sm font-bold text-slate-800 mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={id}>
        <span id={id} className="sr-only">
          {label}
        </span>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              value === opt.value
                ? "bg-primary text-white border-primary"
                : "border-slate-200 text-slate-600 hover:border-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function AccessibilityWidget({ variant = "public" }: { variant?: "public" | "admin" }) {
  const a11y = useAccessibility();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!a11y.openPanel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") a11y.setOpenPanel(false);
    };
    window.addEventListener("keydown", onKey);
    // Focus first focusable in panel
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, [href], input, select")?.focus();
    }, 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [a11y.openPanel]);

  const fabClass =
    variant === "admin"
      ? "fixed bottom-6 right-6 z-[90]"
      : "fixed bottom-6 right-6 z-[90]";

  return (
    <>
      <button
        type="button"
        className={`${fabClass} bg-primary text-white p-4 shadow-xl hover:bg-secondary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
        aria-haspopup="dialog"
        aria-expanded={a11y.openPanel}
        aria-controls="a11y-settings-panel"
        onClick={() => a11y.setOpenPanel(!a11y.openPanel)}
        title="Accessibility settings (Alt+A)"
      >
        <Accessibility size={22} aria-hidden />
        <span className="sr-only">Open accessibility settings</span>
      </button>

      <AnimatePresence>
        {a11y.openPanel ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/50"
            onClick={() => a11y.setOpenPanel(false)}
            aria-hidden
          >
            <motion.div
              id="a11y-settings-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              ref={panelRef}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: a11y.reducedMotion ? 0 : 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-primary-darker text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
                    WCAG 2.2 AA
                  </p>
                  <h2 id={titleId} className="font-serif text-xl font-black uppercase tracking-tight">
                    Accessibility
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close accessibility settings"
                  onClick={() => a11y.setOpenPanel(false)}
                  className="p-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Customize display, reading, and navigation. Preferences save on this device. Shortcut:{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-bold">Alt+A</kbd>
                </p>

                <section aria-labelledby="a11y-display">
                  <h3
                    id="a11y-display"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 flex items-center gap-2"
                  >
                    <Contrast size={14} /> Display &amp; contrast
                  </h3>
                  <Segmented<ColorTheme>
                    label="Color theme"
                    value={a11y.colorTheme}
                    onChange={(v) => a11y.setPref("colorTheme", v)}
                    options={[
                      { value: "default", label: "Default" },
                      { value: "high-contrast", label: "High contrast" },
                      { value: "dark", label: "Dark" },
                      { value: "soft", label: "Soft" },
                    ]}
                  />
                  <Segmented<ColorFilter>
                    label="Color filter"
                    value={a11y.colorFilter}
                    onChange={(v) => a11y.setPref("colorFilter", v)}
                    options={[
                      { value: "none", label: "None" },
                      { value: "grayscale", label: "Grayscale" },
                      { value: "invert", label: "Invert" },
                      { value: "protanopia", label: "Protanopia" },
                      { value: "deuteranopia", label: "Deuteranopia" },
                      { value: "tritanopia", label: "Tritanopia" },
                    ]}
                  />
                </section>

                <section aria-labelledby="a11y-text" className="pt-4">
                  <h3
                    id="a11y-text"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 flex items-center gap-2"
                  >
                    <Type size={14} /> Text &amp; reading
                  </h3>
                  <Segmented<FontSize>
                    label="Text size"
                    value={a11y.fontSize}
                    onChange={(v) => a11y.setFontSize(v)}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "large", label: "Large" },
                      { value: "xlarge", label: "Extra large" },
                    ]}
                  />
                  <Segmented<LetterSpacing>
                    label="Letter spacing"
                    value={a11y.letterSpacing}
                    onChange={(v) => a11y.setPref("letterSpacing", v)}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "wide", label: "Wide" },
                      { value: "wider", label: "Wider" },
                    ]}
                  />
                  <Segmented<LineHeightPref>
                    label="Line height"
                    value={a11y.lineHeight}
                    onChange={(v) => a11y.setPref("lineHeight", v)}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "relaxed", label: "Relaxed" },
                      { value: "loose", label: "Loose" },
                    ]}
                  />
                  <Toggle
                    label="Dyslexia-friendly font"
                    description="Increases spacing and uses a more readable typeface"
                    pressed={a11y.dyslexicFont}
                    onClick={a11y.toggleDyslexicFont}
                  />
                  <Toggle
                    label="Underline links"
                    pressed={a11y.underlineLinks}
                    onClick={() => a11y.setPref("underlineLinks", !a11y.underlineLinks)}
                  />
                  <Toggle
                    label="Reading guide"
                    description="Horizontal guide follows the pointer"
                    pressed={a11y.readingGuide}
                    onClick={() => a11y.setPref("readingGuide", !a11y.readingGuide)}
                  />
                  <Segmented<"default" | "left" | "justify">
                    label="Text alignment"
                    value={a11y.textAlign}
                    onChange={(v) => a11y.setPref("textAlign", v)}
                    options={[
                      { value: "default", label: "Default" },
                      { value: "left", label: "Left" },
                      { value: "justify", label: "Justify" },
                    ]}
                  />
                </section>

                <section aria-labelledby="a11y-motion" className="pt-4">
                  <h3
                    id="a11y-motion"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 flex items-center gap-2"
                  >
                    <Pause size={14} /> Motion &amp; focus
                  </h3>
                  <Toggle
                    label="Reduce motion"
                    description="Disables non-essential animations"
                    pressed={a11y.reducedMotion}
                    onClick={() => a11y.setPref("reducedMotion", !a11y.reducedMotion)}
                  />
                  <Toggle
                    label="Strong focus outlines"
                    pressed={a11y.highlightFocus}
                    onClick={() => a11y.setPref("highlightFocus", !a11y.highlightFocus)}
                  />
                  <Segmented<CursorSize>
                    label="Cursor size"
                    value={a11y.bigCursor}
                    onChange={(v) => a11y.setPref("bigCursor", v)}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "large", label: "Large" },
                      { value: "xlarge", label: "Extra large" },
                    ]}
                  />
                </section>

                <section aria-labelledby="a11y-speech" className="pt-4">
                  <h3
                    id="a11y-speech"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 flex items-center gap-2"
                  >
                    <Volume2 size={14} /> Speech &amp; voice
                  </h3>
                  <div className="flex flex-wrap gap-2 py-3">
                    <button
                      type="button"
                      disabled={!a11y.speechSupported}
                      onClick={() => (a11y.isReading ? a11y.stopReading() : a11y.readPage())}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {a11y.isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      {a11y.isReading ? "Stop reading" : "Read aloud"}
                    </button>
                    <button
                      type="button"
                      disabled={!a11y.speechSupported}
                      onClick={a11y.readSelection}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                    >
                      <BookOpen size={14} /> Read selection
                    </button>
                    <button
                      type="button"
                      disabled={!a11y.voiceSupported}
                      onClick={() =>
                        a11y.isListening ? a11y.stopVoiceNav() : a11y.startVoiceNav()
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                    >
                      {a11y.isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      {a11y.isListening ? "Stop voice" : "Voice navigate"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 pb-3">
                    Voice commands: “home”, “partners”, “read”, “stop”, “accessibility”. Shortcut:{" "}
                    <kbd className="px-1 bg-slate-100 text-[10px] font-bold">Alt+R</kbd> toggle read
                    aloud.
                    {!a11y.voiceSupported
                      ? " Voice navigation needs Chrome/Edge with microphone permission."
                      : null}
                  </p>
                </section>

                <section aria-labelledby="a11y-help" className="pt-4 pb-6">
                  <h3
                    id="a11y-help"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2"
                  >
                    <Keyboard size={14} /> Help &amp; statement
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <Eye size={16} className="text-primary shrink-0 mt-0.5" />
                      Screen readers: semantic landmarks and skip links are provided.
                    </li>
                    <li className="flex gap-2">
                      <MousePointer2 size={16} className="text-primary shrink-0 mt-0.5" />
                      Full keyboard access: Tab, Shift+Tab, Enter, Escape.
                    </li>
                    <li className="flex gap-2">
                      <Filter size={16} className="text-primary shrink-0 mt-0.5" />
                      Videos should include captions; contact us for transcripts or sign-language
                      support.
                    </li>
                    <li>
                      <Link
                        href="/accessibility"
                        className="text-primary font-bold underline"
                        onClick={() => a11y.setOpenPanel(false)}
                      >
                        Accessibility statement →
                      </Link>
                    </li>
                  </ul>
                </section>
              </div>

              <footer className="border-t border-slate-200 px-5 py-4 flex items-center justify-between gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={a11y.resetPrefs}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary"
                >
                  <RotateCcw size={14} /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => a11y.setOpenPanel(false)}
                  className="bg-primary text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-secondary"
                >
                  Done
                </button>
              </footer>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
