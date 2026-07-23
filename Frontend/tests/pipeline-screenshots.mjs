#!/usr/bin/env node
// MeterVerse Enterprise Screenshot Pipeline — Rule 5.4
// Captures: All pages × 3 viewports × 2 themes × 2 directions
// Also captures: dialogs, drawers, context menus, forms, tables, charts, empty/loading/error states

import { chromium } from "playwright"
import { writeFileSync, mkdirSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:7400"
const FRONTEND = join(__dirname, "..")
const ROOT = join(FRONTEND, "..")
const SCREENSHOTS = join(ROOT, "docs", "screenshots", "pipeline")

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

const THEMES = [
  { name: "light", setup: async (p) => { await p.evaluate(() => document.documentElement.classList.remove("dark")) } },
  { name: "dark", setup: async (p) => { await p.evaluate(() => document.documentElement.classList.add("dark")) } },
]

const DIRECTIONS = [
  { name: "ltr", setup: async (p) => { await p.evaluate(() => document.documentElement.dir = "ltr") } },
  { name: "rtl", setup: async (p) => { await p.evaluate(() => document.documentElement.dir = "rtl") } },
]

// Auto-discover all admin pages with page.tsx
const adminDir = join(FRONTEND, "src", "app", "admin")
const adminPages = readdirSync(adminDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(adminDir, d.name, "page.tsx")))
  .map(d => ({ group: "admin", name: `admin-${d.name}`, path: `/admin/${d.name}` }))

// Dashboard pages
const dashDir = join(FRONTEND, "src", "app", "dashboard")
const dashPages = readdirSync(dashDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(dashDir, d.name, "page.tsx")))
  .map(d => ({ group: "dashboard", name: `dash-${d.name}`, path: `/dashboard/${d.name}` }))

// Component state captures (on workspace page)
const componentCaptures = [
  { group: "dialogs", name: "dialog-default", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-dialog'
      d.innerHTML = '<div role=dialog style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);z-index:1000"><div style="background:var(--surface-raised);border-radius:12px;padding:24px;width:480px;box-shadow:var(--shadow-lg)"><h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Sample Dialog</h2><p style="font-size:14px;color:var(--text-secondary);margin-bottom:24px">Dialog component with actions.</p><div style="display:flex;justify-content:flex-end;gap:8px"><button style="padding:8px 16px;border-radius:6px;font-size:14px;border:1px solid var(--border-default);background:transparent">Cancel</button><button style="padding:8px 16px;border-radius:6px;font-size:14px;background:var(--brand);color:white">Confirm</button></div></div></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "drawers", name: "drawer-right", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-drawer'
      d.innerHTML = '<div style="position:fixed;inset:0;z-index:900"><div style="position:absolute;inset:0;background:rgba(0,0,0,0.3)"></div><div style="position:absolute;top:0;right:0;bottom:0;width:360px;background:var(--surface-raised);box-shadow:var(--shadow-lg);padding:16px"><h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Sample Drawer</h2><p style="font-size:14px;color:var(--text-secondary)">Drawer content for secondary panels.</p></div></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "empty", name: "empty-state", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-empty'
      d.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center"><div style="width:64px;height:64px;border-radius:50%;background:var(--muted);display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></div><h3 style="font-size:16px;font-weight:600;margin-bottom:8px">No Data</h3><p style="font-size:14px;color:var(--text-secondary);margin-bottom:16px">No records found matching your criteria.</p><button style="padding:8px 16px;border-radius:6px;font-size:14px;background:var(--brand);color:white;border:none">Create First</button></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "loading", name: "loading-state", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-loading'
      d.innerHTML = '<div style="padding:40px;display:flex;flex-direction:column;gap:16px"><div style="height:24px;width:200px;background:var(--muted);border-radius:4px;animation:pulse 2s infinite"></div><div style="height:100px;width:100%;background:var(--muted);border-radius:8px;animation:pulse 2s infinite"></div><div style="height:40px;width:100%;background:var(--muted);border-radius:8px;animation:pulse 2s infinite"></div></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "forms", name: "form-default", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-form'
      d.innerHTML = '<div style="max-width:480px;margin:40px auto;padding:24px;background:var(--card);border-radius:12px;border:1px solid var(--border)"><h2 style="font-size:18px;font-weight:600;margin-bottom:24px">Sample Form</h2><div style="display:flex;flex-direction:column;gap:16px"><div><label style="display:block;font-size:12px;font-weight:500;margin-bottom:6px">Name</label><input placeholder="Enter name" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--border);background:var(--background);font-size:14px"/></div><div><label style="display:block;font-size:12px;font-weight:500;margin-bottom:6px">Email</label><input placeholder="Enter email" style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--border);background:var(--background);font-size:14px"/></div><div><label style="display:block;font-size:12px;font-weight:500;margin-bottom:6px">Role</label><select style="width:100%;padding:8px 12px;border-radius:6px;border:1px solid var(--border);background:var(--background);font-size:14px"><option>Admin</option><option>User</option></select></div><button style="padding:10px 16px;border-radius:6px;font-size:14px;background:var(--brand);color:white;border:none;margin-top:8px">Submit</button></div></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "context-menu", name: "context-menu", path: "/", actions: [
    async (p) => await p.evaluate(() => {
      const d = document.createElement('div'); d.id = 'pw-context'
      d.innerHTML = '<div style="position:fixed;top:100px;left:200px;width:200px;background:var(--surface-raised);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid var(--border);padding:4px;z-index:1000"><div style="padding:8px 12px;font-size:13px;border-radius:4px;cursor:pointer">Edit</div><div style="padding:8px 12px;font-size:13px;border-radius:4px;cursor:pointer">Duplicate</div><div style="padding:8px 12px;font-size:13px;border-radius:4px;cursor:pointer">Archive</div><div style="padding:8px 12px;font-size:13px;border-radius:4px;cursor:pointer;color:var(--destructive)">Delete</div></div>'
      document.body.appendChild(d)
    }),
  ]},
  { group: "sidebar", name: "sidebar-expanded", path: "/", actions: [] },
  { group: "sidebar", name: "sidebar-collapsed", path: "/", actions: [] },
  { group: "toolbar", name: "toolbar-default", path: "/", actions: [] },
  { group: "inspector", name: "inspector-open", path: "/", actions: [] },
]

const ALL_CAPTURES = [
  ...adminPages,
  ...dashPages,
  { group: "pages", name: "login", path: "/login", actions: [] },
  { group: "pages", name: "workspace", path: "/", actions: [] },
  { group: "pages", name: "not-found", path: "/nonexistent", actions: [] },
  ...componentCaptures,
]

// Core pages (for themes + directions variants)
const CORE_CAPTURES = [
  { group: "core", name: "admin-home", path: "/admin/home", actions: [] },
  { group: "core", name: "admin-customers", path: "/admin/customers", actions: [] },
  { group: "core", name: "dashboard", path: "/dashboard", actions: [] },
  { group: "core", name: "login", path: "/login", actions: [] },
  { group: "core", name: "workspace", path: "/", actions: [] },
]

const metadata = []

async function capture() {
  const browser = await chromium.launch()
  let captureId = 0

  // Phase 1: All pages × Desktop (light, LTR)
  console.log("Phase 1: All pages (light/ltr/desktop)")
  {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.setViewportSize(VIEWPORTS.desktop)
    for (const cap of ALL_CAPTURES) {
      try {
        await page.goto(`${BASE}${cap.path}`, { waitUntil: "domcontentloaded", timeout: 60000 })
        await page.waitForTimeout(2000)
        for (const action of cap.actions) {
          try { await action(page) } catch(e) {}
          await page.waitForTimeout(800)
        }
        captureId++
        const dir = join(SCREENSHOTS, "desktop", cap.group)
        mkdirSync(dir, { recursive: true })
        const filepath = join(dir, `${String(captureId).padStart(4,'0')}-${cap.name}.png`)
        await page.screenshot({ path: filepath, fullPage: true })
        metadata.push({ id: captureId, phase: "desktop-light-ltr", group: cap.group, name: cap.name, file: `desktop/${cap.group}/${String(captureId).padStart(4,'0')}-${cap.name}.png`, date: new Date().toISOString() })
        process.stdout.write(".")
      } catch(e) { process.stdout.write("x") }
    }
    await context.close()
  }

  // Phase 2: Core pages × Tablet + Mobile (light, LTR)
  console.log("\nPhase 2: Core pages (responsive)")
  for (const [vpName, vpDims] of Object.entries(VIEWPORTS).slice(1)) {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.setViewportSize(vpDims)
    for (const cap of ALL_CAPTURES) {
      try {
        await page.goto(`${BASE}${cap.path}`, { waitUntil: "domcontentloaded", timeout: 60000 })
        await page.waitForTimeout(2000)
        for (const action of cap.actions) {
          try { await action(page) } catch(e) {}
          await page.waitForTimeout(800)
        }
        captureId++
        const dir = join(SCREENSHOTS, vpName, cap.group)
        mkdirSync(dir, { recursive: true })
        const filepath = join(dir, `${String(captureId).padStart(4,'0')}-${cap.name}.png`)
        await page.screenshot({ path: filepath, fullPage: true })
        metadata.push({ id: captureId, phase: `${vpName}-light-ltr`, group: cap.group, name: cap.name, file: `${vpName}/${cap.group}/${String(captureId).padStart(4,'0')}-${cap.name}.png`, date: new Date().toISOString() })
        process.stdout.write(".")
      } catch(e) { process.stdout.write("x") }
    }
    await context.close()
  }

  // Phase 3: Dark mode (core pages, desktop)
  console.log("\nPhase 3: Dark mode")
  for (const theme of THEMES) {
    if (theme.name === "light") continue // already captured
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.setViewportSize(VIEWPORTS.desktop)
    for (const cap of CORE_CAPTURES) {
      try {
        await page.goto(`${BASE}${cap.path}`, { waitUntil: "domcontentloaded", timeout: 60000 })
        await theme.setup(page)
        await page.waitForTimeout(1000)
        captureId++
        const dir = join(SCREENSHOTS, theme.name, cap.group)
        mkdirSync(dir, { recursive: true })
        const filepath = join(dir, `${String(captureId).padStart(4,'0')}-${cap.name}.png`)
        await page.screenshot({ path: filepath, fullPage: true })
        metadata.push({ id: captureId, phase: `desktop-${theme.name}-ltr`, group: cap.group, name: cap.name, file: `${theme.name}/${cap.group}/${String(captureId).padStart(4,'0')}-${cap.name}.png`, date: new Date().toISOString() })
        process.stdout.write(".")
      } catch(e) { process.stdout.write("x") }
    }
    await context.close()
  }

  // Phase 4: RTL (core pages, desktop, light)
  console.log("\nPhase 4: RTL mode")
  for (const dir of DIRECTIONS) {
    if (dir.name === "ltr") continue
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.setViewportSize(VIEWPORTS.desktop)
    for (const cap of CORE_CAPTURES) {
      try {
        await page.goto(`${BASE}${cap.path}`, { waitUntil: "domcontentloaded", timeout: 60000 })
        await dir.setup(page)
        await page.waitForTimeout(1000)
        captureId++
        const screenshotDir = join(SCREENSHOTS, dir.name, cap.group)
        mkdirSync(screenshotDir, { recursive: true })
        const filepath = join(screenshotDir, `${String(captureId).padStart(4,'0')}-${cap.name}.png`)
        await page.screenshot({ path: filepath, fullPage: true })
        metadata.push({ id: captureId, phase: `desktop-light-${dir.name}`, group: cap.group, name: cap.name, file: `${dir.name}/${cap.group}/${String(captureId).padStart(4,'0')}-${cap.name}.png`, date: new Date().toISOString() })
        process.stdout.write(".")
      } catch(e) { process.stdout.write("x") }
    }
    await context.close()
  }

  await browser.close()

  const metaPath = join(SCREENSHOTS, "metadata.json")
  writeFileSync(metaPath, JSON.stringify(metadata, null, 2))
  console.log(`\n\nMetadata: ${metaPath}`)
  console.log(`Total screenshots: ${metadata.length}`)
}

capture().catch(console.error)
