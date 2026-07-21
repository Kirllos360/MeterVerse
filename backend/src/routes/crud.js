import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"
import { softDelete, bulkUpdate, bulkDelete, importData, exportData, undoAction, toggleArchive, submitForApproval, approve, reject, getVersionHistory } from "../services/crud-service.js"

const router = Router()
router.use(authenticate)

// ─── GENERIC CRUD ENHANCEMENTS ────────────────────────────────────────────────

router.post("/:modelName/:id/delete", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const item = await softDelete(req.params.modelName, req.params.id, req.user.sub); res.json({ success: true, item }) }
  catch (err) { next(err) }
})

router.post("/:modelName/:id/restore", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const item = await toggleArchive(req.params.modelName, req.params.id, req.user.sub); res.json({ success: true, item }) }
  catch (err) { next(err) }
})

router.post("/:modelName/bulk-update", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { ids, data } = z.object({ ids: z.array(z.string().uuid()), data: z.record(z.any()) }).parse(req.body)
    const result = await bulkUpdate(req.params.modelName, ids, data, req.user.sub)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/:modelName/bulk-delete", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string().uuid()) }).parse(req.body)
    const result = await bulkDelete(req.params.modelName, ids, req.user.sub)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/:modelName/import", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const { records } = z.object({ records: z.array(z.record(z.any())) }).parse(req.body)
    const result = await importData(req.params.modelName, records, req.user.sub)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/:modelName/export", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const format = (req.query.format as string) || "json"
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
    const result = await exportData(req.params.modelName, filters, format)
    if (format === "csv") res.setHeader("Content-Type", "text/csv")
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/:modelName/:id/history", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const history = await getVersionHistory(req.params.modelName, req.params.id); res.json({ history }) }
  catch (err) { next(err) }
})

router.post("/undo/:auditEntryId", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const result = await undoAction(req.params.auditEntryId, req.user.sub); res.json(result) }
  catch (err) { next(err) }
})

router.post("/:modelName/:id/submit-approval", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const { notes } = req.body || {}; const item = await submitForApproval(req.params.modelName, req.params.id, req.user.sub, notes); res.json({ success: true, item }) }
  catch (err) { next(err) }
})

router.post("/:modelName/:id/approve", requireRole("admin", "super_admin"), async (req, res, next) => {
  try { const { notes } = req.body || {}; const item = await approve(req.params.modelName, req.params.id, req.user.sub, notes); res.json({ success: true, item }) }
  catch (err) { next(err) }
})

router.post("/:modelName/:id/reject", requireRole("super_admin"), async (req, res, next) => {
  try { const { notes } = req.body || {}; const item = await reject(req.params.modelName, req.params.id, req.user.sub, notes); res.json({ success: true, item }) }
  catch (err) { next(err) }
})

export { router as crudRouter }


