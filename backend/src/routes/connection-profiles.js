import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { createProfile, updateProfile, deleteProfile, restoreProfile, transitionProfile, listProfiles, getProfileWithRelations, testProfileConnection } from "../services/connection-manager.js"

const router = Router()
router.use(authenticate)

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  tlsEnabled: z.boolean().optional().default(true),
  keepAlive: z.number().int().optional().default(60),
  heartbeatInterval: z.number().int().optional().default(30),
  connTimeout: z.number().int().optional().default(10),
  queryTimeout: z.number().int().optional().default(30),
  dbType: z.string().optional().default("postgresql"),
  dbHost: z.string().min(1),
  dbPort: z.number().int().min(1).max(65535),
  dbName: z.string().min(1),
  dbSchema: z.string().optional().default("public"),
  dbSsl: z.boolean().optional().default(true),
  dbUser: z.string().min(1),
  password: z.string().min(1).optional(),
  dbPassword: z.string().min(1).optional(),
  areaId: z.string().min(1),
  projectId: z.string().optional(),
  backups: z.array(z.object({ host: z.string(), port: z.number(), tlsEnabled: z.boolean().optional().default(true), priority: z.number().optional() })).optional(),
})

const updateSchema = profileSchema.partial()
const transitionSchema = z.object({ status: z.enum(["configured", "tested", "active", "suspended", "archived", "failed", "reconnecting"]), reason: z.string().max(500).optional() })

// GET /connection-profiles — list
router.get("/", requirePermission("connections.list"), async (req, res, next) => {
  try {
    const { areaId, status, active } = req.query
    const profiles = await listProfiles({ areaId, status, active: active !== undefined ? active === "true" : undefined })
    res.json({ profiles })
  } catch (err) { next(err) }
})

// GET /connection-profiles/:id — detail
router.get("/:id", requirePermission("connections.read"), async (req, res, next) => {
  try {
    const profile = await getProfileWithRelations(req.params.id)
    res.json({ profile })
  } catch (err) { next(err) }
})

// POST /connection-profiles — create
router.post("/", requirePermission("connections.create"), async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body)
    const profile = await createProfile(data)
    auditLog(req, "connection.created", { profileId: profile.id, name: profile.name, areaId: data.areaId })
    res.status(201).json({ profile })
  } catch (err) { next(err) }
})

// PUT /connection-profiles/:id — update
router.put("/:id", requirePermission("connections.update"), async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body)
    const profile = await updateProfile(req.params.id, data)
    auditLog(req, "connection.updated", { profileId: profile.id, changes: Object.keys(data) })
    res.json({ profile })
  } catch (err) { next(err) }
})

// DELETE /connection-profiles/:id — soft delete
router.delete("/:id", requirePermission("connections.delete"), async (req, res, next) => {
  try {
    const result = await deleteProfile(req.params.id)
    auditLog(req, "connection.deleted", { profileId: req.params.id })
    res.json(result)
  } catch (err) { next(err) }
})

// POST /connection-profiles/:id/restore — restore archived
router.post("/:id/restore", requirePermission("connections.update"), async (req, res, next) => {
  try {
    const profile = await restoreProfile(req.params.id)
    auditLog(req, "connection.restored", { profileId: req.params.id })
    res.json({ profile })
  } catch (err) { next(err) }
})

// POST /connection-profiles/:id/transition — lifecycle transition
router.post("/:id/transition", requirePermission("connections.update"), async (req, res, next) => {
  try {
    const { status, reason } = transitionSchema.parse(req.body)
    const profile = await transitionProfile(req.params.id, status, reason)
    auditLog(req, "connection.transitioned", { profileId: req.params.id, to: status, reason })
    res.json({ profile })
  } catch (err) { next(err) }
})

// POST /connection-profiles/:id/test — run diagnostics
router.post("/:id/test", requirePermission("connections.test"), async (req, res, next) => {
  try {
    const result = await testProfileConnection(req.params.id)
    auditLog(req, "connection.tested", { profileId: req.params.id, status: result.overallStatus })
    res.json(result)
  } catch (err) { next(err) }
})

export { router as connectionProfilesRouter }
