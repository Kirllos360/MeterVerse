import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

const CRITICAL_ENDPOINTS = [
  { name: "Health", url: "/api/health", method: "GET", auth: false },
  { name: "Customers List", url: "/api/customers", method: "GET", auth: true },
  { name: "Meters List", url: "/api/meters", method: "GET", auth: true },
  { name: "Readings List", url: "/api/readings", method: "GET", auth: true },
  { name: "Invoices List", url: "/api/invoices", method: "GET", auth: true },
  { name: "Payments List", url: "/api/payments", method: "GET", auth: true },
  { name: "Tariffs List", url: "/api/tariffs", method: "GET", auth: true },
  { name: "SIM List", url: "/api/sim", method: "GET", auth: true },
  { name: "Zones List", url: "/api/locations/zones", method: "GET", auth: true },
  { name: "Units List", url: "/api/locations/units", method: "GET", auth: true },
  { name: "Tasks List", url: "/api/tasks", method: "GET", auth: true },
  { name: "Dashboard KPI", url: "/api/business/dashboard-summary", method: "GET", auth: true },
  { name: "Admin Users", url: "/api/admin/users", method: "GET", auth: true },
  { name: "Admin Roles", url: "/api/admin/roles", method: "GET", auth: true },
  { name: "Admin Audit", url: "/api/admin/audit", method: "GET", auth: true },
  { name: "Admin Health", url: "/api/admin/health", method: "GET", auth: true },
  { name: "API v1 Health", url: "/api/v1/health", method: "GET", auth: false },
  { name: "Upload Templates", url: "/api/documents/upload-templates", method: "GET", auth: true },
  { name: "Report Types", url: "/api/reports/jasper/types", method: "GET", auth: true },
  { name: "Permissions", url: "/api/admin/permissions", method: "GET", auth: true },
  { name: "Review Queue", url: "/api/readings/review-queue", method: "GET", auth: true },
  { name: "Alerts", url: "/api/alerts", method: "GET", auth: true },
  { name: "Notifications Count", url: "/api/notifications/unread-count", method: "GET", auth: true },
  { name: "Meter Assignments", url: "/api/meter-assignments", method: "GET", auth: true },
]

router.get("/system/diagnostics", async (req, res) => {
  const results = []
  let passed = 0, failed = 0

  for (const ep of CRITICAL_ENDPOINTS) {
    try {
      const headers = ep.auth ? { "Authorization": req.headers.authorization || "Bearer dev", "X-Dev-Mode": "true" } : {}
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      // PORT may carry a trailing space when launched via cmd (`set PORT=3131 && node`)
      // — trim so `http://host:PORT/path` parses (was "http://host:3131 /path" → all checks fail).
      const port = String(process.env.PORT || 3131).trim()
      const resp = await fetch(`http://localhost:${port}${ep.url}`, { headers, signal: controller.signal })
      clearTimeout(timeout)
      const status = resp.status
      const ok = status === 200
      results.push({ name: ep.name, url: ep.url, status, ok })
      if (ok) passed++; else failed++
    } catch (e) {
      results.push({ name: ep.name, url: ep.url, status: 0, ok: false, error: e.message })
      failed++
    }
  }

  const dbOk = await prisma.$queryRaw`SELECT 1 as ok`.then(() => true).catch(() => false)

  res.json({
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: dbOk ? "connected" : "error",
    endpoints: { passed, failed, total: passed + failed, rate: Math.round(passed / (passed + failed) * 100) + "%" },
    results,
  })
})

// ─── SYSTEM BACKUP ─────────────────────────────────────────────────

router.get("/system/backup", async (req, res) => {
  try {
    const stats = await Promise.all([
      prisma.customer.count(), prisma.meter.count(), prisma.reading.count(),
      prisma.invoice.count(), prisma.payment.count(), prisma.tariff.count(),
      prisma.zone.count(), prisma.unit.count(), prisma.task.count(),
      prisma.sIMCard.count(), prisma.auditEntry.count(), prisma.user.count(),
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: "connected",
      tableCount: 86,
      recordCounts: {
        customers: stats[0], meters: stats[1], readings: stats[2],
        invoices: stats[3], payments: stats[4], tariffs: stats[5],
        zones: stats[6], units: stats[7], tasks: stats[8],
        simCards: stats[9], auditEntries: stats[10], users: stats[11],
      },
    }
    res.json(backup)
  } catch { res.status(500).json({ error: "Backup failed" }) }
})

export { router as diagnosticsRouter }
