import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()

// ─── PROMETHEUS METRICS ──────────────────────────────────────────────────────

router.get("/metrics/prometheus", async (req, res, next) => {
  try {
    const [userCount, meterCount, readingCount, invoiceCount, activeSessions, queueDepth] = await Promise.all([
      prisma.user.count(), prisma.meter.count(), prisma.reading.count(),
      prisma.invoice.count(), prisma.session.count({ where: { isActive: true } }),
      prisma.queueJob.count({ where: { status: "pending" } }),
    ])
    const metrics = [
      `# HELP meterverse_users_total Total users`,
      `# TYPE meterverse_users_total gauge`,
      `meterverse_users_total ${userCount}`,
      `# HELP meterverse_meters_total Total meters`,
      `# TYPE meterverse_meters_total gauge`,
      `meterverse_meters_total ${meterCount}`,
      `# HELP meterverse_readings_total Total readings`,
      `# TYPE meterverse_readings_total counter`,
      `meterverse_readings_total ${readingCount}`,
      `# HELP meterverse_invoices_total Total invoices`,
      `# TYPE meterverse_invoices_total counter`,
      `meterverse_invoices_total ${invoiceCount}`,
      `# HELP meterverse_active_sessions Active sessions`,
      `# TYPE meterverse_active_sessions gauge`,
      `meterverse_active_sessions ${activeSessions}`,
      `# HELP meterverse_queue_depth Pending queue jobs`,
      `# TYPE meterverse_queue_depth gauge`,
      `meterverse_queue_depth ${queueDepth}`,
      `# HELP meterverse_build_info Build information`,
      `# TYPE meterverse_build_info gauge`,
      `meterverse_build_info{version="8.0.0",revision="sprint-44"} 1`,
    ].join("\n")
    res.setHeader("Content-Type", "text/plain")
    res.send(metrics)
  } catch (err) { next(err) }
})

// ─── HEALTH DEEP ─────────────────────────────────────────────────────────────

router.get("/health/deep", async (req, res, next) => {
  try {
    const checks = []
    // DB check
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart
    checks.push({ name: "Database", status: dbLatency < 100 ? "healthy" : "degraded", latency: `${dbLatency}ms` })

    // Queue check
    const stuckJobs = await prisma.queueJob.count({ where: { status: "running", startedAt: { lt: new Date(Date.now() - 3600000) } } })
    checks.push({ name: "Queue", status: stuckJobs === 0 ? "healthy" : "degraded", stuckJobs })

    // Session check
    const expiredSessions = await prisma.session.count({ where: { isActive: true, expiresAt: { lt: new Date() } } })
    checks.push({ name: "Sessions", status: expiredSessions === 0 ? "healthy" : "degraded", expiredSessions })

    // Storage
    const fileCount = await prisma.storedFile.count()
    checks.push({ name: "Storage", status: "healthy", files: fileCount })

    // Audit
    const recentErrors = await prisma.auditEntry.count({ where: { status: "failure", timestamp: { gte: new Date(Date.now() - 86400000) } } })
    checks.push({ name: "Error Rate (24h)", status: recentErrors < 10 ? "healthy" : "degraded", errors: recentErrors })

    const allHealthy = checks.every(c => c.status === "healthy")
    res.json({ status: allHealthy ? "healthy" : "degraded", timestamp: new Date().toISOString(), checks })
  } catch (err) { next(err) }
})

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

router.get("/performance", requirePermission("monitor.*"), async (req, res, next) => {
  try {
    const [totalReadings, validReadings, totalInvoices, totalRevenue] = await Promise.all([
      prisma.reading.count(), prisma.reading.count({ where: { status: "valid" } }),
      prisma.invoice.count(), prisma.invoice.aggregate({ _sum: { amount: true } }),
    ])
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayReadings = await prisma.reading.count({ where: { timestamp: { gte: today } } })
    const todayInvoices = await prisma.invoice.count({ where: { issuedAt: { gte: today } } })

    res.json({
      summary: { totalReadings, validReadings, validationRate: totalReadings ? Math.round(validReadings / totalReadings * 100) : 0, totalInvoices, totalRevenue: totalRevenue._sum.amount || 0 },
      today: { readings: todayReadings, invoices: todayInvoices },
      throughput: { readingsPerDay: totalReadings ? Math.round(totalReadings / 30) : 0, invoicesPerDay: totalInvoices ? Math.round(totalInvoices / 30) : 0 },
    })
  } catch (err) { next(err) }
})

// ─── AUDIT EXPLORER ──────────────────────────────────────────────────────────

router.get("/audit/explorer", requirePermission("monitor.*"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25))
    const action = req.query.action
    const status = req.query.status
    const search = req.query.search

    const where = {}
    if (action) where.action = { contains: action }
    if (status) where.status = status
    if (search) where.OR = [{ actor: { contains: search } }, { resource: { contains: search } }, { action: { contains: search } }]

    const [entries, total] = await Promise.all([
      prisma.auditEntry.findMany({ where, orderBy: { timestamp: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.auditEntry.count({ where }),
    ])
    const stats = { total: await prisma.auditEntry.count(), failures: await prisma.auditEntry.count({ where: { status: "failure" } }), today: await prisma.auditEntry.count({ where: { timestamp: { gte: new Date(new Date().setHours(0,0,0,0)) } } }) }
    res.json({ entries, total, page, limit, stats })
  } catch (err) { next(err) }
})

// ─── BUSINESS ANALYTICS ─────────────────────────────────────────────────────

router.get("/analytics", requirePermission("monitor.*"), async (req, res, next) => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30))
    const since = new Date(Date.now() - days * 86400000)

    const [recentReadings, recentInvoices, customerGrowth, meterGrowth] = await Promise.all([
      prisma.reading.count({ where: { timestamp: { gte: since } } }),
      prisma.invoice.count({ where: { issuedAt: { gte: since } } }),
      prisma.customer.count({ where: { createdAt: { gte: since } } }),
      prisma.meter.count({ where: { createdAt: { gte: since } } }),
    ])

    const revenueByStatus = await prisma.invoice.groupBy({ by: ["status"], _sum: { amount: true }, where: { issuedAt: { gte: since } } })
    const topAreas = await prisma.meter.groupBy({ by: ["area"], _count: true, orderBy: { _count: { area: "desc" } }, take: 5 })

    res.json({
      period: { days, since: since.toISOString() },
      growth: { customers: customerGrowth, meters: meterGrowth, readings: recentReadings, invoices: recentInvoices },
      revenue: revenueByStatus.map(r => ({ status: r.status, amount: r._sum.amount || 0 })),
      topAreas: topAreas.map(a => ({ area: a.area || "Unknown", count: a._count })),
    })
  } catch (err) { next(err) }
})

export { router as monitorRouter }






