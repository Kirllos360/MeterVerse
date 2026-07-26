import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  return {
    url: window.location.href,
    title: document.title,
    sidebar: document.querySelectorAll("[class*='sidebar']").length,
    floatingPanels: document.querySelectorAll("[class*='rounded-xl']").length,
    brandColor: document.querySelector("[style*='--brand']")?.getAttribute("style")?.substring(0, 50) || "",
    hasTabs: !!document.querySelector("button[style*='border-bottom']"),
    hasFooter: !!document.querySelector("footer") || [...document.querySelectorAll("div")].some(d => d.textContent?.includes("MeterVerse v8.0")),
    bodyHTML: document.body.innerHTML.substring(0, 800)
  }
})

console.log("URL:", info.url)
console.log("Title:", info.title)
console.log("Sidebar elements:", info.sidebar)
console.log("Floating panels (rounded-xl):", info.floatingPanels)
console.log("Has tabs:", info.hasTabs)
console.log("Has footer:", info.hasFooter)
console.log("Brand color:", info.brandColor)

await page.screenshot({ path: "D:/meter/docs/screenshots/final-audit/admin-new-layout.png", fullPage: false })
console.log("Screenshot saved")

await browser.close()
