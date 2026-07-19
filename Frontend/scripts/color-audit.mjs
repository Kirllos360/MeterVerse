#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs"
import { join, extname } from "path"

const ROOT = join(import.meta.dirname, "..", "src")
const EXTS = new Set([".tsx", ".ts", ".css"])

const SKIP_DIRS = new Set(["node_modules", ".next", "design-system"])
const SKIP_FILES = ["theme.css", "dark-mode.css", "globals.css", "rtl.css"]
const SKIP_PATTERNS = ["node_modules/", ".next/"]

let findings = []

function walk(dir) {
  const files = []
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue
      const f = join(dir, e.name)
      if (SKIP_PATTERNS.some(p => f.includes(p))) continue
      if (e.isDirectory()) files.push(...walk(f))
      else if (e.isFile() && EXTS.has(extname(e.name)) && !SKIP_FILES.includes(e.name)) files.push(f)
    }
  } catch {}
  return files
}

const files = walk(ROOT)
console.log(`Scanning ${files.length} files...\n`)

for (const file of files) {
  const content = readFileSync(file, "utf-8")
  const lines = content.split("\n")
  const rel = file.replace(ROOT, "").replace(/\\/g, "/")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Skip lines that use CSS variables
    if (line.includes("var(--")) continue
    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) continue
    // Skip imports
    if (line.trim().startsWith("import")) continue

    // # hex colors (but not # in comments or variable names)
    const hexMatch = line.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)
    if (hexMatch) {
      for (const hex of hexMatch) {
        if (!["#000", "#FFF", "#fff", "#000000", "#FFFFFF", "#ffffff"].includes(hex)) {
          findings.push({ file: rel, line: lineNum, type: "hex", value: hex, code: line.trim().substring(0, 80) })
        }
      }
    }

    // rgba/rgb/hsla/hsl without var(--xxx-rgb)
    const rgbMatch = line.match(/\b(rgba?|hsla?)\(/g)
    if (rgbMatch) {
      // Check if line already uses CSS variables
      if (!line.includes("var(--")) {
        findings.push({ file: rel, line: lineNum, type: rgbMatch[0].includes("hsl") ? "hsl" : "rgb", value: line.match(/[.\d,()#a-fA-F\s]+/)?.[0]?.substring(0, 40) || "", code: line.trim().substring(0, 80) })
      }
    }
  }
}

// Group by type
const groups = { hex: [], rgb: [], hsl: [] }
for (const f of findings) {
  if (f.type === "hex") groups.hex.push(f)
  else if (f.type === "rgb") groups.rgb.push(f)
  else if (f.type === "hsl") groups.hsl.push(f)
}

console.log("═══════════════════════════════════════════════════════════════")
console.log("  METERVERSE COLOR AUDIT REPORT")
console.log("═══════════════════════════════════════════════════════════════")
console.log("")
console.log(`  HEX colors: ${groups.hex.length}`)
console.log(`  RGB/RGBA colors: ${groups.rgb.length}`)
console.log(`  HSL/HSLA colors: ${groups.hsl.length}`)
console.log(`  Total violations: ${findings.length}`)
console.log("")

// Show hex colors grouped by value
const hexGroups = {}
for (const f of groups.hex) {
  if (!hexGroups[f.value]) hexGroups[f.value] = []
  hexGroups[f.value].push(f)
}

console.log("── HEX COLORS ──")
const sortedHex = Object.entries(hexGroups).sort((a, b) => b[1].length - a[1].length)
let hexTotal = 0
for (const [hex, instances] of sortedHex) {
  console.log(`\n  ${hex} — ${instances.length} instances`)
  for (const inst of instances.slice(0, 5)) {
    console.log(`    ${inst.file}:${inst.line}  ${inst.code}`)
  }
  if (instances.length > 5) console.log(`    ... and ${instances.length - 5} more`)
  hexTotal += instances.length
}

console.log("\n── RGB/RGBA COLORS (without CSS vars) ──")
let rgbTotal = 0
for (const f of groups.rgb.slice(0, 50)) {
  console.log(`  ${f.file}:${f.line}  ${f.code}`)
  rgbTotal++
}
if (groups.rgb.length > 50) console.log(`  ... and ${groups.rgb.length - 50} more`)

console.log("\n═══════════════════════════════════════════════════════════════")
console.log(`  TOTAL: ${findings.length} color violations across ${new Set(findings.map(f => f.file)).size} files`)
console.log("═══════════════════════════════════════════════════════════════")
