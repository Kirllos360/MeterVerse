import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const BASE = "http://localhost:7400"
const report = { runs: [], passed: 0, failed: 0, total: 0 }

async function check(label, fn) {
  report.total++
  try {
    const ok = await fn()
    if (ok) { report.passed++; console.log("  ✅ " + label) }
    else { report.failed++; console.log("  ❌ " + label) }
    report.runs.push({ label, passed: ok })
  } catch (e) {
    report.failed++
    report.runs.push({ label, passed: false, error: String(e) })
    console.log("  ❌ " + label + ": " + e)
  }
}

for (let loop = 1; loop <= 30; loop++) {
  console.log("\n=== VERIFICATION LOOP " + loop + "/30 ===")
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  await check("Admin page loads", async () => {
    const r = await page.goto(BASE + "/admin", { waitUntil: "networkidle", timeout: 15000 }).catch(() => null)
    return r ? r.status() === 200 : false
  })

  await check("Admin brand is red #DC2626", async () => {
    await page.goto(BASE + "/admin", { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(1000)
    const brand = await page.evaluate(() => {
      const els = document.querySelectorAll("[style]")
      for (const el of els) {
        const s = el.getAttribute("style") || ""
        if (s.includes("--brand")) return s.substring(0, 100)
      }
      return ""
    })
    return brand.includes("DC2626")
  })

  await check("Admin sidebar has floating design", async () => {
    const count = await page.evaluate(() => document.querySelectorAll("[class*='rounded-2xl']").length)
    return count > 3
  })

  await check("Admin search bar visible", async () => {
    const input = await page.$("input[placeholder*='Search']")
    return input !== null
  })

  await check("Admin login page loads", async () => {
    const r = await page.goto(BASE + "/admin/login", { waitUntil: "networkidle", timeout: 15000 }).catch(() => null)
    return r ? r.status() === 200 : false
  })

  await check("User page loads with green theme", async () => {
    const r = await page.goto(BASE + "/user", { waitUntil: "networkidle", timeout: 15000 }).catch(() => null)
    if (!r || r.status() !== 200) return false
    const brand = await page.evaluate(() => {
      const els = document.querySelectorAll("[style]")
      for (const el of els) {
        const s = el.getAttribute("style") || ""
        if (s.includes("059669")) return true
      }
      return false
    })
    return brand
  })

  const adminPages = ["customers", "meters", "invoices", "payments", "users", "settings", "monitoring", "audit", "reports", "projects", "zones", "units", "tariffs"]
  for (const p of adminPages) {
    await check("Admin /" + p + " loads", async () => {
      try {
        const r = await page.goto(BASE + "/admin/" + p, { waitUntil: "networkidle", timeout: 10000 }).catch(() => null)
        return r ? r.status() < 400 : false
      } catch { return false }
    })
  }

  await check("No green hex #22C55E in admin HTML", async () => {
    await page.goto(BASE + "/admin", { waitUntil: "networkidle", timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(500)
    const html = await page.evaluate(() => document.body.innerHTML)
    return !html.includes("#22C55E")
  })

  await check("No green-500 class in admin HTML", async () => {
    const html = await page.evaluate(() => document.body.innerHTML)
    return !html.includes("green-500")
  })

  await check("Backend health API responds", async () => {
    try {
      const r = await page.request.get("http://localhost:3002/api/health")
      return r.ok()
    } catch { return false }
  })

  await check("Backend meters API responds", async () => {
    try {
      const r = await page.request.get("http://localhost:3002/api/meters?limit=1", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
      return r.ok()
    } catch { return false }
  })

  await check("Backend customers API responds", async () => {
    try {
      const r = await page.request.get("http://localhost:3002/api/customers?limit=1", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
      return r.ok()
    } catch { return false }
  })

  await page.close()
  console.log("  ─── Loop " + loop + ": " + report.passed + "/" + report.total + " passed ───")
}

console.log("\n═══ FINAL RESULTS ═══")
console.log("Total checks: " + report.total)
console.log("Passed: " + report.passed)
console.log("Failed: " + report.failed)
console.log("Success rate: " + Math.round(report.passed / report.total * 100) + "%")

await browser.close()
