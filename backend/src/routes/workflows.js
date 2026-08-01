import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

// ─── Workflow Definitions ────────────────────────────────────────────────────

const definitionSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  domain: z.string().max(50).optional().default("GENERAL"),
  trigger: z.string().max(30).optional().default("MANUAL"),
  status: z.string().max(20).optional().default("DRAFT"),
  tenantId: z.string().optional().nullable(),
  variables: z.string().optional().default("{}"),
})

router.get("/definitions", requirePermission("workflow.definitions.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.domain) where.domain = String(req.query.domain)
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.workflowDefinition.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { _count: { select: { versions: true } } } }),
      prisma.workflowDefinition.count({ where }),
    ])
    res.json({ definitions: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/definitions", requirePermission("workflow.definitions.create"), async (req, res, next) => {
  try {
    const data = definitionSchema.parse(req.body)
    const existing = await prisma.workflowDefinition.findUnique({ where: { code: data.code } })
    if (existing) return res.status(409).json({ error: "Workflow code already exists" })
    const def = await prisma.workflowDefinition.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "workflow.definition.created", { id: def.id, code: def.code })
    res.status(201).json({ definition: def })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Workflow Versions ───────────────────────────────────────────────────────

router.get("/definitions/:id/versions", requirePermission("workflow.definitions.list"), async (req, res, next) => {
  try {
    const versions = await prisma.workflowVersion.findMany({ where: { definitionId: req.params.id, archivedAt: null }, orderBy: { versionNumber: "desc" } })
    res.json({ versions })
  } catch (err) { next(err) }
})

router.post("/definitions/:id/versions", requirePermission("workflow.definitions.create"), async (req, res, next) => {
  try {
    const data = z.object({
      nodes: z.string().optional().default("[]"),
      edges: z.string().optional().default("[]"),
      policies: z.string().optional().default("{}"),
      effectiveFrom: z.string().optional(),
    }).parse(req.body)
    const def = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } })
    if (!def) return res.status(404).json({ error: "Workflow definition not found" })
    const latest = await prisma.workflowVersion.findFirst({ where: { definitionId: req.params.id }, orderBy: { versionNumber: "desc" } })
    const versionNumber = (latest?.versionNumber || 0) + 1
    const version = await prisma.workflowVersion.create({
      data: { definitionId: req.params.id, versionNumber, nodes: data.nodes, edges: data.edges, policies: data.policies, ...(data.effectiveFrom ? { effectiveFrom: new Date(data.effectiveFrom) } : {}), createdBy: req.user?.email },
    })
    auditLog(req, "workflow.version.created", { id: version.id, definitionId: req.params.id, versionNumber })
    res.status(201).json({ version })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/versions/:id/approve", requirePermission("workflow.definitions.approve"), async (req, res, next) => {
  try {
    const version = await prisma.workflowVersion.update({ where: { id: req.params.id }, data: { status: "ACTIVE", approvedBy: req.user?.email, approvedAt: new Date() } })
    auditLog(req, "workflow.version.approved", { id: version.id, versionNumber: version.versionNumber })
    res.json({ version })
  } catch (err) { next(err) }
})

// ─── Workflow Instances ──────────────────────────────────────────────────────

router.get("/instances", requirePermission("workflow.instances.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    if (req.query.tenantId) where.tenantId = String(req.query.tenantId)
    const [items, total] = await Promise.all([
      prisma.workflowInstance.findMany({ where, skip, take, orderBy: { startedAt: "desc" }, include: { version: { include: { definition: true } }, _count: { select: { tasks: true, approvals: true } } } }),
      prisma.workflowInstance.count({ where }),
    ])
    res.json({ instances: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/instances", requirePermission("workflow.instances.create"), async (req, res, next) => {
  try {
    const data = z.object({
      versionId: z.string().uuid(),
      tenantId: z.string().optional().nullable(),
      variables: z.string().optional().default("{}"),
      correlationId: z.string().optional(),
    }).parse(req.body)
    const version = await prisma.workflowVersion.findUnique({ where: { id: data.versionId }, include: { definition: true } })
    if (!version) return res.status(404).json({ error: "Workflow version not found" })
    if (version.status !== "ACTIVE") return res.status(400).json({ error: "Workflow version not ACTIVE" })
    const instance = await prisma.workflowInstance.create({ data: { ...data, startedBy: req.user?.email } })
    auditLog(req, "workflow.instance.started", { id: instance.id, versionId: data.versionId })
    res.status(201).json({ instance })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/instances/:id/status", requirePermission("workflow.instances.update"), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.string().min(1).max(20) }).parse(req.body)
    const data = { status }
    if (status === "COMPLETED") data.completedAt = new Date()
    const instance = await prisma.workflowInstance.update({ where: { id: req.params.id }, data })
    auditLog(req, "workflow.instance.status", { id: instance.id, status })
    res.json({ instance })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Workflow Tasks ──────────────────────────────────────────────────────────

router.get("/instances/:id/tasks", requirePermission("workflow.instances.list"), async (req, res, next) => {
  try {
    const tasks = await prisma.workflowTask.findMany({ where: { instanceId: req.params.id, archivedAt: null }, orderBy: { createdAt: "asc" } })
    res.json({ tasks })
  } catch (err) { next(err) }
})

router.post("/instances/:id/tasks", requirePermission("workflow.instances.update"), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(1).max(200),
      type: z.string().max(30).optional().default("HUMAN"),
      assigneeId: z.string().optional(),
      payload: z.string().optional().default("{}"),
      dueDate: z.string().optional(),
    }).parse(req.body)
    const task = await prisma.workflowTask.create({ data: { instanceId: req.params.id, ...data, ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}) } })
    auditLog(req, "workflow.task.created", { id: task.id, instanceId: req.params.id })
    res.status(201).json({ task })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/tasks/:id/complete", requirePermission("workflow.instances.update"), async (req, res, next) => {
  try {
    const { result } = z.object({ result: z.string().optional() }).parse(req.body)
    const task = await prisma.workflowTask.update({ where: { id: req.params.id }, data: { status: "COMPLETED", result, completedAt: new Date(), completedBy: req.user?.email } })
    auditLog(req, "workflow.task.completed", { id: task.id })
    res.json({ task })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Approval Requests ───────────────────────────────────────────────────────

router.get("/approvals", requirePermission("workflow.approvals.list"), async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query)
    const where = { archivedAt: null }
    if (req.query.status) where.status = String(req.query.status)
    const [items, total] = await Promise.all([
      prisma.approvalRequest.findMany({ where, skip, take, orderBy: { requestedAt: "desc" }, include: { decisions: true } }),
      prisma.approvalRequest.count({ where }),
    ])
    res.json({ approvals: items, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/instances/:id/approvals", requirePermission("workflow.approvals.create"), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      mode: z.string().max(30).optional().default("SEQUENTIAL"),
      approverIds: z.string().optional().default("[]"),
      amount: z.number().optional(),
      riskLevel: z.string().max(20).optional().default("LOW"),
    }).parse(req.body)
    const approval = await prisma.approvalRequest.create({ data: { instanceId: req.params.id, ...data, requestedBy: req.user?.email } })
    auditLog(req, "workflow.approval.requested", { id: approval.id, instanceId: req.params.id })
    res.status(201).json({ approval })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.post("/approvals/:id/decide", requirePermission("workflow.approvals.update"), async (req, res, next) => {
  try {
    const data = z.object({
      decision: z.enum(["APPROVE", "REJECT", "MODIFY", "DELEGATE"]),
      comment: z.string().max(2000).optional(),
    }).parse(req.body)
    const approval = await prisma.approvalRequest.findUnique({ where: { id: req.params.id } })
    if (!approval) return res.status(404).json({ error: "Approval not found" })
    const decision = await prisma.approvalDecision.create({
      data: { approvalId: req.params.id, approverId: req.user?.sub, approverName: req.user?.email, decision: data.decision, comment: data.comment },
    })
    const nextStatus = data.decision === "APPROVE" ? "APPROVED" : data.decision === "REJECT" ? "REJECTED" : "MODIFIED"
    const updated = await prisma.approvalRequest.update({ where: { id: req.params.id }, data: { status: nextStatus, decidedAt: new Date() } })
    auditLog(req, "workflow.approval.decided", { id: req.params.id, decision: data.decision })
    res.json({ approval: updated, decision })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Summary ─────────────────────────────────────────────────────────────────

router.get("/summary/overview", requirePermission("workflow.summary"), async (req, res, next) => {
  try {
    const [definitions, versions, instances, running, tasks, approvals] = await Promise.all([
      prisma.workflowDefinition.count({ where: { archivedAt: null } }),
      prisma.workflowVersion.count({ where: { archivedAt: null } }),
      prisma.workflowInstance.count({ where: { archivedAt: null } }),
      prisma.workflowInstance.count({ where: { status: "RUNNING", archivedAt: null } }),
      prisma.workflowTask.count({ where: { archivedAt: null } }),
      prisma.approvalRequest.count({ where: { archivedAt: null } }),
    ])
    res.json({ definitions, versions, instances, running, tasks, approvals })
  } catch (err) { next(err) }
})

export { router as workflowRouter }
