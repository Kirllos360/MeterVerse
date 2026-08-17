import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, isGlobalScope, auditLog } from "../middleware/security.js"
import { computeSolar, persistSolarInvoice } from "../services/solar-wallet-engine.js"

const router = Router()
router.use(authenticate)

// Enforce Area tenancy for a customer record (fail-closed). Global roles bypass.
async function assertCustomerAreaScope(req, customer) {
  if (isGlobalScope(req)) return
  const userArea = (req.user.area || "").trim()
  if (!userArea || userArea === "all") throw Object.assign(new Error("No area scope assigned"), { status: 403, code: "AREA_RESTRICTED" })
  const custArea = typeof customer.areaId === "string" ? customer.areaId : (customer.area?.id || "")
  if (!custArea || custArea !== userArea) throw Object.assign(new Error("Access denied to this resource"), { status: 403, code: "AREA_RESTRICTED" })
}

// Manual directional input schema.
// NOTE: this is MANUAL directional data entry (meter-reading-style inputs), NOT
// OBIS-captured Reading rows. Reading.obis180/obis280 capture remains BLOCKED
// (OBIS approval STATE 2). This route is approval-independent.
const computeSchema = z.object({
  customerId: z.string().min(1),
  curr180: z.number().min(0).optional().default(0),
  prev180: z.number().min(0).optional().default(0),
  curr280: z.number().min(0).optional().default(0),
  prev280: z.number().min(0).optional().default(0),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  month: z.string().optional(),
  projectId: z.string().optional(),
})

// Compute-only preview (no persistence) â€” safe, read-only.
router.post("/compute", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const body = computeSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    await assertCustomerAreaScope(req, customer)
    const result = computeSolar(body)
    auditLog(req, "solar.compute", { customerId: body.customerId })
    res.json({ input: body, result })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    if (err.status) return res.status(err.status).json({ error: err.message, code: err.code })
    next(err)
  }
})

// Compute + persist a solar invoice (ledger credit + invoice + items).
// Idempotency: the caller may pass a client reference in body.ref to dedupe.
const createSchema = computeSchema.extend({
  meterId: z.string().optional(),
  ref: z.string().optional(),
})

// Resolve the authoritative area for an invoice. The customer's area is the
// tenancy source of truth (horizontal-privilege fix): the client can no longer
// misattribute an invoice to an area it does not control.
function resolveArea(customer) {
  return typeof customer.areaId === "string" ? customer.areaId : (customer.area?.id || null)
}

router.post("/invoices", requirePermission("invoices.create"), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    await assertCustomerAreaScope(req, customer)

    // Idempotency: if ref provided, reject duplicates by matching the stored
    // audit details JSON (auditLog persists ref inside details, not as a column).
    if (body.ref) {
      const existing = await prisma.auditEntry.findFirst({
        where: { action: "solar.invoice.created", details: { contains: `"ref":"${body.ref}"` } },
      })
      if (existing) return res.status(409).json({ error: "Solar invoice already created for this ref", code: "DUPLICATE" })
    }

    const result = computeSolar(body)
    const period = body.month || (body.periodStart ? body.periodStart.slice(0, 7) : "")
    const serial = body.meterId ? (await prisma.meter.findUnique({ where: { id: body.meterId } }))?.serial || "" : ""
    const { invoice, items } = await persistSolarInvoice({
      customerId: customer.id,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      meterId: body.meterId,
      result,
      meta: { period, serial, areaId: resolveArea(customer), projectId: body.projectId },
    })

    auditLog(req, "solar.invoice.created", {
      ref: body.ref || null,
      invoiceId: invoice.id,
      number: invoice.number,
      total: result.total,
      surplus: result.surplus,
      items: items.length,
    })
    res.status(201).json({ invoice, items, result })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    if (err.status) return res.status(err.status).json({ error: err.message, code: err.code })
    // DB-level idempotency: Invoice.number is a deterministic business key
    if (err?.code === "P2002" && String(err.meta?.target || "").includes("number")) {
      return res.status(409).json({ error: "Solar invoice already exists for this meter+period", code: "DUPLICATE" })
    }
    next(err)
  }
})

export { router as solarRouter }
