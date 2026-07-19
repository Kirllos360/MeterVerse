#!/usr/bin/env node
import { chromium } from "playwright"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { createHash } from "crypto"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = "http://localhost:7400"
const SCREENSHOTS = join(__dirname, "..", "..", "docs", "screenshots")
const BASELINE = join(SCREENSHOTS, "baseline")
const DIFF_DIR = join(SCREENSHOTS, "diff")

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}

const ROUTES = [
  "login", "workspace", "workspace-home", "dashboard",
  "admin-login", "admin-dashboard", "admin-users", "admin-roles",
  "admin-monitoring", "admin-audit", "admin-logs", "admin-security",
  "admin-settings", "admin-ai-diagnostics", "not-found",
  "about", "privacy", "terms", "component-lab",
]

const THRESHOLD = 0.01

function hashFile(filepath) {
  try {
    const data = readFileSync(filepath)
    return createHash("md5").update(data).digest("hex")
  } catch { return null }
}

async function captureBaseline() {
  console.log("Capturing baseline screenshots...")
  const browser = await chromium.launch()
  const page = await browser.newPage()

  for (const route of ROUTES) {
    for (const [vp, dims] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(dims)
      try {
        await page.goto(`${BASE}/${route}`, { waitUntil: "domcontentloaded", timeout: 15000 })
        await page.waitForTimeout(1500)
        const filepath = join(BASELINE, `${route}-${vp}.png`)
        mkdirSync(dirname(filepath), { recursive: true })
        await page.screenshot({ path: filepath, fullPage: true })
        console.log(`  [baseline] ${route} (${vp})`)
      } catch (e) {
        console.log(`  ⚠️  ${route} (${vp}): ${e.message}`)
      }
    }
  }
  await browser.close()
  console.log("Baseline complete.\n")
}

async function compareScreenshots() {
  console.log("Running visual regression comparison...\n")
  const results = []
  let totalPixels = 0
  let changedPixels = 0

  for (const route of ROUTES) {
    for (const [vp, dims] of Object.entries(VIEWPORTS)) {
      const baselinePath = join(BASELINE, `${route}-${vp}.png`)
      const currentPath = join(SCREENSHOTS, vp, `${route}.png`)
      const diffPath = join(DIFF_DIR, `${route}-${vp}-diff.png`)

      if (!existsSync(baselinePath) || !existsSync(currentPath)) {
        results.push({ route, viewport: vp, status: "missing", diff: 1, diffPath: null })
        continue
      }

      const baselineHash = hashFile(baselinePath)
      const currentHash = hashFile(currentPath)

      if (baselineHash === currentHash) {
        results.push({ route, viewport: vp, status: "pass", diff: 0, diffPath: null })
        continue
      }

      try {
        const img1 = PNG.sync.read(readFileSync(baselinePath))
        const img2 = PNG.sync.read(readFileSync(currentPath))
        const { width, height } = img1
        const diff = new PNG({ width, height })
        const mismatched = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 })
        const diffRatio = mismatched / (width * height)
        totalPixels += width * height
        changedPixels += mismatched
        if (diffRatio > THRESHOLD) {
          mkdirSync(dirname(diffPath), { recursive: true })
          writeFileSync(diffPath, PNG.sync.write(diff))
        }
        results.push({ route, viewport: vp, status: diffRatio > THRESHOLD ? "fail" : "pass", diff: diffRatio, diffPath: diffRatio > THRESHOLD ? diffPath : null })
        const icon = diffRatio > THRESHOLD ? "❌" : "✅"
        console.log(`  ${icon} ${route} (${vp}): ${(diffRatio * 100).toFixed(2)}% changed`)
      } catch (e) {
        results.push({ route, viewport: vp, status: "error", diff: 1, diffPath: null })
        console.log(`  ⚠️  ${route} (${vp}): ${e.message}`)
      }
    }
  }

  const overallDiff = totalPixels > 0 ? (changedPixels / totalPixels) * 100 : 0
  const passed = results.filter(r => r.status === "pass").length
  const failed = results.filter(r => r.status === "fail" || r.status === "missing").length
  const total = results.length

  const report = generateReport(results, passed, failed, total, overallDiff)

  return { passed, failed, total, overallDiff, report }
}

function generateReport(results, passed, failed, total, overallDiff) {
  let md = "# Visual Regression Report\n\n"
  md += `**Date:** ${new Date().toISOString()}\n`
  md += `**Total comparisons:** ${total}\n`
  md += `**Passed:** ${passed}\n`
  md += `**Failed:** ${failed}\n`
  md += `**Overall diff:** ${overallDiff.toFixed(2)}%\n`
  md += `**Threshold:** ${(THRESHOLD * 100).toFixed(2)}%\n\n`
  md += "## Results\n\n"
  md += "| Route | Viewport | Status | Diff % |\n"
  md += "|-------|----------|--------|--------|\n"

  for (const r of results) {
    const statusIcon = r.status === "pass" ? "✅" : r.status === "fail" ? "❌" : r.status === "missing" ? "⚠️" : "❌"
    md += `| ${r.route} | ${r.viewport} | ${statusIcon} ${r.status} | ${(r.diff * 100).toFixed(2)}% |\n`
  }

  md += "\n## Diffs\n\n"
  for (const r of results) {
    if (r.diffPath && r.diff > THRESHOLD) {
      md += `### ${r.route} (${r.viewport})\n`
      md += `![diff](${r.diffPath})\n\n`
    }
  }

  md += "\n## Summary\n\n"
  if (overallDiff > THRESHOLD * 100) {
    md += "❌ **FAILED:** Visual regressions detected above threshold.\n"
  } else {
    md += "✅ **PASSED:** No significant visual regressions.\n"
  }

  const reportPath = join(SCREENSHOTS, "..", "VISUAL_REGRESSION_REPORT.md")
  writeFileSync(reportPath, md, "utf-8")
  console.log(`\nReport: ${reportPath}`)
  return md
}

async function main() {
  const mode = process.argv[2] || "compare"

  if (mode === "baseline") {
    await captureBaseline()
    return
  }

  if (mode === "update-baseline") {
    console.log("Updating baseline from current screenshots...")
    for (const route of ROUTES) {
      for (const [vp] of Object.entries(VIEWPORTS)) {
        const src = join(SCREENSHOTS, vp, `${route}.png`)
        const dst = join(BASELINE, `${route}-${vp}.png`)
        if (existsSync(src)) {
          writeFileSync(dst, readFileSync(src))
          console.log(`  ✅ ${route} (${vp})`)
        }
      }
    }
    console.log("Baseline updated.\n")
    return
  }

  const { passed, failed, total, overallDiff } = await compareScreenshots()

  console.log(`\nResults: ${passed}/${total} passed, ${failed} failed`)
  console.log(`Overall diff: ${overallDiff.toFixed(2)}%`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch(console.error)
