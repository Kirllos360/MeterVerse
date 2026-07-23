import { test, expect, type Page } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://localhost:7400"

async function navigateTo(page: Page, path: string) {
  const response = await page.goto(`${BASE}${path}`)
  return response
}

test.describe("Admin List Pages", () => {

  const adminPages = [
    { path: "/admin/customers", name: "Customers" },
    { path: "/admin/meters", name: "Meters" },
    { path: "/admin/readings", name: "Readings" },
    { path: "/admin/invoices", name: "Invoices" },
    { path: "/admin/payments", name: "Payments" },
    { path: "/admin/users", name: "Users" },
    { path: "/admin/roles", name: "Roles" },
    { path: "/admin/areas", name: "Areas" },
    { path: "/admin/reports", name: "Reports" },
    { path: "/admin/audit", name: "Audit" },
    { path: "/admin/settings", name: "Settings" },
  ]

  for (const { path, name } of adminPages) {
    test(`admin ${name} page renders`, async ({ page }) => {
      const response = await navigateTo(page, path)
      expect(response?.status()).toBe(200)
      await expect(page.locator("body")).toBeVisible()
    })
  }
})

test.describe("Dashboard Pages", () => {

  const dashboardPages = [
    { path: "/dashboard/overview", name: "Overview" },
    { path: "/dashboard/meters", name: "Meters" },
    { path: "/dashboard/readings", name: "Readings" },
    { path: "/dashboard/customers", name: "Customers" },
    { path: "/dashboard/users", name: "Users" },
    { path: "/dashboard/invoices", name: "Invoices" },
  ]

  for (const { path, name } of dashboardPages) {
    test(`dashboard ${name} page renders`, async ({ page }) => {
      const response = await navigateTo(page, path)
      expect(response?.status()).toBe(200)
      await expect(page.locator("body")).toBeVisible()
    })
  }
})

test.describe("Page Error States", () => {

  test("invalid admin page returns 404", async ({ page }) => {
    const response = await navigateTo(page, "/admin/nonexistent-page")
    expect(response?.status()).toBe(404)
  })

  test("invalid dashboard page returns 404", async ({ page }) => {
    const response = await navigateTo(page, "/dashboard/nonexistent")
    expect(response?.status()).toBe(404)
  })
})

test.describe("Page Load Performance", () => {

  const perfPages = [
    "/admin/customers",
    "/admin/meters",
    "/admin/invoices",
    "/admin/dashboard",
  ]

  for (const path of perfPages) {
    test(`page ${path} loads without console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
      })
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
      const criticalErrors = errors.filter(e =>
        !e.includes("favicon") &&
        !e.includes("third-party") &&
        !e.includes("chrome-extension")
      )
      expect(criticalErrors).toHaveLength(0)
    })
  }
})
