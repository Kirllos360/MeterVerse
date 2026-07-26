import { chromium } from "playwright"
import { mkdirSync } from "fs"

const dir = "D:/meter/docs/screenshots/frontend-audit"
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ 
  viewport: { width: 1440, height: 900 },
  locale: "en-US"
})
const page = await context.newPage()
page.setDefaultTimeout(15000)

// Override font loading
await page.addInitScript(() => {
  document.fonts.ready.then(() => {})
})

const takeScreenshot = async (url, name) => {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${dir}/${name}.png`, timeout: 10000 })
    console.log("✅ " + name)
  } catch (e) {
    console.log("❌ " + name + ": " + e.message.substring(0, 60))
  }
}

// Admin pages
await takeScreenshot("http://localhost:7400/admin", "admin-root")
const pages = ["customers","meters","invoices","payments","users","roles","audit","projects","zones","units","reports","monitoring","settings","sim","readings","tariffs","rca-workspace","ai-operations","ai-command-center","meter-assignments","login"]
for (const p of pages) {
  await takeScreenshot("http://localhost:7400/admin/" + p, "admin-" + p)
}

// Root page
await takeScreenshot("http://localhost:7400/", "root-home")

await browser.close()
console.log("ALL DONE — screenshots in " + dir)
