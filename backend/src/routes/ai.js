import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"
import { aiOperator, aiBillingAssistant, aiReadingValidator, aiLeakDetection, aiForecasting, aiRootCauseAnalysis, aiReportBuilder, aiSqlAssistant, aiWorkflowGenerator } from "../services/ai-engine.js"

const router = Router()
router.use(authenticate)

router.post("/operator", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { query } = z.object({ query: z.string().min(1).max(500) }).parse(req.body)
    const result = await aiOperator(query)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/billing-assistant", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { invoiceId } = z.object({ invoiceId: z.string().uuid() }).parse(req.body)
    const result = await aiBillingAssistant(invoiceId)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/reading-validator", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { meterId } = z.object({ meterId: z.string().uuid() }).parse(req.body)
    const result = await aiReadingValidator(meterId)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/leak-detection", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { meterId } = z.object({ meterId: z.string().uuid() }).parse(req.body)
    const result = await aiLeakDetection(meterId)
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/forecasting", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const entityType = (req.query.entityType as string) || "consumption"
    const period = Math.min(90, Math.max(7, Number(req.query.period) || 30))
    const result = await aiForecasting(entityType, period)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/root-cause", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { invoiceId } = z.object({ invoiceId: z.string().uuid() }).parse(req.body)
    const result = await aiRootCauseAnalysis(invoiceId)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/report-builder", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const params = z.object({ reportType: z.string().optional(), period: z.string().optional(), metric: z.string().optional() }).parse(req.body)
    const result = await aiReportBuilder(params)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/sql-assistant", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { query } = z.object({ query: z.string().min(1).max(500) }).parse(req.body)
    const result = await aiSqlAssistant(query)
    res.json(result)
  } catch (err) { next(err) }
})

router.post("/workflow-generator", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const { description } = z.object({ description: z.string().min(1).max(500) }).parse(req.body)
    const result = await aiWorkflowGenerator(description)
    res.json(result)
  } catch (err) { next(err) }
})

export { router as aiRouter }


