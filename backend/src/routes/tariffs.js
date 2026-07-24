import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const tariffSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["Electricity", "Water", "Gas", "Solar", "BTU"]),
  status: z.enum(["active", "inactive"]).default("active"),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
  rates: z.array(z.object({ name: z.string(), rate: z.number().min(0), unit: z.string().default("kWh") })).default([]),
  tiers: z.array(z.object({ name: z.string(), priority: z.number(), minValue: z.number().default(0), maxValue: z.number().nullable().default(null), rate: z.number().min(0) })).default([]),
})

router.get("/", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const where = {}
    if (req.query.active === "true") where.status = "active"
    if (req.query.type) where.type = req.query.type
    if (req.query.date) where.effectiveFrom = { lte: new Date(req.query.date) }
    const tariffs = await prisma.tariff.findMany({ where, include: { rates: true, tiers: true }, orderBy: { createdAt: "desc" } })
    res.json({ tariffs })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const tariff = await prisma.tariff.findUnique({ where: { id: req.params.id }, include: { rates: true, tiers: true } })
    if (!tariff) return res.status(404).json({ error: "Tariff not found" })
    res.json({ tariff })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const data = tariffSchema.parse(req.body)
    const { rates, tiers, ...tariffData } = data
    const tariff = await prisma.tariff.create({
      data: { ...tariffData, rates: { create: rates }, tiers: { create: tiers } },
      include: { rates: true, tiers: true },
    })
    auditLog(req, "tariff.created", { tariffId: tariff.id, name: tariff.name })
    res.status(201).json({ tariff })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const existing = await prisma.tariff.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "Tariff not found" })
    const data = tariffSchema.partial().parse(req.body)
    const { rates, tiers, ...tariffData } = data
    const tariff = await prisma.tariff.update({
      where: { id: req.params.id },
      data: { ...tariffData, ...(rates ? { rates: { deleteMany: {}, create: rates } } : {}), ...(tiers ? { tiers: { deleteMany: {}, create: tiers } } : {}) },
      include: { rates: true, tiers: true },
    })
    auditLog(req, "tariff.updated", { tariffId: tariff.id, changes: Object.keys(tariffData) })
    res.json({ tariff })
  } catch (err) { next(err) }
})

router.post("/calculate", requirePermission("tariffs.*"), async (req, res, next) => {
  try {
    const { tariffId, consumption } = z.object({ tariffId: z.string(), consumption: z.number().min(0) }).parse(req.body)
    const tariff = await prisma.tariff.findUnique({ where: { id: tariffId }, include: { rates: true, tiers: true } })
    if (!tariff) return res.status(404).json({ error: "Tariff not found" })

    let totalCharge = 0
    const charges = []
    const sortedTiers = (tariff.tiers || []).sort((a, b) => a.priority - b.priority)
    let remaining = consumption

    for (const tier of sortedTiers) {
      const max = tier.maxValue ?? remaining
      const min = tier.minValue ?? 0
      const tierConsumption = Math.min(remaining, Math.max(0, max - min))
      if (tierConsumption <= 0) continue
      const charge = tierConsumption * tier.rate
      totalCharge += charge
      charges.push({ type: "tier", name: tier.name, consumption: tierConsumption, rate: tier.rate, charge })
      remaining -= tierConsumption
      if (remaining <= 0) break
    }

    for (const rate of tariff.rates || []) {
      const charge = consumption * rate.rate
      totalCharge += charge
      charges.push({ type: "rate", name: rate.name, consumption, rate: rate.rate, charge })
    }

    res.json({ tariffId: tariff.id, tariffName: tariff.name, consumption, totalCharge, charges })
  } catch (err) { next(err) }
})

export { router as tariffsRouter }
