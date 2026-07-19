import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || "mv-jwt-secret-change-in-production-2026"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h"

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email and password required" })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: "Invalid credentials" })

    const payload = { sub: user.id, email: user.email, role: user.role }
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, area: user.area, project: user.project, tenant: user.tenant, language: user.language, theme: user.theme, mfaEnabled: user.mfaEnabled, permissions: user.role === "admin" ? ["read","write","delete","admin","export","approve"] : user.role === "operator" ? ["read","write","export"] : ["read"] },
      accessToken,
      expiresAt: Date.now() + 86400000,
    })
  } catch (err) { next(err) }
})

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) return res.status(400).json({ error: "Email, password, and name required" })
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" })

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
