import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, extname } from "path"

const ROOT = new URL("../../src", import.meta.url).pathname
const EXTS = new Set([".tsx", ".ts", ".css", ".mjs"])

const RE = [
  [/var\(--border-default, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--border-default)"],
  [/var\(--border-default, ?rgba\([^)]+\)\)/g, "var(--border-default)"],
  [/var\(--surface-raised, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-raised)"],
  [/var\(--surface-raised, ?rgba\([^)]+\)\)/g, "var(--surface-raised)"],
  [/var\(--surface-base, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-base)"],
  [/var\(--surface-base, ?oklch[^)]+\)/g, "var(--surface-base)"],
  [/var\(--surface-topbar, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-topbar)"],
  [/var\(--surface-sunken, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-sunken)"],
  [/var\(--surface-tableHeader, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--surface-tableHeader)"],
  [/var\(--text-primary, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--text-primary)"],
  [/var\(--text-secondary, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--text-secondary)"],
  [/var\(--text-tertiary, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--text-tertiary)"],
  [/var\(--status-error, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--status-error)"],
  [/var\(--status-pending, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--status-pending)"],
  [/var\(--brand-primary, ?#[A-Fa-f0-9]{3,6}\)/g, "var(--brand-primary)"],
]

function walk(dir) {
  const files = []
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name)
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".git") files.push(...walk(f))
      else if (e.isFile() && EXTS.has(extname(e.name))) files.push(f)
    }
  } catch {}
  return files
}

let total = 0
let affected = 0
for (const file of walk(ROOT)) {
  let c = readFileSync(file, "utf8")
  let orig = c
  for (const [re, sub] of RE) c = c.replace(re, sub)
  if (c !== orig) { writeFileSync(file, c); affected++; total++; console.log(file) }
}

console.log(`Done: ${total} files changed`)
