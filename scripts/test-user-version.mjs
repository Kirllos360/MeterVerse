import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// TEST ON USER VERSION (localhost:7400) — NOT ADMIN
console.log("=== TESTING USER VERSION localhost:7400 ===")

await page.goto("http://localhost:7400", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))

const userUrl = page.url()
console.log("URL:", userUrl)
console.log("Title:", await page.title())

// Check if the user header has the same structure
const userBtn = page.locator("button").filter({ hasText: "Admin User" })
const btnExists = await userBtn.isVisible()
console.log("User button visible:", btnExists)

if (btnExists) {
  await userBtn.click()
  await new Promise(r => setTimeout(r, 1500))
  
  const profile = await page.locator("text=My Profile").isVisible()
  const signOut = await page.locator("text=Sign Out").isVisible()
  console.log("My Profile visible:", profile)
  console.log("Sign Out visible:", signOut)
  
  // Screenshot
  await page.screenshot({ path: "D:/meter/docs/screenshots/user-version-dropdown.png" })
  
  if (!profile || !signOut) {
    console.log("\n❌ DROPDOWN NOT VISIBLE IN USER VERSION!")
    console.log("Checking why...")
    
    // Check if overflow-hidden is present on ancestors
    const overflowCheck = await page.evaluate(() => {
      const dropdown = document.querySelector("[class*='z-[']")
      if (!dropdown) return "no dropdown found"
      let el = dropdown.parentElement
      let depth = 0
      while (el && depth < 15) {
        const style = window.getComputedStyle(el)
        if (style.overflow === "hidden" || style.overflowX === "hidden") {
          return {
            found: true,
            tag: el.tagName,
            class: (el.className || "").substring(0, 80),
            depth: depth,
            overflow: style.overflow
          }
        }
        el = el.parentElement
        depth++
      }
      return { found: false, depth }
    })
    console.log("Overflow check:", JSON.stringify(overflowCheck))
  }
} else {
  console.log("❌ No user button found in user version")
  // Check what content IS on the page
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500))
  console.log("Page content:", bodyText)
}

await browser.close()
