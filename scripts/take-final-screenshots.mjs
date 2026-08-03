import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const dir = "D:/meter/docs/screenshots/final-audit"
import { mkdir } from "fs"
mkdir(dir, { recursive: true }, () => {})

await page.goto("http://localhost:3535/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)
await page.screenshot({ path: dir + "/admin-root.png", fullPage: false })
console.log("OK admin-root")

// RTL screenshot
const langBtn = page.locator("button").filter({ hasText: /EN|AR/ }).first()
if (await langBtn.isVisible()) {
  await langBtn.click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: dir + "/admin-rtl.png", fullPage: false })
  console.log("OK admin-rtl")
  await langBtn.click()
  await page.waitForTimeout(1000)
}

const items = [
  ["customers", "Customers"], ["invoices", "Invoices"], ["meters", "Meters"],
  ["payments", "Payments"], ["sim", "SIM Cards"], ["readings", "Readings"],
  ["users", "Users"], ["audit", "Audit"], ["monitoring", "Monitor"],
  ["projects", "Projects"], ["zones", "Zones"], ["units", "Units"],
  ["tariffs", "Tariffs"], ["reports", "Reports"],
]

for (const [name, label] of items) {
  try {
    const link = page.locator("button", { hasText: label }).first()
    if (await link.isVisible()) {
      await link.click({ timeout: 5000 })
      await page.waitForTimeout(1200)
      await page.screenshot({ path: dir + "/admin-" + name + ".png", fullPage: false })
      console.log("OK admin-" + name)
    }
  } catch (e) {
    console.log("SKIP " + label)
  }
}

await browser.close()
console.log("ALL DONE - 16 screenshots")
