import { test, expect } from "@playwright/test";

/**
 * Optional authenticated smoke — skipped unless both secrets are present.
 * Local: SMOKE_ADMIN_EMAIL=… SMOKE_ADMIN_PASSWORD=… npm run test:smoke
 * CI: add the same as repository secrets (never hardcode).
 */
const email = process.env.SMOKE_ADMIN_EMAIL?.trim();
const password = process.env.SMOKE_ADMIN_PASSWORD?.trim();
const hasCreds = Boolean(email && password);

test.describe("admin authenticated smoke", () => {
  test.skip(!hasCreds, "Set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD to run");

  test("login reaches admin shell", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').fill(email!);
    await page.locator('input[type="password"]').fill(password!);
    await page.getByRole("button", { name: /enter dashboard/i }).click();

    await page.waitForURL(
      (url) =>
        url.pathname.startsWith("/admin") &&
        !url.pathname.includes("/login"),
      { timeout: 45_000 },
    );

    expect(page.url()).toMatch(/\/admin(\/|$)/);
    expect(page.url()).not.toContain("/admin/login");
  });
});
