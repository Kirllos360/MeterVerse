import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 })
await page.waitForTimeout(3000)

const info = await page.evaluate(() => {
  const brandElements = []
  document.querySelectorAll("[style]").forEach(el => {
    const s = el.getAttribute("style") || ""
    if (s.includes("brand") || s.includes("h-screen")) {
      brandElements.push({
        tag: el.tagName,
        id: el.id || "no-id",
        cls: (el.className || "").substring(0, 80),
        style: s.substring(0, 150),
        children: el.children.length
      })
    }
  })
  
  // Count all nav buttons  
  const navButtons = []
  document.querySelectorAll("button").forEach(btn => {
    const text = btn.textContent || ""
    const cls = btn.className || ""
    if (cls.includes("nav") || text.includes("Home") || text.includes("Customers") || text.includes("Meters")) {
      navButtons.push({ text: text.substring(0, 30), cls: cls.substring(0, 40) })
    }
  })

  // Count --brand declarations
  let brandCount = 0
  document.querySelectorAll("[style]").forEach(el => {
    const s = el.getAttribute("style") || ""
    const matches = s.match(/--brand/g)
    if (matches) brandCount += matches.length
  })

  // Check the full DOM tree for layout duplication
  function findLayoutNodes(node, depth, maxDepth, result) {
    if (depth > maxDepth) return
    if (!node || !node.tagName) return
    const s = node.getAttribute && node.getAttribute("style") || ""
    if (s.includes("h-screen") || s.includes("sidebar-background")) {
      result.push({ tag: node.tagName, depth: depth, cls: (node.className || "").substring(0, 60), style: s.substring(0, 80) })
    }
    for (let i = 0; i < (node.children ? node.children.length : 0); i++) {
      findLayoutNodes(node.children[i], depth + 1, maxDepth, result)
    }
  }
  
  const layoutNodes = []
  findLayoutNodes(document.body, 0, 8, layoutNodes)

  return { brandDeclarationCount: brandCount, navButtonCount: navButtons.length, layoutNodes: layoutNodes }
})

console.log("Brand declarations:", info.brandDeclarationCount)
console.log("Nav buttons:", info.navButtonCount)
console.log("\nLayout nodes (h-screen / sidebar-background):")
info.layoutNodes.forEach((n, i) => {
  console.log("  [" + i + "] depth=" + n.depth + " " + n.tag + " class=" + n.cls)
  console.log("      style=" + n.style)
})

await browser.close()
