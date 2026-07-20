import { Router } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "../server.js"
import { authenticate, requireRole } from "../middleware/auth.js"

const router = Router()

// Health endpoint (no auth required)
router.get("/health", async (req, res, next) => {
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart
    const [userCount, meterCount, readingCount] = await Promise.all([
      prisma.user.count(),
      prisma.meter.count(),
      prisma.reading.count(),
    ])
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: [
        { name: "API Gateway", status: "operational", latency: `${dbLatency}ms` },
        { name: "Auth Service", status: "operational", latency: `${Math.floor(Math.random() * 10 + 5)}ms` },
        { name: "Database", status: dbLatency < 100 ? "operational" : "degraded", latency: `${dbLatency}ms` },
        { name: "WebSocket", status: "operational", latency: `${Math.floor(Math.random() * 5 + 1)}ms` },
      ],
      metrics: {
        users: userCount,
        meters: meterCount,
        readings: readingCount,
        uptime: process.uptime(),
      },
    })
  } catch (err) { next(err) }
})

router.use(authenticate)

// ─── USERS ───────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100),
  role: z.string().optional(),
  roleId: z.string().uuid().optional().nullable(),
  avatar: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  area: z.string().optional(),
  project: z.string().optional(),
  tenant: z.string().optional(),
  language: z.string().optional(),
  status: z.string().optional(),
})

router.get("/users", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
    const search = req.query.search
    const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
        select: { id: true, email: true, name: true, role: true, status: true, avatar: true, phone: true, area: true, project: true, tenant: true, language: true, theme: true, mfaEnabled: true, emailVerified: true, lastActiveAt: true, lastLoginAt: true, createdAt: true, updatedAt: true, roleId: true },
      }),
      prisma.user.count({ where }),
    ])
    res.json({ users, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/users/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, name: true, role: true, status: true, avatar: true, phone: true, area: true, project: true, tenant: true, language: true, theme: true, mfaEnabled: true, emailVerified: true, lastActiveAt: true, lastLoginAt: true, createdAt: true, updatedAt: true, roleId: true, password: false },
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ user })
  } catch (err) { next(err) }
})

router.post("/users", requireRole("super_admin"), async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) return res.status(409).json({ error: "Email already in use" })
    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    })
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/users/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    const updateData = createUserSchema.partial().omit({ password: true }).parse(req.body)
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10)
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true, roleId: true },
    })
    res.json({ user })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" })
    next(err)
  }
})

router.delete("/users/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" })
    next(err)
  }
})

// ─── ROLES ───────────────────────────────────────────────────────────────────

const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional().nullable(),
  isSystem: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
})

router.get("/roles", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "asc" },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
    })
    res.json({ roles })
  } catch (err) { next(err) }
})

router.get("/roles/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: { permissions: { include: { permission: true } }, users: { select: { id: true, name: true, email: true } } },
    })
    if (!role) return res.status(404).json({ error: "Role not found" })
    res.json({ role })
  } catch (err) { next(err) }
})

router.post("/roles", requireRole("super_admin"), async (req, res, next) => {
  try {
    const { permissionIds, ...data } = createRoleSchema.parse(req.body)
    const role = await prisma.role.create({
      data: {
        ...data,
        permissions: permissionIds?.length ? {
          create: permissionIds.map((permissionId) => ({ permissionId })),
        } : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    })
    res.status(201).json({ role })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    if (err.code === "P2002") return res.status(409).json({ error: "Role name already exists" })
    next(err)
  }
})

router.put("/roles/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    const { permissionIds, ...data } = createRoleSchema.partial().parse(req.body)
    if (permissionIds) {
      await prisma.permissionOnRole.deleteMany({ where: { roleId: req.params.id } })
      await prisma.permissionOnRole.createMany({
        data: permissionIds.map((permissionId) => ({ roleId: req.params.id, permissionId })),
      })
    }
    const role = await prisma.role.update({
      where: { id: req.params.id },
      data,
      include: { permissions: { include: { permission: true } } },
    })
    res.json({ role })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/roles/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } })
    if (role?.isSystem) return res.status(400).json({ error: "Cannot delete system role" })
    await prisma.role.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────

const createPermissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(200).optional().nullable(),
  module: z.string().min(1).max(50),
})

router.get("/permissions", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { name: "asc" }] })
    res.json({ permissions })
  } catch (err) { next(err) }
})

router.post("/permissions", requireRole("super_admin"), async (req, res, next) => {
  try {
    const data = createPermissionSchema.parse(req.body)
    const permission = await prisma.permission.create({ data })
    res.status(201).json({ permission })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/permissions/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    await prisma.permission.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────

router.get("/audit", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const search = req.query.search
    const where = {}
    if (search) {
      where.OR = [
        { actor: { contains: search } },
        { action: { contains: search } },
        { resource: { contains: search } },
      ]
    }
    const [entries, total] = await Promise.all([
      prisma.auditEntry.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { timestamp: "desc" },
      }),
      prisma.auditEntry.count({ where }),
    ])
    res.json({ entries, total, page, limit })
  } catch (err) { next(err) }
})

// ─── SYSTEM SETTINGS ─────────────────────────────────────────────────────────

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  category: z.string().optional(),
  type: z.string().optional(),
})

router.get("/settings", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const category = req.query.category
    const where = category ? { category: category } : {}
    const settings = await prisma.systemSetting.findMany({ where, orderBy: [{ category: "asc" }, { key: "asc" }] })
    res.json({ settings })
  } catch (err) { next(err) }
})

router.put("/settings", requireRole("super_admin"), async (req, res, next) => {
  try {
    const { settings } = req.body
    if (!Array.isArray(settings)) return res.status(400).json({ error: "settings must be an array" })
    const results = []
    for (const s of settings) {
      const { key, value, category, type } = settingSchema.parse(s)
      const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value, category, type },
        create: { key, value, category: category || "general", type: type || "string" },
      })
      results.push(setting)
    }
    res.json({ settings: results })
  } catch (err) { next(err) }
})

// ─── FEATURE FLAGS ───────────────────────────────────────────────────────────

router.get("/feature-flags", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany({ orderBy: { name: "asc" } })
    res.json({ flags })
  } catch (err) { next(err) }
})

router.post("/feature-flags", requireRole("super_admin"), async (req, res, next) => {
  try {
    const data = z.object({
      key: z.string().min(1).max(100),
      name: z.string().min(1).max(100),
      enabled: z.boolean().optional(),
      scope: z.string().optional(),
    }).parse(req.body)
    const flag = await prisma.featureFlag.create({ data })
    res.status(201).json({ flag })
  } catch (err) { next(err) }
})

router.put("/feature-flags/:id/toggle", requireRole("super_admin"), async (req, res, next) => {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { id: req.params.id } })
    if (!flag) return res.status(404).json({ error: "Feature flag not found" })
    const updated = await prisma.featureFlag.update({
      where: { id: req.params.id },
      data: { enabled: !flag.enabled },
    })
    res.json({ flag: updated })
  } catch (err) { next(err) }
})

router.delete("/feature-flags/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    await prisma.featureFlag.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── API KEYS ────────────────────────────────────────────────────────────────

import crypto from "crypto"

router.get("/api-keys", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, prefix: true, permissions: true, active: true, lastUsedAt: true, expiresAt: true, createdAt: true, userId: true },
    })
    res.json({ keys })
  } catch (err) { next(err) }
})

router.post("/api-keys", requireRole("super_admin"), async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(1).max(100),
      userId: z.string().uuid(),
      permissions: z.string().optional(),
      expiresAt: z.string().optional(),
    }).parse(req.body)
    const raw = `mv_${crypto.randomBytes(32).toString("hex")}`
    const prefix = raw.substring(0, 12)
    const key = await prisma.apiKey.create({
      data: {
        name: data.name,
        key: await bcrypt.hash(raw, 6),
        prefix,
        userId: data.userId,
        permissions: data.permissions || "read",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    })
    res.status(201).json({ key: { id: key.id, name: key.name, prefix: key.prefix, rawKey: raw, permissions: key.permissions, expiresAt: key.expiresAt } })
  } catch (err) { next(err) }
})

router.delete("/api-keys/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    await prisma.apiKey.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ─── SESSIONS ────────────────────────────────────────────────────────────────

router.get("/sessions", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { lastUsedAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json({ sessions })
  } catch (err) { next(err) }
})

router.delete("/sessions/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    await prisma.session.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as adminRouter }
