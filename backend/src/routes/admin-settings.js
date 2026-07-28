import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── System Health / Home ────────────────────────────────────────────
router.get("/health/summary", async (req, res, next) => {
  try {
    const meters = await prisma.meter.count()
    const customers = await prisma.customer.count()
    const invoices = await prisma.invoice.count()
    const payments = await prisma.payment.count()
    const users = await prisma.user.count({ where: { archivedAt: null } })
    const openEvents = await prisma.meterEvent.count({ where: { status: "open" } })
    res.json({ meters, customers, invoices, payments, users, openEvents })
  } catch (err) { next(err) }
})

router.get("/health/counters", async (req, res, next) => {
  try {
    const areas = await prisma.meter.groupBy({ by: ["area"], _count: true })
    const projects = await prisma.project.findMany({ select: { id: true, name: true, _count: { select: { zones: true } } } })
    res.json({ areas, projects })
  } catch (err) { next(err) }
})

// ─── System Settings ─────────────────────────────────────────────────
router.get("/settings", async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany({ where: { archivedAt: null } })
    res.json({ settings })
  } catch (err) { next(err) }
})

router.post("/settings", async (req, res, next) => {
  try {
    const { key, value, category, type } = z.object({ key: z.string(), value: z.string(), category: z.string().optional(), type: z.string().optional() }).parse(req.body)
    const setting = await prisma.systemSetting.upsert({ where: { key }, update: { value, category, type }, create: { key, value, category, type } })
    res.status(201).json({ setting })
  } catch (err) { next(err) }
})

// ─── Audit Log ──────────────────────────────────────────────────────
router.get("/audit", async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const entries = await prisma.auditEntry.findMany({ take: Number(limit), skip: Number(offset), orderBy: { timestamp: "desc" }, include: { user: { select: { name: true, email: true } } } })
    const total = await prisma.auditEntry.count()
    res.json({ entries, total })
  } catch (err) { next(err) }
})

// ─── Meters CRUD ────────────────────────────────────────────────────
router.get("/meters/types", async (req, res, next) => {
  try {
    const types = await prisma.meterType.findMany({ where: { archivedAt: null }, include: { _count: { select: { meters: true } } } })
    res.json({ types })
  } catch (err) { next(err) }
})

router.post("/meters/types", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string(), category: z.string().optional(), unit: z.string().optional(), manufacturer: z.string().optional() }).parse(req.body)
    const type = await prisma.meterType.create({ data })
    res.status(201).json({ type })
  } catch (err) { next(err) }
})

router.delete("/meters/types/:id", async (req, res, next) => {
  try {
    await prisma.meterType.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── Customers ───────────────────────────────────────────────────────
router.get("/customers/groups", async (req, res, next) => {
  try {
    const groups = await prisma.customerGroup.findMany({ where: { archivedAt: null }, include: { _count: { select: { members: true } } } })
    res.json({ groups })
  } catch (err) { next(err) }
})

router.post("/customers/groups", async (req, res, next) => {
  try {
    const { name, description } = z.object({ name: z.string(), description: z.string().optional() }).parse(req.body)
    const group = await prisma.customerGroup.create({ data: { name, description } })
    res.status(201).json({ group })
  } catch (err) { next(err) }
})

router.delete("/customers/groups/:id", async (req, res, next) => {
  try {
    await prisma.customerGroup.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ─── Tariffs ─────────────────────────────────────────────────────────
router.get("/tariffs/all", async (req, res, next) => {
  try {
    const tariffs = await prisma.tariff.findMany({ where: { archivedAt: null }, include: { rates: true, tiers: true } })
    res.json({ tariffs })
  } catch (err) { next(err) }
})

router.post("/tariffs/all", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string(), code: z.string(), type: z.string().optional(), unit: z.string().optional(), effectiveFrom: z.string(), effectiveTo: z.string().optional(), rates: z.array(z.object({ name: z.string(), rate: z.number() })).optional() }).parse(req.body)
    const tariff = await prisma.tariff.create({
      data: {
        name: data.name, code: data.code, type: data.type || "flat", unit: data.unit || "kWh",
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        rates: data.rates ? { create: data.rates } : undefined,
      },
    })
    res.status(201).json({ tariff })
  } catch (err) { next(err) }
})

// ─── Locations ───────────────────────────────────────────────────────
router.get("/locations/areas", async (req, res, next) => {
  try {
    const areas = await prisma.meter.groupBy({ by: ["area"], _count: { _all: true }, where: { area: { not: null }, archivedAt: null } })
    res.json({ areas })
  } catch (err) { next(err) }
})

router.get("/locations/projects", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ where: { archivedAt: null }, include: { _count: { select: { zones: true } }, organization: { select: { name: true } } } })
    res.json({ projects })
  } catch (err) { next(err) }
})

router.get("/locations/zones", async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({ where: { archivedAt: null }, include: { _count: { select: { units: true } } } })
    res.json({ zones })
  } catch (err) { next(err) }
})

router.get("/locations/units", async (req, res, next) => {
  try {
    const units = await prisma.unit.findMany({ where: { archivedAt: null }, include: { zone: { select: { name: true } }, customer: { select: { name: true } } } })
    res.json({ units })
  } catch (err) { next(err) }
})

// ─── Payments ────────────────────────────────────────────────────────
router.get("/payments/gateways", async (req, res, next) => {
  try {
    const gateways = await prisma.paymentGateway.findMany({ where: { archivedAt: null } })
    res.json({ gateways })
  } catch (err) { next(err) }
})

router.post("/payments/gateways", async (req, res, next) => {
  try {
    const { name, provider, active, testMode } = z.object({ name: z.string(), provider: z.string().optional(), active: z.boolean().optional(), testMode: z.boolean().optional() }).parse(req.body)
    const gateway = await prisma.paymentGateway.create({ data: { name, provider, active, testMode } })
    res.status(201).json({ gateway })
  } catch (err) { next(err) }
})

// ─── Users & Permissions ────────────────────────────────────────────
router.get("/users/all", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { archivedAt: null },
      select: { id: true, name: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true, roleRel: { select: { name: true } } },
    })
    res.json({ users })
  } catch (err) { next(err) }
})

router.get("/users/roles", async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({ where: { archivedAt: null }, include: { _count: { select: { users: true } }, permissions: { include: { permission: true } } } })
    res.json({ roles })
  } catch (err) { next(err) }
})

router.post("/users/roles", async (req, res, next) => {
  try {
    const { name, description } = z.object({ name: z.string(), description: z.string().optional() }).parse(req.body)
    const role = await prisma.role.create({ data: { name, description } })
    res.status(201).json({ role })
  } catch (err) { next(err) }
})

// ─── Bill Cycles ─────────────────────────────────────────────────────
router.get("/billing/cycles", async (req, res, next) => {
  try {
    const cycles = await prisma.billCycle.findMany({ where: { archivedAt: null }, include: { billRuns: { take: 5, orderBy: { createdAt: "desc" } } } })
    res.json({ cycles })
  } catch (err) { next(err) }
})

router.post("/billing/cycles", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string(), code: z.string(), frequency: z.string().optional(), billingDay: z.number().optional(), dueDay: z.number().optional(), cutOffDay: z.number().optional() }).parse(req.body)
    const cycle = await prisma.billCycle.create({
      data: { name: data.name, code: data.code, frequency: data.frequency || "monthly", billingDay: data.billingDay || 1, dueDay: data.dueDay || 15, cutOffDay: data.cutOffDay || 5 },
    })
    res.status(201).json({ cycle })
  } catch (err) { next(err) }
})

// ─── SIM Cards ───────────────────────────────────────────────────────
router.get("/sim/list", async (req, res, next) => {
  try {
    const sims = await prisma.sIMCard.findMany({ where: { archivedAt: null }, include: { meter: { select: { serial: true } }, assignments: { where: { status: "active" }, take: 1 } } })
    res.json({ sims })
  } catch (err) { next(err) }
})

// ─── Alerts ──────────────────────────────────────────────────────────
router.get("/alerts/list", async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 50 })
    const rules = await prisma.alertRule.findMany({ where: { archivedAt: null } })
    res.json({ alerts, rules })
  } catch (err) { next(err) }
})

// ─── Reports ─────────────────────────────────────────────────────────
router.get("/reports/definitions", async (req, res, next) => {
  try {
    const reports = await prisma.reportDefinition.findMany({ where: { archivedAt: null } })
    const scheduled = await prisma.scheduledReport.findMany({ where: { archivedAt: null } })
    res.json({ reports, scheduled })
  } catch (err) { next(err) }
})

// ─── Upload / Import Jobs ────────────────────────────────────────────
router.get("/uploads/list", async (req, res, next) => {
  try {
    const imports = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
    const exports = await prisma.exportJob.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
    const files = await prisma.storedFile.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
    res.json({ imports, exports, files })
  } catch (err) { next(err) }
})

// ─── Events & Logs ──────────────────────────────────────────────────
router.get("/events/list", async (req, res, next) => {
  try {
    const { resource, limit = 30 } = req.query
    const where = {}
    if (resource) where.resource = resource
    const events = await prisma.activityStream.findMany({ where, orderBy: { createdAt: "desc" }, take: Number(limit) })
    res.json({ events })
  } catch (err) { next(err) }
})

router.get("/errors/list", async (req, res, next) => {
  try {
    const { resource, limit = 30 } = req.query
    const where = { severity: { in: ["error", "critical"] } }
    if (resource) where.resource = resource
    const errors = await prisma.activityStream.findMany({ where, orderBy: { createdAt: "desc" }, take: Number(limit) })
    res.json({ errors })
  } catch (err) { next(err) }
})

export { router as adminSettingsRouter }
