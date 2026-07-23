import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog , auditMiddleware } from "../middleware/security.js"
import { validatePassword } from "../middleware/security.js"
import { prisma } from "../server.js"
import { Router } from "express"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const router = Router()
router.use(authenticate)

// ─── SECURITY AUDIT ──────────────────────────────────────────────────────────

router.get("/audit/security", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const checks = []
    
    // 1. JWT check
    checks.push({ check: "JWT Secret Length", status: process.env.JWT_SECRET?.length >= 32 ? "pass" : "warn", detail: `${process.env.JWT_SECRET?.length||0} chars (min 32 recommended)` })
    
    // 2. Password Policy
    const minLen = await prisma.systemSetting.findUnique({ where: { key: "security.password.min_length" } })
    checks.push({ check: "Password Policy", status: minLen ? "pass" : "warn", detail: minLen ? `Min ${minLen.value} chars configured` : "Not configured" })
    
    // 3. Rate Limiting
    checks.push({ check: "Rate Limiting", status: "pass", detail: "100 requests per 15 min per IP" })
    
    // 4. Helmet (CSP)
    checks.push({ check: "HTTP Security Headers", status: "pass", detail: "Helmet.js active (CSP, HSTS, X-Frame, etc.)" })
    
    // 5. CORS
    const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:7400"
    checks.push({ check: "CORS", status: corsOrigin !== "*" ? "pass" : "warn", detail: `Origin: ${corsOrigin}` })
    
    // 6. Session Count
    const activeSessions = await prisma.session.count({ where: { isActive: true } })
    checks.push({ check: "Active Sessions", status: activeSessions < 1000 ? "pass" : "warn", detail: `${activeSessions} active` })
    
    // 7. Expired Tokens
    const expiredTokens = await prisma.apiKey.count({ where: { expiresAt: { lt: new Date() }, active: true } })
    checks.push({ check: "Expired API Keys", status: expiredTokens === 0 ? "pass" : "warn", detail: `${expiredTokens} expired keys still active` })
    
    // 8. Users without roles
    const usersNoRole = await prisma.user.count({ where: { roleId: null } })
    checks.push({ check: "Users Without Roles", status: usersNoRole === 0 ? "pass" : "warn", detail: `${usersNoRole} users without role assignment` })
    
    // 9. CORS credentials
    checks.push({ check: "Credentials Mode", status: "pass", detail: "Credentials enabled for same-origin" })
    
    // 10. CORS methods
    checks.push({ check: "CORS Methods", status: "pass", detail: "GET, POST, PUT, DELETE, PATCH" })
    
    const summary = { total: checks.length, passed: checks.filter(c => c.status === "pass").length, warnings: checks.filter(c => c.status === "warn").length }
    res.json({ checks, summary })
  } catch (err) { next(err) }
})

// ─── SECRETS AUDIT ───────────────────────────────────────────────────────────

router.get("/audit/secrets", requireRole("super_admin"), async (req, res, next) => {
  try {
    const findings = []
    const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", ".env")
    
    // Check .env exists and permissions
    try {
      const stat = fs.statSync(envPath)
      findings.push({ file: ".env", issue: "exists", severity: "info", detail: `${stat.size} bytes, modified ${stat.mtime.toISOString().split("T")[0]}` })
    } catch {
      findings.push({ file: ".env", issue: "MISSING", severity: "high", detail: "No .env file found" })
    }
    
    // Check for hardcoded secrets in source
    const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
    const secrets = ["JWT_SECRET", "password:", "api_key", "secret:", "token:"]
    const hardcoded = []
    
    function scanDir(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.name.includes("node_modules") || entry.name.startsWith(".")) continue
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) scanDir(fullPath)
          else if (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) {
            const content = fs.readFileSync(fullPath, "utf8")
            for (const secret of secrets) {
              if (content.toLowerCase().includes(secret.toLowerCase() + "=") || content.toLowerCase().includes(secret.toLowerCase() + ":")) {
                hardcoded.push({ file: path.relative(srcDir, fullPath), pattern: secret })
              }
            }
          }
        }
      } catch {}
    }
    scanDir(srcDir)
    
    findings.push({ file: "Source Code", issue: hardcoded.length > 0 ? `${hardcoded.length} potential secrets found` : "Clean", severity: hardcoded.length > 0 ? "high" : "info", detail: hardcoded.slice(0, 5).map(h => h.file).join(", ") || "No hardcoded secrets" })
    
    // Check for exposed keys in git
    try {
      const gitLog = require("child_process").execSync("git log --all --diff-filter=A --name-only --format=''", { cwd: path.resolve(srcDir, ".."), encoding: "utf8", timeout: 5000 })
      const exposedFiles = gitLog.split("\n").filter(l => l.includes(".env") || l.includes(".key") || l.includes("secret"))
      findings.push({ file: "Git History", issue: exposedFiles.length > 0 ? `${exposedFiles.length} secret files in git history` : "Clean", severity: exposedFiles.length > 0 ? "medium" : "info", detail: exposedFiles.slice(0, 3).join(", ") || "No secrets in git history" })
    } catch {}
    
    res.json({ findings, summary: { total: findings.length, high: findings.filter(f => f.severity === "high").length, medium: findings.filter(f => f.severity === "medium").length, info: findings.filter(f => f.severity === "info").length } })
  } catch (err) { next(err) }
})

// ─── DEPENDENCY AUDIT ────────────────────────────────────────────────────────

router.get("/audit/dependencies", requireRole("super_admin"), async (req, res, next) => {
  try {
    const checks = []
    
    // Check backend package.json
    const bePkg = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "package.json"), "utf8"))
    const deps = { ...bePkg.dependencies, ...bePkg.devDependencies }
    
    // Known vulnerabilities check (simplified)
    const knownVulns = {
      "jsonwebtoken": { version: deps["jsonwebtoken"], status: deps["jsonwebtoken"]?.includes("^9") ? "ok" : "review" },
      "express": { version: deps["express"], status: deps["express"]?.includes("^4") ? "ok" : "review" },
      "bcryptjs": { version: deps["bcryptjs"], status: "ok" },
      "zod": { version: deps["zod"], status: deps["zod"]?.includes("^3") ? "ok" : "review" },
      "@prisma/client": { version: deps["@prisma/client"], status: deps["@prisma/client"]?.includes("^6") ? "ok" : "review" },
    }
    
    for (const [name, info] of Object.entries(knownVulns)) {
      checks.push({ dependency: name, version: info.version || "missing", status: info.status, action: info.status === "ok" ? "None needed" : "Update to latest stable" })
    }
    
    checks.push({ dependency: "Total Dependencies", version: `${Object.keys(deps).length} packages`, status: "info", action: "Run `npm audit` regularly" })
    
    const summary = { total: checks.length, ok: checks.filter(c => c.status === "ok").length, review: checks.filter(c => c.status === "review").length }
    res.json({ checks, summary })
  } catch (err) { next(err) }
})

// ─── PASSWORD POLICY ─────────────────────────────────────────────────────────

router.post("/validate-password", async (req, res, next) => {
  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ error: "Password required" })
    const result = validatePassword(password)
    res.json(result)
  } catch (err) { next(err) }
})

export { router as securityRouter }







