import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { postEvent, reverseEvent } from "../services/posting-engine.js"

const router = Router()
router.use(authenticate)

const mappingSchema = z.object({
  name: z.string().min(1),
  transactionType: z.enum(["INVOICE_ISSUED", "PAYMENT_RECEIVED", "INVOICE_CANCELLED", "PAYMENT_REVERSED", "INVOICE_ADJUSTED"]),
  debitAccountId: z.string().min(1),
  creditAccountId: z.string().min(1),
  condition: z.string().optional(),
  priority: z.number().int().default(100),
  active: z.boolean().default(true),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().nullable().optional(),
})

const eventSchema = z.object({
  sourceType: z.enum(["INVOICE", "PAYMENT"]),
  sourceId: z.string().min(1),
  eventType: z.enum(["INVOICE_ISSUED", "PAYMENT_RECEIVED", "INVOICE_CANCELLED", "PAYMENT_REVERSED", "INVOICE_ADJUSTED"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  context: z.record(z.any()).optional(),
})

// ─── AccountMappings ────────────────────────────────────────────────────────
router.get("/account-mappings", requirePermission("accounting.mappings.list"), async (req, res, next) => {
  try {
    const where = { archivedAt: null }
    if (req.query.transactionType) where.transactionType = String(req.query.transactionType)
    if (req.query.active) where.active = req.query.active === "true"
    const mappings = await prisma.accountMapping.findMany({
      where,
      include: { debitAccount: { select: { id: true, code: true, name: true } }, creditAccount: { select: { id: true, code: true, name: true } } },
      orderBy: [{ transactionType: "asc" }, { priority: "asc" }],
    })
    res.json({ mappings })
  } catch (err) { next(err) }
})

router.post("/account-mappings", requirePermission("accounting.mappings.create"), async (req, res, next) => {
  try {
    const data = mappingSchema.parse(req.body)
    const [debit, credit] = await Promise.all([
      prisma.account.findUnique({ where: { id: data.debitAccountId } }),
      prisma.account.findUnique({ where: { id: data.creditAccountId } }),
    ])
    if (!debit || !credit) return res.status(400).json({ error: "Debit or credit account not found" })
    const mapping = await prisma.accountMapping.create({
      data: {
        name: data.name,
        transactionType: data.transactionType,
        debitAccountId: data.debitAccountId,
        creditAccountId: data.creditAccountId,
        condition: data.condition,
        priority: data.priority,
        active: data.active,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        createdBy: req.user?.id,
      },
    })
    auditLog(req, "accountMapping.created", { mappingId: mapping.id, transactionType: data.transactionType })
    res.status(201).json({ mapping })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/account-mappings/:id", requirePermission("accounting.mappings.update"), async (req, res, next) => {
  try {
    const data = mappingSchema.partial().parse(req.body)
    const mapping = await prisma.accountMapping.update({
      where: { id: req.params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.transactionType && { transactionType: data.transactionType }),
        ...(data.debitAccountId && { debitAccountId: data.debitAccountId }),
        ...(data.creditAccountId && { creditAccountId: data.creditAccountId }),
        ...(data.condition !== undefined && { condition: data.condition }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.effectiveFrom && { effectiveFrom: new Date(data.effectiveFrom) }),
        ...(data.effectiveTo !== undefined && { effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null }),
      },
    })
    auditLog(req, "accountMapping.updated", { mappingId: mapping.id })
    res.json({ mapping })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/account-mappings/:id", requirePermission("accounting.mappings.delete"), async (req, res, next) => {
  try {
    await prisma.accountMapping.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "accountMapping.archived", { mappingId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── FinancialEvents ────────────────────────────────────────────────────────
router.get("/events", requirePermission("accounting.events.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, eventType, periodId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = String(status)
    if (eventType) where.eventType = String(eventType)
    if (periodId) where.periodId = String(periodId)
    const [events, total] = await Promise.all([
      prisma.financialEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(100, Number(limit)),
        orderBy: { createdAt: "desc" },
        include: { period: { select: { id: true, year: true, month: true } }, journalEntry: { select: { id: true, entryNumber: true, status: true } } },
      }),
      prisma.financialEvent.count({ where }),
    ])
    res.json({ events, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.post("/events/post", requirePermission("accounting.events.post"), async (req, res, next) => {
  try {
    const data = eventSchema.parse(req.body)
    const result = await postEvent({
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      eventType: data.eventType,
      amount: data.amount,
      description: data.description,
      context: data.context || {},
    })
    if (!result.ok) {
      auditLog(req, "financialEvent.failed", { sourceType: data.sourceType, sourceId: data.sourceId, eventType: data.eventType, reason: result.reason || result.error })
      return res.status(400).json({ error: result.reason || result.error, skipped: result.skipped })
    }
    auditLog(req, "financialEvent.posted", { eventId: result.event.id, journalId: result.journalEntry.id, amount: data.amount })
    res.status(201).json({ event: result.event, journalEntry: result.journalEntry })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/events/:id/retry", requirePermission("accounting.events.post"), async (req, res, next) => {
  try {
    const event = await prisma.financialEvent.findUnique({ where: { id: req.params.id } })
    if (!event) return res.status(404).json({ error: "Event not found" })
    if (event.status === "POSTED") return res.status(400).json({ error: "Event already posted" })
    const result = await postEvent({
      sourceType: event.sourceType,
      sourceId: event.sourceId,
      eventType: event.eventType,
      amount: event.amount,
      description: event.description,
      context: event.metadata ? JSON.parse(event.metadata) : {},
    })
    if (!result.ok) return res.status(400).json({ error: result.reason || result.error })
    auditLog(req, "financialEvent.retried", { eventId: event.id, journalId: result.journalEntry.id })
    res.json({ event: result.event, journalEntry: result.journalEntry })
  } catch (err) { next(err) }
})

// ─── Audit trail for financial integration ──────────────────────────────────
router.get("/audit-trail", requirePermission("accounting.events.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sourceType, sourceId } = req.query
    const where = { sourceType: { not: undefined } }
    if (sourceType) where.sourceType = String(sourceType)
    if (sourceId) where.sourceId = String(sourceId)
    const [events, total] = await Promise.all([
      prisma.financialEvent.findMany({
        where: { ...where, archivedAt: null },
        skip: (page - 1) * limit,
        take: Math.min(100, Number(limit)),
        orderBy: { createdAt: "desc" },
        include: { journalEntry: { select: { id: true, entryNumber: true, status: true } } },
      }),
      prisma.financialEvent.count({ where: { ...where, archivedAt: null } }),
    ])
    res.json({ events, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// ─── Summary ────────────────────────────────────────────────────────────────
router.get("/summary", requirePermission("accounting.events.list"), async (req, res, next) => {
  try {
    const [posted, failed, pending, mappings] = await Promise.all([
      prisma.financialEvent.count({ where: { status: "POSTED", archivedAt: null } }),
      prisma.financialEvent.count({ where: { status: "FAILED", archivedAt: null } }),
      prisma.financialEvent.count({ where: { status: "PENDING", archivedAt: null } }),
      prisma.accountMapping.count({ where: { active: true, archivedAt: null } }),
    ])
    res.json({ posted, failed, pending, activeMappings: mappings, total: posted + failed + pending })
  } catch (err) { next(err) }
})

export { router as financialIntegrationRouter }
