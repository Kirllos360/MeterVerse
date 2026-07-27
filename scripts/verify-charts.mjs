import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto("http://localhost:7400/admin", { timeout: 30000 }).catch(() => {})
await new Promise(r => setTimeout(r, 6000))

// Take screenshot of the admin home page with charts
await page.screenshot({ path: "D:/meter/docs/screenshots/admin-charts.png" })
console.log("✅ Admin screenshot taken")

// Check chart background colors in dark mode
const chartBg = await page.evaluate(() => {
  const svgs = document.querySelectorAll(".recharts-surface")
  return Array.from(svgs).map(svg => {
    const parent = svg.closest("[class*='rounded-2xl']")
    const parentBg = parent ? window.getComputedStyle(parent).backgroundColor : "none"
    return { parentBg }
  })
})
console.log("Chart parent backgrounds:", JSON.stringify(chartBg.slice(0, 3)))

// Check footer height
const footerH = await page.evaluate(() => {
  const divs = document.querySelectorAll("div")
  for (const d of divs) {
    if (d.textContent?.includes("Meter Verse v8.0")) {
      return d.parentElement?.getBoundingClientRect().height
    }
  }
  return null
})
console.log("Footer height:", footerH, "px (should be 40)")

await browser.close()
console.log("DONE")
