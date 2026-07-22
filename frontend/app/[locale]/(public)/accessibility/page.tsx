import React from "react";
import type { Metadata } from "next";
import ShapePageHero from "@/components/shape/ShapePageHero";
import { Link } from "@/i18n/routing";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/accessibility", params.locale, {
    title: "Accessibility Statement",
    description:
      "SHAPE Erasmus+ accessibility commitment, WCAG 2.2 Level AA conformance, and how to get help.",
  });
}

export default function AccessibilityStatementPage() {
  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Inclusion"
        title="Accessibility statement"
        subtitle="SHAPE is committed to WCAG 2.2 Level AA so partners, learners, and the public can use the portal with diverse abilities."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 max-w-3xl prose prose-slate prose-headings:font-serif prose-headings:uppercase prose-headings:tracking-tight space-y-8">
          <div>
            <h2 className="text-2xl font-black text-primary-darker">Our commitment</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              The SHAPE Erasmus+ public portal and CMS aim to meet the Web Content Accessibility
              Guidelines (WCAG) 2.2 Level AA. We design for screen readers, keyboard-only use,
              adjustable presentation, captions/transcripts for media, and multilingual access.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-primary-darker">What you can customize</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              Open the accessibility panel (floating button, or press{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-xs font-bold">Alt+A</kbd>) to adjust:
            </p>
            <ul className="mt-3 space-y-2 text-slate-600 list-disc pl-5">
              <li>High-contrast, dark, and soft color themes</li>
              <li>Text size, letter spacing, line height, and dyslexia-friendly font</li>
              <li>Color filters (including approximate color-vision modes)</li>
              <li>Reduced motion, larger cursor, reading guide, and underlined links</li>
              <li>Read aloud (text-to-speech) and voice navigation where the browser supports it</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-black text-primary-darker">Assistive technologies</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              Pages use semantic HTML, ARIA landmarks, visible focus styles, and skip links. We test
              with common screen readers (NVDA, JAWS, VoiceOver, TalkBack) and keyboard-only flows.
              Maps, charts, and documents should include text alternatives; PDFs uploaded in the CMS
              should be tagged and readable.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-primary-darker">Media, captions &amp; sign language</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              Video and audio content should include closed captions and transcripts. Where feasible,
              key announcements may be offered with sign-language interpretation. Contact the
              coordinator if you need an alternative format.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-primary-darker">Known limitations</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              Third-party embeds, legacy university routes still in the codebase, and some map tile
              imagery may not fully meet AA. We continuously improve coverage through CMS checks and
              automated axe tests on core public pages.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-primary-darker">Feedback</h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              Accessibility feedback:{" "}
              <a href="mailto:shape@ouk.ac.ke" className="text-primary font-bold underline">
                shape@ouk.ac.ke
              </a>
              . Or use the{" "}
              <Link href="/contact" className="text-primary font-bold underline">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
