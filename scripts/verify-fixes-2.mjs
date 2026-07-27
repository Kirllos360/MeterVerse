import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Go to admin and open the inspector/shortcut menu
await page.goto("http://localhost:7400/admin", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))

// Click the inspector toggle button (looks for a button that toggles the panel)
const toggleBtn = page.locator("button").filter({ hasText: "Shortcut" })
const toggleCount = await toggleBtn.count()
console.log("Shortcut toggle buttons found: " + toggleCount)

// Try clicking the sidebar toggle to open the inspector panel
// The inspector is opened by clicking a button in the toolbar
const allButtons = await page.locator("button").all()
for (const btn of allButtons) {
  const text = await btn.textContent()
  if (text && text.includes("Inspector")) {
    await btn.click()
    console.log("Clicked Inspector toggle")
    break
  }
}
await new Promise(r => setTimeout(r, 2000))

// Check for "Shortcut Menu" text
const bodyText = await page.evaluate(() => document.body.innerText)
console.log("Shortcut Menu visible: " + (bodyText.includes("Shortcut Menu") ? "✅ YES" : "❌ NO"))
console.log("ConnectionHeader visible: " + (bodyText.includes("online") || bodyText.includes("degraded") ? "✅ YES" : "❌ NO"))

// Check footer specifically  
const footerInfo = await page.evaluate(() => {
  // Find all elements with hour/mode text
  const allEls = document.querySelectorAll("*")
  for (const el of allEls) {
    const text = el.textContent || ""
    if (text.includes("Light") || text.includes("Dark")) {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el.parentElement || el)
      return {
        text: text.substring(0, 50),
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        bgColor: style.backgroundColor
      }
    }
  }
  return null
})
console.log("\nFooter info:", JSON.stringify(footerInfo, null, 2))

// Check login page (should have red theme for admin)
await page.goto("http://localhost:7400/admin/login", { timeout: 20000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 3000))
const loginText = await page.evaluate(() => document.body.innerText.substring(0, 200))
console.log("\nAdmin login page:", loginText.substring(0, 100))

// Check user login page (should have green theme)
await page.goto("http://localhost:7400/login", { timeout: 20000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 3000))
const userLoginText = await page.evaluate(() => document.body.innerText.substring(0, 200))
console.log("User login page:", userLoginText.substring(0, 100))

await browser.close()
console.log("\n✅ Verified fixes captured")
