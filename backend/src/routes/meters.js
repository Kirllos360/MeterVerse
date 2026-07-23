import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const createSchema = z.object({
  serial: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  location: z.string().max(200).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
  status: z.string().optional(),
})

const router = Router()
router.use(authenticate)

router.get("/export", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const items = await prisma.meter.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } })
    const header = "serial,type,location,status,area,customerId,createdAt"
    const rows = items.map(m => `${m.serial},${m.type || ""},${m.location || ""},${m.status || ""},${m.area || ""},${m.customerId || ""},${m.createdAt?.toISOString() || ""}`)
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=meters.csv")
    res.send([header, ...rows].join("\n"))
    auditLog(req, "meter.export", { count: items.length })
  } catch (err) { next(err) }
})

router.get("/", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const where = { archivedAt: null, ...(search ? { OR: [{ serial: { contains: search } }, { type: { contains: search } }] } : {}) }
    const [meters, total] = await Promise.all([
      prisma.meter.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { createdAt: "desc" }, include: { customer: { select: { id: true, name: true } } } }),
      prisma.meter.count({ where }),
    ])
    res.json({ meters, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const meter = await prisma.meter.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { readings: { orderBy: { timestamp: "desc" }, take: 10 }, customer: true } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })
    auditLog(req, "meter.viewed", { meterId: req.params.id })
    res.json({ meter })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const meter = await prisma.meter.create({ data })
    auditLog(req, "meter.created", { meterId: meter.id })
    res.status(201).json({ meter })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const meter = await prisma.meter.update({ where: { id: req.params.id }, data })
    auditLog(req, "meter.updated", { meterId: req.params.id })
    res.json({ meter })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await prisma.meter.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "meter.archived", { meterId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as metersRouter }



