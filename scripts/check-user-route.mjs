import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Check user page
await page.goto("http://localhost:7400/user", { waitUntil: "networkidle", timeout: 20000 })
await page.waitForTimeout(3000)

const userInfo = await page.evaluate(() => {
  const allStyles = []
  document.querySelectorAll("[style]").forEach(el => {
    const s = el.getAttribute("style") || ""
    if (s.includes("brand") || s.includes("059669") || s.includes("DC2626")) {
      allStyles.push(s.substring(0, 120))
    }
  })
  return { url: window.location.href, status: document.title, brandStyles: allStyles.slice(0, 5), html: document.body.innerHTML.substring(0, 1000) }
})

console.log("USER PAGE URL:", userInfo.url)
console.log("TITLE:", userInfo.status)
console.log("BRAND STYLES (" + userInfo.brandStyles.length + "):")
userInfo.brandStyles.forEach((s, i) => console.log("  [" + i + "] " + s))
console.log("\nHTML PREVIEW:", userInfo.html.substring(0, 500))

await browser.close()
