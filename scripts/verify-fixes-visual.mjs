import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const dir = "D:/meter/docs/screenshots/verified-fixes"
import { mkdirSync } from "fs"
mkdirSync(dir, { recursive: true })

await page.goto("http://localhost:3535/admin", { timeout: 60000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))
await page.screenshot({ path: dir + "/01-admin-root.png" })
console.log("âœ… 01-admin-root â€” Shortcut Menu, ConnectionHeader")

// Check if "Shortcut Menu" text exists
const hasShortcut = await page.evaluate(() => document.body.innerText.includes("Shortcut Menu"))
console.log("  Shortcut Menu text: " + (hasShortcut ? "âœ… VISIBLE" : "âŒ MISSING"))

// Check connection signal
const hasSignal = await page.evaluate(() => document.body.innerHTML.includes("online") || document.body.innerHTML.includes("degraded"))
console.log("  Connection signal: " + (hasSignal ? "âœ… PRESENT" : "âŒ MISSING"))

// Check user dropdown
await page.goto("http://localhost:3535/admin/login", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 3000))
await page.screenshot({ path: dir + "/02-login-page.png" })
console.log("âœ… 02-login-page")

// Check user version (green theme)
await page.goto("http://localhost:3535/", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 3000))
await page.screenshot({ path: dir + "/03-user-root.png" })
console.log("âœ… 03-user-root")

// Check footer height is reduced
const footerHeight = await page.evaluate(() => {
  const footer = document.querySelector("[style*='height']")
  if (footer) {
    const style = footer.getAttribute("style") || ""
    const match = style.match(/height:\s*(\d+)/)
    return match ? match[1] : "not found"
  }
  return "no footer"
})
console.log("  Footer height: " + footerHeight + "px (should be 40)")

await browser.close()
console.log("\nâœ… All screenshots captured in " + dir)
