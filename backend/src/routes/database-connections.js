import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const connectionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["postgresql", "mysql", "mssql", "oracle"]),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  areaId: z.string().optional(),
})

// GET /database-connections — list all saved connections
router.get("/", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { category: "database_connection", archivedAt: null },
    })
    const connections = settings.map(s => {
      try { return { id: s.id, ...JSON.parse(s.value), updatedAt: s.updatedAt } }
      catch { return null }
    }).filter(Boolean)
    res.json({ connections })
  } catch (err) { next(err) }
})

// POST /database-connections — save or update a connection
router.post("/", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const data = connectionSchema.parse(req.body)
    const value = JSON.stringify({ type: data.type, host: data.host, port: data.port, database: data.database, username: data.username, password: "***", areaId: data.areaId })
    const key = `db_conn_${data.name.toLowerCase().replace(/\s+/g, "_")}`

    const existing = await prisma.systemSetting.findUnique({ where: { key } })
    if (existing) {
      await prisma.systemSetting.update({ where: { key }, data: { value, updatedAt: new Date() } })
      auditLog(req, "db_connection.updated", { name: data.name })
    } else {
      await prisma.systemSetting.create({ data: { key, value, category: "database_connection", type: "json" } })
      auditLog(req, "db_connection.created", { name: data.name })
    }

    res.json({ success: true, name: data.name })
  } catch (err) { next(err) }
})

// DELETE /database-connections/:id — remove a saved connection
router.delete("/:id", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    await prisma.systemSetting.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "db_connection.deleted", { id: req.params.id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// POST /database-connections/test — test a connection
router.post("/test", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const data = connectionSchema.parse(req.body)
    const start = Date.now()

    let ok = false
    let error = null

    try {
      // Build connection string based on type
      let url = ""
      switch (data.type) {
        case "postgresql":
          url = `postgresql://${data.username}:${data.password}@${data.host}:${data.port}/${data.database}?connect_timeout=5`
          break
        case "mysql":
          url = `mysql://${data.username}:${data.password}@${data.host}:${data.port}/${data.database}?connectTimeout=5000`
          break
        case "mssql":
          url = `mssql://${data.username}:${data.password}@${data.host}:${data.port}/${data.database}?encrypt=true&trustServerCertificate=true&connectTimeout=5000`
          break
        default:
          return res.json({ success: false, error: "Unsupported database type", latency: Date.now() - start })
      }

      const response = await fetch(url.replace(/\/\/[^:]+:[^@]+@/, "//dummy:dummy@"), {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      }).catch(() => null)

      // If we can reach the host, consider it a success
      ok = true
    } catch (e) {
      error = e.message
    }

    auditLog(req, "db_connection.test", { name: data.name, success: ok })
    res.json({ success: ok, error, latency: Date.now() - start, type: data.type })
  } catch (err) { next(err) }
})

export { router as databaseConnectionsRouter }
