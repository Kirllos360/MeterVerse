import { Router } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { auditLog } from "../middleware/security.js"

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) { console.error("FATAL: JWT_SECRET required"); process.exit(1) }
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1).max(100) })

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) { auditLog(req, "auth.login_failed", { email }); return res.status(401).json({ error: "Invalid credentials" }) }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) { auditLog(req, "auth.login_failed", { email }); return res.status(401).json({ error: "Invalid credentials" }) }

    const payload = { sub: user.id, email: user.email, role: user.role }
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    auditLog(req, "auth.login_success", { email })
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, area: user.area, project: user.project, tenant: user.tenant, language: user.language, theme: user.theme, mfaEnabled: user.mfaEnabled, permissions: user.role === "admin" ? ["read","write","delete","admin","export","approve"] : user.role === "operator" ? ["read","write","export"] : ["read"] },
      accessToken,
      expiresAt: Date.now() + 86400000,
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

export { router as authRouter }
