import { test, expect } from "@playwright/test"

// P59-B Stage 4B Gate 8 — lightweight browser E2E (login flow + tenancy surface)
// Frontend renders mock data on most admin pages, so data-scope assertions are
// covered by the API probes (Gate 5). Here we verify the auth UI works for both
// the area-scoped viewer and global admin against the real backend.

test.describe("P59-B 4B login tenancy", () => {
  test("area-A viewer can log in and reach /admin", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("admin@meterverse.com").fill("p59b.areaA.user@test.local")
    await page.getByPlaceholder("Enter your password").fill("p59b-test-a")
    await page.getByRole("button", { name: /Sign in/i }).click()
    // Wait for either "Access Granted" success screen then redirect to admin.
    await expect(page.getByText("Access Granted")).toBeVisible({ timeout: 15000 })
    await page.waitForURL(/\/admin/, { timeout: 20000 }).catch(() => {})
    // Landing on an admin page implies the auth cookie was accepted.
    expect(page.url()).toContain("/admin")
  })

  test("global admin can log in and reach /admin", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("admin@meterverse.com").fill("admin@meterverse.com")
    await page.getByPlaceholder("Enter your password").fill("Admin@123")
    await page.getByRole("button", { name: /Sign in/i }).click()
    await expect(page.getByText("Access Granted")).toBeVisible({ timeout: 15000 })
    await page.waitForURL(/\/admin/, { timeout: 20000 }).catch(() => {})
    expect(page.url()).toContain("/admin")
  })
})
