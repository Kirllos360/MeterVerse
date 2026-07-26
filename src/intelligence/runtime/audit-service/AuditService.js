// Audit Service — Execution tracing for all AI operations
import logger from "../../../backend/src/services/logger.js"

class AuditService {
  constructor() {
    this.entries = []
  }

  record({ agentId, executionId, action, input, output, duration, status, confidence }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      agentId, executionId, action, input, output, duration, status, confidence,
    }
    this.entries.push(entry)
    logger.info({ auditId: entry.id, agentId, action, status, duration }, `Audit: ${action} by ${agentId}`)
    return entry
  }

  query({ agentId, action, status, limit = 50 }) {
    let results = this.entries
    if (agentId) results = results.filter(e => e.agentId === agentId)
    if (action) results = results.filter(e => e.action === action)
    if (status) results = results.filter(e => e.status === status)
    return results.slice(-limit)
  }

  getStats() {
    const total = this.entries.length
    const byAgent = {}
    this.entries.forEach(e => { byAgent[e.agentId] = (byAgent[e.agentId] || 0) + 1 })
    return { total, byAgent }
  }
}

export const auditService = new AuditService()
