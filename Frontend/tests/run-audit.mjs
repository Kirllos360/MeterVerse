import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:7400"
const REPORT_DIR = path.resolve(__dirname, "../test-reports")
fs.mkdirSync(REPORT_DIR, { recursive: true })

const report = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE,
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  pages: {},
  consoleErrors: [],
  issues: [],
  recommendations: [],
}

function log(msg) {
  console.log(msg)
  report.issues.push(msg)
}

async function auditPage(page, url, name, { expectRedirect } = {}) {
  const result = {
    url,
    name,
    status: null,
    finalUrl: null,
    errors: [],
    warnings: [],
    jsErrors: [],
    consoleEntries: [],
    resources: { scripts: 0, styles: 0, images: 0, domNodes: 0 },
    performance: {},
    issues: [],
  }

  report.summary.total++
  console.log(`\n🔍 ${name} (${url})`)

  // Capture console
  const consoleHandler = (msg) => {
    const entry = { type: msg.type(), text: msg.text() }
    result.consoleEntries.push(entry)
    if (msg.type() === "error") {
      result.jsErrors.push(msg.text())
      report.consoleErrors.push(`[${name}] ${msg.text()}`)
    }
    if (msg.type() === "warning") result.warnings.push(msg.text())
  }
  page.on("console", consoleHandler)

  page.on("pageerror", (err) => {
    result.errors.push(`PAGE ERROR: ${err.message}`)
  })

  page.on("requestfailed", (req) => {
    result.errors.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText}`)
  })

  try {
    const resp = await page.goto(url, { waitUntil: "load", timeout: 30000 })
    result.status = resp?.status()
    result.finalUrl = page.url()

    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(1500)

    // Performance metrics
    result.performance = await page.evaluate(() => ({
      loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart,
      domContentLoaded: performance.timing?.domContentLoadedEventEnd - performance.timing?.navigationStart,
      domInteractive: performance.timing?.domInteractive - performance.timing?.navigationStart,
    })).catch(() => ({}))

    // Resource counts
    result.resources = await page.evaluate(() => ({
      scripts: document.querySelectorAll("script[src]").length,
      styles: document.querySelectorAll("link[rel=stylesheet]").length,
      images: document.querySelectorAll("img").length,
      domNodes: document.querySelectorAll("*").length,
    })).catch(() => ({}))

    // Accessibility check
    const a11yIssues = await page.evaluate(() => {
      const issues = []
      document.querySelectorAll("img:not([alt])").forEach(() => issues.push("Missing alt on img"))
      document.querySelectorAll("button:not([aria-label]):not([title])").forEach((b) => {
        if (!b.textContent?.trim()) issues.push("Button without label")
      })
      document.querySelectorAll("input:not([aria-label])").forEach((i) => {
        if (!i.id && !i.getAttribute("aria-label")) issues.push("Input without accessible label")
      })
      return issues
    }).catch(() => [])
    result.issues.push(...a11yIssues)

  } catch (e) {
    result.errors.push(`NAVIGATION ERROR: ${e.message}`)
  }

  page.removeListener("console", consoleHandler)

  // Verify redirect expectations
  if (expectRedirect) {
    const redirected = result.finalUrl === BASE + "/"
    if (redirected) {
      console.log(`  ✅ Redirected to / as expected`)
    } else {
      console.log(`  ❌ Expected redirect to / but got: ${result.finalUrl}`)
      result.errors.push("Expected redirect to /")
    }
  }

  const hasErrors = result.errors.length > 0 || result.jsErrors.length > 0
  const hasWarnings = result.warnings.length > 0
  const statusIcon = hasErrors ? "❌" : hasWarnings ? "⚠️" : "✅"
  console.log(`  ${statusIcon} Status: ${result.status} | JS Errors: ${result.jsErrors.length} | Issues: ${result.issues.length} | DOM: ${result.resources.domNodes}`)

  if (hasErrors) report.summary.failed++
  else if (hasWarnings) report.summary.warnings++
  else report.summary.passed++

  report.pages[name] = result
  return result
}

async function main() {
  console.log("=".repeat(60))
  console.log("METERVERSE COMPREHENSIVE AUDIT")
  console.log("=".repeat(60))
  console.log(`Base URL: ${BASE}`)
  console.log(`Time: ${new Date().toLocaleString()}`)
  console.log("=".repeat(60))

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  })
  const page = await context.newPage()

  // ========================================
  // 1. ROOT PAGE
  // ========================================
  await auditPage(page, BASE + "/", "Root Workspace")

  // ========================================
  // 2. REDIRECT TESTS (auth bypass protection)
  // ========================================
  const redirectTests = [
    ["/login", "Login page"],
    ["/workspace", "Workspace page"],
    ["/app/crm/customers", "App: Customers"],
    ["/app/meters", "App: Meters"],
    ["/app/billing/invoices", "App: Invoices"],
    ["/app/readings", "App: Readings"],
    ["/dashboard/overview", "Dashboard"],
    ["/admin", "Admin"],
    ["/settings", "Settings"],
  ]
  for (const [path, name] of redirectTests) {
    await auditPage(page, BASE + path, `Redirect: ${name}`, { expectRedirect: true })
  }

  // ========================================
  // 3. SIDEBAR NAVIGATION TEST
  // ========================================
  console.log("\n" + "=".repeat(60))
  console.log("SIDEBAR NAVIGATION TEST")
  console.log("=".repeat(60))

  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  // Find all clickable nav items
  const sidebarItems = await page.evaluate(() => {
    const items = []
    // Look for buttons/svg paths in sidebar area
    const allButtons = document.querySelectorAll("button, [role='tab'], [role='button'], nav a")
    allButtons.forEach((btn, i) => {
      const text = btn.textContent?.trim()
      const rect = btn.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        items.push({ index: i, text: text?.substring(0, 50), x: rect.x, y: rect.y, w: rect.width, h: rect.height })
      }
    })
    return items
  })
  console.log(`Found ${sidebarItems.length} interactive elements`)

  // Navigate through sidebar items
  const navLabels = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
  for (const label of navLabels) {
    try {
      const btn = page.locator(`button:has-text("${label}")`).first()
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(1000)
        console.log(`  ✅ Clicked "${label}"`)

        // Check content area changed
        const contentChanged = await page.evaluate((lbl) => {
          const body = document.body.textContent || ""
          return body.includes(lbl)
        }, label)
        console.log(`     Content shows "${label}": ${contentChanged}`)
      } else {
        console.log(`  ⚠️ "${label}" button not visible`)
      }
    } catch (e) {
      console.log(`  ❌ "${label}" error: ${e.message}`)
    }
  }

  // ========================================
  // 4. DESIGN SYSTEM & CSS VARIABLES
  // ========================================
  console.log("\n" + "=".repeat(60))
  console.log("DESIGN SYSTEM AUDIT")
  console.log("=".repeat(60))

  const cssVars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    const vars = {}
    const designTokens = [
      "--brand-primary", "--brand-secondary",
      "--surface-base", "--surface-raised", "--surface-sunken",
      "--text-primary", "--text-secondary", "--text-tertiary",
      "--border-default",
      "--status-success", "--status-warning", "--status-error", "--status-pending",
      "--font-sans", "--font-mono",
    ]
    designTokens.forEach((token) => {
      const val = style.getPropertyValue(token).trim()
      if (val) vars[token] = val
    })
    return vars
  })
  console.log(`Design tokens defined: ${Object.keys(cssVars).length}/${14}`)
  for (const [key, val] of Object.entries(cssVars)) {
    console.log(`  ${key}: ${val}`)
  }

  // ========================================
  // 5. ANIMATION & MOTION CHECK
  // ========================================
  const animationData = await page.evaluate(() => {
    const allEls = document.querySelectorAll("*")
    let motionCount = 0
    let transformCount = 0
    let animCount = 0
    allEls.forEach((el) => {
      const style = getComputedStyle(el)
      if (el.hasAttribute("style")) {
        const s = el.getAttribute("style") || ""
        if (s.includes("transform") || s.includes("transition")) transformCount++
        if (s.includes("animation")) animCount++
      }
      // Check for framer-motion
      if (el.classList.contains("motion") || el.closest("[class*='motion']")) motionCount++
    })
    return { motionCount, transformCount, animCount, totalEls: allEls.length }
  })
  console.log(`Animation check: ${animationData.motionCount} motion, ${animationData.transformCount} transforms`)

  // ========================================
  // 6. CONSOLE ERROR SUMMARY
  // ========================================
  console.log("\n" + "=".repeat(60))
  console.log("CONSOLE ERROR SUMMARY")
  console.log("=".repeat(60))
  if (report.consoleErrors.length > 0) {
    console.log(`Total console errors: ${report.consoleErrors.length}`)
    const unique = [...new Set(report.consoleErrors)]
    unique.forEach((e, i) => console.log(`  ${i + 1}. ${e}`))
  } else {
    console.log("✅ No console errors detected")
  }

  // ========================================
  // 7. FINAL SUMMARY
  // ========================================
  console.log("\n" + "=".repeat(60))
  console.log("AUDIT SUMMARY")
  console.log("=".repeat(60))
  console.log(`Total tests: ${report.summary.total}`)
  console.log(`Passed: ${report.summary.passed}`)
  console.log(`Failed: ${report.summary.failed}`)
  console.log(`Warnings: ${report.summary.warnings}`)

  // ========================================
  // SAVE REPORT
  // ========================================
  const reportPath = path.join(REPORT_DIR, `audit-report-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\nReport saved: ${reportPath}`)

  // Text summary
  const summaryPath = path.join(REPORT_DIR, `audit-summary-${Date.now()}.txt`)
  const lines = [
    "=".repeat(60),
    "METERVERSE COMPREHENSIVE AUDIT REPORT",
    "=".repeat(60),
    `Date: ${new Date().toLocaleString()}`,
    `Base URL: ${BASE}`,
    "",
    "--- SUMMARY ---",
    `Total Pages Tested: ${report.summary.total}`,
    `✅ Passed: ${report.summary.passed}`,
    `❌ Failed: ${report.summary.failed}`,
    `⚠️ Warnings: ${report.summary.warnings}`,
    `Console Errors: ${report.consoleErrors.length}`,
    "",
    "--- PAGE RESULTS ---",
  ]
  for (const [name, result] of Object.entries(report.pages)) {
    lines.push(`[${result.errors.length > 0 || result.jsErrors.length > 0 ? "❌" : result.warnings.length > 0 ? "⚠️" : "✅"}] ${name} (${result.url})`)
    lines.push(`    Status: ${result.status} → ${result.finalUrl}`)
    lines.push(`    JS Errors: ${result.jsErrors.length} | DOM Nodes: ${result.resources.domNodes}`)
    if (result.errors.length > 0) result.errors.forEach(e => lines.push(`    ❌ ${e}`))
    if (result.issues.length > 0) result.issues.forEach(i => lines.push(`    ⚠️ ${i}`))
  }
  lines.push("", "--- CONSOLE ERRORS ---")
  if (report.consoleErrors.length > 0) {
    const unique = [...new Set(report.consoleErrors)]
    unique.forEach(e => lines.push(`  ❌ ${e}`))
  } else {
    lines.push("  ✅ None found")
  }
  fs.writeFileSync(summaryPath, lines.join("\n"))
  console.log(`Summary saved: ${summaryPath}`)

  await browser.close()
  console.log("\n✅ Audit complete!")
}

main().catch((e) => {
  console.error("FATAL:", e.message)
  process.exit(1)
})
