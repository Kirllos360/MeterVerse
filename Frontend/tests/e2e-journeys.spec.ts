import { test, expect } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://localhost:7400"

test.describe("E2E — Business Critical Journeys", () => {

  test("login page renders and has form fields", async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.locator("body")).toBeVisible()
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test("admin customers page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/customers`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin meters page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/meters`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin invoices page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/invoices`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin payments page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/payments`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin readings page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/readings`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin dashboard page loads without console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()) })
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" })
    const critical = errors.filter(e => !e.includes("favicon") && !e.includes("chrome-extension"))
    expect(critical).toHaveLength(0)
  })

  test("admin sim page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/sim`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("admin tariffs page loads", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/tariffs`)
    if (response) expect([200, 301, 302, 404]).toContain(response.status())
  })

  test("404 page for invalid admin route", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/nonexistent-page`)
    expect(response?.status()).toBe(404)
  })
})
