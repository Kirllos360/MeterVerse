// RCA Case Engine — Complete root cause analysis lifecycle
import logger from "../../../../backend/src/services/logger.js"

class RCACaseEngine {
  constructor() {
    this.cases = new Map()
    this.counter = 0
  }

  create(serial, issue) {
    this.counter++
    const caseId = `RCA-${new Date().getFullYear()}-${String(this.counter).padStart(4, "0")}`
    const rcaCase = {
      id: caseId,
      meter: serial,
      issue,
      status: "NEW",
      createdAt: new Date().toISOString(),
      evidence: null,
      fiveWhys: [],
      fiveW: {},
      rootCause: null,
      confidence: 0,
      recommendation: null,
      approvedBy: null,
      resolution: null,
      resolutionNotes: "",
      timeToFix: null,
      audit: [{ timestamp: new Date().toISOString(), action: "CASE_CREATED" }],
    }
    this.cases.set(caseId, rcaCase)
    logger.info({ caseId, serial, issue }, `RCA case created: ${caseId}`)
    return rcaCase
  }

  get(id) { return this.cases.get(id) }

  list(filters = {}) {
    let results = Array.from(this.cases.values())
    if (filters.status) results = results.filter(c => c.status === filters.status)
    if (filters.serial) results = results.filter(c => c.meter === filters.serial)
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  updateStatus(id, status) {
    const c = this.cases.get(id)
    if (!c) return null
    c.status = status
    c.audit.push({ timestamp: new Date().toISOString(), action: `STATUS_${status}` })
    return c
  }

  setEvidence(id, evidence) {
    const c = this.cases.get(id)
    if (!c) return null
    c.evidence = evidence
    c.status = "AI_ANALYSIS_READY"
    c.audit.push({ timestamp: new Date().toISOString(), action: "EVIDENCE_COLLECTED", detail: `${evidence.items?.length || 0} items` })
    return c
  }

  setAnalysis(id, { fiveWhys, fiveW, rootCause, confidence, recommendation }) {
    const c = this.cases.get(id)
    if (!c) return null
    c.fiveWhys = fiveWhys
    c.fiveW = fiveW
    c.rootCause = rootCause
    c.confidence = confidence
    c.recommendation = recommendation
    c.status = "HUMAN_REVIEW"
    c.audit.push({ timestamp: new Date().toISOString(), action: "AI_ANALYSIS_COMPLETE", detail: `Confidence: ${confidence}%` })
    return c
  }

  approve(id, user) {
    const c = this.cases.get(id)
    if (!c) return null
    c.approvedBy = user
    c.status = "APPROVED"
    c.audit.push({ timestamp: new Date().toISOString(), action: "APPROVED", detail: `By: ${user}` })
    return c
  }

  resolve(id, { action, notes }) {
    const c = this.cases.get(id)
    if (!c) return null
    c.resolution = action
    c.resolutionNotes = notes
    c.timeToFix = Math.round((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60))
    c.status = "RESOLVED"
    c.audit.push({ timestamp: new Date().toISOString(), action: "RESOLVED", detail: action })
    return c
  }

  learn(id) {
    const c = this.cases.get(id)
    if (!c) return null
    c.status = "LEARNED"
    c.audit.push({ timestamp: new Date().toISOString(), action: "LEARNED" })
    logger.info({ caseId: id, rootCause: c.rootCause, resolution: c.resolution }, `RCA case learned: ${id}`)
    return c
  }

  getStats() {
    const all = Array.from(this.cases.values())
    return {
      total: all.length,
      byStatus: {
        new: all.filter(c => c.status === "NEW").length,
        investigating: all.filter(c => c.status === "INVESTIGATING").length,
        aiAnalysisReady: all.filter(c => c.status === "AI_ANALYSIS_READY").length,
        humanReview: all.filter(c => c.status === "HUMAN_REVIEW").length,
        approved: all.filter(c => c.status === "APPROVED").length,
        resolved: all.filter(c => c.status === "RESOLVED").length,
        learned: all.filter(c => c.status === "LEARNED").length,
      },
      avgConfidence: all.length > 0 ? Math.round(all.reduce((s, c) => s + (c.confidence || 0), 0) / all.length) : 0,
      avgTimeToFix: all.filter(c => c.timeToFix).length > 0
        ? Math.round(all.filter(c => c.timeToFix).reduce((s, c) => s + c.timeToFix, 0) / all.filter(c => c.timeToFix).length)
        : null,
    }
  }
}

export const rcaCaseEngine = new RCACaseEngine()
