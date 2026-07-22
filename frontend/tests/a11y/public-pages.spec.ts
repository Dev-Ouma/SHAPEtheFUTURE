import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Critical/serious axe violations fail the job.
 *
 * Known non-blocking (excluded):
 * - color-contrast: many decorative/overlay text pairs on the public chrome;
 *   tracked for a later a11y pass, not a Phase 1 hard gate.
 */
const PAGES = [
  "/",
  "/the-project",
  "/partners",
  "/news",
  "/contact",
] as const;

for (const path of PAGES) {
  test(`axe critical/serious: ${path}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (blocking.length > 0) {
      const summary = blocking
        .map(
          (v) =>
            `${v.impact?.toUpperCase()} ${v.id}: ${v.help} (${v.nodes.length} node(s))`,
        )
        .join("\n");
      expect(blocking, summary).toEqual([]);
    }
  });
}
