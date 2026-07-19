#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const ROOT = join(import.meta.dirname, "..", "src")
const EXTS = new Set([".tsx", ".ts"])

const ALLOWED_RADII = ["sm", "md", "lg", "full", "none"]
const ALLOWED_SHADOWS = ["sm", "md", "lg"]
const ALLOWED_SPACING = [4, 8, 12, 16, 24, 32, 48]
const ALLOWED_FONTSIZES = ["10", "12", "14", "16", "20", "24", "32"]

let violations = []

function walk(dir) {
  const files = []
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name)
      if (e.isDirectory() && !e.name.startsWith(".") && !["node_modules", ".next", "design-system"].includes(e.name)) files.push(...walk(f))
      else if (e.isFile() && EXTS.has(extname(e.name))) files.push(f)
    }
  } catch {}
  return files
}

const files = walk(ROOT)
console.log(`Scanning ${files.length} files...\n`)

for (const file of files) {
  const content = readFileSync(file, "utf-8")
  const rel = file.replace(ROOT, "").replace(/\\/g, "/")

  // Radius violations
  for (const m of content.matchAll(/rounded-(\w+)/g)) {
    if (!ALLOWED_RADII.includes(m[1])) {
      if (!["import", "data-", "@container", "first:", "last:", "has-", "*:", "sm:", "md:", "lg:", "xl:"].some(p => m[0].startsWith(p))) {
        violations.push({ file: rel, type: "radius", value: m[1] })
      }
    }
  }

  // Shadow violations
  for (const m of content.matchAll(/shadow-(\w+)/g)) {
    if (!ALLOWED_SHADOWS.includes(m[1])) {
      if (!["import", "data-", "sm:", "md:", "lg:", "*:"].some(p => m[0].startsWith(p))) {
        violations.push({ file: rel, type: "shadow", value: m[1] })
      }
    }
  }

  // Fractional spacing
  for (const m of content.matchAll(/\b(p|m|gap|px|py|mx|my)-(\d+\.\d+)\b/g)) {
    violations.push({ file: rel, type: "spacing", value: `${m[1]}-${m[2]}` })
  }

  // Non-standard font sizes via arbitrary values
  for (const m of content.matchAll(/text-\[(\d+)px\]/g)) {
    if (!ALLOWED_FONTSIZES.includes(m[1])) {
      violations.push({ file: rel, type: "typography", value: `${m[1]}px` })
    }
  }
}

// Group and report
const groups = {}
for (const v of violations) {
  if (!groups[v.type]) groups[v.type] = {}
  const key = `${v.value}`
  if (!groups[v.type][key]) groups[v.type][key] = { count: 0, files: new Set() }
  groups[v.type][key].count++
  groups[v.type][key].files.add(v.file)
}

let total = 0
for (const [type, items] of Object.entries(groups)) {
  console.log(`\n── ${type.toUpperCase()} ──`)
  const sorted = Object.entries(items).sort((a, b) => b[1].count - a[1].count)
  for (const [value, data] of sorted) {
    console.log(`  ${value}: ${data.count}x in ${data.files.size} files`)
    total += data.count
  }
}

console.log(`\nTotal violations: ${total}`)
