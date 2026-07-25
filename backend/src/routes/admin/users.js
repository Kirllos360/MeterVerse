import { Router } from "express"
import { z } from "zod"
import { prisma } from "../../server.js"
import { requirePermission, auditLog } from "../../middleware/security.js"

const router = Router()

const createUserSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1), role: z.string().default("viewer"), status: z.string().default("active") })

router.get("/", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { role: true } })
    res.json({ users })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { role: true } })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ user })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body)
    const hashed = await (await import("bcryptjs")).hash(data.password, 10)
    const user = await prisma.user.create({ data: { ...data, password: hashed } })
    auditLog(req, "admin.user.created", { userId: user.id, email: user.email })
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "User not found" })
    const data = createUserSchema.partial().parse(req.body)
    if (data.password) data.password = await (await import("bcryptjs")).hash(data.password, 10)
    const user = await prisma.user.update({ where: { id: req.params.id }, data })
    auditLog(req, "admin.user.updated", { userId: user.id, changes: Object.keys(data) })
    res.json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "admin.user.deleted", { userId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as adminUsersRouter }
