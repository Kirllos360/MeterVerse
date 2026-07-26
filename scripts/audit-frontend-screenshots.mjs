import { chromium } from "playwright"
import { mkdirSync } from "fs"

const dir = "D:/meter/docs/screenshots/frontend-audit"
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// ============ ADMIN PAGES ============
await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {})
await page.waitForTimeout(3000)
await page.screenshot({ path: dir + "/admin-root.png", fullPage: false })
console.log("✅ admin-root")

const adminPages = ["customers", "meters", "invoices", "payments", "users", "roles", "audit", "projects", "zones", "units", "reports", "monitoring", "settings", "sim", "readings", "tariffs", "rca-workspace", "ai-operations", "ai-command-center", "meter-assignments"]
for (const p of adminPages) {
  try {
    await page.goto("http://localhost:7400/admin/" + p, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await page.screenshot({ path: dir + "/admin-" + p + ".png", fullPage: false })
    console.log("✅ admin-" + p)
  } catch (e) { console.log("❌ admin-" + p) }
}

// ============ USER/ROOT PAGES ============
await page.goto("http://localhost:7400/", { waitUntil: "networkidle", timeout: 30000 }).catch(() => {})
await page.waitForTimeout(3000)
await page.screenshot({ path: dir + "/root-home.png", fullPage: false })
console.log("✅ root-home")

// Check what root renders - might be login page
const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0,200) || "empty")
console.log("Root content: " + bodyText)

await browser.close()
console.log("ALL DONE")
