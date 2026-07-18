import { chromium } from "playwright"

const BASE = "http://localhost:7400"

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  console.log("=== VISUAL CHECKS ===")

  // 1. Load workspace
  await page.goto(BASE + "/", { waitUntil: "networkidle" })
  await page.waitForTimeout(3000)
  console.log("\n1. ROOT PAGE LOADED")

  // 2. Toggle to Arabic
  const langBtn = page.locator('button[aria-label*="Language"], button[aria-label*="اللغة"], button:has-text("EN"), button:has-text("AR")').first()
  if (await langBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await langBtn.click()
    await page.waitForTimeout(1500)
  }
  const htmlDir = await page.evaluate(() => document.documentElement.getAttribute("dir"))
  console.log(`2. AFTER LANGUAGE TOGGLE: dir="${htmlDir}"`)

  // 3. Check sidebar text samples
  const sidebarTexts = await page.evaluate(() => {
    const nav = document.querySelector("nav")
    if (!nav) return []
    return Array.from(nav.querySelectorAll("button")).slice(0, 6).map((b, i) => `  [${i}] "${b.textContent?.trim()?.substring(0, 40)}"`)
  })
  console.log("3. SIDEBAR ITEMS (Arabic):")
  sidebarTexts.forEach((t) => console.log(t))

  // 4. Check FAB position
  const fabRect = await page.evaluate(() => {
    const fab = document.querySelector('[aria-label="Add new"]')
    if (!fab) return null
    const container = fab.closest(".fixed")
    return container ? container.getBoundingClientRect() : null
  })
  console.log(`4. FAB position: left=${fabRect?.left?.toFixed(0)} right=${fabRect?.right?.toFixed(0)} bottom=${fabRect?.bottom?.toFixed(0)}`)

  // 5. Toggle back to English
  if (await langBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await langBtn.click()
    await page.waitForTimeout(1500)
  }
  const dirEn = await page.evaluate(() => document.documentElement.getAttribute("dir"))
  console.log(`5. AFTER SWITCHING BACK TO ENGLISH: dir="${dirEn}"`)

  // 6. Check sidebar in English
  const sidebarTextsEn = await page.evaluate(() => {
    const nav = document.querySelector("nav")
    if (!nav) return []
    return Array.from(nav.querySelectorAll("button")).slice(0, 6).map((b, i) => `  [${i}] "${b.textContent?.trim()?.substring(0, 40)}"`)
  })
  console.log("6. SIDEBAR ITEMS (English):")
  sidebarTextsEn.forEach((t) => console.log(t))

  // 7. Toggle dark mode
  const themeBtn = page.locator('button[aria-label*="Mode"], button[aria-label*="الوضع"], button:has-text("☀"), button:has-text("☽")').first()
  if (await themeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await themeBtn.click()
    await page.waitForTimeout(1000)
  }
  const htmlClass = await page.evaluate(() => document.documentElement.className)
  const colorScheme = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("color-scheme").trim())
  console.log(`7. DARK MODE: class="${htmlClass}" color-scheme="${colorScheme}"`)

  await browser.close()
  console.log("\n✅ Visual checks complete")
}

main().catch((e) => {
  console.error("FATAL:", e.message)
  process.exit(1)
})
