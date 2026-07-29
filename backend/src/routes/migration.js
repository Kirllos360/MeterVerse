import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { migrateAll, getMigrationStatus, verifyDataConsistency, setFeatureFlag, isNewConnectionProfileEnabled } from "../services/migration-service.js"

const router = Router()
router.use(authenticate)

router.post("/run", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const result = await migrateAll()
    auditLog(req, "migration.executed", { ...result })
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/status", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const status = await getMigrationStatus()
    res.json(status)
  } catch (err) { next(err) }
})

router.get("/verify", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const result = await verifyDataConsistency()
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/flag", requirePermission("admin.settings"), async (req, res, next) => {
  try {
    const { enabled } = req.body || {}
    const result = await setFeatureFlag(enabled === true || enabled === "true")
    auditLog(req, "migration.flag_set", { enabled: result.enabled })
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/flag", async (req, res, next) => {
  try {
    const enabled = await isNewConnectionProfileEnabled()
    res.json({ enabled })
  } catch (err) { next(err) }
})

export { router as migrationRouter }
