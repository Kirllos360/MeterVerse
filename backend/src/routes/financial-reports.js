import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { buildPnl, buildBalanceSheet, buildCashFlow, buildArAging, buildBvA, computeRatios, captureSnapshot } from "../services/financial-reporting-engine.js"

const router = Router()
router.use(authenticate)

const budgetSchema = z.object({
  name: z.string().min(1),
  periodKey: z.string().regex(/^\d{4}-\d{2}$/),
  accountCode: z.string().optional(),
  category: z.enum(["OPERATING", "CAPEX", "FINANCING"]).default("OPERATING"),
  amount: z.number(),
  frequency: z.string().default("MONTHLY"),
})

const snapshotSchema = z.object({ periodKey: z.string().regex(/^\d{4}-\d{2}$/) })
const noteSchema = z.object({ reportType: z.string().min(1), periodKey: z.string().min(1), title: z.string().min(1), content: z.string().min(1) })
const scheduleSchema = z.object({ name: z.string().min(1), reportType: z.enum(["PNL", "BALANCE_SHEET", "CASH_FLOW", "AGING", "BVA"]), frequency: z.string().default("MONTHLY"), recipients: z.string().optional(), active: z.boolean().default(true) })
const ifrsSchema = z.object({ ifrsCode: z.string().min(1), description: z.string().min(1), accountCode: z.string().optional(), accountType: z.string().optional(), category: z.enum(["REVENUE", "EXPENSE", "ASSET", "LIABILITY", "EQUITY"]).default("UNCATEGORIZED"), mapping: z.string().optional() })

function periodKey() { return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}` }

// ─── Statements ──────────────────────────────────────────────────────────────
router.get("/pnl", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const key = req.query.periodKey || periodKey()
    const result = await buildPnl(key)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/balance-sheet", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const key = req.query.periodKey || periodKey()
    const result = await buildBalanceSheet(key)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/cash-flow", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const key = req.query.periodKey || periodKey()
    const result = await buildCashFlow(key)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/aging", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const result = await buildArAging()
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/bva", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const key = req.query.periodKey || periodKey()
    const result = await buildBvA(key)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/ratios", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const key = req.query.periodKey || periodKey()
    const result = await computeRatios(key)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/snapshots", requirePermission("reporting.financial.create"), async (req, res, next) => {
  try {
    const data = snapshotSchema.parse(req.body)
    const snapshot = await captureSnapshot(data.periodKey)
    auditLog(req, "reporting.snapshot.captured", { periodKey: data.periodKey })
    res.status(201).json({ snapshot })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/snapshots", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const snapshots = await prisma.financialSnapshot.findMany({ orderBy: { periodKey: "desc" }, take: 100 })
    res.json({ snapshots })
  } catch (err) { next(err) }
})

router.get("/snapshots/:id", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const snapshot = await prisma.financialSnapshot.findUnique({ where: { id: req.params.id } })
    if (!snapshot) return res.status(404).json({ error: "Snapshot not found" })
    res.json({ snapshot: { ...snapshot, data: JSON.parse(snapshot.data) } })
  } catch (err) { next(err) }
})

// ─── Budgets ─────────────────────────────────────────────────────────────────
router.get("/budgets", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { periodKey } = req.query
    const budgets = await prisma.budget.findMany({ where: { archivedAt: null, ...(periodKey ? { periodKey: String(periodKey) } : {}) }, orderBy: { periodKey: "desc" } })
    res.json({ budgets })
  } catch (err) { next(err) }
})

router.post("/budgets", requirePermission("reporting.financial.create"), async (req, res, next) => {
  try {
    const data = budgetSchema.parse(req.body)
    const budget = await prisma.budget.create({ data: { ...data, createdBy: req.user?.id } })
    auditLog(req, "reporting.budget.created", { budgetId: budget.id })
    res.status(201).json({ budget })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/budget-vs-actual", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { periodKey } = req.query
    const rows = await prisma.budgetVsActual.findMany({ where: periodKey ? { periodKey: String(periodKey) } : {}, orderBy: { periodKey: "desc" }, take: 100 })
    res.json({ rows })
  } catch (err) { next(err) }
})

// ─── Ratios, notes, schedules, IFRS, segments ───────────────────────────────
router.get("/ratios/history", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { code } = req.query
    const ratios = await prisma.financialRatio.findMany({ where: code ? { code: String(code) } : {}, orderBy: { periodKey: "desc" }, take: 100 })
    res.json({ ratios })
  } catch (err) { next(err) }
})

router.get("/notes", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { reportType, periodKey } = req.query
    const notes = await prisma.financialNote.findMany({ where: { ...(reportType ? { reportType: String(reportType) } : {}), ...(periodKey ? { periodKey: String(periodKey) } : {}) }, orderBy: { createdAt: "desc" } })
    res.json({ notes })
  } catch (err) { next(err) }
})

router.post("/notes", requirePermission("reporting.financial.create"), async (req, res, next) => {
  try {
    const data = noteSchema.parse(req.body)
    const note = await prisma.financialNote.create({ data: { ...data, createdBy: req.user?.id } })
    auditLog(req, "reporting.note.created", { noteId: note.id })
    res.status(201).json({ note })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/schedules", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const schedules = await prisma.reportSchedule.findMany({ where: { archivedAt: null } })
    res.json({ schedules })
  } catch (err) { next(err) }
})

router.post("/schedules", requirePermission("reporting.financial.create"), async (req, res, next) => {
  try {
    const data = scheduleSchema.parse(req.body)
    const schedule = await prisma.reportSchedule.create({ data: { ...data, createdBy: req.user?.id } })
    auditLog(req, "reporting.schedule.created", { scheduleId: schedule.id })
    res.status(201).json({ schedule })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/ifrs", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { category } = req.query
    const mappings = await prisma.iFRSMapping.findMany({ where: category ? { category: String(category) } : {}, orderBy: { ifrsCode: "asc" } })
    res.json({ mappings })
  } catch (err) { next(err) }
})

router.post("/ifrs", requirePermission("reporting.financial.create"), async (req, res, next) => {
  try {
    const data = ifrsSchema.parse(req.body)
    const mapping = await prisma.iFRSMapping.create({ data })
    auditLog(req, "reporting.ifrs.created", { mappingId: mapping.id, ifrsCode: mapping.ifrsCode })
    res.status(201).json({ mapping })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/segments", requirePermission("reporting.financial.list"), async (req, res, next) => {
  try {
    const { segmentType, periodKey } = req.query
    const segments = await prisma.segmentPerformance.findMany({ where: { ...(segmentType ? { segmentType: String(segmentType) } : {}), ...(periodKey ? { periodKey: String(periodKey) } : {}) }, orderBy: { revenue: "desc" }, take: 100 })
    res.json({ segments })
  } catch (err) { next(err) }
})

export { router as financialReportsRouter }
