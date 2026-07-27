import { chromium } from "playwright"

const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })

let errors = []
p.on("console", m => { if (m.type() === "error") errors.push(m.text()) })

await p.goto("http://localhost:7400/?t=" + Date.now(), { timeout: 60000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 8000))

// Check if user button exists
const btn = p.locator("button").filter({ hasText: "Admin User" })
const exists = await btn.isVisible()
console.log("User button:", exists)

if (exists) {
  await btn.click()
  await new Promise(r => setTimeout(r, 2000))
  
  // Check for dropdown text
  const body = await p.evaluate(() => document.body.innerText)
  console.log("My Profile found:", body.includes("My Profile"))
  console.log("Sign Out found:", body.includes("Sign Out"))
  console.log("Page length:", body.length)
  
  if (!body.includes("My Profile")) {
    // Deep inspect why
    const info = await p.evaluate(() => {
      const all = document.querySelectorAll("[class*='z-']")
      return Array.from(all).slice(0, 5).map(el => ({
        class: el.className.substring(0, 80),
        zIndex: getComputedStyle(el).zIndex,
        display: getComputedStyle(el).display,
        text: (el.textContent || "").substring(0, 50)
      }))
    })
    console.log("z-index elements:", JSON.stringify(info))
  }
}

console.log("Errors:", errors.length)
await b.close()
