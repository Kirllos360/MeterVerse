import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── Shared helpers ─────────────────────────────────────────────────────────

function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

// ─── Governance Standard ─────────────────────────────────────────────────────

const standardSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  version: z.string().max(20).optional().default("1.0"),
  category: z.string().max(50).optional().default("ARCHITECTURE"),
  description: z.string().max(2000).optional(),
  content: z.string().optional(),
  status: z.string().max(20).optional().default("DRAFT"),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional().nullable(),
  supersedesId: z.string().optional(),
})

router.get("/standards", requirePermission("governance.standards.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.category) where.category = String(req.query.category)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governanceStandard.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governanceStandard.count({ where }),
    ])
    res.json({ standards: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/standards", requirePermission("governance.standards.create"), async (req, res, next) => {
  try {
    const data = standardSchema.parse(req.body)
    const item = await prisma.governanceStandard.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.standard.created", { id: item.id, code: item.code })
    res.status(201).json({ standard: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/standards/:id/approve", requirePermission("governance.standards.approve"), async (req, res, next) => {
  try {
    const item = await prisma.governanceStandard.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedBy: req.user?.email, approvedAt: new Date() },
    })
    auditLog(req, "governance.standard.approved", { id: item.id, code: item.code })
    res.json({ standard: item })
  } catch (err) { next(err) }
})

// ─── Governance Policy ───────────────────────────────────────────────────────

const policySchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  version: z.string().max(20).optional().default("1.0"),
  category: z.string().max(50).optional().default("OPERATIONAL"),
  description: z.string().max(2000).optional(),
  rules: z.string().optional(),
  applicability: z.string().optional(),
  status: z.string().max(20).optional().default("DRAFT"),
  enforcementLevel: z.string().max(20).optional().default("MANDATORY"),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  nextReviewAt: z.string().optional(),
  supersedesId: z.string().optional(),
})

router.get("/policies", requirePermission("governance.policies.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.category) where.category = String(req.query.category)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governancePolicy.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governancePolicy.count({ where }),
    ])
    res.json({ policies: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/policies", requirePermission("governance.policies.create"), async (req, res, next) => {
  try {
    const data = policySchema.parse(req.body)
    const item = await prisma.governancePolicy.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.policy.created", { id: item.id, code: item.code })
    res.status(201).json({ policy: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/policies/:id/approve", requirePermission("governance.policies.approve"), async (req, res, next) => {
  try {
    const item = await prisma.governancePolicy.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedBy: req.user?.email, approvedAt: new Date(), reviewedAt: new Date() },
    })
    auditLog(req, "governance.policy.approved", { id: item.id, code: item.code })
    res.json({ policy: item })
  } catch (err) { next(err) }
})

// ─── Governance Decision ─────────────────────────────────────────────────────

const decisionSchema = z.object({
  reference: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).optional(),
  decisionType: z.string().max(50).optional().default("TACTICAL"),
  status: z.string().max(20).optional().default("PROPOSED"),
  options: z.string().optional(),
  rationale: z.string().max(3000).optional(),
  impactAnalysis: z.string().optional(),
  relatedDecisions: z.string().optional(),
  linkedRequirements: z.string().optional(),
})

router.get("/decisions", requirePermission("governance.decisions.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.decisionType) where.decisionType = String(req.query.decisionType)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governanceDecision.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governanceDecision.count({ where }),
    ])
    res.json({ decisions: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/decisions", requirePermission("governance.decisions.create"), async (req, res, next) => {
  try {
    const data = decisionSchema.parse(req.body)
    const item = await prisma.governanceDecision.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.decision.created", { id: item.id, reference: item.reference })
    res.status(201).json({ decision: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/decisions/:id/approve", requirePermission("governance.decisions.approve"), async (req, res, next) => {
  try {
    const item = await prisma.governanceDecision.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", decidedBy: req.user?.email, decidedAt: new Date() },
    })
    auditLog(req, "governance.decision.approved", { id: item.id, reference: item.reference })
    res.json({ decision: item })
  } catch (err) { next(err) }
})

// ─── Architecture Decision Record (ADR) ──────────────────────────────────────

const adrSchema = z.object({
  adrNumber: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  status: z.string().max(20).optional().default("PROPOSED"),
  context: z.string().optional(),
  decision: z.string().optional(),
  consequences: z.string().optional(),
  alternatives: z.string().optional(),
  relatedPrograms: z.string().optional(),
  supersededBy: z.string().optional(),
})

router.get("/adrs", requirePermission("governance.adrs.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.architectureDecisionRecord.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.architectureDecisionRecord.count({ where }),
    ])
    res.json({ adrs: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/adrs", requirePermission("governance.adrs.create"), async (req, res, next) => {
  try {
    const data = adrSchema.parse(req.body)
    const item = await prisma.architectureDecisionRecord.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.adr.created", { id: item.id, adrNumber: item.adrNumber })
    res.status(201).json({ adr: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/adrs/:id/accept", requirePermission("governance.adrs.approve"), async (req, res, next) => {
  try {
    const item = await prisma.architectureDecisionRecord.update({
      where: { id: req.params.id },
      data: { status: "ACCEPTED", approvedBy: req.user?.email, approvedAt: new Date() },
    })
    auditLog(req, "governance.adr.accepted", { id: item.id, adrNumber: item.adrNumber })
    res.json({ adr: item })
  } catch (err) { next(err) }
})

// ─── Exception ───────────────────────────────────────────────────────────────

const exceptionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  justification: z.string().max(2000).optional(),
  standardId: z.string().optional().nullable(),
  policyId: z.string().optional().nullable(),
  scope: z.string().optional(),
  duration: z.string().optional(),
  riskAssessment: z.string().optional(),
  mitigationPlan: z.string().optional(),
  expiresAt: z.string().optional(),
})

router.get("/exceptions", requirePermission("governance.exceptions.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governanceException.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governanceException.count({ where }),
    ])
    res.json({ exceptions: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/exceptions", requirePermission("governance.exceptions.create"), async (req, res, next) => {
  try {
    const data = exceptionSchema.parse(req.body)
    const item = await prisma.governanceException.create({
      data: { ...data, requestedBy: req.user?.email, createdBy: req.user?.email },
    })
    auditLog(req, "governance.exception.requested", { id: item.id, title: item.title })
    res.status(201).json({ exception: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/exceptions/:id/approve", requirePermission("governance.exceptions.approve"), async (req, res, next) => {
  try {
    const item = await prisma.governanceException.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedBy: req.user?.email, approvedAt: new Date() },
    })
    auditLog(req, "governance.exception.approved", { id: item.id })
    res.json({ exception: item })
  } catch (err) { next(err) }
})

// ─── Waiver ──────────────────────────────────────────────────────────────────

const waiverSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  policyId: z.string().optional().nullable(),
  waiverType: z.string().max(20).optional().default("TEMPORARY"),
  justification: z.string().max(2000).optional(),
  expiresAt: z.string().optional(),
})

router.get("/waivers", requirePermission("governance.waivers.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governanceWaiver.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governanceWaiver.count({ where }),
    ])
    res.json({ waivers: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/waivers", requirePermission("governance.waivers.create"), async (req, res, next) => {
  try {
    const data = waiverSchema.parse(req.body)
    const item = await prisma.governanceWaiver.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.waiver.requested", { id: item.id, title: item.title })
    res.status(201).json({ waiver: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/waivers/:id/approve", requirePermission("governance.waivers.approve"), async (req, res, next) => {
  try {
    const item = await prisma.governanceWaiver.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedBy: req.user?.email, approvedAt: new Date() },
    })
    auditLog(req, "governance.waiver.approved", { id: item.id })
    res.json({ waiver: item })
  } catch (err) { next(err) }
})

// ─── Technical Debt ──────────────────────────────────────────────────────────

const debtSchema = z.object({
  description: z.string().min(1).max(3000),
  source: z.string().max(50).optional().default("REVIEW"),
  category: z.string().max(30).optional().default("CODE"),
  severity: z.string().max(20).optional().default("MEDIUM"),
  estimatedEffort: z.number().int().optional(),
  interestRate: z.number().optional(),
  linkedProgram: z.string().optional(),
  owner: z.string().optional(),
})

router.get("/technical-debt", requirePermission("governance.technical-debt.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.category) where.category = String(req.query.category)
    if (req.query.severity) where.severity = String(req.query.severity)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.technicalDebtItem.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.technicalDebtItem.count({ where }),
    ])
    res.json({ items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/technical-debt", requirePermission("governance.technical-debt.create"), async (req, res, next) => {
  try {
    const data = debtSchema.parse(req.body)
    const item = await prisma.technicalDebtItem.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.technical-debt.created", { id: item.id, category: item.category, severity: item.severity })
    res.status(201).json({ item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/technical-debt/:id/resolve", requirePermission("governance.technical-debt.update"), async (req, res, next) => {
  try {
    const item = await prisma.technicalDebtItem.update({
      where: { id: req.params.id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    })
    auditLog(req, "governance.technical-debt.resolved", { id: item.id })
    res.json({ item })
  } catch (err) { next(err) }
})

// ─── Business Risk ───────────────────────────────────────────────────────────

const riskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(30).optional().default("OPERATIONAL"),
  likelihood: z.number().int().min(1).max(5).optional().default(3),
  impact: z.number().int().min(1).max(5).optional().default(3),
  mitigation: z.string().max(2000).optional(),
  contingency: z.string().max(2000).optional(),
  owner: z.string().optional(),
  status: z.string().max(20).optional().default("IDENTIFIED"),
  nextReviewAt: z.string().optional(),
})

router.get("/risks", requirePermission("governance.risks.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.category) where.category = String(req.query.category)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.businessRisk.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.businessRisk.count({ where }),
    ])
    res.json({ risks: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/risks", requirePermission("governance.risks.create"), async (req, res, next) => {
  try {
    const data = riskSchema.parse(req.body)
    const inherentRisk = data.likelihood * data.impact
    const item = await prisma.businessRisk.create({
      data: { ...data, inherentRisk, createdBy: req.user?.email },
    })
    auditLog(req, "governance.risk.created", { id: item.id, category: item.category, inherentRisk })
    res.status(201).json({ risk: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/risks/:id/assess", requirePermission("governance.risks.assess"), async (req, res, next) => {
  try {
    const { residualRisk, status } = z.object({
      residualRisk: z.number().int().min(0).max(25).optional(),
      status: z.string().max(20).optional(),
    }).parse(req.body)
    const data = {}
    if (residualRisk !== undefined) data.residualRisk = residualRisk
    if (status) data.status = status
    data.lastReviewAt = new Date()
    const item = await prisma.businessRisk.update({ where: { id: req.params.id }, data })
    auditLog(req, "governance.risk.assessed", { id: item.id, residualRisk: item.residualRisk })
    res.json({ risk: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Compliance Obligation ───────────────────────────────────────────────────

const obligationSchema = z.object({
  framework: z.string().max(30).optional().default("ISO27001"),
  controlId: z.string().min(1).max(100),
  controlName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.string().max(30).optional().default("NOT_ASSESSED"),
  evidence: z.string().optional(),
  remediationPlan: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
})

router.get("/compliance", requirePermission("governance.compliance.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.framework) where.framework = String(req.query.framework)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.complianceObligation.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.complianceObligation.count({ where }),
    ])
    res.json({ obligations: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/compliance", requirePermission("governance.compliance.create"), async (req, res, next) => {
  try {
    const data = obligationSchema.parse(req.body)
    const item = await prisma.complianceObligation.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.compliance.created", { id: item.id, framework: item.framework, controlId: item.controlId })
    res.status(201).json({ obligation: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Audit Finding ───────────────────────────────────────────────────────────

const findingSchema = z.object({
  auditType: z.string().max(30).optional().default("INTERNAL"),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).optional(),
  severity: z.string().max(20).optional().default("MEDIUM"),
  findingType: z.string().max(30).optional().default("CONTROL"),
  remediationPlan: z.string().max(3000).optional(),
  evidence: z.string().optional(),
  dueDate: z.string().optional(),
  owner: z.string().optional(),
})

router.get("/findings", requirePermission("governance.findings.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.severity) where.severity = String(req.query.severity)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.governanceAuditFinding.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.governanceAuditFinding.count({ where }),
    ])
    res.json({ findings: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/findings", requirePermission("governance.findings.create"), async (req, res, next) => {
  try {
    const data = findingSchema.parse(req.body)
    const item = await prisma.governanceAuditFinding.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "governance.finding.created", { id: item.id, severity: item.severity })
    res.status(201).json({ finding: item })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/findings/:id/close", requirePermission("governance.findings.update"), async (req, res, next) => {
  try {
    const item = await prisma.governanceAuditFinding.update({
      where: { id: req.params.id },
      data: { status: "CLOSED", closedAt: new Date() },
    })
    auditLog(req, "governance.finding.closed", { id: item.id })
    res.json({ finding: item })
  } catch (err) { next(err) }
})

// ─── Governance Summary ──────────────────────────────────────────────────────

router.get("/summary", requirePermission("governance.summary"), async (req, res, next) => {
  try {
    const [standards, policies, decisions, adrs, risks, findings, debt, compliance] = await Promise.all([
      prisma.governanceStandard.count({ where: { archivedAt: null } }),
      prisma.governancePolicy.count({ where: { archivedAt: null } }),
      prisma.governanceDecision.count({ where: { archivedAt: null } }),
      prisma.architectureDecisionRecord.count({ where: { archivedAt: null } }),
      prisma.businessRisk.count({ where: { archivedAt: null } }),
      prisma.governanceAuditFinding.count({ where: { archivedAt: null } }),
      prisma.technicalDebtItem.count({ where: { archivedAt: null } }),
      prisma.complianceObligation.count({ where: { archivedAt: null } }),
    ])
    const [openRisks, criticalFindings, openDebt] = await Promise.all([
      prisma.businessRisk.count({ where: { status: { in: ["IDENTIFIED", "ASSESSED", "MITIGATING"] }, archivedAt: null } }),
      prisma.governanceAuditFinding.count({ where: { severity: { in: ["HIGH", "CRITICAL"] }, status: { not: "CLOSED" }, archivedAt: null } }),
      prisma.technicalDebtItem.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] }, archivedAt: null } }),
    ])
    res.json({ standards, policies, decisions, adrs, risks, openRisks, findings, criticalFindings, debt: openDebt, compliance })
  } catch (err) { next(err) }
})

export { router as governanceRouter }
