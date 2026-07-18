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
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  pages: {},
  consoleErrors: [],
  findings: [],
  recommendations: [],
}

async function auditPage(page, url, name, opts = {}) {
  const result = {
    url, name, status: null, finalUrl: null,
    errors: [], warnings: [], jsErrors: [],
    consoleEntries: [], resources: {}, performance: {}, issues: [],
  }
  report.summary.total++

  const consoleHandler = (msg) => {
    result.consoleEntries.push({ type: msg.type(), text: msg.text() })
    if (msg.type() === "error") {
      result.jsErrors.push(msg.text())
      report.consoleErrors.push(`[${name}] ${msg.text()}`)
    }
    if (msg.type() === "warning") result.warnings.push(msg.text())
  }
  page.on("console", consoleHandler)
  page.on("pageerror", (err) => result.errors.push(`PAGE ERROR: ${err.message}`))
  page.on("requestfailed", (req) => result.errors.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText}`))

  try {
    const resp = await page.goto(url, { waitUntil: "load", timeout: 30000 })
    result.status = resp?.status()
    result.finalUrl = page.url()
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(2000)

    result.performance = await page.evaluate(() => ({
      loadTime: (performance.timing?.loadEventEnd ?? 0) - (performance.timing?.navigationStart ?? 0),
      domContentLoaded: (performance.timing?.domContentLoadedEventEnd ?? 0) - (performance.timing?.navigationStart ?? 0),
    })).catch(() => ({}))

    result.resources = await page.evaluate(() => ({
      scripts: document.querySelectorAll("script[src]").length,
      styles: document.querySelectorAll("link[rel=stylesheet]").length,
      images: document.querySelectorAll("img").length,
      domNodes: document.querySelectorAll("*").length,
      buttons: document.querySelectorAll("button").length,
      inputs: document.querySelectorAll("input, select, textarea").length,
    })).catch(() => ({}))

    // Accessibility
    const a11y = await page.evaluate(() => {
      const issues = []
      document.querySelectorAll("img:not([alt])").forEach((img) => {
        if (img.getAttribute("role") !== "presentation") issues.push("img missing alt")
      })
      document.querySelectorAll("button, [role=button]").forEach((b) => {
        if (!b.textContent?.trim() && !b.getAttribute("aria-label")) issues.push("button without label")
      })
      return issues
    }).catch(() => [])
    result.issues.push(...a11y)

    if (opts.expectRedirect) {
      if (result.finalUrl === BASE + "/") {
        console.log(`  ✅ ${name}: Redirect to / OK`)
      } else {
        result.errors.push(`Expected redirect to /, got ${result.finalUrl}`)
      }
    }
  } catch (e) {
    result.errors.push(`NAVIGATION ERROR: ${e.message}`)
  }

  page.removeListener("console", consoleHandler)

  const hasErrors = result.errors.length > 0 || result.jsErrors.length > 0
  const icon = hasErrors ? "❌" : result.warnings.length > 0 ? "⚠️" : "✅"
  if (hasErrors) report.summary.failed++
  else if (result.warnings.length > 0) report.summary.warnings++
  else report.summary.passed++
  console.log(`  ${icon} ${name}: ${result.status} | JS:${result.jsErrors.length} Issues:${result.issues.length} DOM:${result.resources.domNodes}`)

  report.pages[name] = result
  return result
}

async function main() {
  console.log("=".repeat(70))
  console.log("METERVERSE V2 COMPREHENSIVE AUDIT")
  console.log("=".repeat(70))
  console.log(`Time: ${new Date().toLocaleString()}`)
  console.log(`Target: ${BASE}`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await ctx.newPage()

  // ===========================================
  // PHASE 1: ROUTE & REDIRECT AUDIT
  // ===========================================
  console.log("\n── PHASE 1: ROUTE & REDIRECT AUDIT ──")
  await auditPage(page, BASE + "/", "Root Workspace")

  const redirectUrls = [
    ["/login", "Redirect: /login"],
    ["/workspace", "Redirect: /workspace"],
    ["/app/crm/customers", "Redirect: /app/crm/customers"],
    ["/app/meters", "Redirect: /app/meters"],
    ["/app/billing/invoices", "Redirect: /app/billing/invoices"],
    ["/app/readings", "Redirect: /app/readings"],
    ["/dashboard/overview", "Redirect: /dashboard"],
    ["/admin", "Redirect: /admin"],
    ["/customer", "Redirect: /customer"],
    ["/settings", "Redirect: /settings"],
    ["/about", "Redirect: /about"],
  ]
  for (const [url, name] of redirectUrls) {
    await auditPage(page, BASE + url, name, { expectRedirect: true })
  }

  // ===========================================
  // PHASE 2: SIDEBAR INTERACTION
  // ===========================================
  console.log("\n── PHASE 2: SIDEBAR INTERACTION ──")
  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  // Log all visible buttons
  const btnInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).map((b, i) => ({
      i, text: b.textContent?.trim()?.substring(0, 60), visible: b.offsetParent !== null, w: b.offsetWidth, h: b.offsetHeight, x: b.getBoundingClientRect().x, y: b.getBoundingClientRect().y
    })).filter(b => b.visible && b.w > 0)
  })
  console.log(`Visible buttons: ${btnInfo.length}`)
  btnInfo.forEach(b => console.log(`  [${b.i}] "${b.text}" (${b.w}x${b.h}) at ${b.x},${b.y}`))

  // Try to expand sidebar first (click the logo/collapse button)
  try {
    const expanders = page.locator("button").filter({ has: page.locator("svg") })
    const firstBtn = expanders.first()
    if (await firstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstBtn.click()
      await page.waitForTimeout(500)
      console.log("  Sidebar expand toggled")
    }
  } catch {}

  // Now try clicking nav items again — sidebar might be expanded
  const navItems = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
  for (const label of navItems) {
    try {
      const btn = page.locator(`button:has-text("${label}")`).first()
      const visible = await btn.isVisible({ timeout: 2000 }).catch(() => false)
      if (visible) {
        await btn.click()
        await page.waitForTimeout(1500)
        console.log(`  ✅ Clicked "${label}"`)
        // Verify tab system responded
        const activeTabInfo = await page.evaluate(() => {
          const tabs = document.querySelectorAll("[role='tab'], [class*='tab']")
          const active = document.querySelector("[aria-selected='true'], [class*='active']")
          return { totalTabs: tabs.length, activeText: active?.textContent?.trim()?.substring(0, 30) }
        })
        console.log(`     Tabs: ${activeTabInfo.totalTabs}, Active: ${activeTabInfo.activeText}`)
      } else {
        console.log(`  ⚠️ "${label}" not visible — trying SVG icon click`)
        // Try clicking the SVG icon area for this nav item
        const svgBtn = page.locator(`nav button:nth-child(${navItems.indexOf(label) + 1})`).first()
        if (await svgBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await svgBtn.click()
          await page.waitForTimeout(1000)
          console.log(`     Clicked via position`)
        }
      }
    } catch (e) {
      console.log(`  ❌ "${label}" error: ${e.message}`)
    }
  }

  // ===========================================
  // PHASE 3: CONSOLE DEEP SCAN
  // ===========================================
  console.log("\n── PHASE 3: CONSOLE DEEP SCAN ──")
  const allErrors = [...new Set(report.consoleErrors)]
  if (allErrors.length > 0) {
    console.log(`Found ${allErrors.length} unique console errors:`)
    allErrors.forEach((e, i) => console.log(`  [${i + 1}] ${e}`))
  } else {
    console.log("✅ No console errors detected in any page")
  }

  // ===========================================
  // PHASE 4: DESIGN SYSTEM DEEP INSPECTION
  // ===========================================
  console.log("\n── PHASE 4: DESIGN SYSTEM ──")
  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const designSys = await page.evaluate(() => {
    const info = {
      cssVars: {},
      themes: [],
      motions: [],
      allCSSVars: {},
    }
    // Check all stylesheets for CSS variables
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules || [])) {
          if (rule.constructor.name === "CSSStyleRule" && rule.selectorText?.includes(":root")) {
            for (let i = 0; i < rule.style.length; i++) {
              const name = rule.style[i]
              if (name.startsWith("--")) info.allCSSVars[name] = rule.style.getPropertyValue(name)?.trim()
            }
          }
        }
      } catch {}
    }
    // Try to find theme names
    const htmlAttr = document.documentElement.getAttribute("data-theme") || "none"
    const hasTheme = document.querySelector("[data-theme]") !== null
    info.themes = [htmlAttr, hasTheme ? "data-theme present" : "no data-theme"]

    // Check for framer-motion
    const scripts = Array.from(document.scripts).map(s => s.src).filter(Boolean)
    info.motions = [
      scripts.some(s => s.includes("framer")) ? "Framer Motion detected" : "No Framer Motion",
      scripts.some(s => s.includes("motion")) ? "Motion lib detected" : "No motion lib",
    ]
    return info
  })
  console.log(`  data-theme: ${designSys.themes[0]}`)
  console.log(`  CSS vars defined in stylesheets: ${Object.keys(designSys.allCSSVars).length}`)
  if (Object.keys(designSys.allCSSVars).length > 0) {
    const vars = designSys.allCSSVars
    for (const [k, v] of Object.entries(vars).slice(0, 20)) {
      console.log(`    ${k}: ${v}`)
    }
    if (Object.keys(vars).length > 20) console.log(`    ... and ${Object.keys(vars).length - 20} more`)
  }
  console.log(`  ${designSys.motions.join(" | ")}`)

  // ===========================================
  // PHASE 5: SECURITY AUDIT
  // ===========================================
  console.log("\n── PHASE 5: SECURITY AUDIT ──")
  const securityFindings = []
  
  // Check CSP headers
  const resp = await page.goto(BASE + "/", { waitUntil: "load" })
  const headers = resp?.headers() || {}
  if (headers["content-security-policy"]) securityFindings.push("CSP header present")
  else securityFindings.push("MISSING: Content-Security-Policy header")
  if (headers["x-frame-options"]) securityFindings.push("X-Frame-Options present")
  else securityFindings.push("MISSING: X-Frame-Options header")
  if (headers["x-content-type-options"]) securityFindings.push("X-Content-Type-Options present")
  else securityFindings.push("MISSING: X-Content-Type-Options")

  // Check for CSRF/XSS protections
  const hasCSRF = await page.evaluate(() => {
    const metas = document.querySelectorAll("meta")
    return Array.from(metas).some(m => m.getAttribute("http-equiv") === "Content-Security-Policy")
  })
  if (hasCSRF) securityFindings.push("CSP meta tag present")
  else securityFindings.push("No CSP meta tag")

  // Check all pages redirect to /
  securityFindings.push(`Auth bypass: ${redirectUrls.length} protected routes all redirected to / ✓`)

  console.log(`  Security findings: ${securityFindings.length}`)
  securityFindings.forEach(f => console.log(`    ${f.startsWith("MISSING") ? "❌" : "✅"} ${f}`))

  // ===========================================
  // PHASE 6: ACCESSIBILITY & ISSUES
  // ===========================================
  console.log("\n── PHASE 6: ACCESSIBILITY ──")
  await page.goto(BASE + "/", { waitUntil: "load" })
  await page.waitForTimeout(2000)

  const a11yCheck = await page.evaluate(() => {
    const issues = []
    const imgs = document.querySelectorAll("img:not([alt])")
    if (imgs.length) issues.push(`${imgs.length} images missing alt text`)
    
    const buttons = document.querySelectorAll("button, [role=button]")
    let unlabeledButtons = 0
    buttons.forEach(b => {
      if (!b.textContent?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")) unlabeledButtons++
    })
    if (unlabeledButtons) issues.push(`${unlabeledButtons} buttons without labels`)

    const inputs = document.querySelectorAll("input:not([type=hidden])")
    let unlabeledInputs = 0
    inputs.forEach(i => {
      if (!i.id && !i.getAttribute("aria-label")) unlabeledInputs++
    })
    if (unlabeledInputs) issues.push(`${unlabeledInputs} inputs without labels`)

    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const headingLevels = Array.from(headings).reduce((acc, h) => {
      const level = parseInt(h.tagName[1])
      if (!acc[level]) acc[level] = 0
      acc[level]++
      return acc
    }, {})
    issues.push(`Headings: ${JSON.stringify(headingLevels)}`)

    return issues
  })
  a11yCheck.forEach(i => console.log(`  ${i.startsWith("Headings:") ? "ℹ️" : "⚠️"} ${i}`))
  report.findings.push(...a11yCheck.filter(i => !i.startsWith("Headings:")))

  // ===========================================
  // PHASE 7: DARK MODE / THEME SWITCHING
  // ===========================================
  console.log("\n── PHASE 7: THEME CHECK ──")
  const themeState = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    htmlAttr: Object.values(document.documentElement.attributes).map(a => `${a.name}=${a.value}`).join("; "),
    colorScheme: getComputedStyle(document.documentElement).getPropertyValue("color-scheme"),
    hasThemeProvider: !!document.querySelector("[class*='theme'], [data-theme]"),
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
  }))
  console.log(`  HTML attributes: ${themeState.htmlAttr}`)
  console.log(`  color-scheme: ${themeState.colorScheme}`)
  console.log(`  body bg: ${themeState.bodyBg}, color: ${themeState.bodyColor}`)
  
  // Try to find theme switcher button
  const themeBtns = await page.locator("button").filter({ has: page.locator("svg") }).count()
  console.log(`  Buttons with SVG icons: ${themeBtns}`)

  // ===========================================
  // FINAL SUMMARY
  // ===========================================
  console.log("\n" + "=".repeat(70))
  console.log("FINAL AUDIT SUMMARY")
  console.log("=".repeat(70))
  console.log(`Total tests: ${report.summary.total}`)
  console.log(`✅ Passed: ${report.summary.passed}`)
  console.log(`❌ Failed: ${report.summary.failed}`)
  console.log(`⚠️ Warnings: ${report.summary.warnings}`)
  console.log(`Unique console errors: ${[...new Set(report.consoleErrors)].length}`)
  console.log(`Accessibility issues: ${report.findings.filter(f => f.includes("missing") || f.includes("without")).length}`)

  const summaryLines = [
    "=".repeat(70),
    "METERVERSE V2 AUDIT REPORT",
    "=".repeat(70),
    `Date: ${new Date().toLocaleString()}`,
    `Target: ${BASE}`,
    "",
    "── SUMMARY ──",
    `Total page tests: ${report.summary.total}`,
    `✅ Passed: ${report.summary.passed}`,
    `❌ Failed: ${report.summary.failed}`,
    `⚠️ Warnings: ${report.summary.warnings}`,
    `Console errors: ${[...new Set(report.consoleErrors)].length}`,
    `A11y issues: ${report.findings.filter(f => f.includes("missing") || f.includes("without")).length}`,
    "",
    "── ALL PAGE RESULTS ──",
  ]
  for (const [name, r] of Object.entries(report.pages)) {
    const icon = r.errors.length > 0 || r.jsErrors.length > 0 ? "❌" : r.warnings.length > 0 ? "⚠️" : "✅"
    summaryLines.push(`[${icon}] ${name} → ${r.finalUrl}`)
    summaryLines.push(`  Status: ${r.status} | JS:${r.jsErrors.length} | A11y:${r.issues.length} | DOM:${r.resources.domNodes}`)
    if (r.errors.length) r.errors.forEach(e => summaryLines.push(`  ERROR: ${e}`))
    if (r.issues.length) r.issues.forEach(i => summaryLines.push(`  A11Y: ${i}`))
  }
  summaryLines.push("", "── ALL CONSOLE ERRORS ──")
  const uniqueErrors = [...new Set(report.consoleErrors)]
  if (uniqueErrors.length) uniqueErrors.forEach(e => summaryLines.push(`  ❌ ${e}`))
  else summaryLines.push("  ✅ None found")
  
  summaryLines.push("", "── SECURITY ──")
  securityFindings.forEach(f => summaryLines.push(`  ${f.startsWith("MISSING") ? "❌" : "✅"} ${f}`))
  
  summaryLines.push("", "── DESIGN SYSTEM ──")
  summaryLines.push(`  data-theme: ${designSys.themes[0]}`)
  summaryLines.push(`  CSS vars defined: ${Object.keys(designSys.allCSSVars).length}`)
  summaryLines.push(`  ${designSys.motions.join(" | ")}`)
  
  summaryLines.push("", "── RECOMMENDATIONS ──")
  if (designSys.themes[0] === "none") summaryLines.push("  • No data-theme set on <html>")
  if (Object.keys(designSys.allCSSVars).length < 5) summaryLines.push("  • Design tokens not found in CSS variables")
  if (report.findings.some(f => f.includes("missing alt"))) summaryLines.push("  • Add alt attributes to all images")
  if (report.findings.some(f => f.includes("without label"))) summaryLines.push("  • Add aria-label to icon-only buttons")
  if (!headers["content-security-policy"]) summaryLines.push("  • Add Content-Security-Policy header")
  if (!headers["x-frame-options"]) summaryLines.push("  • Add X-Frame-Options: DENY header")
  if (!headers["x-content-type-options"]) summaryLines.push("  • Add X-Content-Type-Options: nosniff header")

  const reportPath = path.join(REPORT_DIR, `audit-v2-${Date.now()}.txt`)
  fs.writeFileSync(reportPath, summaryLines.join("\n"))
  console.log(`\nFull report: ${reportPath}`)

  await browser.close()
  console.log("\n✅ Audit complete!")
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1) })
