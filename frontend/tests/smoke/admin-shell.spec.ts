import { test, expect, type Page } from "@playwright/test";

/**
 * Admin gate / login shell — no credentials required.
 * Unauthenticated desk routes must not expose the orchestrator chrome.
 *
 * When the API is down/slow, AdminLayout may linger on "Verifying Credentials…".
 * That is still an unauthenticated gate (no sidebar / OUK PANEL).
 */
test("admin login form is reachable", async ({ page }) => {
  const response = await page.goto("/admin/login", {
    waitUntil: "domcontentloaded",
  });
  expect(response?.status() ?? 0).toBeLessThan(500);

  await expect(page.locator('input[type="email"]')).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(
    page.getByRole("button", { name: /enter dashboard/i }),
  ).toBeVisible();
});

async function expectUnauthenticatedGate(page: Page) {
  const loginInput = page.locator('input[type="email"]');
  const verifying = page.getByText(/Verifying Credentials/i);

  await expect(loginInput.or(verifying).first()).toBeVisible({
    timeout: 45_000,
  });

  // Authenticated chrome must never appear while gated.
  await expect(page.getByText(/OUK PANEL/i)).toHaveCount(0);
}

test("unauthenticated helpdesk route stays gated", async ({ page }) => {
  await page.goto("/admin/helpdesk", { waitUntil: "domcontentloaded" });
  await expectUnauthenticatedGate(page);
});

test("unauthenticated ICT route stays gated", async ({ page }) => {
  await page.goto("/admin/ict", { waitUntil: "domcontentloaded" });
  await expectUnauthenticatedGate(page);
});
