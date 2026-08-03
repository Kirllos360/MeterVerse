import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3535/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

// Click the inspector toggle button (first button in toolbar group that looks like inspector)
const inspectorBtns = page.locator("button[aria-label*='Inspector'], button[title*='Inspector']")
if (await inspectorBtns.count() > 0) {
  await inspectorBtns.first().click()
  await page.waitForTimeout(1000)
  console.log("Clicked inspector toggle")
}

const result = await page.evaluate(() => {
  const panels = document.querySelectorAll("[class*='inspector'], [class*='Inspector']")
  const divs = document.querySelectorAll("div")
  let panelCount = 0
  divs.forEach(d => {
    const s = d.getAttribute("style") || ""
    if (s.match(/width.*360/)) panelCount++
  })
  return { classMatches: panels.length, width360: panelCount }
})

console.log("Inspector panels (class match):", result.classMatches)
console.log("Inspector panels (width 360):", result.width360)

// Test navigation - click customers
await page.locator("button", { hasText: "Customers" }).first().click()
await page.waitForTimeout(1500)
const urlAfter = page.url()
console.log("URL after clicking Customers:", urlAfter)

// Take screenshot
await page.screenshot({ path: "D:/meter/docs/screenshots/final-audit/admin-after-fix.png", fullPage: false })
console.log("Screenshot saved")

await browser.close()
