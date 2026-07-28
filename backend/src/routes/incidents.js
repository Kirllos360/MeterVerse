import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  severity: z.enum(["P0", "P1", "P2", "P3", "P4"]).optional().default("P3"),
  category: z.string().optional().default("other"),
  source: z.string().optional().default("auto_detected"),
  areaId: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
  fingerprint: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
  status: z.enum(["detected", "classified", "investigating", "rca_complete", "resolved", "closed"]).optional(),
  resolution: z.string().max(5000).optional(),
})

router.get("/", requirePermission("incidents.list"), async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, severity, areaId, category } = req.query
    const where = { archivedAt: null }
    if (status) where.status = status
    if (severity) where.severity = severity
    if (areaId) where.areaId = String(areaId)
    if (category) where.category = category
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { detectedAt: "desc" } }),
      prisma.incident.count({ where }),
    ])
    res.json({ incidents, total })
  } catch (err) { next(err) }
})

router.get("/stats", requirePermission("incidents.list"), async (req, res, next) => {
  try {
    const [bySeverity, byStatus, mttr] = await Promise.all([
      prisma.incident.groupBy({ by: ["severity"], _count: true, where: { archivedAt: null } }),
      prisma.incident.groupBy({ by: ["status"], _count: true, where: { archivedAt: null } }),
      prisma.incident.aggregate({ _avg: { correlationCount: true }, where: { status: "resolved", resolvedAt: { not: null } } }),
    ])
    res.json({ bySeverity, byStatus, avgCorrelation: mttr._avg.correlationCount || 0 })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("incidents.read"), async (req, res, next) => {
  try {
    const incident = await prisma.incident.findUnique({ where: { id: req.params.id } })
    if (!incident || incident.archivedAt) return res.status(404).json({ error: "Incident not found" })
    res.json({ incident })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("incidents.create"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    if (data.fingerprint) {
      const existing = await prisma.incident.findFirst({ where: { fingerprint: data.fingerprint, status: { notIn: ["resolved", "closed"] }, archivedAt: null } })
      if (existing) {
        await prisma.incident.update({ where: { id: existing.id }, data: { correlationCount: { increment: 1 }, updatedAt: new Date() } })
        auditLog(req, "incident.deduplicated", { incidentId: existing.id, fingerprint: data.fingerprint })
        return res.json({ incident: existing, deduplicated: true })
      }
    }
    const incident = await prisma.incident.create({ data })
    auditLog(req, "incident.created", { incidentId: incident.id, severity: incident.severity })
    res.status(201).json({ incident })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("incidents.update"), async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body)
    if (data.status === "resolved" && !data.resolvedAt) data.resolvedAt = new Date()
    if (data.status === "acknowledged") data.acknowledgedAt = new Date()
    const incident = await prisma.incident.update({ where: { id: req.params.id }, data })
    auditLog(req, "incident.updated", { incidentId: incident.id, status: incident.status })
    res.json({ incident })
  } catch (err) { next(err) }
})

router.delete("/:id", requirePermission("incidents.delete"), async (req, res, next) => {
  try {
    await prisma.incident.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "incident.archived", { incidentId: req.params.id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export { router as incidentsRouter }
