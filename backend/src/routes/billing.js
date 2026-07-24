import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const billRunSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  description: z.string().optional(),
})

router.post("/runs", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const { periodStart, periodEnd, description } = billRunSchema.parse(req.body)
    const existing = await prisma.billRun.findFirst({
      where: { periodStart: new Date(periodStart), periodEnd: new Date(periodEnd), status: { not: "cancelled" } },
    })
    if (existing) return res.status(409).json({ error: "Bill run already exists for this period", existingRunId: existing.id })
    const run = await prisma.billRun.create({
      data: { periodStart: new Date(periodStart), periodEnd: new Date(periodEnd), status: "open", description, totalCount: 0, totalAmount: 0 },
    })
    await prisma.billRunHistory.create({ data: { billRunId: run.id, action: "created", details: `Bill run ${run.id} opened for ${periodStart} to ${periodEnd}` } })
    auditLog(req, "billing.billrun.created", { billRunId: run.id, periodStart, periodEnd })
    res.status(201).json({ billRun: run })
  } catch (err) { next(err) }
})

router.post("/runs/:id/generate", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const run = await prisma.billRun.findUnique({ where: { id: req.params.id } })
    if (!run) return res.status(404).json({ error: "Bill run not found" })
    if (run.status !== "open") return res.status(400).json({ error: `Bill run is ${run.status}, not open` })

    const customers = await prisma.customer.findMany({ where: { status: "active" }, include: { meterAssignments: { where: { endAt: null }, include: { meter: { include: { tariffs: { include: { tariff: { include: { rates: true, tiers: true } } } } } } } } })
    let totalInvoices = 0; let totalAmount = 0
    for (const customer of customers) {
      for (const assignment of customer.meterAssignments) {
        const tariffLink = assignment.meter?.tariffs?.[0]
        if (!tariffLink?.tariff) continue
        const tariff = tariffLink.tariff
        const readings = await prisma.reading.findMany({ where: { meterId: assignment.meterId, timestamp: { gte: run.periodStart, lte: run.periodEnd }, status: "valid" }, orderBy: { timestamp: "asc" } })
        if (readings.length < 2) continue
        const consumption = Math.max(0, readings[readings.length - 1].value - readings[0].value)
        const sortedTiers = (tariff.tiers || []).sort((a, b) => a.priority - b.priority)
        let totalCharge = 0; let remaining = consumption
        for (const tier of sortedTiers) {
          const max = tier.maxValue ?? remaining; const min = tier.minValue ?? 0
          const tc = Math.min(remaining, Math.max(0, max - min))
          if (tc <= 0) continue; totalCharge += tc * tier.rate; remaining -= tc; if (remaining <= 0) break
        }
        for (const rate of tariff.rates || []) totalCharge += consumption * rate.rate
        if (totalCharge <= 0) continue
        const invoice = await prisma.invoice.create({
          data: { number: `INV-${run.id.slice(0, 8)}-${String(totalInvoices + 1).padStart(4, "0")}`, customerId: customer.id, amount: totalCharge, status: "pending", dueDate: new Date(Date.now() + 30 * 86400000), issuedAt: new Date(), billRunId: run.id },
        })
        totalInvoices++; totalAmount += totalCharge
      }
    }
    await prisma.billRun.update({ where: { id: run.id }, data: { totalCount: totalInvoices, totalAmount, status: "completed", completedAt: new Date() } })
    await prisma.billRunHistory.create({ data: { billRunId: run.id, action: "completed", details: `Generated ${totalInvoices} invoices totaling ${totalAmount}` } })
    auditLog(req, "billing.billrun.generated", { billRunId: run.id, totalInvoices, totalAmount })
    res.json({ billRunId: run.id, totalInvoices, totalAmount, status: "completed" })
  } catch (err) { next(err) }
})

router.post("/runs/:id/close", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const run = await prisma.billRun.findUnique({ where: { id: req.params.id } })
    if (!run) return res.status(404).json({ error: "Bill run not found" })
    if (run.status !== "completed") return res.status(400).json({ error: "Can only close a completed bill run" })
    await prisma.billRun.update({ where: { id: run.id }, data: { status: "closed" } })
    await prisma.billRunHistory.create({ data: { billRunId: run.id, action: "closed", details: "Bill run closed" } })
    auditLog(req, "billing.billrun.closed", { billRunId: run.id })
    res.json({ message: "Bill run closed" })
  } catch (err) { next(err) }
})

router.post("/runs/:id/cancel", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body)
    const run = await prisma.billRun.findUnique({ where: { id: req.params.id } })
    if (!run) return res.status(404).json({ error: "Bill run not found" })
    await prisma.billRun.update({ where: { id: run.id }, data: { status: "cancelled" } })
    await prisma.billRunHistory.create({ data: { billRunId: run.id, action: "cancelled", details: reason } })
    auditLog(req, "billing.billrun.cancelled", { billRunId: run.id, reason })
    res.json({ message: "Bill run cancelled" })
  } catch (err) { next(err) }
})

router.get("/runs", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const runs = await prisma.billRun.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ billRuns: runs })
  } catch (err) { next(err) }
})

router.get("/runs/:id", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const run = await prisma.billRun.findUnique({ where: { id: req.params.id }, include: { history: { orderBy: { createdAt: "asc" } } } })
    if (!run) return res.status(404).json({ error: "Bill run not found" })
    res.json({ billRun: run })
  } catch (err) { next(err) }
})

export { router as billingRouter }
