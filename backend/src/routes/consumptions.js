import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  meterId: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  value: z.number().min(0),
  unit: z.string().default("kWh"),
  fromReadingId: z.string().optional(),
  toReadingId: z.string().optional(),
  source: z.string().default("calculated"),
  status: z.string().default("PENDING"),
  invoiceId: z.string().optional(),
  areaId: z.string().optional(),
  projectId: z.string().optional(),
  validationNote: z.string().optional(),
})

// POST /api/consumptions — create a persisted consumption record
router.post("/", requirePermission("readings.create"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const meter = await prisma.meter.findUnique({ where: { id: data.meterId } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })

    const existing = await prisma.consumption.findUnique({
      where: { meterId_periodStart_periodEnd: { meterId: data.meterId, periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd) } },
    })
    if (existing) return res.status(409).json({ error: "Consumption already exists for this period" })

    const consumption = await prisma.consumption.create({
      data: {
        meterId: data.meterId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        value: data.value,
        unit: data.unit || meter.unit || "kWh",
        fromReadingId: data.fromReadingId,
        toReadingId: data.toReadingId,
        source: data.source,
        status: data.status,
        invoiceId: data.invoiceId,
        areaId: data.areaId,
        projectId: data.projectId,
        validationNote: data.validationNote,
        createdBy: req.user?.id,
      },
    })
    auditLog(req, "consumption.created", { consumptionId: consumption.id, meterId: data.meterId, value: data.value, periodStart: data.periodStart, periodEnd: data.periodEnd })
    res.status(201).json({ consumption })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// GET /api/consumptions — list consumptions (filtered)
router.get("/", requirePermission("readings.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, meterId, status, areaId, projectId } = req.query
    const where = { archivedAt: null }
    if (meterId) where.meterId = String(meterId)
    if (status) where.status = String(status)
    if (areaId) where.areaId = String(areaId)
    if (projectId) where.projectId = String(projectId)
    const [consumptions, total] = await Promise.all([
      prisma.consumption.findMany({
        where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)),
        orderBy: { periodStart: "desc" },
        include: { meter: { select: { id: true, serial: true } } },
      }),
      prisma.consumption.count({ where }),
    ])
    res.json({ consumptions, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// GET /api/consumptions/:id — detail
router.get("/:id", requirePermission("readings.list"), async (req, res, next) => {
  try {
    const consumption = await prisma.consumption.findUnique({ where: { id: req.params.id }, include: { meter: { select: { id: true, serial: true, unit: true } } } })
    if (!consumption) return res.status(404).json({ error: "Consumption not found" })
    res.json({ consumption })
  } catch (err) { next(err) }
})

export { router as consumptionsRouter }
