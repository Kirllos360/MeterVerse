import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog , auditMiddleware } from "../middleware/security.js"
import { executePipeline, validateReading, calculateConsumption, applyTariff } from "../services/business-engine.js"

const router = Router()
router.use(authenticate)

// ─── PIPELINE EXECUTION ───────────────────────────────────────────────────────

router.post("/pipeline/execute", requirePermission("business.*"), async (req, res, next) => {
  try {
    const data = z.object({
      meterId: z.string().uuid(), customerId: z.string().uuid(), tariffId: z.string().uuid(),
      periodStart: z.string(), periodEnd: z.string(),
    }).parse(req.body)
    const result = await executePipeline(data.meterId, data.customerId, data.tariffId, data.periodStart, data.periodEnd)
    auditLog(req, "pipeline.executed", { success: result.success })
    await prisma.auditEntry.create({ data: { action: "pipeline.executed", actor: req.user.email, resource: "pipeline", details: JSON.stringify({ success: result.success }), status: result.success ? "success" : "failure" } })
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/pipeline/validate-reading", requirePermission("business.*"), async (req, res, next) => {
  try {
    const { readingId } = z.object({ readingId: z.string().uuid() }).parse(req.body)
    const result = await validateReading(readingId)
    auditLog(req, "pipeline.validate_reading", { readingId })
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/pipeline/calculate-consumption", requirePermission("business.*"), async (req, res, next) => {
  try {
    const data = z.object({ meterId: z.string().uuid(), startDate: z.string(), endDate: z.string() }).parse(req.body)
    const result = await calculateConsumption(data.meterId, data.startDate, data.endDate)
    auditLog(req, "pipeline.calculate_consumption", { meterId: data.meterId })
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/pipeline/apply-tariff", requirePermission("business.*"), async (req, res, next) => {
  try {
    const data = z.object({ tariffId: z.string().uuid(), consumption: z.number(), periodStart: z.string(), periodEnd: z.string() }).parse(req.body)
    const result = await applyTariff(data.tariffId, data.consumption, data.periodStart, data.periodEnd)
    auditLog(req, "pipeline.apply_tariff", { tariffId: data.tariffId })
    res.json(result)
  } catch (err) { next(err) }
})

// ─── PIPELINE STATUS ─────────────────────────────────────────────────────────

router.get("/pipeline/status", requirePermission("business.*"), async (req, res, next) => {
  try {
    const [totalReadings, validReadings, totalInvoices, totalCharges] = await Promise.all([
      prisma.reading.count(), prisma.reading.count({ where: { status: "valid" } }),
      prisma.invoice.count(), prisma.invoiceItem.count(),
    ])
    const recentRuns = await prisma.billRun.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { billCycle: { select: { name: true } } } })
    res.json({ stats: { totalReadings, validReadings, validationRate: totalReadings ? Math.round(validReadings / totalReadings * 100) : 0, totalInvoices, totalCharges }, recentRuns })
  } catch (err) { next(err) }
})

// ─── TARIFF SIMULATION ────────────────────────────────────────────────────────

router.post("/simulate/tariff", requirePermission("business.*"), async (req, res, next) => {
  try {
    const data = z.object({ tariffId: z.string().uuid(), consumption: z.number() }).parse(req.body)
    const result = await applyTariff(data.tariffId, data.consumption, new Date().toISOString(), new Date().toISOString())
    auditLog(req, "simulate.tariff", { tariffId: data.tariffId })
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/simulate/invoice", requirePermission("business.*"), async (req, res, next) => {
  try {
    const data = z.object({ customerId: z.string().uuid(), consumption: z.number(), tariffId: z.string().uuid() }).parse(req.body)
    const tariff = await applyTariff(data.tariffId, data.consumption, new Date().toISOString(), new Date().toISOString())
    const invoice = await prisma.invoice.create({
      data: { number: `SIM-${Date.now()}`, customerId: data.customerId, amount: tariff.totalCharge, status: "pending", dueDate: new Date(Date.now() + 30 * 86400000) },
    })
    auditLog(req, "simulate.invoice", { customerId: data.customerId, invoiceId: invoice.id })
    res.json({ simulated: true, invoice, tariff })
  } catch (err) { next(err) }
})

export { router as businessRouter }







