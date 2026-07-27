import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto("http://localhost:7400/admin", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))

// Click the user menu button to open the dropdown
const userBtn = page.locator("button").filter({ hasText: "Admin User" }).first()
const btnExists = await userBtn.isVisible()
console.log("User button visible: " + btnExists)

if (btnExists) {
  await userBtn.click()
  await new Promise(r => setTimeout(r, 1000))
  
  // Take screenshot
  await page.screenshot({ path: "D:/meter/docs/screenshots/user-dropdown.png" })
  
  // Check z-index of dropdown
  const zIndexInfo = await page.evaluate(() => {
    const results = []
    // Find the dropdown (motion div that appeared)
    document.querySelectorAll("[class*='z-']").forEach(el => {
      const style = window.getComputedStyle(el)
      const z = style.zIndex
      if (z && z !== "auto" && parseInt(z) > 100) {
        results.push({
          tag: el.tagName,
          zIndex: z,
          classes: (el.className || "").substring(0, 60),
          text: (el.textContent || "").substring(0, 50),
          overflow: style.overflow,
          position: style.position,
          parentOverflow: el.parentElement ? window.getComputedStyle(el.parentElement).overflow : "n/a"
        })
      }
    })
    return results
  })
  
  console.log("\nHigh z-index elements:", JSON.stringify(zIndexInfo, null, 2).substring(0, 2000))
}

await browser.close()
