import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { calculateTariff, resolveActiveVersion, calculateForCustomer, simulateTariff } from "../services/tariff-engine.js"

const router = Router()
router.use(authenticate)

const versionSchema = z.object({
  versionNumber: z.number().int().positive().optional(),
  label: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
  baseRate: z.number().nullable().optional(),
  rates: z.array(z.object({ name: z.string(), rate: z.number().min(0), unit: z.string().default("kWh"), priority: z.number().int().default(0) })).default([]),
  tiers: z.array(z.object({ name: z.string(), minValue: z.number().nullable().default(null), maxValue: z.number().nullable().default(null), rate: z.number().min(0), unit: z.string().default("kWh"), priority: z.number().int().default(0) })).default([]),
  touSchedules: z.array(z.object({ name: z.string(), dayOfWeek: z.string().default("ALL"), startHour: z.number().int().min(0).max(23), endHour: z.number().int().min(0).max(24), rate: z.number().min(0) })).default([]),
  demandRates: z.array(z.object({ name: z.string(), rate: z.number().min(0), unit: z.string().default("kW"), threshold: z.number().nullable().default(null), priority: z.number().int().default(0) })).default([]),
  fixedCharges: z.array(z.object({ name: z.string(), amount: z.number().min(0), frequency: z.string().default("MONTHLY") })).default([]),
  taxes: z.array(z.object({ name: z.string(), rate: z.number().min(0), type: z.string().default("PERCENTAGE"), amount: z.number().nullable().default(null) })).default([]),
})

const assignmentSchema = z.object({
  customerId: z.string().min(1),
  tariffVersionId: z.string().min(1),
  effectiveFrom: z.string().optional(),
})

const calcSchema = z.object({
  tariffId: z.string().optional(),
  versionId: z.string().optional(),
  customerId: z.string().optional(),
  consumption: z.number().min(0).default(0),
  demand: z.number().min(0).default(0),
  hour: z.number().int().min(0).max(23).nullable().optional(),
  dayOfWeek: z.string().default("ALL"),
  periods: z.number().int().min(1).default(1),
})

// ─── Versions ────────────────────────────────────────────────────────────────
router.get("/:tariffId/versions", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const versions = await prisma.tariffVersion.findMany({
      where: { tariffId: req.params.tariffId, archivedAt: null },
      include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true },
      orderBy: { versionNumber: "desc" },
    })
    res.json({ versions })
  } catch (err) { next(err) }
})

router.post("/:tariffId/versions", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const tariff = await prisma.tariff.findUnique({ where: { id: req.params.tariffId } })
    if (!tariff) return res.status(404).json({ error: "Tariff not found" })
    const data = versionSchema.parse(req.body)
    const nextNumber = data.versionNumber ?? (await prisma.tariffVersion.count({ where: { tariffId: tariff.id } })) + 1
    const version = await prisma.tariffVersion.create({
      data: {
        tariffId: tariff.id,
        versionNumber: nextNumber,
        label: data.label || `v${nextNumber}`,
        status: "DRAFT",
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        baseRate: data.baseRate ?? null,
        createdBy: req.user?.id,
        rates: { create: data.rates },
        tiers: { create: data.tiers },
        touSchedules: { create: data.touSchedules },
        demandRates: { create: data.demandRates },
        fixedCharges: { create: data.fixedCharges },
        taxes: { create: data.taxes },
        changeLogs: { create: { changedBy: req.user?.id, changeType: "CREATE", summary: `Version ${nextNumber} created` } },
      },
      include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true },
    })
    auditLog(req, "tariff.version.created", { tariffId: tariff.id, versionId: version.id, versionNumber: version.versionNumber })
    res.status(201).json({ version })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/:tariffId/versions/:versionId/activate", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const version = await prisma.tariffVersion.findUnique({ where: { id: req.params.versionId } })
    if (!version || version.tariffId !== req.params.tariffId) return res.status(404).json({ error: "Version not found" })
    if (version.status === "ACTIVE") return res.status(400).json({ error: "Version already active" })

    await prisma.$transaction(async (tx) => {
      await tx.tariffVersion.updateMany({ where: { tariffId: req.params.tariffId, status: "ACTIVE" }, data: { status: "SUPERSEDED", effectiveTo: new Date() } })
      await tx.tariffVersion.update({ where: { id: version.id }, data: { status: "ACTIVE", activatedAt: new Date(), changeLogs: { create: { changedBy: req.user?.id, changeType: "ACTIVATE", summary: `Version ${version.versionNumber} activated` } } } })
    })
    const updated = await prisma.tariffVersion.findUnique({ where: { id: version.id }, include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true } })
    auditLog(req, "tariff.version.activated", { tariffId: req.params.tariffId, versionId: version.id })
    res.json({ version: updated })
  } catch (err) { next(err) }
})

router.get("/versions/:versionId", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const version = await prisma.tariffVersion.findUnique({
      where: { id: req.params.versionId },
      include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true, changeLogs: true },
    })
    if (!version) return res.status(404).json({ error: "Version not found" })
    res.json({ version })
  } catch (err) { next(err) }
})

// ─── Customer assignments ────────────────────────────────────────────────────
router.get("/assignments", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const assignments = await prisma.customerTariff.findMany({
      where: { archivedAt: null },
      include: { customer: { select: { id: true, name: true } }, tariffVersion: { include: { tariff: { select: { id: true, name: true, code: true } } } } },
      orderBy: { effectiveFrom: "desc" },
    })
    res.json({ assignments })
  } catch (err) { next(err) }
})

router.post("/assignments", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const data = assignmentSchema.parse(req.body)
    const [customer, version] = await Promise.all([
      prisma.customer.findUnique({ where: { id: data.customerId } }),
      prisma.tariffVersion.findUnique({ where: { id: data.tariffVersionId } }),
    ])
    if (!customer || !version) return res.status(404).json({ error: "Customer or tariff version not found" })

    const assignment = await prisma.$transaction(async (tx) => {
      await tx.customerTariff.updateMany({ where: { customerId: data.customerId, status: "ACTIVE" }, data: { status: "EXPIRED", effectiveTo: new Date() } })
      return tx.customerTariff.create({
        data: { customerId: data.customerId, tariffVersionId: data.tariffVersionId, effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(), status: "ACTIVE", assignedBy: req.user?.id },
      })
    })
    auditLog(req, "tariff.assigned", { customerId: data.customerId, tariffVersionId: data.tariffVersionId, assignmentId: assignment.id })
    res.status(201).json({ assignment })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Calculation + simulation ────────────────────────────────────────────────
router.post("/calculate", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const input = calcSchema.parse(req.body)
    if (input.customerId) {
      const result = await calculateForCustomer(input.customerId, input)
      if (!result.ok) return res.status(400).json({ error: result.error })
      res.json({ tariffVersion: result.tariffVersion.id, ...result })
      return
    }
    if (input.versionId) {
      const version = await prisma.tariffVersion.findUnique({ where: { id: input.versionId }, include: { rates: true, tiers: true, touSchedules: true, demandRates: true, fixedCharges: true, taxes: true } })
      if (!version) return res.status(404).json({ error: "Version not found" })
      res.json({ tariffVersion: version.id, ...calculateTariff(version, input) })
      return
    }
    if (input.tariffId) {
      const version = await resolveActiveVersion(input.tariffId)
      if (!version) return res.status(404).json({ error: "No active version for tariff" })
      res.json({ tariffVersion: version.id, ...calculateTariff(version, input) })
      return
    }
    res.status(400).json({ error: "Provide tariffId, versionId, or customerId" })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/simulate", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const { tariffId, versionComponents, ...input } = z.object({
      tariffId: z.string().optional(),
      versionComponents: versionSchema.partial().optional(),
      consumption: z.number().min(0).default(0),
      demand: z.number().min(0).default(0),
      hour: z.number().int().min(0).max(23).nullable().optional(),
      dayOfWeek: z.string().default("ALL"),
      periods: z.number().int().min(1).default(1),
    }).parse(req.body)
    const result = await simulateTariff({ tariffId, versionComponents, input })
    if (!result.ok) return res.status(400).json({ error: result.error })
    auditLog(req, "tariff.simulated", { tariffId: tariffId || "inline", consumption: input.consumption, totalCharge: result.totalCharge })
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

export { router as tariffEngineRouter }
