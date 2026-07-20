import { defineConfig, devices } from "@playwright/test";

/**
 * Critical-path smoke tests (public shell + admin gate).
 * Authenticated flows run only when SMOKE_ADMIN_EMAIL + SMOKE_ADMIN_PASSWORD are set.
 *
 * Set BASE_URL to hit an already-running server (CI starts Next via webServer).
 */
export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
