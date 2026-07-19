#!/usr/bin/env node
import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:7400"
const SCREENSHOTS = join(__dirname, "..", "..", "docs", "screenshots", "full")

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

const CAPTURES = [
  // Pages
  { group: "pages", name: "login", path: "/login", actions: [] },
  { group: "pages", name: "workspace", path: "/", actions: [] },
  { group: "pages", name: "dashboard", path: "/dashboard", actions: [] },
  { group: "pages", name: "admin-login", path: "/admin/login", actions: [] },
  { group: "pages", name: "admin-dashboard", path: "/admin/dashboard", actions: [] },
  { group: "pages", name: "admin-users", path: "/admin/users", actions: [] },
  { group: "pages", name: "admin-ai", path: "/admin/ai-diagnostics", actions: [] },
  { group: "pages", name: "not-found", path: "/nonexistent", actions: [] },

  // Dialogs
  { group: "dialogs", name: "dialog-default", path: "/", actions: [async (p) => { await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = '<div role=dialog style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);z-index:1000"><div style="background:var(--surface-raised);border-radius:12px;padding:24px;width:480px;box-shadow:var(--shadow-lg)"><h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Sample Dialog</h2><p style="font-size:14px;color:var(--text-secondary);margin-bottom:24px">This is a sample dialog with some content to demonstrate the dialog component.</p><div style="display:flex;justify-content:flex-end;gap:8px"><button style="padding:8px 16px;border-radius:6px;font-size:14px;border:1px solid var(--border-default);background:transparent">Cancel</button><button style="padding:8px 16px;border-radius:6px;font-size:14px;background:var(--brand);color:white">Confirm</button></div></div></div>'; document.body.appendChild(d) }) }] },

  // Drawer
  { group: "drawers", name: "drawer-right", path: "/", actions: [async (p) => { await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = '<div style="position:fixed;inset:0;z-index:900"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.3)"></div><div style="position:absolute;top:0;right:0;bottom:0;width:360px;background:var(--surface-raised);box-shadow:var(--shadow-lg);padding:16px"><h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Sample Drawer</h2><p style="font-size:14px;color:var(--text-secondary)">Drawer content area for secondary panels.</p></div></div>'; document.body.appendChild(d) }) }] },

  // Sidebar states
  { group: "sidebar", name: "sidebar-expanded", path: "/", actions: [] },
  { group: "sidebar", name: "sidebar-collapsed", path: "/", actions: [] },

  // Inspector
  { group: "inspector", name: "inspector-closed", path: "/", actions: [] },
  { group: "inspector", name: "inspector-open", path: "/", actions: [] },

  // Toolbar
  { group: "toolbar", name: "toolbar-default", path: "/", actions: [] },
  { group: "toolbar", name: "toolbar-user-menu", path: "/", actions: [] },

  // Tables
  { group: "tables", name: "table-list", path: "/", actions: [] },
  { group: "tables", name: "table-grid", path: "/", actions: [] },

  // Empty states
  { group: "empty", name: "empty-state", path: "/", actions: [] },

  // Loading states  
  { group: "loading", name: "loading-state", path: "/", actions: [] },
]

const metadata = []

async function capture() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  let captureId = 0

  for (const cap of CAPTURES) {
    for (const [vp, dims] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(dims)
      try {
        await page.goto(`${BASE}${cap.path}`, { waitUntil: "domcontentloaded", timeout: 15000 })
        await page.waitForTimeout(2000)

        for (const action of cap.actions) {
          try { await action(page) } catch (e) {}
          await page.waitForTimeout(1000)
        }

        captureId++
        const filename = `${vp}-${String(captureId).padStart(3, '0')}-${cap.name}.png`
        const dir = join(SCREENSHOTS, cap.group)
        mkdirSync(dir, { recursive: true })
        const filepath = join(dir, filename)
        await page.screenshot({ path: filepath, fullPage: true })
        
        metadata.push({
          id: captureId,
          group: cap.group,
          name: cap.name,
          viewport: vp,
          file: `${cap.group}/${filename}`,
          date: new Date().toISOString(),
        })
        process.stdout.write(".")
      } catch (e) {
        process.stdout.write("x")
      }
    }
  }

  await browser.close()

  const metaPath = join(SCREENSHOTS, "metadata.json")
  writeFileSync(metaPath, JSON.stringify(metadata, null, 2))
  console.log(`\n\nMetadata: ${metaPath}`)
  console.log(`Total screenshots: ${metadata.length}`)
}

capture().catch(console.error)
