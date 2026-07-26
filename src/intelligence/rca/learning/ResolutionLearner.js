import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import logger from "../../../../backend/src/services/logger.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PATTERNS_FILE = path.resolve(__dirname, "../../../../data/rca-patterns.json")

class ResolutionLearner {
  constructor() {
    this.patterns = []
    this.loaded = false
  }

  async load() {
    if (this.loaded) return
    try {
      const data = await fs.readFile(PATTERNS_FILE, "utf-8")
      this.patterns = JSON.parse(data)
      logger.info({ count: this.patterns.length }, "ResolutionLearner: patterns loaded")
    } catch {
      this.patterns = []
      logger.info("ResolutionLearner: no existing patterns, starting fresh")
    }
    this.loaded = true
  }

  async save() {
    try {
      await fs.mkdir(path.dirname(PATTERNS_FILE), { recursive: true })
      await fs.writeFile(PATTERNS_FILE, JSON.stringify(this.patterns, null, 2), "utf-8")
    } catch (err) {
      logger.error({ err }, "ResolutionLearner: failed to save patterns")
    }
  }

  async learn(rcaCase) {
    await this.load()
    const pattern = {
      id: `PATTERN-${Date.now()}`,
      caseId: rcaCase.id,
      meterSerial: rcaCase.meter,
      meterType: rcaCase.evidence?.meter?.type || "unknown",
      area: rcaCase.evidence?.meter?.area || "unknown",
      issue: rcaCase.issue,
      fiveWhys: rcaCase.fiveWhys,
      rootCause: rcaCase.rootCause,
      resolution: rcaCase.resolution,
      resolutionNotes: rcaCase.resolutionNotes,
      preventiveMeasures: rcaCase.preventiveMeasures || [],
      effort: rcaCase.timeToFix ? `${rcaCase.timeToFix}h` : "unknown",
      effectiveness: "pending",
      confidence: rcaCase.confidence || 0,
      tags: this.extractTags(rcaCase),
      learnedAt: new Date().toISOString(),
      appliedCount: 0,
    }
    this.patterns.push(pattern)
    await this.save()
    logger.info({ patternId: pattern.id, caseId: rcaCase.id }, "ResolutionLearner: pattern learned")
    return pattern
  }

  async findSimilar(errorPattern, limit = 5) {
    await this.load()
    if (!errorPattern) return []
    const query = errorPattern.toLowerCase()
    const scored = this.patterns.map(p => {
      let score = 0
      if (p.issue?.toLowerCase().includes(query)) score += 10
      if (p.rootCause?.toLowerCase().includes(query)) score += 8
      if (p.fiveWhys?.some(w => w.toLowerCase().includes(query))) score += 5
      if (p.tags?.some(t => query.includes(t.toLowerCase()))) score += 3
      if (p.resolution?.toLowerCase().includes(query)) score += 2
      if (p.effectiveness === "effective") score += 5
      if (p.effectiveness === "partial") score += 2
      return { pattern: p, score }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).map(s => s.pattern)
  }

  async recordEffectiveness(patternId, rating) {
    await this.load()
    const pattern = this.patterns.find(p => p.id === patternId)
    if (!pattern) return null
    pattern.effectiveness = rating
    pattern.appliedCount = (pattern.appliedCount || 0) + 1
    await this.save()
    return pattern
  }

  async getStats() {
    await this.load()
    const total = this.patterns.length
    const byEffectiveness = {}
    const byArea = {}
    const byType = {}
    this.patterns.forEach(p => {
      byEffectiveness[p.effectiveness] = (byEffectiveness[p.effectiveness] || 0) + 1
      byArea[p.area] = (byArea[p.area] || 0) + 1
      byType[p.meterType] = (byType[p.meterType] || 0) + 1
    })
    return {
      totalPatterns: total,
      byEffectiveness,
      byArea,
      byType,
      topTags: this.getTopTags(10),
      mostCommonResolutions: this.getMostCommonResolutions(5),
    }
  }

  extractTags(rcaCase) {
    const tags = []
    if (rcaCase.issue) tags.push(rcaCase.issue.toLowerCase().split(/\s+/).slice(0, 3).join("-"))
    if (rcaCase.rootCause) tags.push("rc-" + rcaCase.rootCause.toLowerCase().split(/\s+/).slice(0, 2).join("-"))
    if (rcaCase.evidence?.meter?.type) tags.push("type-" + rcaCase.evidence.meter.type.toLowerCase())
    if (rcaCase.evidence?.meter?.area) tags.push("area-" + rcaCase.evidence.meter.area.toLowerCase())
    if (rcaCase.resolution) tags.push("fix-" + rcaCase.resolution.toLowerCase().split(/\s+/).slice(0, 2).join("-"))
    return tags
  }

  getTopTags(limit) {
    const counts = {}
    this.patterns.forEach(p => p.tags?.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, count]) => ({ tag, count }))
  }

  getMostCommonResolutions(limit) {
    const counts = {}
    this.patterns.forEach(p => {
      const key = p.resolution || "unknown"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([resolution, count]) => ({ resolution, count }))
  }
}

export const resolutionLearner = new ResolutionLearner()
