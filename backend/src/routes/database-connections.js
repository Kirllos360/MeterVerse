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

// POST /database-connections/test — test a connection via TCP socket
router.post("/test", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const data = connectionSchema.parse(req.body)
    const start = Date.now()
    const { createConnection } = await import("net")

    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection({ host: data.host, port: data.port, timeout: 5000 }, () => {
          socket.end()
          resolve(true)
        })
        socket.on("error", (err) => { socket.destroy(); reject(err) })
        socket.on("timeout", () => { socket.destroy(); reject(new Error("Connection timed out")) })
      })

      auditLog(req, "db_connection.test", { name: data.name, success: true })
      res.json({ success: true, error: null, latency: Date.now() - start, type: data.type })
    } catch (e) {
      auditLog(req, "db_connection.test", { name: data.name, success: false })
      res.json({ success: false, error: e.message, latency: Date.now() - start, type: data.type })
    }
  } catch (err) { next(err) }
})

export { router as databaseConnectionsRouter }
