import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on("console", msg => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text())
})
page.on("pageerror", err => console.log("PAGE ERROR:", err.message))

try {
  await page.goto("http://localhost:7400/admin", { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(3000)
  console.log("PAGE LOADED:", await page.title())
} catch (e) {
  console.log("NAV ERROR:", e.message)
}

await browser.close()
