import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const pages = [
  "home", "customers", "meters", "invoices", "payments",
  "users", "roles", "audit", "projects", "zones", "units",
  "reports", "monitoring", "settings", "sim", "readings",
  "tariffs", "rca-workspace", "ai-command-center", "ai-operations"
]

const results = []

for (const p of pages) {
  try {
    const resp = await page.goto("http://localhost:3535/admin/" + p, { waitUntil: "networkidle", timeout: 10000 })
    const status = resp ? resp.status() : 0
    results.push({ page: p, status })
    console.log(p + ": " + status)
  } catch (e) {
    results.push({ page: p, status: "ERR" })
    console.log(p + ": ERR")
  }
}

const errors = results.filter(r => r.status !== 200)
console.log("\n== ERRORS (" + errors.length + ") ==")
errors.forEach(e => console.log(e.page + ": " + e.status))

await browser.close()
