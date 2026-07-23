import { test, expect } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://localhost:7400"

test.describe("Authentication Flow", () => {

  test("login page renders correctly", async ({ page }) => {
    const response = await page.goto(`${BASE}/login`)
    expect(response?.status()).toBe(200)
    await expect(page.locator("body")).toBeVisible()
  })

  test("unauthenticated user redirected to login", async ({ page }) => {
    const response = await page.goto(`${BASE}/dashboard`)
    const finalUrl = page.url()
    expect(finalUrl.includes("/login") || finalUrl.includes("/auth/sign-in")).toBe(true)
  })

  test("login form has email and password fields", async ({ page }) => {
    await page.goto(`${BASE}/login`)
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test("login page loads without console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto(`${BASE}/login`)
    expect(errors.filter(e => !e.includes("favicon") && !e.includes("third-party"))).toHaveLength(0)
  })

  test("auth sign-in page accessible", async ({ page }) => {
    const response = await page.goto(`${BASE}/auth/sign-in`)
    expect(response?.status()).toBe(200)
  })
})
