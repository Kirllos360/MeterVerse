import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Log console errors
page.on("console", msg => { if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text()) })

await page.goto("http://localhost:3535/admin", { timeout: 60000 }).catch(() => {})
await new Promise(r => setTimeout(r, 6000))

// Click user menu to open dropdown
const userBtn = page.locator("button").filter({ hasText: "Admin User" })
const userVisible = await userBtn.isVisible()
console.log("1. User button visible:", userVisible)

if (userVisible) {
  // Get the button's bounding box BEFORE clicking
  const box = await userBtn.boundingBox()
  console.log("   Button position:", JSON.stringify(box))
  
  await userBtn.click()
  await new Promise(r => setTimeout(r, 1500))
  
  // Take screenshot showing dropdown
  await page.screenshot({ path: "D:/meter/docs/screenshots/dropdown-test.png" })
  
  // Check if any dropdown content is visible (text that only appears in dropdown)
  const bodyText = await page.evaluate(() => document.body.innerText)
  const hasProfile = bodyText.includes("My Profile")
  const hasSettings = bodyText.includes("Account Settings")
  const hasSignOut = bodyText.includes("Sign Out")
  console.log("2. 'My Profile' visible:", hasProfile)
  console.log("   'Account Settings' visible:", hasSettings)
  console.log("   'Sign Out' visible:", hasSignOut)
  
  // Check z-index of user menu 
  const zIndex = await page.evaluate(() => {
    const el = document.querySelector("[class*='z-[']")
    if (!el) return "none found"
    return window.getComputedStyle(el).zIndex
  })
  console.log("3. Dropdown z-index:", zIndex)
  
  // Check if parent container has overflow:hidden
  const parentOverflow = await page.evaluate(() => {
    const dropdown = document.querySelector("[class*='z-[']")
    if (!dropdown) return "no dropdown"
    let el = dropdown.parentElement
    while (el) {
      const style = window.getComputedStyle(el)
      if (style.overflow === "hidden") {
        return {
          tag: el.tagName,
          class: (el.className || "").substring(0, 80),
          overflow: style.overflow,
          position: style.position,
          zIndex: style.zIndex
        }
      }
      el = el.parentElement
    }
    return "no overflow-hidden ancestor"
  })
  console.log("4. Parent with overflow-hidden:", JSON.stringify(parentOverfix))
}

await browser.close()

if (parentOverflow === "no overflow-hidden ancestor" && hasProfile) {
  console.log("\nâœ… VERDICT: Fix works! Dropdowns visible, no overflow clipping")
} else if (!hasProfile) {
  console.log("\nâŒ VERDICT: Dropdown not rendering at all")
} else {
  console.log("\nâš ï¸ VERDICT: Dropdown renders but might be clipped")
}
