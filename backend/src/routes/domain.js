import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate, requireRole } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── HELPER: Generic CRUD factory ────────────────────────────────────────────

function crud(resource, modelName, createSchema, options = {}) {
  const model = prisma[modelName]
  if (!model) return

  // List
  router.get(`/${resource}`, requireRole("admin", "super_admin"), async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const search = req.query.search
      const where = search && options.searchFields ? { OR: options.searchFields.map(f => ({ [f]: { contains: search } })) } : {}
      const [items, total] = await Promise.all([
        model.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: options.include || undefined }),
        model.count({ where }),
      ])
      res.json({ [resource]: items, total, page, limit })
    } catch (err) { next(err) }
  })

  // Get by ID
  router.get(`/${resource}/:id`, requireRole("admin", "super_admin"), async (req, res, next) => {
    try {
      const item = await model.findUnique({ where: { id: req.params.id }, include: options.include || undefined })
      if (!item) return res.status(404).json({ error: "Not found" })
      res.json({ [modelName.slice(0, -1)]: item })
    } catch (err) { next(err) }
  })

  // Create
  router.post(`/${resource}`, requireRole("admin", "super_admin"), async (req, res, next) => {
    try {
      const data = createSchema.parse(req.body)
      const item = await model.create({ data })
      res.status(201).json({ [modelName.slice(0, -1)]: item })
    } catch (err) { if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors }); next(err) }
  })

  // Update
  router.put(`/${resource}/:id`, requireRole("admin", "super_admin"), async (req, res, next) => {
    try {
      const data = createSchema.partial().parse(req.body)
      const item = await model.update({ where: { id: req.params.id }, data })
      res.json({ [modelName.slice(0, -1)]: item })
    } catch (err) { if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors }); next(err) }
  })

  // Delete
  router.delete(`/${resource}/:id`, requireRole("super_admin"), async (req, res, next) => {
    try {
      await model.delete({ where: { id: req.params.id } })
      res.json({ success: true })
    } catch (err) { next(err) }
  })
}

// ─── REGISTER ALL DOMAINS ────────────────────────────────────────────────────

crud("contracts", "contract", z.object({
  contractNumber: z.string().min(1), customerId: z.string().uuid(), type: z.string().optional(),
  startDate: z.string(), endDate: z.string().optional().nullable(), terms: z.string().optional(),
  autoRenew: z.boolean().optional(), signedBy: z.string().optional(), signedAt: z.string().optional().nullable(),
}), { searchFields: ["contractNumber"] })

crud("tariffs", "tariff", z.object({
  name: z.string().min(1), code: z.string().min(1), description: z.string().optional(),
  type: z.string().optional(), currency: z.string().optional(), unit: z.string().optional(),
  effectiveFrom: z.string(), effectiveTo: z.string().optional().nullable(),
}), { searchFields: ["name", "code"] })

crud("tariff-rates", "tariffRate", z.object({
  tariffId: z.string().uuid(), name: z.string().min(1), rate: z.number(),
  unit: z.string().optional(), validFrom: z.string().optional().nullable(), validTo: z.string().optional().nullable(),
  priority: z.number().optional(),
}))

crud("tariff-tiers", "tariffTier", z.object({
  tariffId: z.string().uuid(), name: z.string().min(1), minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(), rate: z.number(), unit: z.string().optional(), priority: z.number().optional(),
}))

crud("bill-cycles", "billCycle", z.object({
  name: z.string().min(1), code: z.string().min(1), frequency: z.string().optional(),
  billingDay: z.number().optional(), dueDay: z.number().optional(), cutOffDay: z.number().optional(),
}), { searchFields: ["name", "code"] })

crud("bill-runs", "billRun", z.object({
  billCycleId: z.string().uuid(), periodStart: z.string(), periodEnd: z.string(),
}))

crud("charge-rules", "chargeRule", z.object({
  name: z.string().min(1), code: z.string().min(1), description: z.string().optional(),
  type: z.string().optional(), formula: z.string().optional(), priority: z.number().optional(),
  effectiveFrom: z.string(), effectiveTo: z.string().optional().nullable(),
}), { searchFields: ["name", "code"] })

crud("invoice-items", "invoiceItem", z.object({
  invoiceId: z.string().uuid(), type: z.string().optional(), description: z.string(),
  quantity: z.number().optional(), unitPrice: z.number().optional(), amount: z.number().optional(),
  taxRate: z.number().optional(), taxAmount: z.number().optional(), total: z.number().optional(),
}))

crud("meter-assignments", "meterAssignment", z.object({
  meterId: z.string().uuid(), customerId: z.string().uuid(), contractId: z.string().optional().nullable(),
  startDate: z.string(), endDate: z.string().optional().nullable(), reason: z.string().optional(),
}))

crud("meter-events", "meterEvent", z.object({
  meterId: z.string().uuid(), type: z.string().min(1), description: z.string().optional(),
  timestamp: z.string().optional(), resolvedBy: z.string().optional(),
}))

crud("validation-rules", "validationRule", z.object({
  name: z.string().min(1), code: z.string().min(1), description: z.string().optional(),
  entityType: z.string().optional(), condition: z.string(), action: z.string().optional(),
  severity: z.string().optional(), priority: z.number().optional(),
}), { searchFields: ["name", "code"] })

crud("workflow-states", "workflowState", z.object({
  name: z.string().min(1), entityType: z.string(), state: z.string(),
  enteredBy: z.string().optional(), notes: z.string().optional(),
}))

crud("collection-cases", "collectionCase", z.object({
  customerId: z.string().uuid(), invoiceId: z.string().optional().nullable(),
  totalAmount: z.number().optional(), assignedTo: z.string().optional(), notes: z.string().optional(),
}))

crud("payment-gateways", "paymentGateway", z.object({
  name: z.string().min(1), provider: z.string().optional(), config: z.string().optional(),
  active: z.boolean().optional(), testMode: z.boolean().optional(),
}))

crud("payment-transactions", "paymentTransaction", z.object({
  gatewayId: z.string().uuid(), paymentId: z.string().optional().nullable(),
  type: z.string().optional(), amount: z.number(), currency: z.string().optional(),
}))

crud("customer-groups", "customerGroup", z.object({
  name: z.string().min(1), description: z.string().optional(),
}), { searchFields: ["name"] })

crud("slas", "sLA", z.object({
  name: z.string().min(1), description: z.string().optional(),
  responseTime: z.number().optional(), resolutionTime: z.number().optional(),
  availability: z.number().optional(), severity: z.string().optional(),
}), { searchFields: ["name"] })

crud("alert-rules", "alertRule", z.object({
  name: z.string().min(1), description: z.string().optional(),
  entityType: z.string(), condition: z.string(), severity: z.string().optional(),
  cooldown: z.number().optional(),
}), { searchFields: ["name"] })

crud("escalation-policies", "escalationPolicy", z.object({
  name: z.string().min(1), description: z.string().optional(),
  triggerType: z.string().optional(), threshold: z.number().optional(),
}), { searchFields: ["name"] })

export { router as domainRouter }

