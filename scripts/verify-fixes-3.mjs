import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto("http://localhost:3535/admin", { timeout: 30000, waitUntil: "domcontentloaded" }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))

// Check the header area for connection signal
const headerHTML = await page.evaluate(() => {
  // Find all elements that contain "Online" (case insensitive)
  const matches = []
  document.querySelectorAll("div, span, button").forEach(el => {
    const t = el.textContent || ""
    if (t.includes("Online") || t.includes("online") || t.includes("Shortcut")) {
      matches.push(el.tagName + " \"" + t.substring(0, 60) + "\" class=" + (el.className || "").substring(0, 40))
    }
  })
  return matches.slice(0, 10)
})
console.log("Header elements with 'Online' / 'Shortcut':")
headerHTML.forEach(m => console.log("  " + m))

// Try to find and open the inspector
await page.evaluate(() => {
  // Click the inspector toggle by looking for it in localStorage or by clicking the right button
  const buttons = document.querySelectorAll("button")
  for (const btn of buttons) {
    if (btn.textContent?.includes("Shortcut") || btn.getAttribute("aria-label")?.includes("Shortcut")) {
      btn.click()
      return "found Shortcut button"
    }
  }
  // Try opening via store
  return "no Shortcut button found"
})
await new Promise(r => setTimeout(r, 2000))

// Check footer
const footerCheck = await page.evaluate(() => {
  const divs = document.querySelectorAll("div")
  for (const d of divs) {
    const t = d.textContent || ""
    if (t.includes("Meter Verse v8.0")) {
      const style = d.parentElement?.getAttribute("style") || ""
      const rect = d.parentElement?.getBoundingClientRect()
      return {
        height: rect?.height || 0,
        style: style.substring(0, 100)
      }
    }
  }
  return null
})
console.log("\nFooter:", JSON.stringify(footerCheck))

// Now check if Shortcut Menu text appears
await new Promise(r => setTimeout(r, 2000))
const hasShortcut = await page.evaluate(() => document.body.innerText.includes("Shortcut Menu"))
console.log("Shortcut Menu visible after toggle: " + hasShortcut)

await browser.close()
