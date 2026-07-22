"use client";

import React, { useEffect, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";

type Issue = {
  id: string;
  severity: "critical" | "serious" | "moderate" | "pass";
  title: string;
  detail: string;
  module: string;
};

const CONTENT_CHECKLIST = [
  {
    id: "alt",
    title: "Images need meaningful alternative text",
    detail: "Decorative images use empty alt; informative images describe purpose.",
  },
  {
    id: "captions",
    title: "Video/audio include captions or transcripts",
    detail: "Upload captions (.vtt) or link a transcript for every media asset.",
  },
  {
    id: "headings",
    title: "Use a logical heading hierarchy (H1 → H2 → H3)",
    detail: "Do not skip levels; one H1 per page/view.",
  },
  {
    id: "links",
    title: "Link text is descriptive",
    detail: "Avoid “click here”; name the destination.",
  },
  {
    id: "docs",
    title: "PDFs/Word files are tagged and readable",
    detail: "Prefer accessible PDF/UA or offer HTML equivalents.",
  },
  {
    id: "forms",
    title: "Form fields have visible labels and error messages",
    detail: "Associate label/for or aria-labelledby; announce errors.",
  },
  {
    id: "color",
    title: "Do not rely on color alone",
    detail: "Status also uses text/icons; contrast meets AA (4.5:1 body text).",
  },
  {
    id: "motion",
    title: "Respect reduced motion",
    detail: "Avoid autoplay video with motion; provide pause controls.",
  },
];

function runDomAudit(): Issue[] {
  if (typeof document === "undefined") return [];
  const issues: Issue[] = [];

  const imgs = Array.from(document.querySelectorAll("img"));
  const missingAlt = imgs.filter((img) => !img.hasAttribute("alt"));
  if (missingAlt.length) {
    issues.push({
      id: "img-alt",
      severity: "serious",
      title: `${missingAlt.length} image(s) missing alt attributes`,
      detail: "Add alt text or alt=\"\" for decorative images in templates.",
      module: "DOM scan",
    });
  } else {
    issues.push({
      id: "img-alt-ok",
      severity: "pass",
      title: "Images expose alt attributes",
      detail: `${imgs.length} images checked in the current admin document.`,
      module: "DOM scan",
    });
  }

  const buttons = Array.from(document.querySelectorAll("button"));
  const unnamed = buttons.filter((b) => {
    const label =
      b.getAttribute("aria-label") ||
      b.getAttribute("aria-labelledby") ||
      b.textContent?.trim();
    return !label;
  });
  if (unnamed.length) {
    issues.push({
      id: "btn-name",
      severity: "serious",
      title: `${unnamed.length} button(s) without accessible name`,
      detail: "Add visible text or aria-label.",
      module: "DOM scan",
    });
  } else {
    issues.push({
      id: "btn-name-ok",
      severity: "pass",
      title: "Buttons have accessible names",
      detail: `${buttons.length} buttons checked.`,
      module: "DOM scan",
    });
  }

  const inputs = Array.from(
    document.querySelectorAll("input:not([type=hidden]), select, textarea"),
  );
  const unlabeled = inputs.filter((el) => {
    const id = el.getAttribute("id");
    const aria = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
    if (aria) return false;
    if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return false;
    if (el.closest("label")) return false;
    return true;
  });
  if (unlabeled.length) {
    issues.push({
      id: "input-label",
      severity: "critical",
      title: `${unlabeled.length} form control(s) may lack labels`,
      detail: "Associate a <label> or aria-label on every control.",
      module: "DOM scan",
    });
  } else {
    issues.push({
      id: "input-label-ok",
      severity: "pass",
      title: "Form controls appear labelled",
      detail: `${inputs.length} controls checked on this page.`,
      module: "DOM scan",
    });
  }

  const skip = document.querySelector('a[href="#main-content"], .a11y-skip-group');
  issues.push({
    id: "skip",
    severity: skip ? "pass" : "moderate",
    title: skip ? "Skip navigation present" : "Skip navigation not found on this view",
    detail: "Public pages include skip links; admin uses the accessibility panel.",
    module: "Navigation",
  });

  const lang = document.documentElement.getAttribute("lang");
  issues.push({
    id: "lang",
    severity: lang ? "pass" : "serious",
    title: lang ? `Document language is “${lang}”` : "Missing html lang attribute",
    detail: "Language selection must keep lang in sync for screen readers.",
    module: "i18n",
  });

  return issues;
}

export default function AdminAccessibilityPage() {
  const a11y = useAccessibility();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const refresh = () => setIssues(runDomAudit());

  useEffect(() => {
    refresh();
    try {
      const raw = localStorage.getItem("shape_a11y_cms_checklist");
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shape_a11y_cms_checklist", JSON.stringify(checked));
  }, [checked]);

  const passes = issues.filter((i) => i.severity === "pass").length;
  const fails = issues.filter((i) => i.severity !== "pass").length;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">
            WCAG 2.2 AA
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-primary-darker uppercase tracking-tight">
            Accessibility
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Personal CMS preferences, content authoring checklist, and a live DOM audit of the
            current admin shell. Open the floating accessibility panel anytime with Alt+A.
          </p>
        </div>
        <button
          type="button"
          onClick={() => a11y.setOpenPanel(true)}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-secondary"
        >
          <Accessibility size={16} /> Open settings
        </button>
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Passes</p>
          <p className="font-serif text-4xl font-black text-emerald-600 mt-2">{passes}</p>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Findings</p>
          <p className="font-serif text-4xl font-black text-amber-600 mt-2">{fails}</p>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Theme</p>
          <p className="font-serif text-2xl font-black text-primary-darker mt-2 uppercase">
            {a11y.colorTheme}
          </p>
        </div>
      </section>

      <section className="border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <h2 className="font-serif text-xl font-black text-primary-darker uppercase">
            Live admin DOM audit
          </h2>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"
          >
            <RefreshCw size={14} /> Re-scan
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {issues.map((issue) => (
            <li key={issue.id} className="px-5 py-4 flex gap-3">
              {issue.severity === "pass" ? (
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              ) : (
                <AlertTriangle
                  className={
                    issue.severity === "critical"
                      ? "text-rose-500 shrink-0 mt-0.5"
                      : "text-amber-500 shrink-0 mt-0.5"
                  }
                  size={18}
                />
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                  {issue.module} · {issue.severity}
                </p>
                <p className="font-bold text-primary-darker mt-1">{issue.title}</p>
                <p className="text-sm text-slate-500 mt-1">{issue.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <h2 className="font-serif text-xl font-black text-primary-darker uppercase">
            Content authoring checklist
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {CONTENT_CHECKLIST.map((item) => (
            <li key={item.id} className="px-5 py-4 flex items-start gap-3">
              <input
                id={`chk-${item.id}`}
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))
                }
                className="mt-1"
              />
              <label htmlFor={`chk-${item.id}`} className="min-w-0 cursor-pointer">
                <p className="font-bold text-primary-darker">{item.title}</p>
                <p className="text-sm text-slate-500 mt-1">{item.detail}</p>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-slate-500">
        Public statement:{" "}
        <a
          href="/accessibility"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold inline-flex items-center gap-1"
        >
          /accessibility <ExternalLink size={12} />
        </a>
        . Automated axe coverage:{" "}
        <code className="text-xs bg-slate-100 px-1">npm run test:a11y</code>
      </p>
    </div>
  );
}
