import { Router } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { auditLog } from "../middleware/security.js"
import { authenticateUser, verifyToken } from "../services/auth-engine.js"

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
    auditLog(req, `auth.login_success`, { email, system: system_type })
    res.json({
      user: result.user,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      redirect: result.redirect,
      system: result.system,
      portal: result.portal,
    })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(401).json({ error: $Matches[0], code: "AUTH_FAILED", correlationId: req?.correlationId || "unknown" })
    next(err)
  }
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

// Dev login — returns JWT token without real auth (development only)
// Gated behind NODE_ENV !== "production" to prevent production abuse
router.post("/dev-login", async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found", code: "NOT_FOUND" })
  }
  try {
    const { role } = z.object({ role: z.enum(["super_admin", "admin", "operator", "billing", "viewer"]).default("super_admin") }).parse(req.body)
    const jwt = await import("jsonwebtoken")
    const secret = process.env.JWT_SECRET || "dev-secret-key"
    const token = jwt.default.sign({ sub: "dev-user", email: "dev@meterverse.com", role, system: "admin" }, secret, { expiresIn: "24h" })
    auditLog(req, "auth.dev_login", { role })
    res.json({ success: true, accessToken: token, user: { id: "dev-user", email: "dev@meterverse.com", name: "Dev User", role, permissions: ["read","write","delete","admin","export","approve","all"] } })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

export { router as authRouter }


