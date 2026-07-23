import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  meterId: z.string().min(1),
  value: z.number().positive(),
  unit: z.string().default("kWh"),
  timestamp: z.string().optional(),
  source: z.string().default("manual"),
  status: z.string().default("valid"),
})

router.get("/", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, meterId, status } = req.query
    const where = { archivedAt: null }
    if (meterId) where.meterId = meterId
    if (status) where.status = status
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { timestamp: "desc" }, include: { meter: { select: { id: true, serial: true } } } }),
      prisma.reading.count({ where }),
    ])
    res.json({ readings, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const reading = await prisma.reading.findFirst({ where: { id: req.params.id, archivedAt: null } })
    if (!reading) return res.status(404).json({ error: "Reading not found" })
    auditLog(req, "reading.viewed", { readingId: req.params.id })
    res.json({ reading })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const reading = await prisma.reading.create({ data })
    auditLog(req, "reading.created", { readingId: reading.id })
    res.status(201).json({ reading })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/bulk", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const { readings: items } = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: "readings must be an array" })
    const created = await prisma.reading.createMany({ data: items })
    auditLog(req, "readings.bulk_created", { count: created.count })
    res.status(201).json({ count: created.count })
  } catch (err) { next(err) }
})

router.put("/:id", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const reading = await prisma.reading.update({ where: { id: req.params.id }, data })
    auditLog(req, "reading.updated", { readingId: req.params.id })
    res.json({ reading })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await prisma.reading.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "reading.archived", { readingId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as readingsRouter }



