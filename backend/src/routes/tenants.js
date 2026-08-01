import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

// ─── Tenant CRUD ─────────────────────────────────────────────────────────────

const tenantSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  type: z.string().max(30).optional().default("UTILITY"),
  countryId: z.string().optional().nullable(),
  timezone: z.string().max(60).optional(),
  currency: z.string().max(10).optional(),
  defaultLanguage: z.string().max(10).optional(),
  status: z.string().max(20).optional(),
  isolationStrategy: z.string().max(20).optional(),
  dataResidency: z.string().max(100).optional(),
  maxMeters: z.number().int().optional(),
  maxUsers: z.number().int().optional(),
  maxStorage: z.number().int().optional(),
})

router.get("/", requirePermission("tenant.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.tenant.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { _count: { select: { subscriptions: true, settingsEntries: true } } } }),
      prisma.tenant.count({ where }),
    ])
    res.json({ tenants: items, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/plans", requirePermission("tenant.plans.list"), async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { active: true, archivedAt: null }, orderBy: { priceMonthly: "asc" } })
    res.json({ plans })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("tenant.list"), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { subscriptions: { include: { plan: true } }, settingsEntries: true } })
    if (!tenant) return res.status(404).json({ error: "Tenant not found" })
    res.json({ tenant })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("tenant.create"), async (req, res, next) => {
  try {
    const data = tenantSchema.parse(req.body)
    const existing = await prisma.tenant.findUnique({ where: { slug: data.slug } })
    if (existing) return res.status(409).json({ error: "Tenant slug already exists" })
    const tenant = await prisma.tenant.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "tenant.created", { id: tenant.id, slug: tenant.slug })
    res.status(201).json({ tenant })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requirePermission("tenant.update"), async (req, res, next) => {
  try {
    const data = tenantSchema.partial().parse(req.body)
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data })
    auditLog(req, "tenant.updated", { id: tenant.id, changes: Object.keys(data) })
    res.json({ tenant })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/:id/archive", requirePermission("tenant.update"), async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.update({ where: { id: req.params.id }, data: { status: "ARCHIVED", lifecycleStatus: "ARCHIVED", archivedAt: new Date() } })
    auditLog(req, "tenant.archived", { id: tenant.id })
    res.json({ tenant })
  } catch (err) { next(err) }
})

// ─── Tenant Settings ─────────────────────────────────────────────────────────

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  category: z.string().max(50).optional().default("general"),
})

router.get("/:id/settings", requirePermission("tenant.list"), async (req, res, next) => {
  try {
    const settings = await prisma.tenantSetting.findMany({ where: { tenantId: req.params.id, archivedAt: null } })
    res.json({ settings })
  } catch (err) { next(err) }
})

router.post("/:id/settings", requirePermission("tenant.update"), async (req, res, next) => {
  try {
    const data = settingSchema.parse(req.body)
    const setting = await prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId: req.params.id, key: data.key } },
      update: { value: data.value, category: data.category },
      create: { tenantId: req.params.id, ...data },
    })
    auditLog(req, "tenant.setting.upserted", { tenantId: req.params.id, key: data.key })
    res.status(201).json({ setting })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Subscription Plans ──────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  tier: z.string().max(30).optional().default("STARTER"),
  priceMonthly: z.number().min(0).optional().default(0),
  priceAnnual: z.number().min(0).optional().default(0),
  currency: z.string().max(10).optional().default("EGP"),
  features: z.string().optional().default("{}"),
  limits: z.string().optional().default("{}"),
  supportLevel: z.string().max(30).optional().default("STANDARD"),
  slaLevel: z.number().min(90).max(99.99).optional().default(99.5),
})

router.post("/plans", requirePermission("tenant.plans.create"), async (req, res, next) => {
  try {
    const data = planSchema.parse(req.body)
    const existing = await prisma.subscriptionPlan.findUnique({ where: { code: data.code } })
    if (existing) return res.status(409).json({ error: "Plan code already exists" })
    const plan = await prisma.subscriptionPlan.create({ data })
    auditLog(req, "tenant.plan.created", { id: plan.id, code: plan.code })
    res.status(201).json({ plan })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Tenant Subscriptions ────────────────────────────────────────────────────

const subscriptionSchema = z.object({
  tenantId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.string().max(20).optional().default("TRIAL"),
  trialEndsAt: z.string().optional(),
  renewsAt: z.string().optional(),
  billingCycle: z.string().max(20).optional().default("MONTHLY"),
  seats: z.number().int().min(1).optional().default(1),
  addOns: z.string().optional().default("{}"),
  price: z.number().min(0).optional().default(0),
  currency: z.string().max(10).optional().default("EGP"),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  promoCode: z.string().optional(),
})

router.get("/subscriptions", requirePermission("tenant.subscriptions.list"), async (req, res, next) => {
  try {
    const where = {}
    if (req.query.tenantId) where.tenantId = String(req.query.tenantId)
    if (req.query.status) where.status = String(req.query.status)
    const subs = await prisma.tenantSubscription.findMany({ where, include: { tenant: { select: { id: true, name: true, slug: true } }, plan: true }, orderBy: { createdAt: "desc" } })
    res.json({ subscriptions: subs })
  } catch (err) { next(err) }
})

router.post("/subscriptions", requirePermission("tenant.subscriptions.create"), async (req, res, next) => {
  try {
    const data = subscriptionSchema.parse(req.body)
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: data.planId } })
    if (!plan) return res.status(404).json({ error: "Plan not found" })
    const sub = await prisma.tenantSubscription.create({ data: { ...data, price: data.price || plan.priceMonthly } })
    await prisma.tenant.update({ where: { id: data.tenantId }, data: { status: data.status === "ACTIVE" ? "ACTIVE" : "TRIAL", lifecycleStatus: "PROVISIONED" } })
    auditLog(req, "tenant.subscription.created", { id: sub.id, tenantId: data.tenantId, planId: data.planId })
    res.status(201).json({ subscription: sub })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/subscriptions/:id/status", requirePermission("tenant.subscriptions.update"), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.string().min(1).max(20) }).parse(req.body)
    const sub = await prisma.tenantSubscription.update({ where: { id: req.params.id }, data: { status } })
    auditLog(req, "tenant.subscription.status", { id: sub.id, status })
    res.json({ subscription: sub })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Usage Metering ──────────────────────────────────────────────────────────

const usageSchema = z.object({
  tenantId: z.string().uuid(),
  metric: z.string().min(1).max(50),
  quantity: z.number().min(0),
  unit: z.string().max(20).optional().default("count"),
  periodStart: z.string(),
  periodEnd: z.string(),
})

router.post("/usage", requirePermission("tenant.usage.record"), async (req, res, next) => {
  try {
    const data = usageSchema.parse(req.body)
    const meter = await prisma.usageMeter.upsert({
      where: { tenantId_metric_periodStart_periodEnd: { tenantId: data.tenantId, metric: data.metric, periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd) } },
      update: { quantity: { increment: data.quantity } },
      create: { ...data, periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd) },
    })
    auditLog(req, "tenant.usage.recorded", { tenantId: data.tenantId, metric: data.metric, quantity: data.quantity })
    res.status(201).json({ usage: meter })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/usage", requirePermission("tenant.usage.list"), async (req, res, next) => {
  try {
    const where = {}
    if (req.query.tenantId) where.tenantId = String(req.query.tenantId)
    if (req.query.metric) where.metric = String(req.query.metric)
    const usage = await prisma.usageMeter.findMany({ where, orderBy: { periodEnd: "desc" }, take: Number(req.query.limit) || 100 })
    res.json({ usage })
  } catch (err) { next(err) }
})

// ─── Environment Profiles ────────────────────────────────────────────────────

const envSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  envType: z.string().max(20).optional().default("DEV"),
  config: z.string().optional().default("{}"),
})

router.get("/environments", requirePermission("tenant.environments.list"), async (req, res, next) => {
  try {
    const envs = await prisma.environmentProfile.findMany({ where: { active: true, archivedAt: null } })
    res.json({ environments: envs })
  } catch (err) { next(err) }
})

router.post("/environments", requirePermission("tenant.environments.create"), async (req, res, next) => {
  try {
    const data = envSchema.parse(req.body)
    const existing = await prisma.environmentProfile.findUnique({ where: { code: data.code } })
    if (existing) return res.status(409).json({ error: "Environment code already exists" })
    const env = await prisma.environmentProfile.create({ data })
    auditLog(req, "tenant.environment.created", { id: env.id, code: env.code })
    res.status(201).json({ environment: env })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Tenant Summary ──────────────────────────────────────────────────────────

router.get("/summary/overview", requirePermission("tenant.summary"), async (req, res, next) => {
  try {
    const [tenants, activeTenants, subscriptions, plans, usage] = await Promise.all([
      prisma.tenant.count({ where: { archivedAt: null } }),
      prisma.tenant.count({ where: { status: "ACTIVE", archivedAt: null } }),
      prisma.tenantSubscription.count({ where: { status: { in: ["TRIAL", "ACTIVE"] } } }),
      prisma.subscriptionPlan.count({ where: { active: true } }),
      prisma.usageMeter.count(),
    ])
    res.json({ tenants, activeTenants, subscriptions, plans, usage })
  } catch (err) { next(err) }
})

export { router as tenantRouter }
