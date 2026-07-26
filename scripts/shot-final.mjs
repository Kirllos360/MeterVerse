import { chromium } from "playwright"

const browser = await chromium.launch({ headless: true, args: ["--disable-font-subpixel-positioning"] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.setDefaultTimeout(5000)

const shot = async (url, name) => {
  try {
    await page.goto(url, { timeout: 20000, waitUntil: "commit" }).catch(() => {})
    await new Promise(r => setTimeout(r, 4000))
    await page.screenshot({ path: `D:/meter/docs/screenshots/frontend-audit/${name}.png`, timeout: 5000 })
    console.log("OK " + name)
  } catch (e) {
    console.log("FAIL " + name)
  }
}

await shot("http://localhost:7400/admin", "admin-root")
await shot("http://localhost:7400/admin/customers", "admin-customers")
await shot("http://localhost:7400/admin/invoices", "admin-invoices")
await shot("http://localhost:7400/admin/meters", "admin-meters")
await shot("http://localhost:7400/admin/payments", "admin-payments")
await shot("http://localhost:7400/", "root-home")

await browser.close()
console.log("DONE")
