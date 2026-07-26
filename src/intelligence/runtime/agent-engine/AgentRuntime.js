// Agent Runtime — Execution framework for AI agents
import logger from "../../../../backend/src/services/logger.js"

export class AgentRuntime {
  constructor(options = {}) {
    this.agents = new Map()
    this.executions = new Map()
    this.maxConcurrent = options.maxConcurrent || 5
    this.running = new Set()
  }

  registerAgent(agent) {
    if (!agent.id || !agent.execute) throw new Error("Agent must have id and execute()")
    this.agents.set(agent.id, agent)
    logger.info({ agentId: agent.id }, `Agent registered: ${agent.id}`)
  }

  async execute(agentId, input, context = {}) {
    const agent = this.agents.get(agentId)
    if (!agent) throw new Error(`Agent '${agentId}' not found`)
    if (this.running.size >= this.maxConcurrent) throw new Error("Max concurrent executions reached")

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const startTime = Date.now()

    this.running.add(executionId)
    this.executions.set(executionId, { agentId, status: "running", startTime })

    try {
      const result = await agent.execute(input, { ...context, executionId })
      const duration = Date.now() - startTime
      this.executions.set(executionId, { agentId, status: "completed", duration, result })
      logger.info({ executionId, agentId, duration }, `Agent ${agentId} completed in ${duration}ms`)
      return result
    } catch (error) {
      this.executions.set(executionId, { agentId, status: "failed", error: error.message })
      logger.error({ executionId, agentId, error }, `Agent ${agentId} failed`)
      throw error
    } finally {
      this.running.delete(executionId)
    }
  }

  getStatus() {
    return {
      agents: this.agents.size,
      running: this.running.size,
      maxConcurrent: this.maxConcurrent,
      executions: this.executions.size,
    }
  }

  getExecution(id) {
    return this.executions.get(id)
  }
}

export const agentRuntime = new AgentRuntime()

