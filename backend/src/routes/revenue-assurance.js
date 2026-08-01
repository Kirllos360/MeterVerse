import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { runRevenueAssurance, scoreFinding, seedRevenueRules } from "../services/revenue-assurance-engine.js"

const router = Router()
router.use(authenticate)

const ruleSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["PRE_BILL", "POST_BILL", "CONTINUOUS"]).default("POST_BILL"),
  entityType: z.enum(["invoice", "payment", "reading", "billrun", "customer"]).default("invoice"),
  condition: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  action: z.enum(["flag", "auto-fix", "block"]).default("flag"),
  expectedValue: z.number().nullable().optional(),
  tolerance: z.number().nullable().optional(),
  active: z.boolean().default(true),
  priority: z.number().int().default(0),
  runFrequency: z.enum(["on_demand", "nightly", "realtime"]).default("on_demand"),
})

const findingActionSchema = z.object({
  status: z.enum(["INVESTIGATING", "CONFIRMED", "FALSE_POSITIVE", "RESOLVED"]),
  resolutionNote: z.string().optional(),
})

const investigationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assignedTo: z.string().optional(),
})

// ─── Rules ───────────────────────────────────────────────────────────────────
router.get("/rules", requirePermission("revenue.rules.list"), async (req, res, next) => {
  try {
    const where = { archivedAt: null }
    if (req.query.category) where.category = String(req.query.category)
    if (req.query.active) where.active = req.query.active === "true"
    const rules = await prisma.revenueRule.findMany({ where, orderBy: [{ category: "asc" }, { priority: "asc" }] })
    res.json({ rules, total: rules.length })
  } catch (err) { next(err) }
})

router.post("/rules/seed", requirePermission("revenue.rules.create"), async (req, res, next) => {
  try {
    const count = await seedRevenueRules()
    auditLog(req, "revenue.rules.seeded", { count })
    res.status(201).json({ count })
  } catch (err) { next(err) }
})

router.post("/rules", requirePermission("revenue.rules.create"), async (req, res, next) => {
  try {
    const data = ruleSchema.parse(req.body)
    const existing = await prisma.revenueRule.findUnique({ where: { code: data.code } })
    if (existing) return res.status(409).json({ error: "Rule code already exists" })
    const rule = await prisma.revenueRule.create({ data: { ...data, createdBy: req.user?.id } })
    auditLog(req, "revenue.rule.created", { ruleId: rule.id, code: rule.code })
    res.status(201).json({ rule })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/rules/:id", requirePermission("revenue.rules.update"), async (req, res, next) => {
  try {
    const data = ruleSchema.partial().parse(req.body)
    const rule = await prisma.revenueRule.update({ where: { id: req.params.id }, data })
    auditLog(req, "revenue.rule.updated", { ruleId: rule.id })
    res.json({ rule })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/rules/:id", requirePermission("revenue.rules.delete"), async (req, res, next) => {
  try {
    await prisma.revenueRule.update({ where: { id: req.params.id }, data: { archivedAt: new Date(), active: false } })
    auditLog(req, "revenue.rule.archived", { ruleId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── Findings ────────────────────────────────────────────────────────────────
router.get("/findings", requirePermission("revenue.findings.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, severity, category, ruleId, customerId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = String(status)
    if (severity) where.severity = String(severity)
    if (ruleId) where.ruleId = String(ruleId)
    if (customerId) where.customerId = String(customerId)
    if (category) where.rule = { category: String(category) }
    const [findings, total] = await Promise.all([
      prisma.revenueLeakageFinding.findMany({
        where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)),
        orderBy: { detectedAt: "desc" },
        include: { rule: { select: { id: true, code: true, name: true, category: true } }, customer: { select: { id: true, name: true } } },
      }),
      prisma.revenueLeakageFinding.count({ where }),
    ])
    const scored = findings.map(f => ({ ...f, score: scoreFinding(f) }))
    res.json({ findings: scored, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/findings/:id", requirePermission("revenue.findings.list"), async (req, res, next) => {
  try {
    const finding = await prisma.revenueLeakageFinding.findUnique({ where: { id: req.params.id }, include: { rule: true, customer: { select: { id: true, name: true } }, investigations: true } })
    if (!finding) return res.status(404).json({ error: "Finding not found" })
    res.json({ finding: { ...finding, score: scoreFinding(finding) } })
  } catch (err) { next(err) }
})

router.patch("/findings/:id/status", requirePermission("revenue.findings.update"), async (req, res, next) => {
  try {
    const data = findingActionSchema.parse(req.body)
    const finding = await prisma.revenueLeakageFinding.update({
      where: { id: req.params.id },
      data: { status: data.status, resolutionNote: data.resolutionNote, resolvedAt: data.status === "RESOLVED" ? new Date() : null, resolvedBy: data.status === "RESOLVED" ? req.user?.id : null },
    })
    auditLog(req, "revenue.finding.updated", { findingId: finding.id, status: data.status })
    res.json({ finding })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Investigations ──────────────────────────────────────────────────────────
router.post("/findings/:id/investigations", requirePermission("revenue.investigations.create"), async (req, res, next) => {
  try {
    const data = investigationSchema.parse(req.body)
    const finding = await prisma.revenueLeakageFinding.findUnique({ where: { id: req.params.id } })
    if (!finding) return res.status(404).json({ error: "Finding not found" })
    const investigation = await prisma.revenueInvestigation.create({
      data: { findingId: finding.id, title: data.title, description: data.description, priority: data.priority, assignedTo: data.assignedTo, createdBy: req.user?.id },
    })
    await prisma.revenueLeakageFinding.update({ where: { id: finding.id }, data: { status: "INVESTIGATING", investigationId: investigation.id } })
    auditLog(req, "revenue.investigation.created", { investigationId: investigation.id, findingId: finding.id })
    res.status(201).json({ investigation })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.patch("/investigations/:id", requirePermission("revenue.investigations.update"), async (req, res, next) => {
  try {
    const data = z.object({
      status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
      outcome: z.string().optional(),
      resolution: z.string().optional(),
    }).parse(req.body)
    const inv = await prisma.revenueInvestigation.update({
      where: { id: req.params.id },
      data: { ...data, completedAt: data.status === "RESOLVED" || data.status === "CLOSED" ? new Date() : null },
    })
    if (inv.status === "RESOLVED" || inv.status === "CLOSED") {
      await prisma.revenueLeakageFinding.update({ where: { id: inv.findingId }, data: { status: "RESOLVED", resolvedAt: new Date(), resolutionNote: data.resolution } })
    }
    auditLog(req, "revenue.investigation.updated", { investigationId: inv.id, status: data.status })
    res.json({ investigation: inv })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Run checks ──────────────────────────────────────────────────────────────
router.post("/run", requirePermission("revenue.run"), async (req, res, next) => {
  try {
    const { category, invoiceId, customerId } = z.object({
      category: z.enum(["PRE_BILL", "POST_BILL", "CONTINUOUS"]).optional(),
      invoiceId: z.string().optional(),
      customerId: z.string().optional(),
    }).parse(req.body)
    const result = await runRevenueAssurance({ category, invoiceId, customerId })
    auditLog(req, "revenue.run", { category: category || "ALL", checks: result.checks, findings: result.findings })
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Summary / dashboard ─────────────────────────────────────────────────────
router.get("/summary", requirePermission("revenue.findings.list"), async (req, res, next) => {
  try {
    const [open, investigating, confirmed, falsePositives, resolved, totalLeakage, ruleCount] = await Promise.all([
      prisma.revenueLeakageFinding.count({ where: { status: "OPEN", archivedAt: null } }),
      prisma.revenueLeakageFinding.count({ where: { status: "INVESTIGATING", archivedAt: null } }),
      prisma.revenueLeakageFinding.count({ where: { status: "CONFIRMED", archivedAt: null } }),
      prisma.revenueLeakageFinding.count({ where: { status: "FALSE_POSITIVE", archivedAt: null } }),
      prisma.revenueLeakageFinding.count({ where: { status: "RESOLVED", archivedAt: null } }),
      prisma.revenueLeakageFinding.aggregate({ where: { status: "CONFIRMED", archivedAt: null }, _sum: { varianceAmount: true } }),
      prisma.revenueRule.count({ where: { active: true, archivedAt: null } }),
    ])
    res.json({ open, investigating, confirmed, falsePositives, resolved, totalFindings: open + investigating + confirmed + falsePositives + resolved, estimatedLeakage: totalLeakage._sum?.varianceAmount || 0, activeRules: ruleCount })
  } catch (err) { next(err) }
})

export { router as revenueAssuranceRouter }
