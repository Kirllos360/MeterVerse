import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, requirePermission, auditLog } from "../middleware/security.js"

const generateSchema = z.object({ customerId: z.string().min(1), periodStart: z.string().min(1), periodEnd: z.string().min(1) })
const router = Router()
router.use(authenticate)

const createSchema = z.object({
  number: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().positive(),
  status: z.string().default("pending"),
  dueDate: z.string().optional(),
})

router.get("/", requirePermission("invoices.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const where = { archivedAt: null }
    if (status) where.status = status
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { issuedAt: "desc" }, include: { customer: { select: { id: true, name: true } } } }),
      prisma.invoice.count({ where }),
    ])
    res.json({ invoices, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})


router.get("/export", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const items = await prisma.invoice.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } })
    const header = "number,customerId,amount,status,dueDate,issuedAt,paidAt,createdAt"
    const rows = items.map(i => [i.number, i.customerId, i.amount, i.status, i.dueDate, i.issuedAt, i.paidAt, i.createdAt].join(","))
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=invoices.csv")
    res.send([header, ...rows].join("\n"))
    auditLog(req, "invoice.export", { count: items.length })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("invoices.list"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { customer: true, payments: true } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    auditLog(req, "invoice.viewed", { invoiceId: req.params.id })
    res.json({ invoice })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const invoice = await prisma.invoice.create({ data })
    auditLog(req, "invoice.created", { invoiceId: invoice.id })
    res.status(201).json({ invoice })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})


router.delete("/:id", requirePermission("invoices.delete"), async (req, res, next) => {
  try {
    const inv = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!inv) return res.status(404).json({ error: "Invoice not found" })
    if (inv.status === "paid") return res.status(400).json({ error: "Cannot archive paid invoice — issue credit note instead" })
    await prisma.invoice.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "invoice.archived", { invoiceId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.post("/generate", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const { customerId, periodStart, periodEnd } = generateSchema.parse(req.body)
    // Validation done by Zod above.json({ error: "customerId, periodStart, periodEnd required" })

    const customer = await prisma.customer.findFirst({ where: { id: customerId, archivedAt: null } })
    if (!customer) return res.status(400).json({ error: "Cannot generate invoice for archived customer" })

    // Find customer's meters
    const assignments = await prisma.meterAssignment.findMany({ where: { customerId, status: "active" }, include: { meter: { include: { readings: { orderBy: { timestamp: "desc" }, take: 2 } } } } })
    if (assignments.length === 0) return res.status(400).json({ error: "Customer has no active meters" })

    // Find tariff for customer (use first active tariff)
    const tariff = await prisma.tariff.findFirst({ where: { status: "active" }, include: { rates: true } })
    if (!tariff) return res.status(400).json({ error: "No active tariff found" })

    // Determine due date from project payment terms (default 30 days)
    const project = await prisma.project.findFirst({ where: { organizationId: customer.area || "" } })
    const paymentTermsDays = project?.paymentTermsDays || 30
    const dueDate = new Date(Date.now() + paymentTermsDays * 86400000)
    const waterDiffMode = project?.waterDifferenceMode || "report_only"

    // Generate invoice
    const invoiceNumber = `INV-${Date.now()}`
    let totalAmount = 0
    const items = []

    for (const a of assignments) {
      const readings = a.meter.readings
      if (readings.length >= 2) {
        const consumption = readings[0].value - readings[1].value
        const amount = Math.abs(consumption) * (tariff.rates?.[0]?.rate || 1)

        // Water difference handling: report_only mode excludes water charges from total
        const isWater = a.meter.type?.toLowerCase() === "water"
        if (isWater && waterDiffMode === "report_only") {
          items.push({ type: "info", description: `Water consumption (${a.meter.serial}): ${Math.abs(consumption)} ${readings[0].unit} (report only)`, quantity: Math.abs(consumption), unitPrice: 0, amount: 0, total: 0 })
        } else {
          totalAmount += amount
          items.push({ type: "charge", description: `Consumption (${a.meter.serial}): ${Math.abs(consumption)} ${readings[0].unit}`, quantity: Math.abs(consumption), unitPrice: tariff.rates?.[0]?.rate || 1, amount, total: amount })
        }
      }
    }

    const invoice = await prisma.invoice.create({ data: { number: invoiceNumber, customerId, amount: totalAmount, status: "pending", dueDate } })

    if (items.length > 0) {
      await prisma.invoiceItem.createMany({ data: items.map(i => ({ ...i, invoiceId: invoice.id })) })
    }

    auditLog(req, "invoice.generated", { invoiceId: invoice.id, customerId, amount: totalAmount })
    prisma.notification.create({ data: { type: "invoice_generated", title: "Invoice Generated", body: `Invoice ${invoiceNumber} for EGP ${totalAmount.toFixed(2)}`, recipientId: customerId } }).catch(() => {})
    res.status(201).json({ invoice, items })
  } catch (err) { next(err) }
})

// ─── ISSUE INVOICE (set immutable) ───────────────────────────────────

router.post("/:id/issue", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.immutableAt) return res.status(400).json({ error: "Invoice already issued" })
    const issued = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: "issued", issuedAt: new Date(), immutableAt: new Date() },
    })
    auditLog(req, "invoice.issued", { invoiceId: invoice.id, number: invoice.number })
    res.json({ invoice: issued })
  } catch (err) { next(err) }
})

// ─── IMMUTABILITY GUARD (middleware for PUT/DELETE) ──────────────────

router.put("/:id", requirePermission("invoices.edit"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.immutableAt) return res.status(400).json({ error: "Cannot modify an issued invoice" })
    const data = z.object({ status: z.string().optional(), dueDate: z.string().optional() }).parse(req.body)
    const updated = await prisma.invoice.update({ where: { id: req.params.id }, data: { ...data, ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}) } })
    auditLog(req, "invoice.updated", { invoiceId: invoice.id, changes: Object.keys(data) })
    res.json({ invoice: updated })
  } catch (err) { next(err) }
})

// ─── ADJUSTMENTS (credit notes / surcharges) ──────────────────────────

router.post("/:id/adjustments", requirePermission("invoices.edit"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    if (invoice.immutableAt) return res.status(400).json({ error: "Cannot adjust an issued invoice" })

    const data = z.object({
      description: z.string().min(1),
      amount: z.number(),
      type: z.enum(["adjustment", "discount", "surcharge"]).default("adjustment"),
    }).parse(req.body)

    const item = await prisma.invoiceItem.create({
      data: { invoiceId: req.params.id, type: data.type, description: data.description, quantity: 1, unitPrice: data.amount, amount: data.amount, total: data.amount },
    })

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { amount: { increment: data.amount } },
    })

    auditLog(req, "invoice.adjustment", { invoiceId: invoice.id, description: data.description, amount: data.amount })
    res.status(201).json({ adjustment: item, invoice: updated })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

export { router as invoicesRouter }





