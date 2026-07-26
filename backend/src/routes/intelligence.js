import { Router } from "express"
import { z } from "zod"
import { agentRuntime } from "../../../src/intelligence/runtime/agent-engine/AgentRuntime.js"
import { toolRegistry } from "../../../src/intelligence/runtime/tool-registry/ToolRegistry.js"
import { auditService } from "../../../src/intelligence/runtime/audit-service/AuditService.js"
import "../../../src/intelligence/agents/RCAgent.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// List all registered agents
router.get("/agents", requirePermission("ai.*"), (req, res) => {
  res.json({ agents: agentRuntime.getStatus() })
})

// Execute an agent
router.post("/agents/:agentId/execute", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { input } = z.object({ input: z.record(z.any()) }).parse(req.body)
    const result = await agentRuntime.execute(req.params.agentId, input, { userId: req.user?.sub })
    res.json(result)
  } catch (err) { next(err) }
})

// List available tools
router.get("/tools", requirePermission("ai.*"), (req, res) => {
  res.json({ tools: toolRegistry.list() })
})

// Execute a tool
router.post("/tools/:name/execute", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const result = await toolRegistry.execute(req.params.name, req.body)
    res.json(result)
  } catch (err) { next(err) }
})

// Audit log
router.get("/audit", requirePermission("admin.*"), (req, res) => {
  const { agentId, action, status } = req.query
  res.json({ entries: auditService.query({ agentId, action, status }), stats: auditService.getStats() })
})

export { router as intelligenceRouter }
