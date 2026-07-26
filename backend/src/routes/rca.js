import { Router } from "express"
import { z } from "zod"
import { rcaCaseEngine } from "../../src/intelligence/rca/engine/RCACaseEngine.js"
import { evidenceCollector } from "../../src/intelligence/rca/evidence/EvidenceCollector.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// Create a new RCA case
router.post("/cases", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { serial, issue } = z.object({ serial: z.string(), issue: z.string() }).parse(req.body)
    const rcaCase = rcaCaseEngine.create(serial, issue)
    rcaCaseEngine.updateStatus(rcaCase.id, "INVESTIGATING")
    // Auto-collect evidence
    const evidence = await evidenceCollector.collect(serial)
    rcaCaseEngine.setEvidence(rcaCase.id, evidence)
    res.status(201).json({ case: rcaCaseEngine.get(rcaCase.id) })
  } catch (err) { next(err) }
})

// List RCA cases
router.get("/cases", requirePermission("ai.*"), (req, res) => {
  const { status } = req.query
  res.json({ cases: rcaCaseEngine.list(status ? { status } : {}), stats: rcaCaseEngine.getStats() })
})

// Get single RCA case
router.get("/cases/:id", requirePermission("ai.*"), (req, res) => {
  const c = rcaCaseEngine.get(req.params.id)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// Update case status
router.put("/cases/:id/status", requirePermission("ai.*"), (req, res, next) => {
  try {
    const { status } = z.object({ status: z.string() }).parse(req.body)
    const c = rcaCaseEngine.updateStatus(req.params.id, status)
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Set AI analysis
router.post("/cases/:id/analyze", requirePermission("ai.*"), (req, res, next) => {
  try {
    const data = z.object({ fiveWhys: z.array(z.string()), fiveW: z.object({ who: z.string(), what: z.string(), when: z.string(), where: z.string(), why: z.string() }), rootCause: z.string(), confidence: z.number(), recommendation: z.string() }).parse(req.body)
    const c = rcaCaseEngine.setAnalysis(req.params.id, data)
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Approve case
router.post("/cases/:id/approve", requirePermission("ai.*"), (req, res) => {
  const c = rcaCaseEngine.approve(req.params.id, req.user?.email || req.user?.sub)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// Resolve case
router.post("/cases/:id/resolve", requirePermission("ai.*"), (req, res, next) => {
  try {
    const { action, notes } = z.object({ action: z.string(), notes: z.string().optional() }).parse(req.body)
    const c = rcaCaseEngine.resolve(req.params.id, { action, notes })
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Learn from case
router.post("/cases/:id/learn", requirePermission("ai.*"), (req, res) => {
  const c = rcaCaseEngine.learn(req.params.id)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// RCA stats
router.get("/stats", requirePermission("ai.*"), (req, res) => {
  res.json({ stats: rcaCaseEngine.getStats() })
})

export { router as rcaRouter }
