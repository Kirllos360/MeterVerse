import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:3535/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const brandEls = []
  document.querySelectorAll("[style]").forEach(el => {
    const s = el.getAttribute("style") || ""
    if (s.includes("brand")) {
      brandEls.push({ tag: el.tagName, style: s.substring(0, 100) })
    }
  })
  
  // Check for duplicate layouts
  const containers = []
  document.querySelectorAll("div").forEach(el => {
    const s = el.getAttribute("style") || ""
    if (s.includes("h-screen") || s.includes("sidebar-background")) {
      containers.push({ tag: el.tagName, cls: (el.className || "").substring(0, 60), style: s.substring(0, 80) })
    }
  })
  
  // Check tabs/inspector
  const inspectors = document.querySelectorAll("[class*='inspector'], [class*='Inspector']").length
  
  // Check URL 
  const url = window.location.href
  
  return { brandCount: brandEls.length, containers, inspectors, url, brandEls: brandEls.slice(0, 2) }
})

console.log("URL:", info.url)
console.log("Brand declarations:", info.brandCount)
console.log("Inspector panels:", info.inspectors)
console.log("\nLayout containers:")
info.containers.forEach((c, i) => console.log("  [" + i + "] " + c.cls + " | " + c.style))

// Check if brand is red
const firstBrand = info.containers[0]?.style || ""
if (firstBrand.includes("DC2626") || firstBrand.includes("dc2626")) {
  console.log("\nâœ“ BRAND COLOR: RED #DC2626")
} else if (firstBrand.includes("00BFA5")) {
  console.log("\nâœ— BRAND COLOR: Still teal")
} else {
  console.log("\n? BRAND COLOR: Unknown")
}

console.log("\nDUPLICATION CHECK: " + (info.containers.length <= 2 ? "âœ“ SINGLE LAYOUT" : "âœ— DUPLICATE LAYOUT (" + info.containers.length + " containers)"))

await browser.close()
