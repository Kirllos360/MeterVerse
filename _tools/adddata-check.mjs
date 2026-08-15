import { chromium } from "playwright"

const BASE = "http://localhost:3535"

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] })
const page = await browser.newPage()
const calls = []
page.on("response", r => {
  if (r.url().includes("/api/")) calls.push(`${r.status()} ${r.url().split("http://")[1].slice(0, 70)}`)
})

await page.goto(`${BASE}/login`, { timeout: 30000, waitUntil: "networkidle" }).catch(() => {})
await page.waitForTimeout(1500)
await page.getByPlaceholder("Enter your password").fill("Admin@123")
await page.getByRole("button", { name: /Sign in/i }).click()
await page.waitForTimeout(8000)

await page.goto(`${BASE}/add-data`, { timeout: 30000, waitUntil: "networkidle" }).catch(() => {})
await page.waitForTimeout(5000)

// Readings tab
await page.getByRole("button").filter({ hasText: /^Readings$/ }).first().click()
await page.waitForTimeout(5000)

// Pick the first meter option (any row button that isn't a tab)
const options = page.locator("button").filter({ hasText: /T062a|TST-|Test|MTR/ })
console.log("meter option count:", await options.count())
if ((await options.count()) === 0) { console.log("NO METER OPTIONS"); await browser.close(); process.exit(0) }
const meterLabel = await options.first().innerText()
console.log("selected meter:", meterLabel.trim())
await options.first().click()
await page.waitForTimeout(600)

// Step 2: fill value
await page.getByRole("button", { name: "Next" }).click()
await page.waitForTimeout(500)
await page.getByPlaceholder("Enter value").fill("9988.5")
await page.getByRole("button", { name: "Next" }).click()
await page.waitForTimeout(500)
// Step 3 review -> Next -> submit
await page.getByRole("button", { name: "Next" }).click()
await page.waitForTimeout(500)
await page.getByRole("button", { name: /Confirm & Submit/ }).click()
await page.waitForTimeout(5000)

const after = (await page.locator("body").innerText()).slice(0, 160).replace(/\n+/g, " | ")
console.log("AFTER SUBMIT:", after)
const postReadings = calls.filter(c => c.startsWith("2") && c.includes("readings"))
console.log("successful POST /api/readings:", postReadings.length)
console.log("all 2xx:", calls.filter(c => c.startsWith("2")).length, "| 4xx/5xx:", calls.filter(c => c.startsWith("4") || c.startsWith("5")).length)
calls.filter(c => c.startsWith("4") || c.startsWith("5")).slice(0, 4).forEach(c => console.log("  ERR", c))

await browser.close()
