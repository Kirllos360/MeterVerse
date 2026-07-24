import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, requirePermission, auditLog } from "../middleware/security.js"

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

router.get("/", requirePermission("readings.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, meterId, status } = req.query
    const where = { archivedAt: null }
    if (meterId) where.meterId = meterId
    if (status) where.status = status
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { timestamp: "desc" }, include: { meter: { select: { id: true, serial: true } } } }),
      prisma.reading.count({ where }),
    ])
    res.json({ readings, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})


router.get("/export", requirePermission("readings.create"), async (req, res, next) => {
  try {
    const items = await prisma.reading.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } })
    const header = "meterId,value,unit,timestamp,source,status,createdAt"
    const rows = items.map(i => [i.meterId, i.value, i.unit, i.timestamp, i.source, i.status, i.createdAt].join(","))
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=readings.csv")
    res.send([header, ...rows].join("\n"))
    auditLog(req, "reading.export", { count: items.length })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("readings.list"), async (req, res, next) => {
  try {
    const reading = await prisma.reading.findFirst({ where: { id: req.params.id, archivedAt: null } })
    if (!reading) return res.status(404).json({ error: "Reading not found" })
    auditLog(req, "reading.viewed", { readingId: req.params.id })
    res.json({ reading })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("readings.create"), async (req, res, next) => {
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

router.post("/bulk", requirePermission("readings.create"), async (req, res, next) => {
  try {
    const { readings: items } = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: "readings must be an array" })
    const created = await prisma.reading.createMany({ data: items })
    auditLog(req, "readings.bulk_created", { count: created.count })
    res.status(201).json({ count: created.count })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("readings.create"), async (req, res, next) => {
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

router.post("/", requirePermission("readings.create"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const existing = await prisma.reading.findFirst({ where: { meterId: data.meterId, timestamp: data.timestamp ? new Date(data.timestamp) : undefined, source: data.source } })
    if (existing && data.source !== "automatic") return res.status(409).json({ error: "Duplicate reading", existingId: existing.id })

    const prevReading = await prisma.reading.findFirst({
      where: { meterId: data.meterId, timestamp: { lt: data.timestamp ? new Date(data.timestamp) : new Date() } },
      orderBy: { timestamp: "desc" },
    })

    let status = "valid"
    const flags = []
    if (prevReading && data.value < 0) { status = "flagged"; flags.push("negative_value") }
    if (prevReading && data.value > prevReading.value * 3 && prevReading.value > 0) { status = "suspicious"; flags.push("spike") }
    if (prevReading && data.value < prevReading.value * 0.1 && prevReading.value > 0) { status = "suspicious"; flags.push("drop") }
    if (data.value === 0 && prevReading && prevReading.value > 0) { status = "flagged"; flags.push("zero_reading") }

    const reading = await prisma.reading.create({
      data: { ...data, timestamp: data.timestamp ? new Date(data.timestamp) : new Date(), status },
    })
    if (flags.length > 0) {
      await prisma.validationResult.create({
        data: { validationRuleId: "auto", entityType: "reading", entityId: reading.id, status, message: `Auto-flagged: ${flags.join(", ")}` },
      })
    }
    auditLog(req, "reading.created", { readingId: reading.id, meterId: data.meterId, value: data.value, status })
    res.status(201).json({ reading, flags })
  } catch (err) { next(err) }
})

router.get("/review-queue", requirePermission("readings.list"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const where = { status: { in: ["flagged", "suspicious"] }, archivedAt: null }
    if (req.query.meterId) where.meterId = req.query.meterId
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { timestamp: "desc" }, include: { meter: { select: { meterId: true, type: true } } } }),
      prisma.reading.count({ where }),
    ])
    res.json({ readings, total, page, limit, queueType: "review" })
  } catch (err) { next(err) }
})

router.post("/:id/approve", requirePermission("readings.edit"), async (req, res, next) => {
  try {
    const reading = await prisma.reading.findUnique({ where: { id: req.params.id } })
    if (!reading) return res.status(404).json({ error: "Reading not found" })
    await prisma.reading.update({ where: { id: req.params.id }, data: { status: "approved" } })
    await prisma.validationResult.create({ data: { validationRuleId: "manual", entityType: "reading", entityId: reading.id, status: "approved", message: "Approved by reviewer" } })
    auditLog(req, "reading.approved", { readingId: reading.id })
    res.json({ message: "Reading approved" })
  } catch (err) { next(err) }
})

router.post("/:id/reject", requirePermission("readings.edit"), async (req, res, next) => {
  try {
    const reading = await prisma.reading.findUnique({ where: { id: req.params.id } })
    if (!reading) return res.status(404).json({ error: "Reading not found" })
    await prisma.reading.update({ where: { id: req.params.id }, data: { status: "rejected" } })
    await prisma.validationResult.create({ data: { validationRuleId: "manual", entityType: "reading", entityId: reading.id, status: "rejected", message: "Rejected by reviewer" } })
    auditLog(req, "reading.rejected", { readingId: reading.id })
    res.json({ message: "Reading rejected" })
  } catch (err) { next(err) }
})

router.delete("/:id", requirePermission("readings.delete"), async (req, res, next) => {
  try {
    await prisma.reading.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "reading.archived", { readingId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as readingsRouter }





