import { chromium } from "playwright"

const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })

// First load admin to warm up the compiler
await p.goto("http://localhost:7400/admin", { timeout: 60000 }).catch(() => {})
await new Promise(r => setTimeout(r, 6000))

// Check URL
console.log("Step 1: admin loaded, URL:", p.url())

// Now load user version
await p.goto("http://localhost:7400/", { timeout: 60000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 6000))

// Take screenshot 
await p.screenshot({ path: "D:/meter/docs/screenshots/user-load.png" })
console.log("Step 2: user loaded, URL:", p.url())

// Try to click user menu
const btn = p.locator("button").filter({ hasText: "Admin User" })
const vis = await btn.isVisible()
console.log("Step 3: user button visible:", vis)

if (vis) {
  await btn.click()
  await new Promise(r => setTimeout(r, 2000))
  await p.screenshot({ path: "D:/meter/docs/screenshots/user-dropdown.png" })
  
  const txt = await p.evaluate(() => document.body.innerText)
  console.log("Step 4: 'My Profile' visible:", txt.includes("My Profile"))
  console.log("Step 5: 'Sign Out' visible:", txt.includes("Sign Out"))
}

console.log("DONE")
await b.close()
