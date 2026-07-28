import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("gateways.list"), async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, areaId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = status
    if (areaId) where.areaId = String(areaId)
    const [gateways, total] = await Promise.all([
      prisma.gateway.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: "desc" } }),
      prisma.gateway.count({ where }),
    ])
    res.json({ gateways, total })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("gateways.create"), async (req, res, next) => {
  try {
    const data = z.object({ serial: z.string().min(1), name: z.string().min(1), type: z.string().optional(), areaId: z.string().optional(), ipAddress: z.string().optional() }).parse(req.body)
    const gateway = await prisma.gateway.create({ data })
    auditLog(req, "gateway.created", { gatewayId: gateway.id })
    res.status(201).json({ gateway })
  } catch (err) { next(err) }
})

router.post("/:id/heartbeat", async (req, res, next) => {
  try {
    const gateway = await prisma.gateway.update({ where: { id: req.params.id }, data: { lastSeen: new Date(), status: "active" } })
    res.json({ gateway, status: "ok" })
  } catch (err) { next(err) }
})

// T04: MQTT ingestion endpoint — accepts reading batches from IoT gateways
router.post("/ingest/mqtt", async (req, res, next) => {
  try {
    const batch = z.object({
      gatewaySerial: z.string(),
      readings: z.array(z.object({
        meterSerial: z.string(),
        value: z.number(),
        unit: z.string().optional().default("kWh"),
        timestamp: z.string().optional(),
        source: z.string().optional().default("mqtt"),
      })).max(1000),
    }).parse(req.body)

    const gateway = await prisma.gateway.findUnique({ where: { serial: batch.gatewaySerial } })
    if (!gateway) return res.status(401).json({ error: "Unknown gateway" })

    await prisma.gateway.update({ where: { id: gateway.id }, data: { lastSeen: new Date() } })

    const results = []
    for (const r of batch.readings) {
      try {
        const meter = await prisma.meter.findUnique({ where: { serial: r.meterSerial } })
        if (!meter) continue
        const reading = await prisma.reading.create({
          data: {
            meterId: meter.id, value: r.value, unit: r.unit,
            timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
            source: r.source,
            areaId: meter.areaId, projectId: null,
          },
        })
        results.push({ meterSerial: r.meterSerial, readingId: reading.id })
      } catch {}
    }
    auditLog(req, "mqtt.ingested", { gatewaySerial: batch.gatewaySerial, count: results.length })
    res.status(201).json({ ingested: results.length, total: batch.readings.length, results })
  } catch (err) { next(err) }
})

export { router as gatewaysRouter }
