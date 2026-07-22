import { test, expect } from "@playwright/test";

/**
 * Frontend-only shell checks — no backend credentials required.
 * Pages may show empty CMS states; they must still render without hard failure.
 */
const PUBLIC_PATHS = [
  { path: "/", ready: /SHAPE|Erasmus|Smart Cities|Higher Education/i },
  { path: "/the-project", ready: /SHAPE|The Project|Objectives|Erasmus/i },
  { path: "/partners", ready: /Partner|University|Kenya|consortium/i },
  { path: "/contact", ready: /Contact|SHAPE|form|Open University/i },
  { path: "/media", ready: /Media|Press|Gallery|SHAPE/i },
  { path: "/accessibility", ready: /Accessibility|WCAG|SHAPE/i },
] as const;

for (const { path, ready } of PUBLIC_PATHS) {
  test(`public shell renders: ${path}`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response, `navigation to ${path}`).toBeTruthy();
    expect(response!.status(), `${path} HTTP status`).toBeLessThan(500);

    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).toContainText(ready, { timeout: 30_000 });
  });
}

test("legacy OUK /about routes redirect to the project hub", async ({
  page,
}) => {
  const response = await page.goto("/en/about/governing-council", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status() ?? 0).toBeLessThan(500);
  await expect(page).toHaveURL(/\/(en\/)?the-project\/?$/);
});
