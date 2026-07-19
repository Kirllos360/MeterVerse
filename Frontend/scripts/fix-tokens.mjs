#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, extname } from "path"

const ROOT = join(import.meta.dirname, "..", "src")
const EXTS = new Set([".tsx", ".ts"])

const REPLACEMENTS = [
  // Fractional spacing → nearest token
  [/gap-1\.5/g, "gap-2"],
  [/gap-2\.5/g, "gap-3"],
  [/gap-0\.5/g, "gap-1"],
  [/py-1\.5(?!px)/g, "py-2"],
  [/py-2\.5(?!px)/g, "py-3"],
  [/py-0\.5(?!px)/g, "py-1"],
  [/py-3\.5(?!px)/g, "py-4"],
  [/px-1\.5(?!px)/g, "px-2"],
  [/px-2\.5(?!px)/g, "px-3"],
  [/p-1\.5(?!px)/g, "p-2"],
  [/p-0\.5(?!px)/g, "p-1"],
  [/p-2\.5(?!px)/g, "p-3"],
  [/mx-0\.5(?!px)/g, "mx-1"],
  [/mx-3\.5(?!px)/g, "mx-4"],
  [/my-0\.5(?!px)/g, "my-1"],

  // Non-standard font sizes
  [/text-\[11px\]/g, "text-xs"],
  [/text-\[8px\]/g, "text-[10px]"],
  [/text-\[9px\]/g, "text-[10px]"],
  [/text-\[13px\]/g, "text-sm"],
  [/text-\[15px\]/g, "text-base"],

  // Shadow → token
  [/shadow-xs/g, "shadow-sm"],
  [/shadow-xl/g, "shadow-lg"],
  [/shadow-2xl/g, "shadow-lg"],
]

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

let fixes = 0
for (const file of walk(ROOT)) {
  let content = readFileSync(file, "utf-8")
  const orig = content
  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement)
  }
  if (content !== orig) {
    writeFileSync(file, content, "utf-8")
    fixes++
    console.log(`  ${file.replace(ROOT, "")}`)
  }
}

console.log(`\n✅ Fixed ${fixes} files`)
