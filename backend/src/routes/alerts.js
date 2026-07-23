import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { z } from "zod"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("admin.list"), async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const page = Math.max(1, Number(req.query.page) || 1)
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.alert.count(),
    ])
    res.json({ alerts, total, page, limit })
  } catch (err) { next(err) }
})

router.put("/:id/resolve", requirePermission("admin.update"), async (req, res, next) => {
  try {
    const alert = await prisma.alert.update({ where: { id: req.params.id }, data: { status: "resolved", resolvedAt: new Date(), resolvedBy: req.user.email } })
    auditLog(req, "alert.resolved", { alertId: alert.id })
    res.json({ alert })
  } catch (err) { next(err) }
})

export { router as alertsRouter }
