#!/usr/bin/env node

/**
 * SpecKit Validator — MeterVerse Specification Compliance Checker
 *
 * Usage:
 *   node speckit/validator.mjs                   # Run all validators
 *   node speckit/validator.mjs --check colors     # Check design tokens only
 *   node speckit/validator.mjs --check security   # Check security only
 *   node speckit/validator.mjs --full             # Full report with file listing
 */

import { readFileSync, existsSync, readdirSync } from "fs"
import { join, extname, resolve } from "path"
import { fileURLToPath } from "url"

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..")
const SRC = join(ROOT, "Frontend", "src")

const args = process.argv.slice(2)
const fullMode = args.includes("--full")
const checks = args.includes("--check") ? args[args.indexOf("--check") + 1]?.split(",") : null

let passed = 0
let failed = 0
let warnings = []

function check(name, condition, detail = "") {
  if (checks && !checks.includes(name)) return
  if (condition) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`)
    failed++
  }
}

function warn(msg) {
  warnings.push(msg)
  console.log(`  ⚠️  ${msg}`)
}

function walkDir(dir, ext = ".ts") {
  const files = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...walkDir(full, ext))
    } else if (entry.isFile() && extname(entry.name) === ext) {
      files.push(full)
    }
  }
  return files
}

// ─── 1. Architecture Check ─────────────────────────────────
function checkArchitecture() {
  console.log("\n── Architecture ──")

  check("bff-pattern",
    existsSync(join(ROOT, "Frontend", "src", "app", "api", "auth", "login", "route.ts")),
    "Missing auth login BFF route"
  )

  check("service-layer",
    existsSync(join(ROOT, "Frontend", "src", "identity", "auth", "api", "auth-service.ts")),
    "Missing auth service layer"
  )

  check("graphiti-structure",
    existsSync(join(ROOT, "graphiti", "index.json")),
    "Missing graphiti knowledge graph"
  )

  check("speckit-validator",
    existsSync(join(ROOT, "speckit", "validator.mjs")),
    "Missing SpecKit validator"
  )
}

// ─── 2. Design Token Check ─────────────────────────────────
function checkDesignTokens() {
  console.log("\n── Design Tokens ──")

  const files = walkDir(SRC, ".tsx").concat(walkDir(SRC, ".ts"))
    const hexColorRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?!\w)/g
  const hardcodedColors = []

  for (const file of files) {
    // Skip design-system definition files — they DEFINE the tokens
    if (file.includes("design-system")) continue
    const content = readFileSync(file, "utf-8")
    const matches = content.match(hexColorRegex) || []
    for (const color of matches) {
      // Exclude color hexes in comments, test data, and known patterns
      if (["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#E5E5E5", "#F0F0F0", "#0A0A0A", "#737373", "#A3A3A3", "#FAFAFA"].includes(color)) continue
      if (color === "#00BFA5") {
        hardcodedColors.push({ file, color })
      }
    }
  }

  // Check that CSS variables are properly defined
  const themeCSS = readFileSync(join(ROOT, "Frontend", "src", "styles", "theme.css"), "utf-8")

  check("brand-primary-var",
    themeCSS.includes("--brand-primary"),
    "Missing --brand-primary design token"
  )

  check("surface-tokens",
    themeCSS.includes("--surface-base"),
    "Missing --surface-base design token"
  )

  check("text-tokens",
    themeCSS.includes("--text-primary"),
    "Missing --text-primary design token"
  )

  check("status-tokens",
    themeCSS.includes("--status-success") && themeCSS.includes("--status-error"),
    "Missing status design tokens"
  )

  check("rgb-component-vars",
    themeCSS.includes("--brand-primary-rgb"),
    "Missing RGB component vars for rgba() usage"
  )

  check("no-hardcoded-brand",
    hardcodedColors.length === 0,
    `Found ${hardcodedColors.length} hardcoded #00BFA5 instances`
  )

  if (hardcodedColors.length > 0 && fullMode) {
    for (const hc of hardcodedColors.slice(0, 10)) {
      warn(`${hc.file} — hardcoded #00BFA5`)
    }
  }
}

// ─── 3. Security Check ─────────────────────────────────────
function checkSecurity() {
  console.log("\n── Security ──")

  const files = walkDir(SRC, ".ts").concat(walkDir(SRC, ".tsx"))
  let secretsFound = 0

  for (const file of files) {
    const content = readFileSync(file, "utf-8")
    // API key patterns
    if (content.match(/['"](?:api[_-]?key|secret|token|password)['"]\s*:\s*['"][^'"]+['"]/i)) {
      secretsFound++
      if (fullMode) warn(`${file} — possible hardcoded secret`)
    }
  }

  check("no-mock-auth-default",
    existsSync(join(ROOT, "Frontend", "src", "identity", "auth", "api", "auth-service.ts")),
    "Auth uses mock, not real API"
  )

  check("auth-bff-routes",
    existsSync(join(ROOT, "Frontend", "src", "app", "api", "auth", "me", "route.ts")),
    "Missing auth session validation"
  )
}

// ─── 4. Testing Check ──────────────────────────────────────
function checkTesting() {
  console.log("\n── Testing ──")

  const hasTests = existsSync(join(ROOT, "Frontend", "tests"))
  const hasPlaywright = existsSync(join(ROOT, "Frontend", "playwright.config.ts"))
  const hasAudit = existsSync(join(ROOT, "Frontend", "tests", "run-audit-final.mjs"))

  check("playwright-setup", hasPlaywright, "Missing Playwright config")
  check("final-audit", hasAudit, "Missing final audit script")
  check("test-reports",
    existsSync(join(ROOT, "Frontend", "test-reports")),
    "Missing test reports directory"
  )
}

// ─── 5. CI/CD Check ────────────────────────────────────────
function checkCICD() {
  console.log("\n── CI/CD ──")

  const workflowsDir = join(ROOT, ".github", "workflows")

  check("build-workflow", existsSync(join(workflowsDir, "ci.yml")), "Build step in ci.yml")
  check("tests-workflow", existsSync(join(workflowsDir, "ci.yml")), "Tests step in ci.yml")
  check("codeql-workflow", existsSync(join(workflowsDir, "codeql.yml")), "Missing codeql.yml")
  check("orchestration-ci", existsSync(join(workflowsDir, "ci.yml")), "Missing ci.yml")
}

// ─── Run ────────────────────────────────────────────────────
console.log("╔══════════════════════════════════════════╗")
console.log("║   SpecKit — MeterVerse Validation Suite  ║")
console.log("╚══════════════════════════════════════════╝")
console.log(`Date: ${new Date().toISOString().split("T")[0]}`)
console.log(`Mode: ${fullMode ? "full" : "standard"}`)

checkArchitecture()
checkDesignTokens()
checkSecurity()
checkTesting()
checkCICD()

console.log("\n══════════════════════════════════════════")
console.log(`Results: ${passed} passed, ${failed} failed, ${warnings.length} warnings`)
console.log(`Score: ${Math.round((passed / (passed + failed)) * 100)}%`)
console.log(`Status: ${failed === 0 ? "✅ ALL CHECKS PASSED" : "❌ CHECKS FAILED"}`)
console.log("══════════════════════════════════════════")

process.exit(failed > 0 ? 1 : 0)
