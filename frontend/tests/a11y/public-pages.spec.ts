import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Critical/serious axe violations fail the job.
 * color-contrast remains excluded for decorative overlay chrome;
 * WCAG 2.2 tags are included for newer success criteria coverage.
 */
const PAGES = [
  "/",
  "/the-project",
  "/partners",
  "/news",
  "/contact",
  "/accessibility",
  "/documents",
  "/events",
  "/media",
  "/gallery",
  "/search",
  "/map",
  "/dashboard",
] as const;

for (const path of PAGES) {
  test(`axe critical/serious: ${path}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
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

test("accessibility panel opens with Alt+A and skip link targets exist", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="#main-content"]')).toBeAttached();
  await expect(page.locator("#main-content")).toBeAttached();
  await expect(page.locator("#a11y-launcher")).toBeAttached();
  await page.keyboard.press("Alt+a");
  await expect(page.locator("#a11y-settings-panel")).toBeVisible({ timeout: 5000 });
});
