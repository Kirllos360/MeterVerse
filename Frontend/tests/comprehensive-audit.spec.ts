import { test, expect, type Page, type ConsoleMessage } from "@playwright/test"
import fs from "fs"
import path from "path"

const BASE = "http://localhost:7400"
const REPORT_DIR = path.resolve(__dirname, "../test-reports")
fs.mkdirSync(REPORT_DIR, { recursive: true })

interface PageResult {
  url: string
  status: number
  errors: string[]
  warnings: string[]
  jsErrors: number
  issues: string[]
  resourceCount: number
  perf: { domContentLoaded: number; load: number }
}

const results: Record<string, PageResult> = {}

function setupConsoleCapture(page: Page, result: PageResult) {
  const jsErrors: string[] = []
  const warnings: string[] = []
  
  page.on("console", (msg: ConsoleMessage) => {
    const type = msg.type()
    const text = msg.text()
    if (type === "error") {
      jsErrors.push(text)
      result.jsErrors++
    } else if (type === "warning") {
      warnings.push(text)
    }
    result.errors.push(...jsErrors)
    result.warnings.push(...warnings)
  })

  page.on("pageerror", (err) => {
    result.errors.push(`PAGE ERROR: ${err.message}`)
    result.jsErrors++
  })

  page.on("requestfailed", (req) => {
    result.errors.push(`REQUEST FAILED: ${req.url()} (${req.failure()?.errorText})`)
  })
}

async function auditPage(page: Page, url: string, name: string): Promise<PageResult> {
  console.log(`\n=== Testing: ${name} (${url}) ===`)
  const result: PageResult = {
    url,
    status: 0,
    errors: [],
    warnings: [],
    jsErrors: 0,
    issues: [],
    resourceCount: 0,
    perf: { domContentLoaded: 0, load: 0 },
  }

  setupConsoleCapture(page, result)

  const startTime = Date.now()
  let response
  try {
    response = await page.goto(url, { waitUntil: "load", timeout: 30000 })
  } catch (e: any) {
    result.errors.push(`NAVIGATION ERROR: ${e.message}`)
    results[name] = result
    return result
  }
  const loadTime = Date.now() - startTime

  result.status = response?.status() ?? 0
  result.perf = {
    domContentLoaded: await page.evaluate(() => performance.timing?.domContentLoadedEventEnd ?? 0),
    load: loadTime,
  }

  // Wait for any remaining network requests
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.waitForTimeout(1000)

  // Count resources
  result.resourceCount = await page.evaluate(() => document.querySelectorAll("link[rel=stylesheet], script[src], img").length)

  // Check for accessibility issues
  const a11yIssues = await page.evaluate(() => {
    const issues: string[] = []
    document.querySelectorAll("img:not([alt])").forEach(() => issues.push("Image missing alt attribute"))
    document.querySelectorAll("button:not([aria-label]):not([title])").forEach((b) => {
      if (!b.textContent?.trim()) issues.push("Button without accessible label")
    })
    return issues
  })
  result.issues.push(...a11yIssues)

  // Check for React hydration errors
  const hydrationErrors = await page.evaluate(() => {
    const el = document.querySelector("[data-rr-ui-error], [data-nextjs-error]")
    return el ? "Hydration error detected" : null
  })
  if (hydrationErrors) result.issues.push(hydrationErrors)

  results[name] = result
  console.log(`  Status: ${result.status} | JS Errors: ${result.jsErrors} | Issues: ${result.issues.length} | Load: ${loadTime}ms`)
  return result
}

test.describe("MeterVerse Comprehensive Audit", () => {
  test("01 - Root workspace page", async ({ page }) => {
    const r = await auditPage(page, BASE + "/", "Root Workspace")
    expect(r.status).toBe(200)
  })

  test("02 - Login redirects to /", async ({ page }) => {
    await page.goto(BASE + "/login", { waitUntil: "load" })
    expect(page.url()).toBe(BASE + "/")
  })

  test("03 - App route redirects to /", async ({ page }) => {
    await page.goto(BASE + "/app/crm/customers", { waitUntil: "load" })
    expect(page.url()).toBe(BASE + "/")
  })

  test("04 - Workspace route redirects to /", async ({ page }) => {
    await page.goto(BASE + "/workspace", { waitUntil: "load" })
    expect(page.url()).toBe(BASE + "/")
  })

  test("05 - Sidebar navigation tabs", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const sidebarButtons = await page.locator("nav button, [class*='sidebar'] button, [class*='Sidebar'] button").all()
    console.log(`  Found ${sidebarButtons.length} sidebar buttons`)

    // Try clicking each sidebar nav item
    const navItems = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
    for (const item of navItems) {
      try {
        const btn = page.locator(`button:has-text("${item}"), [class*="nav"]:has-text("${item}")`).first()
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click()
          await page.waitForTimeout(800)
          console.log(`  Clicked: ${item} ✓`)
        }
      } catch (e: any) {
        console.log(`  Could not click ${item}: ${e.message}`)
      }
    }
  })

  test("06 - Auth bypass protection", async ({ page }) => {
    const bypassUrls = [
      "/dashboard/overview",
      "/admin/users",
      "/settings",
      "/app/admin",
      "/dashboard",
      "/customer",
      "/app/developer",
    ]
    for (const url of bypassUrls) {
      await page.goto(BASE + url, { waitUntil: "load", timeout: 10000 })
      expect(page.url()).toBe(BASE + "/")
      console.log(`  ${url} → redirect to / ✓`)
    }
  })

  test("07 - Theme and visual identity", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })
    await page.waitForTimeout(1000)

    // Check design system tokens
    const hasCssVars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      return {
        hasBrand: style.getPropertyValue("--brand-primary") !== "",
        hasSurface: style.getPropertyValue("--surface-base") !== "",
        hasText: style.getPropertyValue("--text-primary") !== "",
        hasBorder: style.getPropertyValue("--border-default") !== "",
      }
    })
    console.log(`  CSS Variables:`, hasCssVars)
    expect(hasCssVars.hasBrand).toBeTruthy()

    // Check framer-motion animations
    const hasAnimations = await page.evaluate(() => {
      const els = document.querySelectorAll("[class*='motion'], [style*='transform'], [style*='animation']")
      return els.length > 0
    })
    console.log(`  Has animations: ${hasAnimations}`)
  })

  test("08 - Console error scan", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "load" })
    await page.waitForTimeout(3000)

    const consoleErrors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text())
    })

    // Navigate to all major sections
    const sections = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
    for (const section of sections) {
      try {
        const btn = page.locator(`button:has-text("${section}")`).first()
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click()
          await page.waitForTimeout(1500)
        }
      } catch {}
    }

    if (consoleErrors.length > 0) {
      console.log(`\n  ❌ CONSOLE ERRORS FOUND (${consoleErrors.length}):`)
      consoleErrors.forEach((e, i) => console.log(`    ${i + 1}. ${e}`))
    }
  })

  test("09 - Performance audit", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "load" })
    await page.waitForTimeout(2000)

    const perfData = await page.evaluate(() => ({
      domContentLoaded: performance.timing?.domContentLoadedEventEnd ?? 0,
      domInteractive: performance.timing?.domInteractive ?? 0,
      firstPaint: performance.getEntriesByType("paint").find(p => p.name === "first-paint")?.startTime ?? 0,
      firstContentfulPaint: performance.getEntriesByType("paint").find(p => p.name === "first-contentful-paint")?.startTime ?? 0,
      resources: performance.getEntriesByType("resource").length,
    }))
    console.log(`  Performance:`, perfData)
  })

  test("10 - Resource usage check", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" })
    await page.waitForTimeout(2000)

    const resources = await page.evaluate(() => ({
      totalScripts: document.querySelectorAll("script[src]").length,
      totalStylesheets: document.querySelectorAll("link[rel=stylesheet]").length,
      totalImages: document.querySelectorAll("img").length,
      totalFonts: document.querySelectorAll("link[rel=preload][as=font]").length,
      totalIframes: document.querySelectorAll("iframe").length,
      domNodes: document.querySelectorAll("*").length,
    }))
    console.log(`  Resources:`, resources)
  })
})

test.describe("Backend API Health Check", () => {
  test("API is on different port (backend check)", async ({ request }) => {
    // Check if backend is running
    const resp = await request.get("http://localhost:3001/api/health").catch(() => null)
    if (resp) {
      console.log(`  Backend API: ${resp.status()}`)
    } else {
      console.log(`  Backend API: Not reachable (expected)`)
    }
  })
})
