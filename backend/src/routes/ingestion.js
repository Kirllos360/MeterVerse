import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { getIngestionStatus } from "../services/ingestion-runtime.js"
import { ingestReading } from "../services/symbiot-bridge.js"

const router = Router()
router.use(authenticate)

const pushSchema = z.object({
  meter: z.string().min(1).optional(),
  serial: z.string().min(1).optional(),
  meterSerial: z.string().min(1).optional(),
  meter_id: z.string().min(1).optional(),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  source: z.string().optional(),
  timestamp: z.string().optional(),
})

// Ingestion runtime status (Symbiot TCP/HTTP bridge + polling adapters)
router.get("/status", requirePermission("monitor.*"), (_req, res, next) => {
  try {
    res.json(getIngestionStatus())
  } catch (err) { next(err) }
})

// Test-push a single external meter reading through the ingest path (P60.6)
router.post("/test-push", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const data = pushSchema.parse(req.body)
    const result = await ingestReading(data)
    auditLog(req, "ingestion.test_push", { ok: result.ok, meter: data.meter ?? data.serial, error: result.error })
    if (!result.ok) return res.status(400).json(result)
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

export { router as ingestionRouter }
