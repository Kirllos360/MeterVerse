import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const sidebars = []
  const headers = []
  const inspectors = []

  document.querySelectorAll("[class*='sidebar'], [class*='Sidebar'], nav, [role='navigation']").forEach(el => {
    sidebars.push(el.tagName + " " + (el.className || "").substring(0, 80))
  })

  document.querySelectorAll("[class*='toolbar'], [class*='Toolbar'], [class*='header'], [class*='Header'], [class*='topbar']").forEach(el => {
    headers.push(el.tagName + " " + (el.className || "").substring(0, 80))
  })

  document.querySelectorAll("[class*='inspector'], [class*='Inspector']").forEach(el => {
    inspectors.push(el.tagName + " " + (el.className || "").substring(0, 80))
  })

  const containers = []
  document.querySelectorAll("[style*='sidebar-background']").forEach(el => {
    containers.push(el.tagName + "#" + (el.id || "no-id") + " " + (el.className || "").substring(0, 60))
  })
  
  const toplevel = []
  document.querySelectorAll("body > div").forEach(el => {
    const style = el.getAttribute("style") || ""
    toplevel.push(el.tagName + " style=" + style.substring(0, 120))
  })

  return { url: window.location.href, sidebarCount: sidebars.length, sidebars, headerCount: headers.length, headers, inspectorCount: inspectors.length, inspectors, containers, toplevel }
})

console.log("URL:", info.url)
console.log("\n--- TOP-LEVEL DIVS ---")
info.toplevel.forEach((d, i) => console.log("  [" + i + "] " + d))
console.log("\n--- SIDEBARS (" + info.sidebarCount + ") ---")
info.sidebars.forEach((s, i) => console.log("  [" + i + "] " + s))
console.log("\n--- HEADERS (" + info.headerCount + ") ---")
info.headers.forEach((h, i) => console.log("  [" + i + "] " + h))
console.log("\n--- INSPECTORS (" + info.inspectorCount + ") ---")
info.inspectors.forEach((ins, i) => console.log("  [" + i + "] " + ins))
console.log("\n--- SIDEBAR CONTAINERS ---")
info.containers.forEach((c, i) => console.log("  [" + i + "] " + c))

await browser.close()
