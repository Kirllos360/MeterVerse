import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── ZONE SCHEMA ───────────────────────────────────────────────────

const zoneSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  projectId: z.string().uuid(),
  description: z.string().optional(),
})

const unitSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  zoneId: z.string().uuid(),
  type: z.string().default("residential"),
  area: z.number().positive().optional(),
  customerId: z.string().uuid().optional().nullable(),
})

// ─── ZONES ─────────────────────────────────────────────────────────

router.get("/zones", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { units: true } }, project: { select: { name: true } } } })
    res.json({ zones, total: zones.length })
  } catch (err) { next(err) }
})

router.get("/zones/:id", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const zone = await prisma.zone.findUnique({ where: { id: req.params.id }, include: { units: true, project: { select: { name: true } } } })
    if (!zone) return res.status(404).json({ error: "Zone not found" })
    res.json({ zone })
  } catch (err) { next(err) }
})

router.post("/zones", requirePermission("meters.create"), async (req, res, next) => {
  try {
    const data = zoneSchema.parse(req.body)
    const zone = await prisma.zone.create({ data })
    auditLog(req, "zone.created", { zoneId: zone.id, name: zone.name, projectId: zone.projectId })
    res.status(201).json({ zone })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/zones/:id", requirePermission("meters.update"), async (req, res, next) => {
  try {
    const data = zoneSchema.partial().parse(req.body)
    const zone = await prisma.zone.update({ where: { id: req.params.id }, data })
    auditLog(req, "zone.updated", { zoneId: zone.id })
    res.json({ zone })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/zones/:id", requirePermission("meters.delete"), async (req, res, next) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id } })
    auditLog(req, "zone.deleted", { zoneId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── UNITS ─────────────────────────────────────────────────────────

router.get("/units", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const { zoneId, status } = req.query
    const where = { ...(zoneId ? { zoneId } : {}), ...(status ? { status } : {}) }
    const units = await prisma.unit.findMany({ where, orderBy: { name: "asc" }, include: { zone: { select: { name: true, code: true } }, customer: { select: { id: true, name: true } } } })
    res.json({ units, total: units.length })
  } catch (err) { next(err) }
})

router.get("/units/:id", requirePermission("meters.list"), async (req, res, next) => {
  try {
    const unit = await prisma.unit.findUnique({ where: { id: req.params.id }, include: { zone: { select: { name: true, projectId: true } }, customer: { select: { id: true, name: true } } } })
    if (!unit) return res.status(404).json({ error: "Unit not found" })
    res.json({ unit })
  } catch (err) { next(err) }
})

router.post("/units", requirePermission("meters.create"), async (req, res, next) => {
  try {
    const data = unitSchema.parse(req.body)
    const unit = await prisma.unit.create({ data })
    auditLog(req, "unit.created", { unitId: unit.id, name: unit.name, zoneId: unit.zoneId })
    res.status(201).json({ unit })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/units/:id", requirePermission("meters.update"), async (req, res, next) => {
  try {
    const data = unitSchema.partial().parse(req.body)
    const unit = await prisma.unit.update({ where: { id: req.params.id }, data })
    auditLog(req, "unit.updated", { unitId: unit.id })
    res.json({ unit })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/units/:id", requirePermission("meters.delete"), async (req, res, next) => {
  try {
    await prisma.unit.delete({ where: { id: req.params.id } })
    auditLog(req, "unit.deleted", { unitId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as locationsRouter }
