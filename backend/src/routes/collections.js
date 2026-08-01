import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { computeRiskScore, riskBandFromScore, runDunning, computeProvisions } from "../services/collections-engine.js"

const router = Router()
router.use(authenticate)

const ptpSchema = z.object({ promisedDate: z.string().min(1), promisedAmount: z.number().positive(), notes: z.string().optional() })
const planSchema = z.object({
  totalAmount: z.number().positive(),
  downPayment: z.number().min(0).default(0),
  installments: z.number().int().min(1).max(24).default(1),
  frequencyDays: z.number().int().min(7).default(30),
  startDate: z.string().optional(),
})
const disputeSchema = z.object({ invoiceId: z.string().optional(), reason: z.string().min(1), amount: z.number().positive() })
const writeOffSchema = z.object({ invoiceId: z.string().optional(), collectionCaseId: z.string().optional(), amount: z.number().positive(), reason: z.string().min(1) })
const provisionRuleSchema = z.object({ name: z.string().min(1), code: z.string().min(1), bucketDays: z.number().int().min(1), provisionPct: z.number().min(0).max(100), active: z.boolean().default(true) })
const dunningRuleSchema = z.object({ name: z.string().min(1), code: z.string().min(1), stage: z.number().int().min(1), minDays: z.number().int().min(0), maxDays: z.number().int().nullable().default(null), action: z.string().default("REMINDER"), channel: z.string().nullable().default(null), message: z.string().nullable().default(null), active: z.boolean().default(true) })

// ─── Risk profiles ───────────────────────────────────────────────────────────
router.get("/risk-profiles", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { band } = req.query
    const where = {}
    if (band) where.riskBand = String(band)
    const profiles = await prisma.customerRiskProfile.findMany({ where, include: { customer: { select: { id: true, name: true } } }, orderBy: { riskScore: "desc" } })
    res.json({ profiles })
  } catch (err) { next(err) }
})

router.post("/risk-profiles/compute", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ where: { archivedAt: null }, take: 200 })
    let updated = 0
    for (const cust of customers) {
      const invoices = await prisma.invoice.findMany({ where: { customerId: cust.id, status: { in: ["issued", "overdue", "partial"] }, archivedAt: null } })
      const now = new Date()
      const overdueInvoices = invoices.filter(i => i.dueDate && i.dueDate < now)
      const totalOwing = overdueInvoices.reduce((s, i) => s + (i.amount - (i.paidAmount || 0)), 0)
      const maxAging = overdueInvoices.reduce((m, i) => Math.max(m, Math.floor((now - i.dueDate) / 86400000)), 0)
      const promises = await prisma.promiseToPay.findMany({ where: { collectionCase: { customerId: cust.id } }, take: 50 })
      const kept = promises.filter(p => p.status === "kept").length
      const lastPayment = await prisma.payment.findFirst({ where: { customerId: cust.id, status: "completed" }, orderBy: { createdAt: "desc" } })
      const score = computeRiskScore({ agingDays: maxAging, totalOwing, overdueCount: overdueInvoices.length, promiseKeptRate: promises.length ? kept / promises.length : 1, lastPaymentDaysAgo: lastPayment ? Math.floor((now - lastPayment.createdAt) / 86400000) : null })
      const band = riskBandFromScore(score)
      const existing = await prisma.customerRiskProfile.findUnique({ where: { customerId: cust.id } })
      if (existing) {
        await prisma.customerRiskProfile.update({ where: { customerId: cust.id }, data: { riskScore: score, riskBand: band, agingDays: maxAging, totalOwing, overdueCount: overdueInvoices.length, computedAt: now } })
      } else {
        await prisma.customerRiskProfile.create({ data: { customerId: cust.id, riskScore: score, riskBand: band, agingDays: maxAging, totalOwing, overdueCount: overdueInvoices.length } })
      }
      updated++
    }
    auditLog(req, "collections.risk.computed", { customers: updated })
    res.json({ updated })
  } catch (err) { next(err) }
})

// ─── Dunning rules + engine ──────────────────────────────────────────────────
router.get("/dunning-rules", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const rules = await prisma.dunningRule.findMany({ where: { archivedAt: null }, orderBy: { stage: "asc" } })
    res.json({ rules })
  } catch (err) { next(err) }
})

router.post("/dunning-rules", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = dunningRuleSchema.parse(req.body)
    const rule = await prisma.dunningRule.create({ data })
    auditLog(req, "collections.dunning.rule.created", { ruleId: rule.id })
    res.status(201).json({ rule })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/dunning/run", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const result = await runDunning()
    auditLog(req, "collections.dunning.run", { scanned: result.scanned, planned: result.planned.length })
    res.json(result)
  } catch (err) { next(err) }
})

// ─── Promise-to-pay ──────────────────────────────────────────────────────────
router.post("/cases/:caseId/promise", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = ptpSchema.parse(req.body)
    const caseRecord = await prisma.collectionCase.findUnique({ where: { id: req.params.caseId } })
    if (!caseRecord) return res.status(404).json({ error: "Collection case not found" })
    const promise = await prisma.promiseToPay.create({ data: { collectionCaseId: caseRecord.id, promisedDate: new Date(data.promisedDate), promisedAmount: data.promisedAmount, notes: data.notes, status: "pending" } })
    auditLog(req, "collections.ptp.created", { caseId: caseRecord.id, promiseId: promise.id })
    res.status(201).json({ promise })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.patch("/promises/:id", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(["kept", "broken", "cancelled"]), notes: z.string().optional() }).parse(req.body)
    const promise = await prisma.promiseToPay.update({ where: { id: req.params.id }, data: { status: data.status, keptAt: data.status === "kept" ? new Date() : null, notes: data.notes } })
    auditLog(req, "collections.ptp.updated", { promiseId: promise.id, status: data.status })
    res.json({ promise })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Installment plans ───────────────────────────────────────────────────────
router.get("/plans", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { status, customerId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = String(status)
    if (customerId) where.customerId = String(customerId)
    const plans = await prisma.installmentPlan.findMany({ where, include: { customer: { select: { id: true, name: true } }, planInstallments: true }, orderBy: { createdAt: "desc" } })
    res.json({ plans })
  } catch (err) { next(err) }
})

router.post("/customers/:customerId/plans", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = planSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: req.params.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    const start = data.startDate ? new Date(data.startDate) : new Date()
    const plan = await prisma.$transaction(async (tx) => {
      const p = await tx.installmentPlan.create({
        data: { customerId: customer.id, totalAmount: data.totalAmount, downPayment: data.downPayment, installments: data.installments, frequencyDays: data.frequencyDays, startDate: start, status: "ACTIVE" },
      })
      const netAmount = data.totalAmount - data.downPayment
      const each = Math.round(netAmount / data.installments * 100) / 100
      for (let i = 0; i < data.installments; i++) {
        const amount = i === data.installments - 1 ? Math.round((netAmount - each * i) * 100) / 100 : each
        await tx.planInstallment.create({ data: { planId: p.id, sequence: i + 1, dueDate: new Date(start.getTime() + (i + 1) * data.frequencyDays * 86400000), amount, status: "PENDING" } })
      }
      return tx.installmentPlan.findUnique({ where: { id: p.id }, include: { planInstallments: true } })
    })
    auditLog(req, "collections.plan.created", { customerId: customer.id, planId: plan.id })
    res.status(201).json({ plan })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/plans/:id/pay", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { installmentId, amount } = z.object({ installmentId: z.string(), amount: z.number().positive() }).parse(req.body)
    const installment = await prisma.planInstallment.findUnique({ where: { id: installmentId } })
    if (!installment) return res.status(404).json({ error: "Installment not found" })
    const paidAmount = installment.paidAmount + amount
    const status = paidAmount >= installment.amount ? "PAID" : "PARTIAL"
    await prisma.planInstallment.update({ where: { id: installmentId }, data: { paidAmount, status, paidAt: status === "PAID" ? new Date() : null } })
    const planAgg = await prisma.planInstallment.aggregate({ where: { planId: installment.planId }, _sum: { paidAmount: true } })
    const plan = await prisma.installmentPlan.update({ where: { id: installment.planId }, data: { paidAmount: planAgg._sum.paidAmount || 0 } })
    auditLog(req, "collections.plan.installment.paid", { planId: plan.id, installmentId, amount })
    res.json({ installment: { ...installment, paidAmount, status }, plan })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Disputes ────────────────────────────────────────────────────────────────
router.get("/disputes", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { status } = req.query
    const disputes = await prisma.dispute.findMany({ where: status ? { status: String(status) } : {}, include: { customer: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } })
    res.json({ disputes })
  } catch (err) { next(err) }
})

router.post("/customers/:customerId/disputes", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = disputeSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: req.params.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    const dispute = await prisma.dispute.create({ data: { customerId: customer.id, invoiceId: data.invoiceId, reason: data.reason, amount: data.amount, status: "OPEN" } })
    auditLog(req, "collections.dispute.created", { disputeId: dispute.id, customerId: customer.id })
    res.status(201).json({ dispute })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.patch("/disputes/:id", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"]), resolution: z.string().optional() }).parse(req.body)
    const dispute = await prisma.dispute.update({ where: { id: req.params.id }, data: { status: data.status, resolution: data.resolution, resolvedBy: req.user?.id, resolvedAt: ["APPROVED", "REJECTED", "CLOSED"].includes(data.status) ? new Date() : null } })
    auditLog(req, "collections.dispute.updated", { disputeId: dispute.id, status: data.status })
    res.json({ dispute })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Provisions + write-offs ─────────────────────────────────────────────────
router.get("/provision-rules", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const rules = await prisma.provisionRule.findMany({ where: { archivedAt: null }, orderBy: { bucketDays: "asc" } })
    res.json({ rules })
  } catch (err) { next(err) }
})

router.post("/provision-rules", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = provisionRuleSchema.parse(req.body)
    const rule = await prisma.provisionRule.create({ data })
    auditLog(req, "collections.provision.rule.created", { ruleId: rule.id })
    res.status(201).json({ rule })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/provisions/compute", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const result = await computeProvisions()
    auditLog(req, "collections.provision.computed", { total: result.total })
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/provisions", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { period } = req.query
    const provisions = await prisma.badDebtProvision.findMany({ where: period ? { period: String(period) } : {}, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ provisions })
  } catch (err) { next(err) }
})

router.post("/write-offs", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = writeOffSchema.parse(req.body)
    const request = await prisma.writeOffRequest.create({ data: { ...data, status: "PENDING", createdBy: req.user?.id } })
    auditLog(req, "collections.writeoff.requested", { requestId: request.id, amount: data.amount })
    res.status(201).json({ request })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/write-offs", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const { status } = req.query
    const requests = await prisma.writeOffRequest.findMany({ where: status ? { status: String(status) } : {}, include: { customer: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } })
    res.json({ requests })
  } catch (err) { next(err) }
})

router.patch("/write-offs/:id", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(["APPROVED", "REJECTED", "EXECUTED"]), notes: z.string().optional() }).parse(req.body)
    const reqRecord = await prisma.writeOffRequest.findUnique({ where: { id: req.params.id } })
    if (!reqRecord) return res.status(404).json({ error: "Write-off request not found" })
    const request = await prisma.writeOffRequest.update({
      where: { id: req.params.id },
      data: { status: data.status, notes: data.notes, approvedBy: data.status === "APPROVED" ? req.user?.id : null, approvedAt: data.status === "APPROVED" ? new Date() : null, executedAt: data.status === "EXECUTED" ? new Date() : null },
    })
    if (data.status === "EXECUTED" && reqRecord.invoiceId) {
      await prisma.invoice.update({ where: { id: reqRecord.invoiceId }, data: { status: "written_off" } })
    }
    auditLog(req, "collections.writeoff.updated", { requestId: request.id, status: data.status })
    res.json({ request })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Workbench / summary ─────────────────────────────────────────────────────
router.get("/summary", requirePermission("collections.*"), async (req, res, next) => {
  try {
    const [openCases, highRisk, activePlans, pendingWriteOffs, openDisputes, overdueTotal] = await Promise.all([
      prisma.collectionCase.count({ where: { status: "open", archivedAt: null } }),
      prisma.customerRiskProfile.count({ where: { riskBand: { in: ["HIGH", "CRITICAL"] } } }),
      prisma.installmentPlan.count({ where: { status: "ACTIVE", archivedAt: null } }),
      prisma.writeOffRequest.count({ where: { status: "PENDING" } }),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      prisma.invoice.aggregate({ where: { status: { in: ["issued", "overdue", "partial"] }, archivedAt: null, dueDate: { lt: new Date() } }, _sum: { amount: true } }),
    ])
    res.json({ openCases, highRisk, activePlans, pendingWriteOffs, openDisputes, overdueTotal: overdueTotal._sum?.amount || 0 })
  } catch (err) { next(err) }
})

export { router as collectionsRouter }
