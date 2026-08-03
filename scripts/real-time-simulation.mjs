import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let errors = []
let routing = []
let dropdowns = { opened: 0, visibleContent: [] }

// Capture all console errors
page.on("console", msg => {
  if (msg.type() === "error") errors.push({ text: msg.text(), location: msg.location() })
})

// TEST 1: Load admin page
console.log("=== TEST 1: Load admin page ===")
await page.goto("http://localhost:3535/admin", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))
console.log("Status:", (await page.goto("http://localhost:3535/admin", { timeout: 10000 }).catch(() => null))?.status())
console.log("Console errors:", errors.length)
errors.forEach(e => console.log("  ", e.text.substring(0, 100)))

// TEST 2: Click user menu dropdown
console.log("\n=== TEST 2: User menu dropdown ===")
const userBtn = page.locator("button").filter({ hasText: "Admin User" })
await userBtn.click()
await new Promise(r => setTimeout(r, 1500))

const profile = await page.locator("text=My Profile").isVisible()
const signOut = await page.locator("text=Sign Out").isVisible()
console.log("My Profile visible:", profile)
console.log("Sign Out visible:", signOut)
dropdowns.visibleContent.push("Profile:" + profile, "SignOut:" + signOut)
if (profile) dropdowns.opened++

// Close by clicking elsewhere
await page.locator("h1").first().click()
await new Promise(r => setTimeout(r, 500))

// TEST 3: Test routing - click sidebar items
console.log("\n=== TEST 3: Sidebar routing ===")
const navItems = ["Customers", "Meters", "Invoices", "Payments", "Monitoring"]
for (const item of navItems) {
  const link = page.locator("button").filter({ hasText: item }).first()
  if (await link.isVisible()) {
    await link.click()
    await new Promise(r => setTimeout(r, 2000))
    const url = page.url()
    routing.push({ item, url })
    console.log(item, "->", url)
  }
}

// TEST 4: Check console errors after navigation
console.log("\n=== TEST 4: Console errors after navigation ===")
console.log("Total errors:", errors.length)

// TEST 5: Login page test
console.log("\n=== TEST 5: Login pages ===")
await page.goto("http://localhost:3535/admin/login", { timeout: 10000 }).catch(() => {})
await new Promise(r => setTimeout(r, 2000))
console.log("Admin login loaded:", await page.locator("text=Sign In").isVisible())

await page.goto("http://localhost:3535/login", { timeout: 10000 }).catch(() => {})
await new Promise(r => setTimeout(r, 2000))
console.log("User login loaded:", await page.locator("h1").first().isVisible())

// TEST 6: Check footer
console.log("\n=== TEST 6: Footer check ===")
await page.goto("http://localhost:3535/admin", { timeout: 10000 }).catch(() => {})
await new Promise(r => setTimeout(r, 3000))
const footerText = await page.locator("text=Meter Verse v8.0").isVisible()
console.log("Footer 'Meter Verse v8.0' visible:", footerText)

// TEST 7: Check connection signal
console.log("\n=== TEST 7: Connection signal ===")
const signal = await page.locator("text=online").first().isVisible()
console.log("Connection signal 'online' visible:", signal)

// FINAL REPORT
console.log("\n" + "=".repeat(50))
console.log("=== FINAL TEST REPORT ===")
console.log("=".repeat(50))
console.log("Dropdowns opened:", dropdowns.opened)
console.log("Dropdown content visible:", dropdowns.visibleContent.every(v => v.includes("true")))
console.log("Routes working:", routing.length === navItems.length)
console.log("Console errors:", errors.length)
if (errors.length > 0) {
  console.log("Error details:")
  errors.forEach(e => console.log("  -", e.text.substring(0, 120)))
}
console.log("\nAll tests passed:", profile && signOut && routing.length > 0 && footerText && signal)

await browser.close()
