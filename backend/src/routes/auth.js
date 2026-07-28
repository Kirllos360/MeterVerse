import { Router } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import jwt from "jsonwebtoken"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { auditLog, requirePermission } from "../middleware/security.js"
import { authenticateUser, verifyToken } from "../services/auth-engine.js"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + "-refresh"

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  system_type: z.enum(["admin", "user", "mobile"]).optional().default("admin"),
})
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1).max(100) })

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, system_type } = loginSchema.parse(req.body)
    const result = await authenticateUser(email, password, system_type, req.ip)
    if (!result.success) return res.status(result.status).json({ error: result.error })

    // Check MFA
    const user = await prisma.user.findUnique({ where: { email } })
    if (user?.mfaEnabled) {
      const mfaToken = jwt.sign({ sub: user.id, mfa: true }, JWT_SECRET, { expiresIn: "5m" })
      auditLog(req, "auth.mfa_required", { email })
      return res.json({ mfaRequired: true, mfaToken, userId: user.id })
    }

    // Create session for refresh tokens
    const session = await prisma.session.create({
      data: { userId: user.id, isActive: true, ipAddress: req.ip, userAgent: req.headers["user-agent"] || "" },
    })

    const accessToken = jwt.sign({ sub: user.id, email: user.email, role: user.role, system: system_type }, JWT_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ sub: user.id, sessionId: session.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })

    auditLog(req, "auth.login_success", { email, system: system_type })
    res.json({
      user: result.user,
      accessToken,
      refreshToken,
      expiresIn: 900,
      redirect: result.redirect,
      system: result.system,
      portal: result.portal,
    })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(401).json({ error: "Validation failed", code: "AUTH_FAILED" })
    next(err)
  }
})

// MFA login verification — exchange mfaToken + TOTP for real tokens
router.post("/mfa/login", async (req, res, next) => {
  try {
    const { mfaToken, totpCode } = z.object({ mfaToken: z.string(), totpCode: z.string().length(6) }).parse(req.body)
    let payload
    try { payload = jwt.verify(mfaToken, JWT_SECRET) } catch { return res.status(401).json({ error: "MFA token expired" }) }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.mfaSecret) return res.status(400).json({ error: "MFA not configured" })
    const verified = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: "base32", token: totpCode })
    if (!verified) return res.status(401).json({ error: "Invalid TOTP code" })
    const session = await prisma.session.create({
      data: { userId: user.id, isActive: true, ipAddress: req.ip, userAgent: req.headers["user-agent"] || "" },
    })
    const accessToken = jwt.sign({ sub: user.id, email: user.email, role: user.role, system: "admin" }, JWT_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ sub: user.id, sessionId: session.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
    auditLog(req, "auth.mfa_login_success", { userId: user.id })
    res.json({ accessToken, refreshToken, expiresIn: 900, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) { next(err) }
})

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(401).json({ error: $Matches[0], code: "AUTH_FAILED", correlationId: req?.correlationId || "unknown" })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed, name } })

    auditLog(req, "user.registered", { userId: user.id, email: user.email })
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return res.status(401).json({ error: $Matches[0], code: "AUTH_FAILED", correlationId: req?.correlationId || "unknown" })
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.role === "admin" ? ["read","write","delete","admin","export","approve"] : ["read"] } })
  } catch (err) { next(err) }
})

// ─── MFA (TOTP) ────────────────────────────────────────────────────────────────

router.post("/mfa/enroll", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return res.status(404).json({ error: "User not found" })
    if (user.mfaEnabled) return res.status(400).json({ error: "MFA already enabled" })
    const secret = speakeasy.generateSecret({ name: `MeterVerse:${user.email}` })
    const qrUri = await qrcode.toDataURL(secret.otpauth_url)
    await prisma.user.update({ where: { id: user.id }, data: { mfaSecret: secret.base32 } })
    auditLog(req, "mfa.enrolled", { userId: user.id })
    res.json({ secret: secret.base32, qrUri })
  } catch (err) { next(err) }
})

router.post("/mfa/verify", authenticate, async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string().length(6) }).parse(req.body)
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user || !user.mfaSecret) return res.status(400).json({ error: "MFA not enrolled" })
    const verified = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: "base32", token })
    if (!verified) return res.status(401).json({ error: "Invalid TOTP code" })
    await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: true } })
    auditLog(req, "mfa.verified", { userId: user.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post("/mfa/disable", authenticate, async (req, res, next) => {
  try {
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body)
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return res.status(404).json({ error: "User not found" })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: "Invalid password" })
    await prisma.user.update({ where: { id: user.id }, data: { mfaEnabled: false, mfaSecret: null } })
    auditLog(req, "mfa.disabled", { userId: user.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── Refresh Tokens ──────────────────────────────────────────────────────────

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body)
    let payload
    try { payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) } catch { return res.status(401).json({ error: "Invalid or expired refresh token" }) }
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } })
    if (!session || !session.isActive) return res.status(401).json({ error: "Session revoked or expired" })
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(401).json({ error: "User not found" })
    const newAccessToken = jwt.sign({ sub: user.id, email: user.email, role: user.role, system: "admin" }, JWT_SECRET, { expiresIn: "15m" })
    const newRefreshToken = jwt.sign({ sub: user.id, sessionId: session.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })
    auditLog(req, "auth.token_refreshed", { userId: user.id })
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 900 })
  } catch (err) { next(err) }
})

router.post("/logout", authenticate, async (req, res, next) => {
  try {
    if (req.body?.refreshToken) {
      try {
        const payload = jwt.verify(req.body.refreshToken, JWT_REFRESH_SECRET)
        await prisma.session.updateMany({ where: { id: payload.sessionId, userId: req.user.sub }, data: { isActive: false } })
      } catch {}
    }
    auditLog(req, "auth.logout", { userId: req.user.sub })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── Emergency Access (Break-Glass — T06) ────────────────────────────────────
// Super-admin can generate emergency tokens for support engineers.
// Auto-expires after 4 hours. Every action is audited with emergency flag.

router.post("/emergency/token", authenticate, requirePermission("admin.emergency"), async (req, res, next) => {
  try {
    const { reason, duration = 240 } = z.object({ reason: z.string().min(1).max(500), duration: z.number().min(30).max(480).optional() }).parse(req.body)
    const emergencyToken = jwt.sign({ sub: req.user.sub, email: req.user.email, role: "emergency", emergency: true, reason }, JWT_SECRET, { expiresIn: `${duration}m` })
    const session = await prisma.session.create({ data: { userId: req.user.sub, isActive: true, ipAddress: req.ip, userAgent: req.headers["user-agent"] || "" } })
    auditLog(req, "emergency.token_issued", { reason, duration, sessionId: session.id })
    res.json({ emergencyToken, expiresIn: duration * 60, sessionId: session.id })
  } catch (err) { next(err) }
})

router.get("/emergency/audit", authenticate, requirePermission("admin.emergency"), async (req, res, next) => {
  try {
    const entries = await prisma.auditEntry.findMany({ where: { action: { startsWith: "emergency." } }, orderBy: { timestamp: "desc" }, take: 50 })
    res.json({ entries })
  } catch (err) { next(err) }
})

// Dev login — returns JWT token without real auth (development only)
// COMPILE-TIME REMOVAL: Route not registered in production
if (process.env.NODE_ENV !== "production") {
  router.post("/dev-login", async (req, res, next) => {
    try {
      const { role } = z.object({ role: z.enum(["super_admin", "admin", "operator", "billing", "viewer"]).default("super_admin") }).parse(req.body)
      const jwt = await import("jsonwebtoken")
      const secret = process.env.JWT_SECRET
      const token = jwt.default.sign({ sub: "dev-user", email: "dev@meterverse.com", role, system: "admin" }, secret, { expiresIn: "24h" })
      auditLog(req, "auth.dev_login", { role })
      res.json({ success: true, accessToken: token, user: { id: "dev-user", email: "dev@meterverse.com", name: "Dev User", role, permissions: ["read","write","delete","admin","export","approve","all"] } })
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
      next(err)
    }
  })
}

export { router as authRouter }


