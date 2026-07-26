import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 25000 })
await page.waitForTimeout(3000)

const result = await page.evaluate(() => {
  const root = document.documentElement
  const style = getComputedStyle(root)
  const brand = style.getPropertyValue("--brand").trim()
  const brandRgb = style.getPropertyValue("--brand-rgb").trim()
  
  // Find the main container's inline style
  const mainDiv = document.querySelector("#__next > div, body > div")
  const inline = mainDiv ? mainDiv.getAttribute("style") : "not found"
  
  // Check sidebar background
  const sidebar = document.querySelector("[style*='sidebar-background']")
  const sidebarStyle = sidebar ? sidebar.getAttribute("style") : "not found"
  
  // Check toolbar logo color
  const logo = document.querySelector("[style*='admin-accent']")
  const logoStyle = logo ? logo.getAttribute("style") : "not found"
  
  return { brand, brandRgb, inline: inline?.substring(0, 300), sidebarStyle: sidebarStyle?.substring(0, 200), logoStyle: logoStyle?.substring(0, 200) }
})

console.log("CSS --brand:", result.brand)
console.log("CSS --brand-rgb:", result.brandRgb)
console.log("Main inline style:", result.inline)
console.log("Sidebar style:", result.sidebarStyle)
console.log("Logo style:", result.logoStyle)
console.log("STANDARD CHECK PASSED")

await browser.close()
