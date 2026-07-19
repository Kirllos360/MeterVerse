#!/usr/bin/env node
import { chromium } from "playwright"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:7400"
const SCREENSHOTS = path.resolve(__dirname, "..", "..", "docs", "screenshots")

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

const ROUTES = [
  { name: "login", path: "/login" },
  { name: "workspace", path: "/" },
  { name: "workspace-home", path: "/workspace" },
  { name: "dashboard", path: "/dashboard" },
  { name: "admin-login", path: "/admin/login" },
  { name: "admin-dashboard", path: "/admin/dashboard" },
  { name: "admin-users", path: "/admin/users" },
  { name: "admin-roles", path: "/admin/roles" },
  { name: "admin-monitoring", path: "/admin/monitoring" },
  { name: "admin-audit", path: "/admin/audit" },
  { name: "admin-logs", path: "/admin/logs" },
  { name: "admin-security", path: "/admin/security" },
  { name: "admin-settings", path: "/admin/settings" },
  { name: "admin-ai-diagnostics", path: "/admin/ai-diagnostics" },
  { name: "not-found", path: "/nonexistent-page" },
  { name: "about", path: "/about" },
  { name: "privacy", path: "/privacy-policy" },
  { name: "terms", path: "/terms-of-service" },
  { name: "component-lab", path: "/component-lab" },
]

async function capture(browser, page) {
  const results = []

  for (const route of ROUTES) {
    for (const [viewport, dimensions] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(dimensions)
      try {
        await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded", timeout: 15000 })
        await page.waitForTimeout(2000)
      } catch {
        console.log(`  ⚠️  skipping ${route.name} (${viewport})`)
        continue
      }

      const dir = path.join(SCREENSHOTS, viewport)
      const filename = `${route.name}.png`
      const filepath = path.join(dir, filename)

      try {
        await page.screenshot({ path: filepath, fullPage: true, timeout: 10000 })
        results.push({ route: route.name, viewport, path: filename })
      } catch {
        console.log(`  ⚠️  screenshot failed: ${route.name} (${viewport})`)
        continue
      }

      // Dark mode (desktop only)
      if (viewport === "desktop") {
        try {
          await page.evaluate(() => document.documentElement.classList.add("dark"))
          await page.waitForTimeout(500)
          const darkDir = path.join(SCREENSHOTS, "dark")
          await page.screenshot({ path: path.join(darkDir, `${route.name}-dark.png`), fullPage: true, timeout: 10000 })
          await page.evaluate(() => document.documentElement.classList.remove("dark"))
          results.push({ route: route.name, viewport: "dark", path: `${route.name}-dark.png` })
        } catch {}
      }

      // RTL (desktop only)
      if (viewport === "desktop") {
        try {
          await page.evaluate(() => { document.documentElement.dir = "rtl"; document.documentElement.lang = "ar" })
          await page.waitForTimeout(500)
          const rtlDir = path.join(SCREENSHOTS, "rtl")
          await page.screenshot({ path: path.join(rtlDir, `${route.name}-rtl.png`), fullPage: true, timeout: 10000 })
          await page.evaluate(() => { document.documentElement.dir = "ltr"; document.documentElement.lang = "en" })
          results.push({ route: route.name, viewport: "rtl", path: `${route.name}-rtl.png` })
        } catch {}
      }

      console.log(`  [${viewport}] ${route.name}`)
    }
  }
  return results
}

async function generateGallery(results) {
  const index = path.join(SCREENSHOTS, "INDEX.md")
  const groups = {}
  for (const r of results) {
    if (!groups[r.route]) groups[r.route] = []
    groups[r.route].push(r)
  }

  let md = "# MeterVerse Screenshot Gallery\n\n"
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n`
  md += `**Total screenshots:** ${results.length}\n\n`
  md += "| Route | Desktop | Tablet | Mobile | Dark | RTL |\n"
  md += "|-------|---------|--------|--------|------|-----|\n"

  for (const [route, shots] of Object.entries(groups)) {
    const desk = shots.find(s => s.viewport === "desktop")
    const tab = shots.find(s => s.viewport === "tablet")
    const mob = shots.find(s => s.viewport === "mobile")
    const dark = shots.find(s => s.viewport === "dark")
    const rtl = shots.find(s => s.viewport === "rtl")
    md += `| ${route} | ${desk ? `![img](desktop/${desk.path})` : "-"} | ${tab ? `![img](tablet/${tab.path})` : "-"} | ${mob ? `![img](mobile/${mob.path})` : "-"} | ${dark ? `![img](dark/${dark.path})` : "-"} | ${rtl ? `![img](rtl/${rtl.path})` : "-"} |\n`
  }

  md += "\n## Desktop (1440x900)\n\n"
  for (const [route, shots] of Object.entries(groups)) {
    const s = shots.find(s => s.viewport === "desktop")
    if (s) md += `### ${route}\n![${route}](desktop/${s.path})\n\n`
  }

  md += "## Tablet (768x1024)\n\n"
  for (const [route, shots] of Object.entries(groups)) {
    const s = shots.find(s => s.viewport === "tablet")
    if (s) md += `### ${route}\n![${route}](tablet/${s.path})\n\n`
  }

  md += "## Mobile (375x812)\n\n"
  for (const [route, shots] of Object.entries(groups)) {
    const s = shots.find(s => s.viewport === "mobile")
    if (s) md += `### ${route}\n![${route}](mobile/${s.path})\n\n`
  }

  md += "## Dark Mode\n\n"
  for (const [route, shots] of Object.entries(groups)) {
    const s = shots.find(s => s.viewport === "dark")
    if (s) md += `### ${route}\n![${route}](dark/${s.path})\n\n`
  }

  md += "## RTL (Arabic)\n\n"
  for (const [route, shots] of Object.entries(groups)) {
    const s = shots.find(s => s.viewport === "rtl")
    if (s) md += `### ${route}\n![${route}](rtl/${s.path})\n\n`
  }

  fs.writeFileSync(index, md, "utf-8")
  console.log(`\n✅ Gallery: ${index}`)
}

async function main() {
  console.log("MeterVerse Screenshot Automation")
  console.log("================================\n")

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log("Capturing screenshots...\n")
  const results = await capture(browser, page)

  await browser.close()

  await generateGallery(results)

  console.log(`\n✅ Complete: ${results.length} screenshots captured`)
}

main().catch(console.error)
