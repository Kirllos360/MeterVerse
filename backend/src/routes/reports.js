import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

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

router.get("/exports", requirePermission("reports.*"), async (req, res, next) => {
  try {
    const exports = await prisma.exportLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ exports })
  } catch (err) { next(err) }
})

export { router as reportsRouter }
