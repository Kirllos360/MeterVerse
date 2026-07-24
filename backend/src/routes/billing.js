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

    const customers = await prisma.customer.findMany({ where: { status: "active" }, select: { id: true, name: true } })
    const tariffData = await prisma.tariff.findMany({ where: { status: "active" }, include: { rates: true, tiers: true } })
    let totalInvoices = 0; let totalAmount = 0
    for (const customer of customers) {
      const assignments = await prisma.meterAssignment.findMany({ where: { customerId: customer.id, endAt: null }, include: { meter: true } })
      for (const assignment of assignments) {
        const tariff = tariffData[0]
        if (!tariff) continue
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

// ─── INVOICE CANCELLATION ──────────────────────────────────────────────

router.post("/invoices/:id/cancel", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body)
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.status === "paid") return res.status(400).json({ error: "Cannot cancel a paid invoice" })
    if (invoice.status === "cancelled") return res.status(400).json({ error: "Invoice already cancelled" })
    if (invoice.status === "archived") return res.status(400).json({ error: "Cannot cancel an archived invoice" })

    const highRisk = invoice.amount > 10000 || invoice.status === "overdue"
    if (highRisk && req.user?.role !== "super_admin") {
      return res.status(403).json({ error: "High-risk invoice cancellation requires super_admin approval", amount: invoice.amount })
    }

    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "cancelled" } })
    await prisma.billRunHistory.create({ data: { billRunId: invoice.billRunId || "", action: "invoice_cancelled", details: `Invoice ${invoice.number} cancelled: ${reason}` } })
    auditLog(req, "billing.invoice.cancelled", { invoiceId: invoice.id, number: invoice.number, reason, highRisk })
    res.json({ message: "Invoice cancelled", invoiceId: invoice.id })
  } catch (err) { next(err) }
})

// ─── APPROVAL WORKFLOW ──────────────────────────────────────────────────

router.post("/invoices/:id/approve", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.status !== "pending_approval") return res.status(400).json({ error: `Invoice is ${invoice.status}, not pending_approval` })
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "approved" } })
    auditLog(req, "billing.invoice.approved", { invoiceId: invoice.id, number: invoice.number })
    res.json({ message: "Invoice approved" })
  } catch (err) { next(err) }
})

router.post("/invoices/:id/reject", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body)
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.status !== "pending_approval") return res.status(400).json({ error: `Invoice is ${invoice.status}, not pending_approval` })
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "draft" } })
    auditLog(req, "billing.invoice.rejected", { invoiceId: invoice.id, reason })
    res.json({ message: "Invoice rejected, returned to draft" })
  } catch (err) { next(err) }
})

export { router as billingRouter }
