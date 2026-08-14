import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { applySettlementsToInvoice, materializeSettlementItems } from "../services/settlement-engine.js"

const router = Router()
router.use(authenticate)

const settlementSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  type: z.enum(["fixed", "percentage", "one_time"]),
  amount: z.number().optional(),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
})

// List settlements (with optional active filter)
router.get("/", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const onlyActive = req.query.active === "true"
    const items = await prisma.settlement.findMany({
      where: { archivedAt: null, ...(onlyActive ? { active: true } : {}) },
      orderBy: { createdAt: "asc" },
    })
    res.json({ settlements: items, total: items.length })
  } catch (err) { next(err) }
})

// Create settlement
router.post("/", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const body = settlementSchema.parse(req.body)
    const code = "STL-" + Date.now()
    const settlement = await prisma.settlement.create({
      data: {
        name: body.name,
        nameAr: body.nameAr || null,
        type: body.type,
        amount: body.amount || 0,
        percentage: body.percentage || 0,
        description: body.description || null,
        active: body.active ?? true,
        createdBy: req.user?.sub,
      },
    })
    auditLog(req, "settlement.created", { settlementId: settlement.id, name: settlement.name, type: settlement.type })
    res.status(201).json({ settlement })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// Update settlement
router.put("/:id", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const body = settlementSchema.parse(req.body)
    const existing = await prisma.settlement.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.archivedAt) return res.status(404).json({ error: "Settlement not found" })
    const settlement = await prisma.settlement.update({
      where: { id: req.params.id },
      data: {
        name: body.name,
        nameAr: body.nameAr ?? existing.nameAr,
        type: body.type,
        amount: body.amount ?? existing.amount,
        percentage: body.percentage ?? existing.percentage,
        description: body.description ?? existing.description,
        active: body.active ?? existing.active,
      },
    })
    auditLog(req, "settlement.updated", { settlementId: settlement.id })
    res.json({ settlement })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// Delete (soft archive)
router.delete("/:id", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const existing = await prisma.settlement.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.archivedAt) return res.status(404).json({ error: "Settlement not found" })
    const settlement = await prisma.settlement.update({ where: { id: req.params.id }, data: { archivedAt: new Date(), active: false } })
    auditLog(req, "settlement.deleted", { settlementId: settlement.id })
    res.json({ message: "Settlement archived", settlementId: settlement.id })
  } catch (err) { next(err) }
})

// Apply settlements to an existing invoice (recompute + record + materialize lines)
router.post("/:id/apply/:invoiceId", requirePermission("billing.*"), async (req, res, next) => {
  try {
    const [settlement, invoice] = await Promise.all([
      prisma.settlement.findUnique({ where: { id: req.params.id } }),
      prisma.invoice.findUnique({ where: { id: req.params.invoiceId }, include: { invoiceItems: true } }),
    ])
    if (!settlement || settlement.archivedAt) return res.status(404).json({ error: "Settlement not found" })
    if (!invoice || invoice.archivedAt) return res.status(404).json({ error: "Invoice not found" })

    // Compute a single-settlement amount against the invoice's non-settlement subtotal.
    const subtotal = invoice.invoiceItems
      .filter((i) => i.type !== "settlement")
      .reduce((s, i) => s + (i.total || 0), 0)

    const { settlements, totalSettlementAmount } = await applySettlementsToInvoice(invoice.id, invoice.customerId, subtotal)
    const items = await materializeSettlementItems(invoice.id, settlements)

    // Recompute invoice total = charges + settlements (existing tax handling preserved)
    const newItems = await prisma.invoiceItem.findMany({ where: { invoiceId: invoice.id } })
    const newSubtotal = newItems.reduce((s, i) => s + (i.total || 0), 0)
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { amount: Math.round((newSubtotal + Number.EPSILON) * 100) / 100 },
    })

    auditLog(req, "settlement.applied", { settlementId: settlement.id, invoiceId: invoice.id, total: totalSettlementAmount })
    res.json({ invoice: updated, applied: settlements, items, totalSettlementAmount })
  } catch (err) { next(err) }
})

export { router as settlementsRouter }
