import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { z } from "zod"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("admin.list"), async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    const total = await prisma.alert.count()
    res.json({ alerts, total })
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
