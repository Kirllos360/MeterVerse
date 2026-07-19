#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const ROOT = join(import.meta.dirname, "..", "Frontend", "src")
const EXTENSIONS = new Set([".tsx", ".ts", ".css", ".mjs"])

const REPLACEMENTS = [
  // Surface tokens
  [/\bvar\(--border-default,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--border-default)"],
  [/\bvar\(--border-default,\s*rgba\([^)]+\)\)/g, "var(--border-default)"],
  [/\bvar\(--surface-raised,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-raised)"],
  [/\bvar\(--surface-raised,\s*rgba\([^)]+\)\)/g, "var(--surface-raised)"],
  [/\bvar\(--surface-base,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-base)"],
  [/\bvar\(--surface-base,\s*oklch\([^)]+\)\)/g, "var(--surface-base)"],
  [/\bvar\(--surface-topbar,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-topbar)"],
  [/\bvar\(--surface-sunken,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-sunken)"],
  [/\bvar\(--surface-tableHeader,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-tableHeader)"],
  // Text tokens
  [/\bvar\(--text-primary,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--text-primary)"],
  [/\bvar\(--text-secondary,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--text-secondary)"],
  [/\bvar\(--text-tertiary,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--text-tertiary)"],
  // Status tokens
  [/\bvar\(--status-error,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--status-error)"],
  [/\bvar\(--status-pending,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--status-pending)"],
  // Brand token
  [/\bvar\(--brand-primary,\s*#[A-Fa-f0-9]{3,6}\)/g, "var(--brand-primary)"],
]

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...walk(full))
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

let totalFixes = 0
let affectedFiles = 0

const files = walk(ROOT)
for (const file of files) {
  let content = readFileSync(file, "utf-8")
  const original = content
  let fileFixes = 0

  for (const [pattern, replacement] of REPLACEMENTS) {
    const before = content
    content = content.replace(pattern, replacement)
    if (content !== before) fileFixes++
  }

  if (content !== original) {
    writeFileSync(file, content, "utf-8")
    totalFixes += fileFixes
    affectedFiles++
    console.log(`  ✏️  ${file} (${fileFixes} fixes)`)
  }
}

console.log(`\n✅ Done: ${totalFixes} fixes in ${affectedFiles} files`)
