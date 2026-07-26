import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Force hard refresh (no-cache)
await page.goto("http://localhost:7400/admin?t=" + Date.now(), { waitUntil: "networkidle", timeout: 25000 })
await page.waitForTimeout(3000)

const result = await page.evaluate(() => {
  const mainDiv = document.querySelector("div[style*='--brand']")
  const style = mainDiv ? mainDiv.getAttribute("style") : "not found"
  return style ? style.substring(0, 400) : "not found"
})

console.log("BRAND STYLE:", result)
console.log("---")
// Check if it's teal or red
if (result.includes("00BFA5") || result.includes("00bfa5")) {
  console.log("BRAND COLOR: TEAL #00BFA5 ✓")
} else if (result.includes("DC2626") || result.includes("dc2626")) {
  console.log("BRAND COLOR: RED #DC2626 ✗ - NEEDS RESTART")
} else {
  console.log("BRAND COLOR: UNKNOWN -", result)
}

const sidebarEl = await page.evaluate(() => {
  const sidebar = document.querySelector("[style*='sidebar-background']")
  if (!sidebar) return "no sidebar"
  const s = sidebar.getAttribute("style") || ""
  return s.includes("00BFA5") ? "TEAL" : s.includes("DC2626") ? "OLD RED" : s.substring(0, 100)
})
console.log("SIDEBAR STATUS:", sidebarEl)

await browser.close()
