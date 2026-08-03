import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto("http://localhost:3535/admin", { waitUntil: "networkidle", timeout: 20000 })
await page.waitForTimeout(2000)
await page.screenshot({ path: "D:/meter/docs/screenshots/after-fix-wave3/admin-root.png", fullPage: false })
console.log("OK admin-root")

// RTL test - toggle language
const langBtn = page.locator("button[aria-label*=\"Language\"]").first()
if (await langBtn.isVisible()) {
  await langBtn.click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: "D:/meter/docs/screenshots/after-fix-wave3/admin-rtl.png", fullPage: false })
  console.log("OK admin-rtl")
  await langBtn.click()
  await page.waitForTimeout(1000)
}

const items = [
  ["customers", "Customers"], ["invoices", "Invoices"], ["meters", "Meters"],
  ["payments", "Payments"], ["sim", "SIM Cards"], ["readings", "Readings"],
  ["users", "Users"], ["audit", "Audit"], ["monitoring", "Monitor"],
]

for (const [name, label] of items) {
  try {
    const link = page.locator("button", { hasText: label }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForTimeout(1200)
      await page.screenshot({ path: "D:/meter/docs/screenshots/after-fix-wave3/admin-" + name + ".png", fullPage: false })
      console.log("OK admin-" + name)
    }
  } catch (e) {
    console.log("SKIP " + label)
  }
}

await browser.close()
console.log("ALL DONE")
