import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const VIEW_SQL = {
  daily_consumption: `
    CREATE MATERIALIZED VIEW IF NOT EXISTS daily_consumption AS
    SELECT r.areaId, r.projectId,
           DATE(r.timestamp) as day, r.unit,
           SUM(r.value) as total_value,
           COUNT(*) as reading_count,
           AVG(r.value) as avg_value,
           MIN(r.value) as min_value,
           MAX(r.value) as max_value
    FROM "Reading" r
    WHERE r.status = 'valid' AND r.archivedAt IS NULL
    GROUP BY r.areaId, r.projectId, DATE(r.timestamp), r.unit
    WITH DATA;
  `,
  monthly_invoice_summary: `
    CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_invoice_summary AS
    SELECT i.areaId, i.projectId,
           DATE_TRUNC('month', i."issuedAt") as month,
           COUNT(*) as invoice_count,
           SUM(i.amount) as total_amount,
           SUM(i."paidAmount") as total_collected,
           AVG(i.amount) as avg_amount
    FROM "Invoice" i
    WHERE i.archivedAt IS NULL
    GROUP BY i.areaId, i.projectId, DATE_TRUNC('month', i."issuedAt")
    WITH DATA;
  `,
  monthly_payment_summary: `
    CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_payment_summary AS
    SELECT p.areaId, p.projectId,
           DATE_TRUNC('month', p."paidAt") as month,
           p.method,
           COUNT(*) as payment_count,
           SUM(p.amount) as total_amount
    FROM "Payment" p
    WHERE p.status = 'completed' AND p.archivedAt IS NULL
    GROUP BY p.areaId, p.projectId, DATE_TRUNC('month', p."paidAt"), p.method
    WITH DATA;
  `,
}

router.post("/refresh", requirePermission("admin.system"), async (req, res, next) => {
  try {
    const results = {}
    for (const [name, sql] of Object.entries(VIEW_SQL)) {
      try {
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${name}`)
        results[name] = "refreshed"
      } catch {
        try {
          await prisma.$executeRawUnsafe(sql)
          results[name] = "created"
        } catch (e) {
          results[name] = `error: ${e.message}`
        }
      }
    }
    auditLog(req, "materialized_views.refreshed", { results })
    res.json({ results })
  } catch (err) { next(err) }
})

router.post("/refresh/:name", requirePermission("admin.system"), async (req, res, next) => {
  try {
    const name = req.params.name
    const sql = VIEW_SQL[name]
    if (!sql) return res.status(404).json({ error: `Unknown view: ${name}` })
    try {
      await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${name}`)
      res.json({ view: name, status: "refreshed" })
    } catch {
      await prisma.$executeRawUnsafe(sql)
      res.json({ view: name, status: "created" })
    }
  } catch (err) { next(err) }
})

router.get("/status", requirePermission("monitor.read"), async (req, res, next) => {
  try {
    const views = await prisma.$queryRawUnsafe(
      `SELECT schemaname, viewname, matviewsize::bigint as size,
              pg_size_pretty(matviewsize) as size_pretty,
              last_refresh
       FROM (SELECT n.nspname as schemaname, c.relname as viewname,
                    pg_relation_size(c.oid) as matviewsize,
                    pg_stat_get_last_vacuum_time(c.oid) as last_refresh
             FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE c.relkind = 'm') sub
       ORDER BY viewname`
    )
    res.json({ views })
  } catch (err) { next(err) }
})

export { router as materializedViewsRouter }
