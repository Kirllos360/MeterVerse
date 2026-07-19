#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs"

const ROOT = "D:/meter/Frontend/src/app/login/page.tsx"
let c = readFileSync(ROOT, "utf-8")

// Remove --tw-ring-color custom properties (React.CSSProperties doesn't support them)
c = c.replace(/ "--tw-ring-color": "var\(--brand\)"/g, "")
c = c.replace(/'--tw-ring-color': 'var\(--brand\)'/g, "")

// Remove empty style objects
c = c.replace(/style={{}}\s*/g, "")

// Check for useWorkspaceStore in style lines (leftover from previous edit)
// Remove the property from inline style objects
const lines = c.split("\n")
const cleaned = lines.filter(l => !l.includes("tw-ring-color"))

writeFileSync(ROOT, cleaned.join("\n"), "utf-8")
console.log("✅ Fixed")
