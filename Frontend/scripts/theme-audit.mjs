#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, extname } from "path"

const SRC = join(import.meta.dirname, "..", "src")
const EXTS = new Set([".tsx", ".ts", ".css"])
const SKIP_DIRS = new Set(["node_modules", "design-system", ".git", "icons.tsx"])

let report = { files: [], issues: [], fixes: 0 }

function walk(dir) {
  const files = []
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue
      const f = join(dir, e.name)
      if (e.isDirectory()) files.push(...walk(f))
      else if (e.isFile() && EXTS.has(extname(e.name))) files.push(f)
    }
  } catch {}
  return files
}

const RGBA_VAR_RE = /(var\(--\w+?)\)(?!\s*[,)])/g
const RGBA_HARD_RE = /rgba\((\d{1,3},\s*\d{1,3},\s*\d{1,3}(?!.*var))/g
const HEX_RE = /#[0-9a-fA-F]{6}(?!\w)/g
const INLINE_PX_RE = /(\bpadding|\bmargin|\bgap|\bwidth|\bheight|\btop|\bright|\bbottom|\bleft|\bfontSize|\bborderRadius|\brow|\bcolumn):\s*(\d+\.?\d*)(px|rem|em|vh|vw)/g

function hexToVar(color, file) {
  const colorMap = {
    "#00BFA5": "var(--brand-primary)",
    "#059669": "var(--status-success)",
    "#DC2626": "var(--status-error)", 
    "#D97706": "var(--status-warning)",
    "#F59E0B": "var(--status-pending)",
    "#3B82F6": null,
    "#6B7280": null,
    "#EF4444": "var(--status-error)",
    "#00D68F": "var(--brand-primary)",
  }
  return colorMap[color.toUpperCase()]
}

const files = walk(SRC)
console.log(`Scanning ${files.length} files...\n`)

for (const file of files) {
  let content = readFileSync(file, "utf8")
  let changed = false
  let fileIssues = []

  // Check for hardcoded hex colors
  const hexMatches = content.match(HEX_RE) || []
  for (const hex of hexMatches) {
    const replacement = hexToVar(hex, file)
    if (replacement) {
      fileIssues.push(`  HEX ${hex} → ${replacement}`)
      content = content.replaceAll(hex, replacement)
      changed = true
      report.fixes++
    }
  }

  if (fileIssues.length > 0) {
    console.log(`\n${file}`)
    fileIssues.forEach(i => console.log(i))
  }

  if (changed) writeFileSync(file, content, "utf8")
}

console.log(`\n✅ Complete: ${report.fixes} fixes applied`)
