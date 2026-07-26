import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 20000 })
await page.waitForTimeout(2000)
await page.screenshot({ path: "D:/meter/docs/screenshots/before-fix/admin-root.png", fullPage: false })
console.log("OK admin-root")

const navItems = [
  ["customers", "Customers"],
  ["meters", "Meters"],
  ["relay", "Relay"],
  ["assign", "Assign"],
  ["sim", "SIM Cards"],
  ["readings", "Readings"],
  ["invoices", "Invoices"],
  ["payments", "Payments"],
  ["tariffs", "Tariffs"],
  ["users", "Users"],
  ["roles", "Roles"],
  ["audit", "Audit"],
  ["projects", "Projects"],
  ["zones", "Zones"],
  ["units", "Units"],
  ["reports", "Reports"],
  ["monitoring", "Monitor"],
]

for (const [name, label] of navItems) {
  try {
    const link = page.locator("button", { hasText: label }).first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `D:/meter/docs/screenshots/before-fix/admin-${name}.png`, fullPage: false })
      console.log("OK admin-" + name)
    } else {
      console.log("NOT VISIBLE " + label)
    }
  } catch (e) {
    console.log("SKIP " + label)
  }
}

await browser.close()
console.log("ALL DONE")
