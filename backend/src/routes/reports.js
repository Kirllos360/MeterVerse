import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── Executive report summaries (P45: wire admin/reports page to real data) ───
router.get("/operational", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const [meters, customers, readings, areas] = await Promise.all([
      prisma.meter.count({ where: { archivedAt: null } }),
      prisma.customer.count({ where: { archivedAt: null } }),
      prisma.reading.count({ where: { archivedAt: null } }),
      prisma.area.count({ where: { archivedAt: null } }),
    ])
    res.json({ meters, customers, readings, areas, online: 0, offline: 0, alerts: 0 })
  } catch (err) { next(err) }
})

router.get("/financial", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const [invoices, payments, collected] = await Promise.all([
      prisma.invoice.aggregate({ where: { archivedAt: null }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { status: "completed" }, _sum: { amount: true }, _count: true }),
      prisma.invoice.aggregate({ where: { status: "paid", archivedAt: null }, _sum: { amount: true } }),
    ])
    res.json({ invoiced: invoices._sum.amount || 0, invoiceCount: invoices._count, collected: payments._sum.amount || 0, paid: collected._sum.amount || 0, outstanding: (invoices._sum.amount || 0) - (payments._sum.amount || 0), paymentCount: payments._count })
  } catch (err) { next(err) }
})

router.get("/executive", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const [customers, meters, invoices, payments, users] = await Promise.all([
      prisma.customer.count({ where: { archivedAt: null } }),
      prisma.meter.count({ where: { archivedAt: null } }),
      prisma.invoice.count({ where: { archivedAt: null } }),
      prisma.payment.count({ where: { status: "completed" } }),
      prisma.user.count({ where: { archivedAt: null } }),
    ])
    res.json({ customers, meters, invoices, payments, users })
  } catch (err) { next(err) }
})

router.get("/consumption", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const agg = await prisma.reading.aggregate({ where: { archivedAt: null }, _sum: { value: true }, _count: true })
    res.json({ totalConsumption: agg._sum.value || 0, readingCount: agg._count, trend: 0 })
  } catch (err) { next(err) }
})

router.get("/variance", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const [invoiced, collected] = await Promise.all([
      prisma.invoice.aggregate({ where: { archivedAt: null }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "completed" }, _sum: { amount: true } }),
    ])
    const i = invoiced._sum.amount || 0
    const c = collected._sum.amount || 0
    res.json({ invoiced: i, collected: c, variance: i - c, variancePct: i ? Math.round((i - c) / i * 100) : 0 })
  } catch (err) { next(err) }
})

router.get("/aging", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({ where: { archivedAt: null, status: { in: ["issued", "partial", "overdue"] } }, select: { amount: true, paidAmount: true, dueDate: true } })
    const now = Date.now()
    const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 }
    for (const inv of invoices) {
      const outstanding = inv.amount - (inv.paidAmount || 0)
      if (outstanding <= 0) continue
      const due = inv.dueDate ? Math.floor((now - inv.dueDate) / 86400000) : 0
      const key = due > 90 ? "90+" : due > 60 ? "61-90" : due > 30 ? "31-60" : "0-30"
      buckets[key] += outstanding
    }
    res.json({ buckets })
  } catch (err) { next(err) }
})

router.get("/kpi", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const kpis = await prisma.kpiSnapshot.findMany({ orderBy: { recordedAt: "desc" }, take: 12 })
    res.json({ kpis })
  } catch (err) { next(err) }
})

router.post("/export", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const { type, format, filters } = z.object({
      type: z.enum(["invoices", "payments", "customers", "meters", "readings", "aging"]),
      format: z.enum(["csv", "json"]).default("csv"),
      filters: z.object({
        customerId: z.string().optional(),
        areaId: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        status: z.string().optional(),
      }).default({}),
    }).parse(req.body)

    let data = []
    switch (type) {
      case "invoices":
        data = await prisma.invoice.findMany({ where: { ...(filters.customerId ? { customerId: filters.customerId } : {}), ...(filters.status ? { status: filters.status } : {}) }, take: 10000 })
        break
      case "payments":
        data = await prisma.payment.findMany({ where: { ...(filters.customerId ? { customerId: filters.customerId } : {}) }, take: 10000 })
        break
      case "customers":
        data = await prisma.customer.findMany({ take: 10000 })
        break
      case "meters":
        data = await prisma.meter.findMany({ take: 10000 })
        break
      case "readings":
        data = await prisma.reading.findMany({ take: 10000 })
        break
      case "aging": {
        const customers = await prisma.customer.findMany({ where: { status: "active" }, take: 1000 })
        for (const c of customers) {
          const invoices = await prisma.invoice.findMany({ where: { customerId: c.id, status: { notIn: ["paid", "cancelled"] } } })
          const totalOutstanding = invoices.reduce((s, i) => s + (i.amount - (i.paidAmount || 0)), 0)
          if (totalOutstanding > 0) data.push({ customerId: c.id, customerName: c.name, totalOutstanding, invoiceCount: invoices.length })
        }
        break
      }
    }

    auditLog(req, "report.exported", { type, format, rowCount: data.length })
    if (format === "csv" && data.length > 0) {
      const headers = Object.keys(data[0])
      const csv = [headers.join(","), ...data.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n")
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${type}-${Date.now()}.csv"`)
      return res.send(csv)
    }
    res.json({ data, total: data.length, type, format })
  } catch (err) { next(err) }
})

router.post("/exports", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const { type, format, filters } = z.object({
      type: z.enum(["invoices", "payments", "customers", "meters", "readings", "aging"]),
      format: z.enum(["csv", "json", "xlsx"]).default("csv"),
      filters: z.object({ customerId: z.string().optional(), areaId: z.string().optional(), dateFrom: z.string().optional(), dateTo: z.string().optional(), status: z.string().optional() }).default({}),
    }).parse(req.body)

    const job = await prisma.exportLog.create({
      data: { type, format, filters: JSON.stringify(filters), status: "queued" },
    })

    setTimeout(async () => {
      try {
        await prisma.exportLog.update({ where: { id: job.id }, data: { status: "running" } })
        let rowCount = 0
        switch (type) {
          case "invoices": rowCount = (await prisma.invoice.findMany({ take: 10000 })).length; break
          case "payments": rowCount = (await prisma.payment.findMany({ take: 10000 })).length; break
          case "customers": rowCount = (await prisma.customer.findMany({ take: 10000 })).length; break
          case "meters": rowCount = (await prisma.meter.findMany({ take: 10000 })).length; break
          case "readings": rowCount = (await prisma.reading.findMany({ take: 10000 })).length; break
          case "aging": rowCount = (await prisma.customer.count({ where: { status: "active" } })); break
        }
        await prisma.exportLog.update({ where: { id: job.id }, data: { status: "completed", totalRows: rowCount, completedAt: new Date() } })
      } catch (e) {
        await prisma.exportLog.update({ where: { id: job.id }, data: { status: "failed" } })
      }
    }, 100)

    auditLog(req, "report.export.created", { jobId: job.id, type, format })
    res.status(202).json({ jobId: job.id, status: "queued" })
  } catch (err) { next(err) }
})

router.get("/exports", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const exports = await prisma.exportLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ exports })
  } catch (err) { next(err) }
})

router.get("/exports/:id", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const job = await prisma.exportLog.findUnique({ where: { id: req.params.id } })
    if (!job) return res.status(404).json({ error: "Export job not found", code: "NOT_FOUND" })
    res.json({ job })
  } catch (err) { next(err) }
})

export { router as reportsRouter }
