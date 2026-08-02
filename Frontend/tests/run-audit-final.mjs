import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:3030"
const REPORT_DIR = path.resolve(__dirname, "../test-reports")
fs.mkdirSync(REPORT_DIR, { recursive: true })

const report = {
  timestamp: new Date().toISOString(),
  summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  pages: {},
  consoleErrors: [],
  findings: [],
  designTokens: {},
  recommendations: [],
}

async function test(page, url, name, opts = {}) {
  const r = { url, name, status: null, finalUrl: null, errors: [], warnings: [], jsErrors: [], consoleEntries: [], resources: {}, performance: {}, issues: [] }
  report.summary.total++

  const handler = (msg) => {
    r.consoleEntries.push({ type: msg.type(), text: msg.text() })
    if (msg.type() === "error" && !msg.text().includes("font") && !msg.text().includes("woff") && !msg.text().includes("geist")) { r.jsErrors.push(msg.text()); report.consoleErrors.push(`[${name}] ${msg.text()}`) }
    if (msg.type() === "warning") r.warnings.push(msg.text())
  }
  page.on("console", handler)
  page.on("pageerror", (err) => r.errors.push(`PAGE ERROR: ${err.message}`))
  page.on("requestfailed", (req) => {
    const url = req.url()
    if (url.includes("__nextjs_font") || url.includes("geist") || url.includes(".woff") || url.includes(".woff2")) return
    r.errors.push(`REQUEST FAILED: ${url} - ${req.failure()?.errorText}`)
  })

  try {
    const resp = await page.goto(url, { waitUntil: "load", timeout: 30000 })
    r.status = resp?.status(); r.finalUrl = page.url()
    await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(2000)

    r.resources = await page.evaluate(() => ({
      scripts: document.querySelectorAll("script[src]").length,
      styles: document.querySelectorAll("link[rel=stylesheet]").length,
      domNodes: document.querySelectorAll("*").length,
      buttons: document.querySelectorAll("button").length,
    })).catch(() => ({}))

    r.performance = await page.evaluate(() => ({
      loadTime: (performance.timing?.loadEventEnd ?? 0) - (performance.timing?.navigationStart ?? 0),
    })).catch(() => ({}))

    const a11y = await page.evaluate(() => {
      const issues = []
      document.querySelectorAll("img:not([alt])").forEach((img) => { if (img.getAttribute("role") !== "presentation") issues.push("img missing alt") })
      document.querySelectorAll("button, [role=button]").forEach((b) => { if (!b.textContent?.trim() && !b.getAttribute("aria-label")) issues.push("button without label") })
      return issues
    }).catch(() => [])
    r.issues.push(...a11y)
  } catch (e) { r.errors.push(`NAV ERROR: ${e.message}`) }

  page.removeListener("console", handler)

  if (opts.expectRedirect && r.finalUrl === BASE + "/") console.log(`  âœ… ${name}: redirect OK`)
  else if (opts.expectRedirect) r.errors.push(`Expected redirect to / but got ${r.finalUrl}`)
  if (opts.expectAdmin && r.finalUrl?.startsWith(BASE + "/admin")) console.log(`  âœ… ${name}: admin route OK`)

  const hasErr = r.errors.length > 0 || r.jsErrors.length > 0
  const icon = hasErr ? "âŒ" : r.warnings.length > 0 ? "âš ï¸" : "âœ…"
  if (hasErr) report.summary.failed++; else if (r.warnings.length > 0) report.summary.warnings++; else report.summary.passed++
  console.log(`  ${icon} ${name}: ${r.status} | JS:${r.jsErrors.length} A11y:${r.issues.length} DOM:${r.resources.domNodes}`)
  report.pages[name] = r
  return r
}

async function main() {
  console.log("=".repeat(70))
  console.log("METERVERSE FINAL AUDIT â€” PHASE 16")
  console.log("=".repeat(70))

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await ctx.newPage()

  // ===========================================
  // PHASE 1: ROOT & MAIN SYSTEM ROUTES
  // ===========================================
  console.log("\nâ”€â”€ 1. MAIN SYSTEM â”€â”€")
  await test(page, BASE + "/", "Root Workspace")
  await test(page, BASE + "/login", "Redirect: /login", { expectRedirect: true })
  await test(page, BASE + "/workspace", "Redirect: /workspace", { expectRedirect: true })
  await test(page, BASE + "/app/crm/customers", "Redirect: Customers", { expectRedirect: true })
  await test(page, BASE + "/app/meters", "Redirect: Meters", { expectRedirect: true })
  await test(page, BASE + "/app/billing/invoices", "Redirect: Invoices", { expectRedirect: true })
  await test(page, BASE + "/app/readings", "Redirect: Readings", { expectRedirect: true })
  await test(page, BASE + "/dashboard/overview", "Redirect: Dashboard", { expectRedirect: true })
  await test(page, BASE + "/settings", "Redirect: Settings", { expectRedirect: true })

  // ===========================================
  // PHASE 2: ADMIN PLATFORM (port 7500 route)
  // ===========================================
  console.log("\nâ”€â”€ 2. ADMIN PLATFORM â”€â”€")
  await test(page, BASE + "/admin/login", "Admin Login", { expectAdmin: true })
  await test(page, BASE + "/admin/dashboard", "Admin Dashboard", { expectAdmin: true })
  await test(page, BASE + "/admin/users", "Admin Users", { expectAdmin: true })
  await test(page, BASE + "/admin/roles", "Admin Roles", { expectAdmin: true })
  await test(page, BASE + "/admin/monitoring", "Admin Monitoring", { expectAdmin: true })
  await test(page, BASE + "/admin/audit", "Admin Audit", { expectAdmin: true })
  await test(page, BASE + "/admin/logs", "Admin Logs", { expectAdmin: true })
  await test(page, BASE + "/admin/security", "Admin Security", { expectAdmin: true })
  await test(page, BASE + "/admin/settings", "Admin Settings", { expectAdmin: true })

  // ===========================================
  // PHASE 3: AUTH BYPASS TESTS
  // ===========================================
  console.log("\nâ”€â”€ 3. AUTH BYPASS PROTECTION â”€â”€")
  const bypassUrls = [
    "/dashboard", "/app/admin", "/customer", "/about",
    "/privacy-policy", "/terms-of-service", "/component-lab",
  ]
  for (const url of bypassUrls) {
    await test(page, BASE + url, `Bypass: ${url}`, { expectRedirect: true })
  }

  // ===========================================
  // PHASE 4: SIDEBAR NAVIGATION
  // ===========================================
  console.log("\nâ”€â”€ 4. SIDEBAR NAVIGATION â”€â”€")
  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  const visibleBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).map(b => ({
      text: b.textContent?.trim()?.substring(0, 30), visible: b.offsetParent !== null, w: b.offsetWidth
    })).filter(b => b.visible && b.w > 0)
  })
  console.log(`  Visible buttons: ${visibleBtns.length}`)

  const navItems = ["Dashboard", "Customers", "Meters", "Readings", "Invoices", "Payments"]
  for (const label of navItems) {
    try {
      const btn = page.locator(`button:has-text("${label}")`).first()
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click(); await page.waitForTimeout(1500)
        const tab = await page.evaluate(() => {
          const active = document.querySelector("[aria-selected='true']")
          return active?.textContent?.trim()?.substring(0, 30)
        })
        console.log(`  âœ… ${label} â†’ Tab active: ${tab}`)
      }
    } catch {}
  }

  // ===========================================
  // PHASE 5: CONSOLE ERROR DEEP SCAN
  // ===========================================
  console.log("\nâ”€â”€ 5. CONSOLE ERRORS â”€â”€")
  const unique = [...new Set(report.consoleErrors)]
  if (unique.length > 0) { unique.forEach((e, i) => console.log(`  âŒ [${i + 1}] ${e}`)) }
  else { console.log("  âœ… NONE FOUND") }

  // ===========================================
  // PHASE 6: SECURITY HEADERS
  // ===========================================
  console.log("\nâ”€â”€ 6. SECURITY HEADERS â”€â”€")
  const resp = await page.goto(BASE + "/", { waitUntil: "load" })
  const h = resp?.headers() || {}
  const secHeaders = {
    "X-Frame-Options": h["x-frame-options"] === "DENY",
    "X-Content-Type-Options": h["x-content-type-options"] === "nosniff",
    "Referrer-Policy": h["referrer-policy"] === "strict-origin-when-cross-origin",
    "X-XSS-Protection": h["x-xss-protection"] === "1; mode=block",
  }
  for (const [k, v] of Object.entries(secHeaders)) {
    console.log(`  ${v ? "âœ…" : "âŒ"} ${k}`)
  }

  // ===========================================
  // PHASE 7: DESIGN TOKENS
  // ===========================================
  console.log("\nâ”€â”€ 7. DESIGN TOKENS â”€â”€")
  const tokens = await page.evaluate(() => {
    const found = {}
    const checks = ["--brand-primary", "--surface-base", "--text-primary", "--border-default", "--status-success"]
    checks.forEach(t => { const v = getComputedStyle(document.documentElement).getPropertyValue(t).trim(); if (v) found[t] = v })
    return found
  })
  report.designTokens = tokens
  if (Object.keys(tokens).length > 0) {
    for (const [k, v] of Object.entries(tokens)) console.log(`  âœ… ${k}: ${v}`)
  } else {
    console.log("  âš ï¸ Design tokens not in :root (may be in theme CSS)")

    const allVars = await page.evaluate(() => {
      const v = {}
      for (const sheet of document.styleSheets) {
        try { for (const rule of sheet.cssRules) {
          if (rule.selectorText?.includes(":root") || rule.selectorText?.includes("[data-theme")) {
            for (let i = 0; i < rule.style.length; i++) { const n = rule.style[i]; if (n.startsWith("--")) v[n] = rule.style.getPropertyValue(n).trim() }
          }
        }} catch {}
      }
      return v
    })
    console.log(`  Found ${Object.keys(allVars).length} vars in stylesheets`)
    Object.entries(allVars).slice(0, 10).forEach(([k, v]) => console.log(`    ${k}: ${v}`))
  }

  // ===========================================
  // SUMMARY
  // ===========================================
  console.log("\n" + "=".repeat(70))
  console.log("FINAL AUDIT SUMMARY")
  console.log("=".repeat(70))
  console.log(`Total: ${report.summary.total}`)
  console.log(`âœ… Passed: ${report.summary.passed}`)
  console.log(`âŒ Failed: ${report.summary.failed}`)
  console.log(`âš ï¸ Warnings: ${report.summary.warnings}`)
  console.log(`Console errors: ${unique.length}`)
  console.log(`Security headers: ${Object.values(secHeaders).filter(Boolean).length}/4`)

  // Save report
  const lines = [
    "=".repeat(70),
    "METERVERSE FINAL AUDIT REPORT â€” PHASE 16",
    "=".repeat(70),
    `Date: ${new Date().toLocaleString()}`,
    `Target: ${BASE}`,
    "",
    `Total: ${report.summary.total}`,
    `âœ… Passed: ${report.summary.passed}`,
    `âŒ Failed: ${report.summary.failed}`,
    `âš ï¸ Warnings: ${report.summary.warnings}`,
    `Console errors: ${unique.length}`,
    `Security headers: ${Object.values(secHeaders).filter(Boolean).length}/4`,
    "",
    "â”€â”€ ALL PAGE RESULTS â”€â”€",
  ]
  for (const [name, r] of Object.entries(report.pages)) {
    const icon = r.errors.length > 0 || r.jsErrors.length > 0 ? "âŒ" : r.warnings.length > 0 ? "âš ï¸" : "âœ…"
    lines.push(`[${icon}] ${name} â†’ ${r.finalUrl}`)
    lines.push(`  Status: ${r.status} | JS:${r.jsErrors.length} | A11y:${r.issues.length} | DOM:${r.resources.domNodes}`)
    if (r.errors.length) r.errors.forEach(e => lines.push(`  ERROR: ${e}`))
  }
  lines.push("", "â”€â”€ CONSOLE ERRORS â”€â”€")
  if (unique.length) unique.forEach(e => lines.push(`  âŒ ${e}`))
  else lines.push("  âœ… None found")
  lines.push("", "â”€â”€ SECURITY HEADERS â”€â”€")
  for (const [k, v] of Object.entries(secHeaders)) lines.push(`  ${v ? "âœ…" : "âŒ"} ${k}`)
  lines.push("", "â”€â”€ RECOMMENDATIONS â”€â”€")
  lines.push("  â€¢ Add Content-Security-Policy header with nonces for Next.js")
  lines.push("  â€¢ Add loading skeletons for Suspense boundaries")
  lines.push("  â€¢ Add full RTL CSS flip support for Arabic")
  lines.push("  â€¢ Connect frontend service layer to backend API (port 3001)")
  lines.push("  â€¢ Add unit tests (Vitest) + component tests (RTL)")
  lines.push("  â€¢ Add CI pipeline for automated Playwright tests")

  const rp = path.join(REPORT_DIR, `final-audit-${Date.now()}.txt`)
  fs.writeFileSync(rp, lines.join("\n"))
  console.log(`\nFull report: ${rp}`)

  await browser.close()
  console.log("\nâœ… FINAL AUDIT COMPLETE")
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1) })
