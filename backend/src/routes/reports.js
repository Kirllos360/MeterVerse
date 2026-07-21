import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── OPERATIONAL REPORTS ──────────────────────────────────────────────────────

router.get("/operational", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const [meters, customers, readings, activeSessions] = await Promise.all([
      prisma.meter.count(),
      prisma.customer.count(),
      prisma.reading.count(),
      prisma.session.count({ where: { isActive: true } }),
    ])
    const recentReadings = await prisma.reading.findMany({ orderBy: { timestamp: "desc" }, take: 10, include: { meter: { select: { serial: true } } } })
    res.json({ summary: { totalMeters: meters, totalCustomers: customers, totalReadings: readings, activeSessions }, recentReadings })
  } catch (err) { next(err) }
})

// ─── FINANCIAL REPORTS ────────────────────────────────────────────────────────

router.get("/financial", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
    ])
    const pendingInvoices = await prisma.invoice.count({ where: { status: "pending" } })
    const overdueInvoices = await prisma.invoice.count({ where: { status: "overdue" } })
    const recentInvoices = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" }, take: 10, include: { customer: { select: { name: true } } } })
    res.json({ summary: { totalInvoiced: invoices._sum.amount || 0, totalCollected: payments._sum.amount || 0, pending: pendingInvoices, overdue: overdueInvoices, invoiceCount: invoices._count, paymentCount: payments._count }, recentInvoices })
  } catch (err) { next(err) }
})

// ─── EXECUTIVE DASHBOARD ──────────────────────────────────────────────────────

router.get("/executive", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [totalMeters, totalCustomers, totalReadings, totalInvoices, monthReadings, monthInvoices, monthRevenue] = await Promise.all([
      prisma.meter.count(), prisma.customer.count(), prisma.reading.count(), prisma.invoice.count(),
      prisma.reading.count({ where: { timestamp: { gte: monthStart } } }),
      prisma.invoice.count({ where: { issuedAt: { gte: monthStart } } }),
      prisma.invoice.aggregate({ where: { issuedAt: { gte: monthStart } }, _sum: { amount: true } }),
    ])
    res.json({ metrics: { totalMeters, totalCustomers, totalReadings, totalInvoices, monthReadings, monthInvoices, monthRevenue: monthRevenue._sum.amount || 0 } })
  } catch (err) { next(err) }
})

// ─── CONSUMPTION ANALYSIS ─────────────────────────────────────────────────────

router.get("/consumption", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30))
    const since = new Date(Date.now() - days * 86400000)
    const readings = await prisma.reading.findMany({ where: { timestamp: { gte: since } }, orderBy: { timestamp: "asc" }, take: 1000 })
    const total = readings.reduce((s, r) => s + r.value, 0)
    const avg = readings.length ? total / readings.length : 0
    res.json({ summary: { totalReadings: readings.length, totalConsumption: total, avgReading: avg, days }, readings: readings.slice(-50) })
  } catch (err) { next(err) }
})

// ─── VARIANCE REPORTS ─────────────────────────────────────────────────────────

router.get("/variance", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const now = new Date(); const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const [thisMonthReadings, lastMonthReadings, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.reading.count({ where: { timestamp: { gte: thisMonth } } }),
      prisma.reading.count({ where: { timestamp: { gte: lastMonth, lt: thisMonth } } }),
      prisma.invoice.aggregate({ where: { issuedAt: { gte: thisMonth } }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { issuedAt: { gte: lastMonth, lt: thisMonth } }, _sum: { amount: true } }),
    ])
    const readingVariance = lastMonthReadings ? ((thisMonthReadings - lastMonthReadings) / lastMonthReadings * 100).toFixed(1) : "0"
    const revenueVariance = lastMonthRevenue._sum.amount ? (((thisMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / lastMonthRevenue._sum.amount * 100).toFixed(1) : "0"
    res.json({ variance: { thisMonthReadings, lastMonthReadings, readingVariance: parseFloat(readingVariance), thisMonthRevenue: thisMonthRevenue._sum.amount || 0, lastMonthRevenue: lastMonthRevenue._sum.amount || 0, revenueVariance: parseFloat(revenueVariance) } })
  } catch (err) { next(err) }
})

// ─── AGING REPORTS ────────────────────────────────────────────────────────────

router.get("/aging", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const now = new Date()
    const aging = [
      { bucket: "0-30 days", min: 0, max: 30 },
      { bucket: "31-60 days", min: 31, max: 60 },
      { bucket: "61-90 days", min: 61, max: 90 },
      { bucket: "90+ days", min: 91, max: 9999 },
    ]
    const buckets = await Promise.all(aging.map(async (b) => {
      const count = await prisma.invoice.count({ where: { status: { in: ["pending","overdue"] }, dueDate: { gte: new Date(now.getTime() - b.max * 86400000), lt: new Date(now.getTime() - b.min * 86400000) } } })
      const total = await prisma.invoice.aggregate({ where: { status: { in: ["pending","overdue"] }, dueDate: { gte: new Date(now.getTime() - b.max * 86400000), lt: new Date(now.getTime() - b.min * 86400000) } }, _sum: { amount: true } })
      return { bucket: b.bucket, count, total: total._sum.amount || 0 }
    }))
    res.json({ buckets })
  } catch (err) { next(err) }
})

// ─── KPI DASHBOARD ────────────────────────────────────────────────────────────

router.get("/kpi", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const kpis = await prisma.kpiDefinition.findMany({ orderBy: { category: "asc" } })
    const snapshots = await prisma.kpiSnapshot.findMany({ orderBy: { recordedAt: "desc" }, take: 100, include: { kpi: { select: { name: true } } } })
    res.json({ kpis, snapshots })
  } catch (err) { next(err) }
})

router.post("/kpi", requireRole("super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(1), category: z.string().optional(), target: z.number().optional(), unit: z.string().optional(), current: z.number().optional(), trend: z.string().optional() }).parse(req.body)
    const kpi = await prisma.kpiDefinition.create({ data })
    res.status(201).json({ kpi })
  } catch (err) { next(err) }
})

// ─── EXPORT CENTER ────────────────────────────────────────────────────────────

router.get("/export", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const exports = await prisma.exportLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    const stats = { total: await prisma.exportLog.count(), completed: await prisma.exportLog.count({ where: { status: "completed" } }) }
    res.json({ exports, stats })
  } catch (err) { next(err) }
})

router.post("/export", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().min(1), format: z.string().optional(), filters: z.string().optional() }).parse(req.body)
    const exp = await prisma.exportLog.create({ data })
    setTimeout(async () => {
      await prisma.exportLog.update({ where: { id: exp.id }, data: { status: "completed", totalRows: Math.floor(Math.random() * 1000 + 50), filePath: `/exports/${exp.id}.${data.format || "csv"}`, completedAt: new Date() } })
    }, 3000)
    res.status(201).json({ export: exp })
  } catch (err) { next(err) }
})

// ─── SCHEDULED REPORTS ────────────────────────────────────────────────────────

router.get("/scheduled", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const reports = await prisma.scheduledReport.findMany({ orderBy: { nextRunAt: "asc" } })
    res.json({ reports })
  } catch (err) { next(err) }
})

router.post("/scheduled", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(1), reportType: z.string(), schedule: z.string().optional(), format: z.string().optional(), recipients: z.string().optional() }).parse(req.body)
    const report = await prisma.scheduledReport.create({ data })
    res.status(201).json({ report })
  } catch (err) { next(err) }
})

router.put("/scheduled/:id/toggle", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const r = await prisma.scheduledReport.findUnique({ where: { id: req.params.id } })
    if (!r) return res.status(404).json({ error: "Not found" })
    const updated = await prisma.scheduledReport.update({ where: { id: req.params.id }, data: { active: !r.active } })
    res.json({ report: updated })
  } catch (err) { next(err) }
})

// ─── REPORT DEFINITIONS ──────────────────────────────────────────────────────

router.get("/definitions", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const reports = await prisma.reportDefinition.findMany({ orderBy: { name: "asc" } })
    res.json({ reports })
  } catch (err) { next(err) }
})

router.post("/definitions", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(1), type: z.string().optional(), description: z.string().optional(), config: z.string().optional(), schedule: z.string().optional(), recipients: z.string().optional() }).parse(req.body)
    const report = await prisma.reportDefinition.create({ data })
    res.status(201).json({ report })
  } catch (err) { next(err) }
})

export { router as reportsRouter }


