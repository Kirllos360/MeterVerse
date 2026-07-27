import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:7400/admin", { timeout: 30000 }).catch(() => {})
await new Promise(r => setTimeout(r, 5000))

const btn = page.locator("button").filter({ hasText: "Admin User" }).first()
await btn.click()
await new Promise(r => setTimeout(r, 1000))

const stacking = await page.evaluate(() => {
  const results = []
  const dropdown = document.querySelector("[class*='z-[9999]']")
  if (!dropdown) return ["no dropdown found"]
  let el = dropdown.parentElement
  let depth = 0
  while (el && depth < 10) {
    const style = window.getComputedStyle(el)
    results.push({
      tag: el.tagName + "." + (el.className || "").substring(0, 40),
      zIndex: style.zIndex,
      position: style.position,
      overflow: style.overflow,
      transform: style.transform
    })
    el = el.parentElement
    depth++
  }
  return results
})

console.log("STACKING CONTEXT:")
stacking.forEach((s, i) => console.log(i + ":", JSON.stringify(s)))

await browser.close()
