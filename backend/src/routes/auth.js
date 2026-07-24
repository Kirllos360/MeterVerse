import { Router } from "express"
import { z } from "zod"
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
  } catch (err) { next(err) }
})

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: "Email already registered" })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed, name } })

    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (err) { next(err) }
})

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.role === "admin" ? ["read","write","delete","admin","export","approve"] : ["read"] } })
  } catch (err) { next(err) }
})

// Dev login — returns JWT token without real auth (development only)
router.post("/dev-login", async (req, res, next) => {
  try {
    const { role } = z.object({ role: z.enum(["super_admin", "admin", "operator", "billing", "viewer"]).default("super_admin") }).parse(req.body)
    const jwt = await import("jsonwebtoken")
    const secret = process.env.JWT_SECRET || "dev-secret-key"
    const token = jwt.default.sign({ sub: "dev-user", email: "dev@meterverse.com", role, system: "admin" }, secret, { expiresIn: "24h" })
    res.json({ success: true, accessToken: token, user: { id: "dev-user", email: "dev@meterverse.com", name: "Dev User", role, permissions: ["read","write","delete","admin","export","approve","all"] } })
  } catch (err) { next(err) }
})

export { router as authRouter }


