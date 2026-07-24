import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, requirePermission, auditLog } from "../middleware/security.js"

const createSchema = z.object({
  serial: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  location: z.string().max(200).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
  status: z.string().optional(),
})

const router = Router()
router.use(authenticate)

router.get("/export", requirePermission("meters.create"), async (req, res, next) => {
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

router.get("/", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const where = { archivedAt: null, ...(search ? { OR: [{ serial: { contains: search } }, { type: { contains: search } }] } : {}) }
    const [meters, total] = await Promise.all([
      prisma.meter.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { createdAt: "desc" }, include: { customer: { select: { id: true, name: true } } } }),
      prisma.meter.count({ where }),
    ])
    res.json({ meters, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const meter = await prisma.meter.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { readings: { orderBy: { timestamp: "desc" }, take: 10 }, customer: true } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })
    auditLog(req, "meter.viewed", { meterId: req.params.id })
    res.json({ meter })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("meters.create"), async (req, res, next) => {
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

router.put("/:id", requirePermission("meters.create"), async (req, res, next) => {
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

router.delete("/:id", requirePermission("meters.delete"), async (req, res, next) => {
  try {
    await prisma.meter.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "meter.archived", { meterId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post("/:id/terminate", requirePermission("meters.delete"), async (req, res, next) => {
  try {
    const { reason, finalReading } = z.object({ reason: z.string().min(1), finalReading: z.number().optional() }).parse(req.body)
    const meter = await prisma.meter.findUnique({ where: { id: req.params.id }, include: { simCard: true } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })
    if (meter.status === "retired") return res.status(400).json({ error: "Meter already terminated" })

    const result = await prisma.$transaction(async (tx) => {
      if (finalReading) {
        await tx.reading.create({ data: { meterId: req.params.id, value: finalReading, source: "termination", status: "valid", timestamp: new Date() } })
      }
      await tx.meter.update({ where: { id: req.params.id }, data: { status: "retired" } })
      const sim = await tx.sIMCard.findFirst({ where: { meterId: req.params.id, status: { in: ["assigned", "active"] } } })
      if (sim) {
        await tx.sIMAssignment.updateMany({ where: { simId: sim.id, endAt: null }, data: { endAt: new Date(), status: "released" } })
        const cooldownUntil = new Date(Date.now() + 7 * 86400000)
        await tx.sIMCard.update({ where: { id: sim.id }, data: { status: "available", meterId: null, cooldownUntil } })
      }
      await tx.meterEvent.create({ data: { meterId: req.params.id, eventType: "terminated", description: reason, createdBy: req.user?.email } })
      return { simReleased: !!sim }
    })
    auditLog(req, "meter.terminated", { meterId: req.params.id, reason, finalReading: finalReading || null })
    res.json({ message: "Meter terminated", meterId: req.params.id, ...result })
  } catch (err) { next(err) }
})

export { router as metersRouter }





