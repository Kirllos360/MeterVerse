import { defineConfig } from "@playwright/test"

export default defineConfig({
  testMatch: "tests/**/*.spec.{ts,tsx,mjs}",
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:7400",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--no-sandbox"] },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
})
