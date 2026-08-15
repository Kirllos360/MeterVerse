import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { enterMaintenance, exitMaintenance, getMaintenanceStatus } from "../services/maintenance-mode.js"

const router = Router()
router.use(authenticate)

const enterSchema = z.object({
  reason: z.string().optional(),
  scheduledEnd: z.string().optional(),
})

// Admin-only: view current maintenance status.
router.get("/status", requirePermission("admin.*"), (_req, res) => {
  res.json(getMaintenanceStatus())
})

// Admin-only: enter maintenance (read-only mode).
router.post("/enter", requirePermission("admin.*"), (req, res, next) => {
  try {
    const body = enterSchema.parse(req.body)
    const state = enterMaintenance({ reason: body.reason, scheduledEnd: body.scheduledEnd })
    auditLog(req, "maintenance.entered", { reason: state.reason, scheduledEnd: state.scheduledEnd })
    res.json({ maintenance: state })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// Admin-only: exit maintenance.
router.post("/exit", requirePermission("admin.*"), (req, res, next) => {
  try {
    const state = exitMaintenance()
    auditLog(req, "maintenance.exited", {})
    res.json({ maintenance: state })
  } catch (err) { next(err) }
})

export { router as maintenanceRouter }
